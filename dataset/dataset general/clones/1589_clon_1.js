/*
 * Kibo.js - A JavaScript library for handling keyboard events.
 * This file contains the core Kibo object and its static utility methods.
 *
 * This is a Type I clone, meaning only whitespace and comments have been altered.
 * All variable names, function names, operators, and expressions are identical.
 */

var Kibo = function ( element ) {
    // The DOM element to which key events will be attached.
    // Defaults to the entire window document if no specific element is provided.
    this.element = element || window.document ;

    // Initialize the Kibo instance.
    this.initialize ( ) ;
} ;

/*
 * Static property: Kibo.KEY_NAMES_BY_CODE
 * A lookup table mapping key codes to their human-readable names.
 * This helps in converting raw event.keyCode values to more understandable strings.
 */
Kibo.KEY_NAMES_BY_CODE = {
    // Common control keys
      8: 'backspace'
    , 9: 'tab'
    , 13: 'enter'

    // Modifier keys
    , 16: 'shift'
    , 17: 'ctrl'
    , 18: 'alt'

    // Other special keys
    , 20: 'caps_lock'
    , 27: 'esc'
    , 32: 'space'

    // Navigation and editing keys
    , 33: 'page_up'
    , 34: 'page_down'
    , 35: 'end'
    , 36: 'home'

    // Arrow keys
    , 37: 'left'
    , 38: 'up'
    , 39: 'right'
    , 40: 'down'

    // More editing keys
    , 45: 'insert'
    , 46: 'delete'

    // Number keys (0-9)
    , 48: '0' , 49: '1' , 50: '2' , 51: '3' , 52: '4' , 53: '5' , 54: '6' , 55: '7' , 56: '8' , 57: '9'

    // Letter keys (a-z)
    , 65: 'a' , 66: 'b' , 67: 'c' , 68: 'd' , 69: 'e' , 70: 'f' , 71: 'g' , 72: 'h' , 73: 'i' , 74: 'j' , 75: 'k' , 76: 'l' , 77: 'm' , 78: 'n' , 79: 'o' , 80: 'p' , 81: 'q' , 82: 'r' , 83: 's' , 84: 't' , 85: 'u' , 86: 'v' , 87: 'w' , 88: 'x' , 89: 'y' , 90: 'z'

    // Function keys (F1-F12)
    , 112: 'f1' , 113: 'f2' , 114: 'f3' , 115: 'f4' , 116: 'f5' , 117: 'f6' , 118: 'f7' , 119: 'f8' , 120: 'f9' , 121: 'f10' , 122: 'f11' , 123: 'f12'

    // Num Lock key
    , 144: 'num_lock'
} ;

/*
 * Static property: Kibo.KEY_CODES_BY_NAME
 * A reverse lookup table created from Kibo.KEY_NAMES_BY_CODE.
 * Maps key names to their corresponding key codes.
 * This is populated immediately after Kibo.KEY_NAMES_BY_CODE is defined.
 */
Kibo.KEY_CODES_BY_NAME = { } ;
( function ( ) {
    // Self-executing anonymous function to populate the KEY_CODES_BY_NAME object.
    for ( var key in Kibo.KEY_NAMES_BY_CODE ) {
        // Ensure the property belongs to the object itself, not its prototype chain.
        if ( Object.prototype.hasOwnProperty.call ( Kibo.KEY_NAMES_BY_CODE , key ) ) {
            // Assign the numeric key code (converted using unary plus) to the key name.
            Kibo.KEY_CODES_BY_NAME [ Kibo.KEY_NAMES_BY_CODE [ key ] ] = + key ;
        }
    }
} ) ( ) ;


/*
 * Static property: Kibo.MODIFIERS
 * An array listing the names of common modifier keys.
 * Used for checking if a key is a modifier or for extracting modifiers from key combinations.
 */
Kibo.MODIFIERS = [ 'shift' , 'ctrl' , 'alt' ] ;


