var KeySense = function(targetElement) {
  // If no specific element is provided, default to the entire document object.
  // This ensures a global listener if no specific scope is given.
  this.boundElement = targetElement || window.document;
  // Initialize the internal state and attach event listeners.
  this.setupInputMonitoring();
};

// --- Static Properties and Utility Methods for KeySense ---

// A comprehensive mapping from standard keyboard event `keyCode` values to descriptive string names.
// This aids in human-readable key combination definitions.
KeySense.CODE_TO_NAME_MAP = {
  8: 'backspace', 9: 'tab', 13: 'enter',
  16: 'shift', 17: 'ctrl', 18: 'alt',
  20: 'caps_lock',
  27: 'escape', // Renamed from 'esc' for better clarity
  32: 'spacebar', // Renamed from 'space'
  33: 'page_up', 34: 'page_down',
  35: 'end', 36: 'home',
  37: 'arrow_left', 38: 'arrow_up', 39: 'arrow_right', 40: 'arrow_down', // Renamed for consistency
  45: 'insert', 46: 'delete',
  48: 'digit_0', 49: 'digit_1', 50: 'digit_2', 51: 'digit_3', 52: 'digit_4', 53: 'digit_5', 54: 'digit_6', 55: 'digit_7', 56: 'digit_8', 57: 'digit_9', // Renamed to denote digits
  65: 'key_a', 66: 'key_b', 67: 'key_c', 68: 'key_d', 69: 'key_e', 70: 'key_f', 71: 'key_g', 72: 'key_h', 73: 'key_i', 74: 'key_j', 75: 'key_k', 76: 'key_l', 77: 'key_m', 78: 'key_n', 79: 'key_o', 80: 'key_p', 81: 'key_q', 82: 'key_r', 83: 'key_s', 84: 'key_t', 85: 'key_u', 86: 'key_v', 87: 'key_w', 88: 'key_x', 89: 'key_y', 90: 'key_z', // Renamed to denote letter keys
  112: 'f1', 113: 'f2', 114: 'f3', 115: 'f4', 116: 'f5', 117: 'f6', 118: 'f7', 119: 'f8', 120: 'f9', 121: 'f10', 122: 'f11', 123: 'f12',
  144: 'num_lock'
};

// A reverse mapping from key name strings to their corresponding `keyCode` values.
// Populated immediately after `CODE_TO_NAME_MAP` is defined.
KeySense.NAME_TO_CODE_MAP = {};
(function() {
  // Iterates through the CODE_TO_NAME_MAP to create the inverted lookup.
  for (const keyCodeString in KeySense.CODE_TO_NAME_MAP) {
    // Ensures only direct properties are processed.
    if (Object.prototype.hasOwnProperty.call(KeySense.CODE_TO_NAME_MAP, keyCodeString)) {
      const keyName = KeySense.CODE_TO_NAME_MAP[keyCodeString];
      // Convert the string key code back to a number using the unary plus operator.
      KeySense.NAME_TO_CODE_MAP[keyName] = +keyCodeString;
    }
  }
})();

// An array of recognized modifier key names. Used for parsing key combinations.
KeySense.MODIFIER_KEYS = ['shift', 'ctrl', 'alt'];

// Defines categories for groups of keys that can be treated as wildcards (e.g., "any arrow_keys").
KeySense.SPECIAL_GROUP_NAMES = ['arrow_keys', 'numeric_digits', 'alpha_letters', 'function_keys'];

// Maps each special group name to an array of its constituent key codes.
KeySense.SPECIAL_GROUPS_MAP = {
  arrow_keys: [37, 38, 39, 40],
  numeric_digits: [48, 49, 50, 51, 52, 53, 54, 55, 56, 57],
  alpha_letters: [65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90],
  function_keys: [112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123]
};

