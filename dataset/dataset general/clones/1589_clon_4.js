class InputBinder {
  static _CODE_TO_LABEL_MAP = new Map([
    [8, 'backspace'], [9, 'tab'], [13, 'enter'],
    [16, 'shift'], [17, 'ctrl'], [18, 'alt'],
    [20, 'caps_lock'],
    [27, 'esc'],
    [32, 'space'],
    [33, 'page_up'], [34, 'page_down'],
    [35, 'end'], [36, 'home'],
    [37, 'left'], [38, 'up'], [39, 'right'], [40, 'down'],
    [45, 'insert'], [46, 'delete'],
    [48, '0'], [49, '1'], [50, '2'], [51, '3'], [52, '4'], [53, '5'], [54, '6'], [55, '7'], [56, '8'], [57, '9'],
    [65, 'a'], [66, 'b'], [67, 'c'], [68, 'd'], [69, 'e'], [70, 'f'], [71, 'g'], [72, 'h'], [73, 'i'], [74, 'j'], [75, 'k'], [76, 'l'], [77, 'm'], [78, 'n'], [79, 'o'], [80, 'p'], [81, 'q'], [82, 'r'], [83, 's'], [84, 't'], [85, 'u'], [86, 'v'], [87, 'w'], [88, 'x'], [89, 'y'], [90, 'z'],
    [112, 'f1'], [113, 'f2'], [114, 'f3'], [115, 'f4'], [116, 'f5'], [117, 'f6'], [118, 'f7'], [119, 'f8'], [120, 'f9'], [121, 'f10'], [122, 'f11'], [123, 'f12'],
    [144, 'num_lock']
  ]);

  static _LABEL_TO_CODE_MAP = (() => {
    const reverseMap = new Map();
    for (const [code, label] of InputBinder._CODE_TO_LABEL_MAP.entries()) {
      reverseMap.set(label, code);
    }
    return reverseMap;
  })();

  static _MODIFIER_LABELS_SET = new Set(['shift', 'ctrl', 'alt']);

  static _KEY_GROUP_MEMBERS = new Map([
    ['arrow', new Set([37, 38, 39, 40])],
    ['number', new Set([48, 49, 50, 51, 52, 53, 54, 55, 56, 57])],
    ['letter', new Set([65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90])],
    ['f', new Set([112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123])]
  ]);

  static _GROUP_TAGS_SET = new Set(InputBinder._KEY_GROUP_MEMBERS.keys());

  static _hasMember(collection, item) {
    if (typeof collection === 'string') {
      return collection.includes(item);
    }
    if (collection instanceof Set || collection instanceof Map) {
      return collection.has(item);
    }
    if (Array.isArray(collection)) {
      return collection.includes(item);
    }
    return false;
  }

  static _normalizeString(text) {
    return String(text).trim().replace(/\s+/g, ' ');
  }

  static _capitaliseFirst(text) {
    return String(text).toLowerCase().replace(/^./, (match) => match.toUpperCase());
  }

  static _isText(val) {
    return typeof val === 'string' || val instanceof String;
  }

  static _getLabelFromCode(keyCode) {
    return InputBinder._CODE_TO_LABEL_MAP.get(keyCode);
  }

  static _getCodeFromLabel(keyLabel) {
    return InputBinder._LABEL_TO_CODE_MAP.get(keyLabel);
  }

  static _extractComponents(combinedKeyString) {
    const components = InputBinder._normalizeString(combinedKeyString).split(' ');
    const modifierComponents = [];
    let mainKeyComponent = null;

    for (const comp of components) {
      if (InputBinder._hasMember(InputBinder._MODIFIER_LABELS_SET, comp)) {
        modifierComponents.push(comp);
      } else if (comp === 'any') {
        modifierComponents.push(comp);
      } else {
        mainKeyComponent = comp;
        break;
      }
    }
    return { modifiers: modifierComponents, mainKey: mainKeyComponent };
  }

  static _getKeyIdentifier(combinedKeyString) {
    const trimmedString = InputBinder._normalizeString(combinedKeyString);
    if (InputBinder._hasMember(trimmedString, 'any')) {
      const parts = trimmedString.split(' ');
      // Kibo's logic for 'any' wildcard: takes first two parts.
      return parts.slice(0, 2).join(' ');
    }

    const { modifiers, mainKey } = InputBinder._extractComponents(combinedKeyString);
    const parts = [...modifiers];
    if (mainKey && !InputBinder._hasMember(InputBinder._MODIFIER_LABELS_SET, mainKey)) {
      parts.push(mainKey);
    }
    return parts.join(' ');
  }

  static _attachEvent(element, eventName, handlerFunc) {
    element.addEventListener(eventName, handlerFunc, false);
  }

  static _detachEvent(element, eventName, handlerFunc) {
    element.removeEventListener(eventName, handlerFunc, false);
  }

  _targetElement;
  _activeKeyInfo = {
    code: -1,
    modifiers: {}
  };
  _keyDownCallbacks = new Map();
  _keyUpCallbacks = new Map();
  _boundHandleEvent;
  _boundCleanup;

  constructor(targetElement = window.document) {
    this._targetElement = targetElement;
    this._initiateMonitoring();
  }

  _initiateMonitoring() {
    for (const mod of InputBinder._MODIFIER_LABELS_SET) {
      this._activeKeyInfo.modifiers[mod] = false;
    }

    this._keyDownCallbacks.set('any', new Set());
    this._keyUpCallbacks.set('any', new Set());
    for (const groupTag of InputBinder._GROUP_TAGS_SET) {
      this._keyDownCallbacks.set(`any ${groupTag}`, new Set());
      this._keyUpCallbacks.set(`any ${groupTag}`, new Set());
    }

    this._boundHandleEvent = this._handleEvent.bind(this);
    this._boundCleanup = this._cleanupOnUnload.bind(this);

    InputBinder._attachEvent(this._targetElement, 'keydown', this._boundHandleEvent);
    InputBinder._attachEvent(this._targetElement, 'keyup', this._boundHandleEvent);
    InputBinder._attachEvent(window, 'unload', this._boundCleanup);
  }

  _handleEvent(event) {
    const currentEvent = event || window.event;

    this._activeKeyInfo.code = currentEvent.keyCode;
    for (const mod of InputBinder._MODIFIER_LABELS_SET) {
      this._activeKeyInfo.modifiers[mod] = currentEvent[`${mod}Key`];
    }
    const lastKeyLabel = InputBinder._getLabelFromCode(this._activeKeyInfo.code);
    if (lastKeyLabel && InputBinder._hasMember(InputBinder._MODIFIER_LABELS_SET, lastKeyLabel)) {
      this._activeKeyInfo.modifiers[lastKeyLabel] = true;
    }

    this._triggerCallbacks(currentEvent.type, currentEvent);
  }

  _triggerCallbacks(eventType, currentEvent) {
    const registeredCallbacksMap = eventType === 'keydown' ? this._keyDownCallbacks : this._keyUpCallbacks;

    const anyCallbacks = registeredCallbacksMap.get('any');
    if (anyCallbacks) {
      for (const cb of anyCallbacks) {
        if (cb(currentEvent) === false && currentEvent.preventDefault) {
          currentEvent.preventDefault();
        }
      }
    }

    for (const groupTag of InputBinder._GROUP_TAGS_SET) {
      if (InputBinder._hasMember(InputBinder._KEY_GROUP_MEMBERS.get(groupTag), this._activeKeyInfo.code)) {
        const groupCallbacks = registeredCallbacksMap.get(`any ${groupTag}`);
        if (groupCallbacks) {
          for (const cb of groupCallbacks) {
            if (cb(currentEvent) === false && currentEvent.preventDefault) {
              currentEvent.preventDefault();
            }
          }
        }
      }
    }

    const currentCombinationIdentifier = this.retrieveCurrentCombination();
    const specificCallbacks = registeredCallbacksMap.get(currentCombinationIdentifier);
    if (specificCallbacks) {
      for (const cb of specificCallbacks) {
        if (cb(currentEvent) === false && currentEvent.preventDefault) {
          currentEvent.preventDefault();
        }
      }
    }
  }

  _registerHandler(eventType, keySpecifiers, callback) {
    const callbacksMap = eventType === 'keydown' ? this._keyDownCallbacks : this._keyUpCallbacks;

    const specs = InputBinder._isText(keySpecifiers) ? [keySpecifiers] : keySpecifiers;

    for (const spec of specs) {
      const identifier = InputBinder._getKeyIdentifier(spec + '');
      if (!callbacksMap.has(identifier)) {
        callbacksMap.set(identifier, new Set());
      }
      callbacksMap.get(identifier).add(callback);
    }
    return this;
  }

  _unregisterHandler(eventType, keySpecifiers, callback) {
    const callbacksMap = eventType === 'keydown' ? this._keyDownCallbacks : this._keyUpCallbacks;

    const specs = InputBinder._isText(keySpecifiers) ? [keySpecifiers] : keySpecifiers;

    for (const spec of specs) {
      const identifier = InputBinder._getKeyIdentifier(spec + '');

      if (callback === null) {
        callbacksMap.delete(identifier);
      } else {
        const existingCallbacks = callbacksMap.get(identifier);
        if (existingCallbacks) {
          const funcString = String(callback);
          for (const cb of existingCallbacks) {
            if (String(cb) === funcString) {
              existingCallbacks.delete(cb);
              break;
            }
          }
          if (existingCallbacks.size === 0) {
            callbacksMap.delete(identifier);
          }
        }
      }
    }
    return this;
  }

  _dispatch(eventType, keySpecifiers, callback) {
    return callback !== null ?
      this._registerHandler(eventType, keySpecifiers, callback) :
      this._unregisterHandler(eventType, keySpecifiers, callback);
  }

  onPress(keySpecifiers, func) {
    return this._dispatch('keydown', keySpecifiers, func);
  }

  onRelease(keySpecifiers, func) {
    return this._dispatch('keyup', keySpecifiers, func);
  }

  retrieveLastKey(checkModifier) {
    if (!checkModifier) {
      return InputBinder._getLabelFromCode(this._activeKeyInfo.code);
    }
    return this._activeKeyInfo.modifiers[checkModifier];
  }

  retrieveCurrentCombination() {
    const activeComponents = [];
    for (const mod of InputBinder._MODIFIER_LABELS_SET) {
      if (this.retrieveLastKey(mod)) {
        activeComponents.push(mod);
      }
    }

    const lastKeyLabel = this.retrieveLastKey();
    if (lastKeyLabel && !InputBinder._hasMember(activeComponents, lastKeyLabel)) {
      activeComponents.push(lastKeyLabel);
    }

    return activeComponents.join(' ');
  }

  _cleanupOnUnload() {
    InputBinder._detachEvent(this._targetElement, 'keydown', this._boundHandleEvent);
    InputBinder._detachEvent(this._targetElement, 'keyup', this._boundHandleEvent);
    InputBinder._detachEvent(window, 'unload', this._boundCleanup);
  }
}