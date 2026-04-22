( function () {
  /*
   * This library provides a unified approach to handling keyboard events,
   * specifically `keydown` events, across different web browsers.
   * Keypress events are generally not used as they can be inconsistent.
   *
   * The primary function `KeyCode.translateEvent(e)` processes a raw event object
   * and returns a normalized key object with the following structure:
   * {
   *   int code,    // The normalized key code
   *   bool shift,  // True if Shift key is pressed
   *   bool alt,    // True if Alt key is pressed
   *   bool ctrl    // True if Ctrl key is pressed
   * }
   *
   * Keycode Normalization Rules:
   *
   * 1. Alphabetic Characters:
   *    The ASCII code of the uppercase version of the character.
   *
   * 2. Common Keys:
   *    For keys with consistent codes across browsers (e.g., modifiers, Esc,
   *    Delete, arrow keys), their standard common keycode is used.
   *
   * 3. Numeric Keypad Keys:
   *    Values are returned by the `numkey()` function, typically 96 + the number.
   *
   * 4. Symbols:
   *    The ASCII code of the character produced when the Shift key is NOT held down.
   *    However, there are specific exceptions to avoid conflicts:
   *    - '" => 222 (conflicts with right-arrow/pagedown)
   *    - .> => 190 (conflicts with Delete)
   *    - `~ => 126 (conflicts with Num0)
   *
   * Basic Integration Example:
   * document.onkeydown = function (evt) {
   *   // Process the normalized key event object
   *   do_something_with( KeyCode.translateEvent(evt) );
   * };
   *
   * Naming Conventions within this library:
   * - 'code': Refers to an integer keycode.
   * - 'key': Refers to a normalized key description object (as specified above).
   * - 'e' / 'evt': Represents a raw DOM event object.
   *
   * Additionally, the library offers functionality to track and query
   * which keys are currently being held down. To enable this, ensure
   * `key_up` and `key_down` are installed as event handlers for their
   * respective events. Then, use `is_down` to check the state of a key.
   *
   * @fileoverview A comprehensive JavaScript library for normalizing key codes.
   * @author Jonathan Tang
   * @version 0.9
   * @license BSD
   */

  /*
   Copyright (c) 2008 Jonathan Tang
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

  // Array of modifier keys for easy iteration and processing.
  var modifiers = [ 'ctrl', 'alt', 'shift' ],
    // This map stores browser-specific keycode adjustments.
    KEY_MAP = {},
    // Mapping for symbols that change when Shift is pressed.
    shifted_symbols = {
      58: 59, // : -> ;
      43: 61, // = -> +
      60: 44, // < -> ,
      95: 45, // _ -> -
      62: 46, // > -> .
      63: 47, // ? -> /
      96: 192, // ` -> ~
      124: 92, // | -> \
      39: 222, // ' -> 222 (special handling)
      34: 222, // " -> 222 (special handling)
      33: 49, // ! -> 1
      64: 50, // @ -> 2
      35: 51, // # -> 3
      36: 52, // $ -> 4
      37: 53, // % -> 5
      94: 54, // ^ -> 6
      38: 55, // & -> 7
      42: 56, // * -> 8
      40: 57, // ( -> 9
      41: 58, // ) -> 0
      123: 91, // { -> [
      125: 93 // } -> ]
    };

  /**
   * Checks if a given ASCII code represents a lowercase letter.
   * @param {number} ascii The ASCII code to check.
   * @returns {boolean} True if the code is for a lowercase letter, false otherwise.
   */
  function isLower ( ascii ) {
    return ascii >= 97 && ascii <= 122;
  }

  /**
   * Capitalizes the first letter of a string and converts the rest to lowercase.
   * @param {string} str The input string.
   * @returns {string} The capitalized string.
   */
  function capitalize ( str ) {
    return str.substr( 0, 1 ).toUpperCase() + str.substr( 1 ).toLowerCase();
  }

  // Perform browser and OS detection to apply specific keymap adjustments.
  var is_gecko = navigator.userAgent.indexOf( 'Gecko' ) != -1,
    is_ie = navigator.userAgent.indexOf( 'MSIE' ) != -1,
    is_windows = navigator.platform.indexOf( 'Win' ) != -1,
    is_opera = window.opera && window.opera.version() < 9.5,
    is_konqueror = navigator.vendor && navigator.vendor.indexOf( 'KDE' ) != -1,
    is_icab = navigator.vendor && navigator.vendor.indexOf( 'iCab' ) != -1;

  // Key map for Gecko (Firefox) and Internet Explorer, which are largely compatible.
  var GECKO_IE_KEYMAP = {
    186: 59, // ;: in IE (becomes 59)
    187: 61, // =+ in IE (becomes 61)
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

  // Opera's specific keymap, which might be empty or have unique entries.
  var OPERA_KEYMAP = {};

  // Apply the appropriate keymap based on browser detection.
  // Browser detection logic adapted from quirksmode.org for robustness.
  if ( is_opera && is_windows ) {
    // Specific handling for Opera on Windows.
    KEY_MAP = OPERA_KEYMAP;
  } else if ( is_opera || is_konqueror || is_icab ) {
    // Handling for other Opera versions, Konqueror, and iCab.
    // These browsers may require unshifting of certain symbols.
    var unshift = [
      33, 64, 35, 36, 37, 94, 38, 42, 40, 41,
      58, 43, 60, 95, 62, 63, 124, 34
    ];
    KEY_MAP = OPERA_KEYMAP;
    for ( var i = 0; i < unshift.length; ++i ) {
      KEY_MAP[ unshift[ i ] ] = shifted_symbols[ unshift[ i ] ];
    }
  } else {
    // Default to Gecko/IE keymap, as most modern browsers (e.g., Opera 9.50+)
    // tend to standardize on these keycode behaviors.
    KEY_MAP = GECKO_IE_KEYMAP;
  }

  // Konqueror has some unique keycode mappings that need special adjustments.
  if ( is_konqueror ) {
    KEY_MAP[ 0 ] = 45;
    KEY_MAP[ 127 ] = 46;
    KEY_MAP[ 45 ] = 95;
  }

  // A comprehensive map of keycodes to their common string names.
  var key_names = {
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
    222: "'" // Single quote has a specific keycode.
  };

  /**
   * Determines the name of a function key (F1-F12) from its keycode.
   * @param {number} code The keycode.
   * @returns {string|boolean} The function key name (e.g., 'F1') or false if not a function key.
   */
  function fn_name ( code ) {
    if ( code >= 112 && code <= 123 ) return 'F' + ( code - 111 );
    return false;
  }

  /**
   * Determines the name of a numeric keypad key from its keycode.
   * Handles numbers (Num0-Num9) and some operators.
   * @param {number} code The keycode.
   * @returns {string|boolean} The numeric keypad key name (e.g., 'Num*') or false.
   */
  function num_name ( code ) {
    if ( code >= 96 && code < 106 ) return 'Num' + ( code - 96 );
    switch ( code ) {
      case 106:
        return 'Num*';
      case 111:
        return 'Num/';
      case 110:
        return 'Num.';
      default:
        return false;
    }
  }

  // Object to maintain the current state of pressed keys, including modifiers.
  var current_keys = {
    codes: {}, // Stores the keycodes of all currently pressed non-modifier keys.
    ctrl: false, // State of the Ctrl key.
    alt: false, // State of the Alt key.
    shift: false // State of the Shift key.
  };

  /**
   * Updates the global `current_keys` modifier states based on a key event object.
   * @param {object} key The normalized key event object.
   */
  function update_current_modifiers ( key ) {
    current_keys.ctrl = key.ctrl;
    current_keys.alt = key.alt;
    current_keys.shift = key.shift;
  }

  /**
   * Compares the modifier states of two normalized key objects.
   * @param {object} key1 The first key object.
   * @param {object} key2 The second key object.
   * @returns {boolean} True if all modifier states (ctrl, alt, shift) are identical, false otherwise.
   */
  function same_modifiers ( key1, key2 ) {
    return key1.ctrl === key2.ctrl &&
      key1.alt === key2.alt &&
      key1.shift === key2.shift;
  }

  // Backup any existing `window.KeyCode` object to support `no_conflict`.
  var _KeyCode;
  if ( typeof window.KeyCode != "undefined" ) {
    _KeyCode = window.KeyCode;
  }

  // The main KeyCode library object, exposed globally.
  var KeyCode = window.KeyCode = {
    /**
     * Restores the previous `window.KeyCode` and returns this library's KeyCode object.
     * Useful for avoiding global namespace conflicts.
     * @returns {object} The KeyCode library object.
     */
    no_conflict: function () {
      window.KeyCode = _KeyCode;
      return KeyCode;
    },

    /**
     * Generates a keycode for a function key (F1 through F12).
     * @param {number} num The function key number (1-12).
     * @returns {number} The keycode for the specified function key.
     */
    fkey: function ( num ) {
      return 111 + num;
    },

    /**
     * Generates a keycode for a numeric keypad key.
     * Supports numbers 0-9 and some arithmetic operators.
     *
     * Mappings:
     * - '*': 106
     * - '/': 111
     * - '.': 110
     * - Numbers 0-9: 96 + number
     *
     * Note: '+' and '-' are not supported due to keycode conflicts
     * in Mozilla and across various browsers/OSes for keypad operators.
     *
     * @param {number|string} num The number (0-9) or operator ('*', '/', '.')
     *                            representing the keypad key.
     * @returns {number} The keycode for the specified numeric keypad key.
     */
    numkey: function ( num ) {
      switch ( num ) {
        case '*':
          return 106;
        case '/':
          return 111;
        case '.':
          return 110;
        default:
          return 96 + num;
      }
    },

    /**
     * Generates a normalized keycode from a character string.
     * It uses the ASCII code of the first character, converting lowercase to uppercase.
     * Also handles shifted symbols where necessary.
     * @param {string} str The string representing the key (e.g., 'a', 'A', ';').
     * @returns {number} The normalized keycode.
     */
    key: function ( str ) {
      var c = str.charCodeAt( 0 ); // Get ASCII code of the first character.
      if ( isLower( c ) ) {
        return c - 32; // Convert lowercase to uppercase ASCII.
      }
      // Return the shifted symbol's base keycode or the original code if no shift mapping.
      return shifted_symbols[ c ] || c;
    },

    /**
     * Compares two normalized key objects for equality (code and modifiers).
     * @param {object} key1 The first normalized key object.
     * @param {object} key2 The second normalized key object.
     * @returns {boolean} True if both key objects represent the same key press, false otherwise.
     */
    key_equals: function ( key1, key2 ) {
      return key1.code == key2.code && same_modifiers( key1, key2 );
    },

    /**
     * Translates a raw browser keycode to its normalized value using `KEY_MAP`.
     * @param {number} code The raw keycode from the event.
     * @returns {number} The normalized keycode.
     */
    translate_key_code: function ( code ) {
      return KEY_MAP[ code ] || code;
    },

    /**
     * Translates a raw `keydown` DOM event object into a normalized key event object.
     * This is the primary entry point for processing keydown events.
     * @param {Event} e The raw DOM keydown event object.
     * @returns {object} A normalized key object: {code, shift, alt, ctrl}.
     */
    translate_event: function ( e ) {
      e = e || window.event; // Ensure event object is available (IE compatibility).
      var code = e.which || e.keyCode; // Get the raw keycode from the event.

      return {
        code: KeyCode.translate_key_code( code ), // Normalize the keycode.
        shift: e.shiftKey, // Check Shift modifier state.
        alt: e.altKey, // Check Alt modifier state.
        ctrl: e.ctrlKey // Check Ctrl modifier state.
      };
    },

    /**
     * Event listener for `keydown` events. Updates the internal state of
     * currently pressed keys.
     * This function should be attached to `document.onkeydown` or similar.
     * @param {Event} e The raw DOM keydown event.
     */
    key_down: function ( e ) {
      var key = KeyCode.translate_event( e ); // Normalize the event.
      current_keys.codes[ key.code ] = key.code; // Mark the key as down.
      update_current_modifiers( key ); // Update modifier states.
    },

    /**
     * Event listener for `keyup` events. Updates the internal state by
     * removing the released key.
     * This function should be attached to `document.onkeyup` or similar.
     * @param {Event} e The raw DOM keyup event.
     */
    key_up: function ( e ) {
      var key = KeyCode.translate_event( e ); // Normalize the event.
      delete current_keys.codes[ key.code ]; // Remove the key from pressed keys.
      update_current_modifiers( key ); // Update modifier states.
    },

    /**
     * Checks if a specific key (including its modifier state) is currently held down.
     * This function relies on `key_down` and `key_up` listeners being active.
     * @param {object} key A normalized key object (e.g., from `translate_event`).
     * @returns {boolean} True if the specified key and its modifiers are currently pressed.
     */
    is_down: function ( key ) {
      var code = key.code;
      // Special handling for modifier keys themselves.
      if ( code == KeyCode.CTRL ) return current_keys.ctrl;
      if ( code == KeyCode.ALT ) return current_keys.alt;
      if ( code == KeyCode.SHIFT ) return current_keys.shift;

      // For other keys, check if its code is in `current_keys.codes` AND
      // if its modifier state matches the global current modifier state.
      return current_keys.codes[ code ] !== undefined &&
        same_modifiers( key, current_keys );
    },

    /**
     * Generates a string representation of a key event, suitable for display
     * or for use with hotkey/shortcut libraries (e.g., shortcut.js, JQuery HotKeys).
     * The format is "Modifier+Modifier+KeyName" (e.g., "Ctrl+Shift+A").
     * @param {object} key A normalized key event object.
     * @returns {string} The hotkey string representation.
     */
    hot_key: function ( key ) {
      var pieces = [];
      // Add modifier names if they are active for this key.
      for ( var i = 0; i < modifiers.length; ++i ) {
        var modifier = modifiers[ i ];
        // Avoid adding a modifier if the key itself IS that modifier (e.g., 'Ctrl+Ctrl').
        if ( key[ modifier ] && modifier.toUpperCase() != key_names[ key.code ] ) {
          pieces.push( capitalize( modifier ) );
        }
      }

      var c = key.code;
      // Determine the key's name using various lookup functions.
      var key_name = key_names[ c ] || fn_name( c ) || num_name( c ) || String.fromCharCode( c );
      pieces.push( capitalize( key_name ) ); // Add the main key name.
      return pieces.join( '+' ); // Join all parts with '+'.
    }
  };

  // Populate KeyCode with constants for common keys (e.g., KeyCode.ENTER = 13).
  // This makes it easier to reference specific keycodes.
  for ( var code in key_names ) {
    KeyCode[ key_names[ code ] ] = code;
  }
} )();