// Provides a cross-browser method for attaching event listeners.
KeySense.attachEventHandler = (function() {
  if (document.addEventListener) {
    // For modern browsers supporting W3C standard.
    return function(elementRef, eventIdentifier, callbackFunction) {
      elementRef.addEventListener(eventIdentifier, callbackFunction, false);
    };
  } else if (document.attachEvent) {
    // For older Internet Explorer versions.
    return function(elementRef, eventIdentifier, callbackFunction) {
      elementRef.attachEvent('on' + eventIdentifier, callbackFunction);
    };
  } else {
    // Fallback for very old or non-standard environments, less reliable.
    return function(elementRef, eventIdentifier, callbackFunction) {
      elementRef['on' + eventIdentifier] = callbackFunction;
    };
  }
})();

// Provides a cross-browser method for detaching event listeners.
KeySense.detachEventHandler = (function() {
  if (document.removeEventListener) {
    // For modern browsers supporting W3C standard.
    return function(elementRef, eventIdentifier, callbackFunction) {
      elementRef.removeEventListener(eventIdentifier, callbackFunction, false);
    };
  } else if (document.detachEvent) {
    // For older Internet Explorer versions.
    return function(elementRef, eventIdentifier, callbackFunction) {
      elementRef.detachEvent('on' + eventIdentifier, callbackFunction);
    };
  } else {
    // Fallback for very old or non-standard environments.
    return function(elementRef, eventIdentifier, callbackFunction) {
      // Attempt to clear the handler, but this might not work reliably if multiple handlers were assigned.
      if (elementRef['on' + eventIdentifier] === callbackFunction) {
        elementRef['on' + eventIdentifier] = null;
      }
    };
  }
})();

/**
 * Checks if a larger string contains a smaller substring.
 * Uses modern `String.prototype.includes` for efficiency.
 * @param {string} enclosingString The string to search within.
 * @param {string} containedString The substring to look for.
 * @returns {boolean} True if `containedString` is found, false otherwise.
 */
KeySense.hasSubstring = function(enclosingString, containedString) {
  return enclosingString.includes(containedString);
};

/**
 * Cleans up a string by removing redundant whitespace:
 * trims leading/trailing spaces and replaces multiple internal spaces with a single space.
 * @param {string} inputString The string to be processed.
 * @returns {string} The normalized string.
 */
KeySense.normalizeStringWhitespace = function(inputString) {
  // Uses trim() first, then a regex to collapse multiple spaces.
  return inputString.trim().replace(/\s{2,}/g, ' ');
};

/**
 * Capitalizes the first letter of a given string and converts the rest to lowercase.
 * Includes a guard clause for empty input.
 * @param {string} inputString The string to capitalize.
 * @returns {string} The string with its first letter capitalized.
 */
KeySense.capitalizeFirstLetter = function(inputString) {
  if (!inputString) {
    return ''; // Return empty string for empty input.
  }
  return inputString.charAt(0).toUpperCase() + inputString.slice(1).toLowerCase();
};

/**
 * Determines if a given value is of type string.
 * Uses a robust check for both primitive strings and String objects.
 * @param {*} valueToTest The value to check.
 * @returns {boolean} True if the value is a string, false otherwise.
 */
KeySense.isStringValue = function(valueToTest) {
  return typeof valueToTest === 'string' || valueToTest instanceof String;
};

/**
 * Checks if an array (collection) includes a specific item.
 * Utilizes `Array.prototype.includes` for modern environments, with a fallback for older ones.
 * @param {Array} targetCollection The array to search within.
 * @param {*} searchItem The item to find.
 * @returns {boolean} True if `searchItem` is found in `targetCollection`, false otherwise.
 */
KeySense.containsItem = (function() {
  if (Array.prototype.includes) {
    return function(targetCollection, searchItem) {
      return targetCollection.includes(searchItem);
    };
  } else {
    // Manual loop for environments without Array.prototype.includes.
    return function(targetCollection, searchItem) {
      for (let k = 0; k < targetCollection.length; k++) {
        if (targetCollection[k] === searchItem) {
          return true;
        }
      }
      return false;
    };
  }
})();

/**
 * Extracts all recognized modifier key tokens (shift, ctrl, alt) from a raw key combination string.
 * @param {string} rawKeyCombination The input string (e.g., "ctrl+shift+a").
 * @returns {Array<string>} An array containing the names of any detected modifier keys.
 */
