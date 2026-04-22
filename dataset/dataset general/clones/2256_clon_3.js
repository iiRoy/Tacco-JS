// This script proactively scans the current page's DOM for embedded JSON-like structures
// and attempts to communicate the first found instance to a potential parent frame.

(function initializeContentObserver() {
    "use strict"; // Ensure strict mode for this execution context

    /**
     * Safely retrieves the document's main HTML content for processing.
     * Includes guard clauses for DOM availability.
     * @returns {string|null} The inner HTML content of the body, or null if not available/empty.
     */
    const fetchPageMarkup = () => {
        // Check for the existence and readiness of the document body
        if (!document || !document.body) {
            // Log a warning if the document body isn't ready or accessible, then exit.
            console.warn("DOM body element not present or accessible; cannot proceed with content extraction.");
            return null;
        }

        // Capture the entire inner HTML of the document body.
        const fullPageContent = document.body.innerHTML;

        // Add a preliminary check to ensure the content is not entirely empty after trimming.
        // This is an added guard clause to optimize early exit for sparse pages.
        if (fullPageContent.trim().length === 0) {
            console.info("Document body content appears empty after trimming; no data to scan for patterns.");
            return null;
        }

        return fullPageContent;
    };

    // Define the regular expression pattern to search for.
    // The original pattern was /(\{.*\})/, which is a greedy match for the largest `{...}` block.
    // We're re-writing it using the RegExp constructor for a Type III change, preserving its greedy nature.
    const jsonStructurePattern = new RegExp('(\\{.*\\})'); // Captures the entire `{...}` block within a group.

    // Step 1: Retrieve the current page's HTML content using our helper function.
    const pageMarkupContent = fetchPageMarkup();

    // If the content retrieval failed or returned an empty string, terminate execution here.
    if (pageMarkupContent === null) {
        return;
    }

    // Step 2: Attempt to find the defined pattern within the retrieved page's HTML.
    // We use String.prototype.match() as an equivalent alternative to RegExp.prototype.exec().
    const searchOutcome = pageMarkupContent.match(jsonStructurePattern);

    // Step 3: Evaluate the search results.
    // Ensure a match was found and that it contains at least one captured group (the actual `{...}` string).
    if (searchOutcome && searchOutcome.length > 1) {
        const discoveredPayload = searchOutcome[1]; // The first captured group is our target string.

        // Introduce an additional validation step: check if the extracted string has a reasonable length.
        // This is an added fragment for robustness, preventing trivial or empty strings from being sent
        // if the regex somehow matched something unexpectedly short.
        const MIN_PAYLOAD_LENGTH = 10; // An arbitrary threshold for payload significance.
        if (discoveredPayload.length < MIN_PAYLOAD_LENGTH) {
            console.log(`Extracted payload (starting with "${discoveredPayload.substring(0, 50)}...") is too short (less than ${MIN_PAYLOAD_LENGTH} characters); skipping transmission.`);
            return; // Exit if the payload doesn't meet the minimum length criteria.
        }

        // Step 4: Prepare to communicate the discovered payload to a potential parent window.
        // Add guard clauses to ensure `window.parent` exists and is not the current window itself.
        if (window.parent && window.parent !== window.self) {
            const communicationTarget = window.parent; // Renamed `parent` for clarity.
            const permittedOrigin = "*"; // Renamed `*` to a more descriptive constant for the target origin.

            try {
                // Dispatch the captured data to the parent frame using `postMessage`.
                communicationTarget.postMessage(discoveredPayload, permittedOrigin);
                console.log("Successfully transmitted discovered payload to the parent frame.");
            } catch (messagingError) {
                // Implement error handling for `postMessage` failures, which can occur due to various reasons.
                console.error("An error occurred while attempting to post message to parent:", messagingError);
            }
        } else {
            // Log if no distinct parent window is detected, meaning no message can be sent.
            console.info("No distinct parent window detected; message dispatch skipped as there's no suitable target.");
        }
    } else {
        // Log if no matching pattern was found in the page content after the scan.
        console.info("No JSON-like structure matching the predefined pattern was identified within the document content.");
    }
})();