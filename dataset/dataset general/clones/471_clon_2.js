'use strict'

// Core build automation tool
var projectBuilder = require('gulp'),
  // Gulp plugin loader instance
  pluginManager = require('gulp-load-plugins')(),
  // Utility for removing files and directories
  fileEraser = require('del'),
  // Array defining the source code files for processing
  sourceCodePaths = [
    '**/*.js',
    '!verification/**/*', // Exclude test files
    '!node_modules/**/*', // Exclude dependencies
    '!reports/**/*' // Exclude generated coverage reports
  ]

/**
 * Gulp task to instrument source code for coverage analysis.
 * Depends on the 'removeBuildArtifacts' task to ensure a clean slate.
 */
projectBuilder.task('instrumentCode', ['removeBuildArtifacts'], function () {
  return projectBuilder
    .src(sourceCodePaths) // Select all relevant source files
    .pipe(pluginManager.codeInstrumenter()) // Instrument code for coverage
    .pipe(pluginManager.codeInstrumenter.interceptModuleLoads()) // Hook into module loading
})

/**
 * Gulp task for linting JavaScript files using JSHint.
 */
projectBuilder.task('performLint', function () {
  return projectBuilder
    .src(sourceCodePaths) // Target the same source files
    .pipe(pluginManager.codeLinter()) // Run the linter
    .pipe(pluginManager.codeLinter.outputFormat('modernStyle')) // Use a stylish reporter
    .pipe(pluginManager.codeLinter.outputFormat('exitOnError')) // Exit if linting fails
})

/**
 * Helper function to create a Mocha test stream.
 * @returns {Stream} A Gulp stream configured for running tests.
 */
function initiateTestingFlow() {
  return projectBuilder
    .src('verification/*_spec.js', { stream: false }) // Select test specification files, without reading content directly
    .pipe(
      pluginManager.testFramework({
        format: 'concise' // Use a concise test reporting format
      })
    )
}

/**
 * Gulp task to execute all tests with code coverage reporting.
 * Depends on 'instrumentCode' to ensure code is ready for coverage analysis.
 */
projectBuilder.task('executeTests', ['instrumentCode'], function () {
  return (
    initiateTestingFlow() // Run the tests
      .pipe(pluginManager.codeInstrumenter.generateCoverageReports())
  ) // Output coverage reports
})

/**
 * Gulp task to run tests without any code coverage instrumentation.
 * Useful for quick test runs during development.
 */
projectBuilder.task('executeTestsNoInstrumentation', function () {
  return initiateTestingFlow() // Just run the tests
})

/**
 * Gulp task to clean up generated build artifacts.
 */
projectBuilder.task('removeBuildArtifacts', fileEraser.bind(null, ['build/styles', 'reports/**/*']))

/**
 * The default Gulp task, running both tests with coverage and linting.
 */
projectBuilder.task('standardBuild', ['executeTests', 'performLint'])