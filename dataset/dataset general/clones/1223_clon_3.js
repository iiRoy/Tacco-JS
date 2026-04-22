const DataStructures = require('immutable');

/**
 * Merges two standard JavaScript objects using Immutable.js for efficiency.
 * This operation creates a new object without modifying the originals.
 *
 * @param {object} baseObject The initial object.
 * @param {object} overlayObject The object whose properties will overwrite or add to the baseObject.
 * @returns {object} A new JavaScript object representing the merged result.
 */
const combineObjects = (baseObject, overlayObject) => {
  // Ensure inputs are valid objects before proceeding
  if (typeof baseObject !== 'object' || baseObject === null) {
    baseObject = {};
  }
  if (typeof overlayObject !== 'object' || overlayObject === null) {
    overlayObject = {};
  }

  // Convert the base object to an Immutable Map, then merge with the overlay object,
  // and finally convert the result back to a plain JavaScript object.
  const immutableBase = DataStructures.Map(baseObject);
  const mergedImmutable = immutableBase.merge(overlayObject);
  const finalResult = mergedImmutable.toJS();

  return finalResult;
};

/**
 * Creates a new object by adding or updating a single property on an existing object.
 * This leverages the `combineObjects` utility for immutability.
 *
 * @param {object} initialObject The object to which the property will be added or updated.
 * @param {string} propertyName The key of the property to set.
 * @param {*} propertyValue The value to assign to the property.
 * @returns {object} A new object with the specified property set.
 */
const updateOrAddProperty = (initialObject, propertyName, propertyValue) => {
  // Basic validation for propertyName
  if (typeof propertyName !== 'string' || propertyName.trim() === '') {
    console.warn("Attempted to set a property with an invalid or empty name.");
    return combineObjects(initialObject, {}); // Return a copy of the original
  }

  // Create a temporary object containing only the new or updated property.
  const singlePropertyHolder = {};
  singlePropertyHolder[propertyName] = propertyValue;

  // Use the combineObjects utility to merge the new property into the initial object.
  return combineObjects(initialObject, singlePropertyHolder);
};

/**
 * Generates a higher-order function that, when invoked, consistently returns a predefined value.
 *
 * @param {*} fixedValue The value that the inner function will always return.
 * @returns {function(): *} A function that takes no arguments and always returns `fixedValue`.
 */
const createConstantFunction = (fixedValue) => {
  // Return a new function that captures `fixedValue` from its closure.
  return function someValueProvider() {
    return fixedValue;
  };
};

/**
 * Positions the text cursor at the very end of a contenteditable HTML element.
 * This function handles modern browsers (using Range and Selection APIs)
 * and provides a fallback for older Internet Explorer versions.
 *
 * @param {HTMLElement} targetEditableNode The HTML element with `contenteditable="true"`.
 * @returns {boolean} True if the cursor was successfully placed, false otherwise.
 */
const focusContentEditableEnd = (targetEditableNode) => {
  // Ensure we have a valid DOM element to work with.
  if (!targetEditableNode || typeof targetEditableNode.focus !== 'function') {
    console.error("Invalid target element provided for cursor positioning.");
    return false;
  }

  let textRange;
  let currentSelection;
  const currentDocument = document; // Local reference to document for consistency

  // Attempt to use modern browser APIs first.
  if (currentDocument && typeof currentDocument.createRange === 'function' && window && typeof window.getSelection === 'function') {
    // Modern browser path (Firefox, Chrome, Safari, Opera, IE 9+)
    try {
      textRange = currentDocument.createRange(); // Create a new text range object.
      textRange.selectNodeContents(targetEditableNode); // Set the range to encompass all content.
      textRange.collapse(false); // Move the range's endpoint to the very end of its contents.

      currentSelection = window.getSelection(); // Get the active selection object.
      currentSelection.removeAllRanges(); // Clear any existing selections.
      currentSelection.addRange(textRange); // Apply our newly created range as the visible selection.

      targetEditableNode.focus(); // Explicitly focus the element after selection.
      return true;
    } catch (error) {
      console.error("Error setting cursor in modern browser:", error);
      return false;
    }
  } else if (currentDocument && currentDocument.body && typeof currentDocument.body.createTextRange === 'function') {
    // Legacy Internet Explorer path (IE 8 and lower)
    try {
      textRange = currentDocument.body.createTextRange(); // Create a legacy text range.
      textRange.moveToElementText(targetEditableNode); // Set the range to the element's text.
      textRange.collapse(false); // Move the range's endpoint to the end.
      textRange.select(); // Make the range the active selection.

      targetEditableNode.focus(); // Ensure the element is focused.
      return true;
    } catch (error) {
      console.error("Error setting cursor in legacy IE:", error);
      return false;
    }
  } else {
    // Fallback if no supported method is found.
    console.warn("Browser does not support required APIs for contenteditable cursor placement.");
    targetEditableNode.focus(); // Still try to focus, even without precise cursor placement.
    return false;
  }
};

// Export the utility functions for external use.
module.exports = {
  mergePlainObjects: combineObjects,
  setObjectProperty: updateOrAddProperty,
  getConstFunction: createConstantFunction,
  moveCursorToEndOfEditable: focusContentEditableEnd
};