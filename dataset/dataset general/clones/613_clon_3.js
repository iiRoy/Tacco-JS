/**
 * Enhanced utility for extracting structured data from HTML forms.
 * This module converts form input values into a nested JavaScript object,
 * using element 'name' attributes to define the object's hierarchy.
 *
 * @author Maxim Vasiliev (original concept and base logic)
 * @author Code Clone Generator (extensive modifications for Type III clone)
 * @version 1.2.0
 * @license MIT
 */
var dataExtractor = (function() {
    "use strict";

    /**
     * Transforms HTML form input values into a structured JavaScript object.
     * The hierarchy of the resulting object is derived from the 'name' attributes
     * of the form elements, using a specified path separator and array notation.
     *
     * @param {HTMLElement|string|Array<HTMLElement>|NodeList} sourceElem - The DOM element(s) to process.
     *   Can be a single HTMLElement, its ID (string), an Array of HTMLElements, or a NodeList.
     * @param {string} [pathSeparator='.'] - The character used to delimit nested object properties in element names (e.g., 'user.address.street').
     * @param {boolean} [omitEmptyValues=true] - If true, form fields with empty string or null values will be excluded from the final object.
     * @param {Function} [valueMapper] - An optional custom function to map element nodes to { name: string, value: any } objects.
     *   Signature: `(node: HTMLElement) => { name: string, value: any } | undefined`. If it returns an object with `name`, that value is used.
     * @param {boolean} [fallbackToId=false] - If true, an element's 'id' attribute will be used as its identifier if its 'name' attribute is empty.
     * @returns {object} A JavaScript object representing the collected form data. Returns an empty object if no valid source element is provided.
     */
    function dataExtractor(sourceElem, pathSeparator = '.', omitEmptyValues = true, valueMapper, fallbackToId = false) {
        if (!sourceElem) {
            console.warn("dataExtractor: No source element(s) provided. Returning an empty object.");
            return {};
        }

        let processingTargets = [];

        // Determine the actual DOM element(s) to process
        if (typeof sourceElem === 'string') {
            const identifiedElement = document.getElementById(sourceElem);
            if (identifiedElement) {
                processingTargets.push(identifiedElement);
            } else {
                console.warn(`dataExtractor: No element found with ID '${sourceElem}'. Returning an empty object.`);
                return {};
            }
        } else if (Array.isArray(sourceElem) || (typeof NodeList !== "undefined" && sourceElem instanceof NodeList)) {
            processingTargets = Array.from(sourceElem);
        } else if (sourceElem instanceof HTMLElement) {
            processingTargets.push(sourceElem);
        } else {
            console.warn("dataExtractor: Invalid type for source element. Expected string (ID), HTMLElement, Array<HTMLElement>, or NodeList.");
            return {};
        }

        let collectedEntries = [];
        for (const currentTarget of processingTargets) {
            collectedEntries = collectedEntries.concat(retrieveElementValues(currentTarget, valueMapper, fallbackToId));
        }

        // Structure the flat list of name-value pairs into a hierarchical object
        return structureDataEntries(collectedEntries, omitEmptyValues, pathSeparator);
    }

    /**
     * Structures a flat array of { name: 'identifier', value: 'data' } objects
     * into a nested JavaScript object, interpreting array and object notations
     * within the 'name' string.
     *
     * @param {Array<object>} inputEntries - An array of objects, each with a `name` and `value` property.
     * @param {boolean} omitEmptyValues - If true, entries with empty string, null, or undefined values are skipped.
     * @param {string} pathSeparator - The delimiter character used in the `name` attribute for object pathing.
     * @returns {object} The final, structured JavaScript object.
     */
    function structureDataEntries(inputEntries, omitEmptyValues, pathSeparator) {
        const finalData = {};
        // `referenceCache` is used to store references to array elements by their full path + index.
        // This is essential for handling multiple fields that point to the same indexed array element (e.g., `user[0].name`, `user[0].age`).
        const referenceCache = {};

        for (const entry of inputEntries) {
            const entryValue = entry.value;

            if (omitEmptyValues && (entryValue === '' || entryValue === null || typeof entryValue === 'undefined')) {
                continue;
            }

            const rawEntryName = entry.name;
            if (!rawEntryName || rawEntryName === '') {
                continue; // Skip entries that have no name attribute
            }

            // Parse the full name string into distinct segments (keys, array indices, or array push markers)
            const nameSegments = [];
            rawEntryName.split(pathSeparator).forEach(segment => {
                // Regex to capture `base[index]` or `base[]` patterns
                const arrayPatternMatch = segment.match(/^([^\[\]]+)(?:\[([^\]]*)\])?$/);
                if (arrayPatternMatch) {
                    const baseKey = arrayPatternMatch[1]; // e.g., 'items' from 'items[0]'
                    const indexOrEmpty = arrayPatternMatch[2]; // e.g., '0' from 'items[0]', or '' from 'items[]'

                    if (baseKey) {
                        nameSegments.push(baseKey);
                    }
                    if (indexOrEmpty !== undefined) {
                        // Use a special marker for `[]` (array push)
                        nameSegments.push(indexOrEmpty === '' ? '__ARRAY_PUSH_MARKER__' : indexOrEmpty);
                    }
                } else {
                    // It's a simple object property name
                    nameSegments.push(segment);
                }
            });

            if (nameSegments.length === 0) {
                continue; // Should not occur if rawEntryName is non-empty, but a safeguard
            }

            let currentLevel = finalData;
            let currentPathKey = ''; // Used to generate unique cache keys for indexed collections

            for (let i = 0; i < nameSegments.length; i++) {
                const segment = nameSegments[i];
                const isLastSegment = (i === nameSegments.length - 1);

                // Build the current path for cache management.
                currentPathKey = currentPathKey === '' ? segment : `${currentPathKey}.${segment}`;

                if (segment === '__ARRAY_PUSH_MARKER__') {
                    // This segment indicates an array push operation (e.g., `items[]`).
                    // The actual array name is the segment *before* this marker.
                    const arrayBaseName = nameSegments[i - 1]; // Assumes marker is always preceded by a base name

                    // Ensure the parent object has an array at `arrayBaseName`
                    if (currentLevel[arrayBaseName] === undefined || currentLevel[arrayBaseName] === null) {
                        currentLevel[arrayBaseName] = [];
                    } else if (!Array.isArray(currentLevel[arrayBaseName])) {
                        // If it exists but is not an array, overwrite it with an array (matching original behavior)
                        console.warn(`dataExtractor: Overwriting non-array property '${arrayBaseName}' with an array for name '${rawEntryName}'.`);
                        currentLevel[arrayBaseName] = [];
                    }

                    const targetArray = currentLevel[arrayBaseName];

                    if (isLastSegment) {
                        targetArray.push(entryValue);
                    } else {
                        // If not the last segment (e.g., `items[][subfield]`), push an empty object or array
                        // and move the `currentLevel` scope into it.
                        const nextStructure = (nameSegments[i + 1] === '__ARRAY_PUSH_MARKER__' || !isNaN(Number(nameSegments[i + 1]))) ? [] : {};
                        targetArray.push(nextStructure);
                        currentLevel = nextStructure; // Shift scope to the newly pushed item
                    }
                } else if (!isNaN(Number(segment)) && String(Number(segment)) === segment && i > 0 && nameSegments[i - 1] !== '__ARRAY_PUSH_MARKER__') {
                    // This segment is a numeric index (e.g., `items[0]`), and not an array push marker.
                    // The preceding segment should be the base name of the array.
                    const arrayBaseName = nameSegments[i - 1];
                    const index = Number(segment); // Convert index to a number

                    // Ensure the parent has an array at `arrayBaseName`
                    if (currentLevel[arrayBaseName] === undefined || currentLevel[arrayBaseName] === null) {
                        currentLevel[arrayBaseName] = [];
                    } else if (!Array.isArray(currentLevel[arrayBaseName])) {
                        console.warn(`dataExtractor: Overwriting non-array property '${arrayBaseName}' with an array for name '${rawEntryName}'.`);
                        currentLevel[arrayBaseName] = [];
                    }

                    const targetArray = currentLevel[arrayBaseName];
                    const cacheIdentifier = currentPathKey; // Use the full path including index as cache key
                    let nextItemReference = referenceCache[cacheIdentifier];

                    if (!nextItemReference) {
                        // If no existing reference, create a new structure at this index.
                        // Determine if the next structure should be an array or object based on the next segment.
                        const nextSegmentImpliesArray = (!isLastSegment && (nameSegments[i + 1] === '__ARRAY_PUSH_MARKER__' || !isNaN(Number(nameSegments[i + 1]))));
                        const createdStructure = isLastSegment ? entryValue : (nextSegmentImpliesArray ? [] : {});
                        targetArray[index] = createdStructure;
                        nextItemReference = targetArray[index];
                        referenceCache[cacheIdentifier] = nextItemReference; // Cache the reference
                    }

                    if (isLastSegment) {
                        targetArray[index] = entryValue; // Assign the final value
                    } else {
                        // If not the last segment, ensure the item at `targetArray[index]` is an object/array
                        // and move the `currentLevel` scope into it.
                        if (typeof targetArray[index] !== 'object' || targetArray[index] === null) {
                            const nextSegmentImpliesArray = (nameSegments[i + 1] === '__ARRAY_PUSH_MARKER__' || !isNaN(Number(nameSegments[i + 1])));
                            targetArray[index] = nextSegmentImpliesArray ? [] : {};
                            referenceCache[cacheIdentifier] = targetArray[index]; // Update cache if structure changed
                        }
                        currentLevel = targetArray[index];
                    }
                } else {
                    // This segment is a regular object property key (neither an array push marker nor a numeric index)
                    if (isLastSegment) {
                        currentLevel[segment] = entryValue;
                    } else {
                        if (currentLevel[segment] === undefined || currentLevel[segment] === null) {
                            // If the property doesn't exist, create an empty object or array for the next level.
                            // The type depends on whether the next segment implies an array.
                            const nextSegment = nameSegments[i + 1];
                            const nextSegmentImpliesArray = (nextSegment === '__ARRAY_PUSH_MARKER__' || (!isNaN(Number(nextSegment)) && String(Number(nextSegment)) === nextSegment));
                            currentLevel[segment] = nextSegmentImpliesArray ? [] : {};
                        } else if (typeof currentLevel[segment] !== 'object' || (!Array.isArray(currentLevel[segment]) && (nameSegments[i + 1] === '__ARRAY_PUSH_MARKER__' || (!isNaN(Number(nameSegments[i + 1])) && String(Number(nameSegments[i + 1])) === nameSegments[i + 1])))) {
                            // If it exists but is not an object or array, and the next segment requires it to be,
                            // then overwrite it. This mirrors the original library's behavior of overwriting.
                            console.warn(`dataExtractor: Overwriting property '${segment}' with a new object/array for name '${rawEntryName}'.`);
                            const nextSegment = nameSegments[i + 1];
                            const nextSegmentImpliesArray = (nextSegment === '__ARRAY_PUSH_MARKER__' || (!isNaN(Number(nextSegment)) && String(Number(nextSegment)) === nextSegment));
                            currentLevel[segment] = nextSegmentImpliesArray ? [] : {};
                        }
                        currentLevel = currentLevel[segment]; // Move scope to the next level
                    }
                }
            }
        }
        return finalData;
    }

    /**
     * Recursively extracts name-value pairs from a given DOM element and its children.
     *
     * @param {HTMLElement} node - The current DOM element to begin processing.
     * @param {Function} valueMapper - Custom function to get node value.
     * @param {boolean} fallbackToId - If true, uses element's ID if name is empty.
     * @returns {Array<object>} An array of { name: string, value: any } objects found within the node's hierarchy.
     */
    function retrieveElementValues(node, valueMapper, fallbackToId) {
        const directValues = processSingleElement(node, valueMapper, fallbackToId);
        // If the current node itself is an input field, its value is extracted directly.
        // Otherwise, or in addition, its children are traversed to find more inputs.
        // The original logic prioritized direct extraction, then recursive.
        return directValues.length > 0 ? directValues : traverseChildren(node, valueMapper, fallbackToId);
    }

    /**
     * Iterates through the children of a DOM node, processing each child for input values.
     *
     * @param {HTMLElement} parentNode - The DOM element whose children will be examined.
     * @param {Function} valueMapper - Custom function to get node value.
     * @param {boolean} fallbackToId - If true, uses element's ID if name is empty.
     * @returns {Array<object>} An array of { name: string, value: any } objects collected from children.
     */
    function traverseChildren(parentNode, valueMapper, fallbackToId) {
        let collectedChildValues = [];
        // Using .children to iterate over HTMLElement children only (ignoring text nodes etc.)
        for (const childNode of parentNode.children) {
            // Process the child node itself
            collectedChildValues = collectedChildValues.concat(processSingleElement(childNode, valueMapper, fallbackToId));

            // If the child node is not an input-like element, recurse into its children.
            // This prevents double-processing input elements that would be handled by processSingleElement.
            if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(childNode.nodeName.toUpperCase())) {
                 collectedChildValues = collectedChildValues.concat(traverseChildren(childNode, valueMapper, fallbackToId));
            }
        }
        return collectedChildValues;
    }

    /**
     * Attempts to extract a single name-value pair from a given DOM element
     * if it is recognized as a form input-like field.
     *
     * @param {HTMLElement} elementNode - The DOM element to inspect.
     * @param {Function} valueMapper - Custom function to get node value.
     * @param {boolean} fallbackToId - If true, uses element's ID if name is empty.
     * @returns {Array<object>} An array containing a single { name, value } object if a value was extracted, otherwise an empty array.
     */
    function processSingleElement(elementNode, valueMapper, fallbackToId) {
        let mappedResult;
        let extractedValue;
        let elementIdentifier = resolveElementIdentifier(elementNode, fallbackToId);

        // Prioritize custom value mapper if provided and returns a valid result
        if (valueMapper) {
            mappedResult = valueMapper(elementNode);
            if (mappedResult && typeof mappedResult === 'object' && mappedResult.name !== undefined) {
                return [mappedResult];
            }
        }

        // If no custom mapper, or mapper did not return a named result, use default logic
        if (elementIdentifier !== '') {
            const nodeTag = elementNode.nodeName.toUpperCase();
            if (['INPUT', 'TEXTAREA'].includes(nodeTag)) {
                extractedValue = fetchElementValue(elementNode);
                return [{ name: elementIdentifier, value: extractedValue }];
            } else if (nodeTag === 'SELECT') {
                extractedValue = fetchElementValue(elementNode);
                // For SELECT elements, remove any trailing '[]' from the name as the value
                // is already handled as an array (for multi-select) or single value.
                return [{ name: elementIdentifier.replace(/\[\]$/, ''), value: extractedValue }];
            }
        }
        return []; // No value extracted from this specific element by default logic
    }

    /**
     * Determines the most appropriate identifier (name or ID) for a form element.
     *
     * @param {HTMLElement} element - The form element for which to resolve an identifier.
     * @param {boolean} useIdAsFallback - If true, the 'id' attribute will be used if the 'name' attribute is empty.
     * @returns {string} The resolved identifier string, or an empty string if none can be found.
     */
    function resolveElementIdentifier(element, useIdAsFallback) {
        if (element.name && element.name !== '') {
            return element.name;
        } else if (useIdAsFallback && element.id && element.id !== '') {
            return element.id;
        }
        return '';
    }

    /**
     * Retrieves the current value of a form input, textarea, or select element.
     * Handles different input types like radio, checkbox, and multi-selects.
     *
     * @param {HTMLElement} targetNode - The form element from which to fetch the value.
     * @returns {any} The element's value, which can be a string, boolean, array of strings, or null.
     */
    function fetchElementValue(targetNode) {
        if (targetNode.disabled) {
            return null; // Disabled elements do not contribute values
        }

        const nodeTag = targetNode.nodeName.toUpperCase();
        switch (nodeTag) {
            case 'INPUT':
            case 'TEXTAREA':
                const inputType = targetNode.type ? targetNode.type.toLowerCase() : 'text'; // Default to 'text' if type is missing
                switch (inputType) {
                    case 'radio':
                    case 'checkbox':
                        if (targetNode.checked) {
                            // Special handling for string "true" to boolean true, otherwise return value
                            return (targetNode.value === "true") ? true : targetNode.value;
                        }
                        // If unchecked and value is "true", return boolean false (as per original logic).
                        // Otherwise, return null for unchecked elements.
                        return (targetNode.value === "true") ? false : null;

                    case 'button':
                    case 'reset':
                    case 'submit':
                    case 'image':
                        return ''; // Button-like inputs typically don't submit values in object form
                    default:
                        return targetNode.value;
                }
            case 'SELECT':
                return getSelectOptions(targetNode);
            default:
                // This case should ideally not be reached if `processSingleElement` filters correctly
                return null;
        }
    }

    /**
     * Extracts the selected option value(s) from a SELECT element.
     * Supports both single-selection and multiple-selection SELECT elements.
     *
     * @param {HTMLSelectElement} selectElement - The SELECT DOM element to process.
     * @returns {string|Array<string>} A single string value for single-select, or an array of strings for multi-select.
     */
    function getSelectOptions(selectElement) {
        const isMultiSelect = selectElement.multiple;

        if (!isMultiSelect) {
            return selectElement.value;
        }

        // For multi-select, collect all selected option values using modern array methods
        const selectedValues = Array.from(selectElement.options)
                                .filter(option => option.selected)
                                .map(option => option.value);
        return selectedValues;
    }

    // Expose the main data extractor function
    return dataExtractor;

})();