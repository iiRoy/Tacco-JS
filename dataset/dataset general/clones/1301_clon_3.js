(function () {
    /**
     * RichContentPaster
     *
     * This utility facilitates the insertion of pre-defined HTML content
     * into the current cursor position within a rich text editor or any
     * editable DOM element. It's designed to function as a plug-in component
     * for editor frameworks, providing a button interface.
     *
     * @license MIT
     * @copyright (c) 2014 original author; re-engineered for Type III clone
     *
     * @class RichContentPaster
     * @param {Object} initOptions Configuration object for the tool.
     *   Expected fields:
     *   - `displayLabel`: Text to display on the action button (default: `</>`).
     *   - `contentPayload`: The actual HTML string to be injected when activated.
     */
    function RichContentPaster(initOptions) {
        // Enforce configuration object presence
        if (!initOptions || typeof initOptions !== 'object') {
            console.warn("RichContentPaster: Initial configuration options are missing or invalid. Using defaults.");
            initOptions = {};
        }

        // Establish default settings and merge with provided options
        const defaultSettings = {
            displayLabel: "</>",
            contentPayload: "" // Default to empty string for safety
        };
        this._toolConfig = Object.assign({}, defaultSettings, initOptions);

        // Create the interactive UI element
        this._actionElement = document.createElement('button');
        this._actionElement.className = 'editor-action-control'; // Custom class name for styling

        // Set the button's visible text, handling cross-browser differences for text assignment
        const buttonLabel = this._toolConfig.displayLabel;
        if (typeof this._actionElement.innerText !== 'undefined') {
            this._actionElement.innerText = buttonLabel;
        } else {
            // Fallback for older browsers that might not support innerText reliably
            this._actionElement.textContent = buttonLabel;
        }

        // Bind the activation handler to the button's click event
        // Using an arrow function here to correctly preserve 'this' context,
        // which avoids the need for explicit .bind(this) on the prototype method.
        this._actionElement.addEventListener('click', () => this._activateTool());

        // Basic validation for the content payload
        if (typeof this._toolConfig.contentPayload !== 'string') {
            console.error("RichContentPaster: 'contentPayload' must be a string. Current value ignored.");
            this._toolConfig.contentPayload = "";
        }
    }

    /**
     * _injectContentAtCursor (Static Method)
     * Inserts a given HTML string at the current cursor or selection point
     * within an editable area. This method is designed to be static as it
     * operates on the global document selection rather than instance-specific data.
     *
     * @static
     * @param {string} markupString The HTML content to be inserted.
     * @returns {void}
     */
    RichContentPaster._injectContentAtCursor = function(markupString) {
        // Prevent insertion of non-string or empty content
        if (!markupString || typeof markupString !== 'string' || markupString.trim() === '') {
            console.warn("Attempted to inject empty or invalid markup string.");
            return;
        }

        let userSelection, selectionRange;

        // Modern browsers (IE9+, non-IE)
        if (window.getSelection) {
            userSelection = window.getSelection();
            // Proceed only if there's an active selection range
            if (userSelection.rangeCount > 0) {
                selectionRange = userSelection.getRangeAt(0);
                selectionRange.deleteContents(); // Remove selected content before insertion

                // Create a temporary container to parse the HTML string into DOM nodes.
                // This is a robust way to handle arbitrary HTML without directly setting innerHTML
                // on the document fragment, which might have security implications or parsing issues.
                const tempParserDiv = document.createElement("div");
                tempParserDiv.innerHTML = markupString;

                // Use a DocumentFragment for efficient DOM manipulation.
                // Appending nodes to a fragment first, then inserting the fragment,
                // minimizes reflows and repaints.
                const nodeFragment = document.createDocumentFragment();
                let currentChildNode, lastProcessedNode;

                // Move all child nodes from the temporary div to the document fragment
                // The loop condition `(currentChildNode = tempParserDiv.firstChild)`
                // assigns the first child and then checks if it's non-null.
                // `appendChild` automatically removes the node from its original parent.
                while ((currentChildNode = tempParserDiv.firstChild)) {
                    lastProcessedNode = nodeFragment.appendChild(currentChildNode);
                }

                selectionRange.insertNode(nodeFragment); // Insert the fragment into the document

                // Restore and collapse the selection immediately after the inserted content
                if (lastProcessedNode) {
                    selectionRange = selectionRange.cloneRange(); // Clone to avoid modifying the original range directly
                    selectionRange.setStartAfter(lastProcessedNode);
                    selectionRange.collapse(true); // Collapse to the end of the new range
                    userSelection.removeAllRanges(); // Clear existing selections
                    userSelection.addRange(selectionRange); // Add the newly configured range
                }
            }
        }
        // Legacy Internet Explorer (IE < 9) support
        else if (document.selection && document.selection.type !== "Control") {
            // IE's proprietary method for inserting HTML directly into the selection
            document.selection.createRange().pasteHTML(markupString);
        }
    };

    /**
     * _activateTool (Prototype Method)
     * This handler is invoked when the action button is clicked. It retrieves
     * the configured HTML payload and initiates its insertion into the editor.
     *
     * @private
     * @returns {void}
     */
    RichContentPaster.prototype._activateTool = function () {
        // Delegate the actual content injection to the static helper method
        // using the content specified in this instance's configuration.
        RichContentPaster._injectContentAtCursor(this._toolConfig.contentPayload);
    };

    /**
     * getControlElement (Prototype Method)
     * Provides access to the HTML button element managed by this instance.
     * This method is typically called by an external editor framework to
     * integrate the tool's button into its toolbar.
     *
     * @public
     * @returns {HTMLButtonElement} The DOM element representing the tool's button.
     */
    RichContentPaster.prototype.getControlElement = function () {
        return this._actionElement;
    };

    // Expose the constructor globally under a new, descriptive name.
    // This makes the RichContentPaster available for instantiation in other scripts.
    window.RichContentPaster = RichContentPaster;
})();