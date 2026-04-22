/**
 * A lightweight JavaScript utility for DOM manipulation, supporting method chaining.
 * This class encapsulates a single HTML element, providing convenient methods
 * to interact with its properties, styles, and children.
 */
function NodeProxy(nodeKind, initialProps) {
    // Validate the provided node kind to ensure it's a string, otherwise default to 'div'.
    const validatedNodeKind = typeof nodeKind === 'string' && nodeKind.trim() !== '' ? nodeKind : 'div';

    // The internal reference to the actual DOM element this proxy manages.
    this._nodeRef = document.createElement(validatedNodeKind);

    // If initial properties are supplied, apply them immediately.
    // We check for both existence and type to prevent errors with non-object inputs.
    if (initialProps && typeof initialProps === 'object' && !Array.isArray(initialProps)) {
        this.modifyAttributes(initialProps);
    }
}

/**
 * Appends a child element to the current node.
 * This method supports appending other NodeProxy instances, raw DOM elements,
 * and jQuery objects (if jQuery is available in the global scope).
 *
 * @param {NodeProxy|HTMLElement|SVGElement|jQuery|null|undefined} childItem The item to append.
 * @returns {NodeProxy} The current NodeProxy instance for chaining.
 */
NodeProxy.prototype.attachChild = function(childItem) {
    // Early exit if the child item is null or undefined, as it cannot be appended.
    if (childItem === null || typeof childItem === 'undefined') {
        // Optionally, one could throw an error or log a warning here.
        return this;
    }

    if (childItem instanceof NodeProxy) {
        // If it's another NodeProxy, extract its underlying DOM node.
        this._nodeRef.appendChild(childItem.extractNode());
    } else if (typeof jQuery !== 'undefined' && childItem instanceof jQuery) {
        // If jQuery is available and the item is a jQuery object.
        // Iterate over all elements within the jQuery object and append each one.
        if (childItem.length > 0) {
            const currentProxyInstance = this; // Capture 'this' for use within the callback.
            childItem.each(function(_idx, domElement) {
                if (domElement instanceof HTMLElement || domElement instanceof SVGElement) {
                    currentProxyInstance._nodeRef.appendChild(domElement);
                }
            });
        }
    } else if (childItem instanceof HTMLElement || childItem instanceof SVGElement || childItem instanceof Text) {
        // If it's a raw DOM element (HTMLElement, SVGElement, or Text node).
        this._nodeRef.appendChild(childItem);
    } else {
        // For any other type, attempt to convert it to a text node and append.
        // This handles cases like numbers, booleans, or plain strings.
        try {
            const textNode = document.createTextNode(String(childItem));
            this._nodeRef.appendChild(textNode);
        } catch (error) {
            console.warn("NodeProxy: Could not append item of unsupported type:", childItem, error);
        }
    }

    return this; // Enable method chaining.
};

/**
 * Applies CSS styles to the encapsulated element.
 * Accepts either a single property-value pair or an object of multiple properties.
 *
 * @param {string|object} styleDeclaration - A CSS property name (string) or an object of property-value pairs.
 * @param {string} [styleValue] - The value for the CSS property if `styleDeclaration` is a string.
 * @returns {NodeProxy} The current NodeProxy instance for chaining.
 */
NodeProxy.prototype.applyStyles = function(styleDeclaration, styleValue) {
    // If no style declaration is provided, there's nothing to do.
    if (!styleDeclaration) {
        return this;
    }

    if (typeof styleDeclaration === 'string') {
        // Handle single property assignment.
        if (typeof styleValue !== 'undefined' && styleDeclaration.trim() !== '') {
            this._nodeRef.style[styleDeclaration] = styleValue;
        }
    } else if (typeof styleDeclaration === 'object' && styleDeclaration !== null && !Array.isArray(styleDeclaration)) {
        // Handle multiple property assignments from an object.
        for (const propName in styleDeclaration) {
            // Ensure the property belongs directly to the object, not its prototype chain.
            if (Object.prototype.hasOwnProperty.call(styleDeclaration, propName)) {
                this._nodeRef.style[propName] = styleDeclaration[propName];
            }
        }
    }
    // No action for unsupported styleDeclaration types.

    return this; // Enable method chaining.
};

/**
 * Gets or sets the inner HTML content of the encapsulated element.
 * If `markupContent` is provided, it sets the HTML; otherwise, it returns the current HTML.
 *
 * @param {string|number|null|undefined} [markupContent] - The new HTML string or value to set.
 * @returns {NodeProxy|string} The current NodeProxy instance for chaining (if setting), or the inner HTML string (if getting).
 */
NodeProxy.prototype.updateMarkup = function(markupContent) {
    // If markupContent is undefined or null, we are in getter mode.
    if (markupContent === undefined || markupContent === null) {
        return this._nodeRef.innerHTML;
    } else {
        // Coerce the input to a string, ensuring numbers, booleans, etc., are handled.
        this._nodeRef.innerHTML = String(markupContent);
        return this; // Enable method chaining.
    }
};

/**
 * Modifies attributes of the encapsulated element.
 * Can set a single attribute or apply multiple attributes from an object.
 *
 * @param {string|object} attrKeyOrMap - A single attribute name (string) or an object mapping attribute names to values.
 * @param {string|number|boolean} [attrValue] - The value for the attribute if `attrKeyOrMap` is a string.
 * @returns {NodeProxy} The current NodeProxy instance for chaining.
 */
NodeProxy.prototype.modifyAttributes = function(attrKeyOrMap, attrValue) {
    // If no attribute key or map is provided, there's nothing to do.
    if (!attrKeyOrMap) {
        return this;
    }

    if (typeof attrKeyOrMap === 'string') {
        // Set a single attribute. Ensure value is converted to a string.
        if (typeof attrValue !== 'undefined' && attrKeyOrMap.trim() !== '') {
            this._nodeRef.setAttribute(attrKeyOrMap, String(attrValue));
        }
    } else if (typeof attrKeyOrMap === 'object' && attrKeyOrMap !== null && !Array.isArray(attrKeyOrMap)) {
        // Set multiple attributes from an object.
        for (const attributeName in attrKeyOrMap) {
            // Ensure the property belongs directly to the object.
            if (Object.prototype.hasOwnProperty.call(attrKeyOrMap, attributeName)) {
                this._nodeRef.setAttribute(attributeName, String(attrKeyOrMap[attributeName]));
            }
        }
    }
    // No action for unsupported attrKeyOrMap types.

    return this; // Enable method chaining.
};

/**
 * Retrieves the raw, underlying DOM element that this NodeProxy encapsulates.
 * This is useful for interacting with the element directly or passing it to other
 * DOM manipulation libraries.
 *
 * @returns {HTMLElement|SVGElement} The actual DOM element.
 */
NodeProxy.prototype.extractNode = function() {
    return this._nodeRef;
};