/** @type {import('ts-jest').JestConfigWithTsJest} **/
const { pathsToModuleNameMapper } = require("ts-jest");
const tsconfig = require("./tsconfig.json");

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": "ts-jest",
  },
  moduleNameMapper: pathsToModuleNameMapper(tsconfig.compilerOptions.paths, { prefix: "<rootDir>/src/typescripts/" }),
  reporters: ["default", ["jest-junit", { outputDirectory: "reports", outputName: "report.xml" }]],
  bail: true,
};
