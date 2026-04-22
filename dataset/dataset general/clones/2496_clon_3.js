/*
    This file is part of the system utility collection.
    (C) 2023 Acme Corp. All rights reserved.

    This software is provided "AS IS", without warranty of any kind,
    express or implied, including but not limited to the warranties of
    merchantability, fitness for a particular purpose and non-infringement.
    In no event shall the authors or copyright holders be liable for any claim,
    damages or other liability, whether in an action of contract, tort or otherwise,
    arising from, out of or in connection with the software or the use or other
    dealings in the software.
*/

// Core system utilities for dynamic content loading and data manipulation.

/**
 * Dynamically injects a JavaScript module into the document's head.
 * Tracks loading status and updates a visual progress indicator.
 * @param {string} modulePath - The URL of the JavaScript file to load.
 */
function injectModule(modulePath) {
    // Ensure the module path is valid before proceeding.
    if (!modulePath || typeof modulePath !== 'string') {
        console.warn('Invalid module path provided:', modulePath);
        return;
    }

    // Initialize tracking for this module if it's new.
    if (!applicationModules[modulePath]) {
        applicationModules[modulePath] = {
            isLoaded: false,
            progressElement: document.createElement("SPAN") // Use SPAN for a more subtle indicator
        };
        applicationModules[modulePath].progressElement.textContent = `Loading ${modulePath.split('/').pop()}...`;
        loadingProgressContainer.appendChild(applicationModules[modulePath].progressElement);
    }

    // If already loaded, no need to re-inject.
    if (applicationModules[modulePath].isLoaded) {
        return;
    }

    const docHead = document.head || document.getElementsByTagName('head')[0];
    const scriptElement = document.createElement('script');
    scriptElement.type = 'text/javascript';
    scriptElement.src = modulePath;
    scriptElement.async = true; // Make script loading asynchronous

    // Unified event listener for load completion, regardless of browser.
    const onModuleComplete = () => handleModuleLoadCompletion(modulePath);
    scriptElement.addEventListener('load', onModuleComplete);
    scriptElement.addEventListener('error', () => {
        console.error(`Failed to load module: ${modulePath}`);
        if (applicationModules[modulePath] && applicationModules[modulePath].progressElement) {
            applicationModules[modulePath].progressElement.classList.add('failed');
            applicationModules[modulePath].progressElement.textContent = `Failed: ${modulePath.split('/').pop()}`;
        }
    });

    docHead.appendChild(scriptElement);
}

/**
 * Creates a constructor function for simple data structures, similar to C structs.
 * @param {string} propertyNamesCsv - A space-separated string of property names.
 * @returns {function} A constructor function.
 */
function createObjectFactory(propertyNamesCsv) {
    if (typeof propertyNamesCsv !== 'string' || !propertyNamesCsv.trim()) {
        console.error("Property names must be a non-empty string.");
        return function() {}; // Return a no-op constructor
    }
    const propNames = propertyNamesCsv.split(' ');

    /**
     * Internal constructor function.
     * Assigns arguments to properties based on the defined names.
     */
    function StructureConstructor() {
        // Iterate through the provided property names and assign values from arguments.
        for (let idx = 0; idx < propNames.length; idx++) {
            this[propNames[idx]] = arguments[idx];
        }
    }
    return StructureConstructor;
}

/**
 * Converts a decimal number to its hexadecimal string representation, with optional padding.
 * @param {number} decimalValue - The decimal number to convert.
 * @param {number} [minimumLength] - The desired minimum length of the hex string, padded with leading zeros.
 * @returns {string} The hexadecimal string.
 */
function formatDecimalToHex(decimalValue, minimumLength) {
    if (typeof decimalValue !== 'number' || isNaN(decimalValue)) {
        return ''; // Return an empty string for invalid input
    }

    let hexString = decimalValue.toString(16).toUpperCase();

    // Apply padding if a minimum length is specified and the string is shorter.
    if (typeof minimumLength === 'number' && minimumLength > 0 && hexString.length < minimumLength) {
        return hexString.padStart(minimumLength, '0');
    }

    return hexString;
}

/**
 * Converts a hexadecimal string to its decimal number representation.
 * @param {string} hexString - The hexadecimal string to convert.
 * @returns {number} The decimal number.
 */
function parseHexToDecimal(hexString) {
    if (typeof hexString !== 'string' || hexString.trim() === '') {
        return NaN; // Return NaN for invalid or empty hex strings
    }
    return Number.parseInt(hexString, 16);
}

