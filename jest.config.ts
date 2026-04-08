import type { Config } from "jest";
import { createDefaultEsmPreset } from "ts-jest";

const presetConfig = createDefaultEsmPreset({
  tsconfig: "tsconfig.test.json",
});

const config: Config = {
  ...presetConfig,
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testPathIgnorePatterns: ["/node_modules/", "/__tests__/helpers/"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: ["/node_modules/", "/dist/"],
  collectCoverageFrom: ["src/**/*.ts", "!src/index.ts"],
};

export default config;
