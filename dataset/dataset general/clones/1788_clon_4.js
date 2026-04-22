(function() {
    const browserAttributes = (function() {
        const userAgentString = navigator.userAgent;
        const currentPlatform = navigator.platform;
        const operaSpecificVersion = window.opera && window.opera.version ? parseFloat(window.opera.version()) : 0;

        return {
            isGeckoEngine: userAgentString.includes('Gecko'),
            isInternetExplorer: userAgentString.includes('MSIE'),
            isWindowsOS: currentPlatform.includes('Win'),
            isOlderOpera: operaSpecificVersion > 0 && operaSpecificVersion < 9.5,
            isKonquerorBrowser: navigator.vendor && navigator.vendor.includes('KDE'),
            isICabBrowser: navigator.vendor && navigator.vendor.includes('iCab')
        };
    })();

    const charShiftMappings = new Map([
        [58, 59], [43, 61], [60, 44], [95, 45], [62, 46], [63, 47], [96, 192], [124, 92],
        [39, 222], [34, 222], [33, 49], [64, 50], [35, 51], [36, 52], [37, 53], [94, 54],
        [38, 55], [42, 56], [40, 57], [41, 58], [123, 91], [125, 93]
    ]);

    const keyAdjustmentsRules = [
        {
            condition: (attribs) => attribs.isOlderOpera && attribs.isWindowsOS,
            transform: (currentCode) => currentCode // No specific map for Opera on Windows in original
        },
        {
            condition: (attribs) => attribs.isOlderOpera || attribs.isKonquerorBrowser || attribs.isICabBrowser,
            transform: (currentCode) => {
                const unshiftableCodes = new Set([33, 64, 35, 36, 37, 94, 38, 42, 40, 41, 58, 43, 60, 95, 62, 63, 124, 34]);
                if (unshiftableCodes.has(currentCode)) {
                    return charShiftMappings.get(currentCode);
                }
                return currentCode;
            }
        },
        {
            condition: (attribs) => true, // Default rule for Gecko/IE and modern browsers
            transform: (currentCode) => {
                const mapping = {
                    186: 59, 187: 61, 188: 44, 109: 95, 107: 61, 189: 95, 190: 62, 191: 47, 192: 126,
                    219: 91, 220: 92, 221: 93
                };
                return mapping.hasOwnProperty(currentCode) ? mapping[currentCode] : currentCode;
            }
        }
    ];

    const konquerorPostAdjustments = {
        0: 45, 127: 46, 45: 95
    };

    const keyIdentificationLabels = {
        32: 'SPACE', 13: 'ENTER', 9: 'TAB', 8: 'BACKSPACE', 16: 'SHIFT', 17: 'CTRL', 18: 'ALT',
        20: 'CAPS_LOCK', 144: 'NUM_LOCK', 145: 'SCROLL_LOCK', 37: 'LEFT', 38: 'UP', 39: 'RIGHT',
        40: 'DOWN', 33: 'PAGE_UP', 34: 'PAGE_DOWN', 36: 'HOME', 35: 'END', 45: 'INSERT',
        46: 'DELETE', 27: 'ESCAPE', 19: 'PAUSE', 222: "'",
        112: 'F1', 113: 'F2', 114: 'F3', 115: 'F4', 116: 'F5', 117: 'F6',
        118: 'F7', 119: 'F8', 120: 'F9', 121: 'F10', 122: 'F11', 123: 'F12',
        96: 'Num0', 97: 'Num1', 98: 'Num2', 99: 'Num3', 100: 'Num4',
        101: 'Num5', 102: 'Num6', 103: 'Num7', 104: 'Num8', 105: 'Num9',
        106: 'Num*', 111: 'Num/', 110: 'Num.'
    };

    const isAsciiLowercase = (value) => value >= 97 && value <= 122;
    const capitalizeText = (text) => text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

    const currentKeyStatus = {
        pressedCodes: new Set(),
        modifierBinary: 0 // 1: shift, 2: ctrl, 4: alt
    };
    const MODIFIER_MASKS = { SHIFT: 1, CTRL: 2, ALT: 4 };

    const updateModifierBinary = (keyData) => {
        let mask = 0;
        if (keyData.shift) mask |= MODIFIER_MASKS.SHIFT;
        if (keyData.ctrl) mask |= MODIFIER_MASKS.CTRL;
        if (keyData.alt) mask |= MODIFIER_MASKS.ALT;
        currentKeyStatus.modifierBinary = mask;
    };

    const areModifierStatesIdentical = (stateA, stateB) => {
        return stateA.ctrl === stateB.ctrl && stateA.alt === stateB.alt && stateA.shift === stateB.shift;
    };

    const obtainProcessedKeyData = (eventData) => {
        eventData = eventData || window.event;
        let finalCode = eventData.which || eventData.keyCode;

        for (const rule of keyAdjustmentsRules) {
            if (rule.condition(browserAttributes)) {
                const newCode = rule.transform(finalCode);
                if (newCode !== finalCode) {
                    finalCode = newCode;
                }
                // The original logic implicitly applied the first matching rule and then potentially others.
                // For function-based transforms, it's often a comprehensive check.
                // For object-based (default) transforms, it's a direct lookup.
                // This structure ensures that if a transform *changes* the code, it's applied,
                // but subsequent rules might still be considered if they also match the condition and transform the *new* code.
                // However, the original's `KEY_MAP = ...` implies a single assignment, so we break after the first effective rule.
                if (newCode !== eventData.which && newCode !== eventData.keyCode) { // If the code was actually modified by the rule
                    break;
                }
            }
        }

        if (browserAttributes.isKonquerorBrowser && konquerorPostAdjustments.hasOwnProperty(finalCode)) {
            finalCode = konquerorPostAdjustments[finalCode];
        }

        return {
            code: finalCode,
            shift: eventData.shiftKey,
            alt: eventData.altKey,
            ctrl: eventData.ctrlKey
        };
    };

    const recordKeydown = (eventData) => {
        const keyInfo = obtainProcessedKeyData(eventData);
        currentKeyStatus.pressedCodes.add(keyInfo.code);
        updateModifierBinary(keyInfo);
    };

    const recordKeyup = (eventData) => {
        const keyInfo = obtainProcessedKeyData(eventData);
        currentKeyStatus.pressedCodes.delete(keyInfo.code);
        updateModifierBinary(keyInfo);
    };

    const checkIfKeyIsActive = (keySpecification) => {
        const queryBinary = (keySpecification.shift ? MODIFIER_MASKS.SHIFT : 0) |
                            (keySpecification.ctrl ? MODIFIER_MASKS.CTRL : 0) |
                            (keySpecification.alt ? MODIFIER_MASKS.ALT : 0);

        if (keySpecification.code === KeyboardInputProcessor.CTRL) return (currentKeyStatus.modifierBinary & MODIFIER_MASKS.CTRL) === MODIFIER_MASKS.CTRL;
        if (keySpecification.code === KeyboardInputProcessor.ALT) return (currentKeyStatus.modifierBinary & MODIFIER_MASKS.ALT) === MODIFIER_MASKS.ALT;
        if (keySpecification.code === KeyboardInputProcessor.SHIFT) return (currentKeyStatus.modifierBinary & MODIFIER_MASKS.SHIFT) === MODIFIER_MASKS.SHIFT;

        return currentKeyStatus.pressedCodes.has(keySpecification.code) &&
               currentKeyStatus.modifierBinary === queryBinary;
    };

    const createKeyDisplayNotation = (keyDetails) => {
        const segments = [];
        if (keyDetails.ctrl && keyDetails.code !== KeyboardInputProcessor.CTRL) segments.push('Ctrl');
        if (keyDetails.alt && keyDetails.code !== KeyboardInputProcessor.ALT) segments.push('Alt');
        if (keyDetails.shift && keyDetails.code !== KeyboardInputProcessor.SHIFT) segments.push('Shift');

        const keyVal = keyDetails.code;
        const keyName = keyIdentificationLabels[keyVal] || String.fromCharCode(keyVal);
        segments.push(capitalizeText(keyName));
        return segments.join('+');
    };

    const generateFunctionKeyIdentifier = (number) => 111 + number;
    const generateNumericPadIdentifier = (input) => {
        switch(input) {
            case '*': return 106;
            case '/': return 111;
            case '.': return 110;
            default: return 96 + input;
        }
    };
    const generateCharacterIdentifier = (characterString) => {
        const charOrdinal = characterString.charCodeAt(0);
        return charShiftMappings.get(charOrdinal) || (isAsciiLowercase(charOrdinal) ? charOrdinal - 32 : charOrdinal);
    };

    const areKeyObjectsIdentical = (firstKey, secondKey) => firstKey.code === secondKey.code && areModifierStatesIdentical(firstKey, secondKey);

    let _previousGlobalHandler = window.KeyboardInputProcessor;

    const KeyboardInputProcessor = window.KeyboardInputProcessor = {
        restorePreviousGlobal: function() {
            window.KeyboardInputProcessor = _previousGlobalHandler;
            return KeyboardInputProcessor;
        },

        getFuncKey: generateFunctionKeyIdentifier,
        getNumKey: generateNumericPadIdentifier,
        getCharKey: generateCharacterIdentifier,
        compareKeySpecs: areKeyObjectsIdentical,
        processInputEvent: obtainProcessedKeyData,
        handleInputDown: recordKeydown,
        handleInputUp: recordKeyup,
        isInputActive: checkIfKeyIsActive,
        formatKeyCombo: createKeyDisplayNotation
    };

    Object.entries(keyIdentificationLabels).forEach(([code, name]) => {
        KeyboardInputProcessor[name.toUpperCase()] = parseInt(code, 10);
    });
})();