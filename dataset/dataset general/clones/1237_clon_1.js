/*
 * File: keymaster.js
 * Author: Thomas Fuchs
 * License: MIT License (https://opensource.org/licenses/MIT)
 * Description: A micro-library for capturing keyboard input.
 */

;
(function (global) {

  var k; // Loop variable for various iterations

  var _handlers = {}; // Stores all registered keyboard handlers
  var _mods = {
    16: false, // Shift key state
    18: false, // Alt key state
    17: false, // Ctrl key state
    91: false   // Command/Meta key state
  };
  var _scope = 'all'; // Current active scope for handlers

  /**
   * Defines standard modifier keys and their corresponding key codes.
   * Both symbolic and textual representations are supported.
   */
  var _MODIFIERS = {
    '⇧': 16, shift: 16,
    '⌥': 18, alt: 18, option: 18,
    '⌃': 17, ctrl: 17, control: 17,
    '⌘': 91, command: 91
  };


  /**
   * Defines common special keys and their corresponding key codes.
   * This mapping assists in converting human-readable key names to codes.
   */
  var _MAP = {
    backspace: 8, tab: 9, clear: 12,
    enter: 13, 'return': 13,
    esc: 27, escape: 27, space: 32,
    left: 37, up: 38,
    right: 39, down: 40,
    del: 46, 'delete': 46,
    home: 36, end: 35,
    pageup: 33, pagedown: 34,
    ',': 188, '.': 190, '/': 191,
    '`': 192, '-': 189, '=': 187,
    ';': 186, '\'': 222,
    '[': 219, ']': 221, '\\': 220
  };

  // Dynamically add function keys (F1-F19) to the _MODIFIERS map.
  for (k = 1; k < 20; k++) {
    _MODIFIERS['f' + k] = 111 + k;
  }


  /**
   * A simple replacement for Array.prototype.indexOf,
   * necessary for older browsers (like IE) that lack native support.
   *
   * @param {Array} array - The array to search within.
   * @param {*} item - The item to search for.
   * @returns {number} The index of the item, or -1 if not found.
   */
  function index(array, item) {
    var i = array.length;
    while (i--) {
      if (array[i] === item) {
        return i;
      }
    }
    return -1;
  }


  /**
   * Dispatches keyboard events to registered handlers.
   * This is the core function called on 'keydown'.
   *
   * @param {Event} event - The keyboard event object.
   */
  function dispatch(event) {
    var key, handler, k, i, modifiersMatch;

    key = event.keyCode;

    // Normalize command key codes across different browsers/OS.
    if (key == 93 || key == 224) {
      key = 91; // Right command on WebKit, command on Gecko
    }

    // If the pressed key is a modifier, update its state and exit.
    if (key in _mods) {
      _mods[key] = true;
      // Also update the public 'assignKey' object for easy access to modifier states.
      for (k in _MODIFIERS) {
        if (_MODIFIERS[k] == key) {
          assignKey[k] = true;
        }
      }
      return;
    }

    // Check if the keypress should be ignored based on the current focus.
    // The filter function can be overridden by the user.
    if (!assignKey.filter.call(this, event)) {
      return;
    }

    // If no handlers are registered for this key, there's nothing to do.
    if (!(key in _handlers)) {
      return;
    }

    // Iterate through all potential shortcuts for the pressed key.
    for (i = 0; i < _handlers[key].length; i++) {
      handler = _handlers[key][i];

      // Check if the handler's scope matches the current active scope.
      if (handler.scope == _scope || handler.scope == 'all') {

        // Determine if required modifiers match the currently pressed modifiers.
        modifiersMatch = handler.mods.length > 0;
        for (k in _mods) {
          if ((!_mods[k] && index(handler.mods, +k) > -1) ||
            (_mods[k] && index(handler.mods, +k) == -1)) {
            modifiersMatch = false;
          }
        }

        // Execute the handler if modifiers match or if no modifiers are required.
        if ((handler.mods.length == 0 && !_mods[16] && !_mods[18] && !_mods[17] && !_mods[91]) || modifiersMatch) {
          // If the handler returns false, prevent default action and stop propagation.
          if (handler.method(event, handler) === false) {
            if (event.preventDefault) {
              event.preventDefault();
            } else {
              event.returnValue = false;
            }
            if (event.stopPropagation) {
              event.stopPropagation();
            }
            if (event.cancelBubble) {
              event.cancelBubble = true;
            }
          }
        }
      }
    }
  }
  ; // Semicolon for IIFE safety.


  /**
   * Resets the state of modifier keys when a key is released.
   * This function is called on 'keyup' events.
   *
   * @param {Event} event - The keyboard event object.
   */
  function clearModifier(event) {
    var key = event.keyCode, k;

    // Normalize command key codes.
    if (key == 93 || key == 224) {
      key = 91;
    }

    // If the released key was a modifier, update its state.
    if (key in _mods) {
      _mods[key] = false;
      for (k in _MODIFIERS) {
        if (_MODIFIERS[k] == key) {
          assignKey[k] = false;
        }
      }
    }
  }


  /**
   * Resets all modifier key states to false.
   * Useful when the window loses/gains focus to prevent "stuck" modifier states.
   */
  function resetModifiers() {
    for (k in _mods) {
      _mods[k] = false;
    }
    for (k in _MODIFIERS) {
      assignKey[k] = false;
    }
  }


  /**
   * Parses a shortcut string and registers a handler function.
   *
   * @param {string} key - The shortcut string (e.g., "ctrl+a", "shift+enter").
   * @param {string} [scope='all'] - The scope in which the shortcut is active.
   * @param {function} method - The function to execute when the shortcut is pressed.
   */
  function assignKey(key, scope, method) {
    var keys, mods, i, mi;

    // Handle optional scope parameter.
    if (method === undefined) {
      method = scope;
      scope = 'all';
    }

    // Clean up whitespace from the key string.
    key = key.replace(/\s/g, '');
    keys = key.split(','); // Support multiple shortcuts separated by commas.

    // Adjust for trailing commas (e.g., "ctrl+,").
    if ((keys[keys.length - 1]) == '') {
      keys[keys.length - 2] += ',';
    }

    // Process each individual shortcut definition.
    for (i = 0; i < keys.length; i++) {

      mods = [];
      key = keys[i].split('+'); // Separate modifier keys from the main key.

      if (key.length > 1) {
        mods = key.slice(0, key.length - 1); // Extract modifiers.
        for (mi = 0; mi < mods.length; mi++) {
          mods[mi] = _MODIFIERS[mods[mi]]; // Convert modifier names to key codes.
        }
        key = [key[key.length - 1]]; // The actual key is the last element.
      }

      // Convert the key name (or character) to its corresponding key code.
      key = key[0];
      key = _MAP[key] || key.toUpperCase().charCodeAt(0);

      // Store the handler in the _handlers object, grouped by key code.
      if (!(key in _handlers)) {
        _handlers[key] = [];
      }
      _handlers[key].push({ shortcut: keys[i], scope: scope, method: method, key: keys[i], mods: mods });
    }
  }


  /**
   * Default filter function for key events.
   * Prevents shortcuts from firing when focus is on input fields.
   *
   * @param {Event} event - The keyboard event object.
   * @returns {boolean} True if the event should be processed, false to ignore.
   */
  function filter(event) {
    var tagName = (event.target || event.srcElement).tagName;
    // Ignore key presses in elements designed for text input.
    return !(tagName == 'INPUT' || tagName == 'SELECT' || tagName == 'TEXTAREA');
  }


  // Initialize the public modifier states to false.
  for (k in _MODIFIERS) {
    assignKey[k] = false;
  }


  /**
   * Sets the current active scope for keyboard shortcuts.
   * Only handlers registered for this scope or 'all' will fire.
   *
   * @param {string} scope - The name of the scope to activate.
   */
  function setScope(scope) {
    _scope = scope || 'all';
  }

  /**
   * Retrieves the current active scope.
   *
   * @returns {string} The name of the current scope.
   */
  function getScope() {
    return _scope || 'all';
  }


  /**
   * Deletes all registered handlers for a specific scope.
   *
   * @param {string} scope - The scope whose handlers should be removed.
   */
  function deleteScope(scope) {
    var key, handlers, i;

    for (key in _handlers) {
      handlers = _handlers[key];
      for (i = 0; i < handlers.length;) {
        if (handlers[i].scope === scope) {
          handlers.splice(i, 1); // Remove the handler.
        } else {
          i++; // Move to the next handler.
        }
      }
    }
  }


  /**
   * Cross-browser utility for attaching event listeners.
   *
   * @param {Element} object - The DOM element to attach the event to.
   * @param {string} event - The event type (e.g., 'keydown', 'keyup').
   * @param {function} method - The callback function.
   */
  function addEvent(object, event, method) {
    if (object.addEventListener) {
      object.addEventListener(event, method, false);
    } else if (object.attachEvent) {
      object.attachEvent('on' + event, function () {
        method(window.event);
      });
    }
  }


  // Attach event listeners to the document for keydown and keyup events.
  addEvent(document, 'keydown', dispatch);
  addEvent(document, 'keyup', clearModifier);

  // Attach a focus event listener to the window to reset modifier states.
  addEvent(window, 'focus', resetModifiers);


  // Expose the public API to the global object (window in browsers).
  global.key = assignKey;
  global.key.setScope = setScope;
  global.key.getScope = getScope;
  global.key.deleteScope = deleteScope;
  global.key.filter = filter;


  // Support CommonJS module export for environments like Node.js.
  if (typeof module !== 'undefined') {
    module.exports = key;
  }

})(this); // Execute the IIFE, passing 'this' (which is 'window' in browsers) as 'global'.