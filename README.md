# Master-final-thesis ZK-KYC-DSIG

## **ZK-KYC-DSIG: An eIDAS-2 compliant identity verification solution with Zero Knowledge Proof and Digital Signature**

---

## Features

- **Privacy-Preserving**: Zero-Knowledge Proof ensures only essential information is disclosed.
- **Digital Signature**: Guarantees the identiy of the user as well as authenticity and integrity of the data.
- **eIDAS-2 Compliant**: Aligned with the upcoming standard for electronic identification and trust services.
- **Automated Testing**: Simple npm scripts for usage.

---

## Getting Started

Use the following commands to test the circuit:

#### 1. Full Test

> npm run test:full
> This command will put the output in the circuits/build folder:
> Compiles the circuit
> Performs the setup
> Generates the Solidity verifier
> Generates the witness
> Generates the proof
> Verifies the proof
> Creates a new report under the reports folder

> npm run test:one
> npm run test:two
> These 2 commands must be run after the test:full command and their output will be put in test_1 and test_2 fodler respectively
> Generates the witness
> Generates the proof
> Verifies the proof
> Creates a new report under the reports folder

**Note**1: Ensure the `/src/circuits/test_1/` and `/src/circuits/test_2/` folders exist before running tests.

## Reports

All test runs will generate a report (in xml) format in the `reports` folder. **Please note** that every time a test is run, the report is overwritten.

In order to test the circuit use the following commands:
--> npm run test:full === this test compile the circuit, perform the setup, generate the solidity verifier, generate the witness, generate the proof, verify the proof
--> npm run test:one === this test generate the witness, generate the proof, verify the proof with the same data as the full test
--> npm run test:two === this test generate the witness, generate the proof, verify the proof with the same data with new data

## Project Structure

.
├─ src
│---└─ circuits
│-------├─ build # Output of npm run test:full
│-------├─ templates # Templates used by the main circuit
│-------├─ test_1 # Output of npm run test:one
│-------├─ test_2 # Output of npm run test:two
│---├─ typescripts # Code
├─ reports # XML test reports (overwritten after each test)
├─ GenerateProofAndVerifyIt.ps1 # Powershell script
└─ README.md # This file
