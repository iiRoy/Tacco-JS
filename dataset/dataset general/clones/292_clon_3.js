var ResponsiveStyleManager = (function() {

    // Internal configuration and state for the style adjustment system.
    var _state = {
        styleLinkElement: null, // Reference to the dynamically created <link> element.
        options: {
            sizeThresholds: {
                // Mapping of viewport width (key) to CSS file name (value).
                // These will be processed into a sorted array internally.
                1150: "layout-large.css",
                1550: "layout-extra-large.css",
                830: "layout-medium.css",
                600: "layout-small.css" // Added a new breakpoint for finer control.
            },
            defaultCssFile: "layout-base.css", // The stylesheet applied if no breakpoint matches.
            styleSheetDirectory: "/assets/css/responsive-styles/", // Base path for CSS files.
            resizeDebounceDelay: 120 // Milliseconds to wait before processing resize events.
        },
        currentActiveWidth: null, // Stores the last calculated viewport width.
        systemInitialized: false, // Flag to ensure setup runs only once.
        resizeDebounceTimer: null // Timer ID for debounce mechanism.
    };

    // --- Internal Utility Functions ---

    /**
     * Transforms and sorts the raw size thresholds into an ordered array of objects.
     * This makes iteration and lookup more efficient.
     * @param {Object} rawThresholds - The input object like { "1150": "file.css" }.
     * @returns {Array<Object>} A sorted array, e.g., [{ value: 600, file: "file.css" }, ...].
     */
    function _prepareThresholdsForProcessing(rawThresholds) {
        var processedList = [];
        for (var widthKeyString in rawThresholds) {
            if (Object.prototype.hasOwnProperty.call(rawThresholds, widthKeyString)) {
                var numericWidth = parseInt(widthKeyString, 10);
                if (!isNaN(numericWidth)) {
                    processedList.push({
                        value: numericWidth,
                        stylesheet: rawThresholds[widthKeyString]
                    });
                }
            }
        }

        // Sort the list numerically by the 'value' (width) in ascending order.
        processedList.sort(function(a, b) {
            return a.value - b.value;
        });

        return processedList;
    }

    /**
     * Locates an existing <link> element by a specific ID, or creates a new one.
     * Appends the new link element to the document's <head>.
     * @returns {HTMLLinkElement|null} The style link element, or null if creation failed.
     */
    function _obtainOrCreateStyleLinkElement() {
        var designatedLinkId = "responsive-layout-css"; // Unique ID for the link element.
        var existingLink = document.getElementById(designatedLinkId);

        if (existingLink) {
            return existingLink;
        }

        var newLinkElement = document.createElement("link");
        newLinkElement.setAttribute("id", designatedLinkId);
        newLinkElement.setAttribute("rel", "stylesheet");
        newLinkElement.setAttribute("type", "text/css"); // Explicitly set type.

        // Prefer document.head for appending, fall back to body if head isn't ready.
        var targetParent = document.head || document.getElementsByTagName('head')[0];
        if (targetParent) {
            targetParent.appendChild(newLinkElement);
        } else {
            // Log a warning if the head element is unavailable.
            console.warn("ResponsiveStyleManager: Document <head> not found. Appending style link to <body> as a fallback.");
            document.body.appendChild(newLinkElement);
        }
        return newLinkElement;
    }

    /**
     * Determines the current width of the browser viewport, considering various browser models.
     * @returns {number} The current viewport width in pixels.
     */
    function _calculateCurrentViewportWidth() {
        var calculatedWidth = 0;

        // Modern browsers usually expose window.innerWidth.
        if (typeof window.innerWidth === 'number') {
            calculatedWidth = window.innerWidth;
        }
        // For older IE or standards-compliant mode, check document.documentElement.
        else if (document.documentElement && document.documentElement.clientWidth !== 0) {
            calculatedWidth = document.documentElement.clientWidth;
        }
        // Fallback for very old browsers or quirks mode, using document.body.
        else if (document.body && document.body.clientWidth !== 0) {
            calculatedWidth = document.body.clientWidth;
        }

        // Provide a safety net if width cannot be reliably determined.
        if (calculatedWidth <= 0) {
            console.info("ResponsiveStyleManager: Could not ascertain viewport width, defaulting to 1024px.");
            calculatedWidth = 1024;
        }
        return calculatedWidth;
    }

    /**
     * Updates the 'href' attribute of the style link element if the new stylesheet differs.
     * @param {string} fileName - The name of the CSS file to apply.
     */
    function _updateStyleLinkHref(fileName) {
        var fullPathToStyle = _state.options.styleSheetDirectory + fileName;
        if (_state.styleLinkElement.getAttribute("href") !== fullPathToStyle) {
            _state.styleLinkElement.setAttribute("href", fullPathToStyle);
            // Add a custom data attribute for easier debugging and inspection.
            _state.styleLinkElement.setAttribute("data-applied-style", fileName);
        }
    }

    // --- Core Logic Function ---

    /**
     * The primary function to re-evaluate the viewport width and adjust the active stylesheet.
     */
    function applyResponsiveStyles() {
        // Ensure the style link element is ready before proceeding.
        if (!_state.styleLinkElement) {
            _state.styleLinkElement = _obtainOrCreateStyleLinkElement();
            if (!_state.styleLinkElement) {
                console.error("ResponsiveStyleManager: Failed to initialize style link. Aborting style application.");
                return;
            }
        }

        var currentClientWidth = _calculateCurrentViewportWidth();
        _state.currentActiveWidth = currentClientWidth; // Update internal state.

        var chosenStyleFileName = _state.options.defaultCssFile; // Default to fallback.
        var sortedThresholds = _state.options.sizeThresholds; // This is now the pre-processed array.
        var lowerBoundary = 0; // The lower end of the current breakpoint range.

        // Iterate through the sorted breakpoints to find the first range that contains the current width.
        // The original logic implicitly used 'k' as the upper bound of a range.
        // So, we are looking for the smallest breakpoint 'value' such that currentClientWidth <= 'value',
        // and currentClientWidth >= 'lowerBoundary' (which is the previous breakpoint's 'value').
        for (var i = 0; i < sortedThresholds.length; i++) {
            var thresholdData = sortedThresholds[i];
            if (currentClientWidth >= lowerBoundary && currentClientWidth <= thresholdData.value) {
                chosenStyleFileName = thresholdData.stylesheet;
                break; // Found the appropriate stylesheet, no need to check further.
            }
            lowerBoundary = thresholdData.value; // Set the current threshold as the lower bound for the next iteration.
        }
        // If the loop completes without a match (e.g., width is larger than all breakpoints),
        // chosenStyleFileName will remain the defaultCssFile.

        _updateStyleLinkHref(chosenStyleFileName);
    }

    // --- System Initialization ---

    /**
     * Initializes the responsive style management system, processing breakpoints
     * and setting up the resize event listener.
     */
    function initializeSystem() {
        if (_state.systemInitialized) {
            return; // Prevent re-initialization if already set up.
        }

        // Process and sort the breakpoint definitions once upon initialization.
        _state.options.sizeThresholds = _prepareThresholdsForProcessing(_state.options.sizeThresholds);

        // Perform an initial style application right away.
        applyResponsiveStyles();

        // Set up a debounced event listener for window resizing.
        // This prevents the style recalculation from firing too rapidly during a resize.
        window.addEventListener('resize', function() {
            clearTimeout(_state.resizeDebounceTimer);
            _state.resizeDebounceTimer = setTimeout(applyResponsiveStyles, _state.options.resizeDebounceDelay);
        }, false); // Use capture phase if needed, but false (bubble) is typical.

        _state.systemInitialized = true;
    }

    // Expose a minimal public interface.
    return {
        // Method to start the responsive system.
        start: initializeSystem,
        // Method to manually trigger a style update (e.g., after dynamic content changes).
        refreshStyles: applyResponsiveStyles,
        // Getter for the currently detected viewport width.
        get activeViewportWidth() { return _state.currentActiveWidth; },
        // Getter to retrieve a copy of the current configuration.
        // Using JSON methods for a deep clone to prevent external modification of internal config.
        get currentConfiguration() { return JSON.parse(JSON.stringify(_state.options)); }
    };

})(); // End of the IIFE (Immediately Invoked Function Expression)

// Kick off the responsive style manager when the script loads.
ResponsiveStyleManager.start();