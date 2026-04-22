/*
 *  ContentTransformer.js
 *
 *  A demonstration application for the Markdown-to-HTML conversion library.
 *
 *  Copyright (c) 2007 John Fraser.
 *  Updated and adapted 2023 for modern web practices.
 *
 *  Distributed under an open-source license, similar to BSD.
 *  Consult the accompanying license documentation for details.
 *
 *  Original project source:
 *
 *          A L A T
 *          B C K T
 *          L A A L
 *
 *  <http://www.attacklab.net/>
 *
 */

/*
 *  The core conversion logic resides in `showdown.js`,
 *  which must be loaded prior to this script.
 *
 *  This script relies on specific DOM element IDs and classes
 *  defined in `conversion-tool.html`. While not dependent on
 *  CSS for basic functionality, it directly manipulates the
 *  layout and visibility of interface elements, potentially
 *  overriding stylesheet directives.
 *
 *  Interaction with the `Showdown` library occurs at two key points:
 *
 *  Within `initializeApplication()`:
 *      activeConverter = new Showdown.converter();
 *
 *  Within `performConversion()`:
 *      processedHtml = activeConverter.makeHtml(sourceText);
 *
 *  The remainder of this file is dedicated to user interface management.
 */


// Register the primary setup function to execute when the document is fully loaded.
window.addEventListener('load', initializeApplication);


// Application-wide state and configuration variables.
let activeConverter;
let conversionTimerHandle;
let previousInputContent = '';
let currentInputHash = ''; // A simple hash to detect changes
let currentOutputContent = '';
let uiElements = {}; // Object to hold references to DOM elements
let appConfig = {
    maxUpdateDelayMs: 3500, // Maximum pause before re-rendering (milliseconds)
    pollIntervalMs: 750,    // How often to check for external paste events if no input event
    initialInputText: ''    // Default text for the editor
};
let lastConversionDuration = 0; // Stores the time taken for the last conversion


/**
 * Helper function for basic console logging.
 * @param {string} message - The message to log.
 */
function logEvent(message) {
    if (console && console.log) {
        console.log(`[ContentTransformer] ${message}`);
    }
}


/**
 * Primary initialization routine for the application.
 * This function sets up the user interface, event listeners,
 * and the Markdown conversion engine.
 */
function initializeApplication() {
    logEvent('Application initialization started.');

    // Cache references to key DOM elements for efficiency.
    uiElements.conversionModeSelect = document.getElementById("conversionModeSelector");
    uiElements.triggerConversionButton = document.getElementById("processContentButton");
    uiElements.sourceEditor = document.getElementById("sourceMarkdownInput");
    uiElements.outputDisplay = document.getElementById("htmlPreviewOutput");
    uiElements.timingDisplay = document.getElementById("conversionTimingInfo");
    uiElements.appFooter = document.getElementById("appFooter");

    // Validate that essential elements are found.
    if (!uiElements.sourceEditor || !uiElements.outputDisplay) {
        logEvent('ERROR: Essential UI elements not found. Aborting initialization.');
        return;
    }

    // Attach event handlers using a modern approach.
    uiElements.conversionModeSelect.addEventListener('change', handleModeChange);
    uiElements.triggerConversionButton.addEventListener('click', handleManualConversionRequest);
    window.addEventListener('resize', adjustPanelDimensions);

    // Set up input change detection.
    // The 'input' event is preferred as it captures all changes (typing, paste, drag-drop, etc.).
    uiElements.sourceEditor.addEventListener('input', debounceConversionTrigger, false);

    // Fallback polling for browsers that might not fire 'input' consistently on paste,
    // or for external content changes (less common for textareas).
    // This interval will be cleared if 'paste' event is successfully captured.
    let pastePollingInterval = window.setInterval(() => {
        const currentHash = generateSimpleHash(uiElements.sourceEditor.value);
        if (currentInputHash !== currentHash) {
            currentInputHash = currentHash; // Update hash
            debounceConversionTrigger();
        }
    }, appConfig.pollIntervalMs);

    // Attempt to capture paste events directly.
    uiElements.sourceEditor.addEventListener('paste', () => {
        logEvent('Paste event detected. Disabling polling fallback.');
        if (pastePollingInterval) {
            window.clearInterval(pastePollingInterval);
            pastePollingInterval = null; // Clear the interval reference
        }
        debounceConversionTrigger();
    }, false);

    // Periodically adjust pane heights, useful for dynamic font size changes or browser zoom.
    window.setInterval(adjustPanelDimensions, 200);

    // Check for a 'blank' URL parameter to start with an empty editor.
    if (top.document.location.href.includes('?blank=1')) {
        uiElements.sourceEditor.value = appConfig.initialInputText;
    }

    // Initialize the Markdown converter instance.
    if (typeof Showdown === 'undefined' || typeof Showdown.converter === 'undefined') {
        logEvent('ERROR: Showdown converter library not found. Conversion will not function.');
        return;
    }
    activeConverter = new Showdown.converter();

    // Perform an initial conversion to populate the output pane.
    // This prevents an empty display state at startup.
    performConversion(true);

    // Ensure the input editor has focus on load.
    uiElements.sourceEditor.focus();

    // Reset scroll position for the output pane, as initial content might push it down.
    uiElements.outputDisplay.scrollTop = 0;

    logEvent('Application initialization complete.');
}

