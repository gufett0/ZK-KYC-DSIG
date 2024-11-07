param(
    [string] $CircuitName,
    [string] $OutputDir = "build",
    [string] $InputFile = "input.json",
    [string] $CircuitDir = $PSScriptRoot,
    [string] $NodeModulesDir = $PSScriptRoot,
    [switch] $Solidity
)
$fullOuputDir = [Path]::Combine($CircuitDir, "\", $OutputDir)
$circomFile = $CircuitName + ".circom"
$wasmFile = $CircuitName + ".wasm"
$jsDir = [Path]::Combine($CircuitName, "_js")
# Remove the build directory
if(Test-Path $fullOuputDir)
{
    Remove-Item -Recurse -Force $fullOuputDir | Out-Null
}
New-Item -ItemType Directory -Path $dir\build | Out-Null

$circomFilePath = [Path]::Combine($CircuitDir, "\", $circomFile)
$inputFilePath = [Path]::Combine($CircuitDir, "\", $InputFile)
# Test if the circuit file exists
if (-not (Test-Path $circomFilePath))
{
    Write-Error "The circuit file $circomFile does not exist."
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
    circom $circomFilePath --r1cs --wasm --sym -o build -l $No
    Test-LastCommadExecution "Failed to compile the circuit."
    
}

function Start-GenerateWitness {
    node "$jsDir/generate_witness.js" "$jsDir/$wasmFile" $inputFilePath [Path]::Combine($fullOuputDir, "witness.wtns")
    Test-LastCommadExecution "Failed to generate the witness."
}

function Start-TrustedSetup(){
    # Run the snarkjs command and capture its output
    $output = snarkjs r1cs info $OutputDir/$circuitName.r1cs
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
    snarkjs powersoftau new bn128 $cerimonySize $OutputDir/powersOfTau_0000.ptau
    Test-LastCommadExecution "Failed to perform the trusted setup."

    # Generate a random string and use it as a seed for the contribution
    $seed = [System.Guid]::NewGuid().ToString("N")
    $challengeFile = "$OutputDir/powersOfTau_0000.ptau"
    $responseFile = "$OutputDir/powersOfTau_0001.ptau"
    $contributorName = "First Contributor"

    Write-Host "Generating the first contribution..."
    snarkjs powersoftau contribute $challengeFile $responseFile --name="$contributorName" --entropy="$seed"
    Test-LastCommadExecution "Failed to generate the first contribution."
    
    Write-Host "Preparing Phase2..."
    snarkjs powersoftau prepare phase2 $OutputDir/powersOfTau_0001.ptau $OutputDir/final.ptau
    Test-LastCommadExecution "Failed to prepare phase2."
}

function Start-GenerateSnarkProof {
    # Generate the snark proof
    Write-Host "Generating the snark proof..."
    snarkjs groth16 setup $OutputDir/$circuitName.r1cs $OutputDir/final.ptau $OutputDir/circuit_0000.zkey
    Test-LastCommadExecution "Failed to generate the snark proof."
}

function Start-ZKeyContribute {
    # Build the verification key
    Write-Host "Building the verification key..."
    $seed = [System.Guid]::NewGuid().ToString("N")
    snarkjs zkey contribute $OutputDir/circuit_0000.zkey $OutputDir/circuit_final.zkey --name="ZK_DIGSIG_KYC" --entropy="$seed"
    Test-LastCommadExecution "Failed to build the verification key."
}

function Start-ZKeyExport {
    # Export the verifier
    Write-Host "Exporting the verifier..."
    snarkjs zkey export verificationkey $OutputDir/circuit_final.zkey $OutputDir/verification_key.json
    Test-LastCommadExecution "Failed to export the verifier."
}

function Start-GenerateProof{
    # Generate the Proof:
    Write-Host "Generating the proof..."
    snarkjs groth16 prove $OutputDir/circuit_final.zkey $OutputDir/witness.wtns $OutputDir/proof.json $OutputDir/public.json
    Test-LastCommadExecution "Failed to generate the proof."
}

function Start-VerifyProof {
    # Verify the proof
    Write-Host "Verifying the proof..."
    snarkjs groth16 verify $OutputDir/verification_key.json $OutputDir/public.json $OutputDir/proof.json
    Test-LastCommadExecution "Failed to verify the proof."   
}

function Start-GenerateSolidyVerifier {
    # Generate the solidity verifier
    Write-Host "Generating the solidity verifier..."
    snarkjs zkey export solidityverifier $OutputDir/circuit_final.zkey $OutputDir/verifier.sol
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