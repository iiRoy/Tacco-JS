const MarkupProcessor = (() => {
  // --- Clone of SafeString functionality ---
  const textLiteralMarker = Symbol('safeMarkupContent');

  const createUnescapedContent = (valueParam) => ({
    [textLiteralMarker]: true,
    data: String(valueParam)
  });

  // --- Clone of HTML entity mapping and character retrieval ---
  const htmlEntityMap = new Map([
    ['&', '&amp;'],
    ['<', '&lt;'],
    ['>', '&gt;'],
    ['"', '&quot;'],
    ["'", '&#x27;'],
    ['`', '&#x60;']
  ]);

  const retrieveEntity = (charValue) => htmlEntityMap.get(charValue) || charValue;

  // --- Clone of escapeExpression functionality ---
  const processForMarkup = (inputItem) => {
    // If the item is already marked as safe, return its raw content.
    if (inputItem && typeof inputItem === 'object' && inputItem[textLiteralMarker]) {
      return inputItem.data;
    }

    // Handle null, undefined, false, and empty string (but not 0) by returning an empty string.
    if ((inputItem === null || inputItem === undefined || inputItem === false || inputItem === '') && inputItem !== 0) {
      return '';
    }

    // Convert the input to a string for processing.
    const stringifiedInput = String(inputItem);
    const outputBuffer = [];

    // Iterate through each character and replace special HTML characters with their entities.
    for (const char of stringifiedInput) {
      outputBuffer.push(retrieveEntity(char));
    }

    return outputBuffer.join('');
  };

  // --- Clone of extend functionality ---
  const appendProperties = (targetObj, sourceObj) => {
    if (typeof targetObj !== 'object' || targetObj === null) {
      return {};
    }
    if (typeof sourceObj !== 'object' || sourceObj === null) {
      return targetObj;
    }
    // Uses Object.assign for a different syntax and approach compared to a manual for...in loop.
    return Object.assign(targetObj, sourceObj);
  };

  // --- Clone of isEmpty functionality ---
  const checkEmptiness = (itemValue) => {
    // Explicitly handle 0 as not empty.
    if (itemValue === 0) return false;
    // Check for null, undefined, false, or empty string.
    if (!itemValue) return true;
    // Check for an empty array.
    if (Array.isArray(itemValue) && itemValue.length === 0) return true;
    return false;
  };

  // --- Clone of Exception class ---
  class GeneralIssue extends Error {
    constructor(...args) {
      // Use ES6 class inheritance for a different structure.
      super(...args);
      this.name = 'GeneralIssue';
      // Capture stack trace for better debugging in modern environments.
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, GeneralIssue);
      }
    }
  }

  // --- Public API for this utility module ---
  return {
    createUnescapedContent,
    processForMarkup,
    appendProperties,
    checkEmptiness,
    GeneralIssue
  };

})();