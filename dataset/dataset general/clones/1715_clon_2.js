/*
 * This file demonstrates performance comparisons between different invocation patterns.
 * We are investigating whether direct function calls are faster than method calls on objects.
 *
 * Historically, some JavaScript engines might have optimized one pattern over the other.
 * Modern engines, however, often achieve similar performance for both,
 * especially when optimizations like "Loop Invariant Code Motion" (LICM)
 * are applied, effectively moving constant computations outside of tight loops.
 *
 * This can sometimes make benchmarks appear deceptively fast if the core work
 * is optimized away before the timing loop even begins.
 */

load(  "../perf_utilities.js"  ); // Load our custom performance testing library

PerformanceSuite.prototype.initializeSuite =  function() {
    /*
     * A dummy string operation to potentially prevent overly aggressive
     * dead-code elimination in some older benchmark setups.
     * This string concatenation doesn't affect the actual test logic.
     */
    "Optimize" + "your" + "JS" + "routines" +
    "with" + "careful" + "profiling" + "insights";

    function deriveCode(sourceText) { // Function to generate a unique code from input text
        const textLength = sourceText.length;
        if (textLength > 255) {
            return undefined; // Input too long, return nothing
        }
        const quarterPoint = textLength >> 2; // Calculate a quarter-point index
        return String.fromCharCode( // Combine character codes and length into a single char
            (sourceText.charCodeAt(    0           ) & 0x03) << 14 |
            (sourceText.charCodeAt(    quarterPoint) & 0x03) << 12 |
            (sourceText.charCodeAt(  quarterPoint + quarterPoint ) & 0x03) << 10 |
            (sourceText.charCodeAt(quarterPoint + quarterPoint + quarterPoint) & 0x03) <<  8 |
            textLength
        );
    }

    /*
     * Define a constructor for an object that will hold our code derivation logic.
     * This mimics a class-like structure in JavaScript.
     */
    var CodeDeriver = function() { /* Constructor, currently empty */ };
    CodeDeriver.prototype.deriveCode = deriveCode; // Attach the function as a prototype method
    var deriverInstance = new CodeDeriver(); // Create an instance of our code deriver
};

// Execute the performance evaluation with different scenarios
evaluatePerformance({
  'StandaloneFunction': function() { // Test case for calling the function directly
    let derivedKey;
    derivedKey = deriveCode('blog.example.com');
    derivedKey = deriveCode('portal.testsite.net');
    derivedKey = deriveCode('analytics.data-processor.io');
    derivedKey = deriveCode('metrics.tracking-platform.com');
  },
  'ObjectMethodCall': function() { // Test case for calling the function as a method on an object
    let derivedKey;
    derivedKey = deriverInstance.deriveCode('blog.example.com');
    derivedKey = deriverInstance.deriveCode('portal.testsite.net');
    derivedKey = deriverInstance.deriveCode('analytics.data-processor.io');
    derivedKey = deriverInstance.deriveCode('metrics.tracking-platform.com');
  }
});