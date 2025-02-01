# Master-final-thesis ZK-KYC-DSIG

## **ZK-KYC-DSIG: An eIDAS-2 compliant identity verification solution with Zero Knowledge Proof and Digital Signature**

---

## Requirements:

- **Operating System**: Windows 10 or later (this project uses Powershell scripts .ps1)
- **Node.js and npm**: LTS version
- **OpenSSL**: You need to have OpenSSL installed

## Getting Started

Use the following commands to test the circuit:

#### 1. Full Test

> npm run test:full

#### 2. Prove and Verify Tests

> npm run test:one

> npm run test:two

**Note**: Ensure the `/src/circuits/test_1/` and `/src/circuits/test_2/` folders exist before running tests. They are needed for the `test:one` and `test:two` commands.

**Note**: The `test:full` command: Compiles the circuit, Performs the setup, Generates the Solidity verifier, Generates the proof, Generates the witness, Verifies the proof and Creates a report.

**Note**: The `test:one` and `test:two` commands must be run after having run the `test:full` command at least once since they only do the following: Generate the witness, Generate the proof, Verify the proof and Create a report.

#### Reports

All test runs will generate a report (in xml) format in the `reports` folder. **Please note** that every time a test is run, the report is overwritten.

#### 3. Testing the proof verification on chain

Run the following command in the build folder where all the zkp files have been generated.

> snarkjs generatecall

It will create the inputs for the contract call.

**Note**: The contract allow users to securely deposit ETH, verify their identity using ZK-SNARK proofs, check the verification status and withdraw ETH after a successful verification.

#### 4. Generating a CA certificate and signing a file for testing

> npm run test:create

---

## Features

- **Privacy-Preserving**: Zero-Knowledge Proof ensures only essential information is disclosed.
- **Digital Signature**: Guarantees the identiy of the user as well as authenticity and integrity of the data.
- **eIDAS-2 Compliant**: Aligned with the upcoming standard for electronic identification and trust services.
- **Automated Testing**: Simple npm scripts for usage.
