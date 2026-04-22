(function() {
// This module offers a standardized way to interpret key press events
// across various web browsers. It's designed to work specifically with
// 'keydown' events, as 'keypress' events have inconsistent firing behavior
// and differing key codes. The output is an object with these fields:
// { integer value, boolean shiftStatus, boolean altStatus, boolean controlStatus }.
//
// The standardized key values follow these patterns:
//
// - For alphabetical characters: The ASCII value of their uppercase form.
//
// - For universally consistent keys (like modifiers, escape, delete, arrows):
//   Their commonly recognized key value.
//
// - For numeric keypad entries: The value returned by the `generateNumPadKey` method.
//   (Typically 96 plus the digit).
//
// - For symbolic characters: The ASCII value of the character when the Shift key
//   is *not* pressed. EXCEPTIONS: '" => 222 (clashes with right-arrow/page-down),
//   .> => 190 (clashes with Delete), and `~ => 126 (clashes with Num0).
//
// Basic integration example:
// document.onkeydown = function(evtObject) {
//    process_input_with(InputTracker.processInputEvent(evtObject));
// };
//
// Naming conventions within this file: 'val' refers to an integer key value,
// 'keyInfo' refers to a structured key description (as outlined above), and
// 'evt' or 'eventObj' denotes an event object.
//
// The module also includes features for tracking active key states.
// To use this, attach `handleKeyPress` and `handleKeyRelease` to their
// respective event handlers, then query with `isInputActive`.
//
// @fileoverview A robust cross-browser key event normalizer.
// @author Jonathan Tang (Original Author)
// @version 0.9.1
// @license BSD-3-Clause

// License Information (BSD 3-Clause)
// Copyright (c) 2008 Jonathan Tang.
// All rights reserved.
//
// Redistribution and use of this software, in both source and compiled forms,
// with or without modifications, are permitted, provided the following
// conditions are met:
//
// 1. Redistributions of source code must retain the copyright notice shown above,
//    this complete list of conditions, and the disclaimer that follows.
//
// 2. Redistributions in compiled forms must reproduce the above copyright notice,
//    this list of conditions, and the disclaimer in the accompanying
//    documentation and/or other distributed materials.
//
// 3. The name of the author may not be used to endorse or promote products
//    derived from this software without specific prior written authorization.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDER "AS IS" AND ANY EXPRESS OR
// IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE, ARE DISCLAIMED.
// IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
// OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
// WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
// OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
// OF THE POSSIBILITY OF SUCH DAMAGE.

var controlFlags = ['ctrl', 'alt', 'shift']; // Array of modifier keys.
var keyAdjustments = {}; // Maps browser-specific codes to normalized codes.

// Mapping for symbols when shift is pressed, to their non-shifted ASCII value.
var alternateGlyphs = {
    58: 59,  // : -> ;
    43: 61,  // = -> +
    60: 44,  // < -> ,
    95: 45,  // _ -> -
    62: 46,  // > -> .
    63: 47,  // ? -> /
    96: 192, // ` -> ~
    124: 92, // | -> \
    39: 222, // ' -> " (special case, conflicts)
    34: 222, // " -> ' (special case, conflicts)
    33: 49,  // ! -> 1
    64: 50,  // @ -> 2
    35: 51,  // # -> 3
    36: 52,  // $ -> 4
    37: 53,  // % -> 5
    94: 54,  // ^ -> 6
    38: 55,  // & -> 7
    42: 56,  // * -> 8
    40: 57,  // ( -> 9
    41: 58,  // ) -> 0
    123: 91, // { -> [
    125: 93  // } -> ]
};

// Helper to check if an ASCII value represents a lowercase character.
function isLowerChar(asciiVal) {
    return asciiVal >= 97 && asciiVal <= 122;
}

// Converts a string to initial capital (e.g., "hello" -> "Hello").
function toInitialCap(textVal) {
    return textVal.substring(0, 1).toUpperCase() + textVal.substring(1).toLowerCase();
}

// Browser environment detection flags.
var envGecko = navigator.userAgent.indexOf('Gecko') !== -1;
var envIE = navigator.userAgent.indexOf('MSIE') !== -1;
var envWindows = navigator.platform.indexOf('Win') !== -1;
var envOpera = window.opera && window.opera.version() < 9.5;
var envKonq = navigator.vendor && navigator.vendor.indexOf('KDE') !== -1;
var envICab = navigator.vendor && navigator.vendor.indexOf('iCab') !== -1;

// Key code adjustments specific to Gecko/IE browsers.
var geckoIeAdjustments = {
    186: 59,  // ;: in IE
    187: 61,  // =+ in IE
    188: 44,  // ,<
    109: 95,  // -_ in Mozilla
    107: 61,  // =+ in Mozilla
    189: 95,  // -_ in IE
    190: 62,  // .>
    191: 47,  // /?
    192: 126, // `~
    219: 91,  // {[
    220: 92,  // \|
    221: 93   // }]
};

// Key code adjustments specific to Opera browsers.
var operaAdjustments = {};

// Select the appropriate key map based on browser detection.
if (envOpera && envWindows) {
    keyAdjustments = operaAdjustments;
} else if (envOpera || envKonq || envICab) {
    // For older Opera, Konqueror, iCab, populate special shifted symbol map.
    var unmodifiedCodes = [33, 64, 35, 36, 37, 94, 38, 42, 40, 41,
                           58, 43, 60, 95, 62, 63, 124, 34];
    keyAdjustments = operaAdjustments;
    for (var idx = 0; idx < unmodifiedCodes.length; ++idx) {
        keyAdjustments[unmodifiedCodes[idx]] = alternateGlyphs[unmodifiedCodes[idx]];
    }
} else {
    // IE and Gecko are similar enough, and modern browsers tend to follow their standards.
    keyAdjustments = geckoIeAdjustments;
}

// Specific adjustments for Konqueror.
if (envKonq) {
    keyAdjustments[0] = 45;
    keyAdjustments[127] = 46;
    keyAdjustments[45] = 95;
}

// Common key names mapped to their normalized codes.
var namedKeys = {
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
    222: "'"
};

// Determines the string label for a function key (F1-F12).
function getFnKeyLabel(inputCode) {
    if (inputCode >= 112 && inputCode <= 123) return 'F' + (inputCode - 111);
    return false;
}

// Determines the string label for a numeric keypad key.
function getNumPadLabel(inputCode) {
    if (inputCode >= 96 && inputCode < 106) return 'Num' + (inputCode - 96);
    switch (inputCode) {
        case 106: return 'Num*';
        case 111: return 'Num/';
        case 110: return 'Num.';
        default: return false;
    }
}

// Object to store the current state of pressed keys and modifiers.
var activeInputStates = {
    codes: {},      // Stores currently pressed raw key codes.
    ctrl: false,    // Is Control key active?
    alt: false,     // Is Alt key active?
    shift: false    // Is Shift key active?
};

// Updates the global modifier states based on a key event.
function syncControlFlags(keyData) {
    activeInputStates.ctrl = keyData.ctrl;
    activeInputStates.alt = keyData.alt;
    activeInputStates.shift = keyData.shift;
}

// Compares the modifier flags of two key objects.
function areControlsEqual(firstKey, secondKey) {
    return firstKey.ctrl === secondKey.ctrl
        && firstKey.alt === secondKey.alt
        && firstKey.shift === secondKey.shift;
}

// Preserve any existing window.InputTracker for no_conflict.
if (typeof window.InputTracker !== "undefined") {
    var _PreviousInputTracker = window.InputTracker;
}

// The main InputTracker object, exposed globally.
var InputTracker = window.InputTracker = {
    /**
     * Restores the previous `window.InputTracker` and returns this instance.
     */
    revertNamespace: function() {
        window.InputTracker = _PreviousInputTracker;
        return InputTracker;
    },

    /**
     * Generates a key code for a function key (F1 through F12).
     * @param {number} inputNum - The function key number (1-12).
     * @returns {number} The normalized key code.
     */
    generateFKey: function(inputNum) {
        return 111 + inputNum;
    },

    /**
     * Generates a key code for a numeric keypad key.
     * Supports digits 0-9 and some operators:
     * Asterisk (*): 106, Slash (/): 111, Period (.): 110.
     * Addition (+) and Subtraction (-) are not included due to conflicts
     * with non-keypad codes in some browsers (e.g., Mozilla, Konqueror, early Opera).
     * @param {number|string} inputNum - The digit or operator.
     * @returns {number} The normalized key code.
     */
    generateNumPadKey: function(inputNum) {
        switch (inputNum) {
            case '*': return 106;
            case '/': return 111;
            case '.': return 110;
            default: return 96 + inputNum;
        }
    },

    /**
     * Derives a normalized key code from the first character of a string.
     * Converts lowercase characters to their uppercase ASCII equivalent.
     * @param {string} inputStr - The string containing the character.
     * @returns {number} The normalized character code.
     */
    getCharVal: function(inputStr) {
        var charVal = inputStr.charCodeAt(0);
        if (isLowerChar(charVal)) return charVal - 32;
        return alternateGlyphs[charVal] || charVal;
    },

    /**
     * Checks if two key information objects are identical, including modifiers.
     * @param {object} firstKey - The first key object.
     * @param {object} secondKey - The second key object.
     * @returns {boolean} True if both key code and modifiers match.
     */
    areKeyObjectsSame: function(firstKey, secondKey) {
        return firstKey.code === secondKey.code && areControlsEqual(firstKey, secondKey);
    },

    /**
     * Normalizes a raw key code from a browser event.
     * @param {number} rawCode - The raw key code from the event.
     * @returns {number} The normalized key code.
     */
    normalizeRawCode: function(rawCode) {
        return keyAdjustments[rawCode] || rawCode;
    },

    /**
     * Processes a raw keyboard event into a standardized key event object.
     * @param {Event} eventObj - The raw browser keyboard event.
     * @returns {object} An object with `code`, `shift`, `alt`, and `ctrl` fields.
     */
    processInputEvent: function(eventObj) {
        eventObj = eventObj || window.event;
        var rawCode = eventObj.which || eventObj.keyCode;
        return {
            code: InputTracker.normalizeRawCode(rawCode),
            shift: eventObj.shiftKey,
            alt: eventObj.altKey,
            ctrl: eventObj.ctrlKey
        };
    },

    /**
     * Event handler for 'keydown' events, updates the internal state
     * of currently pressed keys.
     * @param {Event} evt - The keydown event object.
     */
    handleKeyPress: function(evt) {
        var keyData = InputTracker.processInputEvent(evt);
        activeInputStates.codes[keyData.code] = keyData.code;
        syncControlFlags(keyData);
    },

    /**
     * Event handler for 'keyup' events, updates the internal state.
     * @param {Event} evt - The keyup event object.
     */
    handleKeyRelease: function(evt) {
        var keyData = InputTracker.processInputEvent(evt);
        delete activeInputStates.codes[keyData.code];
        syncControlFlags(keyData);
    },

    /**
     * Checks if a specified key (with modifiers) is currently held down.
     * @param {object} keyInfo - A key object (like those returned by `processInputEvent`).
     * @returns {boolean} True if the key is currently active.
     */
    isInputActive: function(keyInfo) {
        var inputCode = keyInfo.code;
        if (inputCode === InputTracker.CTRL) return activeInputStates.ctrl;
        if (inputCode === InputTracker.ALT) return activeInputStates.alt;
        if (inputCode === InputTracker.SHIFT) return activeInputStates.shift;

        return activeInputStates.codes[inputCode] !== undefined
            && areControlsEqual(keyInfo, activeInputStates);
    },

    /**
     * Generates a string representation of a key event, suitable for
     * shortcut libraries or UI display. E.g., "Ctrl+Shift+A".
     * @param {object} keyInfo - The normalized key event object.
     * @returns {string} The formatted key combination string.
     */
    formatKeyCombo: function(keyInfo) {
        var partsArray = [];
        for (var idx = 0; idx < controlFlags.length; ++idx) {
            var currentModifier = controlFlags[idx];
            if (keyInfo[currentModifier] && currentModifier.toUpperCase() !== namedKeys[keyInfo.code]) {
                partsArray.push(toInitialCap(currentModifier));
            }
        }

        var charVal = keyInfo.code;
        var keyIdentifier = namedKeys[charVal] || getFnKeyLabel(charVal) || getNumPadLabel(charVal) || String.fromCharCode(charVal);
        partsArray.push(toInitialCap(keyIdentifier));
        return partsArray.join('+');
    }
};

// Dynamically add key constants (e.g., InputTracker.SPACE = 32).
for (var codeVal in namedKeys) {
    InputTracker[namedKeys[codeVal]] = parseInt(codeVal, 10);
}

})();