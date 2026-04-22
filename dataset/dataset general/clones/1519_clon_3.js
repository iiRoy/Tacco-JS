(function ($) {
    // Internal registry for all active keyboard shortcut listeners.
    // Maps a DOM element to a Map of event types, which then maps a combination string
    // to a registered handler's details.
    // Structure: Map<HTMLElement, Map<string, Map<string, { callback: Function, propagate: boolean }>>>
    const _activeKeyListeners = new Map();

    // Map of key codes to their standard names for special keys.
    const _keyCodeToNameMap = {
        27: 'esc', 9: 'tab', 32: 'space', 13: 'return', 8: 'backspace', 145: 'scroll', 20: 'capslock',
        144: 'numlock', 19: 'pause', 45: 'insert', 36: 'home', 46: 'del', 35: 'end', 33: 'pageup',
        34: 'pagedown', 37: 'left', 38: 'up', 39: 'right', 40: 'down', 112: 'f1', 113: 'f2', 114: 'f3',
        115: 'f4', 116: 'f5', 117: 'f6', 118: 'f7', 119: 'f8', 120: 'f9', 121: 'f10', 122: 'f11', 123: 'f12'
    };

    // Map of non-shifted characters to their shifted counterparts.
    const _shiftedCharacters = {
        "`": "~", "1": "!", "2": "@", "3": "#", "4": "$", "5": "%", "6": "^", "7": "&",
        "8": "*", "9": "(", "0": ")", "-": "_", "=": "+", ";": ":", "'": "\"", ",": "<",
        ".": ">", "/": "?", "\\": "|"
    };

    // Default configuration options for a key combination handler.
    const _defaultHandlerSettings = {
        eventType: 'keydown',
        propagateEvent: false,
        disableInInputFields: false,
        targetElement: $('html')[0], // Default target is the entire document.
        checkParentElements: true // Traverse up the DOM tree to find a registered listener.
    };

    /**
     * Normalizes a given DOM event to extract the actual target element.
     * Handles cases where the target might be a text node.
     * @param {Event} domEvent - The original DOM event.
     * @returns {HTMLElement} The normalized target element.
     */
    const _getNormalizedEventTarget = (domEvent) => {
        let element = domEvent.target;
        return (element && element.nodeType === 3) ? element.parentNode : element;
    };

    /**
     * Checks if the given element is an input or textarea field.
     * @param {HTMLElement} element - The element to check.
     * @returns {boolean} True if the element is an input or textarea, false otherwise.
     */
    const _isInputOrTextarea = (element) => {
        if (!element || !element.tagName) return false;
        const tagName = element.tagName.toLowerCase();
        return tagName === "input" || tagName === "textarea";
    };

    /**
     * Determines the modifier key prefix for a given event (e.g., 'ctrl+alt+').
     * @param {Event} domEvent - The keyboard event.
     * @returns {string} The modifier prefix string.
     */
    const _getModifierPrefix = (domEvent) => {
        let prefix = '';
        if (domEvent.altKey) prefix += 'alt+';
        if (domEvent.ctrlKey) prefix += 'ctrl+';
        if (domEvent.shiftKey) prefix += 'shift+';
        return prefix;
    };

    /**
     * Looks up a handler in the registry based on modifier keys and the pressed key.
     * @param {Map<string, { callback: Function, propagate: boolean }>} comboRegistry - Registry for the specific target and event type.
     * @param {string} modifierPrefix - The computed modifier prefix.
     * @param {string} specialKeyName - The name of the special key (e.g., 'return', 'f1').
     * @param {string} pressedChar - The lowercase character pressed.
     * @returns {{ callback: Function, propagate: boolean } | null} The matched handler entry, or null if not found.
     */
    const _lookupHandlerEntry = (comboRegistry, modifierPrefix, specialKeyName, pressedChar) => {
        // Try with modifiers + special key
        if (specialKeyName && comboRegistry.has(modifierPrefix + specialKeyName)) {
            return comboRegistry.get(modifierPrefix + specialKeyName);
        }
        // Try with modifiers + character
        if (pressedChar && comboRegistry.has(modifierPrefix + pressedChar)) {
            return comboRegistry.get(modifierPrefix + pressedChar);
        }
        // Try with modifiers + shifted character (e.g., Ctrl+! instead of Ctrl+1)
        const shiftedChar = _shiftedCharacters[pressedChar];
        if (shiftedChar && comboRegistry.has(modifierPrefix + shiftedChar)) {
            return comboRegistry.get(modifierPrefix + shiftedChar);
        }
        return null;
    };

    /**
     * The core event dispatcher for keyboard events.
     * This function is attached to DOM elements and processes incoming key events
     * to find and execute registered shortcut handlers.
     * @param {Event} domEvent - The original DOM keyboard event.
     */
    const _handleKeyEventDispatch = function (domEvent) {
        // Normalize the event target and fix jQuery event properties.
        const event = $.event.fix(domEvent);
        let currentTargetElement = _getNormalizedEventTarget(event);

        // Retrieve the options that were active when this dispatcher was set up.
        // This 'this' context refers to the resolved options for the specific target and event type.
        const dispatcherSettings = this;

        // Optionally disable shortcuts if the target is an input or textarea.
        if (dispatcherSettings.disableInInputFields && _isInputOrTextarea(currentTargetElement)) {
            return; // Bypass shortcut handling for input fields.
        }

        // Key details extraction.
        const keyCode = event.which;
        const eventType = event.type;
        const pressedChar = String.fromCharCode(keyCode).toLowerCase();
        const specialKeyName = _keyCodeToNameMap[keyCode];

        // Traverse up the DOM tree if configured, to find a registered target.
        let registrationPoint = currentTargetElement;
        if (dispatcherSettings.checkParentElements) {
            while (registrationPoint && !_activeKeyListeners.has(registrationPoint)) {
                registrationPoint = registrationPoint.parentNode;
            }
            if (!registrationPoint) return; // No registered parent found.
        } else if (!_activeKeyListeners.has(registrationPoint)) {
            return; // No direct registration for this element.
        }

        const targetRegistry = _activeKeyListeners.get(registrationPoint);
        if (!targetRegistry || !targetRegistry.has(eventType)) {
            return; // No handlers for this event type on this target.
        }

        const comboRegistry = targetRegistry.get(eventType);
        const modifierPrefix = _getModifierPrefix(event);

        // Find a matching handler.
        const matchedHandlerEntry = (modifierPrefix === '')
            ? (comboRegistry.get(specialKeyName) || comboRegistry.get(pressedChar)) // No modifiers
            : _lookupHandlerEntry(comboRegistry, modifierPrefix, specialKeyName, pressedChar); // With modifiers

        if (matchedHandlerEntry) {
            // Execute the callback.
            matchedHandlerEntry.callback(event);

            // Prevent default behavior and stop propagation if specified.
            if (!matchedHandlerEntry.propagate) {
                event.stopPropagation();
                event.preventDefault();
            }
        }
    };

    // The public API object for keyboard utilities.
    const _keyboardUtilityAPI = {
        /**
         * Registers a new keyboard shortcut.
         * @param {string} comboString - The key combination string (e.g., 'ctrl+c', 'shift+f1').
         * @param {Object|Function} handlerOptions - Optional configuration object or the callback function.
         * @param {Function} [actionCallback] - The function to execute when the combination is pressed.
         * @returns {jQuery} The jQuery object for chaining.
         */
        registerCombination: function (comboString, handlerOptions, actionCallback) {
            // Handle optional `handlerOptions` argument.
            if (typeof handlerOptions === 'function') {
                actionCallback = handlerOptions;
                handlerOptions = {};
            }

            // Merge default settings with provided options.
            const resolvedOptions = Object.assign({}, _defaultHandlerSettings, handlerOptions);

            // Ensure the combination string is lowercase for consistent lookup.
            const normalizedCombo = comboString.toLowerCase();

            // Validate essential inputs.
            if (!actionCallback || typeof actionCallback !== 'function') {
                console.warn('Keyboard shortcut registration failed: actionCallback must be a function.');
                return $;
            }
            if (!resolvedOptions.targetElement) {
                console.warn('Keyboard shortcut registration failed: targetElement is invalid.');
                return $;
            }

            // Initialize registry for the target element if it doesn't exist.
            if (!_activeKeyListeners.has(resolvedOptions.targetElement)) {
                _activeKeyListeners.set(resolvedOptions.targetElement, new Map());
            }
            const targetEntry = _activeKeyListeners.get(resolvedOptions.targetElement);

            // Initialize registry for the event type on this target if it doesn't exist.
            if (!targetEntry.has(resolvedOptions.eventType)) {
                targetEntry.set(resolvedOptions.eventType, new Map());
                // Attach the event listener to the target element for this event type.
                // The 'this' context for _handleKeyEventDispatch will be the resolvedOptions.
                $.event.add(resolvedOptions.targetElement, resolvedOptions.eventType, _handleKeyEventDispatch.bind(resolvedOptions));
            }
            const comboRegistry = targetEntry.get(resolvedOptions.eventType);

            // Store the handler details.
            comboRegistry.set(normalizedCombo, {
                callback: actionCallback,
                propagate: resolvedOptions.propagateEvent
            });

            return $; // Return jQuery for chaining.
        },

        /**
         * Deregisters an existing keyboard shortcut.
         * @param {string} comboToRemove - The key combination string to remove.
         * @param {Object} [removalOptions] - Optional configuration object, mainly for target and eventType.
         * @returns {jQuery} The jQuery object for chaining.
         */
        deregisterCombination: function (comboToRemove, removalOptions) {
            const config = Object.assign({}, _defaultHandlerSettings, removalOptions);

            const targetElement = config.targetElement;
            const eventType = config.eventType;
            const normalizedCombo = comboToRemove.toLowerCase();

            // Check if the target element has any registered listeners.
            if (!_activeKeyListeners.has(targetElement)) {
                return $;
            }
            const targetEntry = _activeKeyListeners.get(targetElement);

            // Check if there are listeners for the specific event type.
            if (!targetEntry.has(eventType)) {
                return $;
            }
            const comboRegistry = targetEntry.get(eventType);

            // Delete the specific combination handler.
            if (comboRegistry.has(normalizedCombo)) {
                comboRegistry.delete(normalizedCombo);
            }

            // Clean up event listener if no more combos for this event type.
            if (comboRegistry.size === 0) {
                targetEntry.delete(eventType);
                $.event.remove(targetElement, eventType, _handleKeyEventDispatch);
            }

            // Clean up target entry if no more event types registered for it.
            if (targetEntry.size === 0) {
                _activeKeyListeners.delete(targetElement);
            }

            return $; // Return jQuery for chaining.
        }
    };

    // Expose the API under the jQuery namespace.
    $.keyboardUtilities = _keyboardUtilityAPI;

    return $; // Return jQuery object.

})(jQuery);