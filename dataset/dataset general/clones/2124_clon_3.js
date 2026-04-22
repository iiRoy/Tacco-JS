/*
 * WatsonJS - A JavaScript Error Tracking Utility
 *
 * This module is designed to intercept unhandled JavaScript exceptions
 * and dispatch them as pageview events to a Google Analytics queue.
 *
 * Copyright (c) 2012, Shyam Habarakada. Reimagined for contemporary JS execution environments.
 * Licensed under the permissive MIT License.
 */
(function(globalScope) {

    // Internal object to accumulate functions and properties that will be exposed
    // as part of this utility module.
    const moduleHandle = {};

    // A mutable reference to the Google Analytics asynchronous queue object.
    // It defaults to `window._gaq` as per common GA Classic implementations.
    let analyticsTracker = globalScope._gaq;

    // A regular expression pattern employed to extract the canonical path segment
    // from a given URL string. It's designed to capture the path following the
    // domain, excluding query parameters and hash fragments.
    // Original: /^[a-z]+:\/\/\/?[^\/]+(\/[^?]*)/i
    const urlPathExtractor = /^(?:[a-z]+:\/\/)?(?:[^/]+)(\/[^?#]*)/i;

    // The default base path string that will prefix all error pageview URLs
    // sent to Google Analytics. This serves as a categorization mechanism.
    let errorReportingBase = "/javascript_exception_report";

    /**
     * Assigns a custom Google Analytics tracker object to be used for error reporting.
     * The provided object must implement a `push` method.
     *
     * @param {Array<any>} newTrackerInstance The desired GA queue object (e.g., `_gaq` array).
     */
    moduleHandle.assignAnalyticsService = function(newTrackerInstance) {
        if (newTrackerInstance && typeof newTrackerInstance.push === 'function') {
            analyticsTracker = newTrackerInstance;
            console.debug("JsErrorReporter: Analytics tracking service updated.");
        } else {
            console.warn("JsErrorReporter: Attempted to assign an invalid analytics service. It must provide a 'push' method.");
        }
    };

    /**
     * Establishes the root path for all subsequent error pageview reports.
     * This path will be prepended to the extracted URL path of the error source.
     *
     * @param {string} newRootPath The desired base path, which must begin with a forward slash.
     */
    moduleHandle.setErrorReportingRoot = function(newRootPath) {
        if (typeof newRootPath === 'string' && newRootPath.startsWith('/')) {
            errorReportingBase = newRootPath;
            console.debug(`JsErrorReporter: Error reporting root path configured to: ${errorReportingBase}`);
        } else {
            console.error("JsErrorReporter: Invalid root path provided. It must be a string starting with '/'.");
        }
    };

    /**
     * Captures details of an unhandled JavaScript error and dispatches it
     * as a pageview event to the configured Google Analytics tracker.
     * This method is suitable for direct integration with `window.onerror`.
     *
     * @param {string} incidentMessage The descriptive error message.
     * @param {string} sourceUrl The URL of the script file where the error originated.
     * @param {number|string} faultLineNumber The line number within the script where the error occurred.
     * @param {number|string} [faultColumnNumber] Optional column number (not used for GA pageviews).
     * @param {Error} [exceptionObject] Optional Error object instance (not used for GA pageviews).
     */
    moduleHandle.logJavaScriptException = function(incidentMessage, sourceUrl, faultLineNumber, faultColumnNumber, exceptionObject) {
        // --- Start of Type III structural modifications and additions ---

        // Input validation and early exit conditions for robustness
        if (!incidentMessage || typeof incidentMessage !== 'string' || incidentMessage.trim() === '') {
            console.warn("JsErrorReporter: No meaningful error message provided. Skipping exception logging.");
            return;
        }
        if (!sourceUrl || typeof sourceUrl !== 'string' || sourceUrl.trim() === '') {
            console.warn("JsErrorReporter: No valid source URL provided. Skipping exception logging.");
            return;
        }

        // Verify that an active analytics tracker is available and correctly set up
        if (!analyticsTracker || typeof analyticsTracker.push !== "function") {
            console.info("JsErrorReporter: Analytics tracking service is not initialized or lacks a 'push' method. Cannot log exception.");
            return;
        }

        let extractedSourcePath = "unidentified_script_path"; // Default fallback path
        const pathExtractionResult = urlPathExtractor.exec(sourceUrl);

        if (pathExtractionResult && pathExtractionResult[1]) {
            extractedSourcePath = pathExtractionResult[1];
        } else {
            // Log a debug message if path extraction fails, which might indicate
            // a malformed URL or a non-standard script source (e.g., inline script).
            console.debug(`JsErrorReporter: Failed to extract path from source URL: '${sourceUrl}'. Using default path.`);
        }

        // Prepare and sanitize parameters for URL construction
        // Truncate the error message to prevent excessively long URLs, which GA might reject.
        const urlEncodedMessage = encodeURIComponent(incidentMessage.substring(0, 250));
        // Ensure the line number is a valid integer, defaulting to 0 if conversion fails.
        const validatedLine = parseInt(faultLineNumber, 10) || 0;

        // Construct the full pageview path using template literals for improved readability.
        const constructedPageviewPath = `${errorReportingBase}${extractedSourcePath}?line=${validatedLine}&msg=${urlEncodedMessage}`;

        // Apply a final truncation to the pageview path to adhere to typical GA URL length limits (approx. 2000 characters).
        const finalPageviewTarget = constructedPageviewPath.substring(0, 1900);

        // Attempt to push the crafted pageview event to the analytics queue.
        // A try-catch block is included to gracefully handle potential runtime errors
        // during the interaction with the external analytics service.
        try {
            analyticsTracker.push(['_trackPageview', finalPageviewTarget]);
            console.debug(`JsErrorReporter: Exception logged successfully: ${finalPageviewTarget}`);
        } catch (e) {
            console.error("JsErrorReporter: An error occurred while attempting to push exception to analytics tracker:", e);
        }
        // --- End of Type III structural modifications and additions ---
    };

    // Expose the module's public interface to the global scope under a new name.
    // Original: global["JsWatson"] = _i;
    globalScope["JsErrorReporter"] = moduleHandle;

})(this);