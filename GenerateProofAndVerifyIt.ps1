param(
    [string] $CircuitName,
    [string] $CircuitDir,
    [string] $OutputDir = "build",
    [string] $InputFile = "input.json",
    [string] $NodeModulesDir = ".\node_modules",
    [switch] $Compile,
    [switch] $Setup,
    [switch] $Solidity,
    [switch] $Proof,
    [switch] $Verify,
    [switch] $Test1,
    [switch] $Test2
)

$env:NODE_OPTIONS = "--max-old-space-size=12288"

#Example of how to call the script
#.\GenerateProofAndVerifyIt.ps1 -CircuitName "ZkpKycDigSig" -CircuitDir ".\src\circuits\" -Compile -Setup -Solidity -Proof -Verify -Test1

if($Test1 -and $Test2)
{
    Write-Error "You cannot use Test1 and Test2 flags at the same time."
    exit 1
}

$fullOuputDir = [System.IO.Path]::Combine($CircuitDir, $OutputDir)
$fullOuputDirTest1 = [System.IO.Path]::Combine($CircuitDir, "test_1")
$fullOuputDirTest2 = [System.IO.Path]::Combine($CircuitDir, "test_2")

$circomFile = -join($CircuitName,".circom")
$wasmFile = -join($CircuitName,".wasm")
$r1csFile = -join($CircuitName,".r1cs")

$witnessFileFullPath = [System.IO.Path]::Combine($fullOuputDir, "witness.wtns")
$witnessFileFullPathTest1 = [System.IO.Path]::Combine($fullOuputDirTest1, "witness.wtns")
$witnessFileFullPathTest2 = [System.IO.Path]::Combine($fullOuputDirTest2, "witness.wtns")

$jsDir = [System.IO.Path]::Combine($fullOuputDir, -join($CircuitName, "_js"))

if($Compile){
    # Remove the build directory
    if(Test-Path $fullOuputDir)
    {
        Remove-Item -Recurse -Force $fullOuputDir | Out-Null
    }
    New-Item -ItemType Directory -Path $fullOuputDir -Force | Out-Null
}

$circomFilePath = [System.IO.Path]::Combine($CircuitDir, $circomFile)

$inputFilePath = [System.IO.Path]::Combine($CircuitDir, $InputFile)
$inputFilePathTest1 = [System.IO.Path]::Combine($CircuitDir,"test_1", $InputFile)
$inputFilePathTest2 = [System.IO.Path]::Combine($CircuitDir,"test_2", $InputFile)

# Test if the circuit file exists
if (-not (Test-Path $circomFilePath))
{
    Write-Error "The circuit file $circomFile does not exist on path $circomFilePath"
    exit 1
}

function Test-LastCommadExecution {
    param (
        [string] $message
    )
    if ($LASTEXITCODE -ne 0)
    {
        Write-Error $message
        exit 1
    }
}

function Start-CompileCircuit {
    # Compile the circuit
    Write-Host "Compiling the circuit..."
    circom $circomFilePath --r1cs --wasm --sym -o $fullOuputDir -l $NodeModulesDir
    Test-LastCommadExecution "Failed to compile the circuit."
}

function Start-GenerateWitness {
    # Generate the witness
    Write-Host "Generating the witness..."
    if($Test1 -or $Test2) 
    {
        if($Test1)
        {
            node "$jsDir/generate_witness.js" "$jsDir/$wasmFile" $inputFilePathTest1 $witnessFileFullPathTest1
        }
        if($Test2)
        {
            node "$jsDir/generate_witness.js" "$jsDir/$wasmFile" $inputFilePathTest2 $witnessFileFullPathTest2
        }
    }
    else
    {
        node "$jsDir/generate_witness.js" "$jsDir/$wasmFile" $inputFilePath $witnessFileFullPath
    }
    Test-LastCommadExecution "Failed to generate the witness."
}

