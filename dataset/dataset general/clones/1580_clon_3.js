/* This script initializes a JSON visualization tool within a web application.
 * It leverages RequireJS for module loading and CodeMirror for an enhanced text editor experience.
 * The core functionality involves parsing JSON input, transforming it into a human-readable HTML structure,
 * and displaying it, along with performance metrics for the conversion process.
 */

// Define a structured configuration object for the AMD module loader.
const applicationModuleConfig = {
    // Specifies custom paths for resolving module IDs.
    moduleLocations: {
        // Aliases 'domBuilder' to the 'crel' library, located in the '../lib/' directory.
        domBuilder: "../lib/crel"
    }
};

// Apply the defined configuration to the RequireJS loader.
require.config(applicationModuleConfig);

// Load the primary JSON humanizer module and proceed with the application's main logic.
require(["../src/json.human"], function (JSONHumanizer) {
    "use strict"; // Enforce strict JavaScript parsing and execution rules.

    /**
     * A utility function to safely retrieve a DOM element by its ID.
     * Logs a warning if the element is not found, preventing potential null reference errors.
     * @param {string} elementId - The ID of the DOM element to retrieve.
     * @returns {HTMLElement|null} The DOM element if found, otherwise null.
     */
    const getDomElement = (elementId) => {
        const targetElement = document.getElementById(elementId);
        if (!targetElement) {
            console.warn(`Warning: DOM element with ID '${elementId}' was not found. Interaction might be limited.`);
        }
        return targetElement;
    };

    // --- References to Key UI Elements ---
    // The textarea where users input their raw JSON data.
    const jsonSourceInput = getDomElement("input");
    // The primary container where the formatted, visual JSON output will be rendered.
    const visualOutputContainer = getDomElement("output");
    // An optional display area for the raw HTML representation of the formatted output.
    // This element's usage has been modified/reduced for a Type III clone.
    const rawMarkupDisplayArea = getDomElement("output-raw");
    // A span or div to show the duration of the JSON formatting step.
    const formattingTimingDisplay = getDomElement("format-time");
    // A span or div to show the duration of the HTML rendering (DOM manipulation) step.
    const renderingTimingDisplay = getDomElement("render-time");
    // The interactive button that triggers the JSON conversion and display process.
    const conversionActionButton = getDomElement("convert");

    // Configuration object for the CodeMirror editor instance.
    const codeEditorOptions = {
        mode: "application/json", // Specifies JSON syntax highlighting.
        json: true // Enables additional JSON-specific features like auto-closing brackets.
    };

    // Initialize the CodeMirror editor on the designated textarea.
    let codeMirrorEditorInstance;
    // Guard against CodeMirror not being loaded or the input element missing.
    if (typeof CodeMirror !== 'undefined' && jsonSourceInput) {
        codeMirrorEditorInstance = CodeMirror.fromTextArea(jsonSourceInput, codeEditorOptions);
    } else {
        console.error("CodeMirror library or target input element not available. Using basic textarea functionality.");
        // Provide a fallback interface for basic text area operations if CodeMirror isn't available.
        codeMirrorEditorInstance = {
            getValue: () => jsonSourceInput ? jsonSourceInput.value : '',
            setValue: (content) => { if (jsonSourceInput) jsonSourceInput.value = content; }
        };
    }

    /**
     * Processes a given JSON data object, converting it into a visual HTML structure,
     * and then updates a specified DOM element. It also measures and reports performance.
     * @param {object} inputDataObject - The JavaScript object derived from parsed JSON.
     * @param {HTMLElement} targetDomElement - The DOM element where the visual output should be placed.
     */
    function visualizeAndDisplayJson(inputDataObject, targetDomElement) {
        // A robust check to ensure the input data is a valid object before processing.
        if (typeof inputDataObject !== 'object' || inputDataObject === null) {
            console.error("Invalid or empty data object provided for visualization.");
            return; // Exit if input is invalid.
        }
        if (!targetDomElement) {
            console.error("Target DOM element for output is missing or invalid.");
            return; // Exit if the output target is not available.
        }

        let formattedOutputNode;
        let processStartTimestamp, formatCompleteTimestamp, renderCompleteTimestamp; // Timestamps for detailed performance tracking.

        // Step 1: Execute the JSON formatting logic.
        processStartTimestamp = performance.now(); // High-resolution timestamp.
        formattedOutputNode = JSONHumanizer.format(inputDataObject);
        formatCompleteTimestamp = performance.now();

        // Step 2: Update the DOM by clearing existing content and appending the new visual node.
        // Using `replaceChildren` is a modern and efficient way to clear and add content.
        targetDomElement.replaceChildren(formattedOutputNode);
        renderCompleteTimestamp = performance.now();

        // --- Performance Measurement and Display ---
        const formattingDuration = (formatCompleteTimestamp - processStartTimestamp).toFixed(2); // In milliseconds, 2 decimal places.
        const renderingDuration = (renderCompleteTimestamp - formatCompleteTimestamp).toFixed(2);

        // Update UI elements with the measured durations.
        if (formattingTimingDisplay) {
            formattingTimingDisplay.textContent = `Formatting: ${formattingDuration} ms`;
        }
        if (renderingTimingDisplay) {
            renderingTimingDisplay.textContent = `Rendering: ${renderingDuration} ms`;
        }

        // For Type III, the raw markup display is removed or changed significantly.
        // For example, instead of displaying directly, it might log to console or be a toggleable feature.
        // In this clone, we'll omit its direct usage for simplicity and to demonstrate removal.
        // if (rawMarkupDisplayArea) {
        //     rawMarkupDisplayArea.textContent = targetDomElement.innerHTML; // This line was removed.
        // }

        console.info(`JSON visualization completed. Formatting took ${formattingDuration}ms, Rendering took ${renderingDuration}ms.`);
    }

    /**
     * Internal function responsible for extracting JSON from the editor, parsing it,
     * and then initiating the visualization process. This function does not handle errors.
     * @returns {void}
     */
    function executeCoreTransformation() {
        const currentEditorContent = codeMirrorEditorInstance.getValue();

        // Guard clause: If the editor content is empty or just whitespace, clear output and skip parsing.
        if (!currentEditorContent.trim()) {
            console.log("Editor content is empty. Skipping JSON parsing and clearing output.");
            if (visualOutputContainer) visualOutputContainer.replaceChildren(); // Clear any previous output.
            if (formattingTimingDisplay) formattingTimingDisplay.textContent = 'N/A';
            if (renderingTimingDisplay) renderingTimingDisplay.textContent = 'N/A';
            return;
        }

        // Attempt to parse the JSON string. This operation is prone to errors.
        const parsedJsonData = JSON.parse(currentEditorContent);

        // Additional validation: Ensure the parsed result is not null or undefined.
        if (parsedJsonData === null || typeof parsedJsonData === 'undefined') {
            console.error("The JSON parser returned null or undefined, indicating a potential issue with the input structure.");
            throw new Error("Parsed JSON data is invalid or empty.");
        }

        // If parsing is successful, proceed to visualize the data.
        visualizeAndDisplayJson(parsedJsonData, visualOutputContainer);
    }

    /**
     * The public entry point for handling a JSON conversion request.
     * It wraps the core transformation logic with robust error handling.
     * @returns {void}
     */
    function handleConversionRequest() {
        try {
            executeCoreTransformation();
        } catch (parsingOrProcessingError) {
            // Provide user feedback through an alert and log detailed error information.
            const userFriendlyMessage = `JSON parsing failed! Please ensure your input is valid JSON syntax.\n\nError details: ${parsingOrProcessingError.message}`;
            alert(userFriendlyMessage);
            // Clear any previous output and update timing displays to reflect the error state.
            if (visualOutputContainer) visualOutputContainer.replaceChildren();
            if (formattingTimingDisplay) formattingTimingDisplay.textContent = 'Error';
            if (renderingTimingDisplay) renderingTimingDisplay.textContent = 'Error';
            console.error("An error occurred during JSON processing:", parsingOrProcessingError);
            console.error("Error stack trace:", parsingOrProcessingError.stack);
        }
    }

    // Attach the event listener to the conversion trigger button.
    if (conversionActionButton) {
        conversionActionButton.addEventListener("click", handleConversionRequest);
    } else {
        console.error("The conversion action button was not found. User interaction might be impaired.");
    }

    // Execute an initial conversion when the application loads.
    // A small delay ensures all DOM elements and scripts are fully initialized before the first run.
    setTimeout(handleConversionRequest, 150); // Delay by 150 milliseconds.
});