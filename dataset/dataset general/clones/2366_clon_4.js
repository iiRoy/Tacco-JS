const InputSense = (function() {
    const _keyCodesToNames = new Map([
        [8, "backspace"], [9, "tab"], [13, "enter"], [16, "shift"], [17, "ctrl"], [18, "alt"], [19, "pause"],
        [20, "capslock"], [27, "escape"], [32, "space"], [33, "pageup"], [34, "pagedown"], [35, "end"], [36, "home"],
        [37, "left"], [38, "up"], [39, "right"], [40, "down"], [45, "insert"], [46, "delete"],
        [96, "num0"], [97, "num1"], [98, "num2"], [99, "num3"], [100, "num4"], [101, "num5"], [102, "num6"], [103, "num7"],
        [104, "num8"], [105, "num9"], [106, "multiply"], [107, "add"], [109, "subtract"], [110, "decimal"], [111, "divide"],
        [112, "f1"], [113, "f2"], [114, "f3"], [115, "f4"], [116, "f5"], [117, "f6"], [118, "f7"], [119, "f8"],
        [120, "f9"], [121, "f10"], [122, "f11"], [123, "f12"], [144, "numlock"], [145, "scrolllock"], [188, "comma"], [190, "period"],
        [191, "slash"], [224, "meta"]
    ]);

    const _charToShiftedChar = new Map([
        ["`", "~"], ["1", "!"], ["2", "@"], ["3", "#"], ["4", "$"], ["5", "%"], ["6", "^"], ["7", "&"],
        ["8", "*"], ["9", "("], ["0", ")"], ["-", "_"], ["=", "+"], [";", ":"], ["'", "\""], [",", "<"],
        [".", ">"], ["/", "?"], ["\\", "|"]
    ]);

    const _keyAliases = new Map([
        ["return", "enter"],
        ["del", "delete"],
        ["esc", "escape"],
        ["cmd", "meta"]
    ]);

    const _modifierNames = new Set(["alt", "ctrl", "shift", "meta"]);

    const _actionRegistrations = []; // Stores objects { eventTypes: [], combo: "ctrl_a", handler: fn, context: obj, permitInInputs: bool }

    // Normalizes a key combination string like "ctrl+shift+a" to "ctrl_shift_a"
    function _processCombinationString(inputString) {
        const parts = inputString.toLowerCase().split("+");
        const modifiers = [];
        let primaryKey = "";

        for (const part of parts) {
            const aliasedPart = _keyAliases.get(part) || part;

            if (_modifierNames.has(aliasedPart)) {
                modifiers.push(aliasedPart);
            } else {
                primaryKey = aliasedPart;
            }
        }
        modifiers.sort(); // Ensure consistent modifier order (alt_ctrl_shift_...)
        return modifiers.concat(primaryKey).filter(Boolean).join("_");
    }

    // Determines all possible normalized key combinations from a given keyboard event
    function _determineEventCombinations(currentEvent) {
        const potentialMatches = new Set();
        let currentModifierPrefix = "";

        if (currentEvent.altKey && _keyCodesToNames.get(currentEvent.which) !== "alt") {
            currentModifierPrefix += "alt_";
        }
        if (currentEvent.ctrlKey && _keyCodesToNames.get(currentEvent.which) !== "ctrl") {
            currentModifierPrefix += "ctrl_";
        }
        // Original checks !event.ctrlKey for meta, replicating this behavior
        if (currentEvent.metaKey && !currentEvent.ctrlKey && _keyCodesToNames.get(currentEvent.which) !== "meta") {
            currentModifierPrefix += "meta_";
        }
        if (currentEvent.shiftKey && _keyCodesToNames.get(currentEvent.which) !== "shift") {
            currentModifierPrefix += "shift_";
        }

        const specialKeyIdentifier = currentEvent.type !== "keypress" && _keyCodesToNames.get(currentEvent.which);
        let charIdentifier = String.fromCharCode(currentEvent.which).toLowerCase();

        if (specialKeyIdentifier) {
            potentialMatches.add(currentModifierPrefix + specialKeyIdentifier);
        } else {
            // Add combination with the base character (e.g., "ctrl_a")
            potentialMatches.add(currentModifierPrefix + charIdentifier);

            // Add combination with shifted character if 'charIdentifier' has one (e.g., "ctrl_!" for Ctrl+Shift+1)
            const shiftedVersionOfChar = _charToShiftedChar.get(charIdentifier);
            if (shiftedVersionOfChar) {
                potentialMatches.add(currentModifierPrefix + shiftedVersionOfChar);
            }

            // Special case from original: if only shift is pressed, also match the shifted character without "shift_" prefix.
            // E.g., Shift+4 should match "$"
            if (currentModifierPrefix === "shift_") {
                const directShiftedChar = _charToShiftedChar.get(charIdentifier);
                if (directShiftedChar) {
                    potentialMatches.add(directShiftedChar);
                }
            }
        }
        return potentialMatches;
    }

    // The central event handler attached to the document
    function _globalKeyDispatcher(event) {
        const activeElement = document.activeElement;
        const tagName = activeElement ? activeElement.tagName.toLowerCase() : '';
        const isInputTarget = ['textarea', 'select'].includes(tagName) ||
                              (tagName === 'input' && activeElement.type === 'text') ||
                              (activeElement && activeElement.isContentEditable);

        const currentEventCombinations = _determineEventCombinations(event);

        for (const registration of _actionRegistrations) {
            // Filter out events in text-accepting inputs, unless explicitly permitted for this registration
            if (isInputTarget && !registration.permitInInputs) {
                continue;
            }

            // Check if the event type matches (keydown, keyup, keypress)
            if (!registration.eventTypes.includes(event.type)) {
                continue;
            }

            // Check if any of the event's possible combinations match the registered combo
            if (currentEventCombinations.has(registration.combo)) {
                registration.handler.apply(registration.context, [event]); // Pass event as the first argument
            }
        }
    }

    // Attach global listeners for keyboard events
    ['keydown', 'keyup', 'keypress'].forEach(eventType => {
        document.addEventListener(eventType, _globalKeyDispatcher, false);
    });

    const publicAPI = {
        // Registers a new key combination handler
        addKeyAction: function(eventTypes, comboString, actionFunction, options = {}) {
            const types = Array.isArray(eventTypes) ? eventTypes : [eventTypes];
            const processedCombo = _processCombinationString(comboString);

            _actionRegistrations.push({
                eventTypes: types,
                combo: processedCombo,
                handler: actionFunction,
                context: options.context || document, // Default context is document, mimicking jQuery's default for global binds
                permitInInputs: !!options.permitInInputs
            });
        },

        // Removes a key combination handler
        removeKeyAction: function(eventTypes, comboString, actionFunction) {
            const types = Array.isArray(eventTypes) ? eventTypes : [eventTypes];
            const processedCombo = _processCombinationString(comboString);

            for (let i = _actionRegistrations.length - 1; i >= 0; i--) {
                const registration = _actionRegistrations[i];
                if (registration.combo === processedCombo &&
                    registration.handler === actionFunction &&
                    types.every(type => registration.eventTypes.includes(type))) {
                    _actionRegistrations.splice(i, 1);
                }
            }
        }
    };

    return publicAPI;
})();