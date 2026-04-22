/*
 * XML Document generation from JavaScript Objects.
 *
 * This utility provides a mechanism to transform standard JavaScript objects
 * into a native XML Document Object Model (DOM) structure.
 *
 * It is conceptually similar to earlier JSON-to-XML string converters
 * but focuses on producing a manipulable DOM object rather than a raw string.
 *
 * This module is designed for scenarios requiring client-side XML generation,
 * for instance, when preparing data for specific API endpoints or validation schemas.
 *
 * @version 1.01.a
 * @author Derived and re-engineered by AI Assistant
 *
 */
(function(jq) {

    // Internal constant for default root element
    const DEFAULT_ROOT_TAG = 'dataSet';

    /**
     * Converts a JavaScript object into an XML Document.
     *
     * @param {object} sourceObject The JavaScript object to convert (must be a non-null object).
     * @param {string} topLevelTagName The desired tag name for the root element of the XML document.
     * @returns {Document} A native XML Document object.
     * @throws {Error} If input validation fails or conversion encounters an issue.
     */
    jq.convertObjectToXmlDoc = function(sourceObject, topLevelTagName) {
        let xmlResultDoc;

        // --- Input Validation and Pre-processing ---
        if (sourceObject === null || typeof sourceObject !== 'object' || Array.isArray(sourceObject)) {
            throw new Error('Conversion input error: Provided sourceObject must be a non-array, non-null JavaScript object.');
        }

        let effectiveRootTagName = topLevelTagName;
        if (!effectiveRootTagName || typeof effectiveRootTagName !== 'string' || effectiveRootTagName.trim() === '') {
            console.warn(`No valid top-level tag name provided. Using default: "${DEFAULT_ROOT_TAG}"`);
            effectiveRootTagName = DEFAULT_ROOT_TAG;
        }

        // --- XML Document Initialization ---
        try {
            xmlResultDoc = document.implementation.createDocument(null, '', null);
        } catch (initializationError) {
            // Fallback for older IE versions
            if (typeof ActiveXObject !== 'undefined') {
                try {
                    xmlResultDoc = new ActiveXObject('Msxml2.DOMDocument.3.0');
                } catch (activeXError) {
                    throw new Error(`Failed to initialize XML document. Modern API error: "${initializationError.message}". ActiveX fallback error: "${activeXError.message}".`);
                }
            } else {
                throw new Error(`Failed to initialize XML document: "${initializationError.message}". No ActiveX fallback available.`);
            }
        }

        // --- Core Conversion Logic ---
        try {
            processNodeConversion(xmlResultDoc, sourceObject, effectiveRootTagName);
        } catch (conversionExecutionError) {
            throw new Error('Object to XML conversion encountered a runtime problem: ' + conversionExecutionError.message);
        }

        return xmlResultDoc;
    };

    /**
     * Recursively processes a JavaScript object to append XML elements and attributes.
     *
     * @param {Node} currentXmlParent The current parent XML node to append new elements to.
     * @param {object} objToProcess The JavaScript object or sub-object to convert.
     * @param {string} nodeName The desired tag name for the element created from objToProcess.
     */
    function processNodeConversion(currentXmlParent, objToProcess, nodeName) {
        const docReference = currentXmlParent.ownerDocument || currentXmlParent; // Obtain reference to the document object
        const createElementFunc = (name) => docReference.createElement(name);

        const newXmlElement = createElementFunc(nodeName);
        currentXmlParent.appendChild(newXmlElement);

        for (const propKey in objToProcess) {
            if (Object.prototype.hasOwnProperty.call(objToProcess, propKey)) {
                const propValue = objToProcess[propKey];

                // --- Handle different data types ---
                if (propValue === null || typeof propValue === 'undefined') {
                    // Explicitly create an empty element for null/undefined values, or skip
                    // For this clone, let's create an empty element with an attribute indicating null
                    newXmlElement.setAttribute(propKey, 'null');
                    continue;
                }

                if (Array.isArray(propValue)) {
                    // Delegate array processing to a dedicated handler
                    handleArrayProperty(newXmlElement, propValue, propKey);
                } else if (typeof propValue === 'object') {
                    // Recursive call for nested objects
                    processNodeConversion(newXmlElement, propValue, propKey);
                } else {
                    // Primitive values become attributes
                    newXmlElement.setAttribute(propKey, String(propValue));
                }
            }
        }
    }

    /**
     * Handles array properties by creating multiple XML elements for each item.
     *
     * @param {Node} parentForArrayItems The XML node to which array items will be appended.
     * @param {Array} sourceArrayData The array to iterate through.
     * @param {string} itemElementName The tag name for each element created from array items.
     */
    function handleArrayProperty(parentForArrayItems, sourceArrayData, itemElementName) {
        const owningDocument = parentForArrayItems.ownerDocument;
        const createItemElement = (name) => owningDocument.createElement(name);

        if (!sourceArrayData || sourceArrayData.length === 0) {
            // If array is empty, create a single empty element to represent it.
            parentForArrayItems.appendChild(createItemElement(itemElementName));
            return;
        }

        // Use a standard for loop for array iteration
        for (let idx = 0; idx < sourceArrayData.length; idx++) {
            const arrayItem = sourceArrayData[idx];

            if (typeof arrayItem !== 'object' || arrayItem === null) {
                // Primitive or null array item: create element with text content or as empty
                const individualItemElement = createItemElement(itemElementName);

                if (arrayItem === null) {
                    individualItemElement.setAttribute('value', 'null');
                } else if (String(arrayItem).trim() === '') {
                    // Empty string: append as empty element
                } else {
                    // Non-empty primitive: append text node
                    individualItemElement.appendChild(owningDocument.createTextNode(String(arrayItem)));
                }
                parentForArrayItems.appendChild(individualItemElement);
            } else {
                // Nested object in array: recursive call, but append to the *same* parent as other array items
                processNodeConversion(parentForArrayItems, arrayItem, itemElementName);
            }
        }
    }

})(typeof jQuery !== 'undefined' ? jQuery : null); // Pass jQuery if available, otherwise null to prevent errors