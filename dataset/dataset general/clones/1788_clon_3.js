(function() {
/*
 * Module: Keyboard Input Normalizer
 * Purpose: Provides a consistent interface for handling keyboard events
 *          across various web browsers. It primarily focuses on 'keydown'
 *          events, as 'keypress' behavior is inconsistent.
 *
 * Output Format:
 * This utility returns an object containing normalized key information:
 * { int keyCode, bool shiftActive, bool altActive, bool ctrlActive }.
 *
 * Key Normalization Principles:
 * 1. Alphabetic Keys: The ASCII value of the uppercase character.
 * 2. Common Keys: For keys with universal codes (modifiers, navigation, escape),
 *    the standard common keycode is used.
 * 3. Numpad Keys: Values derived from the 'getNumpadCodeFromInput' function
 *    (typically 96 + the number, or special codes for operators).
 * 4. Symbol Keys: The ASCII value of the character shown when Shift is NOT held.
 *    Special handling for certain symbols to avoid conflicts (e.g., '" => 222).
 *
 * Example Usage:
 * document.addEventListener('keydown', function(eventObj) {
 *    const processedKey = InputKeyMapper.parseKeyboardEvent(eventObj);
 *    // Utilize processedKey for application logic
 * });
 *
 * Naming Conventions:
 * - 'keyCode': Refers to an integer representing a key.
 * - 'keySpec': Denotes an object containing key and modifier details.
 * - 'eventObj': Represents a browser's raw DOM keyboard event.
 *
 * Additional Features:
 * This module also supports tracking currently pressed keys.
 * Attach 'onKeyPressDown' and 'onKeyPressUp' to your document's
 * 'keydown' and 'keyup' event listeners, respectively.
 * Then, use 'isKeyCurrentlyPressed' to query the state of any key.
 *
 * @fileoverview Keyboard Input Handling Utility
 * @author Jonathan Tang (Original Author)
 * @version 1.0 (Modified Version)
 * @license BSD-3-Clause
 */

/*
Original Copyright (c) 2008 Jonathan Tang
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions
are met:
1. Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.
3. The name of the author may not be used to endorse or promote products
   derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

const CONTROL_FLAGS = ['ctrl', 'alt', 'shift'];
let browserCodeAdjustments = {};
const SHIFT_CHAR_MAP = {
    58: 59,     // : -> ;
    43: 61,     // = -> +
    60: 44,     // < -> ,
    95: 45,     // _ -> -
    62: 46,     // > -> .
    63: 47,     // ? -> /
    96: 192,    // ` -> ~
    124: 92,    // | -> \
    39: 222,    // ' -> 222
    34: 222,    // " -> 222
    33: 49,     // ! -> 1
    64: 50,     // @ -> 2
    35: 51,     // # -> 3
    36: 52,     // $ -> 4
    37: 53,     // % -> 5
    94: 54,     // ^ -> 6
    38: 55,     // & -> 7
    42: 56,     // * -> 8
    40: 57,     // ( -> 9
    41: 58,     // ) -> 0
    123: 91,    // { -> [
    125: 93     // } -> ]
};

const isAsciiLowercase = (charVal) => {
    return charVal >= 97 && charVal <= 122;
};

const convertToTitleCase = (inputStr) => {
    if (typeof inputStr !== 'string' || inputStr.length === 0) {
        return ''; // Handle empty or invalid input gracefully
    }
    return inputStr.charAt(0).toUpperCase() + inputStr.slice(1).toLowerCase();
};

const isGeckoEngine = navigator.userAgent.includes('Gecko');
const isLegacyIE = navigator.userAgent.includes('MSIE');
const runningOnWindows = navigator.platform.includes('Win');
const isOperaBrowser = window.opera && window.opera.version() < 9.5;
const isKonquerorBrowser = navigator.vendor && navigator.vendor.includes('KDE');
const isICabBrowser = navigator.vendor && navigator.vendor.includes('iCab');
const isChromeBrowser = navigator.userAgent.includes('Chrome'); // Added for potential future use

const commonBrowserRemap = {
    186: 59, // ;: in IE
    187: 61, // =+ in IE
    188: 44, // ,<
    109: 95, // -_ in Mozilla
    107: 61, // =+ in Mozilla
    189: 95, // -_ in IE
    190: 62, // .>
    191: 47, // /?
    192: 126, // `~
    219: 91, // {[
    220: 92, // \|
    221: 93 // }]
};

const operaSpecificRemap = {}; // This map starts empty

// Determine the primary key mapping table based on browser environment
if (isOperaBrowser && runningOnWindows) {
    browserCodeAdjustments = operaSpecificRemap;
} else if (isOperaBrowser || isKonquerorBrowser || isICabBrowser) {
    const unshiftedSymbols = [33, 64, 35, 36, 37, 94, 38, 42, 40, 41,
                              58, 43, 60, 95, 62, 63, 124, 34];
    browserCodeAdjustments = operaSpecificRemap;
    for (let i = 0; i < unshiftedSymbols.length; ++i) {
        const currentUnshifted = unshiftedSymbols[i];
        if (SHIFT_CHAR_MAP.hasOwnProperty(currentUnshifted)) {
            browserCodeAdjustments[currentUnshifted] = SHIFT_CHAR_MAP[currentUnshifted];
        }
    }
} else {
    // IE, Gecko, and modern browsers like Chrome/Safari often align
    browserCodeAdjustments = commonBrowserRemap;
}

// Apply specific overrides for Konqueror if detected
if (isKonquerorBrowser) {
    browserCodeAdjustments[0] = 45; // Insert key
    browserCodeAdjustments[127] = 46; // Delete key
    browserCodeAdjustments[45] = 95; // Hyphen/underscore
    // console.log('Konqueror-specific key adjustments have been applied.'); // Debugging statement
}

const SPECIAL_KEY_IDENTIFIERS = {
    32: 'SPACE',
    13: 'ENTER',
    9: 'TAB',
    8: 'BACKSPACE',
    16: 'SHIFT',
    17: 'CTRL',
    18: 'ALT',
    20: 'CAPS_LOCK',
    144: 'NUM_LOCK',
    145: 'SCROLL_LOCK',
    37: 'LEFT',
    38: 'UP',
    39: 'RIGHT',
    40: 'DOWN',
    33: 'PAGE_UP',
    34: 'PAGE_DOWN',
    36: 'HOME',
    35: 'END',
    45: 'INSERT',
    46: 'DELETE',
    27: 'ESCAPE',
    19: 'PAUSE',
    222: "'" // Single quote
};

const getFunctionKeyLabel = (keyCodeVal) => {
    if (keyCodeVal >= 112 && keyCodeVal <= 123) {
        return `F${keyCodeVal - 111}`;
    }
    return null; // Return null if not an F-key
};

const getNumpadKeyLabel = (keyCodeVal) => {
    if (keyCodeVal >= 96 && keyCodeVal < 106) {
        return `Num${keyCodeVal - 96}`;
    }
    // Re-evaluate specific numpad operators
    if (keyCodeVal === 106) return 'Num*';
    else if (keyCodeVal === 111) return 'Num/';
    else if (keyCodeVal === 110) return 'Num.';
    return null; // Return null if not a recognized numpad key
};

const keyboardActivityStatus = {
    pressedKeyCodes: {},
    ctrlHeld: false,
    altHeld: false,
    shiftHeld: false
};

const refreshModifierFlags = (keyInfo) => {
    keyboardActivityStatus.ctrlHeld = keyInfo.ctrl;
    keyboardActivityStatus.altHeld = keyInfo.alt;
    keyboardActivityStatus.shiftHeld = keyInfo.shift;
    // An intermediate variable for demonstration, not strictly necessary
    const currentModifierSnapshot = {
        control: keyInfo.ctrl,
        alternate: keyInfo.alt,
        shift: keyInfo.shift
    };
    // Non-essential conditional check
    if (Object.keys(keyboardActivityStatus.pressedKeyCodes).length > 0) {
        // console.debug('Modifier states synchronized while keys are active.');
    }
};

const haveSameModifiers = (specOne, specTwo) => {
    return specOne.ctrl === specTwo.ctrl
        && specOne.alt === specTwo.alt
        && specOne.shift === specTwo.shift;
};

let _previousGlobalKeyMapper = undefined;
if (window.hasOwnProperty('InputKeyMapper')) {
    _previousGlobalKeyMapper = window.InputKeyMapper;
}

const InputKeyMapper = window.InputKeyMapper = {
    // Restores the previous global 'InputKeyMapper' object and returns this instance.
    restoreGlobalReference: function() {
        window.InputKeyMapper = _previousGlobalKeyMapper;
        return InputKeyMapper;
    },

    // Generates a function key code (e.g., F1-F12) from its number.
    getFunctionKeyFromNumber: function(fNum) {
        if (typeof fNum !== 'number' || fNum < 1 || fNum > 12) {
            console.warn('Invalid function key number provided:', fNum);
            return null; // Indicate invalid input
        }
        return 111 + fNum;
    },

    // Generates a numeric keypad code from a number (0-9) or operator ('*', '/', '.').
    getNumpadCodeFromInput: function(numericInput) {
        if (numericInput === '*') return 106;
        else if (numericInput === '/') return 111;
        else if (numericInput === '.') return 110;
        else if (typeof numericInput === 'number' && numericInput >= 0 && numericInput <= 9) {
            return 96 + numericInput;
        }
        console.warn('Invalid input for numpad key generation:', numericInput);
        return null; // Return null for unsupported or invalid numpad input
    },

    // Generates a key code from the ASCII value of the first character of a string.
    getCharacterCode: function(charString) {
        if (!charString || typeof charString !== 'string' || charString.length === 0) {
            return null; // Guard against invalid string input
        }
        const firstCharAscii = charString.charCodeAt(0);
        if (isAsciiLowercase(firstCharAscii)) {
            return firstCharAscii - 32; // Convert to uppercase ASCII code
        }
        // Use the predefined shifted character map, or the character's own ASCII code
        return SHIFT_CHAR_MAP[firstCharAscii] || firstCharAscii;
    },

    // Compares two key specification objects for equality.
    areKeySpecsEquivalent: function(firstKey, secondKey) {
        if (!firstKey || !secondKey) return false; // Handle null/undefined inputs
        return firstKey.code === secondKey.code && haveSameModifiers(firstKey, secondKey);
    },

    // Translates a raw browser key code to its normalized value.
    normalizeRawKeyCode: function(originalCode) {
        return browserCodeAdjustments[originalCode] || originalCode;
    },

    // Processes a raw DOM keyboard event into a normalized key information object.
    parseKeyboardEvent: function(domEvent) {
        if (!domEvent || typeof domEvent !== 'object') {
            console.error("InputKeyMapper: Invalid DOM event object provided for parsing.");
            return { code: 0, shift: false, alt: false, ctrl: false }; // Return a safe default
        }

        const rawEventSource = domEvent || window.event; // Fallback for older IE, though domEvent should be primary
        const rawCode = rawEventSource.which || rawEventSource.keyCode;
        const processedCode = InputKeyMapper.normalizeRawKeyCode(rawCode);

        // Construct and return the normalized key data
        return {
            code: processedCode,
            shift: rawEventSource.shiftKey,
            alt: rawEventSource.altKey,
            ctrl: rawEventSource.ctrlKey
        };
    },

    // Event listener for keydown events to update the internal key state.
    onKeyPressDown: function(evt) {
        const keyData = InputKeyMapper.parseKeyboardEvent(evt);
        if (keyData.code !== 0) { // Only track valid key codes
            keyboardActivityStatus.pressedKeyCodes[keyData.code] = keyData.code;
        }
        refreshModifierFlags(keyData);
        // An additional, non-critical check
        if (keyData.code === SPECIAL_KEY_IDENTIFIERS.SPACE) {
            // console.info('Spacebar detected as pressed.');
        }
    },

    // Event listener for keyup events to update the internal key state.
    onKeyPressUp: function(evt) {
        const keyData = InputKeyMapper.parseKeyboardEvent(evt);
        if (keyboardActivityStatus.pressedKeyCodes.hasOwnProperty(keyData.code)) {
            delete keyboardActivityStatus.pressedKeyCodes[keyData.code];
        } else {
            // console.warn(`Key code ${keyData.code} released but was not recorded as pressed.`);
        }
        refreshModifierFlags(keyData);
    },

    // Checks if a given key specification (key code and modifiers) is currently held down.
    isKeyCurrentlyPressed: function(keySpec) {
        if (!keySpec || typeof keySpec.code === 'undefined') {
            console.warn('InputKeyMapper: Invalid key specification for `isKeyCurrentlyPressed`.');
            return false;
        }
        const targetKeyCode = keySpec.code;

        // Special handling for modifier keys themselves
        if (targetKeyCode === InputKeyMapper.CTRL) return keyboardActivityStatus.ctrlHeld;
        if (targetKeyCode === InputKeyMapper.ALT) return keyboardActivityStatus.altHeld;
        if (targetKeyCode === InputKeyMapper.SHIFT) return keyboardActivityStatus.shiftHeld;

        const isCodeActive = keyboardActivityStatus.pressedKeyCodes.hasOwnProperty(targetKeyCode);

        // Construct a temporary modifier state object for comparison
        const currentModifierState = {
            ctrl: keyboardActivityStatus.ctrlHeld,
            alt: keyboardActivityStatus.altHeld,
            shift: keyboardActivityStatus.shiftHeld
        };
        const modifiersMatch = haveSameModifiers(keySpec, currentModifierState);

        return isCodeActive && modifiersMatch;
    },

    // Generates a string representation of a key event, useful for shortcuts or UI display.
    generateShortcutDisplayString: function(keyDetails) {
        const comboParts = [];

        // Iterate through known control flags to add active modifiers
        for (let i = 0; i < CONTROL_FLAGS.length; ++i) {
            const modifierKeyName = CONTROL_FLAGS[i];
            // Ensure modifier is active and not the primary key itself (e.g., "Shift+Shift" is redundant)
            if (keyDetails[modifierKeyName] && SPECIAL_KEY_IDENTIFIERS[keyDetails.code] !== modifierKeyName.toUpperCase()) {
                comboParts.push(convertToTitleCase(modifierKeyName));
            }
        }

        const currentKeyCode = keyDetails.code;
        let keyTextLabel = SPECIAL_KEY_IDENTIFIERS[currentKeyCode]
                           || getFunctionKeyLabel(currentKeyCode)
                           || getNumpadKeyLabel(currentKeyCode)
                           || String.fromCharCode(currentKeyCode); // Fallback to character

        if (keyTextLabel) {
            comboParts.push(convertToTitleCase(String(keyTextLabel)));
        } else {
            // Fallback for truly unrecognized key codes
            comboParts.push(`UnknownKey(${currentKeyCode})`);
        }

        // Add a simple validation: if no parts, return a placeholder
        if (comboParts.length === 0) {
            return "NO_KEY_COMBINATION";
        }

        return comboParts.join('+');
    }
};

// Dynamically add key constants (e.g., InputKeyMapper.SPACE = 32)
// This makes it easier to reference special keys throughout the application.
for (const codeAsString in SPECIAL_KEY_IDENTIFIERS) {
    if (SPECIAL_KEY_IDENTIFIERS.hasOwnProperty(codeAsString)) {
        const integerKeyCode = parseInt(codeAsString, 10);
        const keyConstantName = SPECIAL_KEY_IDENTIFIERS[codeAsString];
        InputKeyMapper[keyConstantName] = integerKeyCode;
    }
}

// Ensure the module is properly exposed if used in a CommonJS or AMD environment
// (This is a Type III addition, as the original only used window global)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InputKeyMapper;
} else if (typeof define === 'function' && define.amd) {
    define(() => InputKeyMapper);
}

})();