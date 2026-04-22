const dataExtractor = (() => {
    "use strict";

    /**
     * Transforms form elements into a structured JavaScript object.
     *
     * @param {HTMLElement|string|NodeList|Array<HTMLElement>} entryPoint - The root element(s) of the form, or its ID.
     * @param {string} [pathSeparator='.'] - Delimiter for nested object paths in element names.
     * @param {boolean} [omitEmpty=true] - If true, values that are empty string, null, or undefined are excluded.
     * @param {Function} [elementProcessor=null] - An optional custom function to process a DOM element.
     *                                             It should return an object `{name: string, value: any}` or falsy.
     * @param {boolean} [useIdAsFallback=false] - If true, element's ID is used as its name if the name attribute is empty.
     * @returns {object} The resulting structured data object.
     */
    function harvestForm(entryPoint, pathSeparator = '.', omitEmpty = true, elementProcessor = null, useIdAsFallback = false) {
        let rootElements = [];

        if (typeof entryPoint === 'string') {
            const domElement = document.getElementById(entryPoint);
            if (domElement) rootElements.push(domElement);
        } else if (entryPoint instanceof HTMLElement) {
            rootElements.push(entryPoint);
        } else if (entryPoint instanceof NodeList || Array.isArray(entryPoint)) {
            rootElements = Array.from(entryPoint).filter(el => el instanceof HTMLElement);
        }

        let collectedFieldValues = [];
        for (const rootEl of rootElements) {
            collectedFieldValues = collectedFieldValues.concat(gatherElementData(rootEl, elementProcessor, useIdAsFallback));
        }

        return assembleObject(collectedFieldValues, omitEmpty, pathSeparator);
    }

    /**
     * Collects name-value pairs from a given DOM element and its descendant form fields.
     * @param {HTMLElement} currentElement - The DOM element to query.
     * @param {Function} customProcessor - Optional custom processing function.
     * @param {boolean} utilizeIdFallback - Use ID if name is missing.
     * @returns {Array<{name: string, value: any}>} An array of extracted field information.
     */
    function gatherElementData(currentElement, customProcessor, utilizeIdFallback) {
        const fieldOutputs = [];
        const formFields = currentElement.querySelectorAll('input, textarea, select');

        for (const field of formFields) {
            let processedByCustom = customProcessor && customProcessor(field);
            if (processedByCustom && processedByCustom.name) {
                fieldOutputs.push(processedByCustom);
                continue;
            }

            const fieldIdentifier = resolveFieldIdentifier(field, utilizeIdFallback);
            if (fieldIdentifier) {
                const content = extractFieldContent(field);
                if (content !== undefined) {
                    let finalIdentifier = fieldIdentifier;
                    // Special handling for SELECT elements ending with '[]'
                    if (field.tagName.toUpperCase() === 'SELECT' && finalIdentifier.endsWith('[]')) {
                        finalIdentifier = finalIdentifier.slice(0, -2);
                    }
                    fieldOutputs.push({ name: finalIdentifier, value: content });
                }
            }
        }
        return fieldOutputs;
    }

    /**
     * Determines the name or ID to use as the key for a form element.
     * @param {HTMLElement} htmlElement - The form element.
     * @param {boolean} useIdIfNameEmpty - Whether to use ID if name is empty.
     * @returns {string} The determined key or an empty string.
     */
    function resolveFieldIdentifier(htmlElement, useIdIfNameEmpty) {
        if (htmlElement.name && htmlElement.name !== '') return htmlElement.name;
        if (useIdIfNameEmpty && htmlElement.id && htmlElement.id !== '') return htmlElement.id;
        return '';
    }

    /**
     * Extracts the value from a specific form element based on its type.
     * @param {HTMLElement} htmlElement - The form element.
     * @returns {any} The extracted value, or undefined if disabled or not a relevant type/state.
     */
    function extractFieldContent(htmlElement) {
        if (htmlElement.disabled) return null; // Original returns null for disabled fields.

        switch (htmlElement.tagName.toUpperCase()) {
            case 'INPUT':
            case 'TEXTAREA':
                switch (htmlElement.type.toLowerCase()) {
                    case 'radio':
                    case 'checkbox':
                        if (htmlElement.checked) {
                            return htmlElement.value === "true" ? true : htmlElement.value;
                        }
                        // Original returns false if not checked and value is "true"
                        if (!htmlElement.checked && htmlElement.value === "true") return false;
                        return undefined; // If not checked and not special "true", original implicitly skips.
                    case 'button':
                    case 'reset':
                    case 'submit':
                    case 'image':
                        return ''; // Original returns empty string for these types.
                    default:
                        return htmlElement.value;
                }
            case 'SELECT':
                return retrieveSelectOption(htmlElement);
            default:
                return undefined; // Not a recognized form input type for value extraction.
        }
    }

    /**
     * Retrieves the selected value(s) from a <select> element.
     * @param {HTMLSelectElement} selectElement - The select element.
     * @returns {string|Array<string>} The selected value(s).
     */
    function retrieveSelectOption(selectElement) {
        if (!selectElement.multiple) {
            return selectElement.value;
        }

        const selectedValues = Array.from(selectElement.options)
                                   .filter(opt => opt.selected)
                                   .map(opt => opt.value);
        return selectedValues;
    }

    /**
     * Structures the collected name-value pairs into a nested JavaScript object.
     * @param {Array<{name: string, value: any}>} fieldInputs - Array of field name-value pairs.
     * @param {boolean} excludeEmpty - Whether to exclude empty values.
     * @param {string} keyDelimiter - Delimiter for path segments.
     * @returns {object} The structured output object.
     */
    function assembleObject(fieldInputs, excludeEmpty, keyDelimiter) {
        const finalOutput = {};
        // Cache to store references to intermediate objects/arrays identified by their path.
        // This is crucial for handling non-sequential array indices and named keys in arrays.
        const pathReferenceCache = new Map();

        for (const entry of fieldInputs) {
            let entryValue = entry.value;

            if (excludeEmpty && (entryValue === '' || entryValue === null || entryValue === undefined)) {
                continue;
            }

            const pathSegments = parsePathSyntax(entry.name, keyDelimiter);
            let currentObjectPointer = finalOutput;
            let currentPathPartsForCache = [];

            for (let i = 0; i < pathSegments.length; i++) {
                const segment = pathSegments[i];
                const isLastSegment = (i === pathSegments.length - 1);

                let segmentKey = segment.key;
                let isAppendOperation = segment.type === 'append';
                let isIndexedAccess = segment.type === 'indexed';

                // Build a unique key for caching references to intermediate objects/arrays.
                // This mimics original's `arrNameFull` for unique array element tracking.
                currentPathPartsForCache.push(segmentKey);
                const cacheKey = currentPathPartsForCache.join('::');

                if (isLastSegment) {
                    if (isAppendOperation) {
                        // If currentObjectPointer is not an array, it's an invalid path or implicit conversion needed.
                        // The original code implies parent is already an array for `[]`.
                        if (!Array.isArray(currentObjectPointer)) {
                            // If `currentObjectPointer` is `finalOutput` and `name` is just `[]`, it's an error.
                            // If `name` is `prop[]`, then `currentObjectPointer` is `finalOutput.prop` (which should be an array).
                            // This means `segmentKey` is `prop`.
                            if (typeof currentObjectPointer === 'object' && currentObjectPointer !== null && !currentObjectPointer[segmentKey]) {
                                currentObjectPointer[segmentKey] = [];
                            }
                            if (currentObjectPointer[segmentKey]) { // Assuming `segmentKey` is the array name
                                currentObjectPointer[segmentKey].push(entryValue);
                            } else { // It means currentObjectPointer IS the array
                                currentObjectPointer.push(entryValue);
                            }
                        } else {
                            currentObjectPointer.push(entryValue);
                        }
                    } else { // Indexed or property assignment
                        currentObjectPointer[segmentKey] = entryValue;
                    }
                } else { // Not the final segment, navigate or create intermediate structure
                    let nextSegment = pathSegments[i + 1];
                    let nextIsArrayTarget = (nextSegment.type === 'append' || nextSegment.type === 'indexed');

                    if (isAppendOperation) { // Current segment is '[]' (e.g., `list[][prop]`)
                        // `currentObjectPointer` is the array to which we push a new object/array.
                        let newIntermediateElement = nextIsArrayTarget ? [] : {};
                        currentObjectPointer.push(newIntermediateElement);
                        // For `[]` segments, we don't cache the array reference by its `[]` key,
                        // but rather move the pointer to the newly pushed element.
                        currentObjectPointer = newIntermediateElement;
                    } else if (isIndexedAccess) { // Current segment is '[0]' or '[key]'
                        if (!pathReferenceCache.has(cacheKey)) {
                            let newIntermediateElement = nextIsArrayTarget ? [] : {};
                            currentObjectPointer[segmentKey] = newIntermediateElement;
                            pathReferenceCache.set(cacheKey, newIntermediateElement);
                        }
                        currentObjectPointer = pathReferenceCache.get(cacheKey);
                    } else { // Current segment is a property name
                        if (!currentObjectPointer[segmentKey]) {
                            currentObjectPointer[segmentKey] = nextIsArrayTarget ? [] : {};
                        }
                        currentObjectPointer = currentObjectPointer[segmentKey];
                    }
                }
            }
        }

        return finalOutput;
    }

    /**
     * Parses a field name string into an array of structured segments.
     * Handles '.' for properties and '[]', '[index]', '[key]' for array/object access.
     * @param {string} fullPathString - The original field name string.
     * @param {string} pathDelimiter - The property path delimiter (e.g., '.').
     * @returns {Array<{key: string, type: 'property'|'indexed'|'append'}>} An array of path segments.
     */
    function parsePathSyntax(fullPathString, pathDelimiter) {
        const parsedSegments = [];
        let remainingPath = fullPathString;

        // Regex to match either a property name part or an array/indexed part.
        // Group 1: Matches a property name (e.g., 'prop', 'name')
        // Group 2: Matches content inside brackets (e.g., '0', 'key', '') for array/indexed access
        const segmentSplitter = new RegExp(`^([^\\${pathDelimiter}\\[]+)|^\\[([^\\]]*)\\]|^\\${pathDelimiter}`);

        while (remainingPath.length > 0) {
            const match = remainingPath.match(segmentSplitter);
            if (!match) {
                // Should not happen with valid paths; treat remaining as a property.
                parsedSegments.push({ key: remainingPath, type: 'property' });
                remainingPath = '';
                break;
            }

            if (match[1]) { // Matched a property name
                parsedSegments.push({ key: match[1], type: 'property' });
                remainingPath = remainingPath.substring(match[1].length);
            } else if (match[2] !== undefined) { // Matched an array/indexed part
                const innerContent = match[2];
                if (innerContent === '') {
                    parsedSegments.push({ key: '', type: 'append' }); // Represents `[]`
                } else {
                    parsedSegments.push({ key: innerContent, type: 'indexed' }); // Represents `[0]`, `[key]`
                }
                remainingPath = remainingPath.substring(match[0].length); // Consume the `[...]` part
            } else if (match[0] === pathDelimiter) { // Matched the path delimiter itself
                remainingPath = remainingPath.substring(pathDelimiter.length);
            } else {
                // Fallback for unexpected characters or unmatched path start
                parsedSegments.push({ key: remainingPath, type: 'property' });
                remainingPath = '';
            }
        }
        return parsedSegments;
    }

    // Export the main function as the module's return value.
    return harvestForm;

})();