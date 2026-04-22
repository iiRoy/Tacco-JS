;(function(root){
  // This module facilitates keyboard shortcut management.
  // It is a re-engineered version of keymaster.js, focusing on clarity and
  // incorporating modern JavaScript practices where appropriate.
  // Original license applies: MIT.

  // --- Internal State Variables ---
  var keyboardBinder, // The main exported object
    _shortcutHandlers = {}, // Stores registered shortcuts: { keyCode: [ { scope, method, mods, ... } ] }
    _modifierState = { 16: false, 18: false, 17: false, 91: false }, // Tracks currently pressed modifier keys
    _currentScope = 'all'; // The active scope for shortcuts

  // --- Constants and Mappings ---

  // Modifier key code mappings
  const _modifierMappings = {
    '⇧': 16, shift: 16,
    '⌥': 18, alt: 18, option: 18,
    '⌃': 17, ctrl: 17, control: 17,
    '⌘': 91, command: 91
  };

  // Special key code mappings
  const _specialKeyCodesMap = {
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

  // Common key codes for command/meta key normalization across browsers
  const COMMAND_KEY_CANDIDATES = new Set([91, 93, 224]);

  // Tags for which keyboard input should generally be ignored
  const IGNORED_INPUT_TAGS = new Set(['INPUT', 'SELECT', 'TEXTAREA']);

  // Event types
  const EVENT_TYPES = {
    KEY_DOWN: 'keydown',
    KEY_UP: 'keyup',
    FOCUS: 'focus'
  };

  // Populate function keys (f1-f19) into modifier mappings
  for (let i = 1; i < 20; i++) {
    _modifierMappings['f' + i] = 111 + i;
  }

  // --- Utility Functions ---

  /**
   * Finds the index of an item in an array.
   * @param {Array} collection The array to search in.
   * @param {*} targetItem The item to search for.
   * @returns {number} The index of the item, or -1 if not found.
   */
  function getArrayItemIndex(collection, targetItem) {
    if (!Array.isArray(collection)) {
      console.warn("getArrayItemIndex expects an array as its first argument.");
      return -1;
    }
    for (let i = 0; i < collection.length; i++) {
      if (collection[i] === targetItem) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Prevents default browser action and stops event propagation.
   * @param {Event} eventObj The DOM event object.
   */
  function preventAndStopEvent(eventObj) {
    if (eventObj.preventDefault) {
      eventObj.preventDefault();
    } else {
      eventObj.returnValue = false; // IE compatibility
    }
    if (eventObj.stopPropagation) {
      eventObj.stopPropagation();
    }
    if (eventObj.cancelBubble) {
      eventObj.cancelBubble = true; // IE compatibility
    }
  }

  /**
   * Normalizes a key code for command/meta key.
   * @param {number} originalKeyCode The raw key code from the event.
   * @returns {number} The normalized key code.
   */
  function normalizeCommandKeyCode(originalKeyCode) {
    return COMMAND_KEY_CANDIDATES.has(originalKeyCode) ? 91 : originalKeyCode;
  }

  // --- Event Handlers ---

  /**
   * Handles the keydown DOM event. Dispatches registered shortcuts.
   * @param {Event} event The keydown event object.
   */
  function handleKeyboardInput(event) {
    let processedKeyCode = normalizeCommandKeyCode(event.keyCode);

    // If it's a modifier key, update its state and return.
    if (processedKeyCode in _modifierState) {
      _modifierState[processedKeyCode] = true;
      // Also update the 'keyboardBinder' object for direct access (e.g., keyboardBinder.shift)
      for (let keyName in _modifierMappings) {
        if (_modifierMappings[keyName] === processedKeyCode) {
          keyboardBinder[keyName] = true;
        }
      }
      return;
    }

    // Check if the input should be ignored (e.g., in text fields)
    if (!keyboardBinder.isInputAllowed.call(this, event)) {
      return;
    }

    // Abort if no shortcuts are registered for this key code.
    if (!_shortcutHandlers[processedKeyCode] || _shortcutHandlers[processedKeyCode].length === 0) {
      return;
    }

    // Iterate through potential shortcut bindings for this key code.
    for (let i = 0; i < _shortcutHandlers[processedKeyCode].length; i++) {
      const boundAction = _shortcutHandlers[processedKeyCode][i];

      // Check if the binding applies to the current scope.
      const isScopeMatch = (boundAction.scope === _currentScope || boundAction.scope === 'all');
      if (!isScopeMatch) {
        continue;
      }

      // Determine if modifier keys match the binding's requirements.
      let modKeysMatch = true;

      // Case 1: Binding requires specific modifiers.
      if (boundAction.mods.length > 0) {
        // Check if all required modifiers are pressed AND no extra modifiers are pressed.
        const allRequiredModsPressed = boundAction.mods.every(modCode => _modifierState[modCode]);
        const noExtraModsPressed = Object.keys(_modifierState).every(modCodeStr => {
          const modCode = parseInt(modCodeStr, 10);
          return !_modifierState[modCode] || getArrayItemIndex(boundAction.mods, modCode) > -1;
        });
        modKeysMatch = allRequiredModsPressed && noExtraModsPressed;
      } else {
        // Case 2: Binding requires NO modifiers.
        // Ensure no modifier keys are currently pressed.
        modKeysMatch = Object.values(_modifierState).every(state => !state);
      }

      // If modifiers match, execute the handler.
      if (modKeysMatch) {
        // Execute the bound method. If it returns false, prevent default and stop propagation.
        if (boundAction.method(event, boundAction) === false) {
          preventAndStopEvent(event);
        }
      }
    }
  }

  /**
   * Resets modifier key state when a key is released.
   * @param {Event} event The keyup event object.
   */
  function resetModifierOnKeyUp(event) {
    let processedKeyCode = normalizeCommandKeyCode(event.keyCode);

    if (processedKeyCode in _modifierState) {
      _modifierState[processedKeyCode] = false;
      // Also update the 'keyboardBinder' object for direct access
      for (let keyName in _modifierMappings) {
        if (_modifierMappings[keyName] === processedKeyCode) {
          keyboardBinder[keyName] = false;
        }
      }
    }
  }

  /**
   * Clears the state of all modifier keys. Typically called on window focus.
   */
  function clearAllModifierStates() {
    for (let keyIdentifier in _modifierState) {
      _modifierState[keyIdentifier] = false;
    }
    for (let keyName in _modifierMappings) {
      keyboardBinder[keyName] = false;
    }
  }

  // --- Core Functionality ---

  /**
   * Registers a keyboard shortcut.
   * @param {string} shortcutString The shortcut string (e.g., 'ctrl+a', 'shift+enter,alt+f').
   * @param {string} [scope='all'] The scope for this shortcut.
   * @param {Function} callback The function to execute when the shortcut is pressed.
   */
  function defineShortcut(shortcutString, scope, callback) {
    // Handle optional 'scope' argument.
    if (typeof scope === 'function' && callback === undefined) {
      callback = scope;
      scope = 'all';
    }

    // Basic validation.
    if (typeof callback !== 'function') {
      console.error("Shortcut definition requires a callback function.", shortcutString);
      return;
    }
    if (typeof shortcutString !== 'string' || shortcutString.trim() === '') {
      console.error("Shortcut string must be a non-empty string.", shortcutString);
      return;
    }

    // Normalize and split the shortcut string into individual key combinations.
    const individualShortcuts = shortcutString.replace(/\s/g, '').split(',').filter(Boolean); // Remove empty strings from split

    for (let loopIdx = 0; loopIdx < individualShortcuts.length; loopIdx++) {
      let currentShortcut = individualShortcuts[loopIdx];
      let activeModifiers = [];

      // Split key combination by '+' to separate modifiers from the main key.
      const keyParts = currentShortcut.split('+');
      let mainKey = keyParts[keyParts.length - 1]; // The last part is always the main key

      // Extract modifiers if present.
      if (keyParts.length > 1) {
        const rawModifiers = keyParts.slice(0, keyParts.length - 1);
        activeModifiers = rawModifiers.map(mod => {
          const modCode = _modifierMappings[mod.toLowerCase()]; // Convert modifier name to key code
          if (modCode === undefined) {
            console.warn(`Unknown modifier key: "${mod}" in shortcut "${currentShortcut}"`);
          }
          return modCode;
        }).filter(code => code !== undefined); // Filter out any undefined codes
      }

      // Convert main key to its key code.
      let finalKeyCode;
      if (_specialKeyCodesMap[mainKey.toLowerCase()]) {
        finalKeyCode = _specialKeyCodesMap[mainKey.toLowerCase()];
      } else if (mainKey.length === 1) {
        finalKeyCode = mainKey.toUpperCase().charCodeAt(0);
      } else {
        console.warn(`Unknown key or invalid format in shortcut: "${mainKey}" for "${currentShortcut}"`);
        continue; // Skip this invalid shortcut
      }

      // Ensure an array exists for this key code in handlers.
      if (!_shortcutHandlers[finalKeyCode]) {
        _shortcutHandlers[finalKeyCode] = [];
      }

      // Store the handler details.
      _shortcutHandlers[finalKeyCode].push({
        fullShortcut: currentShortcut,
        scope: scope,
        method: callback,
        keyCode: finalKeyCode,
        mods: activeModifiers
      });
    }
  }

  /**
   * Determines if keyboard input should be processed, or ignored (e.g., in input fields).
   * @param {Event} event The DOM event object.
   * @returns {boolean} True if input should be processed, false otherwise.
   */
  function isInputAllowed(event) {
    const targetElement = event.target || event.srcElement; // Cross-browser target acquisition
    if (!targetElement || !targetElement.nodeName) {
      return true; // If no target or nodeName, assume it's okay to process.
    }
    const elementTag = targetElement.nodeName.toUpperCase();
    return !IGNORED_INPUT_TAGS.has(elementTag);
  }

  /**
   * Sets the currently active shortcut scope.
   * @param {string} newScope The scope to activate. Defaults to 'all'.
   */
  function setActiveScope(newScope) {
    _currentScope = newScope || 'all';
  }

  /**
   * Gets the currently active shortcut scope.
   * @returns {string} The active scope.
   */
  function getActiveScope() {
    return _currentScope || 'all';
  }

  /**
   * Removes all shortcut bindings associated with a specific scope.
   * @param {string} scopeToDelete The scope whose bindings should be removed.
   */
  function removeScopeBindings(scopeToDelete) {
    if (!scopeToDelete) {
      console.warn("Cannot remove bindings for an undefined scope.");
      return;
    }

    Object.keys(_shortcutHandlers).forEach(keyCode => {
      const handlersForKey = _shortcutHandlers[keyCode];
      // Filter out handlers that match the scopeToDelete.
      _shortcutHandlers[keyCode] = handlersForKey.filter(
        binding => binding.scope !== scopeToDelete
      );
      // Clean up empty arrays if no handlers remain for a key.
      if (_shortcutHandlers[keyCode].length === 0) {
        delete _shortcutHandlers[keyCode];
      }
    });
  }

  // --- DOM Event Registration ---

  /**
   * Cross-browser utility to attach an event listener to a DOM object.
   * @param {EventTarget} targetObject The DOM object to attach the event to (e.g., document, window).
   * @param {string} eventName The name of the event (e.g., 'keydown').
   * @param {Function} handlerFunction The function to call when the event fires.
   */
  function registerDOMEvent(targetObject, eventName, handlerFunction) {
    if (!targetObject) {
      console.warn(`Attempted to register event on null/undefined object for event: ${eventName}`);
      return;
    }
    if (targetObject.addEventListener) {
      targetObject.addEventListener(eventName, handlerFunction, false);
    } else if (targetObject.attachEvent) {
      // IE compatibility: 'this' context is window, so pass window.event explicitly
      targetObject.attachEvent('on' + eventName, function() { handlerFunction.call(targetObject, window.event); });
    }
  }

  // --- Initialization ---

  // Attach global event listeners.
  registerDOMEvent(document, EVENT_TYPES.KEY_DOWN, handleKeyboardInput);
  registerDOMEvent(document, EVENT_TYPES.KEY_UP, resetModifierOnKeyUp);
  registerDOMEvent(window, EVENT_TYPES.FOCUS, clearAllModifierStates);

  // Initialize the main exported object.
  keyboardBinder = defineShortcut; // The primary function is to define shortcuts
  keyboardBinder.version = '1.1.0-clone';

  // Expose modifier key states as properties on the main object.
  Object.keys(_modifierMappings).forEach(keyName => {
    keyboardBinder[keyName] = false; // Initialize all modifier states to false
  });

  // Expose other functionalities.
  keyboardBinder.setContext = setActiveScope;
  keyboardBinder.getContext = getActiveScope;
  keyboardBinder.removeContextBindings = removeScopeBindings;
  keyboardBinder.isInputAllowed = isInputAllowed; // Default filter function

  // Make the keyboardBinder accessible globally.
  root.keyboardBinder = keyboardBinder;

  // Provide CommonJS support for environments like Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = keyboardBinder;
  }

})(this);