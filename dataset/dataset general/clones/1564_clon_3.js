// Configuration variable to indicate test readiness status
const isTestFrameworkReady = { status: false };

// Global connection handle for the remote test orchestrator
let remoteHostLink = null;

// Flag to track the overall completion of client-side test execution
window.testProcessFinished = false;

// An array to store functions that initialize test suites
const initializationRoutines = [];

/**
 * A namespace for test runner utilities.
 * Renamed from MochaWeb.
 */
const TestRunner = {};

/**
 * Registers a callback function to be executed before tests run.
 * Renamed from MochaWeb.testOnly.
 * @param {Function} initializerCallback The function to register.
 */
TestRunner.registerTestInitializer = function(initializerCallback) {
  if (typeof initializerCallback === 'function') {
    initializationRoutines.push(initializerCallback);
    // Optional: Log registration for debugging purposes
    // console.log("Registered a test initializer routine.");
  } else {
    console.warn("Attempted to register a non-function as a test initializer.");
  }
};

// Meteor collection to store test environment URLs and configurations
window.TestEnvironmentRegistry = new Meteor.Collection("testEnvConfigs");

// The main application startup block for Meteor
Meteor.startup(function() {
  // Only proceed if running on the client
  if (!Meteor.isClient) {
    return;
  }

  // Define a constant for the zero-millisecond timeout
  const IMMEDIATE_ASYNC_DELAY = 0;

  // Make a remote procedure call to get environment configuration
  Meteor.call("getEnvironmentConfig", function(issue, envConfig) {
    if (issue) {
      console.error("Failed to retrieve environment configuration:", issue);
      // Exit early if there's an error in fetching config
      return;
    }

    // Check if the current instance is designated as a test environment
    if (envConfig && envConfig.isTestEnv) {
      Session.set("isTestEnvironment", true);
      isTestFrameworkReady.status = true; // Mark framework as ready

      // Defer the test setup and execution to allow other startup tasks to complete
      Meteor.setTimeout(function() {
        if (!DDP) {
          console.error("DDP library not found. Cannot connect to master node.");
          return;
        }

        // Establish a DDP connection to the master test orchestrator
        const connectionAttempt = DDP.connect(envConfig.masterNodeAddress);
        remoteHostLink = connectionAttempt; // Assign to global variable

        // Configure Chai for better stack traces in assertions, if available
        if (typeof chai !== 'undefined' && chai.Assertion) {
          chai.Assertion.includeStack = true;
        } else {
          console.info("Chai or chai.Assertion not available for stack trace configuration.");
        }

        // Define options for the test framework setup
        const frameworkOptions = {
          reporter: TestRunner.TestReportGenerator, // Custom reporter
          ui: "bdd" // Behavior-driven development interface
        };

        // Guard against `mocha` not being defined
        if (typeof mocha === 'undefined') {
          console.error("Mocha test framework not found. Cannot set up tests.");
          return;
        }

        // Set up the Mocha test framework
        mocha.setup(frameworkOptions);

        // Execute all registered test initialization routines
        initializationRoutines.forEach(function(routine) {
          try {
            routine();
          } catch (routineErr) {
            console.error("Error during test initialization routine execution:", routineErr);
          }
        });

        // Run the tests and handle completion
        mocha.run(function() {
          window.testProcessFinished = true; // Set global flag to true
          isTestFrameworkReady.status = false; // Mark framework as no longer actively running

          // Signal to the server that client-side tests have completed
          Meteor.call("signalTestCompletion", function(completionError) {
            if (completionError) {
              console.warn("Warning: Server did not acknowledge client test completion cleanly:", completionError);
            } else {
              // console.log("Client test completion successfully signaled to server.");
            }
          });
        });
      }, IMMEDIATE_ASYNC_DELAY); // Use the constant for clarity
    } else {
      // If not a test environment, set the session flag accordingly
      Session.set("isTestEnvironment", false);
      // Subscribe to test environment links for display or other purposes
      Meteor.subscribe("testEnvConfigs");
    }
  });
});

/**
 * Template helpers for the test runner display component.
 * Renamed from Template.mochaweb.
 */
Template.testRunnerDisplay.helpers({
  /**
   * Generates the URL for the iframe displaying the test results.
   * Renamed from mochaWebIFrameURL.
   * @returns {string|null} The URL or null if no active mirror is found.
   */
  getRunnerFrameSource: function() {
    // Find an active test environment entry
    const envEntry = TestEnvironmentRegistry.findOne({ engine: "testFramework", status: "active" });

    // Validate the found entry and its required properties
    if (!envEntry || !envEntry.basePath) {
      // console.info("No active test environment entry or base path found.");
      return null; // Early exit if essential data is missing
    }

    // Construct the URL using template literals for clarity
    const fullPath = `${envEntry.basePath}${envEntry.resourcePath || ''}&timestamp=${envEntry.timestamp || Date.now()}`;
    return fullPath;
  }
});