function Start-Phase1(){
    # Extract the ceremony size
    # Run the snarkjs info command and capture its output
    $output = snarkjs r1cs info "$fullOuputDir/$r1csFile"
    Test-LastCommadExecution "Failed to get the number of constraints."
    # Extract the line containing the number of constraints
    $constraintsLine = $output | Select-String "# of Constraints:"
    # Use a regular expression to extract the number from the line
    if ($constraintsLine -match ": (\d+)")
    {
        $constraintsNumber = [int]$matches[1]
        Write-Host "Number of constraints: $constraintsNumber"
    }
    else
    {
        Write-Error "Could not find the number of constraints."
        exit 1
    }
    # Double the number of constraints
    $doubledConstraints = $constraintsNumber * 2
    # Calculate the exponent of the smallest power of two greater than or equal to the doubled number
    $cerimonySize = [Math]::Ceiling([Math]::Log($doubledConstraints, 2))
    Write-Host "Cerimony size: $cerimonySize"

    # Perform the trusted setup (Starting the Power of Tau ceremony)
    Write-Host "Performing the trusted setup..."
    snarkjs powersoftau new bn128 $cerimonySize $fullOuputDir/powersOfTau_0000.ptau
    Test-LastCommadExecution "Failed to perform the trusted setup."

    # Generate a random string to be used as a seed for the contribution
    $seed = [System.Guid]::NewGuid().ToString("N")
    $challengeFile = "$fullOuputDir/powersOfTau_0000.ptau"
    $responseFile = "$fullOuputDir/powersOfTau_0001.ptau"
    $contributorName = "First Contributor"

    # Making the first contribution
    Write-Host "Making the first contribution..."
    snarkjs powersoftau contribute $challengeFile $responseFile --name="$contributorName" --entropy="$seed"
    Test-LastCommadExecution "Failed to make the first contribution."
}

function Start-Phase2{
    # Starting phase2
    Write-Host "Preparing Phase2..."
    snarkjs powersoftau prepare phase2 $fullOuputDir/powersOfTau_0001.ptau $fullOuputDir/final.ptau
    Test-LastCommadExecution "Failed to prepare phase2."

    # Generate the .zkey file
    Write-Host "Generating the .zkey file..."
    snarkjs groth16 setup "$fullOuputDir/$r1csFile" $fullOuputDir/final.ptau $fullOuputDir/circuit_0000.zkey
    Test-LastCommadExecution "Failed to generate the .zkey file."

    # Make the contribution to phase 2
    Write-Host "Building the verification key..."
    $seed = [System.Guid]::NewGuid().ToString("N")
    snarkjs zkey contribute $fullOuputDir/circuit_0000.zkey $fullOuputDir/circuit_final.zkey --name="ZK_DIGSIG_KYC" --entropy="$seed"
    Test-LastCommadExecution "Failed to build the verification key."

    # Export the verification key
    Write-Host "Exporting the verification key..."
    snarkjs zkey export verificationkey $fullOuputDir/circuit_final.zkey $fullOuputDir/verification_key.json
    Test-LastCommadExecution "Failed to export the verification key."
}

function Start-GenerateProof{
    # Generate the Proof:
    Write-Host "Generating the proof..."
    if($Test1 -or $Test2) 
    {   
        if($Test1)
        {
            snarkjs groth16 prove $fullOuputDir/circuit_final.zkey $witnessFileFullPathTest1 $fullOuputDirTest1/proof.json $fullOuputDirTest1/public.json
        }
        if($Test2)
        {
            snarkjs groth16 prove $fullOuputDir/circuit_final.zkey $witnessFileFullPathTest2 $fullOuputDirTest2/proof.json $fullOuputDirTest2/public.json
        }
    }
    else
    {
        snarkjs groth16 prove $fullOuputDir/circuit_final.zkey $witnessFileFullPath $fullOuputDir/proof.json $fullOuputDir/public.json
    }
    Test-LastCommadExecution "Failed to generate the proof."
}

function Start-VerifyProof {
    # Verify the proof
    Write-Host "Verifying the proof..."
    if($Test1 -or $Test2) 
    {   
        if($Test1)
        {
            snarkjs groth16 verify $fullOuputDir/verification_key.json $fullOuputDirTest1/public.json $fullOuputDirTest1/proof.json
        }
        if($Test2)
        {
            snarkjs groth16 verify $fullOuputDir/verification_key.json $fullOuputDirTest2/public.json $fullOuputDirTest2/proof.json
        }
    }
    else
    {
        snarkjs groth16 verify $fullOuputDir/verification_key.json $fullOuputDir/public.json $fullOuputDir/proof.json
    }
    Test-LastCommadExecution "Failed to verify the proof."
}

function Start-GenerateSolidityVerifier {
    # Generate the solidity verifier
    Write-Host "Generating the solidity verifier..."
    snarkjs zkey export solidityverifier $fullOuputDir/circuit_final.zkey $fullOuputDir/verifier.sol
    Test-LastCommadExecution "Failed to generate the solidity verifier."
}


function Start-Process{
    if($Compile){
        Start-CompileCircuit
        Write-Host "OK"
    }
    if($Setup){
        Start-Phase1
        Start-Phase2
        Write-Host "OK"
    }
    if($Solidity){
        Start-GenerateSolidityVerifier
        Write-Host "OK"
    }
    if($Proof){
        Start-GenerateWitness
        Start-GenerateProof
        Write-Host "OK"
    }
    if($Verify){
        Start-VerifyProof
        Write-Host "OK"
    }
}

Start-Process