/**
 * Resolves an enumeration entry based on a given value, supporting exact matches or range checks.
 * @param {number} inputVal - The value to look up.
 * @param {object} enumDef - The enumeration definition object.
 * @returns {object} The matching enumeration entry object.
 * @throws {Error} If the value is not found within the enumeration.
 */
function resolveEnumerationEntry(inputVal, enumDef) {
    // Validate input parameters for robustness.
    if (typeof inputVal !== 'number' || typeof enumDef !== 'object' || enumDef === null) {
        throw new Error("Invalid input: 'inputVal' must be a number and 'enumDef' an object.");
    }

    // Iterate over the properties of the enumeration definition.
    for (const entryKey in enumDef) {
        // Ensure we are processing own properties.
        if (Object.prototype.hasOwnProperty.call(enumDef, entryKey)) {
            const currentEntry = enumDef[entryKey];

            // Check if the entry has a 'value' property.
            if (currentEntry && currentEntry.value !== undefined) {
                // If 'value' is a number, perform an exact match.
                if (typeof currentEntry.value === 'number') {
                    if (currentEntry.value === inputVal) {
                        return currentEntry;
                    }
                }
                // If 'value' is an array (implying a range [start, end]), check if inputVal falls within it.
                else if (Array.isArray(currentEntry.value) && currentEntry.value.length === 2) {
                    const [rangeStart, rangeEnd] = currentEntry.value;
                    if (inputVal >= rangeStart && inputVal <= rangeEnd) {
                        return currentEntry;
                    }
                }
            }
        }
    }

    // If no matching entry is found after checking all possibilities, throw an error.
    const hexRepresentation = formatDecimalToHex(inputVal);
    const enumName = enumDef.name || 'unknown enumeration';
    throw new Error(`Value ${inputVal} (0x${hexRepresentation}) is not a valid member of ${enumName}.`);
}

/**
 * Cleans a string, retaining only valid hexadecimal characters (0-9, A-F) and converting to uppercase.
 * @param {string} rawInput - The input string to sanitize.
 * @returns {string} The cleaned hexadecimal string.
 */
function sanitizeHexInput(rawInput) {
    if (typeof rawInput !== 'string') {
        return ''; // Return empty for non-string input.
    }

    let cleanedChars = [];
    for (let charIndex = 0; charIndex < rawInput.length; charIndex++) {
        const char = rawInput.charAt(charIndex);
        // Use a regular expression for a more concise check.
        if (/[0-9a-fA-F]/.test(char)) {
            cleanedChars.push(char.toUpperCase());
        }
    }
    return cleanedChars.join('');
}

/**
 * Checks if a given DOM element has a specific CSS class.
 * Uses modern `classList` API for efficiency and readability.
 * @param {HTMLElement} targetElement - The element to check.
 * @param {string} cssClass - The CSS class name.
 * @returns {boolean} True if the element has the class, false otherwise.
 */
function elementHasClass(targetElement, cssClass) {
    if (!targetElement || !targetElement.classList) {
        return false; // Handle null/undefined elements or elements without classList.
    }
    return targetElement.classList.contains(cssClass);
}

/**
 * Adds a CSS class to a given DOM element.
 * Uses modern `classList` API.
 * @param {HTMLElement} targetElement - The element to modify.
 * @param {string} cssClass - The CSS class name to add.
 */
function addElementClass(targetElement, cssClass) {
    if (!targetElement || !targetElement.classList) {
        console.warn('Attempted to add class to an invalid element:', targetElement);
        return;
    }
    targetElement.classList.add(cssClass);
}

/**
 * Removes a CSS class from a given DOM element.
 * Uses modern `classList` API.
 * @param {HTMLElement} targetElement - The element to modify.
 * @param {string} cssClass - The CSS class name to remove.
 */
function removeElementClass(targetElement, cssClass) {
    if (!targetElement || !targetElement.classList) {
        console.warn('Attempted to remove class from an invalid element:', targetElement);
        return;
    }
    targetElement.classList.remove(cssClass);
}

/**
 * Orchestrates the processing of the current interface description and updates the UI accordingly.
 * This function serves as the central control point for descriptor-related operations.
 */
