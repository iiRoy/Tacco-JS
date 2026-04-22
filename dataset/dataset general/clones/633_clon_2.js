const inputCleaner = require('./clean.js')

module.exports = function (inputContent, configuration) {
    // Determine if the provided input is a binary buffer object.
    if (inputContent instanceof Buffer) {
        // Convert the binary buffer into its string representation for processing.
        inputContent = inputContent.toString();
    }

    // Initialize a variable to store the data after potential parsing.
    let processedData = null;
    // Check if the input is a string, indicating it might need JSON parsing.
    if (typeof(inputContent) == 'string') {
        try {
            // Attempt to parse the string as a JSON object.
            processedData = JSON.parse(inputContent);
        } catch(parseError) {
            // If parsing fails, throw an error indicating invalid JSON structure.
            throw new Error("The provided JSON structure is malformed");
        }
    } else {
        // If not a string, assume the input is already a valid object.
        processedData = inputContent;
    }
    // Create a new instance of the MarkupBuilder utility with the given configuration.
    const builderInstance = new MarkupBuilder(configuration);
    // Begin the process of converting the object into markup format.
    builderInstance.processStructure(processedData);
    // Return the final generated markup string.
    return builderInstance.markupOutput;
}

MarkupBuilder.prototype.processStructure = function(processedData) {
    const instanceRef = this; // Maintain a reference to the current builder instance.
    const propertyNames = Object.keys(processedData); // Retrieve all top-level property keys from the object.
    const propCount = propertyNames.length; // Get the total number of properties.

    // First iteration: identify and handle simple scalar values (strings, numbers, booleans) or arrays containing them.
    for (let idx1 = 0; idx1 < propCount; idx1++) {
        let currentKey = propertyNames[idx1],
            currentVal = processedData[currentKey],
            isCollection = Array.isArray(currentVal);
        const valType = typeof(currentVal); // Determine the JavaScript type of the current value.

        // If the value is a scalar type (string, number, boolean) or an array.
        if (valType == 'string' || valType == 'number' || valType == 'boolean' || isCollection) {
            // Create an iterable list: if it's an array, use it directly; otherwise, wrap the single value in an array.
            const itemsToProcess = isCollection ? currentVal : [currentVal];

            // Iterate over each item within the collection.
            itemsToProcess.forEach(function(subItemValue) {
                // Ensure the sub-item is not an object (i.e., it's a scalar).
                if (typeof(subItemValue) != 'object') {
                    // Check for a special key indicating raw text content.
                    if (currentKey == '$text') {
                        instanceRef.insertTextContent(subItemValue);
                    } else {
                        // Otherwise, treat it as an attribute for the current element.
                        instanceRef.insertAttribute(currentKey, subItemValue);
                    }
                }
            });
        }
    }

    // Second iteration: process nested objects and arrays of objects.
    for (let idx1 = 0; idx1 < propCount; idx1++) {
        let currentKey = propertyNames[idx1]; // Get the current property key again.

        // If the value associated with the current key is an array.
        if (Array.isArray(processedData[currentKey])) {
            const elementList = processedData[currentKey]; // Get the array of nested elements.
            const listLen = elementList.length; // Determine the count of elements in this array.

            // Loop through each element within the array.
            for (let idx2 = 0; idx2 < listLen; idx2++) {
                let listElement = elementList[idx2]; // Access the current element in the array.

                // If this element is itself an object, recursively process it.
                if (typeof(listElement) == 'object') {
                    instanceRef.beginTag(currentKey); // Open a new XML tag using the current key.
                    instanceRef.processStructure(listElement); // Recursively convert the nested object.
                    instanceRef.endTag(currentKey); // Close the corresponding XML tag.
                }
            }
        }
        // If the value is a direct object (not an array) itself.
        else if (typeof(processedData[currentKey]) == 'object') {
            instanceRef.beginTag(currentKey); // Open an XML tag for this object.
            instanceRef.processStructure(processedData[currentKey]); // Recursively convert the direct nested object.
            instanceRef.endTag(currentKey); // Close the XML tag.
        }
    }

};

MarkupBuilder.prototype.beginTag = function(currentKey) {
    // Ensure that any previously opened tag is properly closed before starting a new one.
    this.finalizeCurrentTag();
    // Append the opening part of the new XML tag to the output.
    this.markupOutput += '<' + currentKey;
    // Set a flag indicating that this tag is currently open and awaiting further additions or closure.
    this.tagNotClosed = true;
}
MarkupBuilder.prototype.insertAttribute = function(currentKey, attributeValue) {
    // If the configuration specifies that input values should be cleaned, apply the cleaning function.
    if (this.configSettings.cleanInput) {
        attributeValue = inputCleaner.cleanValue(attributeValue)
    }
    // Append the attribute key-value pair to the currently open tag.
    this.markupOutput += ' ' + currentKey + '="' + attributeValue + '"';
}
MarkupBuilder.prototype.insertTextContent = function(textContent) {
    // Before adding text content, ensure the current tag is properly closed.
    this.finalizeCurrentTag();
    // Append the provided text content directly to the XML output.
    this.markupOutput += textContent;
}
MarkupBuilder.prototype.endTag = function(currentKey) {
    // Ensure any partially completed tag is finalized before closing the element.
    this.finalizeCurrentTag();
    // Append the closing XML tag to the output.
    this.markupOutput += '</' + currentKey + '>';
}
MarkupBuilder.prototype.finalizeCurrentTag = function() {
    // Check if there is an active tag that has been opened but not yet closed with its final '>' character.
    if (this.tagNotClosed) {
        // Complete the open tag by adding the closing angle bracket.
        this.markupOutput += '>';
        // Reset the flag, as the tag is now considered complete.
        this.tagNotClosed = false;
    }
}
function MarkupBuilder(configuration) {
    // Define the default configuration settings for the builder.
    const baseConfiguration = {
        cleanInput: false // By default, input cleaning is disabled.
    };

    // If custom configuration options are provided, merge them with the base defaults.
    if (configuration) {
        for (const optionName in configuration) {
            baseConfiguration[optionName] = configuration[optionName];
        }
    }

    // Store the final, merged configuration settings within the instance.
    this.configSettings = baseConfiguration;
    // Initialize the string that will accumulate the generated markup.
    this.markupOutput = '';
    // Initialize a boolean flag to track the state of the current XML tag (open but not yet closed).
    this.tagNotClosed = false;
}