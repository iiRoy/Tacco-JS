(function(DomInterface) {
    //
    // Keyboard Event Management Utility - Version Alpha 1.0
    //
    // This module provides a flexible mechanism for binding keyboard shortcuts
    // to handler functions using the underlying DOM event system.
    //
    // Original concept derived from various community contributions,
    // including early jQuery Hotkeys implementations.
    //
    // Dual licensed under permissible open source terms.
    //

    // Central registry for keyboard utilities
    if (!DomInterface.keyboard) {
        DomInterface.keyboard = {};
    }

    DomInterface.keyboard.config = {
        moduleVersion: "1.0.alpha", // Current version of this keyboard utility

        // Mapping of numeric key codes to their common string representations for special keys.
        // These are keys that typically don't produce a visible character.
        specialKeyCodes: {
            8: "backspace", 9: "tab", 13: "enter", 16: "shift", 17: "ctrl", 18: "alt", 19: "pause",
            20: "capslock", 27: "escape", 32: "space", 33: "pageup", 34: "pagedown", 35: "end", 36: "home",
            37: "arrowleft", 38: "arrowup", 39: "arrowright", 40: "arrowdown", 45: "insert", 46: "delete",
            96: "numpad0", 97: "numpad1", 98: "numpad2", 99: "numpad3", 100: "numpad4", 101: "numpad5", 102: "numpad6", 103: "numpad7",
            104: "numpad8", 105: "numpad9", 106: "numpadmultiply", 107: "numpadadd", 109: "numpadsubtract", 110: "numpaddecimal", 111: "numpaddivide",
            112: "f1", 113: "f2", 114: "f3", 115: "f4", 116: "f5", 117: "f6", 118: "f7", 119: "f8",
            120: "f9", 121: "f10", 122: "f11", 123: "f12", 144: "numlock", 145: "scrolllock", 188: "comma", 190: "period",
            191: "slash", 224: "meta" // 'meta' typically refers to the Windows/Command key
        },

        // Mapping of unshifted character keys to their shifted counterparts.
        // Used to recognize 'Shift+key' combinations.
        shiftedCharMap: {
            "`": "~", "1": "!", "2": "@", "3": "#", "4": "$", "5": "%", "6": "^", "7": "&",
            "8": "*", "9": "(", "0": ")", "-": "_", "=": "+", ";": ": ", "'": "\"", ",": "<",
            ".": ">", "/": "?", "\\": "|"
        }
    };

    /**
     * Determines if the given DOM element is an input-like field where
     * keyboard events should typically not trigger global shortcuts.
     * @param {HTMLElement} element The target element of the keyboard event.
     * @returns {boolean} True if the element is a text-accepting input, false otherwise.
     */
    function isInputTargetElement(element) {
        if (!element || typeof element.nodeName !== 'string') {
            return false;
        }
        const nodeNameLower = element.nodeName.toLowerCase();
        const isTextInput = nodeNameLower === "textarea" || nodeNameLower === "select" || element.type === "text";
        const isContentEditable = element.getAttribute('contenteditable') === 'true';
        return isTextInput || isContentEditable;
    }

    /**
     * The core handler logic for special event registration.
     * This function wraps the original event handler to implement key combination detection.
     * @param {object} listenerConfig The configuration object for the event listener (from jQuery's event system).
     */
    function processInputListener(listenerConfig) {
        // Ensure listenerConfig and its handler are valid
        if (!listenerConfig || typeof listenerConfig.handler !== 'function') {
            // Log an error or throw an exception if validation is strict, otherwise silently return.
            // For now, we'll just return.
            return;
        }

        const originalUserHandler = listenerConfig.handler;

        // Parse the namespace to extract key combinations.
        // Namespaces are expected to be space-separated, and each can contain dot-separated keys.
        let rawKeyBindings = (listenerConfig.namespace || "").toLowerCase().split(" ");
        let effectiveKeyCombos = DomInterface.map(rawKeyBindings, function(bindingPart) {
            // Filter out empty strings from splitting and then split by dot.
            return bindingPart.split(".");
        }).filter(keyArr => keyArr.length > 0 && keyArr[0] !== ""); // Ensure we don't end up with empty arrays or empty strings.

        // If no specific key combinations are provided in the namespace,
        // there's no need to wrap the handler for key combo detection.
        // This also acts as a simplified guard compared to the original's jQuery UI specific checks.
        if (effectiveKeyCombos.length === 0) {
            return; // No key bindings specified, so no special processing needed.
        }

        // Replace the original handler with our wrapped version.
        listenerConfig.handler = function(keyboardEvent) {
            // Pre-validation: Skip if the event is a synthetic event without a meaningful key.
            if (typeof keyboardEvent.which === 'undefined' || keyboardEvent.which === 0) {
                return;
            }

            // Guard against triggering shortcuts in text input elements unless explicitly bound to them.
            // 'this' refers to the element the event is bound to.
            const eventTarget = keyboardEvent.target;
            if (this !== eventTarget && isInputTargetElement(eventTarget)) {
                return;
            }

            // Determine if the pressed key is a 'special' (non-character) key.
            const specialKeyName = keyboardEvent.type !== "keypress" ? DomInterface.keyboard.config.specialKeyCodes[keyboardEvent.which] : null;
            const pressedCharLower = (specialKeyName === null && keyboardEvent.which) ?
                                     String.fromCharCode(keyboardEvent.which).toLowerCase() :
                                     null;

            // Build a prefix representing the active modifier keys (alt, ctrl, meta, shift).
            let activeModifierPrefix = "";
            if (keyboardEvent.altKey && specialKeyName !== "alt") {
                activeModifierPrefix += "alt_";
            }
            if (keyboardEvent.ctrlKey && specialKeyName !== "ctrl") {
                activeModifierPrefix += "ctrl_";
            }
            // Note: `metaKey` often refers to the Command key on Mac or Windows key on PC.
            // The `!keyboardEvent.ctrlKey` part aims to prevent redundant `meta_` when `ctrl_` is already present,
            // as some browsers might fire both for the same physical key press.
            if (keyboardEvent.metaKey && !keyboardEvent.ctrlKey && specialKeyName !== "meta") {
                activeModifierPrefix += "meta_";
            }
            if (keyboardEvent.shiftKey && specialKeyName !== "shift") {
                activeModifierPrefix += "shift_";
            }

            // Collect all possible key combinations that match the current event.
            // This includes direct key presses, and their shifted alternatives.
            const matchedKeyVariations = {};

            if (specialKeyName) {
                // If it's a special key, only consider its direct combination with modifiers.
                matchedKeyVariations[activeModifierPrefix + specialKeyName] = true;
            } else if (pressedCharLower) {
                // If it's a character key, consider its direct combination...
                matchedKeyVariations[activeModifierPrefix + pressedCharLower] = true;

                // ...and also its shifted alternative (e.g., 'Shift+a' often results in 'A',
                // but we also want to match 'Shift+A' explicitly if defined).
                const shiftedAlternative = DomInterface.keyboard.config.shiftedCharMap[pressedCharLower];
                if (shiftedAlternative) {
                    matchedKeyVariations[activeModifierPrefix + shiftedAlternative] = true;
                }

                // Special case for 'Shift' modifier: if only 'Shift' is active, and the key has a shifted form,
                // also allow matching the *unshifted* form of the shifted character.
                // E.g., 'Shift+4' (which produces '$') should also match a binding for just '$'.
                if (activeModifierPrefix === "shift_" && shiftedAlternative) {
                    matchedKeyVariations[shiftedAlternative] = true;
                }
            } else {
                // No recognized key, exit early.
                return;
            }

            // Iterate through the registered key combinations to find a match.
            // If any of the possible variations match a registered binding, execute the original handler.
            for (let idx = 0; idx < effectiveKeyCombos.length; idx++) {
                const registeredCombo = effectiveKeyCombos[idx].join("."); // Reconstruct the full combo string.
                if (matchedKeyVariations[registeredCombo]) {
                    // Found a match! Execute the original user-defined handler.
                    // 'this' and 'arguments' are passed through from the original event context.
                    return originalUserHandler.apply(this, arguments);
                }
            }
        };
    }

    // Register our custom key event processing for standard keyboard events.
    // This hooks into jQuery's special event system.
    const standardKeyEvents = ["keydown", "keyup", "keypress"];
    DomInterface.each(standardKeyEvents, function() {
        // 'this' refers to the current event type string (e.g., "keydown")
        DomInterface.event.special[this] = { attach: processInputListener };
    });

})(jQuery); // Assuming 'jQuery' is the global alias for DomInterface in this context.