KeySense.extractModifierTokens = function(rawKeyCombination) {
  const detectedModifiers = [];
  // Iterate through the predefined list of modifier keys.
  for (const modifier of KeySense.MODIFIER_KEYS) {
    if (KeySense.hasSubstring(rawKeyCombination, modifier)) {
      detectedModifiers.push(modifier);
    }
  }
  return detectedModifiers;
};

/**
 * Identifies and returns the primary non-modifier key token from a key combination string.
 * It expects tokens to be space-separated after normalization.
 * @param {string} rawKeyCombination The input string.
 * @returns {string|undefined} The main key's name, or `undefined` if only modifiers are present.
 */
KeySense.extractMainKeyToken = function(rawKeyCombination) {
  const normalizedTokens = KeySense.normalizeStringWhitespace(rawKeyCombination).split(' ');
  // Finds the first token that is not a known modifier.
  for (const token of normalizedTokens) {
    if (!KeySense.containsItem(KeySense.MODIFIER_KEYS, token)) {
      return token;
    }
  }
  // If no non-modifier token is found, explicitly return undefined.
  return undefined;
};

/**
 * Formats a raw key combination string into a standardized, space-separated string
 * of modifiers and the main key, suitable for internal lookup.
 * Special handling for 'any' wildcard combinations.
 * @param {string} rawKeyCombination The user-provided key combination string.
 * @returns {string} The normalized key combination string.
 */
KeySense.formatKeyCombination = function(rawKeyCombination) {
  const comboAsString = String(rawKeyCombination); // Ensure string type for operations.

  // Special case for 'any' key or 'any' wildcard group.
  if (KeySense.hasSubstring(comboAsString, 'any')) {
    const tokens = KeySense.normalizeStringWhitespace(comboAsString).split(' ');
    // If 'any' is followed by a known special group name, combine them.
    if (tokens.length > 1 && KeySense.containsItem(KeySense.SPECIAL_GROUP_NAMES, tokens[1])) {
      return `${tokens[0]} ${tokens[1]}`;
    }
    return 'any'; // Default for just 'any'.
  }

  const foundModifiers = KeySense.extractModifierTokens(comboAsString);
  const mainKey = KeySense.extractMainKeyToken(comboAsString);

  // Add the main key to the list if it exists and is not already a modifier.
  if (mainKey && !KeySense.containsItem(foundModifiers, mainKey)) {
    foundModifiers.push(mainKey);
  }

  // Sort the parts for consistent string representation (e.g., "alt ctrl a" vs "ctrl alt a").
  foundModifiers.sort();

  return KeySense.normalizeStringWhitespace(foundModifiers.join(' '));
};

/**
 * Retrieves the string name of a key given its numeric key code.
 * @param {number} keyCodeValue The `keyCode` from a keyboard event.
 * @returns {string|undefined} The key's name, or `undefined` if not mapped.
 */
KeySense.getKeyNameByCode = function(keyCodeValue) {
  // Convert number to string for object property lookup.
  return KeySense.CODE_TO_NAME_MAP[String(keyCodeValue)];
};

/**
 * Retrieves the numeric key code of a key given its string name.
 * @param {string} keyNameString The descriptive name of the key (e.g., 'enter').
 * @returns {number|undefined} The key's `keyCode`, or `undefined` if not mapped.
 */
KeySense.getKeyCodeByName = function(keyNameString) {
  // Use unary plus to ensure the returned value is a number.
  return +KeySense.NAME_TO_CODE_MAP[keyNameString];
};

// --- KeySense Prototype Methods ---