/*
 * Static property: Kibo.WILDCARD_TYPES
 * An array listing the types of wildcard key groups supported by Kibo.
 * These wildcards allow registering handlers for categories of keys (e.g., any number key).
 */
Kibo.WILDCARD_TYPES = [ 'arrow' , 'number' , 'letter' , 'f' ] ;


/*
 * Static property: Kibo.WILDCARDS
 * An object containing arrays of key codes for each wildcard type.
 * This provides the actual key codes that correspond to each wildcard.
 */
Kibo.WILDCARDS = {
      arrow:  [ 37 , 38 , 39 , 40 ]
    , number: [ 48 , 49 , 50 , 51 , 52 , 53 , 54 , 55 , 56 , 57 ]
    , letter: [ 65 , 66 , 67 , 68 , 69 , 70 , 71 , 72 , 73 , 74 , 75 , 76 , 77 , 78 , 79 , 80 , 81 , 82 , 83 , 84 , 85 , 86 , 87 , 88 , 89 , 90 ]
    , f:      [ 112 , 113 , 114 , 115 , 116 , 117 , 118 , 119 , 120 , 121 , 122 , 123 ]
} ;


/*
 * Static method: Kibo.registerEvent
 * A cross-browser utility function to attach an event listener to an element.
 * It uses `addEventListener` for modern browsers and `attachEvent` for older IE.
 */
Kibo.registerEvent = ( function ( ) {
    if ( document.addEventListener ) {
        return function ( element , eventName , func ) {
            element.addEventListener ( eventName , func , false ) ;
        } ;
    }
    else if ( document.attachEvent ) {
        return function ( element , eventName , func ) {
            element.attachEvent ( 'on' + eventName , func ) ;
        } ;
    }
} ) ( ) ;


/*
 * Static method: Kibo.unregisterEvent
 * A cross-browser utility function to remove an event listener from an element.
 * It uses `removeEventListener` for modern browsers and `detachEvent` for older IE.
 */
Kibo.unregisterEvent = ( function ( ) {
    if ( document.removeEventListener ) {
        return function ( element , eventName , func ) {
            element.removeEventListener ( eventName , func , false ) ;
        } ;
    }
    else if ( document.detachEvent ) {
        return function ( element , eventName , func ) {
            element.detachEvent ( 'on' + eventName , func ) ;
        } ;
    }
} ) ( ) ;


/*
 * Static method: Kibo.stringContains
 * Checks if a given string contains a specified substring.
 */
Kibo.stringContains = function ( string , substring ) {
    return string.indexOf ( substring ) !== -1 ;
} ;


/*
 * Static method: Kibo.neatString
 * Cleans up a string by trimming leading/trailing whitespace and collapsing
 * multiple internal spaces into single spaces.
 */
Kibo.neatString = function ( string ) {
    return string.replace ( /^\s+|\s+$/g , '' ) .replace ( /\s+/g , ' ' ) ;
} ;


/*
 * Static method: Kibo.capitalize
 * Capitalizes the first letter of a string after converting it to lowercase.
 */
Kibo.capitalize = function ( string ) {
    return string.toLowerCase ( ) .replace ( /^./ , function ( match ) { return match.toUpperCase ( ) ; } ) ;
} ;


/*
 * Static method: Kibo.isString
 * Determines if a given variable is a string.
 * Uses Object.prototype.toString for robust type checking.
 */
Kibo.isString = function ( what ) {
    return Kibo.stringContains ( Object.prototype.toString.call ( what ) , 'String' ) ;
} ;


/*
 * Static method: Kibo.arrayIncludes
 * Checks if an array contains a specific element.
 * Uses Array.prototype.indexOf for modern browsers, falls back to a manual loop for older ones.
 */
