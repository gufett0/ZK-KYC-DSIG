#!/bin/bash

# Default values
OUTPUT_DIR="build"
INPUT_FILE="input.json"
NODE_MODULES_DIR="./node_modules"
GENERATE_SOLIDITY=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --circuit-name|-n)
            CIRCUIT_NAME="$2"
            shift 2
            ;;
        --circuit-dir|-d)
            CIRCUIT_DIR="$2"
            shift 2
            ;;
        --output-dir|-o)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        --input-file|-i)
            INPUT_FILE="$2"
            shift 2
            ;;
        --solidity|-s)
            GENERATE_SOLIDITY=true
            shift
            ;;
        *)
            echo "Unknown parameter: $1"
            exit 1
            ;;
    esac
done

# Check required parameters
if [ -z "$CIRCUIT_NAME" ] || [ -z "$CIRCUIT_DIR" ]; then
    echo "Usage: $0 --circuit-name NAME --circuit-dir DIR [--output-dir DIR] [--input-file FILE] [--solidity]"
    exit 1
fi

# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=12288"

# Setup paths
FULL_OUTPUT_DIR="$CIRCUIT_DIR/$OUTPUT_DIR"
CIRCOM_FILE="$CIRCUIT_DIR/$CIRCUIT_NAME.circom"
WASM_FILE="$CIRCUIT_NAME.wasm"
R1CS_FILE="$CIRCUIT_NAME.r1cs"
INPUT_FILE_PATH="$CIRCUIT_DIR/$INPUT_FILE"
WITNESS_FILE="$FULL_OUTPUT_DIR/witness.wtns"
JS_DIR="$FULL_OUTPUT_DIR/${CIRCUIT_NAME}_js"
PTAU_FILE="$FULL_OUTPUT_DIR/powersOfTau28_hez_final_22.ptau"

# Function to check last command status
check_status() {
    if [ $? -ne 0 ]; then
        echo "Error: $1"
        exit 1
    fi
}

# Check if circuit file exists
if [ ! -f "$CIRCOM_FILE" ]; then
    echo "Error: Circuit file $CIRCOM_FILE does not exist"
    exit 1
fi

# Clean and create output directory, but preserve the ptau file if it exists
if [ -f "$PTAU_FILE" ]; then
    echo "Preserving existing powersOfTau file..."
    mv "$PTAU_FILE" /tmp/powersOfTau28_hez_final_22.ptau
fi

rm -rf "$FULL_OUTPUT_DIR"
mkdir -p "$FULL_OUTPUT_DIR"

if [ -f "/tmp/powersOfTau28_hez_final_22.ptau" ]; then
    mv "/tmp/powersOfTau28_hez_final_22.ptau" "$PTAU_FILE"
fi

# Compile circuit
echo "Compiling circuit..."
circom "$CIRCOM_FILE" --r1cs --wasm --sym -o "$FULL_OUTPUT_DIR" -l "$NODE_MODULES_DIR"
check_status "Failed to compile circuit"

# Generate witness
echo "Generating witness..."
node "$JS_DIR/generate_witness.js" "$JS_DIR/$WASM_FILE" "$INPUT_FILE_PATH" "$WITNESS_FILE"
check_status "Failed to generate witness"

# Generate snark setup
echo "Generating setup..."
time snarkjs groth16 setup "$FULL_OUTPUT_DIR/$R1CS_FILE" "$PTAU_FILE" "$FULL_OUTPUT_DIR/circuit_0000.zkey"
check_status "Failed to generate snark setup"

# Build verification key
echo "Building verification key..."
ENTROPY=$(openssl rand -hex 32)
snarkjs zkey contribute "$FULL_OUTPUT_DIR/circuit_0000.zkey" "$FULL_OUTPUT_DIR/circuit_final.zkey" --name="ZK_DIGSIG_KYC" --entropy="$ENTROPY"
check_status "Failed to build verification key"

# Export verifier
echo "Exporting verifier..."
snarkjs zkey export verificationkey "$FULL_OUTPUT_DIR/circuit_final.zkey" "$FULL_OUTPUT_DIR/verification_key.json"
check_status "Failed to export verifier"

# Generate proof
echo "Generating proof..."
time snarkjs groth16 prove "$FULL_OUTPUT_DIR/circuit_final.zkey" "$WITNESS_FILE" "$FULL_OUTPUT_DIR/proof.json" "$FULL_OUTPUT_DIR/public.json"
check_status "Failed to generate proof"

# Verify proof
echo "Verifying proof..."
time snarkjs groth16 verify "$FULL_OUTPUT_DIR/verification_key.json" "$FULL_OUTPUT_DIR/public.json" "$FULL_OUTPUT_DIR/proof.json"
check_status "Failed to verify proof"

# Generate Solidity verifier if requested
if [ "$GENERATE_SOLIDITY" = true ]; then
    echo "Generating Solidity verifier..."
    snarkjs zkey export solidityverifier "$FULL_OUTPUT_DIR/circuit_final.zkey" "$FULL_OUTPUT_DIR/verifier.sol"
    check_status "Failed to generate Solidity verifier"
fi

echo "All operations completed successfully!"