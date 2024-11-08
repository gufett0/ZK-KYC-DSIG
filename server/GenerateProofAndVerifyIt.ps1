param(
    [string] $CircuitName,
    [string] $CircuitDir,
    [string] $OutputDir = "build",
    [string] $InputFile = "input.json",
    [string] $NodeModulesDir = ".\node_modules",
    [switch] $Solidity
)
$fullOuputDir = [System.IO.Path]::Combine($CircuitDir, $OutputDir)
$circomFile = -join($CircuitName,".circom")
$wasmFile = -join($CircuitName,".wasm")
$r1csFile = -join($CircuitName,".r1cs")

$witnessFileFullPath = [System.IO.Path]::Combine($fullOuputDir, "witness.wtns")

$jsDir = [System.IO.Path]::Combine($fullOuputDir, -join($CircuitName, "_js"))
# Remove the build directory
if(Test-Path $fullOuputDir)
{
    Remove-Item -Recurse -Force $fullOuputDir | Out-Null
}
New-Item -ItemType Directory -Path $fullOuputDir -Force | Out-Null

$circomFilePath = [System.IO.Path]::Combine($CircuitDir, $circomFile)
$inputFilePath = [System.IO.Path]::Combine($CircuitDir, $InputFile)

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
    circom $circomFilePath --r1cs --wasm --sym -o $fullOuputDir -l $NodeModulesDir
    Test-LastCommadExecution "Failed to compile the circuit."
}

function Start-GenerateWitness {
    # Generate the witness
    
    node "$jsDir/generate_witness.js" "$jsDir/$wasmFile" $inputFilePath $witnessFileFullPath
    Test-LastCommadExecution "Failed to generate the witness."
}

function Start-TrustedSetup(){
    # Run the snarkjs command and capture its output
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

    # Perform the trusted setup
    Write-Host "Performing the trusted setup..."
    snarkjs powersoftau new bn128 $cerimonySize $fullOuputDir/powersOfTau_0000.ptau
    Test-LastCommadExecution "Failed to perform the trusted setup."

    # Generate a random string and use it as a seed for the contribution
    $seed = [System.Guid]::NewGuid().ToString("N")
    $challengeFile = "$fullOuputDir/powersOfTau_0000.ptau"
    $responseFile = "$fullOuputDir/powersOfTau_0001.ptau"
    $contributorName = "First Contributor"

    Write-Host "Generating the first contribution..."
    snarkjs powersoftau contribute $challengeFile $responseFile --name="$contributorName" --entropy="$seed"
    Test-LastCommadExecution "Failed to generate the first contribution."
    
    Write-Host "Preparing Phase2..."
    snarkjs powersoftau prepare phase2 $fullOuputDir/powersOfTau_0001.ptau $fullOuputDir/final.ptau
    Test-LastCommadExecution "Failed to prepare phase2."
}

function Start-GenerateSnarkProof {
    # Generate the snark proof
    Write-Host "Generating the snark proof..."
    snarkjs groth16 setup "$fullOuputDir/$r1csFile" $fullOuputDir/final.ptau $fullOuputDir/circuit_0000.zkey
    Test-LastCommadExecution "Failed to generate the snark proof."
}

function Start-ZKeyContribute {
    # Build the verification key
    Write-Host "Building the verification key..."
    $seed = [System.Guid]::NewGuid().ToString("N")
    snarkjs zkey contribute $fullOuputDir/circuit_0000.zkey $fullOuputDir/circuit_final.zkey --name="ZK_DIGSIG_KYC" --entropy="$seed"
    Test-LastCommadExecution "Failed to build the verification key."
}

function Start-ZKeyExport {
    # Export the verifier
    Write-Host "Exporting the verifier..."
    snarkjs zkey export verificationkey $fullOuputDir/circuit_final.zkey $fullOuputDir/verification_key.json
    Test-LastCommadExecution "Failed to export the verifier."
}

function Start-GenerateProof{
    # Generate the Proof:
    Write-Host "Generating the proof..."
    snarkjs groth16 prove $fullOuputDir/circuit_final.zkey $witnessFileFullPath $fullOuputDir/proof.json $fullOuputDir/public.json
    Test-LastCommadExecution "Failed to generate the proof."
}

function Start-VerifyProof {
    # Verify the proof
    Write-Host "Verifying the proof..."
    snarkjs groth16 verify $fullOuputDir/verification_key.json $fullOuputDir/public.json $fullOuputDir/proof.json
    Test-LastCommadExecution "Failed to verify the proof."   
}

function Start-GenerateSolidyVerifier {
    # Generate the solidity verifier
    Write-Host "Generating the solidity verifier..."
    snarkjs zkey export solidityverifier $fullOuputDir/circuit_final.zkey $fullOuputDir/verifier.sol
    Test-LastCommadExecution "Failed to generate the solidity verifier."
}


# Compile the circuit
function Start-Compilation{
    # 1. Compile the circuit
    Start-CompileCircuit
    # 2. Generate the witness
    Start-GenerateWitness
    # 3. Perform the trusted setup
    Start-TrustedSetup
    # 4. Generate .zkey files
    Start-GenerateSnarkProof
    Start-ZKeyContribute
    Start-ZKeyExport
    # 5. Generate the snark proof
    Start-GenerateProof
    # 6. Build the verification key
    Start-VerifyProof

    if($Solidity){
        # (OPT) Generate the solidity verifier
        Start-GenerateSolidyVerifier
    }
}
Start-Compilation