Kibo.arrayIncludes = ( function ( ) {
    if ( Array.prototype.indexOf ) {
        return function ( haystack , needle ) {
            return haystack.indexOf ( needle ) !== -1 ;
        } ;
    }
    else {
        return function ( haystack , needle ) {
            for ( var i = 0 ; i < haystack.length ; i ++ ) {
                if ( haystack [ i ] === needle ) {
                    return true ;
                }
            }
            return false ;
        } ;
    }
} ) ( ) ;


/*
 * Static method: Kibo.extractModifiers
 * Extracts modifier keys (shift, ctrl, alt) present in a key combination string.
 *
 * @param {string} keyCombination - A string representing a key combination (e.g., "ctrl shift a").
 * @returns {Array<string>} An array of modifier key names found in the combination.
 */
Kibo.extractModifiers = function ( keyCombination ) {
    var modifiers , i ;
    modifiers = [ ] ;
    for ( i = 0 ; i < Kibo.MODIFIERS.length ; i ++ ) {
        if ( Kibo.stringContains ( keyCombination , Kibo.MODIFIERS [ i ] ) ) {
            modifiers.push ( Kibo.MODIFIERS [ i ] ) ;
        }
    }
    return modifiers ;
} ;


/*
 * Static method: Kibo.extractKey
 * Extracts the primary non-modifier key from a key combination string.
 *
 * @param {string} keyCombination - A string representing a key combination (e.g., "ctrl shift a").
 * @returns {string|undefined} The name of the primary key, or undefined if only modifiers are present.
 */
Kibo.extractKey = function ( keyCombination ) {
    var keys , i ;
    keys = Kibo.neatString ( keyCombination ) .split ( ' ' ) ;
    for ( i = 0 ; i < keys.length ; i ++ ) {
        if ( ! Kibo.arrayIncludes ( Kibo.MODIFIERS , keys [ i ] ) ) {
            return keys [ i ] ;
        }
    }
} ;


/*
 * Static method: Kibo.modifiersAndKey
 * Processes a key combination string to return a standardized string
 * containing modifiers and the primary key, or a special "any" combination.
 *
 * @param {string} keyCombination - The raw key combination string.
 * @returns {string} A standardized string like "ctrl shift a" or "any arrow".
 */
Kibo.modifiersAndKey = function ( keyCombination ) {
    var result , key ;

    // Handle special "any" wildcard combinations.
    if ( Kibo.stringContains ( keyCombination , 'any' ) ) {
        return Kibo.neatString ( keyCombination ) .split ( ' ' ) .slice ( 0 , 2 ) .join ( ' ' ) ;
    }

    // Extract modifiers first.
    result = Kibo.extractModifiers ( keyCombination ) ;

    // Then extract the primary key and add it if it's not a modifier itself.
    key = Kibo.extractKey ( keyCombination ) ;
    if ( key && ! Kibo.arrayIncludes ( Kibo.MODIFIERS , key ) ) {
        result.push ( key ) ;
    }

    // Join all parts with spaces.
    return result.join ( ' ' ) ;
} ;


/*
 * Static method: Kibo.keyName
 * Converts a numeric key code to its human-readable name.
 *
 * @param {number} keyCode - The numeric key code from a keyboard event.
 * @returns {string|undefined} The name of the key, or undefined if not found.
 */
Kibo.keyName = function ( keyCode ) {
    return Kibo.KEY_NAMES_BY_CODE [ keyCode + '' ] ;
} ;


/*
 * Static method: Kibo.keyCode
 * Converts a key name to its numeric key code.
 *
 * @param {string} keyName - The human-readable name of the key.
 * @returns {number|NaN} The numeric key code, or NaN if not found.
 */
Kibo.keyCode = function ( keyName ) {
    return + Kibo.KEY_CODES_BY_NAME [ keyName ] ;
} ;


/*
 * Kibo.prototype.initialize
 * Initializes an instance of Kibo, setting up internal state and event listeners.
 */
