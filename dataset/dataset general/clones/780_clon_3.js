/**
 * Viewport Responsiveness Manager
 * A robust utility for tracking and reacting to viewport size changes,
 * including CSS media queries and custom JavaScript-defined breakpoints.
 *
 * This module provides a flexible mechanism to detect and respond to
 * changes in the browser viewport, supporting both CSS-driven responsive
 * tags and custom JavaScript-defined width ranges. It dispatches events
 * upon mode changes and offers methods to query viewport dimensions.
 *
 * @author Responsive Dev Team
 * @license MIT
 * @version 2.1.0
 * @date 2024-03-10
 */
const viewportMonitor = ((win, doc, jq) => {

    // =========================
    // Internal Configuration & State Variables

    let _activeViewMode = null; // The currently active viewport mode identifier (e.g., "small", "tabletRule")
    let _previousViewMode = null; // The previously active viewport mode identifier
    const _customRuleSet = new Map(); // Stores custom JS-defined breakpoint rules (Map<string, {min: string|number, max: string|number}>)
    let _measurementProbe = null; // A hidden DOM element used for accurate size calculations (e.g., em/rem unit conversion)
    let _fontUnitCheckInterval = 600; // Time in milliseconds between checks for root font size changes (was 500ms)
    let _fontCheckTimerId = null; // The ID of the interval timer used for font size monitoring
    let _lastKnownFontHeight = null; // Stores the pixel height of 1em from the _measurementProbe for font size change detection
    let _cssViewModeTags = ["small", "medium", "large", "extra-large"]; // Default CSS-based tag values used for body classes
    let _isInitialized = false; // Flag to ensure the module's initialization logic runs only once
    let _windowResizeTimeout = null; // Timer ID for debouncing window resize events
    const _resizeDebounceDelay = 150; // Delay in milliseconds for debouncing resize events (new addition)

    // =========================
    // CORE INITIALIZATION

    /**
     * The primary entry point for the module. This function sets up all necessary
     * event listeners, initializes the DOM measurement probe, and establishes the
     * initial viewport state once the document is fully loaded.
     *
     * @method initializeModule
     * @returns {void}
     */
    const initializeModule = () => {
        if (!jq || typeof jq !== 'function' || typeof jq.fn === 'undefined') {
            console.error("ViewportMonitor: jQuery is required but not found or not correctly loaded. Module will not function.");
            return;
        }

        if (_isInitialized) { // Guard clause to prevent re-initialization
            console.warn("ViewportMonitor: Module already initialized. Skipping.");
            return;
        }

        // Wait for the DOM to be fully ready before proceeding with setup
        jq(doc).ready(() => {
            setupMeasurementElement(); // Create and append the hidden DOM probe
            if (!_measurementProbe) { // Verify the probe was successfully created
                console.error("ViewportMonitor: Failed to create measurement probe. Aborting initialization.");
                return;
            }

            // Attach a debounced handler for window resize events
            jq(win).on("resize", () => {
                clearTimeout(_windowResizeTimeout); // Clear any pending resize timeout
                _windowResizeTimeout = setTimeout(() => {
                    assessViewModes(); // Re-evaluate view modes after resize
                    notifyRedraw(); // Trigger a redraw notification
                }, _resizeDebounceDelay);
            });

            // Begin monitoring for changes in the root font size, which can affect layout
            _lastKnownFontHeight = getCalculatedHeight(); // Capture initial 1em height
            beginFontMonitoring();

            // Perform an initial assessment of the viewport to set the starting view mode
            assessViewModes();

            // Dispatch an initial redraw event now that the module is fully set up
            notifyRedraw();
            _isInitialized = true; // Mark the module as initialized
            console.log("ViewportMonitor: Module initialized successfully.");
        });
    };

    // =========================
    // UTILITY METHODS

    /**
     * Triggers a custom global event (`viewport:redraw`) to notify other components
     * that a significant layout change or redraw might be necessary.
     *
     * @method notifyRedraw
     * @returns {void}
     */
    const notifyRedraw = () => {
        jq(win).trigger("viewport:redraw");
    };

    /**
     * The central method for determining and updating the active viewport mode.
     * It prioritizes custom JavaScript-defined rules over CSS media query tags.
     * If a change is detected, it updates body classes and dispatches events.
     *
     * @method assessViewModes
     * @returns {void}
     */
    const assessViewModes = () => {
        let detectedMode = null;
        const hasCustomRules = _customRuleSet.size > 0; // Check if any custom rules are defined

        if (hasCustomRules) {
            detectedMode = evaluateCustomRules(); // Use custom rules if present
        } else {
            detectedMode = evaluateMediaQueries(); // Otherwise, rely on CSS media queries
        }

        // Only proceed if the detected mode is different from the currently active mode
        if (detectedMode !== _activeViewMode) {
            _previousViewMode = _activeViewMode; // Store the old mode
            _activeViewMode = detectedMode; // Set the new mode
            updateBodyClasses(); // Update CSS classes on the body element
            dispatchViewModeChange(); // Dispatch custom events for the mode change
        }
    };

    /**
     * Iterates through all defined custom JavaScript rules and returns the name
     * of the first rule that currently matches the viewport's width.
     *
     * @method evaluateCustomRules
     * @returns {string|null} The name of the matching custom rule, or `null` if none match.
     */
    const evaluateCustomRules = () => {
        let matchingRule = null;
        const currentWindowWidth = getWindowWidth(); // Cache window width for efficiency during iteration

        // Iterate over custom rules using Map.entries()
        for (const [ruleName, ruleDef] of _customRuleSet.entries()) {
            if (testCustomRule(ruleName, currentWindowWidth)) {
                matchingRule = ruleName;
                break; // Found a match, no need to check further
            }
        }
        return matchingRule;
    };

    /**
     * Retrieves the active responsive tag defined by CSS media queries.
     * This is typically done by reading the `content` property of an `:after` pseudo-element
     * on the `body` element, which CSS media queries can dynamically update.
     *
     * @method evaluateMediaQueries
     * @returns {string} The active media query tag (e.g., "small", "medium"), or "default" if none match or an error occurs.
     */
    const evaluateMediaQueries = () => {
        const tag = getMediaQueryTag(); // Get the tag from CSS
        // Validate the retrieved tag against the configured list of known tags
        if (tag && tag.length > 0 && _cssViewModeTags.includes(tag)) {
            return tag;
        }
        // If no valid or recognized tag is found, return "default" as a fallback
        return "default";
    };

    /**
     * Dispatches a series of custom events to notify about a change in the viewport mode.
     * Events include: `mode:enter:[modeName]`, `mode:exit:[modeName]`, and `viewport:change`.
     * It also updates a `data-current-viewmode` attribute on the `body` element.
     *
     * @method dispatchViewModeChange
     * @returns {void}
     */
    const dispatchViewModeChange = () => {
        if (_activeViewMode) {
            jq(win).trigger(`mode:enter:${_activeViewMode}`); // Event for entering the new mode
            doc.body.setAttribute('data-current-viewmode', _activeViewMode); // Update data attribute for direct CSS/JS access
        } else {
            doc.body.removeAttribute('data-current-viewmode'); // Remove attribute if no mode is active
        }
        if (_previousViewMode) {
            jq(win).trigger(`mode:exit:${_previousViewMode}`); // Event for exiting the previous mode
        }
        // General event for any viewport mode change, providing both current and previous modes
        jq(win).trigger("viewport:change", [_activeViewMode, _previousViewMode]);
        console.log(`ViewportMonitor: Mode changed from '${_previousViewMode || 'none'}' to '${_activeViewMode || 'none'}'.`); // Debugging log
    };

    /**
     * Manages the CSS classes on the `body` element. It removes all potential
     * view mode classes and then applies the class corresponding to the currently
     * active view mode. If no mode is active, it applies a "no-active-mode" class.
     *
     * @method updateBodyClasses
     * @returns {void}
     */
    const updateBodyClasses = () => {
        // Compile a comprehensive list of all possible classes that might be applied
        const allPossibleClasses = new Set(_cssViewModeTags); // Start with configured CSS tags
        for (const ruleName of _customRuleSet.keys()) {
            allPossibleClasses.add(ruleName); // Add all custom rule names
        }
        allPossibleClasses.add("no-active-mode"); // Include the fallback class

        // Convert the Set to a space-separated string for `removeClass`
        const classesToRemove = Array.from(allPossibleClasses).join(' ');

        jq("body").removeClass(classesToRemove); // Remove all potential mode classes

        if (_activeViewMode) {
            jq("body").addClass(_activeViewMode); // Apply the class for the current active mode
        } else {
            jq("body").addClass("no-active-mode"); // Apply fallback class if no specific mode is active
        }
    };

    /**
     * Starts an interval timer that periodically calls `checkFontSizeChange`
     * to detect if the root font size (1em) has been altered, which can imply
     * a responsive layout shift.
     *
     * @method beginFontMonitoring
     * @returns {void}
     */
    const beginFontMonitoring = () => {
        if (_fontCheckTimerId) { // Prevent starting multiple timers
            console.warn("ViewportMonitor: Font monitoring already active. Skipping.");
            return;
        }
        _fontCheckTimerId = setInterval(checkFontSizeChange, _fontUnitCheckInterval);
        console.log(`ViewportMonitor: Started font size monitoring every ${_fontUnitCheckInterval}ms.`);
    };

    /**
     * Stops the interval timer responsible for monitoring font size changes.
     *
     * @method endFontMonitoring
     * @returns {void}
     */
    const endFontMonitoring = () => {
        if (_fontCheckTimerId) {
            clearInterval(_fontCheckTimerId);
            _fontCheckTimerId = null;
            console.log("ViewportMonitor: Stopped font size monitoring.");
        }
    };

    /**
     * Compares the current pixel height of '1em' (obtained from the measurement probe)
     * with the last known height. If they differ, it means the font size has changed,
     * triggering a re-assessment of view modes.
     *
     * @method checkFontSizeChange
     * @returns {void}
     */
    const checkFontSizeChange = () => {
        const currentFontHeight = getCalculatedHeight();
        // Only trigger a re-assessment if the height is valid and has changed
        if (currentFontHeight > 0 && currentFontHeight !== _lastKnownFontHeight) {
            console.log("ViewportMonitor: Detected font size change. Re-assessing view modes.");
            _lastKnownFontHeight = currentFontHeight;
            assessViewModes();
        }
    };

    /**
     * Returns the identifier of the currently active viewport mode.
     *
     * @method getCurrentViewMode
     * @returns {string|null} The name of the active mode, or `null` if none is active.
     */
    const getCurrentViewMode = () => {
        return _activeViewMode;
    };

    /**
     * Creates and appends a hidden `div` element to the `body`. This element
     * acts as a "measurement probe" to accurately determine pixel values for
     * CSS units like `em`, `rem`, or percentages, independent of other styles.
     *
     * @method setupMeasurementElement
     * @returns {void}
     */
    const setupMeasurementElement = () => {
        if (_measurementProbe) return; // Prevent recreation if already exists

        _measurementProbe = jq('<div></div>'); // Create a div using jQuery
        _measurementProbe.attr('data-viewport-monitor-probe', 'true'); // Add a descriptive data attribute
        _measurementProbe.css({
            position: "absolute",
            visibility: "hidden", // Keep it visually hidden
            fontSize: "1em",
            lineHeight: "1", // Ensure consistent height calculation for 1em
            height: "1em",
            width: "1em",
            padding: 0,
            margin: 0,
            top: "-9999px", // Position far off-screen to avoid any layout influence
            left: "-9999px"
        });

        const bodyElement = jq("body");
        if (bodyElement.length) {
            bodyElement.append(_measurementProbe); // Append to body
            console.log("ViewportMonitor: Measurement probe created and appended.");
        } else {
            console.error("ViewportMonitor: Body element not found in DOM. Cannot create measurement probe.");
            _measurementProbe = null; // Mark creation as failed
        }
    };

    /**
     * Resets the width property of the measurement probe to `auto`.
     * This is crucial after using it to measure specific widths, to ensure
     * subsequent measurements are accurate.
     *
     * @method resetMeasurementElementWidth
     * @returns {void}
     */
    const resetMeasurementElementWidth = () => {
        if (_measurementProbe) {
            _measurementProbe.css({ width: "auto" });
        }
    };

    /**
     * Temporarily sets the measurement probe's width to a given CSS value
     * (e.g., "600px", "30em", "50%") and then returns its computed pixel width.
     * The probe's width is reset afterwards.
     *
     * @method getCalculatedWidth
     * @param {string|number} cssWidthValue - The CSS width value to measure.
     * @returns {number} The calculated width in pixels. Returns 0 if the probe is unavailable.
     */
    const getCalculatedWidth = (cssWidthValue) => {
        if (!_measurementProbe) {
            console.warn("ViewportMonitor: Measurement probe not available for width calculation.");
            return 0;
        }

        _measurementProbe.css({ width: cssWidthValue }); // Set the width to be measured
        const pixelWidth = _measurementProbe.outerWidth(); // Get the computed pixel width
        resetMeasurementElementWidth(); // Reset the probe's width immediately
        return pixelWidth;
    };

    /**
     * Returns the computed pixel height of the measurement probe.
     * This is typically used to determine the pixel value of '1em'.
     *
     * @method getCalculatedHeight
     * @returns {number} The height in pixels. Returns 0 if the probe is unavailable.
     */
    const getCalculatedHeight = () => {
        if (!_measurementProbe) {
            console.warn("ViewportMonitor: Measurement probe not available for height calculation.");
            return 0;
        }
        return _measurementProbe.outerHeight();
    };

    /**
     * Attempts to retrieve the current responsive tag by reading the `content`
     * property of the `::after` pseudo-element on the `body`. This is a common
     * technique for JavaScript to read active CSS media query states.
     *
     * @method getMediaQueryTag
     * @returns {string} The active media query tag (e.g., "small"), or "default" if
     *                   `getComputedStyle` is not available, an error occurs, or no
     *                   valid tag is returned by CSS.
     */
    const getMediaQueryTag = () => {
        try {
            // Check for necessary browser APIs and DOM readiness
            if (!win.getComputedStyle || !doc.body) {
                console.warn("ViewportMonitor: `window.getComputedStyle` or `document.body` not available. Returning 'default'.");
                return "default";
            }
            const computedStyle = win.getComputedStyle(doc.body, ':after');
            let tag = computedStyle.getPropertyValue('content');
            tag = tag.replace(/"/g, '').trim(); // Remove quotes (Firefox bugfix) and trim whitespace

            // If the content is 'none' or empty, it typically means no media query matched
            if (tag === 'none' || tag === '') {
                return "default";
            }
            return tag;
        } catch (e) {
            console.error("ViewportMonitor: Error retrieving media query tag from CSS:", e);
            return "default"; // Fallback in case of any runtime error
        }
    };

    /**
     * Configures the array of CSS class names that represent the different
     * responsive tags. These tags are used when managing classes on the `body` element.
     *
     * @method configureMediaQueryTags
     * @param {string[]} tagsArray - An array of strings, where each string is a CSS class name.
     * @returns {void}
     */
    const configureMediaQueryTags = (tagsArray) => {
        if (!Array.isArray(tagsArray) || tagsArray.some(t => typeof t !== 'string' || t.trim() === '')) {
            console.warn("ViewportMonitor: Invalid input for `configureMediaQueryTags`. Must be an array of non-empty strings.");
            return;
        }
        _cssViewModeTags = tagsArray;
        console.log("ViewportMonitor: Media query tags configured:", _cssViewModeTags);
    };

    /**
     * Returns the current height of the browser's viewport.
     *
     * @method getWindowHeight
     * @returns {number} The window height in pixels.
     */
    const getWindowHeight = () => {
        return jq(win).height();
    };

    /**
     * Returns the current width of the browser's viewport.
     *
     * @method getWindowWidth
     * @returns {number} The window width in pixels.
     */
    const getWindowWidth = () => {
        return jq(win).width();
    };

    /**
     * Removes all custom script-defined breakpoint rules that have been added.
     *
     * @method clearCustomRules
     * @returns {void}
     */
    const clearCustomRules = () => {
        _customRuleSet.clear(); // Utilize Map's clear method
        console.log("ViewportMonitor: All custom rules cleared.");
    };

    /**
     * Adds a new custom script-defined breakpoint rule to the monitor.
     * These rules take precedence over CSS media query tags when active.
     *
     * @method defineCustomRule
     * @param {string} name - A unique identifier for this breakpoint rule.
     * @param {string|number} [minWidth=0] - The minimum width for this rule to be active
     *                                       (e.g., "600px", "30em", 768). Defaults to 0.
     * @param {string|number} [maxWidth=99999999] - The maximum width for this rule to be active.
     *                                        Defaults to a very large number.
     * @returns {void}
     */
    const defineCustomRule = (name, minWidth = 0, maxWidth = 99999999) => {
        if (typeof name !== 'string' || name.trim() === '') {
            console.warn("ViewportMonitor: Custom rule name must be a non-empty string.");
            return;
        }
        if (_customRuleSet.has(name)) {
            console.warn(`ViewportMonitor: Overwriting existing custom rule: '${name}'.`);
        }

        // Store the rule definition. The min/max values will be parsed to pixels when `testCustomRule` is called.
        _customRuleSet.set(name, {
            min: minWidth,
            max: maxWidth
        });
        console.log(`ViewportMonitor: Custom rule '${name}' added: min=${minWidth}, max=${maxWidth}.`);
    };

    /**
     * Removes a specific custom script-defined breakpoint rule by its name.
     *
     * @method deleteCustomRule
     * @param {string} name - The name of the custom rule to remove.
     * @returns {void}
     */
    const deleteCustomRule = (name) => {
        if (_customRuleSet.delete(name)) { // Utilize Map's delete method and check its return value
            console.log(`ViewportMonitor: Custom rule '${name}' removed.`);
        } else {
            console.warn(`ViewportMonitor: Custom rule '${name}' not found for removal. No action taken.`);
        }
    };

    /**
     * Returns the total number of custom script-defined breakpoint rules currently configured.
     *
     * @method countCustomRules
     * @returns {number} The count of custom rules.
     */
    const countCustomRules = () => {
        return _customRuleSet.size; // Utilize Map's size property
    };

    /**
     * Tests whether a specific custom script-defined breakpoint rule is currently active
     * based on the current viewport width.
     *
     * @method testCustomRule
     * @param {string} ruleName - The name of the custom rule to test.
     * @param {number|null} [currentWindowWidth=null] - Optional: A pre-calculated window width
     *                                                  to use for efficiency. If `null`, it will
     *                                                  call `getWindowWidth()`.
     * @returns {boolean} `true` if the rule is active, `false` otherwise.
     */
    const testCustomRule = (ruleName, currentWindowWidth = null) => {
        const ruleDefinition = _customRuleSet.get(ruleName);
        if (!ruleDefinition) {
            console.warn(`ViewportMonitor: Attempted to test non-existent rule: '${ruleName}'.`);
            return false;
        }

        // Convert min and max values to pixels using the measurement probe
        const minPx = getCalculatedWidth(ruleDefinition.min);
        const maxPx = getCalculatedWidth(ruleDefinition.max);
        // Use the provided width or get the current window width
        const actualWidth = currentWindowWidth !== null ? currentWindowWidth : getWindowWidth();

        return (actualWidth >= minPx && actualWidth <= maxPx);
    };

    /**
     * Provides a more robust and cross-browser compatible method to get the
     * true width and height of the viewport, accounting for various browser
     * quirks and standards.
     *
     * @method getViewportDimensions
     * @returns {{width: number, height: number}} An object containing the viewport's
     *                                            `width` and `height` in pixels.
     */
    const getViewportDimensions = () => {
        let viewWidth, viewHeight;

        // Prioritize `window.innerWidth/innerHeight` for modern browsers
        if (typeof win.innerWidth !== 'undefined') {
            viewWidth = win.innerWidth;
            viewHeight = win.innerHeight;
        }
        // Fallback for IE (standards mode)
        else if (doc.documentElement && typeof doc.documentElement.clientWidth !== 'undefined' && doc.documentElement.clientWidth !== 0) {
            viewWidth = doc.documentElement.clientWidth;
            viewHeight = doc.documentElement.clientHeight;
        }
        // Last resort fallback for older browsers or unusual environments
        else {
            viewWidth = doc.body.clientWidth;
            viewHeight = doc.body.clientHeight;
        }
        return { width: viewWidth, height: viewHeight };
    };

    /**
     * Cleans up all resources used by the module, including removing event listeners,
     * clearing timers, removing the measurement probe from the DOM, and resetting
     * body classes. This effectively "uninitializes" the module.
     *
     * @method destroy
     * @returns {void}
     */
    const destroy = () => {
        endFontMonitoring(); // Stop font size checks
        clearTimeout(_windowResizeTimeout); // Clear any pending resize debounce
        jq(win).off("resize"); // Remove window resize listener
        // Remove all custom events dispatched by this module
        jq(win).off("viewport:redraw viewport:change mode:enter:* mode:exit:*");

        if (_measurementProbe) {
            _measurementProbe.remove(); // Remove the probe element from the DOM
            _measurementProbe = null;
        }

        // Remove all possible viewport-related classes from the body
        const classesToClean = Array.from(new Set([..._cssViewModeTags, ..._customRuleSet.keys(), "no-active-mode"])).join(' ');
        jq("body").removeClass(classesToClean);
        doc.body.removeAttribute('data-current-viewmode'); // Remove data attribute

        _isInitialized = false; // Reset initialization flag
        _activeViewMode = null;
        _previousViewMode = null;
        _customRuleSet.clear(); // Clear all custom rules

        console.log("ViewportMonitor: Module destroyed and resources cleaned up.");
    };


    // =========================
    // Public API - Exposed methods for external interaction
    const api = {
        assessViewModes: assessViewModes,
        configureMediaQueryTags: configureMediaQueryTags,
        defineCustomRule: defineCustomRule,
        deleteCustomRule: deleteCustomRule,
        getCurrentViewMode: getCurrentViewMode,
        getWindowHeight: getWindowHeight,
        getWindowWidth: getWindowWidth,
        getViewportDimensions: getViewportDimensions,
        clearCustomRules: clearCustomRules,
        destroy: destroy // Expose the destroy method for manual cleanup
    };

    // Auto-initialize the module when this script is executed
    initializeModule();

    return api; // Return the public API
})(this, this.document, this.jQuery); // Pass global objects: window, document, and jQuery