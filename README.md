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

#### 2. Prove and Verify Tests

> npm run test:one

> npm run test:two

**Note**1: Ensure the `/src/circuits/test_1/` and `/src/circuits/test_2/` folders exist before running tests. They are needed for the `test:one` and `test:two` commands.
**Note**2: The `test:full` command: Compiles the circuit, Performs the setup, Generates the Solidity verifier, Generates the proof, Generates the witness, Verifies the proof and Creates a report.
**Note**3: The `test:one` and `test:two` commands must be run after having run the `test:full` command at least once since they only do the following: Generate the witness, Generate the proof, Verify the proof and Create a report.

#### Reports

All test runs will generate a report (in xml) format in the `reports` folder. **Please note** that every time a test is run, the report is overwritten.

---
