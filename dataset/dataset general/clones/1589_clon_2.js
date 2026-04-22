var KeyBinder = function(domNode) {
  // Store the DOM node for event listening
  this.targetNode = domNode || window.document;
  // Initialize the internal state and event listeners
  this.init();
};

KeyBinder.CODE_TO_NAME_MAP = {
  8: 'backspace',
  9: 'tab',
  13: 'enter',
  16: 'shift',
  17: 'ctrl',
  18: 'alt',
  20: 'caps_lock',
  27: 'esc',
  32: 'space',
  33: 'page_up',
  34: 'page_down',
  35: 'end',
  36: 'home',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
  45: 'insert',
  46: 'delete',
  48: '0',
  49: '1',
  50: '2',
  51: '3',
  52: '4',
  53: '5',
  54: '6',
  55: '7',
  56: '8',
  57: '9',
  65: 'a',
  66: 'b',
  67: 'c',
  68: 'd',
  69: 'e',
  70: 'f',
  71: 'g',
  72: 'h',
  73: 'i',
  74: 'j',
  75: 'k',
  76: 'l',
  77: 'm',
  78: 'n',
  79: 'o',
  80: 'p',
  81: 'q',
  82: 'r',
  83: 's',
  84: 't',
  85: 'u',
  86: 'v',
  87: 'w',
  88: 'x',
  89: 'y',
  90: 'z',
  112: 'f1',
  113: 'f2',
  114: 'f3',
  115: 'f4',
  116: 'f5',
  117: 'f6',
  118: 'f7',
  119: 'f8',
  120: 'f9',
  121: 'f10',
  122: 'f11',
  123: 'f12',
  144: 'num_lock'
};

KeyBinder.NAME_TO_CODE_MAP = {};
(function() {
  var codeVal;
  for(codeVal in KeyBinder.CODE_TO_NAME_MAP) {
    if(Object.prototype.hasOwnProperty.call(KeyBinder.CODE_TO_NAME_MAP, codeVal)) {
      KeyBinder.NAME_TO_CODE_MAP[KeyBinder.CODE_TO_NAME_MAP[codeVal]] = Number(codeVal);
    }
  }
})();

KeyBinder.MODIFIER_KEYS = ['shift', 'ctrl', 'alt'];

KeyBinder.GROUP_TYPES = ['arrow', 'number', 'letter', 'f'];

KeyBinder.KEY_GROUPS = {
  arrow: [37, 38, 39, 40],
  number: [48, 49, 50, 51, 52, 53, 54, 55, 56, 57],
  letter: [65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90],
  f: [112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123]
};

KeyBinder.attachListener = (function() {
  if(document.addEventListener) {
    return function(target, eventKind, callback) {
      target.addEventListener(eventKind, callback, false);
    };
  } else if(document.attachEvent) {
    return function(target, eventKind, callback) {
      target.attachEvent('on' + eventKind, callback);
    };
  }
})();

KeyBinder.detachListener = (function() {
  if(document.removeEventListener) {
    return function(target, eventKind, callback) {
      target.removeEventListener(eventKind, callback, false);
    };
  } else if(document.detachEvent) {
    return function(target, eventKind, callback) {
      target.detachEvent('on' + eventKind, callback);
    };
  }
})();

KeyBinder.stringHasSubstring = function(mainStr, subStr) {
  return mainStr.indexOf(subStr) !== -1;
};

KeyBinder.cleanString = function(inputStr) {
  return inputStr.replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ');
};

KeyBinder.capitalizeFirst = function(text) {
  return text.toLowerCase().replace(/^./, function(firstChar) { return firstChar.toUpperCase(); });
};

KeyBinder.isText = function(valueToCheck) {
  return KeyBinder.stringHasSubstring(Object.prototype.toString.call(valueToCheck), 'String');
};

KeyBinder.arrayContains = (function() {
  if(Array.prototype.indexOf) {
    return function(arr, item) {
      return arr.indexOf(item) !== -1;
    };
  } else {
    return function(arr, item) {
      var idx;
      for(idx = 0; idx < arr.length; idx++) {
        if(arr[idx] === item) {
          return true;
        }
      }
      return false;
    };
  }
})();

KeyBinder.extractModifierKeys = function(comboStr) {
  var mods = new Array(),
      j;
  for(j = 0; j < KeyBinder.MODIFIER_KEYS.length; j++) {
    if(KeyBinder.stringHasSubstring(comboStr, KeyBinder.MODIFIER_KEYS[j])) {
      mods.push(KeyBinder.MODIFIER_KEYS[j]);
    }
  }
  return mods;
};

