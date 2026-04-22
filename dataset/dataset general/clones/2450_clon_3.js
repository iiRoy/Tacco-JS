/**
 * @license
 * This source code is provided under the Apache License 2.0.
 * For full license text, see the accompanying LICENSE file or visit
 * https://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * @fileoverview This module offers a flexible content binding utility for
 * dynamically populating and updating DOM elements based on a provided data
 * source. It's designed to simplify UI localization and data-driven rendering.
 *
 * It supports several custom HTML attributes as binding directives:
 *
 *   * `data-content-key`: Sets the `textContent` of an element.
 *     Example: `<span data-content-key="app.welcomeMessage"></span>`
 *
 *   * `data-option-list`: Populates `<option>` elements within a `<select>` tag.
 *     The referenced data key should resolve to an array. Each array item can be
 *     a simple string (used for both value and display text) or a two-element
 *     array `[optionValue, displayLabel]`.
 *     Example: `<select data-option-list="user.preferences.themes"></select>`
 *
 *   * `data-attribute-bindings`: Assigns values to HTML attributes or DOM properties.
 *     Properties are prefixed with a `.` and can support nested paths.
 *     Syntax: `attributeName:dataKey; .domProperty:dataKey; .nested.prop.path:dataKey`
 *     Example: `<img data-attribute-bindings="alt:imageAltText; src:imageUrl; .dataset.id:itemId">`
 *
 * This utility aims to be a robust and configurable solution for integrating
 * dynamic data into static HTML structures, often used in conjunction with
 * internationalization (i18n) frameworks.
 */

