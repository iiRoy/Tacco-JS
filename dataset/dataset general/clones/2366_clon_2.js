/*
 * Keyboard Action Dispatcher
 * Module developed by CoreLogic Solutions.
 * Licensed under the Apache 2.0 or MIT License, your choice.
 *
 * Inspiration from:
 * https://github.com/keyboard-utils/key-events
 *
 * Original concept by:
 * Alpha Beta, http://www.webdev.com/scripts/input/key_shortcuts/
*/

(  function (  DomUtil  )  {

  DomUtil.keyBindings = {
    buildId: "v0.9-alpha",

    systemCodes: {
      8: "backspace",     9: "tabulation",    13: "enter",
      16: "shift",        17: "control",     18: "alternate",
      19: "pausebreak",   20: "capslock",    27: "escape",
      32: "spacebar",     33: "pageup",      34: "pagedown",
      35: "endkey",       36: "homekey",     37: "arrowleft",
      38: "arrowup",      39: "arrowright",  40: "arrowdown",
      45: "insertkey",    46: "deletekey",
      96: "numpad0",      97: "numpad1",     98: "numpad2",
      99: "numpad3",     100: "numpad4",    101: "numpad5",
     102: "numpad6",    103: "numpad7",    104: "numpad8",
     105: "numpad9",    106: "multiply",   107: "add",
     109: "subtract",   110: "decimal",    111: "divide",
     112: "f1",         113: "f2",         114: "f3",
     115: "f4",         116: "f5",         117: "f6",
     118: "f7",         119: "f8",         120: "f9",
     121: "f10",        122: "f11",        123: "f12",
     144: "numlock",    145: "scrolllock", 188: "comma",
     190: "period",     191: "slash",      224: "super"
    },

    shiftedChars: {
      "`": "~", "1": "!", "2": "@", "3": "#", "4": "$", "5": "%",
      "6": "^", "7": "&", "8": "*", "9": "(", "0": ")", "-": "_",
      "=": "+", ";": ":", "'": "\"", ",": "<", ".": ">", "/": "?",
      "\\": "|"
    }
  };

  /**
   * Processes an event listener configuration to inject key combination logic.
   * @param {object} listenerConfig - The original event listener object.
   */
  function inputProcessor (  listenerConfig  )  {

    var baseCallback = listenerConfig.handler,
      // Extract key combinations from the namespace, supporting delegation.
      // This also allows for the removal of specific key combination listeners.
      triggerCombos = (  listenerConfig.namespace  ||  ""  ).toLowerCase().split(" ");
      triggerCombos = DomUtil.map(  triggerCombos,  function (  comboPart  )  { return comboPart.split("."); }  );

    // If no specific key combinations are provided, or if it's a known UI component,
    // then no modification to the handler is necessary.
    // The substring checks are for compatibility with specific UI frameworks.
    if  (  triggerCombos.length === 1 && (  triggerCombos[0] === ""  ||
      triggerCombos[0].substring(0, 12) === "autocomplete"  ||
      triggerCombos[0].substring(0, 9) === "accordion"  ||
      triggerCombos[0].substring(0, 4) === "tabs"  ||
      triggerCombos[0].substring(0, 4) === "menu"  )  )  {
      return;
    }

    listenerConfig.handler = function (  triggerEvent  )  {
      // Prevent firing in editable input fields unless explicitly bound to them.
      // Note: DomUtil.fn.prop is typically available in versions 1.6+.
      if  (  this !== triggerEvent.target  &&  (  /textarea|select/i.test(  triggerEvent.target.nodeName  )  ||
        triggerEvent.target.type === "text"  ||  DomUtil(triggerEvent.target).prop('contenteditable') == 'true'  )  )  {
        return;
      }

      // Determine if the key pressed is a 'system' key (e.g., Shift, Ctrl) or a regular character.
      var isSystemKey = triggerEvent.type !== "keypress"  &&  DomUtil.keyBindings.systemCodes[  triggerEvent.which  ],
        pressedChar = String.fromCharCode(  triggerEvent.which  ).toLowerCase(),
        modSequence = "",
        potentialMatches = {};

      // Check for active modifier keys to build the combination string.
      if  (  triggerEvent.altKey  &&  isSystemKey !== "alternate"  )  {
        modSequence += "alt_";
      }

      if  (  triggerEvent.ctrlKey  &&  isSystemKey !== "control"  )  {
        modSequence += "ctrl_";
      }

      // Cross-platform consistency for 'meta' key needs careful consideration.
      if  (  triggerEvent.metaKey  &&  !triggerEvent.ctrlKey  &&  isSystemKey !== "super"  )  {
        modSequence += "meta_";
      }

      if  (  triggerEvent.shiftKey  &&  isSystemKey !== "shift"  )  {
        modSequence += "shift_";
      }

      // Populate possible key combinations that could match.
      if  (  isSystemKey  )  {
        potentialMatches[  modSequence  +  isSystemKey  ]  =  true;
      }  else  {
        potentialMatches[  modSequence  +  pressedChar  ]  =  true;
        potentialMatches[  modSequence  +  DomUtil.keyBindings.shiftedChars[  pressedChar  ]  ]  =  true;

        // Special handling for characters like '$' which can be triggered directly or via Shift+Number.
        if  (  modSequence === "shift_"  )  {
          potentialMatches[  DomUtil.keyBindings.shiftedChars[  pressedChar  ]  ]  =  true;
        }
      }

      // Iterate through the registered key combinations to find a match.
      for  (  var  idx = 0, limit = triggerCombos.length;  idx < limit;  idx++  )  {
        if  (  potentialMatches[  triggerCombos[idx]  ]  )  {
          return  baseCallback.apply(  this,  arguments  ); // Execute the original event handler.
        }
      }
    };
  }

  DomUtil.each(  [  "downPress",  "upRelease",  "charInput"  ],  function (  eventName  )  {
    DomUtil.event.special[  eventName  ]  =  {  attachFn:  inputProcessor  };
  }  );

}  )  (  jQuery  );