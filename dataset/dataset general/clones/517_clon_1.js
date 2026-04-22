/*
 * This is a Type I clone generated from the original source.
 * It maintains exact structural and logical equivalence.
 * Only whitespace and comments have been altered significantly.
 */
( function ( root , factory ) {
  // Check for AMD loader presence and register as an anonymous module if available.
  if ( typeof define === 'function' && define.amd )
  {
    root.LazyJsonUndoRedo = factory ( ) ; // Assign the module to the root object.

    define ( function ( ) {
      return root.LazyJsonUndoRedo ; // Return the module definition.
    } ) ;
  }
  // Check for CommonJS environment.
  else if ( typeof exports === 'object' )
  {
    module.exports = factory ( ) ; // Export the module for Node.js/CommonJS.
  }
  // Default to browser globals if no specific loader is found.
  else
  {
    root.LazyJsonUndoRedo = factory ( ) ; // Attach to the global window object.
  }
} ( this , function ( ) {
  'use strict' ; // Enforce strict mode for better code quality.

  var flagCounter = 0 ; // Internal counter for managing undo/redo flags.

  /**
   * Main constructor for LazyJsonUndoRedo.
   * Initializes the undo/redo mechanism for a given object.
   * @param {object} obj - The object to observe for changes.
   */
  function LazyJsonUndoRedo ( obj ) {

    // Determine the level of support for object observation.
    var support = LazyJsonUndoRedo.checkSupport ( ) ;

    if ( support === 'polymer' ) {
      this.usePolymerShim ( ) ; // Use Polymer's shim if native support is absent.
    }
    else if ( ! support ) {
      // If no support is found, throw an error.
      throw Error ( 'This environment doesn\'t support the ES6 Object.observe()' ) ;
    }

    // Initialize internal data structures for history, whitelists, and blacklists.
    this._history = [ ] ; // Stores the sequence of changes.
    this._whitelists = [ ] ; // Object-specific whitelists.
    this._blacklists = [ ] ; // Object-specific blacklists.
    this._globalWhitelist = [ ] ; // Global whitelist for properties.
    this._globalBlacklist = [ ] ; // Global blacklist for properties.
    this._pointer = -1 ; // Current position in the history array.
    this._recChanges = this._recChanges.bind ( this ) ; // Bind the change recording function to 'this'.

    this.observeTree ( obj ) ; // Start observing the object and its children.
  }

  // Alias the prototype for cleaner code and minification.
  var p = LazyJsonUndoRedo.prototype ;

  /**
   * Recursively observes an object and its nested objects for changes.
   * @param {object} obj - The object to observe.
   * @param {Array} [route] - Internal parameter to track object hierarchy and prevent circular references.
   */
  p.observeTree = function ( obj , route ) {

    // Exit if the object is null or not an object.
    if ( ! obj || typeof ( obj ) !== 'object' ) {
      return ;
    }

    // Append the current object to the route to detect circular references.
    route = ( route || [ ] ) . concat ( [ obj ] ) ;

    this.observe ( obj ) ; // Observe the current object.

    // Iterate over the object's keys to observe nested objects.
    Object.keys ( obj ) . forEach ( function ( key ) {

      // Check if the property is an object, not a circular reference, and is listenable.
      if ( typeof ( obj [ key ] ) === 'object' &&
        route.indexOf ( obj [ key ] ) === -1 && // Avoid infinite loops with circular structures.
        this._isListenable ( obj , key ) )
      {
        this.observeTree ( obj [ key ] , route ) ; // Recursively observe the nested object.
      }
    } , this ) ; // Ensure 'this' context is preserved for the callback.
  } ;

  /**
   * Recursively unobserves an object and its nested objects.
   * @param {object} obj - The object to unobserve.
   * @param {Array} [route] - Internal parameter to track object hierarchy.
   */
  p.unobserveTree = function ( obj , route ) {

    if ( ! obj || typeof ( obj ) !== 'object' ) {
      return ;
    }

    // Build the route to avoid re-unobserving objects in a circular structure.
    route = ( route || [ ] ) . concat ( [ obj ] ) ;

    this.unobserve ( obj ) ; // Unobserve the current object.

    Object.keys ( obj ) . forEach ( function ( key ) {

      // Only unobserve nested objects that are not part of a circular reference.
      if ( typeof ( obj [ key ] ) === 'object' &&
        route.indexOf ( obj [ key ] ) === -1 )
      {
        this.unobserveTree ( obj [ key ] ) ; // Recursively unobserve children.
      }
    } , this ) ;
  } ;

  /**
   * Starts observing a single object for changes.
   * Uses Array.observe for arrays and Object.observe for plain objects.
   * @param {object} obj - The object to observe.
   */
  p.observe = function ( obj ) {

    // Determine the correct observe function based on object type.
    var observeFn = obj.constructor && obj.constructor.observe || ( Array.isArray ( obj ) ? Array.observe : Object.observe ) ;
    observeFn ( obj , this._recChanges ) ; // Attach the change recorder.
  } ;

  /**
   * Stops observing a single object for changes.
   * Uses Array.unobserve for arrays and Object.unobserve for plain objects.
   * @param {object} obj - The object to unobserve.
   */
  p.unobserve = function ( obj ) {

    // Determine the correct unobserve function.
    var unobserveFn = obj.constructor && obj.constructor.unobserve || ( Array.isArray ( obj ) ? Array.unobserve : Object.unobserve ) ;
    unobserveFn ( obj , this._recChanges ) ; // Detach the change recorder.
  } ;

  /**
   * Checks the environment for native or Polymer-based Object.observe support.
   * @returns {string|boolean} 'native', 'polymer', or false if unsupported.
   */
  LazyJsonUndoRedo.checkSupport = function ( ) {

    // Check for native ES6 Object.observe and Array.observe.
    if ( typeof ( Object.observe ) === 'function' && typeof ( Array.observe ) === 'function' ) {

      return 'native' ; // Native support is available.
    }
    // Check for Polymer's ObjectObserver/ArrayObserver shim.
    else if ( typeof ( exports ) !== 'object' && typeof ( Platform ) !== 'undefined' && typeof ( Platform.performMicrotaskCheckpoint ) === 'function' &&
      typeof ( ObjectObserver ) === 'function' && typeof ( ArrayObserver ) === 'function' )
    {
      return 'polymer' ; // Polymer shim is available.
    }

    return false ; // No supported observation mechanism found.
  } ;

  /**
   * Records changes received from Object.observe/Array.observe callbacks.
   * Manages the history and pointer for undo/redo operations.
   * @param {Array<object|number>} changes - An array of change records or flag numbers.
   * @private
   */
  p._recChanges = function ( changes ) {

    // If the pointer is not at the end of history, truncate it (discard future states).
    if ( this._pointer < this._history.length - 1 ) {

      this._history.splice ( this._pointer + 1 ) ;
    }

    changes.forEach ( function ( change ) {

      if ( typeof ( change ) === 'number' ) { // If the change is a number, it's a flag.

        this._history.push ( change ) ; // Store the flag.

        ++this._pointer ; // Advance the pointer.
      }
      // Only record changes to listenable properties.
      else if ( this._isListenable ( change.object , change.name ) ) {

        var rec = Object.create ( null ) ; // Create a plain object for the record.

        // Copy all properties from the change object to the record.
        Object.keys ( change ) . forEach ( function ( key ) {

          rec [ key ] = change [ key ] ;
        } ) ;

        this._history.push ( rec ) ; // Add the record to history.

        this.observeTree ( change.object ) ; // Ensure the affected object is still observed.

        ++this._pointer ; // Advance the pointer.
      }
    } , this ) ; // Ensure 'this' context for the callback.
  } ;

  /**
   * Performs an undo operation, reverting the last recorded change.
   * Handles flags for multi-step undo operations.
   * @returns {boolean} True if undo was performed, false otherwise.
   */
  p.undo = function ( ) {

    this.rec ( ) ; // Ensure all pending changes are processed before undo.

    if ( this._pointer < 0 ) {

      return false ; // Cannot undo if history is empty.
    }

    var rec = this._history [ this._pointer-- ] ; // Get the last record and decrement pointer.

    if ( typeof ( rec ) === 'number' ) { // If it's a flag, undo to the previous flag.

      var startFlagIdx = this._history.indexOf ( rec - 1 ) ; // Find the start of the flagged block.

      if ( startFlagIdx !== -1 ) {

        while ( this._pointer !== startFlagIdx ) {

          this._reverseRecord ( this._history [ this._pointer-- ] ) ; // Reverse records until the flag.
        }

        this._pointer-- ; // Move past the start flag itself.
      }
    }
    else {
      this._reverseRecord ( rec ) ; // Reverse a single change record.
    }
  } ;

  /**
   * Performs a redo operation, reapplying the next recorded change.
   * Handles flags for multi-step redo operations.
   * @returns {boolean} True if redo was performed, false otherwise.
   */
  p.redo = function ( ) {

    this.rec ( ) ; // Ensure all pending changes are processed before redo.

    if ( this._pointer >= this._history.length - 1 ) {

      return false ; // Cannot redo if at the end of history.
    }

    var rec = this._history [ ++this._pointer ] ; // Get the next record and increment pointer.

    if ( typeof ( rec ) === 'number' ) { // If it's a flag, redo up to the next flag.

      var endFlagIdx = this._history.indexOf ( rec + 1 ) ; // Find the end of the flagged block.

      if ( endFlagIdx !== -1 ) {

        while ( ++this._pointer !== endFlagIdx ) {

          this._reverseRecord ( this._history [ this._pointer ] ) ; // Reverse records until the next flag.
        }
      }
    }
    else {
      this._reverseRecord ( rec ) ; // Reverse a single change record.
    }
  } ;

  /**
   * Delivers any pending change records immediately.
   * This ensures that the history is up-to-date before performing undo/redo.
   */
  p.rec = function ( ) {

    Object.deliverChangeRecords ( this._recChanges ) ; // Force delivery of changes.
  } ;

  /**
   * Reverts a single change record, effectively undoing or redoing it.
   * @param {object|number} rec - The change record to reverse.
   * @private
   */
  p._reverseRecord = function ( rec ) {

    if ( typeof ( rec ) === 'number' ) { // Flags are not reversible changes.
      return ;
    }

    var temp ; // Temporary variable for swapping values.

    this.unobserve ( rec.object ) ; // Temporarily unobserve the object to prevent re-recording the reversal.

    switch ( rec.type ) {

      case 'add' : // Reversing an 'add' means deleting the property.
        rec.type = 'delete' ;
        rec.oldValue = rec.object [ rec.name ] ;
        delete rec.object [ rec.name ] ;
        break ;

      case 'update' : // Reversing an 'update' means swapping current and old values.
        temp = rec.object [ rec.name ] ;
        rec.object [ rec.name ] = rec.oldValue ;
        rec.oldValue = temp ;
        break ;

      case 'delete' : // Reversing a 'delete' means re-adding the property.
        rec.type = 'add' ;
        rec.object [ rec.name ] = rec.oldValue ;
        delete rec.oldValue ; // The 'oldValue' is now the current value, so it's no longer 'old'.
        break ;

      case 'splice' : // Reversing a 'splice' requires another splice operation.
        temp = Array.prototype.splice.apply ( rec.object , [ rec.index , rec.addedCount ] . concat ( rec.removed ) ) ;
        rec.addedCount = rec.removed.length ;
        rec.removed = temp ;
        break ;
    }

    this.observe ( rec.object ) ; // Re-observe the object after the reversal.
  } ;

  /**
   * Marks the beginning of a multi-step operation.
   * All changes between startFlag and endFlag can be undone/redone as a single unit.
   * @returns {number} The flag value for the current operation.
   */
  p.startFlag = function ( ) {

    this.rec ( ) ; // Process any pending changes before flagging.

    this._recChanges ( [ flagCounter++ ] ) ; // Record a flag with an incremented counter.
    return flagCounter++ ; // Return the flag value, then increment again for the next flag.
  } ;

  /**
   * Marks the end of a multi-step operation.
   * @param {number} flag - The flag value returned by startFlag.
   */
  p.endFlag = function ( flag ) {

    this.rec ( ) ; // Process any pending changes before marking end.
    this._recChanges ( [ flag ] ) ; // Record the matching end flag.
  } ;

  /**
   * Wraps a function, making its execution an atomic undo/redo operation.
   * All changes within the wrapped function call are grouped.
   * @param {Function} fn - The function to wrap.
   * @param {object} ctx - The context (this) for the function.
   * @returns {Function} A new function that, when called, executes the original function atomically.
   */
  p.wrap = function ( fn , ctx ) {

    var that = this ; // Capture 'this' for the closure.

    return function ( ) {

      var endFlag = that.startFlag ( ) ; // Start a new flag for this operation.

      // Apply the original function with its context and arguments (skipping the first two).
      fn.apply ( ctx , Array.prototype.slice.call ( arguments , 2 ) ) ;

      that.endFlag ( endFlag ) ; // End the flag, grouping all changes.
    } ;
  } ;

  /*
   * --------------------------------------------------------------------------------------------------
   * Section: White- and blacklisting functionality
   * These methods control which properties are observed for changes.
   * --------------------------------------------------------------------------------------------------
   */

  /**
   * Sets a whitelist for a specific object. Only properties in this list will be observed.
   * @param {object} obj - The object to apply the whitelist to.
   * @param {Array<string>} list - An array of property names to whitelist.
   */
  p.setWhitelist = function ( obj , list ) {

    this.removeWhitelist ( obj ) ; // Remove any existing whitelist for this object.

    this._whitelists.push ( { obj : obj , list : list } ) ; // Add the new whitelist.
  } ;

  /**
   * Retrieves the whitelist for a given object.
   * @param {object} obj - The object whose whitelist to retrieve.
   * @returns {object|undefined} The whitelist object ({obj, list}) or undefined if not found.
   */
  p.getWhitelist = function ( obj ) {

    for ( var i = 0 , l = this._whitelists.length ; i < l ; ++i ) {

      if ( this._whitelists [ i ] . obj === obj ) {

        return this._whitelists [ i ] ; // Return the matching whitelist.
      }
    }
  } ;

  /**
   * Removes the whitelist for a specific object.
   * @param {object} obj - The object whose whitelist to remove.
   */
  p.removeWhitelist = function ( obj ) {

    for ( var i = 0 ; i < this._whitelists.length ; ++i ) {

      if ( this._whitelists [ i ] . obj === obj ) {

        this._whitelists.splice ( i-- , 1 ) ; // Remove and adjust index to re-check the current position.
      }
    }
  } ;

  /**
   * Sets a blacklist for a specific object. Properties in this list will NOT be observed.
   * @param {object} obj - The object to apply the blacklist to.
   * @param {Array<string>} list - An array of property names to blacklist.
   */
  p.setBlacklist = function ( obj , list ) {

    this.removeBlacklist ( obj ) ; // Remove any existing blacklist for this object.

    this._blacklists.push ( { obj : obj , list : list } ) ; // Add the new blacklist.
  } ;

  /**
   * Retrieves the blacklist for a given object.
   * @param {object} obj - The object whose blacklist to retrieve.
   * @returns {object|undefined} The blacklist object ({obj, list}) or undefined if not found.
   */
  p.getBlacklist = function ( obj ) {

    for ( var i = 0 , l = this._blacklists.length ; i < l ; ++i ) {

      if ( this._blacklists [ i ] . obj === obj ) {

        return this._blacklists [ i ] ; // Return the matching blacklist.
      }
    }
  } ;

  /**
   * Removes the blacklist for a specific object.
   * @param {object} obj - The object whose blacklist to remove.
   */
  p.removeBlacklist = function ( obj ) {

    for ( var i = 0 ; i < this._blacklists.length ; ++i ) {

      if ( this._blacklists [ i ] . obj === obj ) {

        this._blacklists.splice ( i-- , 1 ) ; // Remove and adjust index.
      }
    }
  } ;

  /**
   * Adds one or more keys to the global whitelist.
   * Globally whitelisted keys are always observed, overriding any object-specific blacklists.
   * @param {...string} keys - Property names to add to the global whitelist.
   */
  p.addToGlobalWhitelist = function ( /*...keys*/ ) {

    var args = arguments ; // Get all arguments passed.

    for ( var i = 0 , l = args.length ; i < l ; ++i ) {

      this._globalWhitelist.push ( args [ i ] ) ; // Add each key to the global whitelist.
    }
  } ;

  /**
   * Removes one or more keys from the global whitelist.
   * @param {...string} keys - Property names to remove from the global whitelist.
   */
  p.removeFromGlobalWhitelist = function ( /*...keys*/ ) {

    var args = arguments ; // Get all arguments passed.

    this._globalWhitelist = this._globalWhitelist.filter ( function ( paramName ) {

      // Keep only those parameters not found in the 'args' (keys to remove).
      return Array.prototype.indexOf.call ( args , paramName ) === -1 ;
    } ) ;
  } ;

  /**
   * Adds one or more keys to the global blacklist.
   * Globally blacklisted keys are never observed, overriding any object-specific whitelists.
   * @param {...string} keys - Property names to add to the global blacklist.
   */
  p.addToGlobalBlacklist = function ( /*...keys*/ ) {

    var args = arguments ; // Get all arguments passed.

    for ( var i = 0 , l = args.length ; i < l ; ++i ) {

      this._globalBlacklist.push ( args [ i ] ) ; // Add each key to the global blacklist.
    }
  } ;

  /**
   * Removes one or more keys from the global blacklist.
   * @param {...string} keys - Property names to remove from the global blacklist.
   */
  p.removeFromGlobalBlacklist = function ( /*...keys*/ ) {

    var args = arguments ; // Get all arguments passed.

    this._globalBlacklist = this._globalBlacklist.filter ( function ( paramName ) {

      // Keep only those parameters not found in the 'args' (keys to remove).
      return Array.prototype.indexOf.call ( args , paramName ) === -1 ;
    } ) ;
  } ;

  /**
   * Determines if a specific property of an object should be observed for changes.
   * Applies global and object-specific whitelists/blacklists.
   * @param {object} obj - The object containing the property.
   * @param {string} paramName - The name of the property.
   * @returns {boolean} True if the property should be listened to, false otherwise.
   * @private
   */
  p._isListenable = function ( obj , paramName ) {

    var wl = this.getWhitelist ( obj ) , // Get object's whitelist.
      bl = this.getBlacklist ( obj ) ; // Get object's blacklist.

    // If an object-specific whitelist exists and the parameter is not in it, don't listen.
    if ( wl && wl.list.indexOf ( paramName ) === -1 ) {

      return false ;
    }

    // If an object-specific blacklist exists and the parameter is in it, don't listen.
    if ( bl && bl.list.indexOf ( paramName ) !== -1 ) {

      return false ;
    }

    // If a global whitelist exists (and is not empty) and the parameter is not in it, don't listen.
    if ( this._globalWhitelist.length !== 0 && this._globalWhitelist.indexOf ( paramName ) === -1 ) {

      return false ;
    }

    // If the parameter is in the global blacklist, don't listen.
    if ( this._globalBlacklist.indexOf ( paramName ) !== -1 ) {

      return false ;
    }

    return true ; // If no rules prevent listening, then listen.
  } ;

  /*
   * --------------------------------------------------------------------------------------------------
   * Section: Polymer plugin integration
   * Provides compatibility with Polymer's ObjectObserver/ArrayObserver when native support is absent.
   * --------------------------------------------------------------------------------------------------
   */

  /**
   * Initializes the Polymer shim for object observation.
   * This method overrides the default `rec`, `observe`, and `unobserve` methods
   * to use Polymer's observation mechanisms.
   */
  p.usePolymerShim = function ( ) {

    // Only initialize the shim once.
    if ( this._isPolymerShimInited ) {
      return ;
    }
    this._isPolymerShimInited = true ; // Mark as initialized.
    this.usingShim = true ; // Indicate that a shim is in use.

    var observers = [ ] , observeds = [ ] ; // Arrays to manage Polymer observers and observed objects.

    // Override the 'rec' method to trigger Polymer's microtask checkpoint.
    this.rec = function ( ) {

      Platform.performMicrotaskCheckpoint ( ) ; // Force pending changes to be delivered.
    } ;

    // Override the 'observe' method to use Polymer's observation.
    this.observe = function ( obj ) {

      // Differentiate between array and object observation.
      Array.isArray ( obj ) ? observeArr.call ( this , obj ) : observeObj.call ( this , obj ) ;
    } ;

    // Override the 'unobserve' method to close Polymer observers.
    this.unobserve = function ( obj ) {

      var idx = observeds.indexOf ( obj ) ; // Find the object in the list of observeds.

      if ( idx !== -1 ) {

        observeds.splice ( idx , 1 ) ; // Remove from observed list.
        observers.splice ( idx , 1 ) [ 0 ] . close ( ) ; // Remove and close the corresponding observer.
      }
    } ;

    /**
     * Helper function to check if an object is already being observed by the shim.
     * @param {object} obj - The object to check.
     * @returns {boolean} True if observed, false otherwise.
     */
    function isObserved ( obj ) {

      return observeds.indexOf ( obj ) !== -1 ;
    }

    /**
     * Observes a plain object using Polymer's ObjectObserver.
     * @param {object} obj - The object to observe.
     */
    function observeObj ( obj ) {

      if ( isObserved ( obj ) ) {
        return ; // Don't observe if already observed.
      }

      var that = this , observer = new ObjectObserver ( obj ) ; // Create a new ObjectObserver.

      observeds.push ( obj ) ; // Add to list of observed objects.
      observers.push ( observer ) ; // Add to list of active observers.

      // Open the observer and provide a callback for changes.
      observer.open ( function ( added , removed , changed , getOldValueFn ) {

        var changes = [ ] ; // Array to accumulate changes in a standard format.

        // Process 'added' properties.
        Object.keys ( added ) . forEach ( function ( property ) {
          changes.push ( { object : obj , type : 'add' , name : property } ) ;
        } ) ;

        // Process 'removed' properties.
        Object.keys ( removed ) . forEach ( function ( property ) {
          changes.push ( { object : obj , type : 'delete' , name : property , oldValue : getOldValueFn ( property ) } ) ;
        } ) ;

        // Process 'changed' properties.
        Object.keys ( changed ) . forEach ( function ( property ) {
          changes.push ( { object : obj , type : 'update' , name : property , oldValue : getOldValueFn ( property ) } ) ;
        } ) ;
      } ) ;
    }
  } ; // End of p.usePolymerShim
} ) ) ; // End of IIFE and its invocation.