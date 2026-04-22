// This file defines automated tasks for a JavaScript/React project, including bundling, testing, and development workflows.

const buildAutomation = require('gulp');
const moduleBundler = require('browserify');
const jsTranspiler = require('babelify');
const vinylSource = require('vinyl-source-stream');
const unitTestRunner = require('gulp-jest');

// Centralized configuration object to manage various settings and paths for tasks.
const PROJECT_CONFIG = {
  // Settings for the JavaScript/JSX bundling process.
  scriptBundling: {
    entryPointFile: './src/app.jsx',
    outputBundleName: 'main.min.js', // Renamed output file
    targetOutputDirectory: './build/assets/js', // Changed output path
    babelConfiguration: {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }], // Specific target for Babel
        '@babel/preset-react'
      ],
      plugins: [
        '@babel/plugin-transform-runtime' // Added a new Babel plugin
      ]
    },
    browserifyOptions: {
      debug: process.env.NODE_ENV !== 'production' // Debug maps only in dev
    }
  },
  // Settings for running unit tests.
  testing: {
    testFileGlobs: ['src/**/*.test.js', 'src/**/*.spec.jsx'], // Expanded and changed glob patterns
    jestRunnerOptions: {
      rootDir: 'src',
      testEnvironment: 'jsdom', // Added new Jest option
      transform: {
        '^.+\\.(js|jsx)$': 'babel-jest'
      },
      moduleNameMapper: { // Added a new Jest option
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
      },
      setupFilesAfterEnv: ['<rootDir>/setupTests.js'], // Added setup file
      moduleFileExtensions: ['js', 'jsx', 'json'],
      testPathIgnorePatterns: ['/node_modules/', '/dist/'],
      collectCoverage: false // Changed default coverage setting
    }
  },
  // Settings for file watching.
  fileMonitoring: {
    watchedSourceFiles: ['src/**/*.js', 'src/**/*.jsx', 'src/**/*.css'] // Added CSS to watch
  },
  // Paths for cleaning build artifacts.
  cleanupPaths: [
    './build',
    './coverage'
  ]
};

// Define task identifiers as constants for robust referencing.
const AUTOMATION_TASK_IDS = {
  PACKAGE_JS_ASSETS: 'package-javascript-assets',
  EXECUTE_TEST_SUITE: 'run-test-suite',
  OBSERVE_SOURCE_CHANGES: 'monitor-source-code',
  REMOVE_OLD_BUILDS: 'clean-previous-builds',
  PERFORM_LINTING: 'lint-application-code',
  DEVELOPMENT_SERVER_START: 'start-development-server', // New task
  DEFAULT_DEVELOPMENT_FLOW: 'dev-workflow',
  QUALITY_ASSURANCE_CHECKS: 'qa-checks'
};

/**
 * Custom logging utility to standardize messages across tasks.
 * @param {string} msg - The message content.
 * @param {string} level - The log level ('info', 'warning', 'error').
 */
function outputLog(msg, level = 'info') {
  const time = new Date().toLocaleTimeString('en-US', { hour12: false });
  const formattedMsg = `[${time}] ${msg}`;
  switch (level) {
    case 'error':
      console.error(`\x1b[31m${formattedMsg}\x1b[0m`); // Red for error
      break;
    case 'warning':
      console.warn(`\x1b[33m${formattedMsg}\x1b[0m`); // Yellow for warning
      break;
    default:
      console.log(`\x1b[36m${formattedMsg}\x1b[0m`); // Cyan for info
  }
}

// Task to clean up build directories.
buildAutomation.task(AUTOMATION_TASK_IDS.REMOVE_OLD_BUILDS, function(completionCallback) {
  outputLog('Initiating removal of old build artifacts...');
  const del = require('del'); // Dynamically require 'del'
  del(PROJECT_CONFIG.cleanupPaths)
    .then(paths => {
      outputLog(`Removed files and directories:\n${paths.join('\n') || 'None.'}`);
      completionCallback();
    })
    .catch(error => {
      outputLog(`Error during cleanup: ${error.message}`, 'error');
      completionCallback(error);
    });
});

// Task to perform static code analysis (linting).
buildAutomation.task(AUTOMATION_TASK_IDS.PERFORM_LINTING, function(completionCallback) {
  outputLog('Executing code quality checks (linting)...');
  // Placeholder: In a real project, this would integrate with 'gulp-eslint' or similar.
  setTimeout(() => {
    outputLog('Simulated linting completed. No issues found (for now).');
    completionCallback();
  }, 300);
});

