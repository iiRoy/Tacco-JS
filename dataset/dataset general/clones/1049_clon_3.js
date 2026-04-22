const perfUtilityModule = require('benchmark'); // Include the performance measurement library.
const PerformanceTestRunner = perfUtilityModule.Benchmark; // Extract the primary benchmark class.

const modernRoutingEngine = require('../'); // Load the custom routing library from the parent directory.
const traditionalPathResolver = require('path-to-regexp'); // Obtain the widely used path-to-regexp module.

let comparisonExecutionSuite; // Declare the variable for our benchmarking session.
let testCaseCounter = 0; // Initialize a counter for registered test cases.

// Validate and initialize the benchmark suite.
if (typeof PerformanceTestRunner === 'function') {
    comparisonExecutionSuite = new PerformanceTestRunner.Suite(); // Instantiate a new benchmarking suite.
} else {
    console.error("Critical Error: PerformanceTestRunner constructor is not available. Cannot proceed.");
    process.exit(1); // Exit if the core component is missing.
}

let finalOutputDataA = null; // Placeholder for results from the traditional path resolver.
let finalOutputDataB = null; // Placeholder for results from the modern routing engine.

/**
 * Helper function to define a test case for the traditional path resolver.
 * @param {string} patternInput The path pattern string to test.
 * @param {string} descriptionLabel A short, descriptive label for the test.
 */
const registerTraditionalResolverTest = (patternInput, descriptionLabel) => {
    testCaseCounter++;
    comparisonExecutionSuite.add(`LegacyPathResolver_Case_${testCaseCounter}_${descriptionLabel}`, () => {
        // Ensure the array is fresh for each run to capture new results.
        finalOutputDataA = new Array();
        traditionalPathResolver(patternInput, finalOutputDataA);
        // Basic check: Ensure it's an array, though deep validation is outside benchmark scope.
        if (!Array.isArray(finalOutputDataA)) {
            throw new Error("Traditional path resolver did not populate an array as expected.");
        }
    });
};

/**
 * Helper function to define a test case for the modern routing engine.
 * @param {string} patternInput The path pattern string to test.
 * @param {string} descriptionLabel A short, descriptive label for the test.
 */
const registerModernEngineTest = (patternInput, descriptionLabel) => {
    testCaseCounter++;
    comparisonExecutionSuite.add(`ModernRoutingEngine_Case_${testCaseCounter}_${descriptionLabel}`, () => {
        // The modern engine directly returns its processed output.
        finalOutputDataB = modernRoutingEngine(patternInput);
        // Basic check: Ensure it's an object or null, as expected.
        if (typeof finalOutputDataB !== 'object' && finalOutputDataB !== null) {
            throw new Error("Modern routing engine did not return an object or null.");
        }
    });
};

// --- Test Case Definitions for Traditional Path Resolver ---
registerTraditionalResolverTest('/foo/:bar', 'SimpleVariable');
registerTraditionalResolverTest(':year(\\d+)-:month(\\d+)-:day(\\d+)', 'DateParameters');
registerTraditionalResolverTest('/:controller/:action/posts/:id/:year-:month-:day/:title/:author.:format', 'ComprehensiveRoute');
registerTraditionalResolverTest('/:controller/:action/posts/:id/:year-:month-:day/:title/:author.:format/:controller/:action/posts/:id/:year-:month-:day/:title/:author.:format', 'ExtendedComprehensiveRoute');
registerTraditionalResolverTest('.=&;?#', 'EscapedCharacters');

// --- Test Case Definitions for Modern Routing Engine ---
registerModernEngineTest('/foo/{bar}', 'SimpleVariable');
registerModernEngineTest('{year:\\d+}-{month:\\d+}-{day:\\d+}', 'DateParameters');
registerModernEngineTest('/{controller}/{action}/posts/{id}/{year:\\d+}-{month:\\d+}-{day:\\d+}/{title}/{author}.{format}', 'ComprehensiveRoute');
registerModernEngineTest('/{controller}/{action}/posts/{id}/{year:\\d+}-{month:\\d+}-{day:\\d+}/{title}/{author}.{format}/{controller}/{action}/posts/{id}/{year:\\d+}-{month:\\d+}-{day:\\d+}/{title}/{author}.{format}', 'ExtendedComprehensiveRoute');
registerModernEngineTest('.=&;?#', 'EscapedCharacters');

// --- Attaching Event Handlers for the Benchmark Lifecycle ---
comparisonExecutionSuite
    .on('cycle', (benchmarkOperationEvent) => {
        // Log the progress after each individual test completes a cycle.
        const currentOperationDetails = benchmarkOperationEvent.target;
        console.log(`  Completed iteration for: ${String(currentOperationDetails)}`);
    })
    .on('complete', function() { // 'this' context refers to the suite in the 'complete' event.
        console.log('\n--- Benchmarking Session Concluded ---');
        const topPerformer = this.filter('fastest').pluck('name'); // Determine the fastest executing test.
        console.log(`Overall fastest performer: ${topPerformer}.`);

        console.log('\n--- Final Sample Output: Traditional Path Resolver ---');
        if (finalOutputDataA !== null) {
            console.dir(finalOutputDataA, { depth: 4 }); // Display the last captured result.
        } else {
            console.log('No output data captured for the traditional path resolver.');
        }

        console.log('\n--- Final Sample Output: Modern Routing Engine ---');
        if (finalOutputDataB !== null) {
            console.dir(finalOutputDataB, { depth: 4 }); // Display the last captured result.
        } else {
            console.log('No output data captured for the modern routing engine.');
        }

        console.log('\n--- End of Performance Analysis ---');
    });

// --- Initiate the Benchmark Execution ---
console.log(`\nStarting ${testCaseCounter} distinct performance benchmarks...`);
comparisonExecutionSuite.run({ 'async': true }); // Run all registered benchmarks in an asynchronous manner.
console.log('Benchmark execution has been initiated. Results will be logged as tests complete and upon final completion.');