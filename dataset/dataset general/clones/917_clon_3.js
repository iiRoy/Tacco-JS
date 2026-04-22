// This script is designed to thoroughly evaluate the performance characteristics
// of the BitVector data structure under various operational scenarios.
// It leverages the 'benchmark' library for precise timing and statistical analysis.

(function executePerformanceEvaluation() {

    // --- Essential Module Imports ---
    // Importing the core benchmarking framework. Using 'const' for immutability.
    const PerformanceFramework = require('benchmark');
    // Importing the BitVector class. Assuming it's now a named export from its module.
    const { BitVector } = require('./../lib/BitVector.js');

    // --- Pre-execution Validation (Guard Clauses) ---
    // Verify that all necessary modules have been loaded successfully.
    // This adds robustness and clearer error reporting.
    if (!PerformanceFramework || typeof PerformanceFramework.Suite !== 'function') {
        console.error("CRITICAL ERROR: The 'benchmark' dependency could not be loaded or is malformed.");
        process.exit(1); // Terminate process with an error code
    }
    if (!BitVector || typeof BitVector !== 'function') {
        console.error("CRITICAL ERROR: The 'BitVector' class is missing or not a valid constructor.");
        process.exit(1);
    }

    // --- Core Test Environment Setup ---
    // Instantiate the bit field manager, which is the subject of our benchmarks.
    // Renamed from 'bits' to 'bitFieldManager' for improved semantic clarity.
    const bitFieldManager = new BitVector();

    // Define a set of numerical indices to be used for 'set' operations across benchmarks.
    // Centralizing this data makes it easier to manage and modify.
    const insertionPoints = [1200, 1500, 8000];
    // Define a separate set of indices for 'test' operations, including some present and some absent.
    const lookupQueries = [1000, 1500, 9000];

    // Initialize the benchmark suite, which will orchestrate all performance tests.
    // Renamed from 'suite' to 'performanceTestHarness'.
    const performanceTestHarness = new PerformanceFramework.Suite();

    // --- Utility Function: BitField Reset Handler ---
    // This helper dynamically generates 'onStart' functions for benchmarks,
    // ensuring the bit field is in a consistent state before each test iteration.
    /**
     * Creates an 'onStart' handler function to reset the bit field manager.
     * @param {number | null} [desiredCapacity=null] - Optional: The target capacity for the bit field.
     * @param {number | null} [initialFillValue=null] - Optional: Value (0 or 1) to fill the bit field with.
     * @returns {function(): void} An anonymous function suitable for a benchmark's 'onStart' hook.
     */
    const createResetFunction = (desiredCapacity = null, initialFillValue = null) => {
        return function prepareStateForBenchmark() {
            // Conditionally call the appropriate reset method based on parameters provided.
            if (desiredCapacity !== null && initialFillValue !== null) {
                bitFieldManager.reset(desiredCapacity, initialFillValue);
            } else if (desiredCapacity !== null) {
                bitFieldManager.reset(desiredCapacity);
            } else {
                bitFieldManager.reset(); // Default reset (sparse)
            }
            // Optional: Add a debug log or internal state validation here if needed.
            // console.debug(`Bit field state reset: Capacity=${desiredCapacity}, Fill=${initialFillValue}`);
        };
    };

    // --- Benchmark Test Case Definitions (Significantly Modified) ---

    // Test Case 1: Sparse BitVector - Setting bits
    performanceTestHarness.add(
        'SparseBitVector#establishBits',
        function setSparseBitsOperation() {
            // Iterating over the predefined insertion points to set bits.
            // This replaces multiple individual method calls with a loop, enhancing readability and scalability.
            insertionPoints.forEach(indexVal => bitFieldManager.set(indexVal));
        },
        {
            // Utilize the helper function for `onStart` to ensure a clean, sparse state.
            onStart: createResetFunction(),
            // Adding a custom property for categorization.
            group: 'Dynamic Size'
        }
    );

    // Test Case 2: Sparse BitVector - Testing bits
    performanceTestHarness.add(
        'SparseBitVector#verifyBits',
        function testSparseBitsOperation() {
            let latestOutcome; // Introduce an intermediate variable for operation results.
            // Loop through the lookup queries to test bit presence.
            for (const queryIdx of lookupQueries) {
                latestOutcome = bitFieldManager.test(queryIdx);
                // In-benchmark validation: Ensure the result type is as expected.
                if (typeof latestOutcome !== 'boolean') {
                    throw new TypeError(`BitVector.test(${queryIdx}) returned non-boolean: ${latestOutcome}`);
                }
            }
            // Return a value to prevent potential dead-code elimination by aggressive optimizers.
            return latestOutcome;
        },
        {
            onStart: createResetFunction(),
            group: 'Dynamic Size'
        }
    );

    // Test Case 3: Fixed-Size (Non-Filled) BitVector - Setting bits
    performanceTestHarness.add(
        'FixedCapacityEmpty#populateBits',
        function setFixedCapacityEmptyOperation() {
            // A different loop structure (traditional for-loop) for variety.
            for (let i = 0; i < insertionPoints.length; i++) {
                bitFieldManager.set(insertionPoints[i]);
            }
        },
        {
            // Reset with a specific capacity (10,000) but no initial fill value (defaults to 0).
            onStart: createResetFunction(10000),
            group: 'Fixed Capacity'
        }
    );

    // Test Case 4: Fixed-Size (Non-Filled) BitVector - Testing bits
    performanceTestHarness.add(
        'FixedCapacityEmpty#checkPresence',
        function testFixedCapacityEmptyOperation() {
            const collectedResults = []; // Collect all boolean results into an array.
            // Using a `while` loop for another structural variation.
            let counter = 0;
            while (counter < lookupQueries.length) {
                collectedResults.push(bitFieldManager.test(lookupQueries[counter]));
                counter++;
            }
            // Post-operation validation: Check if all collected results are booleans.
            if (!collectedResults.every(res => typeof res === 'boolean')) {
                console.warn("WARNING: Not all 'test' operations returned boolean values in FixedCapacityEmpty#checkPresence.");
            }
            return collectedResults; // Return the array to avoid optimization.
        },
        {
            onStart: createResetFunction(10000),
            group: 'Fixed Capacity'
        }
    );

    // Test Case 5: Fixed-Size (Filled with Zeros) BitVector - Setting bits
    performanceTestHarness.add(
        'FixedCapacityFilledZeros#insertBits',
        function setFixedCapacityFilledZerosOperation() {
            // Setting bits in a pre-initialized field of zeros.
            // Using `for...of` for yet another iteration style.
            for (const indexToSet of insertionPoints) {
                bitFieldManager.set(indexToSet);
            }
        },
        {
            // Reset with capacity (10,000) and an explicit fill value of 0.
            onStart: createResetFunction(10000, 0),
            group: 'Pre-filled Capacity'
        }
    );

    // Test Case 6: Fixed-Size (Filled with Zeros) BitVector - Testing bits
    performanceTestHarness.add(
        'FixedCapacityFilledZeros#queryBits',
        function testFixedCapacityFilledZerosOperation() {
            let totalFound = 0; // Accumulate a count of found bits as an intermediate step.
            lookupQueries.forEach(queryIndex => {
                if (bitFieldManager.test(queryIndex)) {
                    totalFound++;
                }
            });
            // A simple logical check to ensure the count is plausible.
            if (totalFound < 0 || totalFound > lookupQueries.length) {
                console.error(`Anomalous 'found' count (${totalFound}) detected.`);
            }
            return totalFound; // Return the count.
        },
        {
            onStart: createResetFunction(10000, 0),
            group: 'Pre-filled Capacity'
        }
    );


    // --- Event Handlers for Benchmark Lifecycle ---

    // Listener for individual benchmark cycle completion.
    // Output format is enhanced for better readability.
    performanceTestHarness.on('cycle', function(benchmarkCycleEvent) {
        // Renamed 'event' to 'benchmarkCycleEvent' and 'bench' to 'currentBenchResult'.
        const currentBenchResult = benchmarkCycleEvent.target;
        console.log(`[ BENCHMARK CYCLE ] ${String(currentBenchResult)}`);
    });

    // Listener for the entire suite's completion.
    // Provides a summary of the fastest benchmark and overall execution.
    performanceTestHarness.on('complete', function(suiteCompletionEvent) {
        console.log('\n--- PERFORMANCE EVALUATION COMPLETE ---');
        // Determine and log the fastest benchmark by name.
        const fastestTestName = this.filter('fastest').map('name');
        console.log(`Overall fastest test: "${fastestTestName}"`);
        console.log(`Total tests executed in suite: ${this.length}`);
        // Optionally, log more detailed results or save them.
    });

    // Listener for any errors encountered during benchmark execution.
    // This adds crucial error handling for stability.
    performanceTestHarness.on('error', function(errorOccurredEvent) {
        console.error(`\n!!! AN ERROR OCCURRED DURING BENCHMARK EXECUTION !!!`);
        console.error(`Benchmark Name: '${errorOccurredEvent.target.name}'`);
        console.error(`Error Details: ${errorOccurredEvent.target.error}`);
        // Optionally, abort the suite or perform cleanup.
        // this.abort();
    });

    // --- Initiate Benchmark Execution ---
    // Start running all defined benchmarks.
    // The `async: true` option ensures that the event loop is not blocked during execution,
    // which is generally good practice for long-running operations.
    performanceTestHarness.run({
        async: true
    });

})(); // The entire setup is wrapped in an immediately-invoked function expression (IIFE).