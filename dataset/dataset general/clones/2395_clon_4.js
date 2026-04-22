(function( globalScope ) {

    // Prevent duplicate loading of this utility set
    globalScope.GlobalToolkit = globalScope.GlobalToolkit || {};
    if (globalScope.GlobalToolkit.isInitialized) {
        return;
    }
    globalScope.GlobalToolkit.isInitialized = true;

    // --- Part 1: Clone for jQuery UI's $.ui.keyCode ---
    // Original: A plain object with key-to-code mappings.
    // Strategy: Use a Map for internal construction, then convert to a frozen object
    // with distinct, descriptive identifiers.
    const SYSTEM_KEY_REFERENCE = (() => {
        const keyboardEventCodes = new Map();
        keyboardEventCodes.set('KEY_MOD_ALT', 18); // ALT
        keyboardEventCodes.set('KEY_BACKSPACE_ACTION', 8); // BACKSPACE
        keyboardEventCodes.set('KEY_CAPS_TOGGLE', 20); // CAPS_LOCK
        keyboardEventCodes.set('KEY_PUNCT_COMMA', 188); // COMMA
        keyboardEventCodes.set('KEY_CMD_LEFT', 91); // COMMAND, COMMAND_LEFT, WINDOWS
        keyboardEventCodes.set('KEY_CMD_RIGHT', 93); // COMMAND_RIGHT, MENU
        keyboardEventCodes.set('KEY_MOD_CONTROL', 17); // CONTROL
        keyboardEventCodes.set('KEY_DELETE_CHAR', 46); // DELETE
        keyboardEventCodes.set('KEY_ARROW_DOWN', 40); // DOWN
        keyboardEventCodes.set('KEY_END_LINE', 35); // END
        keyboardEventCodes.set('KEY_RETURN_PRESS', 13); // ENTER
        keyboardEventCodes.set('KEY_ESCAPE_OUT', 27); // ESCAPE
        keyboardEventCodes.set('KEY_HOME_POS', 36); // HOME
        keyboardEventCodes.set('KEY_INSERT_MODE', 45); // INSERT
        keyboardEventCodes.set('KEY_ARROW_LEFT', 37); // LEFT
        keyboardEventCodes.set('KEY_NUMPAD_ADD', 107); // NUMPAD_ADD
        keyboardEventCodes.set('KEY_NUMPAD_DECIMAL', 110); // NUMPAD_DECIMAL
        keyboardEventCodes.set('KEY_NUMPAD_DIVIDE', 111); // NUMPAD_DIVIDE
        keyboardEventCodes.set('KEY_NUMPAD_ENTER', 108); // NUMPAD_ENTER
        keyboardEventCodes.set('KEY_NUMPAD_MULTIPLY', 106); // NUMPAD_MULTIPLY
        keyboardEventCodes.set('KEY_NUMPAD_SUBTRACT', 109); // NUMPAD_SUBTRACT
        keyboardEventCodes.set('KEY_PAGE_DOWN_NAV', 34); // PAGE_DOWN
        keyboardEventCodes.set('KEY_PAGE_UP_NAV', 33); // PAGE_UP
        keyboardEventCodes.set('KEY_PUNCT_PERIOD', 190); // PERIOD
        keyboardEventCodes.set('KEY_ARROW_RIGHT', 39); // RIGHT
        keyboardEventCodes.set('KEY_MOD_SHIFT', 16); // SHIFT
        keyboardEventCodes.set('KEY_SPACEBAR', 32); // SPACE
        keyboardEventCodes.set('KEY_TAB_INDENT', 9); // TAB
        keyboardEventCodes.set('KEY_ARROW_UP', 38); // UP
        return Object.freeze(Object.fromEntries(keyboardEventCodes));
    })();

    // --- Part 2: Clone for jQuery UI's $.fn.zIndex ---
    // Original: A jQuery plugin method that inspects or modifies an element's z-index.
    // Strategy: A standalone utility function that operates on native DOM elements,
    // handling single elements or collections. It uses native DOM APIs and distinct naming.

    const elementLayerManager = {
        // Private method to determine the effective z-index of an element by traversing its ancestors.
        _evaluateVisualDepth: function(targetNode) {
            if (!targetNode || targetNode.nodeType !== Node.ELEMENT_NODE) {
                return 0;
            }

            let currentDomElement = targetNode;
            let currentComputedZIndex;
            let parsedNumericalDepth;

            // Iteratively ascend the DOM tree using native parentElement property.
            while (currentDomElement && currentDomElement !== document.body && currentDomElement !== document.documentElement) {
                const elementStyleSnapshot = window.getComputedStyle(currentDomElement);
                const elementLayoutPosition = elementStyleSnapshot.position;

                // Only elements with specific positioning schemes contribute to z-index stacking context.
                if (elementLayoutPosition === 'absolute' || elementLayoutPosition === 'relative' || elementLayoutPosition === 'fixed') {
                    currentComputedZIndex = elementStyleSnapshot.zIndex;
                    parsedNumericalDepth = Number.parseInt(currentComputedZIndex, 10);

                    // If a valid, non-zero z-index is found, that's the effective depth.
                    if (!Number.isNaN(parsedNumericalDepth) && parsedNumericalDepth !== 0) {
                        return parsedNumericalDepth;
                    }
                }
                currentDomElement = currentDomElement.parentElement; // Move to the direct parent.
            }
            return 0; // If no contributing z-index is found up the hierarchy.
        },

        // Private method to directly apply a z-index value to an element.
        _applyVisualDepth: function(targetNode, depthValue) {
            if (!targetNode || targetNode.nodeType !== Node.ELEMENT_NODE) {
                return;
            }
            targetNode.style.zIndex = depthValue;
        }
    };

    // Public API function mimicking the jQuery plugin's dual getter/setter behavior.
    function manageElementStacking(domEntities, depthSpecification) {
        // Normalize input to an array of DOM elements for consistent processing.
        const elementsForOperation = (domEntities instanceof NodeList || Array.isArray(domEntities))
            ? Array.from(domEntities)
            : [domEntities];

        if (depthSpecification !== undefined) {
            // Setter mode: Apply the specified depth to all elements in the collection.
            elementsForOperation.forEach(entity => {
                elementLayerManager._applyVisualDepth(entity, depthSpecification);
            });
            return elementsForOperation; // Return the processed collection for potential chaining.
        } else {
            // Getter mode: Retrieve the visual depth for the first element in the collection.
            if (elementsForOperation.length > 0) {
                return elementLayerManager._evaluateVisualDepth(elementsForOperation[0]);
            }
            return 0; // If no elements are provided, default to a depth of 0.
        }
    }

    // --- Expose the cloned functionalities on a new global object ---
    // This new object serves as the equivalent of '$.ui' for this clone.
    globalScope.GlobalToolkit.versionIdentifier = "2.0.1-beta"; // A different version string.
    globalScope.GlobalToolkit.KeyboardCodes = SYSTEM_KEY_REFERENCE;
    globalScope.GlobalToolkit.controlElementDepth = manageElementStacking;

})( typeof window !== 'undefined' ? window : this );