Kibo.prototype.initialize = function ( ) {
    var i , that = this ;

    // Store the last key code pressed.
    this.lastKeyCode = -1 ;

    // Initialize an object to track the state of modifier keys (pressed or not).
    this.lastModifiers = { } ;
    for ( i = 0 ; i < Kibo.MODIFIERS.length ; i ++ ) {
        this.lastModifiers [ Kibo.MODIFIERS [ i ] ] = false ;
    }

    // Initialize objects to store registered keydown and keyup handlers.
    // 'any' is for handlers that trigger on any key.
    this.keysDown = { any: [ ] } ;
    this.keysUp = { any: [ ] } ;

    // Initialize arrays for wildcard key handlers (e.g., 'any arrow', 'any number').
    for ( i = 0 ; i < Kibo.WILDCARD_TYPES.length ; i ++ ) {
        this.keysDown [ 'any ' + Kibo.WILDCARD_TYPES [ i ] ] = [ ] ;
        this.keysUp [ 'any ' + Kibo.WILDCARD_TYPES [ i ] ] = [ ] ;
    }

    // Create bound event handlers for keydown and keyup events.
    this.downHandler = this.handler ( 'down' ) ;
    this.upHandler = this.handler ( 'up' ) ;

    // Register global event listeners for keydown, keyup, and unload.
    Kibo.registerEvent ( this.element , 'keydown' , this.downHandler ) ;
    Kibo.registerEvent ( this.element , 'keyup' , this.upHandler ) ;

    // Register an unload event handler to clean up event listeners when the page unloads.
    Kibo.registerEvent ( window , 'unload' , function unloader ( ) {
        Kibo.unregisterEvent ( that.element , 'keydown' , that.downHandler ) ;
        Kibo.unregisterEvent ( that.element , 'keyup' , that.upHandler ) ;
        Kibo.unregisterEvent ( window , 'unload' , unloader ) ;
    } ) ;
} ;


/*
 * Kibo.prototype.handler
 * Returns a generic event handler function for either 'down' or 'up' key events.
 * This function processes the event, updates Kibo's state, and invokes registered callbacks.
 *
 * @param {string} upOrDown - Specifies whether this handler is for 'down' or 'up' events.
 * @returns {Function} The event handler function.
 */
Kibo.prototype.handler = function ( upOrDown ) {
    var that = this ; // Capture 'this' for use within the returned closure.

    return function ( e ) {
        var i , j , registeredKeys , lastModifiersAndKey ;

        // Normalize the event object for cross-browser compatibility.
        e = e || window.event ;

        // Store the last key code from the event.
        that.lastKeyCode = e.keyCode ;

        // Update the state of modifier keys based on the event object.
        for ( i = 0 ; i < Kibo.MODIFIERS.length ; i ++ ) {
            that.lastModifiers [ Kibo.MODIFIERS [ i ] ] = e [ Kibo.MODIFIERS [ i ] + 'Key' ] ;
        }
        // If the last pressed key itself was a modifier, mark it as pressed.
        if ( Kibo.arrayIncludes ( Kibo.MODIFIERS , Kibo.keyName ( that.lastKeyCode ) ) ) {
            that.lastModifiers [ Kibo.keyName ( that.lastKeyCode ) ] = true ;
        }

        // Get the appropriate set of registered keys (either `keysDown` or `keysUp`).
        registeredKeys = that [ 'keys' + Kibo.capitalize ( upOrDown ) ] ;

        // --- Execute 'any' key handlers ---
        // These handlers are triggered regardless of which key was pressed.
        for ( i = 0 ; i < registeredKeys.any.length ; i ++ ) {
            // If a handler returns false and preventDefault is available, call it.
            if ( ( registeredKeys.any [ i ] ( e ) === false ) && e.preventDefault ) {
                e.preventDefault ( ) ;
            }
        }

        // --- Execute wildcard key handlers (e.g., 'any arrow', 'any number') ---
        for ( i = 0 ; i < Kibo.WILDCARD_TYPES.length ; i ++ ) {
            // Check if the current key belongs to the current wildcard type.
            if ( Kibo.arrayIncludes ( Kibo.WILDCARDS [ Kibo.WILDCARD_TYPES [ i ] ] , that.lastKeyCode ) ) {
                // If it does, iterate through and execute all handlers for that wildcard type.
                for ( j = 0 ; j < registeredKeys [ 'any ' + Kibo.WILDCARD_TYPES [ i ] ] .length ; j ++ ) {
                    if ( ( registeredKeys [ 'any ' + Kibo.WILDCARD_TYPES [ i ] ] [ j ] ( e ) === false ) && e.preventDefault ) {
                        e.preventDefault ( ) ;
                    }
                }
            }
        }

        // --- Execute specific key combination handlers ---
        // Determine the standardized string for the current key combination (modifiers + key).
        lastModifiersAndKey = that.lastModifiersAndKey ( ) ;
        if ( registeredKeys [ lastModifiersAndKey ] ) {
            // If handlers are registered for this specific combination, execute them.
            for ( i = 0 ; i < registeredKeys [ lastModifiersAndKey ] .length ; i ++ ) {
                if ( ( registeredKeys [ lastModifiersAndKey ] [ i ] ( e ) === false ) && e.preventDefault ) {
                    e.preventDefault ( ) ;
                }
            }
        }
    } ;
} ;


