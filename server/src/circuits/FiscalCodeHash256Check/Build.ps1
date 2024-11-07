$circuitName = "FiscalCodeHash256Check"
$dir = ".\"

# Remove the build directory
Remove-Item -Recurse -Force $dir\build | Out-Null
New-Item -ItemType Directory -Path $dir\build | Out-Null
Remove-Item -Recurse -Force *.ptau | Out-Null

# Remove the witness file
Remove-Item -Recurse -Force $dir\witness.wtns -ErrorAction Ignore | Out-Null
# Remove the proof file
Remove-Item -Recurse -Force $dir\proof.json -ErrorAction Ignore | Out-Null
# Remove the verification key file
Remove-Item -Recurse -Force $dir\verification_key.json -ErrorAction Ignore | Out-Null

$circomFile = $circuitName + ".circom"

# Change to the directory of the circuit
Push-Location $dir

# Compile the circuit
circom $circomFile --r1cs --wasm --sym -o build -l ..\..\..\node_modules
$jsDir = $circuitName + "_js"
node "build/$jsDir/generate_witness.js" "build/$jsDir/$circuitName.wasm" input.json build\witness.wtns


# Run the snarkjs command and capture its output
$output = snarkjs r1cs info build/$circuitName.r1cs

# Extract the line containing the number of constraints
$constraintsLine = $output | Select-String "# of Constraints:"
# Use a regular expression to extract the number from the line
if ($constraintsLine -match ": (\d+)")
{
    $constraintsNumber = [int]$matches[1]
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

# Perform the trusted setup
Write-Host "Performing the trusted setup..."
snarkjs powersoftau new bn128 $cerimonySize build/powersOfTau_0000.ptau

# Generate a random string and use it as a seed for the contribution
$seed = [System.Guid]::NewGuid().ToString("N")
$challengeFile = "build/powersOfTau_0000.ptau"
$responseFile = "build/powersOfTau_0001.ptau"
$contributorName = "First Contributor"

Write-Host "Generating the first contribution..."
snarkjs powersoftau contribute $challengeFile $responseFile --name="$contributorName" --entropy="$seed"
Write-Host "Preparing Phase2..."
snarkjs powersoftau prepare phase2 build/powersOfTau_0001.ptau build/final.ptau
# Generate the snark proof
Write-Host "Generating the snark proof..."
snarkjs groth16 setup build/$circuitName.r1cs build/final.ptau build/circuit_0000.zkey
# Build the verification key
Write-Host "Building the verification key..."
$seed = [System.Guid]::NewGuid().ToString("N")
snarkjs zkey contribute build/circuit_0000.zkey build/circuit_final.zkey --name="ZK_DIGSIG_KYC" --entropy="$seed"

# Export the verifier
Write-Host "Exporting the verifier..."
snarkjs zkey export verificationkey build/circuit_final.zkey build/verification_key.json

# Generate the Proof:
Write-Host "Generating the proof..."
snarkjs groth16 prove build/circuit_final.zkey build/witness.wtns build/proof.json build/public.json

# Verify the proof
Write-Host "Verifying the proof..."
snarkjs groth16 verify build/verification_key.json build/public.json build/proof.json

# # Export the solidity verifier
# snarkjs zkey export solidityverifier build\circuit_final.zkey build\verifier.sol

# # Export the verifier in a format that can be used in a web application
# snarkjs zkey export soliditycallverifier build\circuit_final.zkey build\verifier.js

# # Export the verifier in a format that can be used in a web application
# snarkjs zkey export soliditycalldata build\circuit_final.zkey build\verifier_data.json