KeySense.prototype.setupInputMonitoring = function() {
  // Validate that the bound element is a valid event target.
  if (!this.boundElement || typeof this.boundElement.addEventListener !== 'function' && typeof this.boundElement.attachEvent !== 'function') {
    console.warn("KeySense initialized with an invalid or non-event-target element. Input monitoring may not function correctly.", this.boundElement);
    // Early exit if the element is not suitable for event listening.
    return;
  }

  // Stores the `keyCode` of the most recently detected key event.
  this.lastDetectedKeyCode = -1;
  // An object to maintain the current pressed state of modifier keys (e.g., { shift: true, ctrl: false }).
  this.currentModifierStates = {};
  // Initialize all modifier states to `false`.
  for (const modifier of KeySense.MODIFIER_KEYS) {
    this.currentModifierStates[modifier] = false;
  }

  // Objects to store arrays of callback functions, categorized by key combination.
  // `keyDownCallbacks` for key press events.
  this.keyDownCallbacks = {
    any: [] // Callbacks for *any* keydown event.
  };
  // `keyUpCallbacks` for key release events.
  this.keyUpCallbacks = {
    any: [] // Callbacks for *any* keyup event.
  };

  // Pre-populate arrays for wildcard group callbacks (e.g., 'any arrow_keys').
  for (const groupName of KeySense.SPECIAL_GROUP_NAMES) {
    this.keyDownCallbacks[`any ${groupName}`] = [];
    this.keyUpCallbacks[`any ${groupName}`] = [];
  }

  // Create event handlers, binding them to the current `KeySense` instance (`this`).
  this.boundKeyDownHandler = this.generateEventHandler('down').bind(this);
  this.boundKeyUpHandler = this.generateEventHandler('up').bind(this);

  // Attach the generated handlers to the `boundElement` for 'keydown' and 'keyup' events.
  KeySense.attachEventHandler(this.boundElement, 'keydown', this.boundKeyDownHandler);
  KeySense.attachEventHandler(this.boundElement, 'keyup', this.boundKeyUpHandler);

  // Define a cleanup function to remove event listeners upon window unload.
  // This helps prevent memory leaks, especially in older browser environments.
  const instanceReference = this; // Capture `this` for the closure.
  const cleanupOnWindowUnload = function() {
    KeySense.detachEventHandler(instanceReference.boundElement, 'keydown', instanceReference.boundKeyDownHandler);
    KeySense.detachEventHandler(instanceReference.boundElement, 'keyup', instanceReference.boundKeyUpHandler);
    KeySense.detachEventHandler(window, 'unload', cleanupOnWindowUnload); // Detach itself to fully clean up.
  };
  // Attach the cleanup function to the window's 'unload' event.
  KeySense.attachEventHandler(window, 'unload', cleanupOnWindowUnload);
};

/**
 * Generates a generic event handler function for either 'keydown' or 'keyup' events.
 * This function processes the event, updates internal state, and dispatches registered callbacks.
 * @param {'down'|'up'} eventType A string indicating whether the handler is for keydown or keyup.
 * @returns {Function} The event handler function.
 */
