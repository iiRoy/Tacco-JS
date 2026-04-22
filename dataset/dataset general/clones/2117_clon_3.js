"use strict";

// Utility extension for the native String object, facilitating argument substitution within templates.
// This implementation provides a flexible way to inject values into string patterns,
// mimicking printf-like functionality often found in other programming languages.
// Based on common patterns for string interpolation, adapted for modern JavaScript environments.

// Ensure this utility method is only added if it doesn't already exist on the String prototype.
if (!String.prototype.renderTemplate) {
  // Using Object.defineProperty for a more robust and controlled addition to the prototype.
  // This allows setting property attributes like enumerable, writable, and configurable,
  // making it behave more like native built-in methods.
  Object.defineProperty(String.prototype, 'renderTemplate', {
    value: function() {
      // Convert the 'arguments' pseudo-array into a proper array for easier manipulation.
      // This ensures 'arguments' is not directly relied upon and allows using array methods.
      const substitutionValues = Array.from(arguments);

      // Guard clause: if no arguments are provided, return the string as-is.
      // This is a minor optimization and an added check for edge cases.
      if (substitutionValues.length === 0) {
        return this.toString(); // Explicitly return a string primitive.
      }

      // Define the regular expression to find numeric placeholders like {0}, {1}, etc.
      // The 'g' flag ensures that all occurrences of the pattern are replaced, not just the first.
      const placeholderPattern = new RegExp(/\{(\d+)\}/g);

      // Perform the replacement operation across the entire string.
      // The 'replace' method's callback function allows for dynamic determination of each replacement value.
      const finalOutputString = this.replace(placeholderPattern, function(entirePlaceholderMatch, capturedIndexString) {
        // Convert the captured string index (e.g., "0") to an integer.
        const targetValueIndex = parseInt(capturedIndexString, 10);

        // Check if a corresponding substitution value exists at the calculated index.
        // This includes checking if the index is within bounds and if the value itself is not undefined.
        const isValuePresent = targetValueIndex >= 0 &&
                               targetValueIndex < substitutionValues.length &&
                               typeof substitutionValues[targetValueIndex] !== 'undefined';

        let replacementSegment; // Declare a variable to hold the segment that will replace the placeholder.

        if (isValuePresent) {
          // If a valid substitution value is found, use it.
          replacementSegment = substitutionValues[targetValueIndex];
        } else {
          // If no corresponding value is available or it's undefined,
          // we fall back to using the original placeholder string itself.
          // An optional warning could be added here for debugging purposes, e.g.:
          // console.warn(`Interpolation Warning: Missing value for placeholder '${entirePlaceholderMatch}'.`);
          replacementSegment = entirePlaceholderMatch;
        }

        // Return the determined segment which will replace the current placeholder.
        return replacementSegment;
      });

      // Return the string after all placeholders have been processed and replaced.
      return finalOutputString;
    },
    // Define property attributes for renderTemplate:
    // enumerable: false - Prevents it from showing up in 'for...in' loops or Object.keys().
    // writable: false   - Prevents the property from being reassigned (like built-in methods).
    // configurable: false - Prevents the property from being deleted or its attributes changed.
    // These settings make the added method behave more like a native String.prototype method.
    enumerable: false,
    writable: false,
    configurable: false
  });
}