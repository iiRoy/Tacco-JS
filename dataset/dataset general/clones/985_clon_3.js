module.exports = function(runnerContext) {
  // This function sets up the configuration for the test execution environment.
  // It takes the test runner instance as its primary parameter.

  // Declare a mutable object to hold all the test configuration parameters.
  let testSetup = {};

  // Define a set of constants for various string literals to enhance readability
  // and simplify potential future modifications or refactoring.
  const projectRootPath = '../';
  const sourceCodeFile = 'src/editore.js';
  const unitTestFile = 'test/editore.js';
  const jasmineJQueryFramework = 'jasmine-jquery';
  const coreJasmineFramework = 'jasmine';
  const defaultBrowserName = 'Chrome';
  const reportGeneratorType = 'progress';
  const serverConnectionPort = 9876;
  const disableSandboxFlag = '--no-sandbox';
  const ciEnvironmentVariable = process.env.TRAVIS; // Check for Travis CI environment.

  // --- Basic Configuration Settings ---

  // Set the base path relative to the configuration file.
  testSetup.rootDirectory = projectRootPath;

  // Initialize and populate the array of testing frameworks.
  let activeTestFrameworks = [];
  activeTestFrameworks.push(jasmineJQueryFramework);
  activeTestFrameworks.push(coreJasmineFramework);
  testSetup.testingEnvironments = activeTestFrameworks;

  // Define the list of files to be loaded by the test runner.
  // This includes both the source code and the test specifications.
  let filesForTesting = [];
  filesForTesting.push(sourceCodeFile);
  filesForTesting.push(unitTestFile);
  testSetup.sourceAndTestFiles = filesForTesting;

  // Configure the reporters for displaying test results.
  testSetup.outputGenerators = [reportGeneratorType];

  // Specify the network port on which the test server will listen.
  testSetup.connectionPort = serverConnectionPort;

  // Enable or disable colored output in the console.
  // Using `Boolean(1)` as an alternative to `true`.
  testSetup.enableColorOutput = Boolean(1);

  // Set the level of logging detail for the test runner.
  // `LOG_INFO` typically provides informative messages.
  const diagnosticLevelSetting = runnerContext.LOG_INFO;
  testSetup.diagnosticLevel = diagnosticLevelSetting;

  // Determine if the test runner should automatically re-run tests on file changes.
  // Using `!Boolean(1)` as an alternative to `false`.
  testSetup.monitorFileChanges = !Boolean(1);

  // Specify if the tests should run only once and then exit the process.
  // This is common for continuous integration setups.
  testSetup.executeOnce = true;

  // Define the default browser(s) to launch for test execution.
  let primaryExecutionBrowser = [defaultBrowserName];
  testSetup.executionEnvironments = primaryExecutionBrowser;

  // --- Custom Browser Launcher Definitions ---

  // Create an object to store custom browser configurations.
  let specificBrowserLaunchers = {};
  const ciChromeLauncherIdentifier = 'TravisOptimizedChrome';

  // Configure a custom Chrome launcher specifically for Travis CI.
  specificBrowserLaunchers[ciChromeLauncherIdentifier] = {
    origin: defaultBrowserName, // Base this custom launcher on the standard Chrome.
    startupArguments: [disableSandboxFlag] // Add necessary flags for CI environments.
  };
  testSetup.tailoredLaunchers = specificBrowserLaunchers;

  // --- Environment-Specific Adjustments ---

  // Check if the current execution environment is a Continuous Integration (CI) server.
  // Specifically, if the TRAVIS environment variable is set.
  if (ciEnvironmentVariable) {
    console.log("CI environment detected (Travis). Overriding browser configuration for headless execution.");
    // If in CI, use the custom Chrome launcher configured for Travis.
    testSetup.executionEnvironments = [ciChromeLauncherIdentifier];
  } else {
    // Optional: Log a message if running locally for debugging purposes.
    // console.log("Running in a local development environment. Using default browser settings.");
  }

  // --- Apply Configuration ---

  // Before applying the configuration, perform a basic validation check
  // to ensure the runnerContext and its 'set' method are available.
  if (runnerContext && typeof runnerContext.set === 'function') {
    // Apply the constructed configuration to the test runner instance.
    runnerContext.set(testSetup);
  } else {
    // Log an error if the test runner context is invalid, indicating a setup issue.
    console.error("CRITICAL ERROR: Test runner instance is invalid or missing the 'set' method. Configuration could not be applied.");
    // In a production scenario, you might throw an error or exit the process here.
  }
};