(function(globalRef) {
  const KEY_CODE_MAPPING = new Map();
  const MODIFIER_KEY_CODES = new Set([16, 18, 17, 91]); // Shift, Alt, Ctrl, Command
  const MODIFIER_CODE_TO_NAME = new Map([
    [16, 'shift'], [18, 'alt'], [17, 'ctrl'], [91, 'command']
  ]);

  // Populate KEY_CODE_MAPPING
  // Special keys
  KEY_CODE_MAPPING.set('backspace', 8); KEY_CODE_MAPPING.set('tab', 9); KEY_CODE_MAPPING.set('clear', 12);
  KEY_CODE_MAPPING.set('enter', 13); KEY_CODE_MAPPING.set('return', 13);
  KEY_CODE_MAPPING.set('esc', 27); KEY_CODE_MAPPING.set('escape', 27); KEY_CODE_MAPPING.set('space', 32);
  KEY_CODE_MAPPING.set('left', 37); KEY_CODE_MAPPING.set('up', 38); KEY_CODE_MAPPING.set('right', 39); KEY_CODE_MAPPING.set('down', 40);
  KEY_CODE_MAPPING.set('del', 46); KEY_CODE_MAPPING.set('delete', 46);
  KEY_CODE_MAPPING.set('home', 36); KEY_CODE_MAPPING.set('end', 35);
  KEY_CODE_MAPPING.set('pageup', 33); KEY_CODE_MAPPING.set('pagedown', 34);
  KEY_CODE_MAPPING.set(',', 188); KEY_CODE_MAPPING.set('.', 190); KEY_CODE_MAPPING.set('/', 191);
  KEY_CODE_MAPPING.set('`', 192); KEY_CODE_MAPPING.set('-', 189); KEY_CODE_MAPPING.set('=', 187);
  KEY_CODE_MAPPING.set(';', 186); KEY_CODE_MAPPING.set("'", 222);
  KEY_CODE_MAPPING.set('[', 219); KEY_CODE_MAPPING.set(']', 221); KEY_CODE_MAPPING.set('\\', 220);

  // Modifiers and their symbols
  KEY_CODE_MAPPING.set('shift', 16); KEY_CODE_MAPPING.set('⇧', 16);
  KEY_CODE_MAPPING.set('alt', 18); KEY_CODE_MAPPING.set('option', 18); KEY_CODE_MAPPING.set('⌥', 18);
  KEY_CODE_MAPPING.set('ctrl', 17); KEY_CODE_MAPPING.set('control', 17); KEY_CODE_MAPPING.set('⌃', 17);
  KEY_CODE_MAPPING.set('command', 91); KEY_CODE_MAPPING.set('⌘', 91);

  // Function keys
  for (let i = 1; i < 20; i++) {
    KEY_CODE_MAPPING.set(`f${i}`, 111 + i);
  }

  class KeyboardInputProcessor {
    constructor() {
      this._registeredHotkeys = []; // Array of { triggerCode, modifierCodesSet, context, handlerFunction, comboString }
      this._activeModifierCodes = new Set();
      this._currentOperatingContext = 'all';
      this._inputEligibilityCheck = this._defaultEligibilityCheck;

      // Expose modifier states (e.g., manager.shift)
      MODIFIER_KEY_CODES.forEach(code => {
        const modifierName = MODIFIER_CODE_TO_NAME.get(code);
        if (modifierName) {
          this[modifierName] = false;
        }
      });

      this._bindEvents();
    }

    _normalizeKeyCode(initialCode) {
      return (initialCode === 93 || initialCode === 224) ? 91 : initialCode;
    }

    _defaultEligibilityCheck(evt) {
      const targetTag = (evt.target || evt.srcElement).tagName;
      return !(['INPUT', 'SELECT', 'TEXTAREA'].includes(targetTag));
    }

    _updateModifierState(code, isActive) {
      const normalizedCode = this._normalizeKeyCode(code);
      if (MODIFIER_KEY_CODES.has(normalizedCode)) {
        if (isActive) {
          this._activeModifierCodes.add(normalizedCode);
        } else {
          this._activeModifierCodes.delete(normalizedCode);
        }
        const modifierName = MODIFIER_CODE_TO_NAME.get(normalizedCode);
        if (modifierName) {
          this[modifierName] = isActive;
        }
      }
    }

    _handleKeyDownEvent(evt) {
      const currentCode = this._normalizeKeyCode(evt.keyCode);

      if (MODIFIER_KEY_CODES.has(currentCode)) {
        this._updateModifierState(currentCode, true);
        return; // Only update modifier state, don't dispatch hotkeys
      }

      if (!this._inputEligibilityCheck.call(this, evt)) {
        return;
      }

      // Convert current active modifiers to a sorted string for comparison
      const currentActiveModifiersArray = Array.from(this._activeModifierCodes);
      currentActiveModifiersArray.sort((a, b) => a - b);
      const currentActiveModifiersString = currentActiveModifiersArray.join('-');

      for (const entry of this._registeredHotkeys) {
        if (entry.triggerCode !== currentCode) continue;
        if (entry.context !== 'all' && entry.context !== this._currentOperatingContext) continue;

        // Convert required modifiers to a sorted string for comparison
        const requiredModifiersArray = Array.from(entry.modifierCodesSet);
        requiredModifiersArray.sort((a, b) => a - b);
        const requiredModifiersString = requiredModifiersArray.join('-');

        // Check for exact modifier match
        if (currentActiveModifiersString === requiredModifiersString) {
          const actionResult = entry.handlerFunction(evt, entry);
          if (actionResult === false) {
            if (evt.preventDefault) evt.preventDefault();
            else evt.returnValue = false;
            if (evt.stopPropagation) evt.stopPropagation();
            if (evt.cancelBubble) evt.cancelBubble = true;
          }
          // Continue to check other matching handlers as per keymaster's behavior
        }
      }
    }

    _handleKeyUpEvent(evt) {
      const currentCode = this._normalizeKeyCode(evt.keyCode);
      this._updateModifierState(currentCode, false);
    }

    _resetAllModifierStates() {
      this._activeModifierCodes.clear();
      MODIFIER_KEY_CODES.forEach(code => {
        const modifierName = MODIFIER_CODE_TO_NAME.get(code);
        if (modifierName) this[modifierName] = false;
      });
    }

    _bindEvents() {
      const eventAttacher = (element, eventName, callback) => {
        if (element.addEventListener) {
          element.addEventListener(eventName, callback, false);
        } else if (element.attachEvent) {
          element.attachEvent('on' + eventName, () => callback.call(element, globalRef.event));
        }
      };

      eventAttacher(document, 'keydown', this._handleKeyDownEvent.bind(this));
      eventAttacher(document, 'keyup', this._handleKeyUpEvent.bind(this));
      eventAttacher(globalRef, 'focus', this._resetAllModifierStates.bind(this));
    }

    // Public methods
    registerShortcut(comboDescription, contextOrHandler, handler) {
      let actualContext = 'all';
      let actualHandler = contextOrHandler;

      if (typeof contextOrHandler === 'string') {
        actualContext = contextOrHandler;
        actualHandler = handler;
      }

      const combinations = comboDescription.replace(/\s/g, '').split(',');
      // Replicate keymaster's trailing comma behavior: 'ctrl+a,' results in 'ctrl+a,'
      if (combinations.length > 1 && combinations[combinations.length - 1] === '') {
          combinations[combinations.length - 2] += ',';
          combinations.pop(); // Remove the empty string
      }

      combinations.forEach(singleCombo => {
        const parts = singleCombo.split('+');
        const mainKeyPart = parts.pop(); // Last part is the main key
        const modifierParts = parts; // Remaining parts are modifiers

        const modifierCodesSet = new Set();
        modifierParts.forEach(modName => {
          const modCode = KEY_CODE_MAPPING.get(modName.toLowerCase());
          if (modCode && MODIFIER_KEY_CODES.has(modCode)) {
            modifierCodesSet.add(modCode);
          }
        });

        let primaryCode = KEY_CODE_MAPPING.get(mainKeyPart.toLowerCase());
        if (!primaryCode) {
          // Fallback to charCode if not a special key
          primaryCode = mainKeyPart.toUpperCase().charCodeAt(0);
        }

        this._registeredHotkeys.push({
          triggerCode: primaryCode,
          modifierCodesSet: modifierCodesSet,
          context: actualContext,
          handlerFunction: actualHandler,
          comboString: singleCombo // For debugging/info
        });
      });
    }

    establishContext(newContext) {
      this._currentOperatingContext = newContext || 'all';
    }

    retrieveContext() {
      return this._currentOperatingContext || 'all';
    }

    purgeContext(contextToRemove) {
      this._registeredHotkeys = this._registeredHotkeys.filter(
        entry => entry.context !== contextToRemove
      );
    }

    configureEligibility(customCheck) {
      if (typeof customCheck === 'function') {
        this._inputEligibilityCheck = customCheck;
      } else {
        this._inputEligibilityCheck = this._defaultEligibilityCheck;
      }
    }
  }

  // Instantiate the manager and expose its primary registration method globally
  const globalInputProcessor = new KeyboardInputProcessor();
  globalRef.KeyboardManager = globalInputProcessor.registerShortcut;

  // Expose additional methods
  globalRef.KeyboardManager.establishContext = globalInputProcessor.establishContext.bind(globalInputProcessor);
  globalRef.KeyboardManager.retrieveContext = globalInputProcessor.retrieveContext.bind(globalInputProcessor);
  globalRef.KeyboardManager.purgeContext = globalInputProcessor.purgeContext.bind(globalInputProcessor);
  globalRef.KeyboardManager.configureEligibility = globalInputProcessor.configureEligibility.bind(globalInputProcessor);

  // Expose modifier states directly on the global object's KeyboardManager
  MODIFIER_KEY_CODES.forEach(code => {
    const modifierName = MODIFIER_CODE_TO_NAME.get(code);
    if (modifierName) {
      Object.defineProperty(globalRef.KeyboardManager, modifierName, {
        get: () => globalInputProcessor[modifierName],
        enumerable: true,
        configurable: false
      });
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = globalRef.KeyboardManager;
  }

})(this);