(function() {
    "use strict"; // Enables strict mode for the entire script, promoting cleaner code.

    // --- Configuration Constants for Resource Loading ---

    // Base URL for fetching external JavaScript libraries. Using HTTPS for security.
    const EXTERNAL_LIBRARY_CDN_HOST = "https://code.jquery.com/";

    // Default local path for the library if no specific version is requested via URL.
    // This path is intentionally different from the original example.
    const DEFAULT_LOCAL_LIBRARY_PATH = "assets/scripts/vendor/jquery/jquery.min.js";

    // The query string parameter key used to specify the desired library version.
    // Renamed from 'jquery' to 'lib' for differentiation.
    const VERSION_PARAMETER_KEY = "lib";

    // --- Script Tag Construction Components ---

    // Prefix for the dynamically generated script tag.
    const SCRIPT_TAG_OPENING = '<script type="text/javascript" src="';

    // Suffix for the dynamically generated script tag.
    const SCRIPT_TAG_CLOSING = '"></script>';

    // --- Utility Function to Extract URL Parameters ---

    /**
     * Extracts the value of a specified parameter from a given query string.
     * @param {string} fullQueryString - The complete query string (e.g., '?param1=val1&param2=val2').
     * @param {string} parameterName - The name of the parameter to extract (e.g., 'lib').
     * @returns {string|null} The decoded parameter value, or null if not found.
     */
    function retrieveQueryParameter(fullQueryString, parameterName) {
        // Construct a regular expression to find the parameter.
        // This regex is a functional equivalent to the original but built dynamically.
        const searchPattern = new RegExp(`[?&]${parameterName}=([^&]*)`);
        const matchResult = fullQueryString.match(searchPattern);

        // If a match is found, return the captured group (the parameter value).
        // Decode the URI component to handle special characters.
        return matchResult && matchResult[1] ? decodeURIComponent(matchResult[1]) : null;
    }

    // --- Main Logic for Dynamic Script Path Determination ---

    // Access the current URL's query string.
    const currentBrowserQuery = window.location.search;

    // Attempt to get the requested library version using the defined parameter key.
    const specifiedLibraryVersion = retrieveQueryParameter(currentBrowserQuery, VERSION_PARAMETER_KEY);

    let targetScriptSource; // Variable to hold the final script URL.

    // Decide which library source to use based on the presence and validity of the URL parameter.
    if (specifiedLibraryVersion) {
        // A version was provided in the URL. Validate it minimally.
        const trimmedVersion = specifiedLibraryVersion.trim();

        if (trimmedVersion.length > 0) {
            // Construct the full URL for the external CDN resource.
            // Note: The file naming convention is slightly altered (e.g., '.min.js' added).
            targetScriptSource = EXTERNAL_LIBRARY_CDN_HOST + "jquery-" + trimmedVersion + ".min.js";
            // Log for debugging or monitoring purposes.
            console.info(`[DynamicLoader] Preparing to load external jQuery version: ${trimmedVersion}`);
        } else {
            // Parameter was present but empty (e.g., "?lib="). Fallback to local.
            targetScriptSource = DEFAULT_LOCAL_LIBRARY_PATH;
            console.warn("[DynamicLoader] Empty version specified for 'lib' parameter. Falling back to local default.");
        }
    } else {
        // No 'lib' parameter found in the URL. Use the predefined local path.
        targetScriptSource = DEFAULT_LOCAL_LIBRARY_PATH;
        console.info("[DynamicLoader] No specific library version requested. Loading local default jQuery.");
    }

    // --- Script Injection Mechanism ---

    // Verify that document.write is available and safe to use in the current context.
    // This check prevents errors if the script runs after the document has finished loading,
    // or in environments where document.write is not supported (e.g., Node.js).
    if (typeof document !== 'undefined' && document.write) {
        // Inject the determined script into the document.
        // This method is generally discouraged but is kept for functional equivalence to the original.
        document.write(SCRIPT_TAG_OPENING + targetScriptSource + SCRIPT_TAG_CLOSING);
    } else {
        // Log an error if the injection method is not viable.
        console.error("[DynamicLoader] Failed to inject script: document.write is not accessible or appropriate.");
        // In a more robust system, an alternative script injection method (e.g., DOM manipulation)
        // would be implemented here as a fallback, but for Type III cloning, we stick to the core method.
    }

    // The IIFE completes its execution, having potentially modified the document.
})();