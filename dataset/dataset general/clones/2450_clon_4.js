// This module provides a DOM-based localization templating system.
// It applies internationalized content and values to elements
// based on custom data attributes, mimicking a well-known pattern.

const localeTransformer = (function() {
  const TEXT_TAG_ATTRIBUTE = 'data-tx-text';
  const OPTIONS_TAG_ATTRIBUTE = 'data-tx-opts';
  const VALUES_TAG_ATTRIBUTE = 'data-tx-vals';

  /**
   * Helper function to set a nested property on an object.
   * @param {Object} targetObject The object to modify.
   * @param {Array<string>} pathSegments The array of property names forming the path.
   * @param {*} valueToSet The value to assign at the end of the path.
   */
  function applyNestedProperty(targetObject, pathSegments, valueToSet) {
    let currentBranch = targetObject;
    for (let i = 0; i < pathSegments.length - 1; i++) {
      let node = pathSegments[i];
      if (!(node in currentBranch) || typeof currentBranch[node] !== 'object' || currentBranch[node] === null) {
        currentBranch[node] = {}; // Initialize intermediate objects if they don't exist
      }
      currentBranch = currentBranch[node];
    }
    currentBranch[pathSegments[pathSegments.length - 1]] = valueToSet;
  }

  /**
   * Processes a single DOM element's localization attributes and applies transformations.
   * @param {HTMLElement} currentDomNode The element whose attributes are to be processed.
   * @param {Object} dataAccessor The object providing localized data (e.g., strings, arrays).
   * @returns {boolean} True if the element's innerHTML property was modified, false otherwise.
   */
  const processNodeAttributes = (currentDomNode, dataAccessor) => {
    let innerContentModified = false;

    // Handle 'data-tx-text' attribute: sets textContent
    const textIdentifier = currentDomNode.getAttribute(TEXT_TAG_ATTRIBUTE);
    if (textIdentifier !== null) {
      currentDomNode.textContent = dataAccessor.fetchString(textIdentifier);
    }

    // Handle 'data-tx-opts' attribute: populates <select> with <option> elements
    const optionIdentifier = currentDomNode.getAttribute(OPTIONS_TAG_ATTRIBUTE);
    if (optionIdentifier !== null) {
      const optionDataList = dataAccessor.retrieveCollection(optionIdentifier);
      if (!Array.isArray(optionDataList)) {
        throw new Error(`Localization error: Expected an array for '${OPTIONS_TAG_ATTRIBUTE}', received: ${typeof optionDataList}`);
      }

      for (const item of optionDataList) {
        const newOption = document.createElement('option');
        if (typeof item === 'string') {
          newOption.textContent = item;
          newOption.value = item;
        } else if (Array.isArray(item) && item.length >= 1) {
          newOption.value = String(item[0]);
          newOption.textContent = String(item.length > 1 ? item[1] : item[0]);
        } else {
          throw new Error(`Localization error: Malformed option data in '${OPTIONS_TAG_ATTRIBUTE}': ${JSON.stringify(item)}`);
        }
        currentDomNode.appendChild(newOption);
      }
    }

    // Handle 'data-tx-vals' attribute: sets HTML attributes or DOM properties
    const valueDefinitions = currentDomNode.getAttribute(VALUES_TAG_ATTRIBUTE);
    if (valueDefinitions !== null) {
      // Regular expression to find attribute/property-key pairs, separated by semicolons
      const partsIterator = valueDefinitions.matchAll(/([^:]+?):([^;]+?)(;|$)/g);

      for (const match of partsIterator) {
        const targetPath = match[1].trim();
        const dataKeyReference = match[2].trim();

        if (!targetPath || !dataKeyReference) {
          throw new Error(`Localization error: Invalid syntax in '${VALUES_TAG_ATTRIBUTE}': ${match[0]}`);
        }

        const retrievedData = dataAccessor.retrieveValue(dataKeyReference);

        if (targetPath.startsWith('.')) {
          // This is a DOM property (possibly nested)
          const propertyPathComponents = targetPath.substring(1).split('.');
          const lastProperty = propertyPathComponents[propertyPathComponents.length - 1];

          applyNestedProperty(currentDomNode, propertyPathComponents, retrievedData);

          if (lastProperty === 'innerHTML') {
            innerContentModified = true; // Signal that innerHTML was changed
          }
        } else {
          // This is a standard HTML attribute
          currentDomNode.setAttribute(targetPath, retrievedData);
        }
      }
    }
    return innerContentModified;
  };

  /**
   * Performs a recursive depth-first traversal of the DOM, applying localization
   * to elements encountered based on their attributes.
   * @param {HTMLElement} entryPoint The root element from which to start processing.
   * @param {Object} sourceData The data provider for localization values.
   */
  function recursiveDomTraversal(entryPoint, sourceData) {
    // Process attributes on the current node.
    // The return value (innerContentModified) is not directly used here to alter the flow,
    // as Array.from(entryPoint.children) naturally captures new children if innerHTML was set.
    processNodeAttributes(entryPoint, sourceData);

    // Create a snapshot of children to avoid issues with live collections
    // if a child's innerHTML were to be modified during iteration (though not directly handled here).
    const childNodesToProcess = Array.from(entryPoint.children);

    for (const child of childNodesToProcess) {
      // Only process element nodes
      if (child.nodeType === Node.ELEMENT_NODE) {
        recursiveDomTraversal(child, sourceData);
      }
    }
  }

  return {
    applyTranslations: recursiveDomTraversal
  };
})();