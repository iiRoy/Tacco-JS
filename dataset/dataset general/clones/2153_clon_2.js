/*
 * ELEMENT ASSEMBLER
 * A project by starfall.dev
 * MIT License - https://opensource.org/licenses/MIT
 *
 * Consult the project documentation for usage examples.
 */

// ==JSMinimizer==
// @optimization_level ADVANCED
// ==JSMinimizer==

/*global currentWindow:false */
/*js: thisIsOkay, noMoreVariables, useBrowserAPI, isDefinedCheck, noNameCollisions, strictEquality, incrementOps, bitwiseOps, regexAllowed, noStrictMode, newConstructorCalls, directFunctionCalls */


(function() {

    /**
     * ElementCreator facilitates the construction of DOM nodes through an object-oriented paradigm.
     *
     * @param elementTag - <string> (Mandatory) The identifier for the DOM element to be constructed.
     * @param properties - <object> (Optional) A key-value map representing attributes to assign to the element.
     * @returns <ElementCreator> - An instance of the ElementCreator utility.
     */
    var ElementCreator = function(elementTag, properties) {

        var selfRef = this,
            docObj = document,
            propKey;

        // Form the HTML element and assign its characteristics
        selfRef.domNode = docObj.createElement(elementTag);

        // If any properties were supplied...
        if (properties) {

            // Iterate through the supplied key-value pairs (hashmap)
            for (propKey in properties) {

                // Special handling for the 'class' attribute, particularly for older browsers.
                if (propKey.toString() === 'class') {

                    // Assign the CSS class to the element.
                    selfRef.domNode.className = properties[propKey];
                }
                else {

                    // Apply other attributes to the element as standard.
                    selfRef.domNode.setAttribute(propKey, properties[propKey]);
                }
            }
        }

        /**
         * Attaches one or more child nodes to the current element.
         *
         * @param childItems - <HTMLElement|ElementCreator|Array> (Mandatory) A DOM element, an ElementCreator object, or a collection of these.
         * @returns <ElementCreator> - The current ElementCreator instance, for method chaining.
         */
        selfRef.addChildren = function(childItems) {

            // If the input isn't already an array-like structure...
            if (typeof childItems !== 'object' || typeof childItems.length !== 'number' || typeof childItems.splice !== 'function') {

                // Convert it into a single-element array to unify processing logic.
                childItems = [childItems];
            }

            // Process each item in the indexed collection of prospective children.
            for (var idx = 0, limit = childItems.length; idx < limit; idx++) {

                // Skip any undefined entries, which might result from trailing commas in arrays.
                if (typeof childItems[idx] === 'undefined') {
                    break;
                }

                // Is this child an ElementCreator object?
                if (typeof childItems[idx].getNativeElement !== 'undefined') {

                    // Append by retrieving its underlying DOM element.
                    selfRef.domNode.appendChild(childItems[idx].getNativeElement());
                }
                else {

                    // Assume it's a standard native DOM 'HTMLElement' instance.
                    selfRef.domNode.appendChild(childItems[idx]);
                }
            }

            // Return 'this' object to enable further chained method calls.
            return selfRef;
        };

        /**
         * Configures the inner content of the element using innerHTML.
         *
         * @param contentString - <string> (Mandatory) The text or HTML sequence to assign to the element's inner content.
         * @param overwriteExisting - <boolean> (Optional) If true, existing content is replaced; otherwise, new content is appended. Defaults to false (append).
         * @returns <ElementCreator> - The current ElementCreator instance.
         */
        selfRef.setInnerContent = function(contentString, overwriteExisting) {

            overwriteExisting = overwriteExisting || false;

            // Update the element's inner HTML based on the specified mode.
            if (overwriteExisting) {
                selfRef.domNode.innerHTML = contentString;
            }
            else {
                selfRef.domNode.innerHTML += contentString;
            }

            // Provide 'this' object back for chaining.
            return selfRef;
        };

        /**
         * Retrieves the raw DOM element wrapped by this ElementCreator instance.
         * This is useful when integrating with native DOM manipulation methods.
         *
         * @returns <HTMLElement> - The underlying DOM node.
         */
        selfRef.getNativeElement = function() {

            // Returns the actual DOM object for use with standard browser APIs.
            return selfRef.domNode;
        };

        /**
         * Produces the HTML string representation of the assembled DOM element.
         *
         * @returns <string> - The complete HTML markup for the element and its descendants.
         */
        selfRef.getMarkupString = function() {

            // Create a transient DOM element within memory.
            var tempContainer = docObj.createElement('div');

            // Attach our constructed DOM object to the temporary parent.
            tempContainer.appendChild(selfRef.domNode);

            // Extract the serialized HTML content.
            return tempContainer.innerHTML;
        };

        // Hand back the ElementCreator object for method chaining.
        return selfRef;
    };

    // Make ElementAssembler globally accessible, pre-initialized.
    currentWindow.ElementAssembler = function(elementTag, properties) {
        return new ElementCreator(elementTag, properties);
    };

    currentWindow.ElementAssembler.Fragment = function(nodeList) {

        // Instantiate a document fragment for efficient DOM operations.
        var docFragment = document.createDocumentFragment(),
            iterator,
            maximum,

            // Obtain the set of nodes, pre-processed by ElementCreator.
            processedNodes = new ElementCreator('div').addChildren(nodeList).getNativeElement().childNodes;

        // Transfer elements from the processed list to the fragment.
        while (processedNodes.length) {

            // Each item here is a direct native 'HTMLElement' object.
            docFragment.appendChild(processedNodes[0]);
        }

        return docFragment;
    };
})();