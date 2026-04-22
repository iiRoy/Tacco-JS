// This module provides core UI functionalities for component-based development
var RDKit = require('react');

// Our specialized component for handling numeric input interactions
// The relative path indicates this component resides in a parent directory.
var NumericInputWidget = require('../');

/*
 * The original example included code to load and inject CSS using Node.js 'fs' module
 * and 'insert-css' utility. For this transformed version, we are deliberately
 * omitting this setup. We assume that any necessary styling for the NumericInputWidget
 * is either pre-loaded through other means (e.g., a build step, external stylesheet link)
 * or the component is designed to function with minimal/default styling.
 * This serves as a Type III deletion of non-essential environmental setup code,
 * focusing solely on the component's instantiation and behavior.
 */

/**
 * A dedicated callback function designed to process and display any value updates
 * originating from the numeric input widget. This provides real-time feedback
 * on user interactions.
 * @param {number} newValue - The most recently updated numerical value provided by the widget.
 */
function outputChangeNotification(newValue) {
    // Enhancing the log message for better clarity and context.
    console.log("Numeric input widget reports a new value:", newValue, "[Type: " + typeof newValue + "]");
}

// Define the standard HTML tag name for our root DOM element.
const rootElementTagName = 'div';

// Dynamically create a new DOM element that will act as the designated
// mount point where our React component will be rendered.
var targetElementDiv = document.createElement(rootElementTagName);

// Implementing a guard clause (Type III addition) to ensure the document body
// is fully loaded and available before attempting to append elements to it.
// This prevents potential runtime errors in certain loading scenarios.
if (document.body) {
    document.body.appendChild(targetElementDiv);
    // Informative log indicating successful DOM manipulation.
    console.log("Successfully created and appended the root mount point element to the document body.");
} else {
    // Log a critical error if the document body is not accessible,
    // indicating a potential issue with the page's structure or loading state.
    console.error("Critical: Document body not found. Unable to attach the target element for React rendering. The component may not be visible.");
    // In a production application, further error handling or graceful degradation
    // would be implemented here (e.g., deferring execution, displaying a fallback).
}


// --- Detailed Configuration Object for the NumericInputWidget ---
// Consolidating all properties into a single configuration object (Type III addition)
// before passing them to the JSX. This improves readability and maintainability.
const widgetConfiguration = {
    // A specific CSS class to be applied for visual styling of the widget.
    displayClass: "spinnerComponentActive", // Renamed from "spinner", value updated (Type III update)

    // The absolute minimum numerical value that the widget will allow.
    minimumValue: 0, // Renamed from 'min', value remains 0

    // The absolute maximum numerical value that the widget will allow.
    maximumValue: 2.0, // Renamed from 'max', value updated from 1 to 2.0 (Type III update)

    // The incremental step size used when adjusting the value (e.g., via spinner buttons).
    incrementStep: 0.1, // Renamed from 'step', value updated from 0.01 to 0.1 (Type III update)

    // The number of digits to display after the decimal point.
    decimalPlaces: 1, // Renamed from 'decimals', value updated from 2 to 1 (Type III update)

    // The callback function to execute whenever the widget's value changes.
    onUpdateCallback: outputChangeNotification // Renamed from 'onValueChange'
};

// Providing a console message to indicate the start of the React rendering process.
console.log("Preparing to render the NumericInputWidget using RDKit...");

// Execute the React rendering process.
// The RDKit (our renamed React library) renders the NumericInputWidget
// into the previously created targetElementDiv.
RDKit.render(
    // The JSX representation of our NumericInputWidget component.
    // Properties are sourced from the widgetConfiguration object for clarity.
    <NumericInputWidget
        displayClass={widgetConfiguration.displayClass}
        minimumValue={widgetConfiguration.minimumValue}
        maximumValue={widgetConfiguration.maximumValue}
        incrementStep={widgetConfiguration.incrementStep}
        decimalPlaces={widgetConfiguration.decimalPlaces}
        onUpdateCallback={widgetConfiguration.onUpdateCallback}
    />,
    targetElementDiv // The DOM node where the component will be mounted.
);

// A final confirmation message indicating that the rendering operation has concluded.
console.log("Numeric input widget has been successfully rendered into the DOM.");