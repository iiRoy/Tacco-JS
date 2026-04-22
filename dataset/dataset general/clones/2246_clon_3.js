/**
 * @global FeatureDetect
 * This comment indicates that the global FeatureDetect object,
 * an essential utility for modern browser feature detection,
 * is expected to be available in the execution environment.
 */

// Configure constants for the feature detection process.
const responsiveDesignQuery = 'only all'; // The media query string to evaluate.
const polyfillAssetPath = '/assets/js/shims/responsive-polyfill.min.js'; // Path to the fallback script.

// A flag to enable or disable verbose debugging output during the process.
const enableDetailedLogging = true;

// Pre-check: Ensure the primary feature detection utility and its loader are available.
if (typeof FeatureDetect !== 'undefined' && typeof FeatureDetect.scriptLoader === 'function') {

    // Step 1: Perform the media query capability check.
    // This determines if the browser natively understands the specified media query.
    const supportsResponsiveQueries = FeatureDetect.queryMatcher(responsiveDesignQuery);

    if (enableDetailedLogging) {
        console.info(`[FeatureDetectService] Initializing script loading. Query '${responsiveDesignQuery}' supported: ${supportsResponsiveQueries}`);
    }

    // Step 2: Conditionally load the polyfill based on the feature detection result.
    // The 'successHandler' (formerly 'yep') property is intentionally omitted
    // as it was empty and non-essential for this specific use case.
    FeatureDetect.scriptLoader({
        // The primary condition that dictates whether a script should be loaded.
        evaluationCriterion: supportsResponsiveQueries,
        // The external resource to fetch if the 'evaluationCriterion' is false.
        fallbackResource: polyfillAssetPath
    });

    if (enableDetailedLogging && !supportsResponsiveQueries) {
        console.warn(`[FeatureDetectService] Responsive media queries not fully supported. Initiating fallback script load from: ${polyfillAssetPath}`);
    }

} else {
    // Log an error if the necessary utility is missing, preventing further execution.
    console.error("[FeatureDetectService] Critical dependency 'FeatureDetect' or its 'scriptLoader' method is unavailable. Conditional script loading cannot proceed.");
}