KeyBinder.extractMainKey = function(comboStr) {
  var parts, k;
  parts = KeyBinder.cleanString(comboStr).split(' ');
  for(k = 0; k < parts.length; k++) {
    if(!KeyBinder.arrayContains(KeyBinder.MODIFIER_KEYS, parts[k])) {
      return parts[k];
    }
  }
  return null;
};

KeyBinder.getNormalizedCombo = function(comboStr) {
  var comboParts, mainKey;

  if(KeyBinder.stringHasSubstring(comboStr, 'any')) {
    return KeyBinder.cleanString(comboStr).split(' ').slice(0, 2).join(' ');
  }

  comboParts = KeyBinder.extractModifierKeys(comboStr);

  mainKey = KeyBinder.extractMainKey(comboStr);
  if(mainKey && !KeyBinder.arrayContains(KeyBinder.MODIFIER_KEYS, mainKey)) {
    comboParts.push(mainKey);
  }

  return comboParts.join(' ');
};

KeyBinder.getNameFromCode = function(codeVal) {
  return KeyBinder.CODE_TO_NAME_MAP[String(codeVal)];
};

KeyBinder.getCodeFromName = function(nameStr) {
  return Number(KeyBinder.NAME_TO_CODE_MAP[nameStr]);
};

KeyBinder.prototype.init = function() {
  var idx, selfRef = this;

  // Initialize state for the last key pressed
  this.previousKeyCode = -1;
  this.previousModifierState = {};
  for(idx = 0; idx < KeyBinder.MODIFIER_KEYS.length; idx++) {
    this.previousModifierState[KeyBinder.MODIFIER_KEYS[idx]] = Boolean(0);
  }

  // Initialize callback registries for key press and release events
  this.onPressCallbacks = { any: new Array() };
  this.onReleaseCallbacks = { any: new Array() };
  for(idx = 0; idx < KeyBinder.GROUP_TYPES.length; idx++) {
    this.onPressCallbacks['any ' + KeyBinder.GROUP_TYPES[idx]] = new Array();
    this.onReleaseCallbacks['any ' + KeyBinder.GROUP_TYPES[idx]] = new Array();
  }

  // Create event handlers bound to this instance
  this.pressEventHandler = this.eventProcessor('down');
  this.releaseEventHandler = this.eventProcessor('up');

  // Attach event listeners to the target DOM node
  KeyBinder.attachListener(this.targetNode, 'keydown', this.pressEventHandler);
  KeyBinder.attachListener(this.targetNode, 'keyup', this.releaseEventHandler);
  KeyBinder.attachListener(window, 'unload', function cleanupFn() {
    KeyBinder.detachListener(selfRef.targetNode, 'keydown', selfRef.pressEventHandler);
    KeyBinder.detachListener(selfRef.targetNode, 'keyup', selfRef.releaseEventHandler);
    KeyBinder.detachListener(window, 'unload', cleanupFn);
  });
};

KeyBinder.prototype.eventProcessor = function(eventType) {
  var selfRef = this;
  return function(eventObj) {
    var idx1, idx2, activeCallbacks, currentComboString;

    eventObj = eventObj || window.event;

    // Update the last key code and modifier states
    selfRef.previousKeyCode = eventObj.keyCode;
    for(idx1 = 0; idx1 < KeyBinder.MODIFIER_KEYS.length; idx1++) {
      selfRef.previousModifierState[KeyBinder.MODIFIER_KEYS[idx1]] = eventObj[KeyBinder.MODIFIER_KEYS[idx1] + 'Key'];
    }
    // If the pressed key itself is a modifier, update its state
    if(KeyBinder.arrayContains(KeyBinder.MODIFIER_KEYS, KeyBinder.getNameFromCode(selfRef.previousKeyCode))) {
      selfRef.previousModifierState[KeyBinder.getNameFromCode(selfRef.previousKeyCode)] = Boolean(1);
    }

    // Get the appropriate set of registered callbacks (onPressCallbacks or onReleaseCallbacks)
    activeCallbacks = selfRef['on' + KeyBinder.capitalizeFirst(eventType) + 'Callbacks'];

    // Trigger 'any' key callbacks
    for(idx1 = 0; idx1 < activeCallbacks.any.length; idx1++) {
      if((activeCallbacks.any[idx1](eventObj) === false) && eventObj.preventDefault) {
        eventObj.preventDefault();
      }
    }

    // Trigger wildcard group callbacks (e.g., 'any arrow')
    for(idx1 = 0; idx1 < KeyBinder.GROUP_TYPES.length; idx1++) {
      if(KeyBinder.arrayContains(KeyBinder.KEY_GROUPS[KeyBinder.GROUP_TYPES[idx1]], selfRef.previousKeyCode)) {
        for(idx2 = 0; idx2 < activeCallbacks['any ' + KeyBinder.GROUP_TYPES[idx1]].length; idx2++) {
          if((activeCallbacks['any ' + KeyBinder.GROUP_TYPES[idx1]][idx2](eventObj) === false) && eventObj.preventDefault) {
            eventObj.preventDefault();
          }
        }
      }
    }

    // Trigger specific key combination callbacks
    currentComboString = selfRef.getCurrentComboString();
    if(activeCallbacks[currentComboString]) {
      for(idx1 = 0; idx1 < activeCallbacks[currentComboString].length; idx1++) {
        if((activeCallbacks[currentComboString][idx1](eventObj) === false) && eventObj.preventDefault) {
          eventObj.preventDefault();
        }
      }
    }
  };
};

