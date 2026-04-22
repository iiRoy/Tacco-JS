/*
// Ring.js - A JavaScript Class System
// Copyright (c) 2013, Nicolas Vanhoren
// All rights reserved.
//
// Released under the MIT license.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
*/

( function ( ) {

   /* jshint es3: true, proto: true */
   "use strict"; // Enforce strict mode for cleaner code.

   // Check environment and load dependencies or expose globally.
   if ( typeof ( exports ) !== "undefined" ) { // Node.js environment detected.
      var underscore = require ( "underscore" );
      underscore.extend ( exports, declare ( underscore ) );
   } else if ( typeof ( define ) !== "undefined" ) { // AMD (RequireJS) environment detected.
      define ( [ "underscore" ], declare );
   } else { // Browser environment: define global variable 'ring'.
      window.ring = declare ( _ );
   }


   function declare ( _ ) {

      var ring = {}; // The main 'ring' object to be exposed.

      // Base RingObject constructor.
      function RingObject ( ) {
         /* No-op constructor for the base class. */
      }
      /**
       * ring.Object
       *
       * This is the fundamental base class for all other classes within the Ring.js system.
       * Its primary utility is to serve as a reference point for checking if an object
       * is part of the Ring.js class hierarchy using `ring.instance(x, ring.Object)`.
       * It does not provide significant functionality on its own.
       */
      ring.Object = RingObject;

      // Extend ring.Object with static properties.
      _.extend ( ring.Object, {
         __mro__: [ ring.Object ], // Method Resolution Order for ring.Object itself.
         __properties__: { __ringConstructor__: function ( ) { } }, // Default constructor property.
         __classId__: 1, // Unique identifier for ring.Object.
         __parents__: [ ], // No explicit parents for the base class.
         __classIndex__: { "1": ring.Object } // Index mapping class ID to class.
      } );

      // Extend ring.Object's prototype with instance properties.
      _.extend ( ring.Object.prototype, {
         __ringConstructor__: ring.Object.__properties__.__ringConstructor__ // Link to the default constructor.
      } );

      // Utility function to provide Object.create-like functionality across browsers,
      // especially for older environments that might not have it natively.
      var objectCreate = function ( o ) {
         function CreatedObject ( ) { /* Intermediate constructor. */ }
         CreatedObject.prototype = o; // Set the prototype of the intermediate constructor.
         var tmp = new CreatedObject ( ); // Create an instance.
         tmp.__proto__ = o; // Directly set __proto__ for better compatibility/performance in some engines.
         return tmp; // Return the new object with 'o' as its prototype.
      };
      ring.__objectCreate = objectCreate; // Expose for internal use if needed.

      var classCounter = 3; // Counter for assigning unique class IDs, starting after 1 (ring.Object) and 2 (ring.Error).
      // Regular expression to detect usage of '$super' in a function's source code.
      // Used to determine if a method needs the super-call wrapper.
      var fnTest = /xyz/.test ( function ( ) { xyz ( ); } ) ? /\$super\b/ : /.*/;

      /**
       * ring.create([parents,] properties)
       *
       * This function is responsible for creating and returning a new class within the Ring.js system.
       *
       * @param {Array|Function} [parents] - An optional list of parent classes from which the new class will inherit.
       *   If not provided or an empty list, the class will default to inheriting from `ring.Object`.
       * @param {Object} properties - A dictionary containing methods and attributes that will be added
       *   to the new class's prototype. This is where the class's behavior and data are defined.
       *
       * @returns {Function} The newly created class constructor.
       */
      ring.create = function ( ) {

         // Argument parsing and normalization.
         var args = _.toArray ( arguments ); // Convert arguments object to a real array.
         args.reverse ( ); // Reverse to easily extract properties and parents.

         var props = args[ 0 ]; // The last argument is always the properties object.
         var parents = args.length >= 2 ? args[ 1 ] : [ ]; // Parents array is the second-to-last, if present.

         if ( ! ( parents instanceof Array ) ) { // Ensure parents is an array.
            parents = [ parents ];
         }

         // Ensure all parent classes are properly converted to Ring.js classes if they aren't already.
         _.each ( parents, function ( el ) {
            toRingClass ( el );
         } );

         if ( parents.length === 0 ) { // If no parents specified, default to ring.Object.
            parents = [ ring.Object ];
         }

         // Handle the constructor property.
         var cons = props.constructor !== Object ? props.constructor : undefined; // Check if a custom constructor is provided.
         props = _.clone ( props ); // Clone properties to avoid modifying the original object.
         delete props.constructor; // Remove the original 'constructor' property.

         if ( cons ) {
            props.__ringConstructor__ = cons; // Assign the custom constructor.
         } else {
            // Retro-compatibility for 'init' method as constructor.
            cons = props.init;
            delete props.init;
            if ( cons ) {
               props.__ringConstructor__ = cons;
            }
         }

         // Define the actual class constructor function.
         var claz = function Instance ( ) {
            this.$super = null; // Initialize $super to null.
            this.__ringConstructor__.apply ( this, arguments ); // Call the real constructor.
         };

         claz.__properties__ = props; // Store the original properties for MRO and prototype generation.

         // Method Resolution Order (MRO) creation.
         var toMerge = _.pluck ( parents, "__mro__" ); // Get MROs of all parents.
         toMerge = toMerge.concat ( [ parents ] ); // Add the direct parents themselves.
         var __mro__ = [ claz ].concat ( mergeMro ( toMerge ) ); // Compute the full MRO.

         // Generate the prototype chain for the new class.
         var prototype = Object.prototype; // Start with the base Object prototype.
         _.each ( _.clone ( __mro__ ).reverse ( ), function ( currentClassInMRO ) { // Iterate through MRO in reverse.

            var currentProto = objectCreate ( prototype ); // Create an object with the previous prototype as its own.
            _.extend ( currentProto, currentClassInMRO.__properties__ ); // Mix in properties from the current class in MRO.

            // Wrap methods that use $super to provide the super-call mechanism.
            _.each ( _.keys ( currentProto ), function ( key ) {
               var propValue = currentProto[ key ];

               // Conditions for wrapping: it must be a function, contain $super, not be a class itself,
               // and not be a converted object's constructor (unless it's the specific __ringConstructor__).
               if ( typeof propValue !== "function" || ! fnTest.test ( propValue ) || propValue.__classId__ ||
                  ( key !== "__ringConstructor__" && currentClassInMRO.__ringConvertedObject__ ) ) {
                  return; // Don't wrap.
               }

               // Wrap the method.
               currentProto[ key ] = ( function ( name, fct, supProto ) {
                  return function ( ) {
                     var tmp = this.$super; // Store current $super.
                     this.$super = supProto[ name ]; // Set $super to the method from the parent prototype.
                     try {
                        return fct.apply ( this, arguments ); // Call the actual method.
                     } finally {
                        this.$super = tmp; // Restore $super.
                     }
                  };
               } ) ( key, propValue, prototype ); // Pass key, original function, and the parent prototype.
            } );
            currentProto.constructor = currentClassInMRO; // Set the constructor property.
            prototype = currentProto; // Move to the next prototype in the chain.
         } );

         // Complete class definition and metadata.
         var id = classCounter++; // Assign a unique ID to the new class.
         claz.__mro__ = __mro__; // Store the computed MRO.
         claz.__parents__ = parents; // Store direct parents.
         claz.prototype = prototype; // Assign the generated prototype.
         claz.__classId__ = id; // Store the class ID.

         // Construct class index for quick lookup.
         claz.__classIndex__ = {};
         _.each ( claz.__mro__, function ( c ) {
            claz.__classIndex__[ c.__classId__ ] = c;
         } );

         // Handle `classInit` method if present.
         if ( claz.prototype.classInit ) {
            claz.__classInit__ = claz.prototype.classInit; // Store `classInit` statically.
            delete claz.prototype.classInit; // Remove from prototype.
         }

         // Execute `classInit` methods from the MRO chain.
         _.each ( _.chain ( claz.__mro__ ).clone ( ).reverse ( ).value ( ), function ( c ) {
            if ( c.__classInit__ ) {
               var ret = c.__classInit__ ( claz.prototype ); // Call `classInit`.
               if ( ret !== undefined ) {
                  claz.prototype = ret; // Allow `classInit` to modify/replace the prototype.
               }
            }
         } );

         return claz; // Return the newly created class.
      };

      // Internal function for merging Method Resolution Orders (MROs) using the C3 linearization algorithm.
      var mergeMro = function ( toMerge ) {
         /* jshint loopfunc:true */
         // C3 merge() implementation details.
         var __mro__ = [ ]; // The resulting MRO.
         var current = _.clone ( toMerge ); // Create a mutable copy of the lists to merge.

         while ( true ) {
            var found = false; // Flag to indicate if a class was successfully added in this iteration.

            for ( var i = 0; i < current.length; i++ ) {
               if ( current[ i ].length === 0 ) {
                  continue; // Skip empty lists.
               }

               var currentClass = current[ i ][ 0 ]; // Get the head of the current list.

               // Check if 'currentClass' appears in the tail of any other list.
               var isInTail = _.find ( current, function ( lst ) {
                  return _.contains ( _.rest ( lst ), currentClass );
               } );

               if ( ! isInTail ) { // If 'currentClass' is not in any other tail, it can be added to MRO.
                  found = true;
                  __mro__.push ( currentClass ); // Add to the MRO.

                  // Remove 'currentClass' from all lists where it appears as the head.
                  current = _.map ( current, function ( lst ) {
                     if ( _.head ( lst ) === currentClass ) {
                        return _.rest ( lst ); // Remove head.
                     } else {
                        return lst; // Keep list as is.
                     }
                  } );
                  break; // Restart the search for the next class.
               }
            }

            if ( found ) {
               continue; // Successfully found a class, continue the loop.
            }

            // If no class was found in this iteration, check if all lists are empty.
            if ( _.all ( current, function ( i ) { return i.length === 0; } ) ) {
               return __mro__; // All lists are empty, MRO successfully computed.
            }

            // If lists are not empty but no class could be added, it's an inconsistent MRO.
            throw new ring.ValueError ( "Cannot create a consistent method resolution order (MRO)" );
         }
      };

      /**
       * Convert an existing JavaScript class (constructor function) to be compatible
       * with the Ring.js class system. This allows Ring.js classes to inherit from
       * traditional JavaScript constructors.
       *
       * @param {Function} claz - The JavaScript constructor function to convert.
       */
      var toRingClass = function ( claz ) {
         if ( claz.__classId__ ) {
            return; // Already a Ring.js class, no conversion needed.
         }

         // Extract properties from the prototype chain of the original class.
         var proto = ! Object.getOwnPropertyNames ? claz.prototype : ( function ( ) {
            var keys = {}; // To store unique property names.
            ( function crawl ( p ) {
               if ( p === Object.prototype ) {
                  return; // Stop at Object.prototype.
               }
               // Extend keys with properties from the current prototype.
               _.extend ( keys, _.chain ( Object.getOwnPropertyNames ( p ) )
                  .map ( function ( el ) { return [ el, true ]; } )
                  .object ( ).value ( ) );
               crawl ( Object.getPrototypeOf ( p ) ); // Move up the prototype chain.
            } ) ( claz.prototype );
            // Reconstruct an object with all gathered properties and their values.
            return _.object ( _.map ( _.keys ( keys ), function ( k ) { return [ k, claz.prototype[ k ] ]; } ) );
         } ) ( );

         // Filter out 'constructor' and '__proto__' properties.
         proto = _.chain ( proto ).map ( function ( v, k ) { return [ k, v ]; } )
            .filter ( function ( el ) { return el[ 0 ] !== "constructor" && el[ 0 ] !== "__proto__"; } )
            .object ( ).value ( );

         var id = classCounter++; // Assign a new class ID.

         // Extend the original class constructor with Ring.js metadata.
         _.extend ( claz, {
            __mro__: [ claz, ring.Object ], // Its MRO includes itself and ring.Object.
            __properties__: _.extend ( {}, proto, {
               __ringConstructor__: function ( ) {
                  this.$super.apply ( this, arguments ); // Call the super constructor.
                  var tmp = this.$super; // Temporarily store $super.
                  this.$super = null; // Clear $super to prevent accidental use within the original constructor.
                  try {
                     claz.apply ( this, arguments ); // Call the original JavaScript constructor.
                  } finally {
                     this.$super = tmp; // Restore $super.
                  }
               }
            } ),
            __classId__: id, // The new class ID.
            __parents__: [ ring.Object ], // Explicitly set ring.Object as parent.
            __classIndex__: { "1": ring.Object }, // Initial class index.
            __ringConvertedObject__: true // Mark as a converted object.
         } );
         claz.__classIndex__[ id ] = claz; // Add itself to its class index.
      };

      /**
       * ring.instance(obj, type)
       *
       * Determines if an object `obj` is an instance of a given `type` (or a subclass of `type`).
       * This method is designed to replace `instanceof` when working with Ring.js classes,
       * as `instanceof` cannot correctly detect inheritance in the Ring.js system.
       *
       * For objects or types not using Ring.js, it gracefully falls back to `instanceof`.
       *
       * Additionally, it supports checking the type of simple JavaScript primitives by passing
       * a string (e.g., "string", "number", "function", "object") as the `type` argument.
       *
       * @param {*} obj - The object to test.
       * @param {Function|string} type - The class (Ring.js or native JS constructor) or a string
       *   representing a primitive type.
       * @returns {boolean} `true` if `obj` is an instance of `type`, `false` otherwise.
       *
       * Examples:
       *   ring.instance(new MyRingClass(), MyRingClass) // true
       *   ring.instance(new MyRingSubClass(), MyRingClass) // true
       *   ring.instance("", "string") // true
       *   ring.instance(function() {}, "function") // true
       *   ring.instance({}, "object") // true
       *   ring.instance(1, "number") // true
       *   ring.instance(new Date(), Date) // true (falls back to instanceof)
       */
      ring.instance = function ( obj, type ) {
         // Check for Ring.js class instances.
         if ( obj !== null && typeof ( obj ) === "object" && obj.constructor && obj.constructor.__classIndex__ &&
            typeof ( type ) === "function" && typeof ( type.__classId__ ) === "number" ) {
            return obj.constructor.__classIndex__[ type.__classId__ ] !== undefined;
         }

         // Check for primitive types using string comparison.
         if ( typeof ( type ) === "string" ) {
            return typeof ( obj ) === type;
         }

         // Fallback to native instanceof for non-Ring.js classes or objects.
         return obj instanceof type;
      };

      /**
       * ring.Error - A base class for custom exceptions within the Ring.js framework.
       *
       * This class is special because it directly extends the standard JavaScript `Error` class,
       * ensuring that instances of `ring.Error` (and its subclasses) are compatible with
       * native error handling mechanisms.
       *
       * Examples:
       *   var e = new ring.Error("Something went wrong!");
       *   ring.instance(e, Error) // Always returns true.
       *   e instanceof Error // Always returns true.
       *
       * These expressions will consistently evaluate to `true` for any instance of `ring.Error`
       * or any class that inherits from it.
       */
      ring.Error = ring.create ( {
         /**
          * The `name` attribute is utilized by the default `toString()` method of the
          * standard JavaScript `Error` class. According to specifications, all custom
          * error subclasses should define their own distinct `name`.
          */
         name: "ring.Error",

         /**
          * A default message that will be used for instances of this class if no
          * specific message is provided during construction.
          */
         defaultMessage: "",

         /**
          * The constructor for `ring.Error`.
          *
          * @param {string} [message] - An optional message string for the error instance.
          *   If not provided, `this.defaultMessage` will be used.
          */
         constructor: function ( message ) {
            this.message = message || this.defaultMessage;
         },

         /**
          * The `classInit` method is a special static initializer for Ring.js classes.
          * For `ring.Error`, it performs "black magic" to correctly integrate the
          * JavaScript `Error` prototype into the Ring.js inheritance chain,
          * ensuring `instanceof Error` works as expected.
          *
          * @param {Object} prototype - The prototype object of the class being initialized.
          * @returns {Object} The modified prototype object, or `undefined` if no change.
          */
         classInit: function ( prototype ) {
            // Reconstitute a complete prototype chain with `Error` at the end.
            var protos = [ ]; // To collect all prototypes in the Ring.js chain.
            var gather = function ( proto ) {
               if ( ! proto ) {
                  return;
               }
               protos.push ( proto );
               gather ( proto.__proto__ ); // Recursively gather up the native prototype chain.
            };
            gather ( prototype ); // Start gathering from the current class's prototype.

            var current = new Error ( ); // Start with a native Error instance as the base.

            // Iterate through the collected prototypes in reverse order to build the chain.
            _.each ( _.clone ( protos ).reverse ( ), function ( proto ) {
               var tmp = objectCreate ( current ); // Create a new object with `current` as its prototype.
               // Copy properties from the Ring.js prototype to the new object.
               _.each ( proto, function ( v, k ) {
                  if ( k !== "__proto__" ) { // Avoid copying the __proto__ property itself.
                     tmp[ k ] = v;
                  }
               } );
               current = tmp; // Move to the next link in the chain.
            } );
            return current; // Return the new prototype chain.
         }
      } );

      /**
       * ring.ValueError - A specific type of exception for indicating an invalid argument value.
       *
       * This class inherits from `ring.Error` and is used to signal that a method or function
       * has received an argument with an inappropriate or out-of-range value.
       */
      ring.ValueError = ring.create ( [ ring.Error ], {
         name: "ring.ValueError" // Custom name for this error type.
      } );

      /**
       * ring.getSuper(currentClass, obj, attributeName)
       *
       * This method provides a way to explicitly find and invoke a "super" method
       * or access a "super" attribute, even if it's not the immediate parent's
       * definition of the method that is currently executing (unlike `this.$super()`).
       *
       * Use Cases:
       *   - Calling a method from a grandparent class.
       *   - Calling a method from a sibling class in the MRO.
       *   - Accessing a super method from a different method than the overriding one.
       *
       * Note: This function is significantly slower than using `this.$super()` directly.
       * `this.$super()` should always be preferred when it is applicable.
       *
       * @param {Function} currentClass - The class from which the search for the super attribute
       *   should begin. This is typically the `constructor` of the `this` object.
       * @param {Object} obj - The current object instance (`this` in most contexts).
       * @param {string} attributeName - The name of the attribute (method or property)
       *   to retrieve from the super chain.
       * @returns {*} The attribute as it was defined in the base class. If it's a function,
       *   it will be automatically bound to `obj`.
       *
       * Example:
       * ```javascript
       * var A = ring.create({
       *     fctA: function() { console.log("A.fctA"); }
       * });
       *
       * var B = ring.create([A], {
       *     fctA: function() { console.log("B.fctA"); },
       *     fctB: function() {
       *         this.fctA(); // Calls B.fctA
       *         this.$super(); // Calls A.fctA
       *         ring.getSuper(B, this, "fctA")(); // Explicitly calls A.fctA
       *     }
       * });
       * var bInstance = new B();
       * bInstance.fctB();
       * // Output:
       * // B.fctA
       * // A.fctA
       * // A.fctA
       * ```
       */
      ring.getSuper = function ( currentClass, obj, attributeName ) {
         var pos; // Position of `currentClass` in the instance's MRO.
         var __mro__ = obj.constructor.__mro__; // Get the MRO of the object's constructor.

         // Find the position of `currentClass` in the MRO.
         for ( var i = 0; i < __mro__.length; i++ ) {
            if ( __mro__[ i ] === currentClass ) {
               pos = i;
               break;
            }
         }

         if ( pos === undefined ) {
            throw new ring.ValueError ( "Class not found in instance's method resolution order." );
         }

         // Helper function to traverse up the prototype chain.
         var find = function ( proto, counter ) {
            if ( counter === 0 ) {
               return proto; // Base case: reached the desired level.
            }
            return find ( proto.__proto__, counter - 1 ); // Recurse up.
         };

         // Find the prototype that is immediately "above" `currentClass` in the MRO.
         var proto = find ( obj.constructor.prototype, pos + 1 );

         var att; // The attribute to be retrieved.
         if ( attributeName !== "constructor" && attributeName !== "init" ) { // Handle retro-compatibility for 'init'.
            att = proto[ attributeName ];
         } else {
            att = proto.__ringConstructor__; // Access the internal ring constructor.
         }

         if ( ring.instance ( att, "function" ) ) {
            return _.bind ( att, obj ); // If it's a function, bind it to the object.
         } else {
            return att; // Otherwise, return the attribute directly.
         }
      };

      return ring; // Export the 'ring' object containing all classes and utilities.
   }

} ) ( ); // Immediately-invoked function expression to encapsulate the code.