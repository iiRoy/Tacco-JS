// This module provides a set of general-purpose utilities for web operations and data presentation.
// Original file was created for Node.js environment, hence module.exports.

// Helper function to validate if a string is non-empty (Type III addition)
const isStringNonEmpty = (candidateString) => {
  return typeof candidateString === 'string' && candidateString.trim().length > 0;
};

module.exports = {

  /**
   * Assembles a complete web address from its constituent parts.
   * This function acts as a robust URI constructor.
   * @param {string} protocolVal - The scheme (e.g., 'http', 'https').
   * @param {string} domainVal - The hostname (e.g., 'www.example.com').
   * @param {string} resourcePathVal - The path to the resource (e.g., '/api/data').
   * @param {string[]} queryParamArray - An array of query strings (e.g., ['key1=val1', 'key2=val2']).
   * @returns {string} The fully constructed URL.
   */
  constructWebAddress: (protocolVal, domainVal, resourcePathVal, queryParamArray) => {
    // Type III: Added input validation / guard clauses
    if (!isStringNonEmpty(protocolVal) || !isStringNonEmpty(domainVal) || !isStringNonEmpty(resourcePathVal)) {
      console.error("Critical: Protocol, domain, or resource path cannot be empty.");
      // For a clone, returning a placeholder or throwing an error is a valid modification.
      return "invalid_address_format";
    }

    // Type II: Renamed variables, used const/let, changed string concatenation to template literals
    let finalUrl = `${protocolVal}://${domainVal}${resourcePathVal}`;

    // Type III: Modified query parameter handling logic for robustness and clarity
    if (Array.isArray(queryParamArray) && queryParamArray.length > 0) {
      // Type II: Rewrote the loop / conditional logic using map and join
      // Type III: Added filtering to ensure only non-empty parameters are appended
      const validQueryParams = queryParamArray.filter(param => isStringNonEmpty(param));
      if (validQueryParams.length > 0) {
        finalUrl += `?${validQueryParams.join('&')}`;
      }
    }
    return finalUrl;
  },

  /**
   * Outputs the properties and values of a given object to the console.
   * This utility provides a structured view of object contents.
   * @param {object} inputObject - The object whose contents are to be displayed.
   * @returns {void}
   */
  displayObjectContents: (inputObject) => {
    // Type III: Added guard clause for non-object inputs, specifically checking for plain objects
    if (typeof inputObject !== 'object' || inputObject === null || Array.isArray(inputObject) || Object.prototype.toString.call(inputObject) !== '[object Object]') {
      console.warn(`[DisplayUtility] Input for object display is not a plain object: ${inputObject}`);
      return;
    }

    // Type II: Changed variable names, used const/let
    // Type III: Rewrote object iteration logic from for...in to Object.entries().map()
    const formattedSegments = Object.entries(inputObject).map(([keyIdentifier, valueContent]) => {
      // Type III: Modified output string format and added JSON.stringify for complex values
      return `  -> ${String(keyIdentifier).padEnd(20, '.')} : ${JSON.stringify(valueContent)}`;
    });

    // Type III: Added header and footer for better readability in console
    const consoleReport = `\n--- Object Snapshot Begin ---\n${formattedSegments.join('\n')}\n--- Object Snapshot End ---\n`;
    // Type II: Changed console.log to console.info for different log level
    console.info(consoleReport);
  },

  /**
   * Formats a given text string for emphasis within an HTML context.
   * Allows for custom styling.
   * @param {string} rawTextInput - The text string to be emphasized.
   * @param {string} accentColor - Optional: The color for emphasis (default is 'darkgreen').
   * @returns {string} An HTML string with the emphasized text.
   */
  emphasizeContent: (rawTextInput, accentColor = 'darkgreen') => { // Type III: Added optional parameter with default
    // Type III: Added robust input checking for the text itself
    const contentForDisplay = isStringNonEmpty(rawTextInput)
                              ? rawTextInput
                              : 'Placeholder text due to empty input';

    // Type II: Renamed variables, used template literals
    // Type III: Changed HTML tag from H1 to SPAN, modified style attributes, added a class
    return `<span class="emphasized-text-block" style="font-weight: 700; text-decoration: underline; color: ${accentColor}; font-size: 1.2em;">${contentForDisplay}</span>`;
  },

  // Type III: Added a completely new utility function to the module export
  // This function checks if a given value is a positive integer.
  isValidPositiveInteger: (num) => {
    // Type III: Added a guard clause for non-numeric or non-integer inputs
    if (typeof num !== 'number' || !Number.isFinite(num)) {
      return false;
    }
    return Number.isInteger(num) && num > 0;
  }

};