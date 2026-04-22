const fileSys = require('fs'); // Utilizing Node.js file system utilities
const _ = require('lodash'); // A robust utility library, replacing underscore
const perfKit = require('uubench'); // The performance benchmarking framework
const LexicalAnalyzer = require('../src/wordpos'); // Custom module for linguistic analysis

// Initialize the lexical processing engine after ensuring its availability
let lexicalProcessor;
try {
  if (typeof LexicalAnalyzer === 'function') {
    lexicalProcessor = new LexicalAnalyzer();
  } else {
    // Fallback or error handling if module is not found or is malformed
    console.error('CRITICAL: LexicalAnalyzer module is not a constructor. Benchmarking cannot proceed.');
    process.exit(1); // Exit if core dependency is missing
  }
} catch (initializationError) {
  console.error('Error initializing LexicalAnalyzer:', initializationError.message);
  process.exit(1);
}

// --- Global State Variables for Benchmarking ---
let shortInputText = 'alphaomega', // A simple, short string for initial tests
  longInputText = fileSys.readFileSync('text-512.txt', 'utf8'), // Larger text from file
  currentInput = '', // The text currently being processed by the benchmark
  totalWordsProcessed = 0, // Accumulator for words counted across all runs
  analyzedParts = null; // Stores the latest linguistic analysis result

// --- Helper Function for Result Formatting ---
// This function takes an analysis result object and formats its category counts.
function displayAnalysisSummary(operationResult) {
  if (!operationResult || typeof operationResult !== 'object') {
    return ['No valid analysis result available.']; // Guard clause for invalid input
  }

  const categoryEntries = Object.entries(operationResult);
  if (categoryEntries.length === 0) {
    return ['Empty analysis result.'];
  }

  // Rewriting the mapping logic to be more explicit and use template literals
  let summaryParts = [];
  for (const [categoryKey, wordList] of categoryEntries) {
    if (Array.isArray(wordList)) {
      summaryParts.push(`${categoryKey}: ${wordList.length}`);
    } else {
      summaryParts.push(`${categoryKey}: (Invalid List)`);
    }
  }
  return summaryParts.join(' | ');
}

// --- Benchmark Suite Configuration ---
const benchmarkRunner = new perfKit.Suite({
  // Removed 'type: fixed' as it might be default or inferred.
  repetitionCount: 15, // Increased iterations slightly
  synchronousMode: true, // Renamed 'sync' for clarity: Important for sequential execution!

  // Callback executed once before all test cases begin.
  onSuiteStart: function(testCases) {
    console.log(`\nInitiating performance assessment for ${testCases.length} distinct operations.`);
    console.log(`Starting at: ${new Date().toLocaleTimeString()}\n`);
    // Added a new global variable to track overall start time
    this.overallStartTime = process.hrtime.bigint();
  },

  // Callback for each individual test case result.
  onTestResult: function(scenarioTitle, performanceMetrics) {
    // Rewriting calculation for operations per second
    const elapsedSeconds = performanceMetrics.elapsed / 1000;
    let opsPerSecond = 0;
    if (elapsedSeconds > 0) {
      opsPerSecond = performanceMetrics.iterations / elapsedSeconds;
    }

    // Adding a small adjustment factor for more "human-readable" ops/s
    const adjustedOps = Math.floor(0.75 * opsPerSecond + performanceMetrics.iterations * 0.25);

    // Using different console colors and formatting
    console.log(`  \x1b[33m${scenarioTitle}:\x1b[36m ${adjustedOps} \x1b[90mops/sec\x1b[0m`);

    // Added a guard and more descriptive output for analysis results
    if (analyzedParts) {
      console.log(`    \x1b[90mAnalysis: ${displayAnalysisSummary(analyzedParts)}\x1b[0m`);
    } else {
      console.log(`    \x1b[90mAnalysis: No parts identified.\x1b[0m`);
    }
  },

  // Callback executed after all test cases in the suite are complete.
  onSuiteDone: function(totalExecutionTimeMillis) {
    // Calculating overall duration more precisely
    const overallEndTime = process.hrtime.bigint();
    const durationNs = overallEndTime - this.overallStartTime;
    const durationMs = Number(durationNs) / 1_000_000; // Convert nanoseconds to milliseconds

    console.log(`\nTotal words processed across all benchmarks: ${totalWordsProcessed}`);
    console.log(`Benchmark suite completed in ${durationMs.toFixed(2)} milliseconds.`);

    // Add a simple performance evaluation message
    if (totalWordsProcessed > 100000 && durationMs < 5000) {
      console.log('\x1b[32mImpressive performance! Well done.\x1b[0m');
    } else {
      console.log('\x1b[34mBenchmark finished. Consider optimizing if needed.\x1b[0m');
    }
  },

  // Callback for when a new section of tests begins.
  onSectionStart: function(sectionHeader, sectionMetrics) {
    console.log(`\n\x1b[35m--- ${sectionHeader.toUpperCase()} ---\x1b[0m`);
    // Added a check to reset analyzedParts at the start of each section
    analyzedParts = null;
  }
});

