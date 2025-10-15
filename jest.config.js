module.exports = {
  testEnvironment: "jsdom",
  setupFiles: ["<rootDir>/test/setupDom.js"],
  setupFilesAfterEnv: ["<rootDir>/test/setupTimers.js"],
  collectCoverage: true,
  coverageReporters: ["text-summary", "lcov"],
  collectCoverageFrom: [
    "js/app.js",
    "!js/qr-code-styling.js"
  ],
};