/**
 * Generates a simple, non-cryptographic hash for a string.
 * Used to efficiently check if text content has changed.
 * @param {string} str - The input string.
 * @returns {string} A simple hash string.
 */
function generateSimpleHash(str) {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash.toString();
}


/**
 * Executes the Markdown to HTML conversion process.
 * This function retrieves the source text, converts it,
 * and updates the preview display.
 * @param {boolean} force - If true, conversion proceeds even if input hasn't changed.
 */
function performConversion(force = false) {
    const currentText = uiElements.sourceEditor.value;

    // Only proceed if the input text has actually changed, unless forced.
    if (!force && currentText === previousInputContent) {
        logEvent('No change in input content. Skipping conversion.');
        return;
    }

    previousInputContent = currentText; // Update the last known input content

    const conversionStartTime = performance.now(); // Use high-resolution timer

    // The core conversion step.
    const processedHtml = activeConverter.makeHtml(currentText);

    const conversionEndTime = performance.now();
    lastConversionDuration = Math.round(conversionEndTime - conversionStartTime);

    // Update the timing display.
    if (uiElements.timingDisplay) {
        uiElements.timingDisplay.textContent = `${lastConversionDuration} ms`;
    }

    // Before updating the output, capture its proportional scroll position.
    const savedPreviewScrollRatio = getProportionalScrollPosition(uiElements.outputDisplay);

    // Update the output display with the new HTML.
    uiElements.outputDisplay.innerHTML = processedHtml;
    currentOutputContent = processedHtml; // Store for potential future use

    // Restore the proportional scroll position to maintain user's view.
    restoreProportionalScrollPosition(uiElements.outputDisplay, savedPreviewScrollRatio);

    logEvent(`Content converted in ${lastConversionDuration} ms.`);
}


/**
 * Handles changes to the conversion mode selector.
 * Triggers an immediate conversion if the mode allows.
 */
function handleModeChange() {
    logEvent(`Conversion mode changed to: ${uiElements.conversionModeSelect.value}`);
    // If the user enables automatic updates, perform one now.
    debounceConversionTrigger();
}

/**
 * Handles a click on the manual conversion button.
 * Forces a conversion regardless of input changes.
 */
function handleManualConversionRequest() {
    logEvent('Manual conversion triggered.');
    // Invalidate the previous input to force a full conversion.
    previousInputContent = '';
    performConversion(true);
    uiElements.sourceEditor.focus();
}

/**
 * Manages the delayed conversion trigger.
 * This function debounces the calls to `performConversion`
 * based on the selected conversion mode and last conversion time.
 */
function debounceConversionTrigger() {
    // Clear any previously scheduled conversion.
    if (conversionTimerHandle) {
        window.clearTimeout(conversionTimerHandle);
        conversionTimerHandle = undefined;
    }

    const mode = uiElements.conversionModeSelect.value;
    if (mode === "manual") {
        return; // No automatic conversion in manual mode.
    }

    let delayDuration = 0;
    if (mode === "delayed") {
        // Adaptive delay: longer conversion times lead to longer delays.
        delayDuration = lastConversionDuration;
    }
    // Ensure the delay doesn't exceed the configured maximum.
    if (delayDuration > appConfig.maxUpdateDelayMs) {
        delayDuration = appConfig.maxUpdateDelayMs;
    }

    // Schedule the conversion. Even for instant updates (delayDuration=0),
    // a setTimeout allows the browser to process other events first.
    conversionTimerHandle = window.setTimeout(performConversion, delayDuration);
    logEvent(`Conversion scheduled with a delay of ${delayDuration} ms (mode: ${mode}).`);
}


