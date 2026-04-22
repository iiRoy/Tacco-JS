/*
 * This module facilitates the conversion of JSON structures into native XML Document objects.
 *
 * It draws inspiration from earlier works, specifically a jQuery plugin by Michal Korecki,
 * but represents an independent implementation focused on producing XML Document objects
 * rather than simple XML strings. Configuration options are not currently exposed.
 *
 * The primary intent is to support client-side generation of XML validation rulesets
 * (e.g., for SVARX) from structured JSON input.
 *
 * @version 1.0.0
 * @author Maxwell Shirshin, adapted from concepts by Michal Korecki
 *
 */
(function(jq) {


    /**
     * Transforms a JavaScript object into an XML Document.
     *
     * @param inputData A standard JavaScript object (not a string).
     * @param rootElementName The desired tag name for the document's top-level element.
     * @returns An XML Document object.
     */
    jq.objectToXmlDoc = function(inputData, rootElementName) {
        var generatedXml; // Variable to hold the resulting XML DOM.

        try {
            // Attempt to create a new XML document using standard DOM methods.
            generatedXml = document.implementation.createDocument('', '', null);
        }
        catch(problem) {
            // Fallback for older Internet Explorer versions.
            generatedXml = new ActiveXObject('Msxml2.DOMDocument.3.0');
        }

        try {
            // Begin the recursive conversion process.
            buildXmlFromData(generatedXml, inputData, rootElementName);
        }
        catch(exceptionDetails) {
            // Report any issues encountered during the conversion.
            throw new Error('Object-to-XML transformation encountered an issue: ' + exceptionDetails.message);
        }

        return generatedXml; // Deliver the final XML DOM.
    };


    /**
     * Recursively constructs XML nodes from a JavaScript object.
     *
     * @param parentContainer The current XML node to append new elements to.
     * @param sourceObject The JavaScript object or sub-object to process.
     * @param elementTag The tag name for the new XML element.
     */
    function buildXmlFromData(parentContainer, sourceObject, elementTag) {
        var domHolder = parentContainer.ownerDocument || parentContainer, // Get the document owner for element creation.
            addedNode = parentContainer.appendChild( domHolder.createElement(elementTag) ); // Create and append the new element.

        // Iterate over properties of the source object.
        for (var dataKey in sourceObject) {
            if (sourceObject.hasOwnProperty(dataKey)) { // Ensure it's an own property, not inherited.
                if (jq.isArray(sourceObject[dataKey])) { // If the property value is an array...
                    insertArrayItems(addedNode, sourceObject[dataKey], dataKey); // ...handle it as an array.
                }
                else if (typeof sourceObject[dataKey] === 'object') { // If the property value is another object...
                    buildXmlFromData(addedNode, sourceObject[dataKey], dataKey); // ...recurse into it.
                }
                else {
                    // Otherwise, treat it as a primitive and set it as an attribute.
                    addedNode.setAttribute(dataKey, sourceObject[dataKey]);
                }
            }
        }
    }

    /**
     * Processes array elements, creating XML nodes for each item.
     *
     * @param currentParent The XML node where array items should be appended.
     * @param itemCollection The array of data to convert.
     * @param nodeLabel The tag name for each item's XML node.
     */
    function insertArrayItems(currentParent, itemCollection, nodeLabel) {
        if (itemCollection.length > 0) { // Check if the array contains any elements.
            for (var idx in itemCollection) { // Loop through each item in the collection.
                if (typeof itemCollection[idx] !== 'object') { // If the array item is a primitive type...
                    if (itemCollection[idx] === '') { // Special handling for empty strings.
                        currentParent.appendChild( currentParent.ownerDocument.createElement(nodeLabel) );
                    }
                    else {
                        // Create an element and append a text node with the primitive value.
                        currentParent.appendChild( currentParent.ownerDocument.createElement(nodeLabel) )
                            .appendChild( currentParent.ownerDocument.createTextNode(itemCollection[idx]) );
                    }
                }
                else {
                    // If the array item is an object, recurse to build its XML structure.
                    buildXmlFromData(currentParent, itemCollection[idx], nodeLabel);
                }
            }
        }
        else {
            // If the array is empty, just create an empty element for it.
            currentParent.appendChild( currentParent.ownerDocument.createElement(nodeLabel) );
        }
    }

})(jQuery); // Pass the jQuery object to the immediately invoked function expression.