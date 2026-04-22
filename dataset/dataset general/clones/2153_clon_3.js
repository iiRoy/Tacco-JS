// NodeComposer - A Fluent DOM Construction Utility
// Project: NodeComposer - Lightweight DOM Element Assembly
// Source: https://github.com/yourusername/node-composer/ (Fictional new URL)
// License: MIT - https://opensource.org/licenses/MIT

// This module provides an object-oriented approach to building and manipulating DOM elements.
// It simplifies common DOM operations and allows for method chaining to create complex structures efficiently.

(function() { // Anonymous self-executing function to establish a private scope

    /**
     * The core builder class responsible for constructing and managing a single DOM element.
     * It exposes methods for adding child elements, setting inner HTML, and retrieving the native DOM object.
     *
     * @param {string} nodeType - The HTML tag name for the element to create (e.g., 'div', 'span', 'button').
     * @param {Object.<string, string|number|boolean|Object>} [elementOptions] - A collection of attributes or properties to apply.
     * @returns {VisualElementBuilder} An instance of the builder, allowing for method chaining.
     */
    var VisualElementBuilder = function(nodeType, elementOptions) {
        // A self-reference for internal method access and chaining.
        const currentBuilder = this;
        // Direct reference to the global document object for DOM operations.
        const hostDocument = document;

        // Robust input validation for the element tag name.
        if (typeof nodeType !== 'string' || nodeType.trim().length === 0) {
            console.error("NodeComposer: Invalid or empty 'nodeType' provided. Defaulting to 'div'.");
            nodeType = 'div'; // Fallback to prevent errors.
        }

        // Initialize the fundamental DOM element.
        currentBuilder.targetNode = hostDocument.createElement(nodeType);

        // Process and apply any specified attributes or properties.
        if (elementOptions && typeof elementOptions === 'object') {
            for (const optionKey in elementOptions) {
                // Ensure the property is directly on the object and not from its prototype chain.
                if (Object.prototype.hasOwnProperty.call(elementOptions, optionKey)) {
                    const value = elementOptions[optionKey];

                    // Special handling for common DOM properties.
                    if (optionKey === 'class' || optionKey === 'className') {
                        currentBuilder.targetNode.className = value;
                    } else if (optionKey === 'style' && typeof value === 'object' && value !== null) {
                        // If 'style' is an object, apply individual CSS properties.
                        Object.assign(currentBuilder.targetNode.style, value);
                    } else if (optionKey === 'dataset' && typeof value === 'object' && value !== null) {
                        // Handle data attributes as an object.
                        Object.assign(currentBuilder.targetNode.dataset, value);
                    } else if (optionKey === 'text' || optionKey === 'textContent') {
                        currentBuilder.targetNode.textContent = value;
                    }
                    else {
                        // For all other attributes, use setAttribute.
                        currentBuilder.targetNode.setAttribute(optionKey, value);
                    }
                }
            }
        }

        /**
         * Attaches one or more child nodes to the current element.
         * This method supports various types of children, including native DOM elements,
         * other builder instances, strings, numbers, or arrays of these types.
         *
         * @param {HTMLElement|VisualElementBuilder|string|number|Array<HTMLElement|VisualElementBuilder|string|number>} childNodesToAppend - The child(ren) to add.
         * @returns {VisualElementBuilder} The current builder instance for further chaining.
         */
        currentBuilder.addDescendants = function(childNodesToAppend) {
            // Normalize the input into an iterable array.
            const processedChildren = Array.isArray(childNodesToAppend) ? childNodesToAppend : [childNodesToAppend];

            processedChildren.forEach(childItem => {
                // Skip any null or undefined items in the array gracefully.
                if (childItem === null || typeof childItem === 'undefined') {
                    return; // Continue to the next item.
                }

                let resolvedNode;

                // Determine the actual DOM node to append based on its type.
                if (typeof childItem === 'object' && childItem !== null && typeof childItem.retrieveDomObject === 'function') {
                    // If it's another VisualElementBuilder instance, extract its native DOM node.
                    resolvedNode = childItem.retrieveDomObject();
                } else if (childItem instanceof HTMLElement || childItem instanceof Text || childItem instanceof Comment) {
                    // If it's already a native DOM element, text node, or comment.
                    resolvedNode = childItem;
                } else if (typeof childItem === 'string' || typeof childItem === 'number') {
                    // Convert strings and numbers into text nodes.
                    resolvedNode = hostDocument.createTextNode(String(childItem));
                } else {
                    // Log a warning for any unrecognized child types and skip them.
                    console.warn('NodeComposer: Unsupported child type encountered. Skipping:', childItem);
                    return;
                }

                // Append the resolved DOM node to the current element.
                currentBuilder.targetNode.appendChild(resolvedNode);
            });

            return currentBuilder; // Preserve chaining.
        };

        /**
         * Updates the inner HTML content of the element.
         * It can either replace existing content or append to it.
         *
         * @param {string|number} markupContent - The HTML string or value to insert.
         * @param {boolean} [shouldOverwrite=false] - If true, replaces existing content; otherwise, appends.
         * @returns {VisualElementBuilder} The current builder instance for chaining.
         */
        currentBuilder.insertHtml = function(markupContent, shouldOverwrite) {
            // Ensure the content is always treated as a string.
            const contentString = String(markupContent || '');

            // Explicitly determine the replacement behavior.
            const overwriteExistingContent = (typeof shouldOverwrite === 'boolean') ? shouldOverwrite : false;

            if (overwriteExistingContent) {
                currentBuilder.targetNode.innerHTML = contentString;
            } else {
                currentBuilder.targetNode.innerHTML += contentString;
            }

            return currentBuilder; // Preserve chaining.
        };

        /**
         * Provides access to the underlying native DOM element.
         * This is essential when interacting with standard DOM APIs or integrating with other libraries.
         *
         * @returns {HTMLElement} The native DOM element managed by this builder.
         */
        currentBuilder.retrieveDomObject = function() {
            return currentBuilder.targetNode;
        };

        /**
         * Generates the outer HTML string representation of the current element and its descendants.
         * This is achieved by temporarily placing a clone of the element into a detached `template` element.
         *
         * @returns {string} The HTML string of the element.
         */
        currentBuilder.extractHtmlString = function() {
            // Early exit if the target node is not available.
            if (!currentBuilder.targetNode) {
                console.warn("NodeComposer: Cannot extract HTML; targetNode is undefined or null.");
                return '';
            }

            // Create a temporary, detached <template> element for serialization.
            // Using a template is generally more efficient and safer as its content is not rendered.
            const htmlSerializer = hostDocument.createElement('template');
            // Append a deep clone to avoid detaching or modifying the actual targetNode.
            htmlSerializer.content.appendChild(currentBuilder.targetNode.cloneNode(true));
            return htmlSerializer.innerHTML;
        };

        return currentBuilder; // Return the builder instance to enable method chaining.
    };

    // Expose the primary factory function globally under 'MarkupGenerator'.
    // This allows users to create new VisualElementBuilder instances.
    window.MarkupGenerator = function(nodeType, elementOptions) {
        return new VisualElementBuilder(nodeType, elementOptions);
    };

    /**
     * A helper function to create a DocumentFragment from an array of various node types.
     * DocumentFragments are highly performant for batch DOM insertions.
     *
     * @param {Array<HTMLElement|VisualElementBuilder|string|number>} inputNodes - An array of items to include in the fragment.
     * @returns {DocumentFragment} A DocumentFragment containing all processed nodes.
     */
    window.MarkupGenerator.assembleFragment = function(inputNodes) {
        // Ensure the input is always an array for consistent processing.
        const nodesToFragment = Array.isArray(inputNodes) ? inputNodes : [inputNodes];

        const outputFragment = document.createDocumentFragment();

        nodesToFragment.forEach(item => {
            // Skip invalid or empty items.
            if (item === null || typeof item === 'undefined') {
                return;
            }

            let nodeForFragment;

            // Resolve the item to an actual DOM node.
            if (typeof item === 'object' && item !== null && typeof item.retrieveDomObject === 'function') {
                nodeForFragment = item.retrieveDomObject();
            } else if (item instanceof HTMLElement || item instanceof Text || item instanceof Comment) {
                nodeForFragment = item;
            } else if (typeof item === 'string' || typeof item === 'number') {
                nodeForFragment = document.createTextNode(String(item));
            } else {
                console.warn('NodeComposer.assembleFragment: Unhandled item type. Skipping:', item);
                return;
            }

            // Append the resolved node directly to the DocumentFragment.
            outputFragment.appendChild(nodeForFragment);
        });

        return outputFragment;
    };
})();