KeySense.prototype.generateEventHandler = function(eventType) {
  const instanceContext = this; // Store `this` to ensure correct context within the returned closure.

  return function(domEvent) {
    // Normalize the event object for cross-browser compatibility.
    domEvent = domEvent || window.event;

    // Update the `lastDetectedKeyCode` with the current event's key code.
    instanceContext.lastDetectedKeyCode = domEvent.keyCode;

    // Update the state of all modifier keys based on the event object's properties.
    for (const modifier of KeySense.MODIFIER_KEYS) {
      instanceContext.currentModifierStates[modifier] = domEvent[`${modifier}Key`];
    }
    // Additionally, if the pressed key itself is a modifier, explicitly mark its state as true.
    const currentPressedKeyName = KeySense.getKeyNameByCode(instanceContext.lastDetectedKeyCode);
    if (KeySense.containsItem(KeySense.MODIFIER_KEYS, currentPressedKeyName)) {
      instanceContext.currentModifierStates[currentPressedKeyName] = true;
    }

    // Select the appropriate callback registry (keyDownCallbacks or keyUpCallbacks).
    const currentCallbacksRegistry = (eventType === 'down') ? instanceContext.keyDownCallbacks : instanceContext.keyUpCallbacks;
    // Cache the presence of `preventDefault` method for efficiency within loops.
    const canPreventDefault = !!domEvent.preventDefault;

    // 1. Execute callbacks registered for 'any' key event.
    for (const callback of currentCallbacksRegistry.any) {
      if (callback(domEvent) === false && canPreventDefault) {
        domEvent.preventDefault();
      }
    }

    // 2. Execute callbacks for special wildcard groups (e.g., 'any arrow_keys').
    for (const groupName of KeySense.SPECIAL_GROUP_NAMES) {
      const keyCodesInGroup = KeySense.SPECIAL_GROUPS_MAP[groupName];
      // Check if the current pressed key belongs to this wildcard group.
      if (KeySense.containsItem(keyCodesInGroup, instanceContext.lastDetectedKeyCode)) {
        const groupSpecificCallbacks = currentCallbacksRegistry[`any ${groupName}`];
        for (const callback of groupSpecificCallbacks) {
          if (callback(domEvent) === false && canPreventDefault) {
            domEvent.preventDefault();
          }
        }
      }
    }

    // 3. Execute callbacks for specific key combinations.
    const normalizedLastKeyCombo = instanceContext.getNormalizedLastKeyCombination();
    const specificKeyCallbacks = currentCallbacksRegistry[normalizedLastKeyCombo];
    // Only proceed if callbacks are registered for this specific combination and the array is not empty.
    if (specificKeyCallbacks && specificKeyCallbacks.length > 0) {
      for (const callback of specificKeyCallbacks) {
        if (callback(domEvent) === false && canPreventDefault) {
          domEvent.preventDefault();
        }
      }
    }
  };
};

/**
 * Registers one or more callback functions to be executed when specific key combinations occur.
 * @param {'down'|'up'} eventType The type of keyboard event ('down' for keydown, 'up' for keyup).
 * @param {string|Array<string>} keyCombinations A single string or an array of strings representing the key combination(s).
 * @param {Function} callbackFunction The function to invoke when the key combination is detected.
 * @returns {KeySense} The current `KeySense` instance, allowing method chaining.
 */
KeySense.prototype.addKeyBinding = function(eventType, keyCombinations, callbackFunction) {
  // Determine which registry (keyDownCallbacks or keyUpCallbacks) to modify.
  const targetRegistry = (eventType === 'down') ? this.keyDownCallbacks : this.keyUpCallbacks;

  // Ensure `keyCombinations` is an array for consistent iteration.
  const comboInputArray = KeySense.isStringValue(keyCombinations) ? [keyCombinations] : keyCombinations;

  for (const rawComboString of comboInputArray) {
    // Normalize the combination string for consistent storage and lookup.
    const formattedComboString = KeySense.formatKeyCombination(rawComboString);

    // If no callbacks are yet registered for this combination, initialize an empty array.
    if (!targetRegistry[formattedComboString]) {
      targetRegistry[formattedComboString] = [];
    }
    // Add the new callback function to the array.
    targetRegistry[formattedComboString].push(callbackFunction);
  }

  return this;
};

/**
 * Unregisters one or more callback functions for specific key combinations.
 * If `callbackFunction` is `null`, all callbacks for the given key combination(s) are removed.
 * @param {'down'|'up'} eventType The type of keyboard event.
 * @param {string|Array<string>} keyCombinations The key combination(s) to unregister.
 * @param {Function|null} callbackFunction The specific function to remove, or `null` to remove all.
 * @returns {KeySense} The current `KeySense` instance, allowing method chaining.
 */