// Task to bundle application JavaScript/JSX files using Browserify and Babel.
buildAutomation.task(AUTOMATION_TASK_IDS.PACKAGE_JS_ASSETS, () => {
  outputLog('Starting JavaScript asset bundling process...');

  const browserifyPipeline = moduleBundler(
    PROJECT_CONFIG.scriptBundling.entryPointFile,
    PROJECT_CONFIG.scriptBundling.browserifyOptions
  );

  // Apply Babel transformation with a configured instance.
  const babelTransformer = jsTranspiler.configure({
    presets: PROJECT_CONFIG.scriptBundling.babelConfiguration.presets,
    plugins: PROJECT_CONFIG.scriptBundling.babelConfiguration.plugins
  });

  return browserifyPipeline
    .transform(babelTransformer)
    .bundle()
    .on('error', function(processingError) {
      outputLog(`Critical bundling error: ${processingError.message}`, 'error');
      // Prevent Gulp from crashing and gracefully end the stream for watchers.
      this.emit('end');
    })
    .pipe(vinylSource(PROJECT_CONFIG.scriptBundling.outputBundleName))
    .pipe(buildAutomation.dest(PROJECT_CONFIG.scriptBundling.targetOutputDirectory))
    .on('end', () => {
      outputLog('JavaScript assets successfully packaged into bundle.');
    });
});

// Task to run the unit test suite with Jest.
buildAutomation.task(AUTOMATION_TASK_IDS.EXECUTE_TEST_SUITE, () => {
  outputLog('Commencing unit test execution via Jest...');
  return buildAutomation.src(PROJECT_CONFIG.testing.testFileGlobs)
    .pipe(unitTestRunner(PROJECT_CONFIG.testing.jestRunnerOptions))
    .on('end', () => {
      outputLog('Unit test suite completion acknowledged.');
    })
    .on('error', (testError) => {
      outputLog(`Unit tests failed: ${testError.message}`, 'error');
      // Exit with a non-zero code to indicate test failures in CI/CD.
      process.exit(1);
    });
});

// Task to watch for changes in source files and trigger re-bundling.
buildAutomation.task(AUTOMATION_TASK_IDS.OBSERVE_SOURCE_CHANGES, () => {
  outputLog('Monitoring project source files for modifications...');
  buildAutomation.watch(
    PROJECT_CONFIG.fileMonitoring.watchedSourceFiles,
    buildAutomation.series(AUTOMATION_TASK_IDS.PACKAGE_JS_ASSETS) // Use gulp.series for explicit task execution
  );
  outputLog('File watcher activated. Press Ctrl+C to terminate monitoring.');
});

// New task: Start a simple development server (placeholder).
buildAutomation.task(AUTOMATION_TASK_IDS.DEVELOPMENT_SERVER_START, function(done) {
  outputLog('Starting a simulated development server...');
  // In a real scenario, this would use 'gulp-connect', 'browser-sync', or similar.
  setTimeout(() => {
    outputLog('Development server is running at http://localhost:8080 (simulated).');
    done();
  }, 500);
});

// Default task for the development workflow: clean, lint, bundle, start server, then watch.
buildAutomation.task(AUTOMATION_TASK_IDS.DEFAULT_DEVELOPMENT_FLOW, buildAutomation.series(
  AUTOMATION_TASK_IDS.REMOVE_OLD_BUILDS,
  AUTOMATION_TASK_IDS.PERFORM_LINTING,
  AUTOMATION_TASK_IDS.PACKAGE_JS_ASSETS,
  AUTOMATION_TASK_IDS.DEVELOPMENT_SERVER_START,
  AUTOMATION_TASK_IDS.OBSERVE_SOURCE_CHANGES
));

// Task to run all quality assurance checks: linting and then unit tests.
buildAutomation.task(AUTOMATION_TASK_IDS.QUALITY_ASSURANCE_CHECKS, buildAutomation.series(
  AUTOMATION_TASK_IDS.PERFORM_LINTING,
  AUTOMATION_TASK_IDS.EXECUTE_TEST_SUITE
));

// Exporting the main gulp instance and task IDs for potential external use or clearer structure.
module.exports = {
  buildAutomation,
  AUTOMATION_TASK_IDS
};