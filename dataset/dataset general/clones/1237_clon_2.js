;(function(rootObject) {
  var loopVar,
    _keyCallbacks = {},
    _activeModifiers = { 16: false, 18: false, 17: false, 91: false },
    _currentContext = 'all',
    // Defines numerical codes for modifier keys
    _modifierCodes = {
      '⇧': 16, shift: 16,
      '⌥': 18, alt: 18, option: 18,
      '⌃': 17, ctrl: 17, control: 17,
      '⌘': 91, command: 91
    },
    // Maps common special key names to their respective key codes
    _specialKeyCodes = {
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

  for (loopVar = 1; loopVar < 20; loopVar++)
    _modifierCodes['f' + loopVar] = 111 + loopVar;

  // Custom array search function due to legacy browser compatibility.
  function findInArray(targetArray, searchElement) {
    var arrayIndex = targetArray.length;
    while (arrayIndex--)
      if (targetArray[arrayIndex] === searchElement) return arrayIndex;
    return -1;
  }

  // Processes key press events.
  function processKeyDown(keyboardEvent) {
    var pressedKey, callbackEntry, modKey, callbackIndex, areModifiersAligned;
    pressedKey = keyboardEvent.keyCode;

    // If a modifier key is pressed, update its state and exit.
    if (pressedKey === 93 || pressedKey === 224)
      pressedKey = 91; // Normalizes different command key codes across browsers.
    if (pressedKey in _activeModifiers) {
      _activeModifiers[pressedKey] = true;
      // The public interface object's modifier property is also updated.
      for (modKey in _modifierCodes)
        if (_modifierCodes[modKey] === pressedKey) registerKeyInput[modKey] = true;
      return;
    }

    // Determine if this key event should be ignored.
    // By default, events in input fields, textareas, or selects are skipped.
    if (!registerKeyInput.ignoreEvent.call(this, keyboardEvent)) return;

    // Exit if no registered callbacks for this key.
    if (!(pressedKey in _keyCallbacks)) return;

    // Iterate through all registered callbacks for the pressed key.
    for (callbackIndex = 0; callbackIndex < _keyCallbacks[pressedKey].length; callbackIndex++) {
      callbackEntry = _keyCallbacks[pressedKey][callbackIndex];

      // Check if the callback is relevant to the active context.
      if (callbackEntry.context === _currentContext || callbackEntry.context === 'all') {
        // Verify if the modifier keys match the callback's requirements.
        areModifiersAligned = callbackEntry.modifiers.length > 0;
        for (modKey in _activeModifiers)
          if ((!_activeModifiers[modKey] && findInArray(callbackEntry.modifiers, +modKey) > -1) ||
            (_activeModifiers[modKey] && findInArray(callbackEntry.modifiers, +modKey) === -1))
            areModifiersAligned = false;
        // Execute the callback if modifier conditions are met, preventing default if needed.
        if ((callbackEntry.modifiers.length === 0 && !_activeModifiers[16] && !_activeModifiers[18] && !_activeModifiers[17] && !_activeModifiers[91]) || areModifiersAligned) {
          if (callbackEntry.action(keyboardEvent, callbackEntry) === false) {
            if (keyboardEvent.preventDefault) keyboardEvent.preventDefault();
            else keyboardEvent.returnValue = false;
            if (keyboardEvent.stopPropagation) keyboardEvent.stopPropagation();
            if (keyboardEvent.cancelBubble) keyboardEvent.cancelBubble = true;
          }
        }
      }
    }
  }

  // Resets the state of modifier keys upon key release.
  function releaseModifier(keyUpEvent) {
    var releasedKeyCode = keyUpEvent.keyCode, modifierAlias;
    if (releasedKeyCode === 93 || releasedKeyCode === 224) releasedKeyCode = 91;
    if (releasedKeyCode in _activeModifiers) {
      _activeModifiers[releasedKeyCode] = false;
      for (modifierAlias in _modifierCodes)
        if (_modifierCodes[modifierAlias] === releasedKeyCode) registerKeyInput[modifierAlias] = false;
    }
  }

  function clearAllModifiers() {
    for (loopVar in _activeModifiers) _activeModifiers[loopVar] = false;
    for (loopVar in _modifierCodes) registerKeyInput[loopVar] = false;
  }

  // Parses a key combination string and registers a callback.
  function registerKeyInput(keyCombinationString, contextIdentifier, callbackFunction) {
    var comboParts, modifierList, partIndex, modifierIndex;
    if (callbackFunction === undefined) {
      callbackFunction = contextIdentifier;
      contextIdentifier = 'all';
    }
    keyCombinationString = keyCombinationString.replace(/\s/g, '');
    comboParts = keyCombinationString.split(',');

    if ((comboParts[comboParts.length - 1]) === '')
      comboParts[comboParts.length - 2] += ',';
    // Process each individual shortcut definition.
    for (partIndex = 0; partIndex < comboParts.length; partIndex++) {
      // Extract modifier keys if present.
      modifierList = [];
      keyCombinationString = comboParts[partIndex].split('+');
      if (keyCombinationString.length > 1) {
        modifierList = keyCombinationString.slice(0, keyCombinationString.length - 1);
        for (modifierIndex = 0; modifierIndex < modifierList.length; modifierIndex++)
          modifierList[modifierIndex] = _modifierCodes[modifierList[modifierIndex]];
        keyCombinationString = [keyCombinationString[keyCombinationString.length - 1]];
      }
      // Convert the key string to its corresponding key code.
      keyCombinationString = keyCombinationString[0];
      keyCombinationString = _specialKeyCodes[keyCombinationString] || keyCombinationString.toUpperCase().charCodeAt(0);
      // Store the new callback details.
      if (!(keyCombinationString in _keyCallbacks)) _keyCallbacks[keyCombinationString] = [];
      _keyCallbacks[keyCombinationString].push({ definedCombo: comboParts[partIndex], context: contextIdentifier, action: callbackFunction, triggerKey: comboParts[partIndex], modifiers: modifierList });
    }
  }

  function ignoreEvent(domEvent) {
    var elementTag = (domEvent.target || domEvent.srcElement).tagName;
    // Prevents processing key events if they originate from typical input elements.
    return !(elementTag === 'INPUT' || elementTag === 'SELECT' || elementTag === 'TEXTAREA');
  }

  // Initialize the public modifier state properties to false.
  for (loopVar in _modifierCodes) registerKeyInput[loopVar] = false;

  // Defines the currently active context for keybindings.
  function setKeyContext(newContext) {
    _currentContext = newContext || 'all';
  }

  function getKeyContext() {
    return _currentContext || 'all';
  }

  // Removes all registered keybindings for a specific context.
  function removeKeyContext(contextToDelete) {
    var keyCodeIter, callbackArray, callbackIdx;

    for (keyCodeIter in _keyCallbacks) {
      callbackArray = _keyCallbacks[keyCodeIter];
      for (callbackIdx = 0; callbackIdx < callbackArray.length;) {
        if (callbackArray[callbackIdx].context === contextToDelete) callbackArray.splice(callbackIdx, 1);
        else callbackIdx++;
      }
    }
  }

  // Utility for attaching browser events.
  function attachDomEvent(targetObject, eventName, callbackFunction) {
    if (targetObject.addEventListener)
      targetObject.addEventListener(eventName, callbackFunction, false);
    else if (targetObject.attachEvent)
      targetObject.attachEvent('on' + eventName, function() {
        callbackFunction(window.event);
      });
  }

  // Establish global event listeners on the document.
  attachDomEvent(document, 'keydown', processKeyDown);
  attachDomEvent(document, 'keyup', releaseModifier);

  // Ensure modifier states are reset when the window regains focus.
  attachDomEvent(window, 'focus', clearAllModifiers);

  // Expose the API to the global object, including context management and event filtering.
  rootObject.keyboard = registerKeyInput;
  rootObject.keyboard.setKeyContext = setKeyContext;
  rootObject.keyboard.getKeyContext = getKeyContext;
  rootObject.keyboard.removeKeyContext = removeKeyContext;
  rootObject.keyboard.ignoreEvent = ignoreEvent;

  if (typeof module !== 'undefined' && module.exports) module.exports = rootObject.keyboard;

})(this);