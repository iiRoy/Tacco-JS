const fileHandler = require('fs');
const perfRunner = require('benchmark');
const virtualDomFactory = require('jsdom');

// Utility to ensure consistent logging format for performance tests.
const outputLog = (messageContent) => {
  console.log(`[PERF-MEASURE] ${messageContent}`);
};

// Define the path to the web page markup file.
const pageMarkupFilePath = fileHandler.join(__dirname, 'tests.html');
// Synchronously read the content of the HTML file.
const pageContentBuffer = fileHandler.readFileSync(pageMarkupFilePath, { encoding: 'utf8' });

// Determine the path for the JavaScript module to be loaded into the JSDOM environment.
const jsModuleLocation = fileHandler.join(__dirname, '..', 'src', 'ess.js');
const externalScriptsArray = [jsModuleLocation];

// Initialize a virtual DOM environment using JSDOM.
virtualDomFactory.env(
  pageContentBuffer,
  externalScriptsArray,
  (encounteredErrors, browserEnvWindow) => {
    // Check for any issues during the JSDOM environment setup.
    if (encounteredErrors && encounteredErrors.length > 0) {
      outputLog('JSDOM environment encountered issues during setup:');
      encounteredErrors.forEach(err => console.error(` - ${err.message}`));
      return; // Abort execution if critical errors occurred.
    }

    // Validate if the virtual browser environment was successfully created.
    if (!browserEnvWindow) {
      outputLog('Virtual browser window could not be initialized. Aborting.');
      return;
    }

    // Extract the document object and the custom selector utility from the virtual window.
    const currentDocumentInstance = browserEnvWindow.document;
    const selectorUtilityFunction = browserEnvWindow.ess;

    // Perform a quick sanity check on the extracted selector utility.
    if (typeof selectorUtilityFunction !== 'function') {
      outputLog('The custom selector utility (ess) was not found or is not a function within the JSDOM context. Aborting performance tests.');
      return;
    }

    // Proceed to set up and run the performance tests.
    initializePerformanceTesting(currentDocumentInstance, selectorUtilityFunction, perfRunner);
  }
);

/**
 * Sets up and executes a suite of performance benchmarks for CSS selectors.
 * @param {Document} activeDocument The JSDOM document instance to query against.
 * @param {Function} queryFunction The selector engine function (e.g., ess) to test.
 * @param {object} benchmarkLibrary The benchmark.js library object.
 */
function initializePerformanceTesting(activeDocument, queryFunction, benchmarkLibrary) {
  // Create a new benchmark suite with a descriptive name.
  const performanceEvaluationSuite = new benchmarkLibrary.Suite('DOM Selector Speed Evaluation');

  // Define a collection of CSS selector patterns to be tested.
  const selectorPatterns = [
    'div div',
    '#nav li',
    '#nav ul li a .hl span',
    '#nav .fail div li a span',
    'body > section:first-child > div:nth-of-type(2) a' // Added a new selector for more variety
  ];

  // Iterate over each selector pattern and add it as a test case to the suite.
  for (const currentSelectorString of selectorPatterns) {
    performanceEvaluationSuite.add(
      `Query for: "${currentSelectorString}"`, // Descriptive test name
      () => {
        // The core operation to be benchmarked.
        queryFunction(currentSelectorString);
      },
      {
        minSamples: 75, // Increase minimum samples for more robust results.
        maxTime: 10,   // Extend max time slightly for longer running tests.
        defer: false   // Run synchronously within the benchmark cycle.
      }
    );
  }

  // Attach an event listener for when each test cycle completes.
  performanceEvaluationSuite.on('cycle', (cycleResult) => {
    outputLog(`Completed a cycle: ${String(cycleResult.target)}`);
  });

  // Attach an event listener for when the entire suite finishes all tests.
  performanceEvaluationSuite.on('complete', function() {
    outputLog('All performance benchmarks have finished execution.');
    outputLog(`The fastest operation was: ${this.filter('fastest').map('name')}`);
    outputLog(`The slowest operation was: ${this.filter('slowest').map('name')}`);
  });

  // Log a message indicating the start of the tests.
  outputLog('Starting the CSS selector performance measurement suite...');

  // Run the benchmark suite asynchronously to prevent blocking.
  performanceEvaluationSuite.run({
    'async': true, // Enable asynchronous execution.
    'queued': true // Process tasks in a queue.
  });
}