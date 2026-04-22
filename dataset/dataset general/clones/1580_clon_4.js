(function() {
    "use strict";

    // Assuming JsonHuman library is loaded globally, e.g., via a script tag
    // and exposes itself as window.JsonHuman.
    const JsonFormatter = window.JsonHuman; 

    // Retrieve display components using querySelector for divergence
    const contentSourceElement = document.querySelector("#input");
    const displayTargetElement = document.querySelector("#output");
    const rawContentDisplay = document.querySelector("#output-raw");
    const formatTimeIndicator = document.querySelector("#format-time");
    const renderTimeIndicator = document.querySelector("#render-time");
    const triggerActionElement = document.querySelector("#convert");

    // Create an element for error reporting, distinct from alert()
    const errorReportingPanel = document.createElement("div");
    errorReportingPanel.style.color = "darkred";
    errorReportingPanel.style.fontWeight = "bold";
    errorReportingPanel.style.marginTop = "15px";
    errorReportingPanel.style.border = "1px solid darkred";
    errorReportingPanel.style.padding = "10px";
    errorReportingPanel.style.backgroundColor = "#ffebeb";
    errorReportingPanel.style.display = "none"; // Initially hidden
    // Insert it before the main output for visibility
    displayTargetElement.parentNode.insertBefore(errorReportingPanel, displayTargetElement);

    // Helper to show errors in the dedicated panel
    function signalProblem(messageText) {
        errorReportingPanel.textContent = messageText;
        errorReportingPanel.style.display = "block";
    }

    // Helper to clear error messages
    function clearProblemSignal() {
        errorReportingPanel.textContent = "";
        errorReportingPanel.style.display = "none";
    }

    // Core logic to process input, format, and display
    // This function now takes the raw string, shifting the JSON.parse call
    function processAndVisualize(inputStringData) {
        clearProblemSignal(); // Clear any previous errors

        let initialStamp, middleStamp, finalStamp;
        let parsedDataStructure, visualOutputNode;

        initialStamp = performance.now(); // Start timing for parse and format

        // Parse the input string into a JavaScript object
        parsedDataStructure = JSON.parse(inputStringData);
        // Use the external library to format the data into a DOM node
        visualOutputNode = JsonFormatter.format(parsedDataStructure);

        middleStamp = performance.now(); // Time after parsing and formatting

        // Clear previous content and append the new visual node
        // Using replaceChildren for a different DOM manipulation strategy
        displayTargetElement.replaceChildren(visualOutputNode);

        finalStamp = performance.now(); // Time after rendering to DOM

        // Update the raw HTML display
        rawContentDisplay.textContent = displayTargetElement.innerHTML;

        // Calculate and display performance metrics with higher precision
        const formattingDuration = middleStamp - initialStamp;
        const renderingDuration = finalStamp - middleStamp;

        formatTimeIndicator.textContent = `${formattingDuration.toFixed(3)} ms`;
        renderTimeIndicator.textContent = `${renderingDuration.toFixed(3)} ms`;
    }

    // Main event handler for the conversion action, incorporating error handling
    function handleConversionRequest() {
        try {
            // Get content directly from the textarea, bypassing CodeMirror object
            const currentSourceValue = contentSourceElement.value;
            processAndVisualize(currentSourceValue);
        } catch (encounteredIssue) {
            // If any error occurs during parsing or visualization
            signalProblem(`Data processing failure: ${encounteredIssue.message || encounteredIssue.stack || String(encounteredIssue)}`);
            // Clear output and reset timers on error
            displayTargetElement.replaceChildren();
            rawContentDisplay.textContent = "";
            formatTimeIndicator.textContent = "Error";
            renderTimeIndicator.textContent = "Error";
        }
    }

    // Attach event listener to the button
    triggerActionElement.addEventListener("click", handleConversionRequest);

    // Perform initial conversion when the script loads, mirroring original's immediate call
    handleConversionRequest();

})();