/*
 * Kibo.prototype.registerKeys
 * Registers one or more key combination handlers for either keydown or keyup events.
 *
 * @param {string} upOrDown - 'down' for keydown events, 'up' for keyup events.
 * @param {string|Array<string>} newKeys - A single key combination string or an array of them.
 * @param {Function} func - The callback function to execute when the key combination is triggered.
 * @returns {Kibo} The current Kibo instance, for chaining.
 */
Kibo.prototype.registerKeys = function ( upOrDown , newKeys , func ) {
    var i , keys , registeredKeys = this [ 'keys' + Kibo.capitalize ( upOrDown ) ] ;

    // Ensure newKeys is an array for consistent processing.
    if ( Kibo.isString ( newKeys ) ) {
        newKeys = [ newKeys ] ;
    }

    // Iterate through each key combination provided.
    for ( i = 0 ; i < newKeys.length ; i ++ ) {
        keys = newKeys [ i ] ;
        // Standardize the key combination string.
        keys = Kibo.modifiersAndKey ( keys + '' ) ;

        // Add the function to the appropriate array of handlers.
        if ( registeredKeys [ keys ] ) {
            registeredKeys [ keys ] .push ( func ) ;
        }
        else {
            registeredKeys [ keys ] = [ func ] ;
        }
    }

    return this ; // Allow method chaining.
} ;


/*
 * Kibo.prototype.unregisterKeys
 * Unregisters one or more key combination handlers.
 *
 * @param {string} upOrDown - 'down' for keydown events, 'up' for keyup events.
 * @param {string|Array<string>} newKeys - A single key combination string or an array of them.
 * @param {Function|null} func - The specific callback function to remove, or null to remove all handlers for the key combination.
 * @returns {Kibo} The current Kibo instance, for chaining.
 */
