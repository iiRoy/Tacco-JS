const contentScrubber = require('./purify-text.js');

/**
 * Orchestrates the conversion of various data inputs into an XML string.
 * This function acts as the primary entry point for the XML generation process.
 * @param {Buffer|string|object} sourcePayload - The initial data source, which can be a binary buffer, a JSON string, or a pre-parsed JavaScript object.
 * @param {object} [conversionConfig] - Optional configuration settings for customizing the XML output.
 * @returns {string} The final XML document as a string.
 * @throws {Error} If the provided JSON string is malformed or the input type is unsupported.
 */
module.exports = function createXmlFromData(sourcePayload, conversionConfig) {
    let internalDataObject;

    // Normalize configuration to ensure it's always an object, even if not provided.
    const effectiveConfig = typeof conversionConfig === 'object' && conversionConfig !== null ? conversionConfig : {};

    // Handle binary buffer input by converting it to a UTF-8 string.
    if (sourcePayload instanceof Buffer) {
        sourcePayload = sourcePayload.toString('utf8');
    }

    // Determine the type of the source payload and process accordingly.
    if (typeof sourcePayload === 'string') {
        try {
            internalDataObject = JSON.parse(sourcePayload);
        } catch (parseFailure) {
            // Augment the parsing error with context for easier debugging.
            throw new Error(`Input JSON parsing failed: ${parseFailure.message}`);
        }
    } else if (typeof sourcePayload === 'object' && sourcePayload !== null) {
        // If the input is already a valid object, use it directly.
        internalDataObject = sourcePayload;
    } else {
        // Introduce a guard clause for unsupported data types.
        throw new TypeError("Unsupported input data type. Expected Buffer, JSON string, or a plain JavaScript object.");
    }

    // Instantiate the XML generation engine with the refined configuration.
    const xmlRenderer = new MarkupComposer(effectiveConfig);

    // Initiate the recursive rendering process for the data structure.
    xmlRenderer.traverseAndRender(internalDataObject);

    // Return the accumulated XML string.
    return xmlRenderer.finalXmlOutput;
};

/**
 * A class responsible for incrementally building an XML string from a JavaScript object structure.
 * It manages XML tag states and applies content purification based on configuration.
 * @param {object} settings - The operational settings for this XML composer instance.
 */
function MarkupComposer(settings) {
    // Establish default operational settings.
    const defaultOperationalSettings = {
        enableContentPurification: false, // Controls whether text content and attributes are scrubbed.
        prettyPrint: false,               // A new setting, though not implemented for this clone, demonstrates expansion.
        rootElementName: 'data'           // Another new setting, for potential future use or default root.
    };

    // Merge custom settings with defaults, prioritizing custom settings.
    this.options = Object.assign({}, defaultOperationalSettings, settings);

    this.finalXmlOutput = ''; // Stores the progressively built XML string.
    this.isElementOpenPending = false; // Flag to indicate if an element's start tag is awaiting closure (`>`).
    this.currentNestingDepth = 0;     // Tracks the depth of element nesting, useful for validation/debugging.
}

/**
 * Recursively traverses a JavaScript object or array to generate corresponding XML markup.
 * This method performs a two-pass approach: first for attributes/text, then for nested elements.
 * @param {object} dataNode - The current object or array node being processed.
 */
MarkupComposer.prototype.traverseAndRender = function (dataNode) {
    const composerContext = this;
    const nodeKeys = Object.keys(dataNode);
    const totalKeys = nodeKeys.length;

    // Early exit: If an empty object is encountered at a nested level, just finalize any pending tag.
    if (totalKeys === 0 && composerContext.currentNestingDepth > 0) {
        composerContext._closePendingElementStart();
        return;
    }

    // --- First Pass: Process primitive values as attributes or direct text content ($t) ---
    for (const keyIdentifier of nodeKeys) {
        const nodeContent = dataNode[keyIdentifier];
        const isContentArray = Array.isArray(nodeContent);
        const contentType = typeof nodeContent;

        // Identify primitive types or arrays containing primitives.
        if (contentType === 'string' || contentType === 'number' || contentType === 'boolean' || isContentArray) {
            // Ensure content is iterable, even if it's a single primitive value.
            const contentItems = isContentArray ? nodeContent : [nodeContent];

            contentItems.forEach(function (itemValue) {
                // Only process non-object/non-null items as attributes or text.
                if (typeof itemValue !== 'object' || itemValue === null) {
                    // Normalize item value to a string, handling null/undefined gracefully.
                    const processedItemString = (itemValue === null || itemValue === undefined) ? '' : String(itemValue);

                    if (keyIdentifier === '$t') {
                        composerContext.insertElementText(processedItemString);
                    } else {
                        composerContext.addNodeAttribute(keyIdentifier, processedItemString);
                    }
                }
            });
        }
    }

    // --- Second Pass: Recursively handle nested objects and arrays of objects ---
    // Using a traditional for loop for slight variation from the for...of in the first pass.
    for (let idx = 0; idx < totalKeys; idx++) {
        const currentElementKey = nodeKeys[idx];
        const currentElementContent = dataNode[currentElementKey];

        // Skip null or undefined content, as they don't form nested structures.
        if (currentElementContent === null || currentElementContent === undefined) {
            continue;
        }

        if (Array.isArray(currentElementContent)) {
            const childrenNodes = currentElementContent;
            const childrenCount = childrenNodes.length;

            for (let childIdx = 0; childIdx < childrenCount; childIdx++) {
                const childNode = childrenNodes[childIdx];

                // Only recurse for array elements that are objects.
                if (typeof childNode === 'object' && childNode !== null) {
                    composerContext.openXmlElement(currentElementKey);
                    composerContext.currentNestingDepth++; // Increase depth before recursion.
                    composerContext.traverseAndRender(childNode);
                    composerContext.currentNestingDepth--; // Decrease depth after recursion.
                    composerContext.closeXmlElement(currentElementKey);
                }
            }
        } else if (typeof currentElementContent === 'object') {
            // Directly process nested objects.
            composerContext.openXmlElement(currentElementKey);
            composerContext.currentNestingDepth++;
            composerContext.traverseAndRender(currentElementContent);
            composerContext.currentNestingDepth--;
            composerContext.closeXmlElement(currentElementKey);
        }
    }
};