KeyBinder.prototype.addKeyHandlers = function(eventType, keyCombos, handlerFn) {
  var idx, currentCombo, targetCallbacks = this['on' + KeyBinder.capitalizeFirst(eventType) + 'Callbacks'];

  if(KeyBinder.isText(keyCombos)) {
    keyCombos = [keyCombos];
  }

  for(idx = 0; idx < keyCombos.length; idx++) {
    currentCombo = keyCombos[idx];
    currentCombo = KeyBinder.getNormalizedCombo(String(currentCombo));

    if(targetCallbacks[currentCombo]) {
      targetCallbacks[currentCombo].push(handlerFn);
    } else {
      targetCallbacks[currentCombo] = [handlerFn];
    }
  }

  return this;
};

KeyBinder.prototype.removeKeyHandlers = function(eventType, keyCombos, handlerFn) {
  var idx1, idx2, currentCombo, targetCallbacks = this['on' + KeyBinder.capitalizeFirst(eventType) + 'Callbacks'];

  if(KeyBinder.isText(keyCombos)) {
    keyCombos = [keyCombos];
  }

  for(idx1 = 0; idx1 < keyCombos.length; idx1++) {
    currentCombo = keyCombos[idx1];
    currentCombo = KeyBinder.getNormalizedCombo(String(currentCombo));

    if(handlerFn === null) {
      delete targetCallbacks[currentCombo];
    } else {
      if(targetCallbacks[currentCombo]) {
        for(idx2 = 0; idx2 < targetCallbacks[currentCombo].length; idx2++) {
          if(String(targetCallbacks[currentCombo][idx2]) === String(handlerFn)) {
            targetCallbacks[currentCombo].splice(idx2, 1);
            break;
          }
        }
      }
    }
  }

  return this;
};

KeyBinder.prototype.handleKeyBinding = function(eventType, keyCombos, handlerFn) {
  return handlerFn !== null ? this.addKeyHandlers(eventType, keyCombos, handlerFn) : this.removeKeyHandlers(eventType, keyCombos, handlerFn);
};

KeyBinder.prototype.onPress = function(keyCombos, handlerFn) {
  return this.handleKeyBinding('down', keyCombos, handlerFn);
};

KeyBinder.prototype.onRelease = function(keyCombos, handlerFn) {
  return this.handleKeyBinding('up', keyCombos, handlerFn);
};

KeyBinder.prototype.getTriggeredKey = function(modKey) {
  if(!modKey) {
    return KeyBinder.getNameFromCode(this.previousKeyCode);
  }

  return this.previousModifierState[modKey];
};

KeyBinder.prototype.getCurrentComboString = function() {
  var activeCombo = new Array(),
      idx;

  for(idx = 0; idx < KeyBinder.MODIFIER_KEYS.length; idx++) {
    if(this.getTriggeredKey(KeyBinder.MODIFIER_KEYS[idx])) {
      activeCombo.push(KeyBinder.MODIFIER_KEYS[idx]);
    }
  }

  if(!KeyBinder.arrayContains(activeCombo, this.getTriggeredKey())) {
    activeCombo.push(this.getTriggeredKey());
  }

  return activeCombo.join(' ');
};