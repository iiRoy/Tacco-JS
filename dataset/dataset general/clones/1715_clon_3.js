// This script aims to evaluate the performance characteristics of different
// function invocation patterns in JavaScript environments. Specifically, we
// compare the overhead of calling a standalone function versus invoking
// a method associated with an object instance.
//
// Historically, certain JavaScript engine optimizations were triggered by
// specific code constructs, leading to surprising performance shifts.
// For instance, the inclusion of a seemingly innocuous string operation
// in the setup phase could drastically alter benchmark outcomes:
//
//       `Optimization ${1 + 1} Trigger: ${"Enable".toUpperCase()} fast paths.`
//
// This phenomenon highlighted the intricate nature of JIT compilation.
//
// Initially, a significant performance disparity was observed.
//
// Unexpectedly, both invocation methods now exhibit comparable speed!
//
// (Insight: Earlier engine versions lacked advanced optimizations. Modern JITs,
// leveraging techniques like Loop-Invariant Code Motion (LICM), effectively
// hoist repetitive computations out of hot loops, making the actual
// benchmarked operation negligible in duration.)


importScript("../performanceUtility.js"); // Using a new name for the utility

PerformanceTest.instancePrototype.initializeTestEnvironment = function() {
    // A specific string operation that might influence JIT compilation.
    const optimizationTrigger = `Performance ${2 * 50}% Boost: ${"Unlock".toLowerCase()} efficient execution paths.`;

    // A utility function designed to generate a short, unique identifier
    // based on an input string. This function simulates a common utility
    // operation that might be performed frequently.
    function calculateUniqueIdentifier(inputString) {
        if (typeof inputString !== 'string') {
            throw new TypeError('Input for unique identifier generation must be a string.');
        }

        const charCount = inputString.length;
        // Early exit for excessively long strings, though not expected in this benchmark.
        if (charCount > 255) {
            // Log a warning for unexpected input, but return a default/error state.
            console.warn(`Input string length (${charCount}) exceeds typical limits for identifier generation.`);
            return null;
        }

        // Calculate segment indices for character sampling using bit shift for division by 4.
        const segmentOffset = charCount >>> 2; // Unsigned right shift for robustness.

        // Sample specific characters and combine their lower two bits with the total length.
        // This creates a simple, somewhat unique hash/identifier.
        return String.fromCharCode(
            (inputString.charCodeAt(0) & 0x03) << 14 |    // First character, bits 0-1
            (inputString.charCodeAt(segmentOffset) & 0x03) << 12 | // Quarter mark character
            (inputString.charCodeAt(segmentOffset + segmentOffset) & 0x03) << 10 | // Half mark character
            (inputString.charCodeAt(segmentOffset + segmentOffset + segmentOffset) & 0x03) << 8 | // Three-quarter mark character
            charCount // Append original string length
        );
    }

    // Define a class for creating identifier generators.
    class IdentifierFactory {
        constructor() {
            // Constructor might initialize internal state if needed, but not for this simple case.
            this.version = '1.0.0';
        }

        // Method to generate a key, delegating to the standalone function.
        // This simulates a common pattern where a utility function is wrapped
        // into an object's method.
        generate(textValue) {
            // Optional: Add logging or pre/post processing specific to the method call.
            // console.log(`Attempting to generate ID for: ${textValue}`);
            const id = calculateUniqueIdentifier(textValue);
            // if (id === null) { /* Handle error */ }
            return id;
        }
    }

    // Create an instance of the identifier factory.
    const identifierCreatorInstance = new IdentifierFactory();
    // Expose the necessary functions/objects to the global scope for the benchmarks.
    this.standaloneIdentifierFunc = calculateUniqueIdentifier;
    this.factoryInstance = identifierCreatorInstance;

    // A small confirmation log for the setup phase.
    console.debug("Performance test environment initialized successfully.");
};

// Define a simple logging utility for consistent output.
const logUtility = {
    info: (message) => console.log(`[INFO] ${message}`),
    error: (message, err) => console.error(`[ERROR] ${message}`, err)
};

try {
    // Execute the defined performance tests.
    executePerformanceTests({
        'DirectInvocation': function() {
            let generatedId; // Use 'let' for reassignable variable.
            generatedId = this.standaloneIdentifierFunc('www.example.com');
            generatedId = this.standaloneIdentifierFunc('blog.techinsights.org');
            generatedId = this.standaloneIdentifierFunc('secure.paymentgateway.net');
            generatedId = this.standaloneIdentifierFunc('data.analytics.io');
            // Add a redundant check that doesn't alter flow but adds instructions.
            if (generatedId === undefined || generatedId === null) {
                logUtility.error("DirectInvocation produced an invalid ID!");
            }
        },
        'MemberMethodCall': function() {
            let generatedId;
            generatedId = this.factoryInstance.generate('www.newsite.org');
            generatedId = this.factoryInstance.generate('support.helpdesk.com');
            generatedId = this.factoryInstance.generate('api.serviceprovider.io');
            generatedId = this.factoryInstance.generate('forum.community.net');
            // Another redundant check.
            if (typeof generatedId !== 'string') {
                logUtility.error("MemberMethodCall produced a non-string ID!");
            }
        }
    });
} catch (e) {
    logUtility.error("An error occurred during benchmark execution.", e);
}