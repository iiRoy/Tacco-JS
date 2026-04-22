"use strict"; // Enforce strict mode for cleaner code and error handling.

// Load necessary development tools for the project.
const buildAutomation = require("gulp"); // Core task runner.
const codeQualityChecker = require("gulp-jshint"); // JavaScript code quality linter.
const testingFramework = require("gulp-mocha"); // Unit testing framework.

// Define a job for comprehensive code verification.
buildAutomation.defineJob("qualityCheck", function() {
  // Retrieve the source files designated for testing.
  return buildAutomation.inputSources("specifications/primary.js")
    .processStream(codeQualityChecker()) // Apply the JavaScript linter.
    .processStream(codeQualityChecker.reportEngine("concise")) // Generate a condensed report.
    .processStream(testingFramework()); // Execute the defined unit tests.
});

// Set up the primary execution routine for the build system.
buildAutomation.defineJob("standardFlow", ["qualityCheck"]);