KeySense.prototype.removeKeyBinding = function(eventType, keyCombinations, callbackFunction) {
  const targetRegistry = (eventType === 'down') ? this.keyDownCallbacks : this.keyUpCallbacks;

  const comboInputArray = KeySense.isStringValue(keyCombinations) ? [keyCombinations] : keyCombinations;

  for (const rawComboString of comboInputArray) {
    const formattedComboString = KeySense.formatKeyCombination(rawComboString);

    // If no callbacks are registered for this combination, there's nothing to remove.
    if (!targetRegistry[formattedComboString]) {
      continue;
    }

    if (callbackFunction === null) {
      // If `callbackFunction` is null, delete all bindings for this specific combination.
      delete targetRegistry[formattedComboString];
    } else {
      // Otherwise, filter out the specific callback function.
      // Uses string comparison of function bodies, similar to the original logic, for removal.
      targetRegistry[formattedComboString] = targetRegistry[formattedComboString].filter(
        (registeredFn) => String(registeredFn) !== String(callbackFunction)
      );

      // If, after filtering, no callbacks remain for this combination, remove the empty array.
      if (targetRegistry[formattedComboString].length === 0) {
        delete targetRegistry[formattedComboString];
      }
    }
  }

  return this;
};

/**
 * A convenience method that delegates to either `addKeyBinding` or `removeKeyBinding`
 * based on whether a `handlerFunction` is provided.
 * @param {'down'|'up'} eventType The type of event.
 * @param {string|Array<string>} combinations The key combination(s).
 * @param {Function|null} handlerFunction The function to add, or `null` to remove.
 * @returns {KeySense} The current `KeySense` instance.
 */
KeySense.prototype.manageKeyBinding = function(eventType, combinations, handlerFunction) {
  return (handlerFunction !== null) ?
    this.addKeyBinding(eventType, combinations, handlerFunction) :
    this.removeKeyBinding(eventType, combinations, handlerFunction);
};

/**
 * Registers or unregisters a callback for a keydown event.
 * @param {string|Array<string>} keyDefinitions The key combination(s).
 * @param {Function|null} handler The function to execute, or `null` to unregister.
 * @returns {KeySense} The current `KeySense` instance.
 */
KeySense.prototype.onKeyDown = function(keyDefinitions, handler) {
  return this.manageKeyBinding('down', keyDefinitions, handler);
};

/**
 * Registers or unregisters a callback for a keyup event.
 * @param {string|Array<string>} keyDefinitions The key combination(s).
 * @param {Function|null} handler The function to execute, or `null` to unregister.
 * @returns {KeySense} The current `KeySense` instance.
 */
KeySense.prototype.onKeyUp = function(keyDefinitions, handler) {
  return this.manageKeyBinding('up', keyDefinitions, handler);
};

/**
 * Retrieves information about the last key event.
 * If `modifierName` is provided, it returns the boolean state of that modifier.
 * Otherwise, it returns the string name of the last non-modifier key pressed.
 * @param {string} [modifierName] Optional: The name of a modifier key (e.g., 'shift', 'ctrl').
 * @returns {string|boolean} The key name or the modifier's boolean state.
 */
KeySense.prototype.getLastPressedKeyInfo = function(modifierName) {
  if (modifierName) {
    // Return the boolean state of the requested modifier, defaulting to false if not tracked.
    return this.currentModifierStates[modifierName] || false;
  }
  // Return the name of the last key identified by its key code.
  return KeySense.getKeyNameByCode(this.lastDetectedKeyCode);
};

/**
 * Generates a normalized string representation of the last detected key combination,
 * combining active modifiers and the main key.
 * @returns {string} The formatted string (e.g., "alt ctrl key_a").
 */
KeySense.prototype.getNormalizedLastKeyCombination = function() {
  const activeCombinationParts = [];

  // Add all currently active modifier keys to the combination parts.
  for (const modifier of KeySense.MODIFIER_KEYS) {
    if (this.currentModifierStates[modifier]) {
      activeCombinationParts.push(modifier);
    }
  }

  // Get the name of the last non-modifier key pressed.
  const mainPressedKey = this.getLastPressedKeyInfo();
  // Add the main key to the combination parts, ensuring it's not a duplicate of a modifier.
  if (mainPressedKey && !KeySense.containsItem(activeCombinationParts, mainPressedKey)) {
    activeCombinationParts.push(mainPressedKey);
  }

  // Sort the parts alphabetically to ensure a consistent string representation regardless of press order.
  activeCombinationParts.sort();

  // Return the space-separated, normalized string.
  return KeySense.normalizeStringWhitespace(activeCombinationParts.join(' '));
};