const contentBinder = (function() {
  /**
   * Default configuration options for the content binding process.
   * These can be overridden when calling `applyContentBindings`.
   * @const {object}
   */
  const defaultProcessingOptions = {
    maxRecursionDepth: 5,   // Maximum depth for nested content processing (e.g., innerHTML)
    logWarnings: true,      // Enable console warnings for non-critical issues
    trimKeys: true,         // Trim whitespace from data lookup keys and directive values
    clearMissingContent: true // Clear textContent/innerHTML if data key is not found
  };

  /**
   * Safely retrieves a value from a potentially deeply nested object path.
   * @param {object} sourceObject The object to traverse.
   * @param {Array<string>} propertyPath An array of property names representing the path.
   * @returns {*} The value at the specified path, or `undefined` if any part of the path is invalid.
   */
  function retrieveNestedValue(sourceObject, propertyPath) {
    let currentObject = sourceObject;
    for (let i = 0; i < propertyPath.length; i++) {
      const keySegment = propertyPath[i];
      if (currentObject === null || typeof currentObject !== 'object' || !Object.prototype.hasOwnProperty.call(currentObject, keySegment)) {
        return undefined;
      }
      currentObject = currentObject[keySegment];
    }
    return currentObject;
  }

  /**
   * Safely sets a value on a potentially deeply nested object path, creating
   * intermediate objects if they don't exist or are not objects.
   * @param {object} rootObject The object to modify.
   * @param {Array<string>} propertyPath An array of property names.
   * @param {*} valueToAssign The value to set at the end of the path.
   * @returns {boolean} `true` if assignment was successful, `false` otherwise (e.g., path points to non-object).
   */
  function assignNestedValue(rootObject, propertyPath, valueToAssign) {
    let current = rootObject;
    const lastKeyIndex = propertyPath.length - 1;

    for (let i = 0; i < lastKeyIndex; i++) {
      const key = propertyPath[i];
      if (current === null || typeof current !== 'object') {
        return false; // Cannot traverse or create path if an intermediate is not an object
      }
      if (!Object.prototype.hasOwnProperty.call(current, key) || typeof current[key] !== 'object' || current[key] === null) {
        current[key] = {}; // Auto-create an empty object for intermediate path segments
      }
      current = current[key];
    }

    if (current && typeof current === 'object' && propertyPath[lastKeyIndex]) {
      current[propertyPath[lastKeyIndex]] = valueToAssign;
      return true;
    }
    return false;
  }

  /**
   * Retrieves a value from the data source, supporting both direct property access
   * and a `getValue` or `getString` method if the data source implements it.
   * @param {object} dataSource The data source object (e.g., LoadTimeData instance or plain object).
   * @param {string} keyPath The key or path to retrieve.
   * @returns {*} The retrieved value, or `undefined`.
   */
  function getDataValue(dataSource, keyPath) {
    if (dataSource.getValue && typeof dataSource.getValue === 'function') {
      return dataSource.getValue(keyPath);
    }
    if (dataSource.getString && typeof dataSource.getString === 'function') {
      return dataSource.getString(keyPath);
    }
    // Fallback to direct property access for plain objects
    const pathSegments = keyPath.split('.');
    return retrieveNestedValue(dataSource, pathSegments);
  }

  /**
   * Defines the content binding directive handlers.
   * Each key is a custom HTML attribute name, and its value is a function
   * that processes elements possessing that attribute.
   * @type {Object<string, Function>}
   */
  const bindingDirectiveHandlers = {
    /**
     * Handles the `data-content-key` directive: Sets the `textContent` of the target node.
     * @param {HTMLElement} targetNode The DOM node to modify.
     * @param {string} dataIdentifier The key to look up in the data source.
     * @param {object} dataBundle The object containing string/resource data.
     * @param {object} currentOptions Current processing options.
     */
    'data-content-key': (targetNode, dataIdentifier, dataBundle, currentOptions) => {
      const effectiveKey = currentOptions.trimKeys ? dataIdentifier.trim() : dataIdentifier;
      if (!effectiveKey) {
        if (currentOptions.logWarnings) console.warn('Empty content binding key provided for node:', targetNode);
        if (currentOptions.clearMissingContent) targetNode.textContent = '';
        return;
      }

      const content = getDataValue(dataBundle, effectiveKey);

      if (content !== undefined && content !== null) {
        targetNode.textContent = String(content);
      } else {
        if (currentOptions.logWarnings) console.warn(`Value for key "${effectiveKey}" not found in data source for node:`, targetNode);
        if (currentOptions.clearMissingContent) targetNode.textContent = '';
      }
    },

    /**
     * Handles the `data-option-list` directive: Populates a `<select>` element with `<option>` children.
     * @param {HTMLSelectElement} dropdownNode The `<select>` element to populate.
     * @param {string} listSourceKey The key pointing to an array of option data in the data source.
     * @param {object} dataBundle The object containing resource data.
     * @param {object} currentOptions Current processing options.
     */
    'data-option-list': (dropdownNode, listSourceKey, dataBundle, currentOptions) => {
      const effectiveKey = currentOptions.trimKeys ? listSourceKey.trim() : listSourceKey;
      if (!effectiveKey) {
        if (currentOptions.logWarnings) console.warn('Empty option list key provided for dropdown:', dropdownNode);
        dropdownNode.innerHTML = ''; // Clear existing options if key is invalid
        return;
      }

      const optionItems = getDataValue(dataBundle, effectiveKey);

      // Ensure the retrieved data is an array.
      if (!Array.isArray(optionItems)) {
        if (currentOptions.logWarnings) console.warn(`Expected an array for option list key "${effectiveKey}", but got:`, optionItems, 'for dropdown:', dropdownNode);
        dropdownNode.innerHTML = '';
        return;
      }

      // Efficiently clear all existing options.
      while (dropdownNode.firstChild) {
        dropdownNode.removeChild(dropdownNode.firstChild);
      }

      // Add a placeholder option if the list is empty and desired (e.g., for UX).
      if (optionItems.length === 0 /* && currentOptions.addPlaceholderOption */) {
        const placeholderOption = document.createElement('option');
        placeholderOption.value = '';
        placeholderOption.textContent = '-- Please select --'; // This text could also be localized
        dropdownNode.appendChild(placeholderOption);
      }

      // Iterate and create new options.
      optionItems.forEach(itemEntry => {
        let newOption;
        if (typeof itemEntry === 'string') {
          // If item is a string, use it for both value and display text.
          newOption = new Option(itemEntry, itemEntry);
        } else if (Array.isArray(itemEntry) && itemEntry.length >= 1) {
          // If item is an array, assume [value, display_text] or [display_text].
          const optionValue = String(itemEntry[0]);
          const optionText = String(itemEntry[1] !== undefined ? itemEntry[1] : itemEntry[0]);
          newOption = new Option(optionText, optionValue);
        } else {
          if (currentOptions.logWarnings) console.warn('Skipping malformed option data item:', itemEntry, 'for key:', effectiveKey);
          return; // Skip this item and continue
        }
        dropdownNode.appendChild(newOption);
      });
    },

    /**
     * Handles the `data-attribute-bindings` directive: Sets HTML attributes or DOM properties.
     * Syntax: `attrName:dataKey; .domProperty:dataKey; .nested.dom.property:dataKey`
     * @param {HTMLElement} boundElement The DOM node to modify.
     * @param {string} bindingDefinitionString The string containing attribute/property assignments.
     * @param {object} dataBundle The object containing resource data.
     * @param {object} currentOptions Current processing options.
     * @param {number} currentRecurDepth Current recursion depth for nested processing (e.g., innerHTML).
     */
    'data-attribute-bindings': (boundElement, bindingDefinitionString, dataBundle, currentOptions, currentRecurDepth) => {
      // Split by semicolon; allow spaces within segments and keys/values.
      const individualAssignments = bindingDefinitionString.split(';');

      for (const assignmentSegment of individualAssignments) {
        const trimmedSegment = currentOptions.trimKeys ? assignmentSegment.trim() : assignmentSegment;
        if (!trimmedSegment) continue; // Skip empty segments

        const assignmentMatch = trimmedSegment.match(/^([^:]+):(.+)$/);
        if (!assignmentMatch) {
          if (currentOptions.logWarnings) console.error('Malformed binding instruction:', trimmedSegment, 'in directive:', bindingDefinitionString, 'for element:', boundElement);
          continue;
        }

        const targetSpecification = currentOptions.trimKeys ? assignmentMatch[1].trim() : assignmentMatch[1];
        const dataPath = currentOptions.trimKeys ? assignmentMatch[2].trim() : assignmentMatch[2];

        if (!dataPath) {
          if (currentOptions.logWarnings) console.warn(`Empty data lookup path for target "${targetSpecification}" on element:`, boundElement);
          continue;
        }

        const valueFromSource = getDataValue(dataBundle, dataPath);

        // Determine behavior if value is null or undefined.
        if (valueFromSource === undefined || valueFromSource === null) {
          if (currentOptions.logWarnings) console.warn(`No value found for data key "${dataPath}" for target "${targetSpecification}" on element:`, boundElement);
          // Depending on requirements, one might want to remove the attribute or set a default.
          // For properties, setting to null/undefined might clear them, which could be desired.
          continue; // Skip assignment if no value found
        }

        // Check if it's a DOM property assignment (starts with '.')
        if (targetSpecification.startsWith('.')) {
          const propertyPathSegments = targetSpecification.slice(1).split('.');
          const lastSegment = propertyPathSegments[propertyPathSegments.length - 1];

          const assignmentSuccess = assignNestedValue(boundElement, propertyPathSegments, valueFromSource);

          if (!assignmentSuccess && currentOptions.logWarnings) {
            console.warn(`Failed to set nested property "${targetSpecification}" with value "${valueFromSource}" on element:`, boundElement);
          }

          // Special handling for 'innerHTML' property: re-process the new content for further bindings.
          if (lastSegment === 'innerHTML' && typeof valueFromSource === 'string') {
            if (currentRecurDepth < currentOptions.maxRecursionDepth) {
              // To ensure new content is processed correctly before being placed in the DOM,
              // we process it in a detached temporary container.
              const tempFragment = document.createElement('div');
              tempFragment.innerHTML = valueFromSource;
              // Recursively apply bindings to the content within the temporary fragment.
              applyContentBindings(tempFragment, dataBundle, currentOptions, currentRecurDepth + 1);
              // Now, assign the fully processed HTML back to the element.
              boundElement.innerHTML = tempFragment.innerHTML;
            } else if (currentOptions.logWarnings) {
              console.warn(`Max recursion depth (${currentOptions.maxRecursionDepth}) reached for innerHTML processing on element:`, boundElement);
            }
          }
        } else {
          // Standard HTML attribute assignment.
          boundElement.setAttribute(targetSpecification, String(valueFromSource));

          // Example: Basic validation for common URL attributes.
          if (['src', 'href', 'data'].includes(targetSpecification.toLowerCase())) {
            try {
              // Attempt to create a URL object to validate the format.
              // `document.baseURI` provides a base for relative URLs.
              new URL(String(valueFromSource), document.baseURI);
            } catch (urlError) {
              if (currentOptions.logWarnings) console.warn(`Invalid URL format "${valueFromSource}" for attribute "${targetSpecification}" on element:`, boundElement, urlError);
              // Optionally, remove the invalid attribute or set a fallback.
              // boundElement.removeAttribute(targetSpecification);
            }
          }
        }
      }
    }
  };

  // Collect all directive attribute names to build an efficient CSS selector.
  const registeredDirectiveAttributes = Object.keys(bindingDirectiveHandlers);
  const domQuerySelectorString = '[' + registeredDirectiveAttributes.join('],[') + ']';

  /**
   * Processes a DOM tree, applying content bindings based on provided data.
   * This is the main entry point for the content binding utility.
   * @param {HTMLElement|Document} rootNode The root of the DOM tree to process.
   * @param {object} dataBundle The dictionary or object containing data for bindings.
   * @param {object} [options={}] Configuration options for this processing run.
   * @param {number} [recursiveDepth=0] Internal parameter to track recursion depth (do not set manually).
   */
  function applyContentBindings(rootNode, dataBundle, options = {}, recursiveDepth = 0) {
    // Merge user-provided options with default settings.
    const effectiveOptions = { ...defaultProcessingOptions, ...options };

    // Basic validation for the root node and data bundle.
    if (!(rootNode instanceof HTMLElement) && !(rootNode instanceof Document) && rootNode !== document) {
      if (effectiveOptions.logWarnings) console.error('Invalid root node provided for content binding:', rootNode);
      return;
    }
    if (!dataBundle || typeof dataBundle !== 'object') {
      if (effectiveOptions.logWarnings) console.error('Invalid data bundle provided for content binding:', dataBundle);
      return;
    }

    // Guard against excessive recursion, which could indicate a circular dependency or malformed HTML.
    if (recursiveDepth > effectiveOptions.maxRecursionDepth) {
      if (effectiveOptions.logWarnings) console.warn(`Maximum recursion depth (${effectiveOptions.maxRecursionDepth}) exceeded during content binding. Skipping further processing for node:`, rootNode);
      return;
    }

    // Find all elements within the rootNode that have any of our binding directives.
    // Convert NodeList to an array for safe iteration, especially if DOM changes occur.
    const eligibleElements = Array.from(rootNode.querySelectorAll(domQuerySelectorString));

    // Iterate through each element found to apply its directives.
    for (const currentElement of eligibleElements) {
      // For each element, check against all registered directive attributes.
      for (const directiveAttributeName of registeredDirectiveAttributes) {
        const directiveAttributeValue = currentElement.getAttribute(directiveAttributeName);

        // If the element possesses this directive attribute, invoke its handler.
        if (directiveAttributeValue !== null) {
          const handlerFn = bindingDirectiveHandlers[directiveAttributeName];
          if (handlerFn) {
            try {
              // Pass the element, directive value, data, options, and current recursion depth to the handler.
              handlerFn(currentElement, directiveAttributeValue, dataBundle, effectiveOptions, recursiveDepth);
            } catch (processingError) {
              // Log errors to prevent one faulty binding from crashing the entire process.
              if (effectiveOptions.logWarnings) console.error(`Error processing directive "${directiveAttributeName}" on element:`, currentElement, 'with value:', directiveAttributeValue, 'Error:', processingError);
            }
          } else {
            // This case should ideally not happen if `registeredDirectiveAttributes` is correctly derived.
            if (effectiveOptions.logWarnings) console.warn(`No handler function found for registered directive attribute "${directiveAttributeName}". This indicates an internal configuration issue.`);
          }
        }
      }
    }
  }

  // Expose the primary function for external use.
  return {
    apply: applyContentBindings,
    // Optionally, internal components could be exposed for advanced usage or testing:
    // _directiveHandlers: bindingDirectiveHandlers,
    // _getDefaultOptions: () => ({ ...defaultProcessingOptions }),
    // _getNestedValue: retrieveNestedValue,
    // _setNestedValue: assignNestedValue
  };
})();