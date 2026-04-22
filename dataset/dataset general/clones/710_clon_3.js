(function(applicationContext, $lib) {

    // A module for enhancing intra-page navigation with smooth scrolling.
    // This script identifies anchor links pointing to elements within the same document
    // and overrides their default jump behavior with a fluid animation.

    // --- Input Validation: Ensure Core Dependencies Are Present ---
    if (typeof $lib === 'undefined') {
        console.error("SmoothAnchorNavigator: jQuery library not detected. Module functionality is disabled.");
        return; // Halt execution if jQuery is unavailable.
    }

    // --- Configuration Parameters ---
    const navigationSettings = {
        animationDuration: 700, // Time in milliseconds for the scroll animation.
        animationEasing: 'easeInOutQuad' // jQuery UI easing, or 'swing'/'linear' if UI is not loaded.
                                         // Using 'swing' for broader compatibility if jQuery UI isn't guaranteed.
    };

    // --- Utility Function: Path Normalization ---
    /**
     * Standardizes a given URL path for reliable comparison.
     * Removes common prefixes/suffixes and default filenames.
     * @param {string | undefined | null} rawInputPath - The path string to process.
     * @returns {string} A cleaned, comparable version of the path.
     */
    function processPathForComparison(rawInputPath) {
        if (!rawInputPath || typeof rawInputPath !== 'string') {
            // Guard against invalid or missing path inputs.
            return '';
        }

        let cleanedPath = rawInputPath;

        // Remove any leading forward slash.
        cleanedPath = cleanedPath.replace(/^\//, '');

        // Erase common default document names (e.g., index.html, default.asp)
        // This regex is expanded to cover more common server defaults.
        cleanedPath = cleanedPath.replace(/(index|default|home|main)\.(html|htm|php|asp|aspx|jsp|xhtml){1,5}$/i, '');

        // Remove any trailing forward slash.
        cleanedPath = cleanedPath.replace(/\/$/, '');

        return cleanedPath;
    }

    // --- Document Ready Handler ---
    // Execute the main logic once the entire DOM is loaded.
    $lib(function() {
        // Cache the normalized path of the current document for efficient comparisons.
        const currentDocumentPathNormalized = processPathForComparison(applicationContext.location.pathname);

        // Identify the element responsible for page scrolling (e.g., <html> or <body>).
        // This handles cross-browser differences in scroll container identification.
        const primaryPageScroller = discoverScrollHost(['html', 'body']);

        // --- Main Logic: Process Anchor Links ---
        // Iterate over all anchor tags whose 'href' attribute contains a hash symbol.
        $lib('a[href*="#"]').each(function(index, anchorElement) {
            const currentAnchor = $lib(anchorElement);

            // Normalize the path of the link's target, defaulting to current path if none specified.
            const linkTargetNormalizedPath = processPathForComparison(this.pathname || '');

            // Extract the raw hash fragment (e.g., "#mySection").
            const rawHashFragment = this.hash;

            // --- Guard Clause: Validate Link as Same-Page Anchor ---
            // A link is considered a same-page anchor if:
            // 1. Its normalized path matches the current document's normalized path.
            // 2. Its hostname matches the current document's hostname, or it's a relative link (no hostname specified).
            // 3. It possesses a non-empty hash fragment after removing the '#' prefix.
            const targetIdFromHash = rawHashFragment ? rawHashFragment.substring(1) : '';

            if (currentDocumentPathNormalized !== linkTargetNormalizedPath ||
                (applicationContext.location.hostname !== this.hostname && !!this.hostname) ||
                !targetIdFromHash)
            {
                // If any of the conditions fail, this is not a valid same-page anchor link for smooth scrolling.
                return true; // Continue to the next anchor element in the loop.
            }

            // Attempt to locate the target element in the DOM using its ID.
            const targetElementSelector = '#' + targetIdFromHash;
            const targetDomElement = $lib(targetElementSelector);

            // --- Guard Clause: Ensure Target Element Exists ---
            if (!targetDomElement.length) {
                // If the target element specified by the hash is not found, skip this link.
                // console.info(`SmoothAnchorNavigator: Target element '${targetElementSelector}' not found for link.`, anchorElement);
                return true; // Proceed to the next link.
            }

            // Determine the vertical scroll position of the target element.
            const destinationScrollOffset = targetDomElement.offset().top;

            // --- Event Handler: Attach Click Behavior ---
            currentAnchor.on('click', function(clickEvent) {
                // Prevent the browser's default immediate jump to the anchor.
                clickEvent.preventDefault();

                // Initiate the smooth scroll animation.
                // .stop(true, true) ensures any previous animations are halted and completed instantly
                // before a new one starts, preventing animation queue buildup.
                try {
                    $lib(primaryPageScroller).stop(true, true).animate(
                        {
                            scrollTop: destinationScrollOffset
                        },
                        navigationSettings.animationDuration,
                        navigationSettings.animationEasing,
                        function() {
                            // --- Callback after Animation Completion ---
                            // Update the URL hash to reflect the new position, allowing for direct linking.
                            applicationContext.location.hash = rawHashFragment;

                            // Optional: Enhance accessibility by setting focus to the scrolled-to element.
                            // This ensures keyboard navigation users land correctly.
                            if (!targetDomElement.is(":focus")) {
                                targetDomElement.attr('tabindex', '-1').focus(); // Make focusable if not already.
                            }
                        }
                    );
                } catch (animationExecutionError) {
                    // Log any errors during animation and fall back to instant jump.
                    console.error("SmoothAnchorNavigator: Error during scroll animation. Falling back to direct jump.", animationExecutionError);
                    applicationContext.location.hash = rawHashFragment;
                }
            });
        });

        /**
         * Identifies the primary scrollable element on the page from a list of candidates.
         * Uses a heuristic to determine if an element can be scrolled.
         * @param {string[]} potentialScrollElements - An array of CSS selectors (e.g., ['html', 'body']).
         * @returns {string} The CSS selector of the determined scrollable element, or 'body' as a fallback.
         */
        function discoverScrollHost(potentialScrollElements) {
            if (!Array.isArray(potentialScrollElements) || potentialScrollElements.length === 0) {
                // Return a sensible default if no candidates are provided.
                console.warn("SmoothAnchorNavigator: No scroll host candidates provided. Defaulting to 'body'.");
                return 'body';
            }

            for (let iterator = 0; iterator < potentialScrollElements.length; iterator++) {
                const currentCandidateSelector = potentialScrollElements[iterator];
                const candidateJqObject = $lib(currentCandidateSelector);

                // Ensure the element exists in the DOM.
                if (!candidateJqObject.length) {
                    continue; // Skip to the next candidate if not found.
                }

                // Heuristic: Attempt to scroll by 1 pixel and check if the scroll position changes.
                // This is a robust way to detect scrollability across browsers.
                const initialScrollPosition = candidateJqObject.scrollTop();
                candidateJqObject.scrollTop(initialScrollPosition + 1); // Try to scroll down slightly.

                const isScrollable = candidateJqObject.scrollTop() > initialScrollPosition;
                candidateJqObject.scrollTop(initialScrollPosition); // Reset scroll position.

                if (isScrollable) {
                    return currentCandidateSelector; // Found a scrollable element.
                }
            }

            // If no scrollable element is explicitly detected, assume 'body' is the scroll host.
            // This is a common and safe fallback.
            return 'body';
        }

    }); // End of jQuery(document).ready()

})(window, window.jQuery); // Pass window and jQuery as arguments to the IIFE.