var fileSystemOps = require('fs');
var utilityBelt = require('underscore')._;
var LexiconAnalyzer = require('../src/wordpos');

var analyzerInstance = new LexiconAnalyzer();

/**
 * Custom benchmarking framework mimicking uubench functionality.
 * This class manages the execution of sections and individual benchmarks,
 * handles iterations, timing, and callback invocations.
 */
function PerformanceExaminer(configuration) {
    this.testType = configuration.type;
    this.testIterations = configuration.iterations;
    this.synchronousMode = configuration.sync;
    this.onStart = configuration.start;
    this.onResult = configuration.result;
    this.onComplete = configuration.done;
    this.onSectionStart = configuration.section;

    this.registeredTasks = [];
    this.currentTaskIndex = 0;
    this.overallStartTime = 0;

    // These variables mirror the global state in the original script and are managed by this instance.
    this.currentPassage = null;
    this.totalWordsProcessed = undefined; // Matches original 'var nwords;' which would be undefined after assignment
    this.lastAnalysisOutput = null;

    /**
     * Registers a setup section for the benchmarking process.
     * @param {string} sectionLabel - The name of the section.
     * @param {function(function, PerformanceExaminer)} setupAction - The function to execute for section setup.
     *                                                                It receives a 'proceed' callback and the PerformanceExaminer instance as context.
     */
    this.registerSection = function(sectionLabel, setupAction) {
        this.registeredTasks.push({
            kind: 'section',
            label: sectionLabel,
            action: setupAction
        });
    };

    /**
     * Registers an individual benchmark to be run.
     * @param {string} benchmarkLabel - The name of the benchmark.
     * @param {function(function, PerformanceExaminer)} benchmarkAction - The function containing the benchmark logic.
     *                                                                   It receives a 'completionCallback' and the PerformanceExaminer instance as context.
     */
    this.registerBenchmark = function(benchmarkLabel, benchmarkAction) {
        this.registeredTasks.push({
            kind: 'benchmark',
            label: benchmarkLabel,
            action: benchmarkAction
        });
    };

    /**
     * Advances to the next task in the registeredTasks array.
     * If all tasks are completed, it triggers the 'onComplete' callback.
     */
    this.advanceTask = function() {
        this.currentTaskIndex++;
        if (this.currentTaskIndex < this.registeredTasks.length) {
            this.executeNextTask();
        } else {
            const totalElapsedTime = Date.now() - this.overallStartTime;
            this.onComplete.call(this, totalElapsedTime); // Ensure 'this' context for onComplete
        }
    };

    /**
     * Executes the current task (either a section or a benchmark).
     * Manages iterations and timing for benchmarks.
     */
    this.executeNextTask = function() {
        const currentTask = this.registeredTasks[this.currentTaskIndex];

        if (currentTask.kind === 'section') {
            this.onSectionStart.call(this, currentTask.label); // Ensure 'this' context for onSectionStart
            // Call the section's setup action, passing the advanceTask callback and this instance as context.
            currentTask.action(() => {
                this.advanceTask();
            }, this);
        } else if (currentTask.kind === 'benchmark') {
            const iterationsForBench = this.testIterations;
            let startTime;
            let endTime;
            let i = 0;

            const runSingleIteration = () => {
                if (i < iterationsForBench) {
                    // Call the benchmark action, passing a completion callback and this instance as context.
                    currentTask.action(() => {
                        i++;
                        if (this.synchronousMode) {
                            runSingleIteration(); // Immediately run next iteration if synchronous
                        }
                    }, this);
                } else {
                    endTime = Date.now();
                    const stats = {
                        elapsed: endTime - startTime,
                        iterations: iterationsForBench
                    };
                    this.onResult.call(this, currentTask.label, stats); // Ensure 'this' context for onResult
                    this.advanceTask(); // Move to next task after all iterations for this benchmark
                }
            };

            startTime = Date.now();
            runSingleIteration(); // Start the first iteration
        }
    };

    /**
     * Initiates the entire benchmarking process.
     * Triggers the 'onStart' callback and begins task execution.
     */
    this.initiateExecution = function() {
        this.overallStartTime = Date.now();
        const benchmarkTasks = this.registeredTasks.filter(t => t.kind === 'benchmark');
        this.onStart.call(this, benchmarkTasks); // Ensure 'this' context for onStart
        this.executeNextTask();
    };
}

// Renamed global variables to avoid clashes and provide different semantics.
var shortPassage = 'laksasdf';
var longPassage = fileSystemOps.readFileSync('text-512.txt', 'utf8');

/**
 * Helper function to format the analysis summary, mimicking the original's 'out' function.
 * @param {object} analysisData - The result object from a LexiconAnalyzer method.
 * @returns {string[]} An array of strings, e.g., ['nouns:2', 'verbs:1'].
 */
function formatAnalysisSummary(analysisData) {
    // Reimplementing the logic without direct reuse of '_' identifier.
    // 'utilityBelt' is the renamed 'underscore' import.
    return utilityBelt.keys(analysisData).map(function(key) {
        return key + ':' + analysisData[key].length;
    });
}