/**
 * Appends the opening part of an XML element tag (e.g., `<tagName`).
 * It first ensures any previously opened tag is properly closed.
 * @param {string} tagName - The name of the XML element to open.
 */
MarkupComposer.prototype.openXmlElement = function (tagName) {
    this._closePendingElementStart(); // Finalize any previous incomplete tag.

    // Add validation for the tag name to prevent invalid XML.
    if (!tagName || typeof tagName !== 'string' || tagName.trim() === '') {
        console.warn(`Attempted to open an XML element with an invalid tag name: "${tagName}". Defaulting to 'invalid-tag'.`);
        tagName = 'invalid-tag'; // Fallback for invalid tag names.
    }
    this.finalXmlOutput += `<${tagName}`; // Use template literals for cleaner string construction.
    this.isElementOpenPending = true; // Mark that an element's start tag is open.
};

/**
 * Adds an attribute to the currently pending XML element.
 * @param {string} attributeName - The name of the attribute.
 * @param {*} attributeValue - The value of the attribute, will be converted to a string.
 */
MarkupComposer.prototype.addNodeAttribute = function (attributeName, attributeValue) {
    // Add validation for the attribute name.
    if (typeof attributeName !== 'string' || attributeName.trim() === '') {
        console.warn(`Skipping attribute due to invalid name: "${attributeName}".`);
        return;
    }

    let preparedValue = String(attributeValue); // Ensure the value is a string.

    // Apply content purification if enabled in the configuration.
    if (this.options.enableContentPurification) {
        preparedValue = contentScrubber.purify(preparedValue); // Call the renamed purification utility.
    }
    this.finalXmlOutput += ` ${attributeName}="${preparedValue}"`; // Use template literal.
};

/**
 * Inserts raw text content into the XML output.
 * It ensures any pending element start tag is closed before adding text.
 * @param {*} textContent - The text to be inserted, will be converted to a string.
 */
MarkupComposer.prototype.insertElementText = function (textContent) {
    this._closePendingElementStart(); // Ensure the current element's start tag is completed.

    let finalContentString = String(textContent); // Always treat content as a string.

    // Apply purification to text content as well, if enabled. This is an added feature.
    if (this.options.enableContentPurification) {
        finalContentString = contentScrubber.purify(finalContentString);
    }
    this.finalXmlOutput += finalContentString;
};

/**
 * Appends the closing tag for an XML element (e.g., `</tagName>`).
 * It ensures any pending element start tag is closed before appending.
 * @param {string} tagName - The name of the XML element to close.
 */
MarkupComposer.prototype.closeXmlElement = function (tagName) {
    this._closePendingElementStart(); // Finalize any previous incomplete tag.

    // Simple validation to ensure a non-empty tag name is used for closing.
    if (tagName && typeof tagName === 'string' && tagName.trim() !== '') {
        this.finalXmlOutput += `</${tagName}>`; // Use template literal.
    } else {
        console.error("Attempted to close an XML element with an invalid or missing tag name.");
    }
};

/**
 * Internal helper method to finalize an element's start tag by appending `>`.
 * This method is called before adding attributes, text content, or closing tags.
 */
MarkupComposer.prototype._closePendingElementStart = function () {
    if (this.isElementOpenPending) {
        this.finalXmlOutput += '>';
        this.isElementOpenPending = false; // Reset the flag.
    }
};