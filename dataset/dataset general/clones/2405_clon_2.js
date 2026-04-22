const domUtil = {

    /*
     * This method is responsible for selecting DOM elements based on a provided CSS query
     * and storing them internally for subsequent manipulations.
     * @param {string} cssQuery - The standard CSS selector string (e.g., ".my-class", "#my-id", "div").
     * @returns {object} Returns the utility object itself to allow for method chaining.
     */
    grabElements: function(cssQuery) {
        // Convert the NodeList returned by querySelectorAll into a true Array.
        this.targetElements = Array.from(document.querySelectorAll(cssQuery));
        return this; // Enable fluent interface by returning 'this'.
    },

    /*
     * A convenient alias for Array.prototype.forEach, used for iterating over the
     * collection of selected DOM nodes.
     */
    iterateNodes: Array.prototype.forEach,


    /*
     * Applies a given CSS style string directly to the 'style.cssText' property
     * of all elements currently held in 'targetElements'.
     * @param {string} styleString - A string containing CSS declarations (e.g., "color: blue; font-size: 14px;").
     * @returns {object} Returns the utility object for continued method chaining.
     */
    applyStyles: function(styleString) {
        // The result of forEach is undefined, so this effectively clears targetElements after operation.
        this.targetElements = this.iterateNodes.call(this.targetElements, function(currentElement) {
            currentElement.style.cssText = styleString;
        });
        return this; // Facilitates further operations on the (now potentially empty) collection.
    },


    /*
     * Sets a specific attribute and its corresponding value on every element
     * within the internal collection of 'targetElements'.
     * @param {string} attributeName - The name of the HTML attribute to be set (e.g., "data-id", "class").
     * @param {string} attributeValue - The value to assign to the specified attribute.
     * @returns {object} Returns the utility object to maintain chainability.
     */
    modifyAttribute: function(attributeName, attributeValue) {
        // Iterates through elements, setting the attribute. The return value of forEach is undefined.
        this.targetElements = this.iterateNodes.call(this.targetElements, function(nodeItem) {
            nodeItem.setAttribute(attributeName, attributeValue);
        });
        return this; // Allows for subsequent method calls.
    },


    /*
     * Initiates a complex CSS transform animation on all selected DOM nodes.
     * This method constructs a CSS string that includes transition and various transform properties.
     * @param {number} durationSeconds - The total duration of the animation in seconds.
     * @param {number} scaleFactor - The multiplier for scaling the element (e.g., 1.2 for 20% larger).
     * @param {number} rotateDegrees - Rotation around the Z-axis in degrees.
     * @param {number} rotateXDegrees - Rotation around the X-axis in degrees.
     * @param {number} rotateYDegrees - Rotation around the Y-axis in degrees.
     * @param {number} translateXPixels - Horizontal translation in pixels.
     * @param {number} translateYPixels - Vertical translation in pixels.
     * @param {number} skewXDegrees - Horizontal skew transformation in degrees.
     * @param {number} skewYDegrees - Vertical skew transformation in degrees.
     * @returns {object} Returns the utility object for continued method chaining.
     */
    applyAnimationTransform: function(durationSeconds, scaleFactor, rotateDegrees, rotateXDegrees, rotateYDegrees, translateXPixels, translateYPixels, skewXDegrees, skewYDegrees) {
        // Similar to other methods, forEach returns undefined.
        this.targetElements = Array.prototype.forEach.call(this.targetElements, function(targetNode) {
            targetNode.style.cssText =
                '-webkit-transition: all ' + durationSeconds + 's ease-in-out;' +
                ' -webkit-transform: scale(' + scaleFactor + ')' +
                ' rotate(' + rotateDegrees + 'deg)' +
                ' rotateX(' + rotateXDegrees + 'deg)' +
                ' rotateY(' + rotateYDegrees + 'deg)' +
                ' translate(' + translateXPixels + 'px, ' + translateYPixels + 'px)' +
                ' skew(' + skewXDegrees + 'deg, ' + skewYDegrees + 'deg)';
        });
        return this; // Ensures the object remains chainable.
    },


    /*
     * Attaches an event listener to a specific event type for every element in the
     * currently selected collection.
     * @param {string} eventType - The name of the event to listen for (e.g., "click", "mouseenter", "submit").
     * @param {function} handlerFunction - The callback function to be executed when the event fires.
     * @returns {object} Returns the utility object to support method chaining.
     */
    attachEventHandler: function(eventType, handlerFunction) {
        // Adds the event listener; forEach's return value is undefined.
        this.targetElements = this.iterateNodes.call(this.targetElements, function(boundElement) {
            boundElement.addEventListener(eventType, handlerFunction, false);
        });
        return this; // Allows for further operations.
    }

};