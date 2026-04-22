// This file is a modified version of Proton.js, adhering to Type I cloning rules.
// All logic and identifiers remain unchanged; only whitespace and comments differ.
// Original project: Proton.js (version 0.2.1)
// Author: Ali Najafizadeh, http://morezilla.net
// License: MIT Licensed

( function ( ) {

  'use strict'; // Enforce strict mode for cleaner code.

  // Define the default constructor method name.
  // This name can be customized if 'initialize' clashes with other properties.
  var init = 'initialize',
      Proton, // Main Proton object/function.
      AOP;    // Aspect-Oriented Programming module.

  // -------------------------------------------------------------------------------------------------------------------
  // Utility Function: toClass
  // Transforms a plain object (implementation) into a constructor function.
  // The 'initialize' property, if present, becomes the constructor itself.
  // Other properties are added to the prototype chain.
  //
  // @param impl {Object} The object containing method and property definitions.
  // @returns {Function} A new constructor function.
  // -------------------------------------------------------------------------------------------------------------------
  function toClass ( impl ) {

    var prop,
        clazz = impl[ init ] || function ( ) { }; // Use 'initialize' as constructor, or an empty function.

    // Iterate over all properties in the implementation object.
    for ( prop in impl ) {
      // Ensure the property is directly on the object and not inherited.
      // Also, skip the 'initialize' property as it's handled separately.
      if ( impl.hasOwnProperty( prop ) && prop !== init ) {
        clazz.prototype[ prop ] = impl[ prop ]; // Attach methods/properties to the prototype.
      }
    }

    return clazz; // Return the newly constructed class.
  }


  // -------------------------------------------------------------------------------------------------------------------
  // Utility Function: extending
  // Merges properties from a base implementation into a child implementation.
  // This function prevents overriding child's own properties and skips the 'initialize' method.
  //
  // @param childImpl {Object} The child's implementation object.
  // @param baseImpl  {Object} The base (parent) implementation object.
  // -------------------------------------------------------------------------------------------------------------------
  function extending ( childImpl, baseImpl ) {

    var prop; // Loop variable for property names.

    // Loop through properties of the base implementation.
    for ( prop in baseImpl ) {
      // If the child doesn't already have this property (and it's not 'initialize'),
      // then copy it from the base to the child.
      if ( !childImpl.hasOwnProperty( prop ) && prop !== init ) {
        childImpl[ prop ] = baseImpl[ prop ];
      }
    }
  }


  // -------------------------------------------------------------------------------------------------------------------
  // Main Proton Function
  // This is the core of the framework, providing two primary functionalities:
  // 1. Class Creation: Define a new class with an 'initialize' constructor and prototype methods.
  //    Example:
  //      var Person = Proton({
  //        initialize: function(name) { this.name = name; },
  //        getName: function() { return this.name; }
  //      });
  //      var john = new Person('John');
  //      console.log(john.getName()); // Outputs: John
  //
  // 2. Adding Class Methods: Attach static methods directly to a class constructor.
  //    Example:
  //      Proton(Person, {
  //        create: function() { return new Person('Anonymous'); }
  //      });
  //      var anon = Person.create();
  //      console.log(anon.getName()); // Outputs: Anonymous
  //
  // @param impl         {Object|Function} The class implementation object or an existing class constructor.
  // @param classMethods {Object}          (Optional) An object containing static methods to add to the class.
  // @returns {Function|undefined} The new class constructor if creating a class, otherwise undefined.
  // -------------------------------------------------------------------------------------------------------------------
  Proton = function ( impl, classMethods ) {

    // Check if classMethods are provided. If so, we are adding static methods to an existing class.
    if ( classMethods ) {
      extending( impl, classMethods ); // Merge static methods into the class constructor.
      return; // No return value when adding static methods.
    }

    // If no classMethods, we are creating a new class.
    var base = toClass( impl ); // Convert the implementation object into a constructor function.


    // ---------------------------------------------------------------------------------------------------------------
    // Class Method: extend
    // This method is added to every new class created by Proton, allowing for easy inheritance.
    // It creates a new child class that inherits from the current base class.
    //
    // @param childImpl {Object} The implementation object for the child class.
    // @returns {Function} The new child class constructor.
    // ---------------------------------------------------------------------------------------------------------------
    base.extend = function ( childImpl ) {

      var child; // Variable to hold the new child class.

      // First, extend the child's implementation with properties from the parent's implementation.
      // This ensures methods are available for potential overriding.
      extending( childImpl, impl );

      // Create the child class using Proton itself.
      child = Proton( childImpl );

      // Add a 'base' method to the child class, facilitating calling the parent's constructor.
      // This is crucial for proper inheritance initialization.
      child.base = function ( ) {
        var args        = Array.prototype.slice.call( arguments ), // Convert arguments object to an array.
            childObject = args.shift( ); // The first argument should be 'this' from the child constructor.

        // Apply the parent's constructor to the child instance.
        base.apply( childObject, args );
      };

      // Keep a reference to the parent class constructor.
      // This is useful for accessing parent's static methods or the parent constructor itself.
      child.parent = base;

      return child; // Return the newly created child class.
    };

    return base; // Return the newly created base class.
  };


  // Define the AOP (Aspect-Oriented Programming) module using Proton.
  // This module allows for injecting behavior before, after, or around method execution.
  AOP = Proton( {
    // Constructor for AOP instances. Takes a class and a method name.
    initialize: function ( klass, method ) {
      this._method = method;          // Store the name of the method to be advised.
      this._klass  = klass.prototype;  // Store the prototype of the class.
    },

    // Method to execute an 'action' before the target method.
    before: function ( action ) {
      var method = this._klass[ this._method ]; // Get the original method.

      // Replace the original method with a new one that first runs the 'action'.
      this._klass[ this._method ] = function ( ) {
        action.apply( this, arguments ); // Execute 'action' with current context and arguments.
        return method.apply( this, arguments ); // Then execute and return the original method's result.
      };

      return this; // Allow chaining.
    },

    // Method to execute an 'action' after the target method returns successfully.
    afterReturning: function ( action ) {
      var method = this._klass[ this._method ]; // Get the original method.

      // Replace the original method.
      this._klass[ this._method ] = function ( ) {
        var result = method.apply( this, arguments ); // Execute original method and capture its result.
        return action.call( this, result ); // Execute 'action' with the result of the original method.
      };

      return this; // Allow chaining.
    },

    // Method to execute an 'action' if the target method throws an exception.
    afterThrowing: function ( action ) {
      var method = this._klass[ this._method ]; // Get the original method.

      // Replace the original method.
      this._klass[ this._method ] = function ( ) {
        var result; // To store the return value or the result of the action.
        try {
          result = method.apply( this, arguments ); // Attempt to execute the original method.
        } catch ( e ) {
          result = action.call( this, e ); // If an error occurs, execute 'action' with the error.
        }
        return result; // Return the result (either from original method or the error handler).
      };

      return this; // Allow chaining.
    }
  } );


  // -------------------------------------------------------------------------------------------------------------------
  // Proton.AOP - Static method for applying Aspect-Oriented Programming.
  // This function provides an entry point to the AOP capabilities.
  // To use AOP, pass your class object and the name of the method you wish to advise.
  // You can then chain 'before', 'afterReturning', or 'afterThrowing' calls.
  //
  // @param klass  {Function} The class constructor (e.g., `Person`).
  // @param method {string}   The name of the method to apply advice to (e.g., 'save').
  // @returns {AOP} A new AOP instance configured for the specified class and method.
  // -------------------------------------------------------------------------------------------------------------------
  Proton.AOP = function ( klass, method ) {
    return new AOP( klass, method ); // Create and return a new AOP instance.
  };


  // -------------------------------------------------------------------------------------------------------------------
  // Module Export for Node.js and Browser Environments.
  // This section ensures the Proton library is available correctly, whether in a CommonJS environment (Node.js)
  // or a browser environment (global window object).
  // -------------------------------------------------------------------------------------------------------------------
  if ( 'undefined' !== typeof module && module.exports ) {
    // Export for Node.js (CommonJS).
    // Example usage in Node.js: `var Proton = require('./path/to/Proton.js');`
    module.exports = Proton;
  } else {
    // Export for browsers.
    // Attaches Proton to the global window object.
    window.Proton = Proton;
  }

}( ) ); // Immediately invoked function expression (IIFE) to encapsulate the code.