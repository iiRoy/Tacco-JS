/*
 * Inverse.js - A simple Inversion of Control (IoC) container
 *
 * This file provides a basic dependency injection mechanism for JavaScript.
 * It supports binding callbacks, registering singletons, and
 * managing object instances.
 *
 * Author: Code Clone Generator
 * Version: 1.0.0 (Type I Clone)
 */

( function ( root, factory ) {
  // Universal Module Definition (UMD) pattern for compatibility.

  // Check if AMD (Asynchronous Module Definition) is available.
  if ( typeof define === 'function' && define.amd ) {
    define( [ ], factory );
  }

  // Check if CommonJS (Node.js) is available.
  else if ( typeof exports === 'object' ) {
    module.exports = factory( );
  }

  // If neither, expose Inverse globally on the root object (e.g., window in browsers).
  else {
    root.Inverse = factory( );
  }
} )( this, function ( ) {
  // Ensure strict mode for cleaner code and fewer errors.
  'use strict';

  /**
   * The main Inverse constructor function.
   * Initializes internal storage for bound callbacks, singletons,
   * instantiated singletons, and registered objects.
   * @constructor
   */
  var Inverse = function ( ) {
    // Stores callbacks bound to names. These are re-evaluated each time.
    this._boundCallbacks = { };

    // Stores callbacks for singleton instances.
    this._singletonCallbacks = { };

    // Stores already instantiated singleton objects.
    this._instantiatedSingletons = { };

    // Stores pre-registered object instances.
    this._registeredObjects = { };
  };


  /**
   * Resolves and returns an instance of the specified dependency.
   * It checks registered objects, then singletons, then bound callbacks.
   * @param {string} name - The name of the dependency to resolve.
   * @param {...any} args - Additional arguments to pass to the callback if invoked.
   * @returns {any|null} The resolved dependency instance or null if not found.
   */
  Inverse.prototype.make = function ( name ) {
    // First, check if an object is already directly registered under this name.
    if ( this._registeredObjects.hasOwnProperty( name ) ) {
      return this._registeredObjects[ name ];
    }

    // Collect additional arguments passed to 'make' after the 'name'.
    var args = Array.prototype.slice.call( arguments, 1 );

    // Second, check if a singleton callback is registered for this name.
    if ( this._singletonCallbacks.hasOwnProperty( name ) ) {
      // If the singleton has not been instantiated yet, create it.
      if ( ! this._instantiatedSingletons.hasOwnProperty( name ) ) {
        this._instantiatedSingletons[ name ] = this._singletonCallbacks[ name ].apply( this, args );
      }

      // Return the (now instantiated) singleton instance.
      return this._instantiatedSingletons[ name ];
    }

    // Third, check if a general bound callback is registered for this name.
    if ( this._boundCallbacks.hasOwnProperty( name ) ) {
      // Execute the bound callback and return its result.
      return this._boundCallbacks[ name ].apply( this, args );
    }

    // If no matching dependency was found, return null.
    return null;
  };


  /**
   * Binds a callback function to a given name.
   * Each time 'make' is called for this name, the callback will be executed.
   * @param {string} name - The name to bind the callback to.
   * @param {function} callback - The function to be executed when 'make' is called.
   */
  Inverse.prototype.bind = function ( name, callback ) {
    this._boundCallbacks[ name ] = callback;
  };


  /**
   * Binds a callback function to a given name as a singleton.
   * The callback will be executed only once, and the same instance will be returned
   * on subsequent 'make' calls for this name.
   * @param {string} name - The name to bind the singleton callback to.
   * @param {function} callback - The function to create the singleton instance.
   */
  Inverse.prototype.singleton = function ( name, callback ) {
    this._singletonCallbacks[ name ] = callback;
  };


  /**
   * Registers an existing object instance directly under a given name.
   * When 'make' is called for this name, the registered object will be returned.
   * @param {string} name - The name to register the object under.
   * @param {any} object - The object instance to register.
   */
  Inverse.prototype.register = function ( name, object ) {
    this._registeredObjects[ name ] = object;
  };


  // Return the Inverse constructor function itself,
  // making it the public interface of this module.
  return Inverse;
} );