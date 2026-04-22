(function(globalContext) {
  // This anonymous function serves as an isolated module to manage dynamic script loading.
  // Its primary goal is to determine and inject the appropriate jQuery library version
  // based on URL parameters or a predefined local fallback.

  // --- Configuration Constants and Default Paths ---
  // The relative path to the local jQuery distribution.
  const localJQueryLocation = '../libs/jquery/jquery.js';

  // The base URL for fetching jQuery from an external Content Delivery Network (CDN).
  const cdnJQueryBaseUrl = 'http://code.jquery.com/jquery-';

  // The specific query parameter key to look for in the URL (e.g., "?libver=3.7.1").
  const versionQueryParameterName = 'jquery';

  // --- Variable Initialization ---
  // This variable will hold the final URL of the jQuery script to be loaded.
  let resolvedScriptSource = localJQueryLocation; // By default, assume local version.

  // --- Helper Function for URL Construction ---
  // Creates a complete CDN URL for a given jQuery version string.
  const composeCdnResourceLink = (targetVersionIdentifier) => {
    // Input validation: ensure the version string is meaningful.
    if (!targetVersionIdentifier || typeof targetVersionIdentifier !== 'string' || targetVersionIdentifier.trim().length === 0) {
      // Log a warning if an invalid version is provided, and revert to the local path.
      globalContext.console.warn("Invalid or empty version identifier provided for CDN resource. Falling back to local library.");
      return localJQueryLocation;
    }
    // Use template literals for clean string concatenation.
    return `${cdnJQueryBaseUrl}${targetVersionIdentifier}.js`;
  };

  // --- Query Parameter Parsing Logic ---
  // Retrieve the full query string from the current browser location.
  const currentUrlQueryParameters = globalContext.location.search;

  // Define a regular expression to extract the version value from the query string.
  // It looks for either '?jquery=VERSION' or '&jquery=VERSION'.
  const versionExtractionRegex = new RegExp(`[?&]${versionQueryParameterName}=([^&]+)`);

  // Execute the regex against the URL query string to find a match.
  const queryMatchResult = versionExtractionRegex.exec(currentUrlQueryParameters);

  // --- Conditional Script Source Determination ---
  // Check if the query parameter was found and if it contains a value.
  if (queryMatchResult && queryMatchResult[1]) {
    // Extract the specified version string from the regex match.
    const requestedJQueryVersion = queryMatchResult[1];
    // Update the script source to the CDN URL using the extracted version.
    resolvedScriptSource = composeCdnResourceLink(requestedJQueryVersion);
    globalContext.console.log(`Detected jQuery version '${requestedJQueryVersion}' in URL. Loading from CDN.`);
  } else {
    // If no specific version was requested, inform the developer via console.
    globalContext.console.info("No explicit jQuery version specified via URL query. Utilizing local library version.");
  }

  // --- Dynamic Script Injection ---
  // Implement a robust guard clause to ensure 'document' and 'document.write' are available.
  // This prevents errors in non-browser environments or if the DOM isn't ready for 'document.write'.
  if (typeof globalContext.document !== 'undefined' && typeof globalContext.document.write === 'function') {
    // Construct the HTML script tag using the determined source URL.
    const scriptElementHtml = `<script src="${resolvedScriptSource}"></script>`;

    // Log the final script URL that will be injected for verification.
    globalContext.console.debug(`Attempting to inject script tag: ${scriptElementHtml}`);

    // Insert the script tag directly into the document stream.
    // While often discouraged for modern DOM manipulation, this method
    // directly mirrors the original code's approach.
    globalContext.document.write(scriptElementHtml);
  } else {
    // Log an error if script injection cannot proceed due to missing DOM capabilities.
    globalContext.console.error("Critical error: Cannot inject jQuery script. 'document.write' is not accessible in the current environment.");
  }

})(window); // The 'window' object is passed as 'globalContext' for explicit access and testability.