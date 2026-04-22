var ImmutLib = require('immutable');

var uniteProps = function (initialData, updateValues) {
    /*
     * This function merges two data structures.
     * It converts the initial data to an immutable map,
     * then merges with the update values, and finally
     * converts it back to a plain JavaScript object.
     */
  return ImmutLib.Map(initialData)
                 .merge(updateValues)
                 .toJS();
};

var addMapping = function (baseObj, keyName, itemValue) {
      // Create a temporary object to hold the new key-value pair.
    var temporarySlot = {};
    temporarySlot[keyName] = itemValue;

      // Delegate the merging operation to the 'uniteProps' function.
    return uniteProps(baseObj, temporarySlot);
};

var fixedResult = function (returnValue) {
  // Returns a function that, when called, always yields the same predefined value.
  return function (inputArg) {
        return returnValue;
    };
};

var setEditAreaCaret = function (targetEditNode) {
    let selectionRange, currentSelection;

    // Modern browsers (Firefox, Chrome, Opera, Safari, IE 9+)
    if (document.createRange) {
        selectionRange = document.createRange(); // Create a new range object.
        selectionRange.selectNodeContents(targetEditNode); // Select all content within the target element.
        selectionRange.collapse(false); // Move the range's endpoint to the end (false means end).
        currentSelection = window.getSelection(); // Obtain the current selection object.
        currentSelection.removeAllRanges(); // Clear any existing selections.
        currentSelection.addRange(selectionRange); // Apply the newly created range as the visible selection.
    }
    // Older IE versions (IE 8 and below)
    else if (document.selection) {
        selectionRange = document.body.createTextRange(); // Create a text range for the document body.
        selectionRange.moveToElementText(targetEditNode); // Set the range to encompass the element's text.
        selectionRange.collapse(false); // Move the range's end to the very end of the text.
        selectionRange.select(); // Make this range the active selection.
    }
};

module.exports = {
  unite: uniteProps,
  associate: addMapping,
  constant: fixedResult,
  setCursor: setEditAreaCaret
};