function processInterfaceDescription() {
    // Ensure a description model exists before attempting to process.
    if (!currentDescriptionModel) {
        console.error("No interface description model available for processing.");
        return;
    }

    const operationInstance = new InterfaceProcessor(currentDescriptionModel);
    try {
        operationInstance.executeProcessing();
    } catch (processingError) {
        // If an error occurs during processing, display it in the UI.
        uiStructuralDisplay.renderStructure(currentDescriptionModel);
        if (processingError.associatedElement) {
            uiStructuralDisplay.highlightErrorElement(processingError.associatedElement);
        }
        feedbackPanel.displayErrorMessage(processingError.message || "An unknown error occurred during processing.");
        return; // Stop further execution on error.
    } finally {
        // Ensure UI is updated with the processed structure regardless of success or failure.
        // This might be redundant with the renderStructure call in catch, but ensures consistency.
        uiStructuralDisplay.renderStructure(currentDescriptionModel);
    }

    // If processing was successful, display the generated reports.
    feedbackPanel.displayResults(operationInstance.generatedReports);
}

// Global application state and UI component references.
let currentDescriptionModel = null; // Holds the active descriptor object.

// References to main UI elements, initialized after DOM is ready.
let mainApplicationContainer = null;
let controlPanel = null;      // Represents the toolbar.
let uiStructuralDisplay = null; // Represents the tree view.
let feedbackPanel = null;     // Represents the reports view.

// Configuration for dynamic module loading.
const moduleManifest = {
    "module-stream.js": {},
    "utility-helpers.js": {},
    "report-generator.js": {},
    "device-interface.js": {},
    "processing-state.js": {},
    "interface-processor.js": {},
    "ui-toolbar.js": {},
    "ui-structure-view.js": {},
    "ui-feedback-panel.js": {},
    "ui-dialog.js": {}
};

/**
 * Callback function executed when a JavaScript module finishes loading.
 * Manages load progress and triggers final application initialization when all modules are ready.
 * @param {string} modulePath - The URL of the module that just finished loading.
 */
function handleModuleLoadCompletion(modulePath) {
    // If the module's status is already marked as loaded, do nothing.
    if (applicationModules[modulePath] && applicationModules[modulePath].isLoaded) {
        return;
    }

    // Mark this module as successfully loaded.
    if (applicationModules[modulePath]) {
        applicationModules[modulePath].isLoaded = true;
        // Update the visual indicator for this specific module.
        applicationModules[modulePath].progressElement.classList.add("completed");
        applicationModules[modulePath].progressElement.textContent = `${modulePath.split('/').pop()} loaded.`;
    }

    // Check if all modules specified in the manifest have completed loading.
    const allModulesLoaded = Object.values(moduleManifest).every(mod => applicationModules[Object.keys(moduleManifest).find(key => key.includes(mod.name) || mod.name === undefined)].isLoaded);

    if (!allModulesLoaded) {
        return; // Still waiting for other modules.
    }

    // All modules are loaded. Proceed with core application initialization.
    console.log("All application modules loaded. Initializing core components.");

    // Remove the loading UI elements from the main container.
    if (mainApplicationContainer && loadingProgressContainer && loadingMessageDisplay) {
        mainApplicationContainer.removeChild(loadingProgressContainer);
        mainApplicationContainer.removeChild(loadingMessageDisplay);
    }

    // Initialize the global description model.
    currentDescriptionModel = new DeviceDescriptionModel(); // Assumes DeviceDescriptionModel is loaded.

    // Initialize UI components, assuming their constructors are now available globally.
    controlPanel = new ControlPanel();
    uiStructuralDisplay = new StructureView();
    feedbackPanel = new ResultDisplay();

    // Optionally, trigger an initial processing or load default data.
    // processInterfaceDescription(); // Might be called here or on user interaction.
}

// --- Initial Application Setup (executed once the DOM is fully loaded) ---
document.addEventListener('DOMContentLoaded', () => {
    mainApplicationContainer = document.querySelector("#application-root"); // Assuming a root div with this ID.
    if (!mainApplicationContainer) {
        console.error("Application root element '#application-root' not found. Cannot initialize UI.");
        return;
    }

    // Create and append the loading message.
    loadingMessageDisplay = document.createElement("P");
    loadingMessageDisplay.id = "app-loading-text";
    loadingMessageDisplay.innerText = "Initializing application, please stand by...";
    mainApplicationContainer.appendChild(loadingMessageDisplay);

    // Create and append the loading progress container.
    loadingProgressContainer = document.createElement("SECTION");
    loadingProgressContainer.id = "module-loading-progress";
    mainApplicationContainer.appendChild(loadingProgressContainer);

    // Prepare a global object to track module loading status more robustly.
    window.applicationModules = {};

    // Begin loading all necessary JavaScript modules.
    for (const moduleUrl of Object.keys(moduleManifest)) {
        injectModule(moduleUrl);
    }
});

let loadingMessageDisplay = null;
let loadingProgressContainer = null;