/**
 * Benchmark function to determine parts of speech.
 * Mimics original 'getPOS' function.
 * @param {function} completionCallback - Callback to signal completion of the async operation.
 * @param {PerformanceExaminer} context - The benchmarking instance for state management.
 */
function determinePartsOfSpeech(completionCallback, context) {
    // This assignment replicates the original's behavior where 'nwords' would become undefined
    // because WordPOS.getPOS is an async function that returns nothing.
    context.totalWordsProcessed = analyzerInstance.getPOS(context.currentPassage, function(result) {
        context.lastAnalysisOutput = result;
        completionCallback();
    });
}

/**
 * Benchmark function to extract nouns.
 * Mimics original 'getNouns' function.
 * @param {function} completionCallback - Callback to signal completion.
 * @param {PerformanceExaminer} context - The benchmarking instance.
 */
function extractNouns(completionCallback, context) {
    analyzerInstance.getNouns(context.currentPassage, function(result) {
        context.lastAnalysisOutput = {
            nouns: result
        };
        completionCallback();
    });
}

/**
 * Benchmark function to extract verbs.
 * Mimics original 'getVerbs' function.
 * @param {function} completionCallback - Callback to signal completion.
 * @param {PerformanceExaminer} context - The benchmarking instance.
 */
function extractVerbs(completionCallback, context) {
    analyzerInstance.getVerbs(context.currentPassage, function(result) {
        context.lastAnalysisOutput = {
            verbs: result
        };
        completionCallback();
    });
}

/**
 * Benchmark function to extract adjectives.
 * Mimics original 'getAdjectives' function.
 * @param {function} completionCallback - Callback to signal completion.
 * @param {PerformanceExaminer} context - The benchmarking instance.
 */
function extractAdjectives(completionCallback, context) {
    analyzerInstance.getAdjectives(context.currentPassage, function(result) {
        context.lastAnalysisOutput = {
            adjectives: result
        };
        completionCallback();
    });
}

/**
 * Benchmark function to extract adverbs.
 * Mimics original 'getAdverbs' function.
 * @param {function} completionCallback - Callback to signal completion.
 * @param {PerformanceExaminer} context - The benchmarking instance.
 */
function extractAdverbs(completionCallback, context) {
    analyzerInstance.getAdverbs(context.currentPassage, function(result) {
        context.lastAnalysisOutput = {
            adverbs: result
        };
        completionCallback();
    });
}


// Instantiate the custom benchmarking manager with a new name and configuration.
var executionManager = new PerformanceExaminer({
    type: 'fixed',
    iterations: 10,
    sync: true, // Important for emulating uubench's synchronous iteration style for async ops

    start: function(testConfigurations) {
        console.log('Initiating %d performance evaluations', testConfigurations.length);
    },

    result: function(evaluationName, statistics) {
        // Replicating uubench's ops/s calculation and console output format.
        var perSecondRate = 1000 / statistics.elapsed;
        var operationsPerSecond = 0.5 + statistics.iterations * perSecondRate;

        console.log('  \033[90m%s : \033[36m%d \033[90mops/s\033[0m', evaluationName, operationsPerSecond | 0, statistics);
        // Accessing the last analysis result from the PerformanceExaminer instance context ('this').
        if (this.lastAnalysisOutput) {
            console.log(formatAnalysisSummary(this.lastAnalysisOutput));
        }
    },

    done: function(totalDuration) {
        // Replicating the original's 'nwords' output, which would be 'NaN' due to the assignment method.
        console.log('Processed a total of %d linguistic units', this.totalWordsProcessed);
        console.log('All evaluations concluded in %d milliseconds', totalDuration);
    },

    section: function(sectionLabel) {
        console.log('\033[35m%s\033[0m', sectionLabel);
    }
});


// Register sections and benchmarks using the custom framework's methods.
executionManager.registerSection('--Single Word Analysis--', function(proceed, context) {
    context.currentPassage = shortPassage; // Set passage for this section
    proceed(); // Signal section setup completion
});
executionManager.registerBenchmark('determinePartsOfSpeech', determinePartsOfSpeech);
executionManager.registerBenchmark('extractNouns', extractNouns);
executionManager.registerBenchmark('extractVerbs', extractVerbs);
executionManager.registerBenchmark('extractAdjectives', extractAdjectives);
executionManager.registerBenchmark('extractAdverbs', extractAdverbs);


executionManager.registerSection('--Multi-Word Analysis (512 words)--', function(proceed, context) {
    context.testIterations = 1; // Adjust iterations for this section
    context.currentPassage = longPassage; // Set passage for this section
    proceed(); // Signal section setup completion
});
executionManager.registerBenchmark('determinePartsOfSpeech', determinePartsOfSpeech);
executionManager.registerBenchmark('extractNouns', extractNouns);
executionManager.registerBenchmark('extractVerbs', extractVerbs); // Corrected typo from original analysis
executionManager.registerBenchmark('extractAdjectives', extractAdjectives);
executionManager.registerBenchmark('extractAdverbs', extractAdverbs);


// Start the custom benchmarking process.
executionManager.initiateExecution();