/*
 *  Smart Scrollbar Management
 *
 *  To prevent the user's view from jumping awkwardly during content updates,
 *  we save and restore the proportional scroll position of the output pane.
 *  This ensures that if the user is, for example, 50% down the content,
 *  they remain approximately 50% down after the content is refreshed,
 *  even if its total height changes.
 */

/**
 * Calculates the proportional scroll position of an element.
 * @param {HTMLElement} element - The scrollable DOM element.
 * @returns {number} A value between 0.0 (top) and 1.0 (bottom).
 */
function getProportionalScrollPosition(element) {
    // If content doesn't overflow, consider it at the bottom (1.0).
    if (element.scrollHeight <= element.clientHeight) {
        return 1.0;
    }
    return element.scrollTop / (element.scrollHeight - element.clientHeight);
}

/**
 * Restores the scroll position of an element based on a proportional value.
 * @param {HTMLElement} element - The scrollable DOM element.
 * @param {number} ratio - The proportional scroll position (0.0 to 1.0).
 */
function restoreProportionalScrollPosition(element, ratio) {
    // Trigger a reflow for browsers that might not update scrollHeight immediately.
    // This line accesses `scrollTop` but doesn't change it, forcing a re-evaluation.
    // eslint-disable-next-line no-unused-expressions
    element.scrollTop;

    element.scrollTop = (element.scrollHeight - element.clientHeight) * ratio;
}


/*
 *  Dynamic Panel Resizing
 *
 *  Some older browsers (e.g., Internet Explorer) exhibit inconsistent behavior
 *  when setting `textarea` heights using percentage values in CSS.
 *  This JavaScript routine calculates and applies explicit pixel heights
 *  to ensure proper layout across different environments. If modern CSS
 *  solutions become universally reliable, this script-based approach
 *  could potentially be simplified or removed.
 */

/**
 * Calculates the total offsetTop of an element relative to the document body.
 * @param {HTMLElement} targetElement - The element to measure.
 * @returns {number} The cumulative top offset in pixels.
 */
function calculateAbsoluteTopPosition(targetElement) {
    let topSum = 0;
    let currentElement = targetElement;
    while (currentElement) {
        topSum += currentElement.offsetTop;
        currentElement = currentElement.offsetParent;
    }
    return topSum;
}

/**
 * Determines the effective height of an element, prioritizing clientHeight.
 * @param {HTMLElement} targetElement - The element to measure.
 * @returns {number} The height in pixels.
 */
function getEffectiveElementHeight(targetElement) {
    // Prefer clientHeight for visible area, fallback to scrollHeight for content height.
    return targetElement.clientHeight || targetElement.scrollHeight || 0;
}

/**
 * Retrieves the height of the browser's viewport.
 * @returns {number} The viewport height in pixels.
 */
function getViewportHeight() {
    // Standard and IE fallback.
    return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0;
}

/**
 * Adjusts the height of the input and output panels to fill available vertical space.
 * This function runs periodically and on window resize events.
 */
function adjustPanelDimensions() {
    const editorElement = uiElements.sourceEditor;
    const previewElement = uiElements.outputDisplay;
    const footerElement = uiElements.appFooter;

    if (!editorElement || !previewElement || !footerElement) {
        logEvent('Warning: Missing elements for panel dimension adjustment.');
        return;
    }

    const viewportHeight = getViewportHeight();
    const footerHeight = getEffectiveElementHeight(footerElement);
    const editorTopPosition = calculateAbsoluteTopPosition(editorElement);

    // Calculate the remaining vertical space for the content panels.
    let availableVerticalSpace = viewportHeight - footerHeight - editorTopPosition;

    // Ensure space is not negative.
    if (availableVerticalSpace < 0) {
        availableVerticalSpace = 0;
    }

    // Apply the calculated height to both the editor and preview panels.
    // The original code had these commented out; this clone makes them active.
    editorElement.style.height = `${availableVerticalSpace}px`;
    previewElement.style.height = `${availableVerticalSpace}px`;
    // logEvent(`Adjusted panel heights to ${availableVerticalSpace}px.`);
}