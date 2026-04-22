const ElementManipulator = {
    // Stores the currently selected DOM nodes for subsequent operations.
    // Initially, it's an empty array.
    activeElements: [],

    /**
     * Internal helper to iterate over the activeElements.
     * This encapsulates the common forEach logic.
     * @param {Function} processingCallback - The function to execute for each element.
     * @private
     */
    _processSelectedNodes(processingCallback) {
        if (typeof processingCallback !== 'function') {
            console.warn("ElementManipulator: Iteration callback must be a function.");
            return; // Do not proceed without a valid callback.
        }
        this.activeElements.forEach(processingCallback);
    },

    /**
     * Selects DOM nodes based on a CSS query string.
     * Stores the found nodes in 'activeElements' for chaining.
     * @param {string} cssQuery - The CSS selector string (e.g., '.my-class', '#my-id', 'div p').
     * @returns {ElementManipulator} - Returns the instance for method chaining.
     */
    queryNodes(cssQuery) {
        // Validation: Ensure the query is a valid string.
        if (typeof cssQuery !== 'string' || cssQuery.trim() === '') {
            console.warn("ElementManipulator: Invalid or empty CSS query provided. No elements selected.");
            // If the query is invalid, clear previous selection and return.
            this.activeElements = [];
            return this;
        }
        try {
            // Use Array.from for a modern way to convert NodeList to Array.
            this.activeElements = Array.from(document.querySelectorAll(cssQuery));
        } catch (error) {
            console.error(`ElementManipulator: Error querying nodes with selector "${cssQuery}":`, error);
            this.activeElements = []; // Clear on error
        }
        return this; // Enable chaining
    },

    /**
     * Applies a raw CSS string to the 'cssText' property of all selected elements.
     * This allows setting multiple styles at once.
     * @param {string} inlineStylesDeclaration - A CSS string (e.g., 'color: red; font-size: 16px;').
     * @returns {ElementManipulator} - Returns the instance for method chaining.
     */
    applyStyle(inlineStylesDeclaration) {
        // Guard clause: Check if the style declaration is a string.
        if (typeof inlineStylesDeclaration !== 'string' || inlineStylesDeclaration.trim() === '') {
            console.warn("ElementManipulator: Invalid or empty style declaration provided. Skipping style application.");
            return this;
        }

        // Iterate over selected elements and apply the style string.
        this._processSelectedNodes(domNode => {
            domNode.style.cssText = inlineStylesDeclaration;
        });
        return this; // Enable chaining
    },

    /**
     * Sets a specified attribute and its value for all selected elements.
     * @param {string} attributeKey - The name of the attribute (e.g., 'class', 'data-id').
     * @param {string} attributeContent - The value to set for the attribute.
     * @returns {ElementManipulator} - Returns the instance for method chaining.
     */
    setElementAttribute(attributeKey, attributeContent) {
        // Validation: Ensure attribute key is a non-empty string.
        if (typeof attributeKey !== 'string' || attributeKey.trim() === '') {
            console.warn("ElementManipulator: Invalid attribute key provided. Skipping attribute setting.");
            return this;
        }

        // Convert content to string explicitly, as setAttribute expects a string.
        const contentAsString = String(attributeContent);

        // Process each element to set the attribute.
        this._processSelectedNodes(targetNode => {
            targetNode.setAttribute(attributeKey, contentAsString);
        });
        return this; // Enable chaining
    },

    /**
     * Applies a CSS transform animation to all selected elements using a transition.
     * Provides default values for parameters if not specified.
     * @param {number} [durationSeconds=0.3] - The duration of the transition in seconds.
     * @param {number} [scaleFactor=1] - The scaling factor.
     * @param {number} [rotationAngle=0] - Rotation around Z-axis in degrees.
     * @param {number} [rotationXAngle=0] - Rotation around X-axis in degrees.
     * @param {number} [rotationYAngle=0] - Rotation around Y-axis in degrees.
     * @param {number} [translationX=0] - Translation along X-axis in pixels.
     * @param {number} [translationY=0] - Translation along Y-axis in pixels.
     * @param {number} [skewXAngle=0] - Skew transformation along X-axis in degrees.
     * @param {number} [skewYAngle=0] - Skew transformation along Y-axis in degrees.
     * @returns {ElementManipulator} - Returns the instance for method chaining.
     */
    applyTransformAnimation(
        durationSeconds = 0.3,
        scaleFactor = 1,
        rotationAngle = 0,
        rotationXAngle = 0,
        rotationYAngle = 0,
        translationX = 0,
        translationY = 0,
        skewXAngle = 0,
        skewYAngle = 0
    ) {
        // Ensure duration is a positive number.
        const actualDuration = Math.max(0, parseFloat(durationSeconds) || 0);

        // Construct the transform string using template literals for clarity.
        const transformString = `
            scale(${parseFloat(scaleFactor) || 1})
            rotate(${parseFloat(rotationAngle) || 0}deg)
            rotateX(${parseFloat(rotationXAngle) || 0}deg)
            rotateY(${parseFloat(rotationYAngle) || 0}deg)
            translate(${parseFloat(translationX) || 0}px, ${parseFloat(translationY) || 0}px)
            skew(${parseFloat(skewXAngle) || 0}deg, ${parseFloat(skewYAngle) || 0}deg)
        `.replace(/\s+/g, ' ').trim(); // Clean up whitespace for CSS.

        // Construct the transition string.
        const transitionProperty = `all ${actualDuration}s ease-in-out`;

        // Apply styles to each element.
        this._processSelectedNodes(animatedNode => {
            // Apply vendor prefixes for broader compatibility
            animatedNode.style.cssText = `
                -webkit-transition: ${transitionProperty};
                -moz-transition: ${transitionProperty};
                -ms-transition: ${transitionProperty};
                -o-transition: ${transitionProperty};
                transition: ${transitionProperty};

                -webkit-transform: ${transformString};
                -moz-transform: ${transformString};
                -ms-transform: ${transformString};
                -o-transform: ${transformString};
                transform: ${transformString};
            `;
        });
        return this; // Enable chaining
    },

    /**
     * Attaches an event listener to all selected elements.
     * @param {string} eventName - The type of event to listen for (e.g., 'click', 'mouseover').
     * @param {Function} handlerFunction - The function to execute when the event occurs.
     * @param {object} [listenerOptions={ passive: true }] - Options for addEventListener (e.g., { capture: true, once: true }).
     * @returns {ElementManipulator} - Returns the instance for method chaining.
     */
    attachEventHandler(eventName, handlerFunction, listenerOptions = { passive: true }) {
        // Guard clauses for event name and handler function.
        if (typeof eventName !== 'string' || eventName.trim() === '') {
            console.warn("ElementManipulator: Invalid or empty event name provided. Skipping event attachment.");
            return this;
        }
        if (typeof handlerFunction !== 'function') {
            console.warn(`ElementManipulator: No valid handler function provided for event "${eventName}". Skipping event attachment.`);
            return this;
        }

        // Iterate and attach event listener.
        this._processSelectedNodes(eventTarget => {
            eventTarget.addEventListener(eventName, handlerFunction, listenerOptions);
        });
        return this; // Enable chaining
    },

    /**
     * Gets the first element from the current selection.
     * This method breaks the chain and returns a single DOM element or null.
     * @returns {HTMLElement|null} - The first selected DOM element, or null if none are selected.
     */
    getFirst() {
        return this.activeElements.length > 0 ? this.activeElements[0] : null;
    },

    /**
     * Provides the number of elements currently selected.
     * This is a getter property.
     * @returns {number} - The count of elements in 'activeElements'.
     */
    get count() {
        return this.activeElements.length;
    },

    /**
     * Executes a callback function once the DOM content is fully loaded.
     * This is a utility method and does not operate on the 'activeElements'.
     * @param {Function} domReadyCallback - The function to execute.
     * @returns {ElementManipulator} - Returns the instance for method chaining (if needed elsewhere).
     */
    onDomReady(domReadyCallback) {
        if (typeof domReadyCallback === 'function') {
            if (document.readyState === 'loading') { // Loading still in progress
                document.addEventListener('DOMContentLoaded', domReadyCallback);
            } else { // DOM is already loaded
                domReadyCallback();
            }
        } else {
            console.warn("ElementManipulator: onDomReady requires a valid callback function.");
        }
        return this;
    }
};