Kibo.prototype.unregisterKeys = function ( upOrDown , newKeys , func ) {
    var i , j , keys , registeredKeys = this [ 'keys' + Kibo.capitalize ( upOrDown ) ] ;

    // Ensure newKeys is an array for consistent processing.
    if ( Kibo.isString ( newKeys ) ) {
        newKeys = [ newKeys ] ;
    }

    // Iterate through each key combination provided.
    for ( i = 0 ; i < newKeys.length ; i ++ ) {
        keys = newKeys [ i ] ;
        // Standardize the key combination string.
        keys = Kibo.modifiersAndKey ( keys + '' ) ;

        // If func is null, delete all handlers for this key combination.
        if ( func === null ) {
            delete registeredKeys [ keys ] ;
        }
        else {
            // Otherwise, remove the specific function from the array of handlers.
            if ( registeredKeys [ keys ] ) {
                for ( j = 0 ; j < registeredKeys [ keys ] .length ; j ++ ) {
                    // Compare functions by their string representation (a common, though not perfect, way).
                    if ( String ( registeredKeys [ keys ] [ j ] ) === String ( func ) ) {
                        registeredKeys [ keys ] .splice ( j , 1 ) ; // Remove the function.
                        break ; // Exit loop after finding and removing.
                    }
                }
            }
        }
    }

    return this ; // Allow method chaining.
} ;


/*
 * Kibo.prototype.delegate
 * A helper method that acts as a dispatcher for registering or unregistering keys.
 *
 * @param {string} upOrDown - 'down' or 'up'.
 * @param {string|Array<string>} keys - Key combination(s).
 * @param {Function|null} func - Callback function or null to unregister all.
 * @returns {Kibo} The current Kibo instance, for chaining.
 */
Kibo.prototype.delegate = function ( upOrDown , keys , func ) {
    return func !== null
        ? this.registerKeys ( upOrDown , keys , func )
        : this.unregisterKeys ( upOrDown , keys , func ) ;
} ;


/*
 * Kibo.prototype.down
 * Registers a keydown handler for one or more key combinations.
 *
 * @param {string|Array<string>} keys - Key combination(s) (e.g., "a", "ctrl s", ["shift enter", "tab"]).
 * @param {Function|null} func - The callback function to execute, or null to unregister.
 * @returns {Kibo} The current Kibo instance, for chaining.
 */
Kibo.prototype.down = function ( keys , func ) {
    return this.delegate ( 'down' , keys , func ) ;
} ;


/*
 * Kibo.prototype.up
 * Registers a keyup handler for one or more key combinations.
 *
 * @param {string|Array<string>} keys - Key combination(s).
 * @param {Function|null} func - The callback function to execute, or null to unregister.
 * @returns {Kibo} The current Kibo instance, for chaining.
 */
Kibo.prototype.up = function ( keys , func ) {
    return this.delegate ( 'up' , keys , func ) ;
} ;


/*
 * Kibo.prototype.lastKey
 * Retrieves information about the last key pressed.
 * Can return the name of the last key, or the state of a specific modifier key.
 *
 * @param {string} [modifier] - Optional. The name of a modifier key (e.g., 'shift', 'ctrl') to check its state.
 * @returns {string|boolean|undefined} The name of the last key, the boolean state of a modifier, or undefined.
 */
Kibo.prototype.lastKey = function ( modifier ) {
    if ( ! modifier ) {
        return Kibo.keyName ( this.lastKeyCode ) ;
    }

    return this.lastModifiers [ modifier ] ;
} ;


/*
 * Kibo.prototype.lastModifiersAndKey
 * Generates a standardized string representing the last key combination pressed,
 * including any active modifier keys.
 *
 * @returns {string} A string like "ctrl shift a" or "shift enter".
 */
Kibo.prototype.lastModifiersAndKey = function ( ) {
    var result , i ;

    result = [ ] ;
    // Add any active modifier keys to the result array.
    for ( i = 0 ; i < Kibo.MODIFIERS.length ; i ++ ) {
        if ( this.lastKey ( Kibo.MODIFIERS [ i ] ) ) {
            result.push ( Kibo.MODIFIERS [ i ] ) ;
        }
    }

    // Add the primary key if it's not already included (i.e., not a modifier itself).
    if ( ! Kibo.arrayIncludes ( result , this.lastKey ( ) ) ) {
        result.push ( this.lastKey ( ) ) ;
    }

    // Join the parts with spaces to form the final combination string.
    return result.join ( ' ' ) ;
} ;