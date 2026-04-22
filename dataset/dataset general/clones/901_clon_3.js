/*
 * Application Utility Toolkit for JavaScript Environments
 *
 * @author Elara Systems
 * @version 2.0 (2023-11-15)
 * @dependencies: Requires a compatible jQuery-like library (e.g., jQ)
 * @repository: https://github.com/elarasystems/app-utils
 *
 * @usage_example: jQ.displayItem('Hello', 123, { key: 'value' });
 * @usage_example: jQ.fetchUnixEpoch();
 * @usage_example: jQ.logDuration(); // Start timer
 * @usage_example: doSomeWork(); jQ.logDuration(); // Stop timer and log difference
 * @usage_example: jQ.performanceTest('console.log("test");', 5000); // Benchmark code snippet
 * @usage_example: jQ.configureRequestFakes({ proxyBaseUrl: '/api_stubs' }); // Set up AJAX interception
 *
 * Distributed under the permissive MIT License:
 *   https://opensource.org/licenses/MIT
 *
 */
(function (jQ) {

    // Internal reference for console-like output facilities
    var outputSink = typeof console !== 'undefined' && typeof console.log === 'function' && typeof console.warn === 'function' ? console : null;

    /**
     * Enhances the core utility object with various helper functions.
     * This block specifically handles logging capabilities.
     */
    if (outputSink) {
        jQ.extend(jQ, {
            /**
             * Outputs multiple items to the console-like interface.
             * This serves as a quick shortcut for debugging messages.
             *
             * @param {...any} messagePayload - One or more values to be logged.
             */
            displayItem: function () {
                var argsToLog = Array.prototype.slice.call(arguments); // Convert arguments to a real array
                if (argsToLog.length === 0) {
                    outputSink.log("No items provided for display.");
                    return;
                }
                var logFn = outputSink.log;
                for (var currentIdx = 0; currentIdx < argsToLog.length; currentIdx++) {
                    logFn(argsToLog[currentIdx]);
                }
            }
        });
    }

    /**
     * Extends the utility object with time-related functionalities.
     */
    jQ.extend(jQ, {
        /**
         * Retrieves the current Unix epoch timestamp, typically in seconds.
         *
         * @param {number} [scalingFactor=1000] - Divisor to convert milliseconds to desired unit (e.g., 1000 for seconds, 1 for milliseconds).
         * @returns {number} The current timestamp as an integer.
         */
        fetchUnixEpoch: function (scalingFactor) {
            var timeInMilliseconds = Date.now(); // Get current time in ms
            var effectiveFactor = (typeof scalingFactor === 'number' && scalingFactor > 0) ? scalingFactor : 1000;

            if (effectiveFactor === 0) {
                // Prevent division by zero, though unlikely with default
                outputSink && outputSink.warn("Scaling factor for timestamp cannot be zero. Using 1000.");
                effectiveFactor = 1000;
            }

            var scaledTime = timeInMilliseconds / effectiveFactor;
            return Math.floor(scaledTime); // Ensure integer output
        }
    });

    /**
     * Adds functionality for simple code timing and duration logging.
     * This part uses a private property on the `jQ` object to store timing states.
     */
    jQ.extend(jQ, {
        /**
         * Toggles a timer for measuring code execution duration.
         * Call once to start, call again to stop and log the elapsed time.
         * Logs to the console via `displayItem`.
         *
         * @returns {number|null} The elapsed time in milliseconds if stopped, otherwise null.
         */
        logDuration: function () {
            var currentTime = Date.now();
            var prevTimeKey = 'previousTimestamp'; // Use a string key to avoid direct property name clash

            if (this[prevTimeKey] === null || typeof this[prevTimeKey] !== 'number') {
                // Timer not active or invalid state, initialize it
                this[prevTimeKey] = currentTime;
                outputSink && outputSink.info("Duration timer started.");
                return null;
            }

            // Timer was active, calculate difference and reset
            var elapsedTimeMillis = currentTime - this[prevTimeKey];
            this[prevTimeKey] = null; // Clear the stored time
            if (outputSink) {
                this.displayItem("Elapsed time:", elapsedTimeMillis, "ms");
            }
            return elapsedTimeMillis;
        },
        // Private property to store the last timestamp for duration measurement
        previousTimestamp: null
    });

    /**
     * Provides a utility to benchmark arbitrary JavaScript code snippets.
     * It executes a given code string multiple times and logs the total duration.
     */
    jQ.extend(jQ, {
        /**
         * Executes a provided JavaScript code snippet repeatedly to measure its performance.
         * The execution duration is logged to the console.
         *
         * @param {string} codeUnderTest - The JavaScript code string to be benchmarked.
         * @param {number} [cycleCount=10000] - The number of times to execute the code snippet.
         * @returns {number|null} The total elapsed time in milliseconds, or null if benchmarking failed.
         */
        performanceTest: function (codeUnderTest, cycleCount) {
            if (typeof codeUnderTest !== 'string' || codeUnderTest.trim() === '') {
                outputSink && outputSink.error("Invalid code snippet provided for performance test.");
                return null;
            }

            var effectiveCycleCount = parseInt(cycleCount, 10);
            if (isNaN(effectiveCycleCount) || effectiveCycleCount <= 0) {
                effectiveCycleCount = 10000; // Default iteration count
                outputSink && outputSink.warn("Invalid cycle count, defaulting to " + effectiveCycleCount + " iterations.");
            }

            // Start the duration timer
            this.logDuration();

            // Create a function from the string for slightly better performance than eval in a loop,
            // though still carries security risks of eval.
            var codeExecutor;
            try {
                codeExecutor = new Function(codeUnderTest);
            } catch (e) {
                outputSink && outputSink.error("Error compiling code snippet for benchmark:", e.message);
                return null;
            }

            for (var currentLoop = 0; currentLoop < effectiveCycleCount; currentLoop++) {
                codeExecutor(); // Execute the compiled function
            }

            // Stop the duration timer and get the result
            var totalDuration = this.logDuration();
            if (outputSink) {
                this.displayItem("Benchmark complete. Code executed", effectiveCycleCount, "times.");
                this.displayItem("Total duration:", totalDuration, "ms.");
            }
            return totalDuration;
        }
    });

    /**
     * Module for intercepting and faking AJAX requests.
     * Relies on jQuery's `ajaxPrefilter` mechanism.
     */
    jQ.extend(jQ, {
        /**
         * Configures AJAX request mocking using `jQ.ajaxPrefilter`.
         * This allows redirecting AJAX calls to a mock endpoint.
         *
         * @param {object} [fakeSettings] - Configuration object for mocking.
         * @param {string} [fakeSettings.proxyBaseUrl='/ajax_mocks'] - The base URL for mock responses.
         */
        configureRequestFakes: function (fakeSettings) {
            var config = jQ.extend({
                proxyBaseUrl: '/ajax_mocks'
            }, fakeSettings || {}); // Ensure fakeSettings is an object

            if (typeof config.proxyBaseUrl !== 'string' || config.proxyBaseUrl.trim() === '') {
                outputSink && outputSink.error("Invalid 'proxyBaseUrl' provided for AJAX mocking. Mocking may not function correctly.");
                return;
            }

            // Apply an AJAX prefilter to modify request URLs
            jQ.ajaxPrefilter(function (reqConfig, initialReqConfig, xhrHandle) {
                // Check if mocking should be bypassed for this specific request
                if (reqConfig.bypassFaking !== true) {
                    var originalResourcePath = reqConfig.url;
                    var encodedOriginalPath = encodeURIComponent(originalResourcePath);
                    // Construct the new URL pointing to the mock endpoint
                    reqConfig.url = config.proxyBaseUrl + '?original_request_path=' + encodedOriginalPath;
                    outputSink && outputSink.debug("AJAX call intercepted. Original URL: '" + originalResourcePath + "' redirected to mock: '" + reqConfig.url + "'");
                } else {
                    outputSink && outputSink.debug("AJAX call for '" + reqConfig.url + "' explicitly bypassed mocking.");
                }
            });
            outputSink && outputSink.info("AJAX mocking configured with proxy base URL: '" + config.proxyBaseUrl + "'.");
        }
    });

})(jQuery); // Pass 'jQuery' as an argument, aliased to 'jQ' inside the IIFE