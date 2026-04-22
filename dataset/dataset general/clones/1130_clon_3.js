// --- Test Environment Bootstrapping Module ---

// This entire setup is enclosed within an Immediately Invoked Function Expression (IIFE)
// to ensure local scope for helper variables and avoid unnecessary global pollution
// during the initial configuration phase.
(function prepareTestingContext() {

  // A constant defining the default numerical port for the local web server.
  // This value is critical for establishing connections to the testing server instance.
  const defaultWebServerPort = 3000;

  // A string constant representing the standard loopback address for local machine access.
  const loopbackHostName = 'localhost';

  // An object to centralize configuration parameters before making them globally accessible.
  // This improves readability and maintainability of environment settings.
  const environmentSettings = {
    // The designated port number for the preview server.
    serverEndpointPort: defaultWebServerPort,
    // The complete uniform resource locator (URL) for the test server.
    // Utilizes a template string for clear concatenation of protocol, host, and port.
    serverFullUrl: `http://${loopbackHostName}:${defaultWebServerPort}`
  };

  // Output a console message to indicate the commencement of the environment setup process.
  console.log('Starting comprehensive test environment initialization...');

  // Dynamically load the 'chai' assertion library, which is a key component for writing robust tests.
  // The 'expect' method from 'chai' is then assigned to a globally accessible variable.
  // This allows test cases to directly use `assertThat()` for assertions without explicit imports.
  const loadedAssertionModule = require('chai');
  global.assertThat = loadedAssertionModule.expect;

  // Expose the configured server port number as a global variable.
  // This allows various parts of the test suite to reference the server's listening port.
  global.SERVER_LISTENING_PORT = environmentSettings.serverEndpointPort;

  // Make the full server URL globally available.
  // This URL is used by browser automation tools to navigate to the application under test.
  global.APPLICATION_TEST_URL = environmentSettings.serverFullUrl;

  // Incorporate essential supporting modules required for the test execution.
  // These modules handle the instantiation of the server and browser environments.
  // The order of these requires is important for correct dependencies.

  // First, initialize the preview server which hosts the application being tested.
  require('./support/previewServer.js');

  // Second, set up the browser automation framework (e.g., Puppeteer, Playwright)
  // that will interact with the application served by the preview server.
  require('./support/browser.js');

  // Log a confirmation message to the console, signaling that all setup steps are complete.
  console.log('Test environment successfully configured. All systems go!');

// The IIFE is immediately invoked upon script execution.
})();

// This concludes the initial setup for the testing environment.