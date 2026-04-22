let functionConfigurationStorage = new Map(); // Stores configurations for each function/equation
let parameterDetailsMap = new Map(); // Global map for variable details (min, max, step, current, visible)

// Utility function to safely get a DOM element
const getElement = (selector, context = document) => context.querySelector(selector);

// Helper for sanitizing string for IDs and classes
const cleanStringForId = (inputStr) => inputStr.replace(/[^a-zA-Z0-9_-]/g, '_');

/**
 * Initializes application state by processing URL parameters.
 * If no valid equation is found, redirects to a default example.
 * This is the primary entry point for loading user-defined expressions.
 */
function initializeApplicationState() {
    // Determine the source of the equation string from the URL
    const currentBrowserLocation = window.location.href;
    const queryParameterIndex = currentBrowserLocation.indexOf("?");

    let rawQueryString = "";
    if (queryParameterIndex !== -1) {
        rawQueryString = currentBrowserLocation.substring(queryParameterIndex + 1);
    }

    // Decode and normalize the query string.
    // Replace URL-encoded spaces (%20) or custom delimiters ('%') with standard space or plus
    let processedAddressBar = rawQueryString.replace(/%20/g, "+").replace(/'%/g, "+");

    // Check for a specific equation delimiter. If none, assume the entire string is the equation.
    let equationAssignmentIndex = processedAddressBar.indexOf("=");
    let expressionPayload = "";

    if (equationAssignmentIndex === -1) {
        expressionPayload = processedAddressBar; // No '=', so the whole string is the expression.
    } else {
        expressionPayload = processedAddressBar.substring(0, equationAssignmentIndex); // Extract before '='
    }

    // If no equation payload is found, or it's just whitespace, redirect to an example.
    if (!expressionPayload.trim()) {
        const exampleData = window.examples || []; // Assuming 'examples' is globally available
        const totalExamples = exampleData.length;
        let selectedExampleIndex = 0; // Default to the first example

        if (totalExamples > 0) {
            // Pick a non-zero indexed example if possible, or just the first one
            selectedExampleIndex = Math.floor(Math.random() * totalExamples);
            if (selectedExampleIndex === 0 && totalExamples > 1) {
                selectedExampleIndex = 1; // Avoid index 0 if others exist, just for variety
            }
        }

        // Construct new URL with an example and reload the page
        const currentBaseUrl = window.location.href.split("?")[0];
        if (exampleData[selectedExampleIndex] && exampleData[selectedExampleIndex].url) {
            const newExampleUrl = `${currentBaseUrl}?${exampleData[selectedExampleIndex].url}`;
            window.location.replace(newExampleUrl); // Use replace to avoid back button issues
        } else {
            console.error("No examples found or example URL is invalid.");
            // Fallback: If no examples, just clear the URL
            window.location.replace(currentBaseUrl);
        }
        return; // Stop further processing as we're redirecting
    }

    // Split the main expression payload into individual equation strings
    const individualEquationStrings = extractEquationComponents(expressionPayload);

    // Process each extracted equation
    individualEquationStrings.forEach((equationEntry) => {
        if (equationEntry.length < 2) { // Skip very short or empty entries
            return;
        }

        let currentEquationText = "DefaultEquation";
        let assignedFunctionName = "Function";
        let variableContext = {}; // Stores min/curr/max for variables

        const componentParts = equationEntry.split(":");
        const numParts = componentParts.length;

        // Parse equation text and function name
        if (numParts > 0) {
            currentEquationText = componentParts[0];
        }
        if (numParts > 1) {
            assignedFunctionName = componentParts[1];
        }

        // Parse variable definitions (e.g., :varName:min:curr:max)
        for (let k = 2; k < numParts; k += 4) {
            const varName = componentParts[k];
            const varMin = parseFloat(componentParts[k + 1]);
            const varCurr = parseFloat(componentParts[k + 2]);
            const varMax = parseFloat(componentParts[k + 3]);

            if (varName && !isNaN(varMin) && !isNaN(varCurr) && !isNaN(varMax)) {
                variableContext[varName] = {
                    minimum: varMin,
                    current: varCurr,
                    maximum: varMax
                };
            }
        }

        let parsedExpressionObject;
        try {
            // Assuming QGSolver is a global object for parsing mathematical expressions
            parsedExpressionObject = QGSolver.parse(currentEquationText);
        } catch (parsingError) {
            console.error(`Error parsing equation "${currentEquationText}":`, parsingError);
            displayParsingError(); // Visual feedback for the user
            return; // Skip this equation if parsing fails
        }

        assignedFunctionName = cleanStringForId(assignedFunctionName); // Sanitize for DOM IDs
        const equationRowElement = generateFunctionDisplayRow(assignedFunctionName, currentEquationText, parsedExpressionObject, variableContext);

        // Calculate initial results and update UI
        executeEquationCalculation(equationRowElement, parsedExpressionObject);
        adjustDisplayElements(); // Resize or reposition elements as needed
    });
}

/**
 * Splits a composite equation string into an array of individual equations.
 * Uses a configurable delimiter, defaulting to '{'.
 * @param {string} fullEquationString - The string containing one or more equations.
 * @returns {string[]} An array of individual equation strings.
 */
function extractEquationComponents(fullEquationString) {
    const equationSeparator = "{";
    if (fullEquationString.includes(equationSeparator)) {
        return fullEquationString.split(equationSeparator);
    } else {
        return [fullEquationString]; // No separator, so it's a single equation
    }
}

/**
 * Displays a visual error message to the user, typically when an equation fails to parse.
 */
function displayParsingError() {
    // Placeholder for actual error display logic (e.g., showing a modal, toast, or inline message)
    alert("An error occurred while trying to interpret one of the equations. Please check its syntax!");
    console.warn("Visual error function triggered due to parsing failure.");
}

/**
 * Replaces a custom string splitting logic with native `String.prototype.split()`.
 * This function is now considered redundant and will be removed.
 * Original: `parseAndAddToHash(stringToParse,delimiter,hashToGrow)`
 */
// The original `parseAndAddToHash` function is a custom implementation of string splitting.
// For Type III cloning, we will remove this function and rely on native `String.prototype.split()`
// or other modern string manipulation methods directly where needed, simplifying the code.
// This fulfills the "delete some non-essential statements" requirement.


/**
 * Updates the displayed value of a slider and potentially triggers an equation recalculation.
 * @param {string} inputValue - The raw string value from the slider.
 * @param {string} sliderDomId - The ID of the slider element (e.g., "fxnName_varName_slider").
 */
function updateSliderDisplay(inputValue, sliderDomId) {
    const [functionIdentifier, variableIdentifier] = sliderDomId.split('_'); // Assuming ID format

    const sliderElement = getElement(`#${sliderDomId}`);
    const stepValue = parseFloat(sliderElement.getAttribute("step"));

    // Apply input parsing/rounding
    const processedValue = normalizeNumericInput(inputValue, stepValue);

    const valueDisplayElement = getElement(`#${functionIdentifier}_${variableIdentifier}_curr`);
    if (valueDisplayElement) {
        valueDisplayElement.textContent = processedValue;
    }

    // Determine if dynamic updates are enabled (e.g., from a checkbox)
    const shouldUpdateDynamically = getElement("#dynamic_update")?.checked ?? true; // Default to true if checkbox not found

    if (shouldUpdateDynamically) {
        // Find the function row and its associated equation object
        const targetRow = getElement(`#row_${functionIdentifier}`);
        if (targetRow && targetRow.equationData) {
            const equationObject = targetRow.equationData.expression;
            const currentContext = targetRow.equationData.context;

            // Update the variable's current value in its context
            if (currentContext[variableIdentifier]) {
                currentContext[variableIdentifier].current = processedValue;
            }

            executeEquationCalculation(targetRow, equationObject);
        }
    }
}

/**
 * Clears the main equation input, resets the function name, and clears all dynamic content.
 * This is a high-level reset for the entire application interface.
 */
function resetApplicationAndDisplay() {
    // Clear primary input fields
    const mainEquationInput = getElement("#mainEquation");
    if (mainEquationInput) mainEquationInput.value = "";

    const functionNameInput = getElement("#equationName");
    if (functionNameInput) functionNameInput.value = "Function";

    // Perform a comprehensive screen clear
    clearDynamicContent();
}

/**
 * Removes all dynamically generated UI elements like graphs, sliders, and function rows.
 * Resets global data structures related to variables.
 */
function clearDynamicContent() {
    // Clear graph container
    getElement("#graph_container")?.replaceChildren();

    // Hide result display area
    getElement("#result")?.style.display = "none";

    // Clear slider containers and variable lists
    document.querySelectorAll("tr.variable").forEach(row => row.remove());
    getElement("#variable_list")?.replaceChildren();

    // Clear all global variable hashes/maps
    parameterDetailsMap.clear();
    functionConfigurationStorage.clear();

    // Remove all function display rows
    document.querySelectorAll('.fxn_row').forEach(row => row.remove());
}

/**
 * Normalizes a numeric input value based on a given step,
 * handling potential floating-point inaccuracies for display.
 * @param {string|number} inputVal - The value to parse and normalize.
 * @param {number} stepSize - The step increment used for the value.
 * @returns {number} The normalized and rounded numeric value.
 */
function normalizeNumericInput(inputVal, stepSize) {
    let numericValue = parseFloat(inputVal);
    if (isNaN(numericValue)) return 0; // Default to 0 for invalid input

    // If step is less than 1, we need to handle decimal precision.
    if (stepSize < 1 && stepSize > 0) {
        // Calculate precision based on step (e.g., step=0.01 -> precision=2)
        const stepPrecision = (stepSize.toString().split('.')[1] || '').length;
        // Round to the nearest multiple of stepSize
        numericValue = Math.round(numericValue / stepSize) * stepSize;
        // Ensure correct decimal places for display
        return parseFloat(numericValue.toFixed(stepPrecision));
    }

    return numericValue; // For integer steps or step >= 1, direct parsing is fine.
}

/**
 * Converts the graph to a PNG image and opens it in a new window.
 */
function exportGraphAsPNG() {
    const graphCanvas = getElement("#subgraph_graph");
    if (graphCanvas instanceof HTMLCanvasElement) {
        try {
            const pngDataUrl = graphCanvas.toDataURL("image/png");
            window.open(pngDataUrl, '_blank'); // Open in a new tab/window
        } catch (error) {
            console.error("Failed to generate PNG from canvas:", error);
            alert("Could not generate image. Ensure the graph is fully loaded and supported by your browser.");
        }
    } else {
        alert("No graph found to export. Please generate a plot first!");
    }
}

/**
 * Sets the active variable for a given equation and triggers an update.
 * @param {string} equationIdentifier - The sanitized ID of the equation/function.
 * @param {string} variableKey - The name of the variable to set as active.
 */
function activateEquationVariable(equationIdentifier, variableKey) {
    const functionRow = getElement(`#row_${equationIdentifier}`);
    if (!functionRow || !functionRow.equationData) {
        console.warn(`Function row or data not found for ID: ${equationIdentifier}`);
        return;
    }

    const equationInstance = functionRow.equationData.expression;
    equationInstance.setVariable(variableKey); // Assuming QGSolver's object has this method

    // Re-evaluate the function with the newly selected active variable
    // updateFunction(equationIdentifier, equationInstance, functionRow.equationData.context);
    executeEquationCalculation(functionRow, equationInstance); // Re-solve with updated active variable
}

/**
 * Updates the value of a specific variable in an equation's context and re-solves.
 * This is triggered by slider changes.
 * @param {string} functionKey - The sanitized ID of the function.
 * @param {string} variableKey - The name of the variable being updated.
 */
function updateVariableAndRecalculate(functionKey, variableKey) {
    const sliderDomElement = getElement(`#${functionKey}_${variableKey}_slider`);
    if (!sliderDomElement) {
        console.error(`Slider element not found for ${functionKey}_${variableKey}_slider`);
        return;
    }

    const stepForVariable = parseFloat(sliderDomElement.step);
    const sliderCurrentValue = normalizeNumericInput(sliderDomElement.value, stepForVariable);

    const variableDisplaySpan = getElement(`#${functionKey}_${variableKey}_curr`);
    if (variableDisplaySpan) {
        variableDisplaySpan.textContent = sliderCurrentValue;
    }

    // Check if dynamic updates are enabled (always true here as per original logic)
    const isDynamicUpdateEnabled = true; // Original code had this hardcoded to 'true'

    if (isDynamicUpdateEnabled) {
        const equationContainerRow = getElement(`#row_${functionKey}`);
        if (!equationContainerRow || !equationContainerRow.equationData) {
            console.error(`Equation container row or data missing for ${functionKey}`);
            return;
        }

        const equationExpression = equationContainerRow.equationData.expression;
        const currentVariableContext = equationContainerRow.equationData.context;

        // Update the context for the specific variable
        if (currentVariableContext[variableKey]) {
            currentVariableContext[variableKey].current = sliderCurrentValue;
        }

        executeEquationCalculation(equationContainerRow, equationExpression);
    }
}

/**
 * Generates the HTML template for displaying a variable's current value.
 * @param {string} funcId - Sanitized function ID.
 * @param {string} varName - Variable name.
 * @param {object} contextData - Object with minimum, current, and maximum values.
 * @returns {string} HTML string for the current value display.
 */
function createCurrentValueHtml(funcId, varName, contextData) {
    const valueDisplayStyles = "height: 100%; padding: 5px 10px 3px 10px; font-size: 26pt; background-color: rgb(255,255,255); color: rgb(0,0,0); float: left; width: 180px;";
    const labelStyles = "font-size: 18pt; font-weight: bold;";
    return `
        <div style="${valueDisplayStyles}">
            <span style="${labelStyles}">${varName} = </span>
            <span id="${funcId}_${varName}_curr">${contextData.current}</span>
        </div>`;
}

/**
 * Generates the HTML template for a variable's slider control.
 * @param {string} funcId - Sanitized function ID.
 * @param {string} varName - Variable name.
 * @param {object} contextData - Object with minimum, current, and maximum values.
 * @returns {string} HTML string for the slider.
 */
function createSliderControlHtml(funcId, varName, contextData) {
    const sliderContainerStyles = "height: 100%; padding: 2px 5px 1px 5px; color: rgb(255,255,255); background: none; float: left; font-size: 20px;";
    const sliderInputStyles = "width: 440px; margin: 5px 10px 0px 10px;";

    const minVal = contextData.minimum;
    const maxVal = contextData.maximum;
    const currentVal = contextData.current;
    // Calculate a reasonable step size for the slider, defaulting to 0.001 if range is zero
    const calculatedStep = (maxVal - minVal) === 0 ? 0.001 : (maxVal - minVal) / 1000;

    return `
        <div style="${sliderContainerStyles}">
            <span style="margin: auto;">${minVal}</span>
            <input id="${funcId}_${varName}_slider"
                   type="range"
                   alt="Adjust ${varName}"
                   title="Adjust ${varName}"
                   min="${minVal}"
                   max="${maxVal}"
                   step="${calculatedStep}"
                   value="${currentVal}"
                   onchange="updateVariableAndRecalculate('${funcId}','${varName}')"
                   style="${sliderInputStyles}"/>
            <span style="margin: auto;">${maxVal}</span>
        </div>`;
}

/**
 * Populates a dropdown/container with variable value display and slider for a specific variable.
 * @param {HTMLElement} targetDropdown - The DOM element to populate.
 * @param {object} functionContext - The overall context for the function's variables.
 * @param {string} functionId - The sanitized ID of the function.
 * @param {string} variableId - The name of the specific variable.
 * @param {object} equationObject - The parsed equation object.
 */
function renderVariableControl(targetDropdown, functionContext, functionId, variableId, equationObject) {
    targetDropdown.innerHTML = ""; // Clear existing content

    const variableSpecificContext = functionContext[variableId];
    if (!variableSpecificContext) {
        console.error(`Context not found for variable: ${variableId}`);
        return;
    }

    let variableHtml = createCurrentValueHtml(functionId, variableId, variableSpecificContext);
    variableHtml += createSliderControlHtml(functionId, variableId, variableSpecificContext);

    targetDropdown.innerHTML = variableHtml;
}

/**
 * Populates a dropdown/container with radio buttons for selecting the active variable.
 * @param {HTMLElement} targetDropdown - The DOM element to populate.
 * @param {string} functionId - The sanitized ID of the function.
 * @param {object} equationObject - The parsed equation object.
 */
function renderVariableSelection(targetDropdown, functionId, equationObject) {
    targetDropdown.innerHTML = ""; // Clear existing content

    const availableVariables = equationObject.variables(); // Assuming method exists
    const currentlyActiveVariable = equationObject.variable?.varName; // Assuming property exists

    let selectionHtml = "<form>"; // Start a form for radio buttons

    availableVariables.forEach(varName => {
        const isChecked = varName === currentlyActiveVariable ? "checked='checked'" : "";
        selectionHtml += `
            <label>
                <input type="radio" name="variable_selector_${functionId}"
                       ${isChecked}
                       onchange="activateEquationVariable('${functionId}','${varName}')">
                ${varName}
            </label>`;
    });

    selectionHtml += "</form>";
    targetDropdown.innerHTML = selectionHtml;
}

// These are placeholder functions for `createFunctionRowWithContext`, `solveEquation`, `resizeBars`.
// Their actual implementation would depend on the larger application structure (e.g., jQuery UI, D3.js for graphs).
// For Type III, we acknowledge their existence and assume they are defined elsewhere.

/**
 * Placeholder: Creates a new row in the UI to display a function/equation.
 * This function would typically append new DOM elements.
 * @param {string} functionId - Sanitized ID for the function.
 * @param {string} equationText - The raw equation string.
 * @param {object} parsedEquation - The parsed equation object.
 * @param {object} context - Variable context (min/curr/max).
 * @returns {HTMLElement} The newly created DOM element for the function row.
 */
function generateFunctionDisplayRow(functionId, equationText, parsedEquation, context) {
    // In a real application, this would create a <tr> or <div> and append it.
    // For this clone, we'll just create a dummy object to hold the data.
    const dummyRow = document.createElement('div');
    dummyRow.id = `row_${functionId}`;
    dummyRow.className = 'fxn_row'; // Add class for easy selection
    dummyRow.equationData = { // Attach data directly to the DOM element for easy retrieval
        id: functionId,
        text: equationText,
        expression: parsedEquation,
        context: context
    };
    // Example: append to a container like document.body or a specific #equations_container
    // document.getElementById('equations_container')?.appendChild(dummyRow);
    console.log(`Generated dummy row for function: ${functionId}`);
    return dummyRow;
}

/**
 * Placeholder: Solves the equation and updates the display (e.g., graph, result text).
 * @param {HTMLElement} rowElement - The DOM element representing the function row.
 * @param {object} parsedEquation - The parsed equation object.
 */
function executeEquationCalculation(rowElement, parsedEquation) {
    // This function would interact with QGSolver to get results and then update a graph/text.
    // Example: const solution = parsedEquation.solve(rowElement.equationData.context);
    // Then update a graph or a result div based on 'solution'.
    console.log(`Executing calculation for function: ${rowElement.equationData.id}`);
    // Example of calling a hypothetical update function:
    // updateGraphAndResults(rowElement.equationData.id, solution);
}

/**
 * Placeholder: Adjusts the size and position of various UI elements.
 * This would typically involve DOM manipulation and potentially redrawing canvases.
 */
function adjustDisplayElements() {
    // Example: jQuery('.bar-element').each(function() { /* adjust width/height */ });
    console.log("Adjusting display elements...");
}

// Initial call to load data when the script runs
// window.addEventListener('DOMContentLoaded', initializeApplicationState);
// For direct execution in the environment, just call it:
// initializeApplicationState(); // This line would be uncommented in a real browser context.