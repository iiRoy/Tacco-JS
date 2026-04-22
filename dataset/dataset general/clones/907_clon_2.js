( function( ) {
  'use strict'; // Enforce stricter parsing and error handling for cleaner code.

  /*
  This anonymous function encapsulates the entire module to prevent global scope pollution.
  */
  var kbShortcuts = angular . module( 'keybind.shortcuts', [ ] );

  // Define the 'keybind' directive for associating DOM elements with key combinations.
  kbShortcuts . directive( 'keybind', [ '$parse', '$globalKey', 'KeyBinderForElement',
    function( parseService, globalKeyService, ElementKeyManager ) {
      return {
        restrict: 'AE', // Can be used as an attribute or an element.
        link: function( context, domNode, attributes ) {
          // Determine the key combinations to listen for.
          var keyActions = context . $eval( attributes . keybind || attributes . action );

          // If keyActions is not explicitly defined, assume an implicit action.
          if ( angular . isUndefined( keyActions ) ) {
            var actionExecutor = parseService( attributes . invoke ); // Parse the action to be invoked.
            keyActions = {}; // Initialize an empty object for key actions.
            keyActions[ attributes . keybind || attributes . action ] = function( eventObject ) {
              // Execute the parsed action within the current scope, passing the event.
              actionExecutor( context, { $event: eventObject } );
            };
          }

          // Check if the directive is used as an attribute on an existing HTML element.
          var isAttrUsage = domNode[ 0 ] . nodeName . toLowerCase( ) !== 'keybind';

          // Select the appropriate key binding manager based on usage.
          var bindingManager = isAttrUsage
            ? ElementKeyManager( domNode ) // Use element-specific manager.
            : globalKeyService; // Use the global key manager.

          // Iterate over the defined key actions and bind them.
          angular . forEach( keyActions, function( callbackFn, keyCombo ) {
            bindingManager . attach( keyCombo, callbackFn ); // Bind each key combination to its handler.
          } );
        }
      };
    }
  ] );

  // Factory for creating a key binder specifically for a given DOM element.
  kbShortcuts . factory( 'KeyBinderForElement', [ '$window', 'KeyBinder', function( browserWindow, KeyBinderFactory ) {

    // A mapping to correct problematic key codes (e.g., command key).
    // TODO: Investigate more robust cross-browser key code normalization.
    var codeSubstitutions = {
      93: 91 // Standardize command key codes.
    };

    var currentCode = null; // Variable to hold the raw key code.
    // Function to retrieve the normalized key code from an event.
    var retrieveKeyCode = function( eventObject ) {
      currentCode = eventObject . keyCode;
      // Return the substituted code if available, otherwise the original.
      return typeof codeSubstitutions[ currentCode ] !== 'undefined' ? codeSubstitutions[ currentCode ] : currentCode;
    };

    /**
     * @param {HTMLElement} targetDomElement The DOM element to bind keys to.
     * @returns {KeyBinder} An instance of the KeyBinder for the element.
     */
    return function( targetDomElement ) {
      var activeKeys = [ ]; // Array to store currently pressed keys.
      var singleKey = null; // Variable to hold a single key code.
      var targetNode = angular . element( targetDomElement ); // Wrap the element with Angular's jQLite.
      var windowRoot = angular . element( browserWindow ); // Wrap the window object.
      var context = targetNode . scope( ); // Get the Angular scope associated with the element.
      var keyBindingInstance = KeyBinderFactory( ); // Create a new KeyBinder instance.

      // If a scope exists, attach the key binding instance to it.
      if ( context ) context . $keyListeners = keyBindingInstance;

      // Bind a blur event to the window to clear active keys when focus is lost.
      windowRoot . bind( 'blur', function( ) { activeKeys = [ ]; } );

      // Handle keydown events on the target element.
      targetNode . bind( 'keydown', function( keyboardEvent ) {
        singleKey = retrieveKeyCode( keyboardEvent ); // Get the normalized key code.
        // Add the key to activeKeys if it's not already there.
        if ( activeKeys . indexOf( singleKey ) === -1 ) activeKeys . push( singleKey );
        // Trigger any handlers associated with the current combination of active keys.
        keyBindingInstance . execute( activeKeys, [ keyboardEvent ] );
      } );

      // Handle keyup events on the target element.
      targetNode . bind( 'keyup', function( keyboardEvent ) {
        // Remove the released key from the activeKeys array.
        activeKeys . splice( activeKeys . indexOf( retrieveKeyCode( keyboardEvent ) ), 1 );
      } );

      return keyBindingInstance; // Return the configured key binder.
    };
  } ] );

  // Factory for creating a generic KeyBinder object to manage key combinations and their handlers.
  kbShortcuts . factory( 'KeyBinder', [ 'KeyExpressionParser', '$rootScope', function( KeyExpressionParser, rootContext ) {

    /**
     * @constructor
     * Represents a key combination manager.
     */
    var KeyBinder = function( ) {
      this . _storedBindings = {}; // Internal object to store key combo -> handler mappings.
    };

    /**
     * Generates a unique string identifier for a given key combination.
     * @param {String|Array.<Number>} comboExpression A string expression (e.g., "ctrl+alt+a") or an array of key codes.
     * @returns {String} A sorted, plus-separated string representing the key combination.
     * @private
     */
    KeyBinder . prototype . _getKeyComboIdentifier = function( comboExpression ) {
      var keyCombo;
      // Parse string expressions into key code arrays.
      if ( angular . isString( comboExpression ) ) {
        keyCombo = KeyExpressionParser( comboExpression );
      } else if ( angular . isArray( comboExpression ) ) {
        keyCombo = comboExpression;
      } else {
        // Throw an error for invalid input types.
        throw new Error( 'KeyBinder expects a string expression or an array of key codes, but received: ' + typeof( comboExpression ) );
      }
      // Sort and join the key codes to create a consistent identifier.
      return keyCombo . sort( ) . join( '+' );
    };

    /**
     * Attaches a callback function to a specific key combination.
     * @param {String|Array.<Number>} keyCombination The key combination to bind.
     * @param {Function} callbackFunction The function to execute when the key combination is pressed.
     * @returns {KeyBinder} This instance for chaining.
     */
    KeyBinder . prototype . attach = function( keyCombination, callbackFunction ) {
      keyCombination = this . _getKeyComboIdentifier( keyCombination ); // Get the standardized identifier.
      // Initialize the array for this key combination if it doesn't exist.
      if ( !this . _storedBindings[ keyCombination ] ) {
        this . _storedBindings[ keyCombination ] = [ ];
      }
      this . _storedBindings[ keyCombination ] . push( callbackFunction ); // Add the callback.
      return this;
    };

    /**
     * Removes all registered handlers for a given key combination.
     * @param {String|Array.<Number>} keyCombination The key combination to unbind.
     * @returns {KeyBinder} This instance for chaining.
     */
    KeyBinder . prototype . detach = function( keyCombination ) {
      keyCombination = this . _getKeyComboIdentifier( keyCombination ); // Get the standardized identifier.
      this . _storedBindings[ keyCombination ] = [ ]; // Clear the array of handlers.
      return this;
    };

    /**
     * Executes all callback functions associated with a given key combination.
     * @param {String|Array.<Number>} keyCombination The key combination to trigger.
     * @param {Array} [ argumentsArray ] Optional array of arguments to pass to the callbacks.
     */
    KeyBinder . prototype . execute = function( keyCombination, argumentsArray ) {
      argumentsArray = argumentsArray || [ ]; // Default to an empty array if no arguments are provided.
      keyCombination = this . _getKeyComboIdentifier( keyCombination ); // Get the standardized identifier.
      // Iterate through and execute each registered callback.
      angular . forEach( this . _storedBindings[ keyCombination ], function( callbackFunction ) {
        callbackFunction . call( callbackFunction, ...argumentsArray ); // Call the callback with provided arguments.
      } );

      // If not already in an Angular digest cycle, initiate one.
      if ( !rootContext . $$phase ) {
        rootContext . $apply( );
      }
    };

    // Return a function that creates new KeyBinder instances.
    return function( ) {
      return new KeyBinder( );
    };
  } ] );

  // Factory for a global key binding manager, attached to the window object.
  kbShortcuts . factory( '$globalKey', [ '$window', 'KeyBinderForElement', function( browserWindow, ElementKeyManager ) {
    return ElementKeyManager( browserWindow ); // Use the element key manager for the window.
  } ] );

  // Define a value service for mapping common key names to their respective key codes.
  kbShortcuts . value( 'keyMapping', {
    'backspace': 8, 'return': 8, // Synonyms for backspace
    'tab': 9, 'tabulator': 9, // Synonyms for tab
    'enter': 13,
    'shift': 16,
    'ctrl': 17, 'control': 17, // Synonyms for control
    'alt': 18,
    'esc': 27, 'escape': 27, // Synonyms for escape
    'left': 37,
    'up': 38,
    'right': 39,
    'down': 40,
    'insert': 45,
    'del': 46, // Synonyms for delete
    'delete': 46,
  } );

  // Run block to initialize browser-specific key mappings.
  kbShortcuts . run( [ '$window', 'keyMapping', function( browserWindow, keyMapping ) {
    var browserAgent = browserWindow . navigator . userAgent . toLowerCase( ); // Get user agent string.
    var isMozilla = browserAgent . indexOf( 'firefox' ) > -1; // Check for Firefox.
    var isPresto = browserAgent . indexOf( 'opera' ) > -1; // Check for Opera.
    // Determine the command key code based on the browser.
    var metaKeyCode = isMozilla ? 224 : ( isPresto ? 17 : 91 /* WebKit/Chromium default */ );

    keyMapping . command = metaKeyCode; // Assign the determined command key code.
    keyMapping . cmd = metaKeyCode; // Also assign for 'cmd' alias.
  } ] );

  // Service to parse key expression strings into arrays of key codes.
  kbShortcuts . service( 'KeyExpressionParser', [ '$window', 'keyMapping', function( browserWindow, keyMapping ) {
    return function( keyPhrase ) {
      var keys = [ ]; // Array to store parsed key codes.
      var phraseParts = keyPhrase . split( '+' ); // Split the expression by '+' to get individual keys.

      angular . forEach( phraseParts, function( part ) {
        part = part . trim( ) . toLowerCase( ); // Normalize the part (trim whitespace, lowercase).
        // Check if the part is a known alias.
        if ( typeof keyMapping[ part ] !== 'undefined' ) {
          keys . push( keyMapping[ part ] );
        } else if ( part . length === 1 ) {
          // If it's a single character, get its uppercase ASCII code.
          keys . push( part . toUpperCase( ) . charCodeAt( 0 ) );
        } else {
          // Throw an error for unrecognized key parts.
          throw new Error( 'KeyExpressionParser expects a single character or a special expression like "Tab" or "Control", but found: "' + part + '"' );
        }
      } );

      return keys; // Return the array of key codes.
    };
  } ] );

} ) ( );