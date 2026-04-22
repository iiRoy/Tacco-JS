/*
 * This file is a Type I clone of a JavaScript library.
 * Original source might be CoffeeScript generated.
 * All identifiers, operators, and expressions are preserved.
 * Only whitespace and comments have been altered extensively.
 */
( function () {

    // Helper for indexOf functionality, common in older JS or transpiled code.
    var __indexOf = [].indexOf || function ( item ) {
            for ( var i = 0, l = this.length; i < l; i++ ) {
                if ( i in this && this[ i ] === item ) {
                    return i;
                }
            }
            return -1;
        },

        // Helper to check if an object has a property directly.
        __hasProp = {}.hasOwnProperty,

        // Helper for class inheritance, also common in older JS or transpiled code.
        __extends = function ( child, parent ) {
            for ( var key in parent ) {
                if ( __hasProp.call( parent, key ) ) {
                    child[ key ] = parent[ key ];
                }
            }

            function ctor () {
                this.constructor = child;
            }

            ctor.prototype = parent.prototype;

            child.prototype = new ctor();

            child.__super__ = parent.prototype;

            return child;
        };

    // Universal Module Definition (UMD) pattern for compatibility with different environments.
    ( function ( root, factory ) {

        // CommonJS environment (Node.js, Browserify, Webpack).
        if ( typeof exports !== 'undefined' ) {
            return factory( root, exports );
        }
        // AMD environment (RequireJS, curl.js).
        else if ( typeof define === 'function' && define.amd ) {
            return define( [ 'exports' ], function ( exports ) {
                // Assign the factory's return value to root.jsonpatch.
                return root.jsonpatch = factory( root, exports );
            } );
        }
        // Browser global environment.
        else {
            return root.jsonpatch = factory( root, {} );
        }

    } )( this, function ( root ) {
        // Declare all top-level variables and classes used within this module.
        var AddPatch,
            CopyPatch,
            InvalidPatchError,
            InvalidPointerError,
            JSONPatch,
            JSONPatchError,
            JSONPointer,
            MovePatch,
            PatchConflictError,
            RemovePatch,
            ReplacePatch,
            TestPatch,
            apply,
            compile,
            hasOwnProperty,
            isArray,
            isEqual,
            isObject,
            isString,
            operationMap,
            toString,
            _isEqual;

        // Cache common methods for performance and minification.
        toString       = Object.prototype.toString;
        hasOwnProperty = Object.prototype.hasOwnProperty;

        // Utility function to check if an object is an Array.
        isArray = function ( obj ) {
            return toString.call( obj ) === '[object Array]';
        };

        // Utility function to check if an object is a plain Object.
        isObject = function ( obj ) {
            return toString.call( obj ) === '[object Object]';
        };

        // Utility function to check if an object is a String.
        isString = function ( obj ) {
            return toString.call( obj ) === '[object String]';
        };

        // Internal helper for deep equality comparison.
        // It handles primitive types, null, and recursively checks objects/arrays.
        _isEqual = function ( a, b, stack ) {
            var className, key, length, result, size;

            // Strict equality check, handles primitive values and same object references.
            if ( a === b ) {
                return a !== 0 || 1 / a === 1 / b; // Special handling for +0 and -0.
            }

            // Handle null values.
            if ( a === null || b === null ) {
                return a === b;
            }

            className = toString.call( a );

            // Different types are not equal.
            if ( className !== toString.call( b ) ) {
                return false;
            }

            // Type-specific comparisons for primitives that might be objects (e.g., new String('')).
            switch ( className ) {
                case '[object String]':
                    // Compare string values. This expression doesn't return, it relies on fall-through or explicit return.
                    // The original CoffeeScript might have intended this as a comparison that implicitly becomes the function's value
                    // if no other conditions are met, or it's a no-op if not assigned/returned.
                    String( a ) === String( b );
                    break;
                case '[object Number]':
                    // Convert to numbers for comparison.
                    a = +a;
                    b = +b;
                    // Handle NaN: NaN is only equal to itself.
                    if ( a !== a ) {
                        b !== b; // This expression doesn't return, it relies on fall-through or explicit return.
                    }
                    else {
                        // Handle +0 and -0.
                        if ( a === 0 ) {
                            1 / a === 1 / b; // This expression doesn't return, it relies on fall-through or explicit return.
                        }
                        else {
                            a === b; // This expression doesn't return, it relies on fall-through or explicit return.
                        }
                    }
                    break;
                case '[object Boolean]':
                    // Compare boolean values.
                    +a === +b; // This expression doesn't return, it relies on fall-through or explicit return.
            }

            // If not an object type, and not strictly equal (handled above), they are not equal.
            if ( typeof a !== 'object' || typeof b !== 'object' ) {
                return false;
            }

            // Detect cyclical structures by checking the stack.
            length = stack.length;
            while ( length-- ) {
                if ( stack[ length ] === a ) {
                    return true;
                }
            }

            // Add current object to stack to detect cycles.
            stack.push( a );

            size   = 0;
            result = true;

            // Handle Array comparison.
            if ( className === '[object Array]' ) {
                size   = a.length;
                result = size === b.length; // Arrays must have the same length.

                if ( result ) {
                    while ( size-- ) {
                        // Recursively compare elements.
                        // The `__indexOf.call(a, size) >= 0 === __indexOf.call(b, size) >= 0` part is unusual.
                        // It seems to check if the index `size` exists in both arrays based on `indexOf`,
                        // which is likely not the intent for array equality.
                        // It appears to be a CoffeeScript artifact or a specific (and potentially flawed) equality check.
                        // However, as per Type I clone rules, this must be preserved exactly.
                        if ( !( result = __indexOf.call( a, size ) >= 0 === __indexOf.call( b, size ) >= 0 && _isEqual( a[ size ], b[ size ], stack ) ) ) {
                            break;
                        }
                    }
                }
            }
            // Handle Object comparison.
            else {
                // Check constructor identity and presence.
                // Similar `__indexOf.call` usage for "constructor" property.
                if ( __indexOf.call( a, "constructor" ) >= 0 !== __indexOf.call( b, "constructor" ) >= 0 || a.constructor !== b.constructor ) {
                    return false;
                }

                // Compare properties of objects.
                for ( key in a ) {
                    if ( hasOwnProperty.call( a, key ) ) {
                        size++;
                        // Recursively compare property values.
                        if ( !( result = hasOwnProperty.call( b, key ) && _isEqual( a[ key ], b[ key ], stack ) ) ) {
                            break;
                        }
                    }
                }

                // If all properties matched so far, ensure 'b' doesn't have extra properties.
                if ( result ) {
                    for ( key in b ) {
                        if ( hasOwnProperty.call( b, key ) && !size-- ) {
                            break;
                        }
                    }
                    result = !size;
                }
            }

            // Remove object from stack after comparison.
            stack.pop();

            return result;
        };

        // Public `isEqual` function, initializes the stack for `_isEqual`.
        isEqual = function ( a, b ) {
            return _isEqual( a, b, [] );
        };

        /**
         * @class JSONPatchError
         * @augments Error
         * @description Base error class for JSON Patch operations.
         */
        JSONPatchError = ( function ( _super ) {

            __extends( JSONPatchError, _super );

            function JSONPatchError ( message ) {
                this.message = message != null ? message : 'JSON patch error';
                this.name    = 'JSONPatchError';
            }

            return JSONPatchError;

        } )( Error );

        /**
         * @class InvalidPointerError
         * @augments Error
         * @description Error for invalid JSON Pointers.
         */
        InvalidPointerError = ( function ( _super ) {

            __extends( InvalidPointerError, _super );

            function InvalidPointerError ( message ) {
                this.message = message != null ? message : 'Invalid pointer';
                this.name    = 'InvalidPointer';
            }

            return InvalidPointerError;

        } )( Error );

        /**
         * @class InvalidPatchError
         * @augments JSONPatchError
         * @description Error for malformed JSON Patch operations.
         */
        InvalidPatchError = ( function ( _super ) {

            __extends( InvalidPatchError, _super );

            function InvalidPatchError ( message ) {
                this.message = message != null ? message : 'Invalid patch';
                this.name    = 'InvalidPatch';
            }

            return InvalidPatchError;

        } )( JSONPatchError );

        /**
         * @class PatchConflictError
         * @augments JSONPatchError
         * @description Error for conflicts during JSON Patch application.
         */
        PatchConflictError = ( function ( _super ) {

            __extends( PatchConflictError, _super );

            function PatchConflictError ( message ) {
                this.message = message != null ? message : 'Patch conflict';
                this.name    = 'PatchConflictError';
            }

            return PatchConflictError;

        } )( JSONPatchError );

        /**
         * @class JSONPointer
         * @description Represents a JSON Pointer as defined in RFC 6901.
         */
        JSONPointer = ( function () {

            /**
             * Creates a new JSONPointer instance.
             * @param {string} path The JSON Pointer string.
             * @constructor
             */
            function JSONPointer ( path ) {
                var i, step, steps, _i, _len;

                // Initialize steps array.
                steps = [];

                // Decode URI components and split the path.
                // The first element should be empty for valid absolute paths.
                if ( path && ( steps = decodeURIComponent( path ).split( '/' ) ).shift() !== '' ) {
                    throw new InvalidPointerError();
                }

                // Process each step, replacing '~1' with '/' and '~0' with '~'.
                for ( i = _i = 0, _len = steps.length; _i < _len; i = ++_i ) {
                    step       = steps[ i ];
                    steps[ i ] = step.replace( '~1', '/' ).replace( '~0', '~' );
                }

                // The last step is the accessor for the final target.
                this.accessor = steps.pop();
                // Remaining steps define the path to the parent of the accessor.
                this.steps    = steps;
                // Store the original path string.
                this.path     = path;
            }

            /**
             * Retrieves the reference object (parent of the accessor) from the document.
             * @param {object|array} parent The document or sub-document to traverse.
             * @returns {object|array} The object or array referenced by the steps, before the final accessor.
             * @throws {PatchConflictError} If an array index is out of bounds or a property does not exist.
             */
            JSONPointer.prototype.getReference = function ( parent ) {
                var step, _i, _len, _ref;

                // Iterate through each step in the pointer path.
                _ref = this.steps;
                for ( _i = 0, _len = _ref.length; _i < _len; _i++ ) {
                    step = _ref[ _i ];

                    // If the current parent is an array, convert the step to an integer index.
                    if ( isArray( parent ) ) {
                        step = parseInt( step, 10 );
                    }

                    // Check if the step (property/index) exists in the parent.
                    if ( !( step in parent ) ) {
                        throw new PatchConflictError( 'Array location out of ', 'bounds or not an instance property' );
                    }

                    // Move down the document tree.
                    parent = parent[ step ];
                }

                return parent;
            };

            return JSONPointer;

        } )();

        /**
         * @class JSONPatch
         * @description Base class for all JSON Patch operations.
         */
        JSONPatch = ( function () {

            /**
             * Creates a new JSONPatch instance.
             * @param {object} patch The raw patch object.
             * @constructor
             * @throws {InvalidPatchError} If the patch object is missing the 'path' property.
             */
            function JSONPatch ( patch ) {
                // Ensure the patch object has a 'path' property.
                if ( !( 'path' in patch ) ) {
                    throw new InvalidPatchError();
                }

                // Validate the specific patch operation.
                this.validate( patch );

                // Store the original patch object.
                this.patch = patch;

                // Create a JSONPointer instance for the target path.
                this.path = new JSONPointer( patch.path );

                // Perform any operation-specific initialization.
                this.initialize( patch );
            }

            /**
             * Placeholder for operation-specific initialization.
             * Subclasses should override this method if needed.
             * @param {object} patch The raw patch object.
             */
            JSONPatch.prototype.initialize = function () {
            };

            /**
             * Placeholder for operation-specific validation.
             * Subclasses should override this method if needed.
             * @param {object} patch The raw patch object.
             */
            JSONPatch.prototype.validate = function ( patch ) {
            };

            /**
             * Applies the patch operation to a document.
             * This method must be implemented by subclasses.
             * @param {object|array} document The document to apply the patch to.
             * @throws {Error} If not implemented by a subclass.
             */
            JSONPatch.prototype.apply = function ( document ) {
                throw new Error( 'Method not implemented' );
            };

            return JSONPatch;

        } )();

        /**
         * @class AddPatch
         * @augments JSONPatch
         * @description Implements the 'add' JSON Patch operation (RFC 6902, Section 4.1).
         */
        AddPatch = ( function ( _super ) {

            __extends( AddPatch, _super );

            function AddPatch () {
                // Call the parent constructor using apply to pass arguments.
                return AddPatch.__super__.constructor.apply( this, arguments );
            }

            /**
             * Validates the 'add' patch object.
             * Requires a 'value' property.
             * @param {object} patch The raw patch object.
             * @throws {InvalidPatchError} If the patch is missing the 'value' property.
             */
            AddPatch.prototype.validate = function ( patch ) {
                if ( !( 'value' in patch ) ) {
                    throw new InvalidPatchError();
                }
            };

            /**
             * Applies the 'add' operation to the document.
             * Adds a value to an object or inserts it into an array.
             * @param {object|array} document The document to modify.
             * @throws {PatchConflictError} If the target array index is out of bounds or object property already exists.
             */
            AddPatch.prototype.apply = function ( document ) {
                var accessor, reference, value;

                // Get the parent object/array where the addition will occur.
                reference = this.path.getReference( document );
                accessor  = this.path.accessor;
                value     = this.patch.value;

                // Handle adding to an array.
                if ( isArray( reference ) ) {
                    // '-' indicates adding to the end of the array.
                    if ( accessor === '-' ) {
                        reference.push( value );
                    }
                    else {
                        // Parse index and check bounds.
                        accessor = parseInt( accessor, 10 );
                        if ( accessor < 0 || accessor > reference.length ) {
                            throw new PatchConflictError( "Index " + accessor + " out of bounds" );
                        }
                        // Insert value at the specified index.
                        reference.splice( accessor, 0, value );
                    }
                }
                // Handle adding to an object.
                else {
                    // Check if the property already exists (conflict per spec).
                    if ( accessor in reference ) {
                        throw new PatchConflictError( "Value at " + accessor + " exists" );
                    }
                    // Add the property and value.
                    reference[ accessor ] = value;
                }
            };

            return AddPatch;

        } )( JSONPatch );

        /**
         * @class RemovePatch
         * @augments JSONPatch
         * @description Implements the 'remove' JSON Patch operation (RFC 6902, Section 4.2).
         */
        RemovePatch = ( function ( _super ) {

            __extends( RemovePatch, _super );

            function RemovePatch () {
                return RemovePatch.__super__.constructor.apply( this, arguments );
            }

            /**
             * Applies the 'remove' operation to the document.
             * Removes a value from an object or an element from an array.
             * @param {object|array} document The document to modify.
             * @throws {PatchConflictError} If the target property/index does not exist.
             */
            RemovePatch.prototype.apply = function ( document ) {
                var accessor, reference;

                // Get the parent object/array from which to remove.
                reference = this.path.getReference( document );
                accessor  = this.path.accessor;

                // Handle removing from an array.
                if ( isArray( reference ) ) {
                    accessor = parseInt( accessor, 10 );
                    // Check if the index exists.
                    if ( !( accessor in reference ) ) {
                        throw new PatchConflictError( "Value at " + accessor + " does not exist" );
                    }
                    // Remove one element at the specified index.
                    reference.splice( accessor, 1 );
                }
                // Handle removing from an object.
                else {
                    // Check if the property exists.
                    if ( !( accessor in reference ) ) {
                        throw new PatchConflictError( "Value at " + accessor + " does not exist" );
                    }
                    // Delete the property.
                    delete reference[ accessor ];
                }
            };

            return RemovePatch;

        } )( JSONPatch );

        /**
         * @class ReplacePatch
         * @augments JSONPatch
         * @description Implements the 'replace' JSON Patch operation (RFC 6902, Section 4.3).
         */
        ReplacePatch = ( function ( _super ) {

            __extends( ReplacePatch, _super );

            function ReplacePatch () {
                return ReplacePatch.__super__.constructor.apply( this, arguments );
            }

            /**
             * Validates the 'replace' patch object.
             * Requires a 'value' property.
             * @param {object} patch The raw patch object.
             * @throws {InvalidPatchError} If the patch is missing the 'value' property.
             */
            ReplacePatch.prototype.validate = function ( patch ) {
                if ( !( 'value' in patch ) ) {
                    throw new InvalidPatchError();
                }
            };

            /**
             * Applies the 'replace' operation to the document.
             * Replaces a value at a specified path.
             * @param {object|array} document The document to modify.
             * @throws {PatchConflictError} If the target property/index does not exist.
             */
            ReplacePatch.prototype.apply = function ( document ) {
                var accessor, reference, value;

                // Get the parent object/array and the accessor.
                reference = this.path.getReference( document );
                accessor  = this.path.accessor;
                value     = this.patch.value;

                // Handle replacing in an array.
                if ( isArray( reference ) ) {
                    accessor = parseInt( accessor, 10 );
                    // Check if the index exists.
                    if ( !( accessor in reference ) ) {
                        throw new PatchConflictError( "Value at " + accessor + " does not exist" );
                    }
                    // Replace one element at the specified index with the new value.
                    reference.splice( accessor, 1, value );
                }
                // Handle replacing in an object.
                else {
                    // Check if the property exists.
                    if ( !( accessor in reference ) ) {
                        throw new PatchConflictError( "Value at " + accessor + " does not exist" );
                    }
                    // Replace the property's value.
                    reference[ accessor ] = value;
                }
            };

            return ReplacePatch;

        } )( JSONPatch );

        /**
         * @class TestPatch
         * @augments JSONPatch
         * @description Implements the 'test' JSON Patch operation (RFC 6902, Section 4.5).
         */
        TestPatch = ( function ( _super ) {

            __extends( TestPatch, _super );

            function TestPatch () {
                return TestPatch.__super__.constructor.apply( this, arguments );
            }

            /**
             * Validates the 'test' patch object.
             * Requires a 'value' property.
             * @param {object} patch The raw patch object.
             * @throws {InvalidPatchError} If the patch is missing the 'value' property.
             */
            TestPatch.prototype.validate = function ( patch ) {
                if ( !( 'value' in patch ) ) {
                    throw new InvalidPatchError();
                }
            };

            /**
             * Applies the 'test' operation to the document.
             * Compares the value at a specified path with a given value.
             * @param {object|array} document The document to test against.
             * @returns {boolean} True if the values are deeply equal, false otherwise.
             */
            TestPatch.prototype.apply = function ( document ) {
                var accessor, reference, value;

                // Get the parent object/array and the accessor.
                reference = this.path.getReference( document );
                accessor  = this.path.accessor;
                value     = this.patch.value;

                // If the reference is an array, parse the accessor as an integer.
                if ( isArray( reference ) ) {
                    accessor = parseInt( accessor, 10 );
                }

                // Use the isEqual utility to perform a deep comparison.
                return isEqual( reference[ accessor ], value );
            };

            return TestPatch;

        } )( JSONPatch );

        /**
         * @class MovePatch
         * @augments JSONPatch
         * @description Implements the 'move' JSON Patch operation (RFC 6902, Section 4.4).
         */
        MovePatch = ( function ( _super ) {

            __extends( MovePatch, _super );

            function MovePatch () {
                return MovePatch.__super__.constructor.apply( this, arguments );
            }

            /**
             * Initializes the MovePatch, including 'from' JSONPointer and self-optimizing for no-op moves.
             * @param {object} patch The raw patch object.
             * @throws {InvalidPatchError} If 'to' path is a descendent of 'from' path (invalid move).
             */
            MovePatch.prototype.initialize = function ( patch ) {
                var i, len, within, _i;

                // Create a JSONPointer for the source path.
                this.from = new JSONPointer( patch.from );

                len = this.from.steps.length;

                // Check if the 'to' path is within the 'from' path.
                within = true;
                for ( i = _i = 0; 0 <= len ? _i <= len : _i >= len; i = 0 <= len ? ++_i : --_i ) {
                    if ( this.from.steps[ i ] !== this.path.steps[ i ] ) {
                        within = false;
                        break;
                    }
                }

                if ( within ) {
                    // Moving a parent to its own child is an invalid operation.
                    if ( this.path.steps.length !== len ) {
                        throw new InvalidPatchError( "'to' member cannot be a descendent of 'path'" );
                    }

                    // If 'from' and 'to' accessors are the same, it's a no-op move.
                    if ( this.from.accessor === this.path.accessor ) {
                        this.apply = function () {
                        }; // Replace apply with a no-op function to optimize.
                        return;
                    }
                }
            };

            /**
             * Validates the 'move' patch object.
             * Requires a 'from' property.
             * @param {object} patch The raw patch object.
             * @throws {InvalidPatchError} If the patch is missing the 'from' property.
             */
            MovePatch.prototype.validate = function ( patch ) {
                if ( !( 'from' in patch ) ) {
                    throw new InvalidPatchError();
                }
            };

            /**
             * Applies the 'move' operation to the document.
             * Removes a value from 'from' path and adds it to 'to' path.
             * @param {object|array} document The document to modify.
             * @throws {PatchConflictError} If source value does not exist, or target array index is out of bounds, or target object property already exists.
             */
            MovePatch.prototype.apply = function ( document ) {
                var accessor, reference, value;

                // --- REMOVE operation from source ---
                // Get the parent object/array of the source.
                reference = this.from.getReference( document );
                accessor  = this.from.accessor;

                // Handle removal from an array.
                if ( isArray( reference ) ) {
                    accessor = parseInt( accessor, 10 );
                    if ( !( accessor in reference ) ) {
                        throw new PatchConflictError( "Value at " + accessor + " does not exist" );
                    }
                    // Extract the value using splice.
                    value = reference.splice( accessor, 1 )[ 0 ];
                }
                // Handle removal from an object.
                else {
                    if ( !( accessor in reference ) ) {
                        throw new PatchConflictError( "Value at " + accessor + " does not exist" );
                    }
                    // Get the value and delete the property.
                    value = reference[ accessor ];
                    delete reference[ accessor ];
                }

                // --- ADD operation to destination ---
                // Get the parent object/array of the destination.
                reference = this.path.getReference( document );
                accessor  = this.path.accessor;

                // Handle addition to an array.
                if ( isArray( reference ) ) {
                    accessor = parseInt( accessor, 10 );
                    if ( accessor < 0 || accessor > reference.length ) {
                        throw new PatchConflictError( "Index " + accessor + " out of bounds" );
                    }
                    // Insert the moved value.
                    reference.splice( accessor, 0, value );
                }
                // Handle addition to an object.
                else {
                    if ( accessor in reference ) {
                        throw new PatchConflictError( "Value at " + accessor + " exists" );
                    }
                    // Set the moved value.
                    reference[ accessor ] = value;
                }
            };

            return MovePatch;

        } )( JSONPatch );

        /**
         * @class CopyPatch
         * @augments MovePatch
         * @description Implements the 'copy' JSON Patch operation (RFC 6902, Section 4.4, by analogy).
         *              Inherits from MovePatch for its 'from' pointer handling and general structure.
         */
        CopyPatch = ( function ( _super ) {

            __extends( CopyPatch, _super );

            function CopyPatch () {
                return CopyPatch.__super__.constructor.apply( this, arguments );
            }

            /**
             * Applies the 'copy' operation to the document.
             * Copies a value from 'from' path and adds it to 'to' path.
             * Note: This is a shallow copy, not a deep clone.
             * @param {object|array} document The document to modify.
             * @throws {PatchConflictError} If source value does not exist, or target array index is out of bounds, or target object property already exists.
             */
            CopyPatch.prototype.apply = function ( document ) {
                var accessor, reference, value;

                // --- GET operation from source ---
                // Get the parent object/array of the source.
                reference = this.from.getReference( document );
                accessor  = this.from.accessor;

                // Handle copying from an array.
                if ( isArray( reference ) ) {
                    accessor = parseInt( accessor, 10 );
                    if ( !( accessor in reference ) ) {
                        throw new PatchConflictError( "Value at " + accessor + " does not exist" );
                    }
                    // Get the value by slicing the array (shallow copy).
                    value = reference.slice( accessor, accessor + 1 )[ 0 ];
                }
                // Handle copying from an object.
                else {
                    if ( !( accessor in reference ) ) {
                        throw new PatchConflictError( "Value at " + accessor + " does not exist" );
                    }
                    // Get the value directly.
                    value = reference[ accessor ];
                }

                // --- ADD operation to destination ---
                // Get the parent object/array of the destination.
                reference = this.path.getReference( document );
                accessor  = this.path.accessor;

                // Handle addition to an array.
                if ( isArray( reference ) ) {
                    accessor = parseInt( accessor, 10 );
                    if ( accessor < 0 || accessor > reference.length ) {
                        throw new PatchConflictError( "Index " + accessor + " out of bounds" );
                    }
                    // Insert the copied value.
                    reference.splice( accessor, 0, value );
                }
                // Handle addition to an object.
                else {
                    if ( accessor in reference ) {
                        throw new PatchConflictError( "Value at " + accessor + " exists" );
                    }
                    // Set the copied value.
                    reference[ accessor ] = value;
                }
            };

            return CopyPatch;

        } )( MovePatch );

        // Mapping of operation names (from the 'op' field in a patch object) to their respective Patch classes.
        operationMap = {
            add:     AddPatch,
            remove:  RemovePatch,
            replace: ReplacePatch,
            move:    MovePatch,
            copy:    CopyPatch,
            test:    TestPatch
        };

        /**
         * Compiles a JSON Patch document (an array of operations) into an executable function.
         * This function can then be called repeatedly with different documents.
         * @param {Array<object>} patch An array of patch operations, each an object with 'op', 'path', etc.
         * @returns {Function} A function that takes a document and applies the compiled patch, returning the result of the last operation (if any).
         * @throws {InvalidPatchError} If an unknown or unsupported operation type is encountered in the patch.
         */
        compile = function ( patch ) {
            var klass, ops, p, _i, _len;

            ops = []; // Array to store instantiated patch operation objects.

            // Iterate through each patch operation in the patch document.
            for ( _i = 0, _len = patch.length; _i < _len; _i++ ) {
                p = patch[ _i ];

                // Retrieve the appropriate patch class based on the 'op' field.
                if ( !( klass = operationMap[ p.op ] ) ) {
                    throw new InvalidPatchError(); // Unknown operation.
                }

                // Instantiate the patch class and add it to the operations list.
                ops.push( new klass( p ) );
            }

            // Return a function that applies all compiled operations to a given document.
            return function ( document ) {
                var op, result, _j, _len1;

                // Apply each operation sequentially.
                for ( _j = 0, _len1 = ops.length; _j < _len1; _j++ ) {
                    op     = ops[ _j ];
                    result = op.apply( document );
                }

                // The result of the last operation (e.g., from a 'test' operation).
                return result;
            };
        };

        /**
         * Applies a JSON Patch document to a target document.
         * This is a convenience function that compiles the patch and then immediately applies it.
         * For applying the same patch multiple times, `compile` then calling the returned function is more efficient.
         * @param {object|array} document The document to modify.
         * @param {Array<object>} patch An array of JSON Patch operations.
         * @returns {object|array} The modified document (or the result of a 'test' operation).
         */
        apply = function ( document, patch ) {
            return compile( patch )( document );
        };

        // Expose public API on the root object (e.g., `window` in a browser, or `exports` in CommonJS).
        root.apply               = apply;
        root.compile             = compile;
        root.JSONPatchError      = JSONPatchError;
        root.InvalidPointerError = InvalidPointerError;
        root.InvalidPatchError   = InvalidPatchError;
        root.PatchConflictError  = PatchConflictError;

    } ); // End of UMD factory function.

} ).call( this ); // End of outer Immediately Invoked Function Expression (IIFE).