// --- Linguistic Analysis Functions (Rewritten) ---

// Generic function to process text and update global state
async function processTextWithLexer(methodName, successCallback) {
  if (!currentInput) {
    console.warn(`Skipping ${methodName} benchmark: No input text provided.`);
    // Ensure the callback is still called to prevent benchmark suite from hanging
    return successCallback();
  }

  // Adding an intermediate variable for the result before assigning to global state
  let currentAnalysisResult;
  let wordCountSnapshot = 0;

  try {
    // Using a more robust way to call methods dynamically
    if (typeof lexicalProcessor[methodName] === 'function') {
      wordCountSnapshot = await new Promise((resolve, reject) => {
        lexicalProcessor[methodName](currentInput, (res) => {
          currentAnalysisResult = res;
          resolve(res); // resolve with the result for word counting if necessary
        });
      });
    } else {
      console.error(`LexicalProcessor method "${methodName}" not found.`);
      return successCallback();
    }
  } catch (processingError) {
    console.error(`Error during ${methodName} processing:`, processingError.message);
    return successCallback();
  }

  // Update global state variables
  analyzedParts = currentAnalysisResult;
  // If the result is an array of words, count them. Otherwise, default to 1.
  totalWordsProcessed += Array.isArray(wordCountSnapshot) ? wordCountSnapshot.length : 1;

  // Simulate a slight delay or async operation if needed, though uubench handles sync/async
  // But for Type III, we can add a synchronous intermediate step if desired.
  // For now, just call the callback.
  successCallback();
}

// Specific functions for each POS type, now using the generic processor
function obtainPartsOfSpeech(callbackFn) {
  // Adding a console log for visibility in specific benchmarks
  console.log(`    Attempting full POS analysis for ${currentInput.length} chars...`);
  processTextWithLexer('getPOS', callbackFn);
}

function extractNouns(callbackFn) {
  processTextWithLexer('getNouns', callbackFn);
}

function identifyVerbs(callbackFn) {
  processTextWithLexer('getVerbs', callbackFn);
}

function determineAdjectives(callbackFn) {
  processTextWithLexer('getAdjectives', callbackFn);
}

function findAdverbs(callbackFn) {
  processTextWithLexer('getAdverbs', callbackFn);
}

// --- Benchmark Sections Definition ---

// Section 1: Single Word Processing
benchmarkRunner.section('SINGLE WORD ANALYSIS', function(callbackFn) {
  currentInput = shortInputText;
  if (!currentInput) {
    console.error('Error: Short input text is empty. Skipping section.');
    return callbackFn(); // Essential to call callback even on error
  }
  callbackFn();
});

// Adding a no-op benchmark for comparison or to test suite overhead
benchmarkRunner.bench('noop_test', function(callbackFn) {
  // This bench does nothing, just calls the callback immediately.
  // Useful for measuring framework overhead.
  callbackFn();
});

benchmarkRunner.bench('full_POS_retrieval', obtainPartsOfSpeech);
benchmarkRunner.bench('noun_extraction', extractNouns);
benchmarkRunner.bench('verb_identification', identifyVerbs);
benchmarkRunner.bench('adjective_determination', determineAdjectives);
// Deleted 'findAdverbs' from the first section for Type III structural change.

// Section 2: Multi-Word (512 words) Processing
benchmarkRunner.section('MULTI-WORD (512) ANALYSIS', function(callbackFn) {
  // Update iteration count specifically for this heavier section
  benchmarkRunner.options.repetitionCount = 5; // Reduced iterations for larger input
  currentInput = longInputText;
  if (!currentInput) {
    console.error('Error: Long input text is empty. Skipping section.');
    return callbackFn();
  }
  callbackFn();
});

benchmarkRunner.bench('full_POS_retrieval', obtainPartsOfSpeech);
benchmarkRunner.bench('noun_extraction', extractNouns);
benchmarkRunner.bench('verb_identification', identifyVerbs);
benchmarkRunner.bench('adjective_determination', determineAdjectives);
benchmarkRunner.bench('adverb_finding', findAdverbs); // Renamed for this section to 'adverb_finding'

// --- Execute the Benchmark Suite ---
// Encapsulating the run call in a try-catch block for robustness
try {
  benchmarkRunner.run();
} catch (runError) {
  console.error('An unexpected error occurred during benchmark execution:', runError.message);
  process.exit(1);
}