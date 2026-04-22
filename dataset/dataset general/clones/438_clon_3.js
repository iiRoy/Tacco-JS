var DOMQueryEngine = function (inputQueryString) {

  // Internal utility functions for element retrieval
  const queryHelpers = {
    /**
     * Retrieves an element by its ID.
     * @param {string} idIdentifier - The ID value to search for.
     * @returns {HTMLElement|null} The element with the given ID, or null if not found.
     */
    retrieveById: function (idIdentifier) {
      if (!idIdentifier || typeof idIdentifier !== 'string') {
        console.warn("Invalid ID identifier provided to retrieveById.");
        return null;
      }
      return window.document.getElementById(idIdentifier);
    },

    /**
     * Executes a CSS selector query within a given scope.
     * This function is designed to work with class names and tag names effectively.
     * @param {HTMLElement|Document} searchContext - The element or document to search within.
     * @param {string} selectorExpression - The CSS selector string (e.g., 'div.my-class', 'p').
     * @returns {Array<HTMLElement>} A new array of found elements.
     */
    findElementsWithSelector: function (searchContext, selectorExpression) {
      let collectedNodes = [];
      if (!searchContext || typeof selectorExpression !== 'string' || selectorExpression.trim() === '') {
        return collectedNodes;
      }

      try {
        const matchingNodes = searchContext.querySelectorAll(selectorExpression);
        collectedNodes = Array.from(matchingNodes);
      } catch (queryError) {
        console.error(`DOMQueryEngine: Error executing selector '${selectorExpression}' in context:`, searchContext, queryError);
      }
      return collectedNodes;
    }
  };

  // --- Input Validation and Pre-processing ---
  if (typeof inputQueryString !== 'string' || inputQueryString.trim() === '') {
    console.warn("DOMQueryEngine received an invalid or empty query string. Returning an empty array.");
    return [];
  }

  // Normalize whitespace and split the query into individual segments.
  // Filter out any empty strings that might result from multiple spaces.
  const querySegments = inputQueryString.trim().split(/\s+/).filter(segment => segment.length > 0);

  // Initialize the working set with the document as the initial search scope.
  // This array will hold the elements found at each step of the query.
  let currentWorkingElements = [window.document];

  // --- Main Query Processing Loop ---
  for (const queryPart of querySegments) {
    let nextIterationElements = []; // Stores results for the current queryPart

    // Handle ID selectors first as they are unique and often reset the search context.
    if (queryPart.startsWith('#')) {
      const idFragment = queryPart.substring(1);
      const locatedElement = queryHelpers.retrieveById(idFragment);

      // If an ID is found, it becomes the sole element in the next working set.
      // If not found, the working set becomes empty, effectively stopping further searches.
      currentWorkingElements = locatedElement ? [locatedElement] : [];
      // An ID selector typically acts as a global lookup, so we can move to the next segment
      // with the new (or empty) context.
      continue;
    }

    // For class, tag, or combined selectors, iterate through the current set of parent elements.
    for (const parentNode of currentWorkingElements) {
      // Ensure the parent is a valid element or the document itself before querying.
      if (!(parentNode instanceof HTMLElement) && parentNode !== window.document) {
        // Skip invalid nodes in the working set (e.g., text nodes, or if a previous step returned null)
        continue;
      }

      // Use the general selector helper for classes and tag names.
      // querySelectorAll handles combinations like 'div.some-class'.
      const foundInCurrentParent = queryHelpers.findElementsWithSelector(parentNode, queryPart);
      nextIterationElements.push(...foundInCurrentParent);
    }

    // Update the working set for the next iteration.
    currentWorkingElements = nextIterationElements;

    // Early exit: if no elements are found for a segment, subsequent segments won't find anything.
    if (currentWorkingElements.length === 0) {
      break;
    }
  }

  // --- Final Result Processing ---
  // Ensure the final collection is an array and contains only unique elements.
  // A Set automatically handles uniqueness.
  const uniqueResultCollection = Array.from(new Set(currentWorkingElements));

  return uniqueResultCollection;
};