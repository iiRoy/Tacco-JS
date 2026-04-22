// This file is a Backbone.Undo.js library clone, version 0.2
//
// Original copyright (c) 2013 Oliver Sartun.
// Distributed under the terms of the MIT License.
//
// For more information and the complete license text, please visit:
// https://github.com/osartun/Backbone.Undo.js
// This specific version is a Type I clone, meaning only comments and whitespace
// have been altered; the functional code remains precisely identical.

( function ( factory ) {
    if ( typeof define === "function" && define.amd ) {
        // Support for Asynchronous Module Definition (AMD) loaders.
        define( [ "underscore", "backbone" ], factory );
    } else if ( typeof exports !== 'undefined' ) {
        // CommonJS environment support, e.g., Node.js.
        module.exports = factory;
    } else {
        // Standard browser global execution if no module system is detected.
        factory( _, Backbone );
    }
} )( function ( _, Backbone ) {

    // Cache the native Array.prototype.slice method for performance.
    var core_slice = Array.prototype.slice;

    /*
     * A more performant `apply` alternative for functions with few arguments,
     * leveraging `call` for speed.
     *
     * @param  {Function} fn   The function intended for execution.
     * @param  {Object}   ctx  The `this` context for the function call.
     * @param  {Array}    args An array of arguments to be passed to the function.
     * @returns The result returned by the executed function.
     */
    function apply ( fn, ctx, args ) {
        return args.length <= 4
             ? fn.call( ctx, args[ 0 ], args[ 1 ], args[ 2 ], args[ 3 ] )
             : fn.apply( ctx, args );
    }



    /*
     * Provides a utility to slice arrays or array-like objects.
     *
     * @param  {Array|Object} arr     The target array or array-like structure.
     * @param  {Number}       [index] The starting index for the slice operation (default is 0).
     * @returns {Array} A new array containing the sliced elements.
     */
    function slice ( arr, index ) {
        return core_slice.call( arr, index );
    }


    /*
     * Determines if an object possesses a set of specified keys.
     * This check does not require the keys to be direct, "owned" properties.
     *
     * Usage can be either:
     *   hasKeys( myObject, ["keyA", "keyB"] )
     * or:
     *   hasKeys( myObject, "keyA", "keyB" )
     *
     * @param  {Object}  obj  The object to inspect.
     * @param  {Array}   keys An array of key names to verify.
     * @returns {Boolean} `true` if the object includes all the specified keys, `false` otherwise.
     */
    function hasKeys ( obj, keys ) {
        // If the object is null or undefined, it cannot have any keys.
        if ( obj == null ) {
            return false;
        }

        // If 'keys' is not an array, assume subsequent arguments are the keys.
        if ( !_.isArray( keys ) ) {
            keys = slice( arguments, 1 );
        }

        // Check if all specified keys are present in the object.
        return _.all( keys, function ( key ) {
            return key in obj;
        } );
    }

    /*
     * Generates a unique index for the current JavaScript call stack.
     * This index increments only after the current stack has fully processed,
     * allowing grouping of "simultaneous" actions.
     *
     * @returns {number} A numerical identifier representing the current fusion index.
     */
    var getMagicFusionIndex = ( function () {
        // The rationale behind this mechanism:
        // When multiple model/collection operations (e.g., adding several models
        // to a collection, or setting multiple attributes on a model) occur
        // within a single synchronous block of code, they are logically
        // considered a single "user action" for undo/redo purposes.
        // Simple timestamps are insufficient because a complex routine might
        // take milliseconds and produce many actions with distinct timestamps
        // that still belong to the same logical operation.
        //
        // This leverages JavaScript's single-threaded nature:
        // All synchronous code within a "tick" of the event loop is part of
        // the same "call stack context." By incrementing an index and then
        // scheduling a reset (or rather, allowing a *new* index to be generated)
        // using `_.defer` (which typically uses `setTimeout(fn, 0)`),
        // we ensure that all actions within the same synchronous execution path
        // receive the same "magic fusion index."

        var callstackWasIndexed = false; // Flag to indicate if the current call stack has been assigned an index.
        var magicFusionIndex    = -1;    // The current magic index, initialized to -1.

        function indexCycle() {
            // Increment the index for a new "call stack cycle."
            magicFusionIndex++;
            callstackWasIndexed = true;

            // Defer a function to reset the flag. This function will execute
            // after the current call stack has completely unwound.
            _.defer( function () {
                // Once the event loop cycles, this signals the start of a new potential "action group."
                callstackWasIndexed = false;
            } );
        }

        return function () {
            // If the current call stack hasn't been indexed yet, assign it a new index.
            if ( !callstackWasIndexed ) {
                indexCycle();
            }
            // Return the current index. All calls within the same stack will get the same index.
            return magicFusionIndex;
        };
    } )();


    /*
     * A registry for objects, primarily used to track Backbone models/collections
     * to prevent duplicate event listener bindings.
     *
     * @constructor
     */
    function ObjectRegistry () {
        // This registry employs a dual storage strategy:
        // 1. For Backbone objects (which typically have a `cid` - client ID),
        //    the `cid` is used as a property key in `registeredObjects`.
        //    This provides fast O(1) lookup and avoids modifying array length.
        // 2. For non-Backbone objects (without a `cid`), they are simply pushed
        //    into the `registeredObjects` array, requiring O(N) lookup.
        this.registeredObjects = [];

        // To efficiently retrieve all `cid`-based objects, their `cid`s are
        // also stored in this separate array.
        this.cidIndexes = [];
    }

    ObjectRegistry.prototype = {

        /*
         * Checks if a given object is already present in this registry.
         *
         * @this  {ObjectRegistry}
         * @param {Object}  obj The object to verify.
         * @returns {Boolean} `true` if the object is registered, `false` otherwise.
         */
        isRegistered: function ( obj ) {
            // Performance optimization: use `cid` for direct lookup if available,
            // otherwise fall back to `_.contains` for array search.
            return obj && obj.cid
                 ? this.registeredObjects[ obj.cid ]
                 : _.contains( this.registeredObjects, obj );
        },

        /*
         * Adds an object to this registry if it's not already registered.
         *
         * @this  {ObjectRegistry}
         * @param {Object}  obj The object to add.
         * @returns {Boolean} `true` if the object was newly registered, `false` if already registered.
         */
        register: function ( obj ) {
            if ( !this.isRegistered( obj ) ) {
                if ( obj && obj.cid ) {
                    this.registeredObjects[ obj.cid ] = obj;
                    this.cidIndexes.push( obj.cid ); // Store the cid for later retrieval.
                } else {
                    this.registeredObjects.push( obj ); // For non-cid objects, simply add to array.
                }
                return true;
            }
            return false;
        },

        /*
         * Removes an object from this registry.
         *
         * @this  {ObjectRegistry}
         * @param {Object}  obj The object to remove.
         * @returns {Boolean} `true` if the object was successfully unregistered, `false` if not found.
         */
        unregister: function ( obj ) {
            if ( this.isRegistered( obj ) ) {
                if ( obj && obj.cid ) {
                    delete this.registeredObjects[ obj.cid ];
                    // Remove the cid from the index array.
                    this.cidIndexes.splice( _.indexOf( this.cidIndexes, obj.cid ), 1 );
                } else {
                    // Find and remove the object from the array.
                    var i = _.indexOf( this.registeredObjects, obj );
                    this.registeredObjects.splice( i, 1 );
                }
                return true;
            }
            return false;
        },

        /*
         * Retrieves all objects currently stored in this registry.
         *
         * @returns {Array} An array containing all registered objects.
         */
        get: function () {
            // Combine objects stored by cid with those stored directly in the array.
            // Note: `registeredObjects` might contain `undefined` at `cid` indices that were deleted,
            // but `concat` on `cidIndexes` mapped elements correctly handles this.
            return ( _.map( this.cidIndexes, function ( cid ) {
                return this.registeredObjects[ cid ];
            }, this ) ).concat( this.registeredObjects );
        }
    };

    /*
     * A helper function to bind or unbind the "all" event listener
     * on a collection of objects.
     *
     * @param  {String}   which   Specifies the operation: "on" to bind, "off" to unbind.
     * @param  {Object[]} objects An array of objects to apply the listener operation on.
     * @param  {Function} [fn]    The callback function for the "all" event. Required for "on", optional for "off".
     * @param  {Object}   [ctx]   The context (`this`) for the callback function.
     * @returns {undefined}
     */
    function onoff ( which, objects, fn, ctx ) {
        var i, l, obj;

        for ( i = 0, l = objects.length; i < l; i++ ) {
            obj = objects[ i ];

            // Skip if the object is null or undefined.
            if ( !obj ) {
                continue;
            }

            if ( which === "on" ) {
                // Attempt to register the object. If already registered, skip binding.
                if ( !ctx.objectRegistry.register( obj ) ) {
                    continue;
                }
            } else { // which === "off"
                // Attempt to unregister the object. If not registered, skip unbinding.
                if ( !ctx.objectRegistry.unregister( obj ) ) {
                    continue;
                }
            }

            // If the object has the specified method ("on" or "off"), call it.
            if ( _.isFunction( obj[ which ] ) ) {
                obj[ which ]( "all", fn, ctx );
            }
        }
    }

    /*
     * Executes the appropriate undo or redo function for a given action.
     *
     * @param  {String} which  Indicates the desired operation: "undo" or "redo".
     * @param  {Object} action An object representing the action, containing its type, attributes, and undo/redo handlers.
     * @returns {undefined}
     */
    function actionUndoRedo ( which, action ) {
        // Extract action type and available undo/redo handlers.
        var type      = action.type;
        var undoTypes = action.undoTypes;
        // Determine the specific function to call (e.g., undoTypes.change.undo).
        var fn        = !undoTypes[ type ] || undoTypes[ type ][ which ];

        // If a valid function is found, execute it with the action's details.
        if ( _.isFunction( fn ) ) {
            fn( action.object, action.before, action.after, action.options );
        }
    }

    /*
     * The core function for performing undo and redo operations on an UndoStack.
     *
     * @param  {String}      which      The operation to perform: "undo" or "redo".
     * @param  {UndoManager} manager    The UndoManager instance that will trigger events.
     * @param  {UndoStack}   stack      The UndoStack collection to operate on.
     * @param  {Boolean}     magic      If `true`, all actions with the same `magicFusionIndex` are processed.
     * @param  {Boolean}     everything If `true`, all available actions are processed until the stack's limit.
     * @returns {undefined}
     */
    function managerUndoRedo ( which, manager, stack, magic, everything ) {

        // Prevent operations if already in an undo/redo cycle,
        // or if at the stack's boundaries.
        if ( stack.isCurrentlyUndoRedoing ||
             ( which === "undo" && stack.pointer === -1 ) ||
             ( which === "redo" && stack.pointer === stack.length - 1 ) ) {
            return;
        }

        stack.isCurrentlyUndoRedoing = true; // Set flag to prevent re-entrancy.

        var action, actions;
        var isUndo = which === "undo";

        if ( everything ) {
            // If `everything` is true, process all actions from the current pointer
            // to the beginning (for undo) or end (for redo) of the stack.
            actions = ( isUndo && stack.pointer === stack.length - 1 ) || // If undoing from the very end.
                      ( !isUndo && stack.pointer === -1 )                  // If redoing from the very beginning.
                    ? _.clone( stack.models )                              // -> Take all models.
                    : core_slice.apply( stack.models, isUndo ? [ 0, stack.pointer + 1 ] : [ stack.pointer + 1, stack.length ] );
                                                                           // Otherwise, slice the relevant portion.
        } else {
            // If `everything` is false, process only one or a group of actions.
            action = stack.at( isUndo ? stack.pointer : stack.pointer + 1 );
            actions = magic ? stack.where( { "magicFusionIndex": action.get( "magicFusionIndex" ) } ) : [ action ];
        }

        // Adjust the stack pointer based on the number of actions processed.
        stack.pointer += ( isUndo ? -1 : 1 ) * actions.length;

        // Execute the undo/redo method for each action.
        while ( action = isUndo ? actions.pop() : actions.shift() ) {
            action[ which ]();
        }

        stack.isCurrentlyUndoRedoing = false; // Reset the flag.

        // Trigger an event on the manager to signal completion.
        manager.trigger( which, manager );
    }


    /*
     * Determines whether an UndoAction should be generated.
     * It checks the `condition` property within the `undoTypes` definition for the event type.
     *
     * @param  {Object}    undoTypesType The specific event type definition from `UndoTypes` (e.g., `UndoTypes.change`).
     * @param  {Arguments} args          The arguments that would be passed to the `condition` function.
     * @returns {Boolean} `true` if an UndoAction should be created, `false` otherwise.
     */
    function validateUndoActionCreation ( undoTypesType, args ) {
        var condition = undoTypesType.condition;
        var type      = typeof condition;

        // If `condition` is a function, execute it and convert its result to a boolean.
        if ( type === "function" ) {
            return !!apply( condition, undoTypesType, args );
        }
        // If `condition` is a boolean, return its value directly.
        if ( type === "boolean" ) {
            return condition;
        }
        // Otherwise (e.g., `condition` is undefined), default to true.
        return true;
    }


    /*
     * Adds a new Undo-Action to the provided UndoStack.
     * This function checks tracking status and validation before creation.
     *
     * @param {UndoStack}      stack     The UndoStack where the action will be added.
     * @param {String}         type      The event type (e.g., "change", "add").
     * @param {Arguments}      args      The arguments received by the event handler.
     * @param {OwnedUndoTypes} undoTypes The `undoTypes` object containing the event handlers.
     * @returns {undefined}
     */
    function addToStack ( stack, type, args, undoTypes ) {
        // Proceed only if tracking is enabled, not currently undoing/redoing,
        // the event type is defined, and the action passes validation.
        if ( stack.track && !stack.isCurrentlyUndoRedoing && type in undoTypes &&
             validateUndoActionCreation( undoTypes[ type ], args ) ) {

            // Execute the 'on' handler to prepare action data.
            var res  = apply( undoTypes[ type ][ "on" ], undoTypes[ type ], args );
            var diff;

            // Ensure the 'on' handler returned a valid action object.
            if ( hasKeys( res, "object", "before", "after" ) ) {
                res.type           = type;
                res.magicFusionIndex = getMagicFusionIndex(); // Assign a unique index for grouping.
                res.undoTypes      = undoTypes;

                // If the pointer is not at the end of the stack,
                // it implies that previous actions were undone.
                // Any new action must truncate the "future" history.
                if ( stack.pointer < stack.length - 1 ) {
                    diff = stack.length - stack.pointer - 1;
                    while ( diff-- ) {
                        stack.pop(); // Remove actions that are no longer in the current history path.
                    }
                }

                stack.pointer = stack.length; // Move pointer to the new end of the stack.
                stack.add( res ); // Add the new action.

                // Enforce the maximum stack length.
                if ( stack.length > stack.maximumStackLength ) {
                    stack.shift(); // Remove the oldest action.
                    stack.pointer--; // Adjust pointer accordingly.
                }
            }
        }
    }


    /*
     * `UndoTypes` provides a collection of predefined handlers for common Backbone events.
     * These handlers define how to record ("on"), undo, and redo specific actions.
     * @type {Object}
     */
    var UndoTypes = {
        "add": {
            "undo": function ( collection, ignore, model, options ) {
                // To undo an 'add' operation, remove the model.
                collection.remove( model, options );
            },
            "redo": function ( collection, ignore, model, options ) {
                // To redo an 'add' operation, add the model back.
                if ( options.index ) {
                    options.at = options.index; // Restore original position if available.
                }
                collection.add( model, options );
            },
            "on": function ( model, collection, options ) {
                // When an 'add' event occurs, capture the relevant data.
                return {
                    object: collection,
                    before: undefined, // No 'before' state for an add.
                    after: model,
                    options: _.clone( options ) // Clone options to prevent mutation.
                };
            }
        },

        "remove": {
            "undo": function ( collection, model, ignore, options ) {
                // To undo a 'remove' operation, add the model back.
                if ( "index" in options ) {
                    options.at = options.index; // Restore original position.
                }
                collection.add( model, options );
            },
            "redo": function ( collection, model, ignore, options ) {
                // To redo a 'remove' operation, remove the model again.
                collection.remove( model, options );
            },
            "on": function ( model, collection, options ) {
                // When a 'remove' event occurs, capture the data.
                return {
                    object: collection,
                    before: model,
                    after: undefined, // No 'after' state for a remove.
                    options: _.clone( options )
                };
            }
        },

        "change": {
            "undo": function ( model, before, after, options ) {
                // To undo a 'change' operation, revert attributes to their 'before' state.
                if ( _.isEmpty( before ) ) {
                    // If 'before' is empty, it means attributes were newly set (no prior value).
                    // So, undoing means unsetting these attributes.
                    _.each( _.keys( after ), model.unset, model );
                } else {
                    // Otherwise, set the model's attributes back to their state before the change.
                    model.set( before );
                    // If attributes were unset during the change, undoing means setting them back.
                    if ( options && options.unsetData && options.unsetData.before && options.unsetData.before.length ) {
                        _.each( options.unsetData.before, model.unset, model );
                    }
                }
            },
            "redo": function ( model, before, after, options ) {
                // To redo a 'change' operation, apply the 'after' state.
                if ( _.isEmpty( after ) ) {
                    // If 'after' is empty, it means attributes were unset.
                    // So, redoing means unsetting these attributes again.
                    _.each( _.keys( before ), model.unset, model );
                } else {
                    // Otherwise, set the model's attributes to their state after the change.
                    model.set( after );
                    // If attributes were unset during the change, redoing means unsetting them again.
                    if ( options && options.unsetData && options.unsetData.after && options.unsetData.after.length ) {
                        _.each( options.unsetData.after, model.unset, model );
                    }
                }
            },
            "on": function ( model, options ) {
                // When a 'change' event occurs, capture the changed and previous attributes.
                var
                afterAttributes    = model.changedAttributes(),
                keysAfter          = _.keys( afterAttributes ),
                previousAttributes = _.pick( model.previousAttributes(), keysAfter ),
                keysPrevious       = _.keys( previousAttributes ),
                // Initialize an object to track attributes that were unset during the change.
                unsetData          = ( options || ( options = {} ) ).unsetData = {
                    after: [],
                    before: []
                };

                // Detect attributes that were either newly added or unset.
                if ( keysAfter.length != keysPrevious.length ) {
                    if ( keysAfter.length > keysPrevious.length ) {
                        // Attributes were added (existed in `after` but not in `previous`).
                        _.each( keysAfter, function ( val ) {
                            if ( !( val in previousAttributes ) ) {
                                unsetData.before.push( val ); // These were unset *before* this change.
                            }
                        }, this );
                    } else {
                        // Attributes were unset (existed in `previous` but not in `after`).
                        _.each( keysPrevious, function ( val ) {
                            if ( !( val in afterAttributes ) ) {
                                unsetData.after.push( val ); // These were unset *during* this change.
                            }
                        } );
                    }
                }
                return {
                    object: model,
                    before: previousAttributes,
                    after: afterAttributes,
                    options: _.clone( options )
                };
            }
        },

        "reset": {
            "undo": function ( collection, before, after ) {
                // To undo a 'reset', revert the collection to its 'before' state.
                collection.reset( before );
            },
            "redo": function ( collection, before, after ) {
                // To redo a 'reset', apply the 'after' state.
                collection.reset( after );
            },
            "on": function ( collection, options ) {
                // When a 'reset' event occurs, capture the models before and after.
                return {
                    object: collection,
                    before: options.previousModels, // Models before the reset.
                    after: _.clone( collection.models ) // Current models after the reset.
                };
            }
        }
    };

    /*
     * Represents an UndoTypes object specific to an UndoManager instance.
     * This constructor sets `UndoTypes` as its prototype, enabling inheritance
     * of default handlers while allowing individual instances to override or add types.
     *
     * @constructor
     */
    function OwnedUndoTypes () {}
    OwnedUndoTypes.prototype = UndoTypes; // Inherits from the global UndoTypes.

    /*
     * Utility function to modify (add, change, or remove) undo-types within an `UndoTypes` object.
     * This function supports single operations or bulk operations via arrays or objects.
     *
     * Possible call patterns:
     * - Single add/change: `manipulateUndoType( 1, "reset", { "on": function() {} }, myUndoTypes )`
     * - Bulk add/change: `manipulateUndoType( 1, { "reset": { "on": function() {} }, "change": { ... } }, myUndoTypes )`
     * - Bulk remove: `manipulateUndoType( 2, ["reset", "change"], null, myUndoTypes )`
     *
     * @param  {Number}                   manipType         Specifies the action: 0 (add), 1 (change), 2 (remove).
     * @param  {String|Object|Array}      undoType          The key(s) or object defining the undo-type(s) to modify.
     * @param  {Object}                   [fns]             An object containing `undo`, `redo`, `on` functions. Optional if `undoType` is an object.
     * @param  {OwnedUndoTypes|UndoTypes} undoTypesInstance The target `UndoTypes` object to modify.
     * @returns {undefined}
     */
    function manipulateUndoType ( manipType, undoType, fns, undoTypesInstance ) {
        // `manipType` values:
        // 0: Add a new undo-type.
        // 1: Change an existing undo-type.
        // 2: Remove an undo-type.
        // The implementation details for these operations would follow here,
        // working with `undoType`, `fns`, and `undoTypesInstance`.
    }
} );