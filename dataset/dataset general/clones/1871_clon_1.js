( function () {
    // This is the main immediately invoked function expression (IIFE)
    // It encapsulates all the utility functions and the Factory object.

    var hash = {
        // The 'hash' object provides utility functions for object manipulation.


        /**
         * Merges properties from obj2 into obj1.
         * Only enumerable own properties of obj2 are copied.
         * @param {object} obj1 - The target object to merge into.
         * @param {object} obj2 - The source object to merge from.
         * @returns {object} The modified obj1.
         */
        merge: function ( obj1, obj2 ) {
            // Check if both objects are valid before attempting to merge.
            if ( obj1 && obj2 ) {
                var key; // Declare key variable outside the loop for older JS engines, though not strictly necessary now.
                for ( key in obj2 ) {
                    // Ensure that the property belongs to obj2 itself, not its prototype chain.
                    if ( obj2.hasOwnProperty ( key ) ) {
                        obj1[ key ] = obj2[ key ]; // Copy the property value.
                    } // end if (hasOwnProperty)
                } // end for (key in obj2)
            } // end if (obj1 && obj2)
            return obj1; // Return the modified object 1.
        }, // end merge function definition


        /**
         * Creates a shallow copy of an object.
         * @param {object} obj - The object to copy.
         * @returns {object} A new object with properties copied from the original.
         */
        copy: function ( obj ) {
            var newObj = {}; // Initialize an empty object for the copy.
            if ( obj ) {
                // If the source object exists, merge its properties into the new object.
                hash.merge ( newObj, obj );
            } // end if (obj)
            return newObj; // Return the newly created copy.
        }, // end copy function definition


        /**
         * Retrieves all enumerable own property names of an object.
         * @param {object} obj - The object whose keys are to be returned.
         * @returns {Array<string>} An array of property names.
         */
        keys: function ( obj ) {
            var keys = [], // Initialize an empty array to store keys.
                key; // Declare key variable.
            for ( key in obj ) {
                // Check if the property is an own property of the object.
                if ( obj.hasOwnProperty ( key ) ) {
                    keys.push ( key ); // Add the key to the array.
                } // end if (hasOwnProperty)
            } // end for (key in obj)
            return keys; // Return the array of keys.
        } // end keys function definition
    }; // end hash object literal


    /**
     * Asynchronously iterates over an array, processing each item with a handler.
     * Calls a final callback when all items have been processed.
     * @param {Array} array - The array to iterate over.
     * @param {function(item, next)} handler - Function to call for each item. 'next' must be called to proceed.
     * @param {function()} callback - Function to call when all items are done.
     */
    var asyncForEach = function ( array, handler, callback ) {
        var length = array.length, // Get the total length of the array.
            index = -1; // Initialize index to -1, it will be incremented before first use.

        // Nested function to process the next item in the array.
        var processNext = function () {
            index++; // Move to the next index.
            if ( index < length ) {
                // If there are more items to process, get the current item.
                var item = array[ index ];
                handler ( item, processNext ); // Call the handler with the item and a reference to processNext.
            } else {
                // If all items have been processed, call the final callback.
                callback ();
            } // end if/else (index < length)
        }; // end processNext function definition

        // Start the asynchronous iteration.
        processNext ();
    }; // end asyncForEach function definition


    var factories = {}; // Object to store factory definitions by name.


    /**
     * Defines a new factory.
     * @param {string} name - The unique name for the factory.
     * @param {Model} model - The Mongoose/ORM model constructor.
     * @param {object} attributes - Default attributes for the model instances.
     */
    var define = function ( name, model, attributes ) {
        factories[ name ] = {
            model: model, // Store the model constructor.
            attributes: attributes // Store the default attributes.
        }; // end object literal
    }; // end define function definition


    /**
     * Builds a model instance (creates an object) with factory attributes and user overrides,
     * but does not save it to the database.
     * Handles asynchronous attribute generation.
     * @param {string} name - The name of the factory to use.
     * @param {object|function} userAttrs - User-provided attributes to override defaults, or the callback.
     * @param {function(doc)} callback - Function to call with the built document.
     */
    var build = function ( name, userAttrs, callback ) {
        // Handle optional userAttrs argument.
        if ( typeof userAttrs === 'function' ) {
            callback = userAttrs; // If userAttrs is a function, it's the callback.
            userAttrs = {}; // Set userAttrs to an empty object.
        } // end if (typeof userAttrs)

        var model = factories[ name ].model; // Get the model constructor from the factory.
        // Create a copy of the default attributes to avoid modifying the original factory definition.
        var attrs = hash.copy ( factories[ name ].attributes );
        hash.merge ( attrs, userAttrs ); // Merge user-provided attributes, overriding defaults.

        // Asynchronously process attributes, especially those defined as functions.
        asyncForEach ( hash.keys ( attrs ), function ( key, cb ) {
            var fn = attrs[ key ]; // Get the attribute value.
            if ( typeof fn === 'function' ) {
                // If the attribute is a function, execute it to get the final value.
                fn ( function ( value ) {
                    attrs[ key ] = value; // Update the attribute with the resolved value.
                    cb (); // Call the callback to proceed to the next attribute.
                } ); // end fn callback
            } else {
                // If the attribute is not a function, no async resolution is needed.
                cb (); // Immediately proceed.
            } // end if/else (typeof fn)
        }, function () {
            // This callback is executed after all attributes have been resolved.
            var doc = new model (); // Create a new instance of the model.
            var key; // Declare key for the loop.
            for ( key in attrs ) {
                // Copy all resolved attributes to the new model instance.
                if ( attrs.hasOwnProperty ( key ) ) {
                    doc[ key ] = attrs[ key ]; // Assign the attribute.
                } // end if (hasOwnProperty)
            } // end for (key in attrs)
            callback ( doc ); // Call the final callback with the fully built document.
        } ); // end asyncForEach
    }; // end build function definition


    /**
     * Creates a model instance and saves it to the database.
     * Handles asynchronous attribute generation and database saving.
     * @param {string} name - The name of the factory to use.
     * @param {object|function} userAttrs - User-provided attributes to override defaults, or the callback.
     * @param {function(doc)} callback - Function to call with the created and saved document.
     */
    var create = function ( name, userAttrs, callback ) {
        // Handle optional userAttrs argument.
        if ( typeof userAttrs === 'function' ) {
            callback = userAttrs; // If userAttrs is a function, it's the callback.
            userAttrs = {}; // Set userAttrs to an empty object.
        } // end if (typeof userAttrs)

        // First, build the document using the 'build' function.
        build ( name, userAttrs, function ( doc ) {
            // Once the document is built, save it to the database.
            doc.save ( function ( err ) {
                if ( err ) {
                    throw err; // If there's an error during saving, throw it.
                } // end if (err)
                callback ( doc ); // Call the final callback with the saved document.
            } ); // end doc.save
        } ); // end build
    }; // end create function definition


    /**
     * Creates an association function for a factory.
     * This is useful for defining attributes that should be another factory instance.
     * @param {string} name - The name of the factory to associate.
     * @param {string} [attr] - Optional attribute name to return from the associated document (e.g., '_id').
     * @returns {function(callback)} A function that, when called, creates an instance of the associated factory.
     */
    var assoc = function ( name, attr ) {
        // Return a function that will be executed to create the association.
        return function ( callback ) {
            // Create an instance of the associated factory.
            create ( name, function ( doc ) {
                if ( attr ) {
                    // If a specific attribute is requested, return that attribute's value.
                    callback ( doc[ attr ] );
                } else {
                    // Otherwise, return the entire associated document.
                    callback ( doc );
                } // end if/else (attr)
            } ); // end create
        }; // end returned function
    }; // end assoc function definition


    // Define the public API for the Factory object.
    var Factory = create; // The primary export is the 'create' function.
    Factory.define = define; // Attach the define function.
    Factory.build = build; // Attach the build function.
    Factory.create = create; // Attach create again (redundant but harmless).
    Factory.assoc = assoc; // Attach the assoc function.


    // Conditional export for Node.js (CommonJS) or browser environment.
    if ( typeof module !== 'undefined' && module.exports ) {
        module.exports = Factory; // Export for Node.js.
    } else {
        this.Factory = Factory; // Export to the global scope (window in browsers).
    } // end if/else (module check)

} () ); // End of the IIFE.