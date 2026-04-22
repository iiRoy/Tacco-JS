// HTML Canvas Rendering Engine
// Copyright (C) 2009 J. Urquhart (Original Author)
// License: Refer to the accompanying LICENSE file for details.

(function() {
    // A simple configuration object for various engine settings.
    const engineConfig = {
        defaultFont: "12pt Arial",
        defaultTextAlign: "left",
        defaultTextBaseline: "top",
        defaultFillColor: "rgb(0, 0, 0, 1.0)",
        defaultStrokeColor: "rgb(1, 0, 0, 1.0)",
        enableVerboseLogging: false, // Control logging output
        nodeTypeConstants: {
            ROOT_ELEMENT: 1,      // Corresponds to document root (e.g., <html>)
            ATTRIBUTE_ELEMENT: 2, // Elements like <title> or attributes
            CONTENT_TEXT: 3,      // Raw text content within a tag
            DOCUMENT_BODY: 9,     // The <body> element
            PLACEHOLDER: 0        // Generic element type (e.g., <p>, <b>, <span>)
        }
    };

    /**
     * Helper function for conditional console logging.
     * @param {string} message - The message to log.
     */
    const logToConsole = (message) => {
        if (engineConfig.enableVerboseLogging && typeof console !== 'undefined' && console.log) {
            console.log(message);
        }
    };

    // Enhance String prototype with a custom whitespace removal utility.
    // This version handles a broader range of Unicode whitespace characters if supported,
    // or can be a slightly different regex than the original.
    String.prototype.stripWhitespace = function() {
        // Matches leading/trailing whitespace including Unicode BOM and non-breaking space.
        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    };

    /**
     * Represents a single element within the virtual DOM structure.
     * This class encapsulates both structural and rendering-related properties.
     * @class
     * @param {number} elemKind - The type identifier for this element (e.g., CONTENT_TEXT, DOCUMENT_BODY).
     * @param {Object} docRef - Reference to the containing document instance.
     */
    function HtmlElement(elemKind, docRef) {
        // Core structural properties
        this.containingDocument = docRef;
        this.elementKind = elemKind;
        this.elementTag = '';       // e.g., 'DIV', 'P', '#text'
        this.contentData = '';      // Text content for text nodes, empty for tag nodes
        this.sequenceId = 0;        // Unique identifier within the document's flat element list
        this.propMap = {};          // Stores element attributes/properties (e.g., { id: 'myId', class: 'myClass' })
        this.parentSequenceId = 0;  // sequenceId of the parent element

        // Standard DOM-like relationship references (initially null)
        this.parentRef = null;        // Reference to the parent HtmlElement object
        this.childrenList = null;     // Array of child HtmlElement objects
        this.firstborn = null;        // Reference to the first child
        this.latestChild = null;      // Reference to the last child
        this.siblingNext = null;      // Reference to the next sibling
        this.siblingPrev = null;      // Reference to the previous sibling

        // Rendering-specific properties (for layout calculations and canvas drawing)
        this.originX = 0;          // Starting X position for the element's layout block
        this.originY = 0;          // Starting Y position for the element's layout block
        this.displayX = 0;         // Current X position for rendering content within its block
        this.displayY = 0;         // Current Y position for rendering content within its block
        this.displayWidth = 0;     // Calculated width after rendering (propagates upwards to parents)
        this.displayHeight = 0;    // Calculated height after rendering
        this._isRendered = false;  // Internal flag to track if this element has been drawn
    }

    /**
     * Represents the entire virtual HTML document.
     * Contains a flat list of all elements and references to key document nodes.
     * @class
     */
    function HtmlDocument() {
        this.elements = [];          // A flat array of all HtmlElement instances in document order
        this.mainBodyElement = null; // Direct reference to the <body> element
        this.documentTitle = null;   // Direct reference to the <title> element
        this.docVersion = '1.0';     // A new property to track document version or metadata
    }

    /**
     * Custom iterator for an element's child nodes in document order.
     * Executes a callback for each child until the callback returns a falsy value.
     * @param {Function} callbackFn - The function to execute for each child. It receives the child HtmlElement.
     * @returns {HtmlElement|null} The element that caused the callback to return falsy, or null if all children traversed.
     */
    HtmlElement.prototype.traverseChildren = function(callbackFn) {
        const elementCollection = this.containingDocument.elements;
        const totalElements = elementCollection.length;
        let currentParentSeq = this.sequenceId;

        // Guard clause: no elements to traverse or invalid parent sequence ID.
        if (!elementCollection || totalElements === 0 || currentParentSeq < 0) {
            logToConsole("Traversal skipped: Invalid collection or parent sequence.");
            return null;
        }

        // Iterate through elements starting from the one immediately after the current element in the flat list.
        for (let i = this.sequenceId + 1; i < totalElements; i++) {
            const currentChildElement = elementCollection[i];

            // If the current element's parent is an ancestor of the current node (i.e., its sequence ID
            // is less than the current parent's), it means we've gone past the children of the current node.
            if (currentChildElement.parentSequenceId < currentParentSeq) {
                break; // Exit traversal, children of 'this' are exhausted.
            }

            // Execute the callback. If it returns false, stop and return the element.
            if (!callbackFn.call(null, currentChildElement)) {
                return currentChildElement;
            }
        }

        return null; // All children traversed without the callback returning false.
    };

    /**
     * Finds the first child element with a specific tag name.
     * @param {string} targetTag - The tag name to search for (e.g., 'DIV', 'P', or '*' for any tag).
     * @returns {HtmlElement|null} The first matching element, or null if none found.
     */
    HtmlElement.prototype.findFirstByTag = function(targetTag) {
        const matchAnyTag = (targetTag === '*' || targetTag === null || targetTag === undefined);

        return this.traverseChildren((node) => {
            // Return true to continue traversal, false to stop and return this node.
            return !(matchAnyTag || node.elementTag === targetTag);
        });
    };

    /**
     * Retrieves all child elements matching a given tag name.
     * @param {string} targetTag - The tag name to search for (e.g., 'DIV', 'P', or '*' for any tag).
     * @returns {Array<HtmlElement>} An array of matching elements. Returns an empty array if none found.
     */
    HtmlElement.prototype.findAllByTag = function(targetTag) {
        const matchAnyTag = (targetTag === '*' || targetTag === null || targetTag === undefined);
        const matchedElements = [];

        this.traverseChildren((node) => {
            if (matchAnyTag || node.elementTag === targetTag) {
                matchedElements.push(node);
            }
            return true; // Always return true to continue traversal for all matches.
        });
        return matchedElements;
    };

    /**
     * Retrieves all child elements matching a given 'name' attribute.
     * Note: The original code had an undeclared 'selectAll' variable; this version defines 'matchAnyName'.
     * @param {string} attributeName - The value of the 'name' attribute to search for.
     * @returns {Array<HtmlElement>} An array of matching elements. Returns an empty array if none found.
     */
    HtmlElement.prototype.findAllByName = function(attributeName) {
        const matchedElements = [];
        const matchAnyName = (attributeName === '*' || attributeName === null || attributeName === undefined);

        this.traverseChildren((node) => {
            // Check if the element has a 'name' property in its propMap and if it matches.
            if (node.propMap && (matchAnyName || node.propMap.name === attributeName)) {
                matchedElements.push(node);
            }
            return true; // Always continue traversal.
        });
        return matchedElements;
    };

    /**
     * Finds the first child element with a specific 'id' attribute.
     * @param {string} targetId - The value of the 'id' attribute to search for.
     * @returns {HtmlElement|null} The first matching element, or null if none found.
     */
    HtmlElement.prototype.findElementById = function(targetId) {
        // Guard clause: ID must be a non-empty string for a valid search.
        if (typeof targetId !== 'string' || targetId.stripWhitespace() === '') {
            logToConsole("findElementById: Invalid targetId provided.");
            return null;
        }

        return this.traverseChildren((node) => {
            // Return true to continue if IDs don't match, false to stop and return this node if they do.
            return node.propMap.id !== targetId;
        });
    };

    /**
     * Retrieves the value of a specified attribute from the element's property map.
     * @param {string} attributeName - The name of the attribute to retrieve.
     * @returns {any|undefined} The attribute's value, or undefined if not found or if the name is invalid.
     */
    HtmlElement.prototype.getProp = function(attributeName) {
        // Basic validation for attribute name.
        if (typeof attributeName !== 'string' || attributeName.stripWhitespace() === '') {
            logToConsole("getProp: Invalid attribute name provided.");
            return undefined;
        }
        return this.propMap[attributeName];
    };

    /**
     * Sets or updates the value of a specified attribute in the element's property map.
     * @param {string} attributeName - The name of the attribute to set.
     * @param {any} propertyValue - The value to assign to the attribute.
     */
    HtmlElement.prototype.setProp = function(attributeName, propertyValue) {
        // Basic validation for attribute name.
        if (typeof attributeName !== 'string' || attributeName.stripWhitespace() === '') {
            logToConsole("setProp: Invalid attribute name provided.");
            return;
        }
        this.propMap[attributeName] = propertyValue;
    };

    /**
     * Locates the main body element within a collection of elements.
     * @param {Array<HtmlElement>} elementCollection - The flat list of elements to search.
     * @returns {HtmlElement|null} The body element, or null if not found.
     */
    function locateMainContentNode(elementCollection) {
        // Guard clause for empty or invalid collection.
        if (!Array.isArray(elementCollection) || elementCollection.length === 0) {
            logToConsole("locateMainContentNode: Empty or invalid element collection.");
            return null;
        }

        // Iterate through the collection to find an element with the DOCUMENT_BODY kind.
        // A simple `for...of` loop is used for clarity.
        for (const elem of elementCollection) {
            if (elem.elementKind === engineConfig.nodeTypeConstants.DOCUMENT_BODY) {
                return elem;
            }
        }

        return null; // Body element not found in the collection.
    }

    /**
     * Retrieves the array index of an element within a collection based on its unique sequenceId.
     * @param {Array<HtmlElement>} nodeCollection - The collection of nodes to search.
     * @param {number} targetSeqId - The sequenceId of the node to find.
     * @returns {number} The array index of the node, or -1 if not found or if inputs are invalid.
     */
    function retrieveNodeIndex(nodeCollection, targetSeqId) {
        // Guard clause for empty or invalid collection or target ID.
        if (!Array.isArray(nodeCollection) || nodeCollection.length === 0 || typeof targetSeqId !== 'number' || targetSeqId < 0) {
            logToConsole("retrieveNodeIndex: Empty or invalid node collection or target ID.");
            return -1;
        }

        // Iterate backwards from the end of the collection. This can sometimes be faster
        // if the target node is more likely to be a recently added (higher index) node.
        for (let i = nodeCollection.length - 1; i >= 0; i--) {
            if (nodeCollection[i].sequenceId === targetSeqId) {
                return i;
            }
        }

        return -1; // Node with the specified sequenceId not found.
    }

    /**
     * Trims a node stack (array) down to a specific element identified by its sequenceId (inclusive).
     * This simulates popping elements off a stack until a certain parent is reached.
     * @param {Array<HtmlElement>} nodeStack - The stack of nodes (an array).
     * @param {number} targetSeqId - The sequenceId of the node to trim to (inclusive).
     * @returns {Array<HtmlElement>} A new, shallow-copied and trimmed node stack.
     */
    function trimNodeStack(nodeStack, targetSeqId) {
        // Guard clause for empty stack, invalid target ID, or non-array input.
        if (!Array.isArray(nodeStack) || nodeStack.length === 0 || typeof targetSeqId !== 'number' || targetSeqId < 0) {
            logToConsole("trimNodeStack: Invalid node stack or target ID. Returning empty stack.");
            return []; // Return an empty array if invalid.
        }

        const closedElementArrIndex = retrieveNodeIndex(nodeStack, targetSeqId);
        if (closedElementArrIndex >= 0) {
            // Create a new array containing elements up to and including the target.
            // Using `slice` creates a shallow copy, which is generally safer than modifying
            // the original array in place if it's shared.
            return nodeStack.slice(0, closedElementArrIndex + 1);
        }

        // If target ID not found in the stack, return a shallow copy of the original stack.
        // This ensures consistent return type (a new array).
        return [...nodeStack];
    }

    /**
     * Finds the array index of the last open node with a specific tag name in a stack.
     * Useful for matching closing tags to their corresponding opening tags.
     * @param {Array<HtmlElement>} elementStack - The stack of currently open elements.
     * @param {string} targetTag - The tag name to search for (e.g., 'P', 'B').
     * @returns {number} The array index of the matching element, or -1 if not found.
     */
    function locateOpenTag(elementStack, targetTag) {
        // Guard clause for empty or invalid stack.
        if (!Array.isArray(elementStack) || elementStack.length === 0) {
            logToConsole("locateOpenTag: Empty or invalid element stack.");
            return -1;
        }

        // Iterate backwards from the top of the stack (most recently opened element).
        for (let i = elementStack.length - 1; i >= 0; i--) {
            if (elementStack[i].elementTag === targetTag) {
                return i;
            }
        }

        return -1; // Tag not found in the stack.
    }

    /**
     * Performs layout calculations for all elements within the document's body.
     * This function updates rendering-specific properties (originX, displayX, displayWidth, etc.)
     * for each HtmlElement based on its content and parent context.
     * @param {HtmlElement} mainBodyNode - The main body element of the document.
     * @param {Array<HtmlElement>} elementCollection - The flat list of all elements in the document.
     * @returns {Array<HtmlElement>} The updated element collection with layout properties set.
     */
    function arrangeElements(mainBodyNode, elementCollection) {
        // Pre-conditions check for valid inputs.
        if (!mainBodyNode || !Array.isArray(elementCollection) || elementCollection.length === 0) {
            logToConsole("arrangeElements: Invalid main body node or element collection. Aborting layout.");
            return elementCollection;
        }

        const totalElements = elementCollection.length;
        let currentElementStack = []; // Tracks the hierarchy of currently open elements.
        // Assuming 'output' is a canvas element's ID.
        const canvasContext = document.getElementById('output').getContext("2d");

        // Initialize canvas context styling for accurate text measurement during layout.
        canvasContext.font = engineConfig.defaultFont;
        canvasContext.textAlign = engineConfig.defaultTextAlign;
        canvasContext.textBaseline = engineConfig.defaultTextBaseline;
        canvasContext.fillStyle = engineConfig.defaultFillColor;
        canvasContext.strokeStyle = engineConfig.defaultStrokeColor;

        let currentActiveElement = mainBodyNode; // The element currently dictating layout context.
        currentElementStack.push(mainBodyNode); // Start with the body on the stack as the initial context.

        // Iterate through elements starting from the one immediately after the body in the flat list.
        for (let i = mainBodyNode.sequenceId + 1; i < totalElements; i++) {
            const currentProcessedElement = elementCollection[i];

            logToConsole(`[${i}] ${currentProcessedElement.elementTag}='${currentProcessedElement.contentData}' @ P[${currentProcessedElement.parentSequenceId}] START=${currentActiveElement.originX + currentActiveElement.displayWidth}`);

            // If the current element's parent sequence ID is less than the body's,
            // it means we've processed all elements within the body's scope.
            if (currentProcessedElement.parentSequenceId < mainBodyNode.sequenceId) {
                break; // Exit the layout loop.
            }

            let requiresLineBreak = false; // Flag to indicate if a new line is needed for the next element.

            // Handle element closing: Pop elements from the stack until the parent of the currentProcessedElement is found.
            if (currentProcessedElement.parentSequenceId < currentActiveElement.sequenceId) {
                const closedElementIndexInStack = retrieveNodeIndex(currentElementStack, currentProcessedElement.parentSequenceId);

                // If a valid parent is found in the stack, update render dimensions for parent nodes.
                if (closedElementIndexInStack >= 0) {
                    // Iterate from the second-to-last element in the stack down to the parent that just closed.
                    for (let j = currentElementStack.length - 2; j >= closedElementIndexInStack; j--) {
                        const childElementForUpdate = currentElementStack[j + 1];
                        const parentElementForUpdate = currentElementStack[j];

                        // Ensure parent's block width/height encompasses its children's rendered area.
                        parentElementForUpdate.displayWidth = Math.max(
                            parentElementForUpdate.displayWidth,
                            (childElementForUpdate.originX + childElementForUpdate.displayWidth) - parentElementForUpdate.originX
                        );
                        parentElementForUpdate.displayHeight = Math.max(
                            parentElementForUpdate.displayHeight,
                            (childElementForUpdate.originY + childElementForUpdate.displayHeight) - parentElementForUpdate.originY
                        );

                        // Update parent's render position (e.g., for inline elements, to continue horizontally).
                        parentElementForUpdate.displayX = childElementForUpdate.originX + childElementForUpdate.displayWidth;
                        logToConsole(`  [${parentElementForUpdate.sequenceId}] Updated dimensions based on child [${childElementForUpdate.sequenceId}]`);
                    }

                    // Check if the element that just closed requires a line break (e.g., a paragraph tag).
                    const elementThatClosed = currentElementStack[closedElementIndexInStack + 1];
                    if (elementThatClosed && elementThatClosed.elementTag === 'P') {
                        requiresLineBreak = true;
                    }

                    currentElementStack = trimNodeStack(currentElementStack, currentProcessedElement.parentSequenceId);
                    currentActiveElement = currentElementStack[currentElementStack.length - 1]; // Update current active element to the new top of stack.
                } else {
                    logToConsole("!! Layout anomaly: Parent not found in stack for closing element. This might indicate malformed HTML.");
                }
            }

            // Process content nodes (raw text)
            if (currentProcessedElement.elementKind === engineConfig.nodeTypeConstants.CONTENT_TEXT) {
                // Apply styling based on the current active element's tag (e.g., bold for 'B' tag).
                if (currentActiveElement.elementTag === 'B') {
                    canvasContext.font = "bold " + engineConfig.defaultFont.split(' ')[0] + " " + engineConfig.defaultFont.split(' ')[1]; // Extract font size and family
                } else {
                    canvasContext.font = engineConfig.defaultFont; // Revert to default font.
                }

                const textMetrics = canvasContext.measureText(currentProcessedElement.contentData);

                logToConsole(`    Rendering text at ${currentActiveElement.displayX} [${currentActiveElement.sequenceId}]`);

                // Set rendering position and width for the text node.
                currentProcessedElement.displayX = currentActiveElement.displayX;
                currentProcessedElement.displayY = currentActiveElement.displayY;
                currentProcessedElement.displayWidth = textMetrics.width;
                // A common default line height for 12pt font.
                currentProcessedElement.displayHeight = 14;

                // Update the current active element's render position and width based on the text node.
                currentActiveElement.displayX += currentProcessedElement.displayWidth;
                currentActiveElement.displayWidth = Math.max(
                    currentActiveElement.displayWidth,
                    currentActiveElement.displayX - currentActiveElement.originX
                );
                currentActiveElement.displayHeight = Math.max(
                    currentActiveElement.displayHeight,
                    currentProcessedElement.displayHeight // Ensure parent height accounts for text height.
                );

            } else { // Process other element types (tags like <p>, <div>, <b>)
                // Sanity check: Ensure parent-child relationship is valid.
                if (currentProcessedElement.parentSequenceId > currentActiveElement.sequenceId) {
                    logToConsole("!! Layout anomaly: Element's parent sequence ID is greater than current active element. Skipping this element.");
                    continue; // Skip this element if the parent relationship is illogical.
                }

                // Add the new element to the stack, making it the new active context.
                currentElementStack.push(currentProcessedElement);

                // Determine block origin (starting position of this element's layout area).
                if (requiresLineBreak) {
                    currentProcessedElement.originX = currentActiveElement.originX; // Start at the same X as parent's block.
                    currentProcessedElement.originY = currentActiveElement.displayY + currentActiveElement.displayHeight; // Start below the parent's content.
                } else {
                    currentProcessedElement.originX = currentActiveElement.displayX; // Continue horizontally from parent's content.
                    currentProcessedElement.originY = currentActiveElement.displayY; // Same Y as parent's content.
                }

                // Initialize render position to block origin.
                currentProcessedElement.displayX = currentProcessedElement.originX;
                currentProcessedElement.displayY = currentProcessedElement.originY;

                currentActiveElement = currentProcessedElement; // This element becomes the new active layout context.
            }
        }

        logToConsole("LAYOUT COMPLETE:");
        // Optionally log the entire processed element collection for detailed debugging.
        // logToConsole(elementCollection);

        return elementCollection;
    }

    /**
     * Renders the parsed document onto a canvas context.
     * This function uses the layout properties calculated by `arrangeElements` to draw.
     * @param {HtmlDocument} parsedDoc - The document object containing elements to render.
     */
    function paintDocument(parsedDoc) {
        // Pre-conditions check for valid document and elements.
        if (!parsedDoc || !parsedDoc.elements || parsedDoc.elements.length === 0 || !parsedDoc.mainBodyElement) {
            logToConsole("paintDocument: Invalid document or no elements to render. Aborting.");
            return;
        }

        let elementCollection = parsedDoc.elements;
        const totalElements = elementCollection.length;

        let currentElementStack = []; // Stack to track rendering context (e.g., for style inheritance).
        const canvasContext = document.getElementById('output').getContext("2d");

        // Set initial rendering styles for the canvas context.
        canvasContext.font = engineConfig.defaultFont;
        canvasContext.textAlign = engineConfig.defaultTextAlign;
        canvasContext.textBaseline = engineConfig.defaultTextBaseline;
        canvasContext.fillStyle = engineConfig.defaultFillColor;

        const mainBodyNode = parsedDoc.mainBodyElement;

        // First, ensure layout calculations have been performed.
        // Calling it here again ensures it's always done before rendering, even if not explicitly called externally.
        elementCollection = arrangeElements(mainBodyNode, elementCollection);

        // Iterate through elements for actual rendering.
        let currentRenderElement = mainBodyNode;
        currentElementStack.push(mainBodyNode); // Ensure body is on stack for context.

        for (let i = mainBodyNode.sequenceId + 1; i < totalElements; i++) {
            const currentElementToDraw = elementCollection[i];

            // If we've moved past the body's children, stop rendering.
            if (currentElementToDraw.parentSequenceId < mainBodyNode.sequenceId) {
                break;
            }

            // DEBUG: Optionally draw bounding boxes for paragraph elements.
            // This is a Type III addition for visual debugging.
            // if (currentElementToDraw.elementTag === 'P') {
            //     canvasContext.strokeStyle = 'rgba(255, 0, 0, 0.5)'; // Red border for paragraphs
            //     canvasContext.strokeRect(currentElementToDraw.originX, currentElementToDraw.originY, currentElementToDraw.displayWidth, currentElementToDraw.displayHeight);
            //     canvasContext.strokeStyle = engineConfig.defaultStrokeColor; // Reset stroke color
            // }

            // Handle element closing: Pop elements from stack if parent has closed.
            if (currentElementToDraw.parentSequenceId < currentRenderElement.sequenceId) {
                currentElementStack = trimNodeStack(currentElementStack, currentElementToDraw.parentSequenceId);
                currentRenderElement = currentElementStack[currentElementStack.length - 1]; // Update current rendering context.
            }

            // Render content nodes (raw text).
            if (currentElementToDraw.elementKind === engineConfig.nodeTypeConstants.CONTENT_TEXT) {
                // Apply styling based on the current rendering element's tag (parent context).
                if (currentRenderElement.elementTag === 'B') {
                    canvasContext.font = "bold " + engineConfig.defaultFont.split(' ')[0] + " " + engineConfig.defaultFont.split(' ')[1];
                } else {
                    canvasContext.font = engineConfig.defaultFont; // Revert to default font.
                }

                // Draw the text content on the canvas using the pre-calculated display coordinates.
                canvasContext.fillText(currentElementToDraw.contentData, currentElementToDraw.displayX, currentElementToDraw.displayY);
                logToConsole(`${currentElementToDraw.contentData} rendered at ${currentElementToDraw.displayX},${currentElementToDraw.displayY}`);
            } else {
                // For non-content nodes, update the current rendering element if it's a new child.
                if (currentElementToDraw.parentSequenceId > currentRenderElement.sequenceId) {
                    logToConsole("!! Render anomaly: Element's parent sequence ID is greater than current rendering element. Skipping this element.");
                    continue; // Skip if parent relationship is illogical.
                }

                // Push new tag element onto the stack to become the current rendering context.
                currentElementStack.push(currentElementToDraw);
                currentRenderElement = currentElementToDraw;
            }
        }
    }

    /**
     * Establishes standard DOM-like parent/child/sibling relationships between elements
     * within the document structure, starting from a given root.
     * @param {HtmlElement} documentRoot - The root element from which to populate relationships.
     */
    function establishDomRelations(documentRoot) {
        // Pre-conditions check for valid document root and its associated elements.
        if (!documentRoot || !documentRoot.containingDocument || !documentRoot.containingDocument.elements) {
            logToConsole("establishDomRelations: Invalid document root. Aborting relationship population.");
            return;
        }

        let processingStack = []; // Stack to keep track of parent elements for relationship assignment.
        let currentParentContext = documentRoot;
        let previousElementProcessed = null; // Reference to the element processed just before the current one.

        documentRoot.traverseChildren(function(currentElement) {
            // Reset existing DOM relationship properties to ensure a clean slate before populating.
            currentElement.childrenList = []; // Initialize as empty array instead of null for consistency.
            currentElement.firstborn = null;
            currentElement.latestChild = null;
            currentElement.siblingPrev = null;
            currentElement.siblingNext = null;

            // If the current element's parent sequence ID is less than the current context's,
            // it means we've closed one or more parent elements and need to pop the stack.
            if (currentElement.parentSequenceId < currentParentContext.sequenceId) {
                processingStack = trimNodeStack(processingStack, currentElement.parentSequenceId);
                currentParentContext = processingStack[processingStack.length - 1]; // Update parent context to the new top of stack.
            }

            // Assign current element as a child of the current parent context.
            if (!currentParentContext.childrenList) {
                currentParentContext.childrenList = []; // Ensure it's an array before pushing.
            }
            currentParentContext.childrenList.push(currentElement);

            // Set the first child reference if it's the first child.
            if (currentParentContext.firstborn === null) {
                currentParentContext.firstborn = currentElement;
            }

            // Establish sibling relationships with the previous element processed *under the same parent*.
            if (currentParentContext.latestChild) {
                currentParentContext.latestChild.siblingNext = currentElement;
                currentElement.siblingPrev = currentParentContext.latestChild;
            }
            currentParentContext.latestChild = currentElement; // Update the latest child reference.
            currentElement.parentRef = currentParentContext; // Assign the parent reference.

            // If the current element opens a new scope (its parent is the current context),
            // push it onto the processing stack to become the new parent context.
            if (currentElement.parentSequenceId === currentParentContext.sequenceId) {
                processingStack.push(currentElement);
                currentParentContext = currentElement; // This element becomes the new context for subsequent children.
            }

            previousElementProcessed = currentElement; // Keep track of the last element processed.
            return true; // Continue traversal.
        });
    }

    // --- Helper functions for creating various types of HtmlElements ---

    /**
     * Internal helper to create a base HtmlElement with common properties.
     * This centralizes the element creation logic.
     * @param {Object} docRef - The containing HtmlDocument instance.
     * @param {number} kind - The elementKind constant (e.g., CONTENT_TEXT, DOCUMENT_BODY).
     * @param {string} textContent - The content data for the element.
     * @param {HtmlElement} parentElem - The parent element to establish parentSequenceId.
     * @returns {HtmlElement|null} The newly created HtmlElement, or null if creation failed.
     */
    function _createBaseElement(docRef, kind, textContent, parentElem) {
        if (!docRef || !parentElem || typeof kind !== 'number') {
            logToConsole("Error: Missing document, parent reference, or invalid kind for base element creation.");
            return null; // Guard against invalid inputs.
        }
        const newElement = new HtmlElement(kind, docRef);
        newElement.contentData = textContent;
        newElement.sequenceId = docRef.elements.length;
        newElement.parentSequenceId = parentElem.sequenceId;
        docRef.elements.push(newElement); // Add to the document's flat list.
        return newElement;
    }

    /**
     * Creates and adds a text content element.
     * @param {Object} docRef - The containing HtmlDocument.
     * @param {string} elementText - The raw text content.
     * @param {HtmlElement} parentElem - The parent element.
     * @returns {HtmlElement|null} The created content element.
     */
    function createContentElement(docRef, elementText, parentElem) {
        // Only trim whitespace if the parent is not a SPAN (or similar inline element that preserves space).
        const processedText = (parentElem.elementTag === 'SPAN') ? elementText : elementText.stripWhitespace();
        const contentNode = _createBaseElement(docRef, engineConfig.nodeTypeConstants.CONTENT_TEXT, processedText, parentElem);
        if (contentNode) contentNode.elementTag = '#text'; // Standard tag name for text nodes.
        return contentNode;
    }

    /**
     * Creates and adds a root HTML element (e.g., <html>).
     * @param {Object} docRef - The containing HtmlDocument.
     * @param {string} elementText - Initial text content (often empty for root elements).
     * @param {HtmlElement} parentElem - The parent element (typically a dummy document root).
     * @returns {HtmlElement|null} The created root element.
     */
    function createRootElement(docRef, elementText, parentElem) {
        const rootNode = _createBaseElement(docRef, engineConfig.nodeTypeConstants.ROOT_ELEMENT, elementText.stripWhitespace(), parentElem);
        if (rootNode) {
            rootNode.elementTag = 'HTML';
            rootNode.parentSequenceId = -1; // Root element has no conceptual parent in the tree.
        }
        return rootNode;
    }

    /**
     * Creates and adds a document attribute element (e.g., <title>, <meta>).
     * @param {Object} docRef - The containing HtmlDocument.
     * @param {string} elementText - The content for the attribute (e.g., title text).
     * @param {HtmlElement} parentElem - The parent element.
     * @returns {HtmlElement|null} The created attribute element.
     */
    function createDocPropertyElement(docRef, elementText, parentElem) {
        const propNode = _createBaseElement(docRef, engineConfig.nodeTypeConstants.ATTRIBUTE_ELEMENT, elementText.stripWhitespace(), parentElem);
        // The actual tag name (e.g., 'TITLE') will be set by the parser based on context.
        return propNode;
    }

    /**
     * Creates and adds the main body element (<body>).
     * @param {Object} docRef - The containing HtmlDocument.
     * @param {string} elementText - Initial text content for the body (often empty).
     * @param {HtmlElement} parentElem - The parent element (e.g., HTML).
     * @returns {HtmlElement|null} The created body element.
     */
    function createBodyElement(docRef, elementText, parentElem) {
        const bodyNode = _createBaseElement(docRef, engineConfig.nodeTypeConstants.DOCUMENT_BODY, elementText.stripWhitespace(), parentElem);
        if (bodyNode) bodyNode.elementTag = 'BODY';
        return bodyNode;
    }

    /**
     * Creates and adds a generic placeholder element (e.g., P, B, SPAN, DIV).
     * These elements typically define structure or styling rather than specific document properties.
     * @param {Object} docRef - The containing HtmlDocument.
     * @param {string} elementText - Initial text content (often empty).
     * @param {HtmlElement} parentElem - The parent element.
     * @returns {HtmlElement|null} The created placeholder element.
     */
    function createPlaceholderElement(docRef, elementText, parentElem) {
        const dummyNode = _createBaseElement(docRef, engineConfig.nodeTypeConstants.PLACEHOLDER, elementText.stripWhitespace(), parentElem);
        // The actual tag name (e.g., 'P', 'B') will be set by the parser.
        return dummyNode;
    }

    // Registry mapping HTML tag names to their corresponding creation functions.
    // This allows dynamic element creation during the parsing process.
    const elementCreationRegistry = new Map([
        ['HTML', createRootElement],
        ['TITLE', createDocPropertyElement],
        ['BODY', createBodyElement],
        ['P', createPlaceholderElement],
        ['B', createPlaceholderElement],
        ['SPAN', createPlaceholderElement],
        ['DIV', createPlaceholderElement], // Added a new common block tag.
        ['A', createPlaceholderElement],    // Added another common inline tag.
        ['IMG', createPlaceholderElement]   // Self-closing tag, handled differently in parser.
    ]);

    // Regular expression to strip HTML comments (<!-- ... -->).
    // This is a slightly more robust version that handles multi-line comments.
    const htmlCommentScrubber = /<!--[\s\S]*?-->/g;

    /**
     * Parses an HTML string into a structured HtmlDocument object.
     * This is a simplified parser designed for demonstration and will require significant
     * expansion for full HTML5 compliance and error handling.
     * @param {string} markupString - The HTML string to parse.
     * @returns {HtmlDocument} The parsed document object. Returns an empty document if input is invalid.
     */
    function processMarkup(markupString) {
        // Guard clause for invalid or empty input string.
        if (typeof markupString !== 'string' || markupString.stripWhitespace() === '') {
            logToConsole("processMarkup: Invalid or empty markup string provided.");
            return new HtmlDocument(); // Return an empty document object.
        }

        // Regex for matching HTML tags (opening, closing, self-closing) and capturing attributes.
        // Group 1: '/' for closing tag, empty for opening.
        // Group 2: Tag name (e.g., 'p', 'div').
        // Group 3: Raw attributes string (e.g., 'class="foo" id="bar"').
        // Group 4: '/' for self-closing tag (e.g., <img/>).
        const tagPattern = /<(\/?)([A-Za-z][A-Za-z0-9]*)(?:\s+([^>]*?))?(\/?)>/g;
        // Regex for parsing individual attributes from the raw attributes string.
        // Group 1: Attribute name.
        // Group 2: Value in double quotes.
        // Group 3: Value in single quotes.
        // Group 4: Value without quotes (e.g., `checked`).
        const attributePattern = /([a-zA-Z0-9_-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/g;

        // Strip HTML comments first to simplify subsequent tag parsing.
        let cleanedMarkup = markupString.replace(htmlCommentScrubber, '');

        const newDocument = new HtmlDocument();
        let currentParseStack = []; // Stack to keep track of currently open elements.
        let currentDocIndex = 0;    // Counter for assigning unique sequenceIds to new elements.
        let lastIndex = 0;          // Tracks the last position processed in the cleaned markup string.

        // Create a dummy root node to act as an initial container for the entire document structure.
        // This ensures there's always a parent for the first actual HTML element (like <html>).
        const dummyRoot = new HtmlElement(engineConfig.nodeTypeConstants.ROOT_ELEMENT, newDocument);
        dummyRoot.elementTag = '#document'; // A non-standard tag for the document root.
        dummyRoot.sequenceId = currentDocIndex++;
        dummyRoot.parentSequenceId = -1; // No parent for the ultimate root.
        newDocument.elements.push(dummyRoot);
        currentParseStack.push(dummyRoot);
        let currentParent = dummyRoot; // The current parent element on the stack.

        let match;
        // Loop through the cleaned markup string, finding all tags.
        while ((match = tagPattern.exec(cleanedMarkup)) !== null) {
            const [fullMatch, isClosingTagIndicator, tagName, rawAttributes, isSelfClosingIndicator] = match;
            const matchStart = match.index;
            const matchEnd = tagPattern.lastIndex;

            // Extract any text content found between the previous tag and the current one.
            if (matchStart > lastIndex) {
                const textContent = cleanedMarkup.substring(lastIndex, matchStart);
                if (textContent.stripWhitespace().length > 0) {
                    createContentElement(newDocument, textContent, currentParent);
                    currentDocIndex++;
                }
            }

            const normalizedTagName = tagName.toUpperCase(); // Standardize tag names to uppercase.

            if (isClosingTagIndicator) { // This is a closing tag (e.g., `</p>`).
                // Pop elements from the stack until the matching opening tag is found.
                // This provides some robustness for implicitly closed tags or malformed HTML.
                while (currentParseStack.length > 1 && currentParent.elementTag !== normalizedTagName) {
                    logToConsole(`Implicitly closing <${currentParent.elementTag}> before matching </${normalizedTagName}>`);
                    currentParseStack.pop();
                    currentParent = currentParseStack[currentParseStack.length - 1];
                }
                if (currentParent.elementTag === normalizedTagName) {
                    currentParseStack.pop();
                    currentParent = currentParseStack[currentParseStack.length - 1];
                } else {
                    logToConsole(`Warning: No matching opening tag found on stack for </${tagName}>.`);
                }
            } else { // This is an opening tag (e.g., `<p>`) or a self-closing tag (e.g., `<img/>`).
                const creatorFunction = elementCreationRegistry.get(normalizedTagName);
                if (creatorFunction) {
                    // Create the new element using the registered factory function.
                    const newElement = creatorFunction(newDocument, '', currentParent);
                    newElement.elementTag = normalizedTagName; // Set the actual HTML tag name.

                    // Parse attributes if the tag has any.
                    if (rawAttributes) {
                        let attrMatch;
                        // Reset attributePattern.lastIndex for each new rawAttributes string.
                        attributePattern.lastIndex = 0;
                        while ((attrMatch = attributePattern.exec(rawAttributes)) !== null) {
                            const [, attrName, valDoubleQuote, valSingleQuote, valNoQuote] = attrMatch;
                            const attrValue = valDoubleQuote || valSingleQuote || valNoQuote || '';
                            newElement.setProp(attrName, attrValue);
                        }
                    }

                    newElement.sequenceId = currentDocIndex++;
                    newDocument.elements.push(newElement);

                    // Update specific document references if this is the body or title.
                    if (normalizedTagName === 'BODY') {
                        newDocument.mainBodyElement = newElement;
                    } else if (normalizedTagName === 'TITLE') {
                        newDocument.documentTitle = newElement;
                    }

                    // Push onto stack if it's not a self-closing tag.
                    // A list of common self-closing HTML tags is included for robust parsing.
                    const isExplicitlySelfClosing = isSelfClosingIndicator === '/';
                    const isImplicitlySelfClosing = ['AREA', 'BASE', 'BR', 'COL', 'EMBED', 'HR', 'IMG', 'INPUT', 'KEYGEN', 'LINK', 'META', 'PARAM', 'SOURCE', 'TRACK', 'WBR'].includes(normalizedTagName);

                    if (!isExplicitlySelfClosing && !isImplicitlySelfClosing) {
                        currentParseStack.push(newElement);
                        currentParent = newElement; // This new element becomes the current parent.
                    }
                } else {
                    logToConsole(`Warning: Unknown tag encountered: <${tagName}>. Creating as generic placeholder.`);
                    const newElement = createPlaceholderElement(newDocument, '', currentParent);
                    newElement.elementTag = normalizedTagName;
                    newElement.sequenceId = currentDocIndex++;
                    newDocument.elements.push(newElement);
                    currentParseStack.push(newElement);
                    currentParent = newElement; // Treat unknown tags as if they open a new scope.
                }
            }
            lastIndex = matchEnd; // Update the last processed index for the next iteration.
        }

        // Process any remaining text content after the last tag in the document.
        if (lastIndex < cleanedMarkup.length) {
            const remainingText = cleanedMarkup.substring(lastIndex);
            if (remainingText.stripWhitespace().length > 0) {
                createContentElement(newDocument, remainingText, currentParent);
                currentDocIndex++;
            }
        }

        // After parsing, ensure the stack is correctly balanced. Any remaining elements
        // on the stack (other than the dummy root) indicate unclosed tags.
        while (currentParseStack.length > 1) {
            logToConsole(`Implicitly closing <${currentParent.elementTag}> at end of document due to unclosed tag.`);
            currentParseStack.pop();
            currentParent = currentParseStack[currentParseStack.length - 1];
        }

        // Finally, populate the DOM-like parent/child/sibling relationships for the entire structure.
        establishDomRelations(dummyRoot);

        // Return the complete HtmlDocument object.
        return newDocument;
    }

    // Expose core functionalities to the global window object if available (for browser environments).
    // This allows external scripts to interact with the rendering engine.
    if (typeof window !== 'undefined') {
        window.HtmlCanvasEngine = {
            HtmlDocument: HtmlDocument,
            HtmlElement: HtmlElement,
            processMarkup: processMarkup,
            paintDocument: paintDocument,
            // Expose constants for external use if desired.
            NodeTypes: engineConfig.nodeTypeConstants,
            // Provide a method to allow external modification of logging verbosity.
            setVerboseLogging: (enable) => { engineConfig.enableVerboseLogging = !!enable; }
        };
    }

})();