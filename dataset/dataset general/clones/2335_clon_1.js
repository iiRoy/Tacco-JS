/*
 * This file represents a Type I clone.
 * It is structurally identical to the original source.
 * Only whitespace and comments have been altered.
 */

/*
 * Original commit identifier: 114cf5304a74ff8f7c9ff1d21cf5652298af04b0
 *
 * Creation timestamp: Wed Jul 18 2012 14:44:33 GMT-0700 (PDT)
 */

/*
   Licensed to the Apache Software Foundation (ASF) under one
   or more contributor license agreements.  See the NOTICE file
   distributed with this work for additional information
   regarding copyright ownership.  The ASF licenses this file
   to you under the Apache License, Version 2.0 (the
   "License"); you may not use this file except in compliance
   with the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing,
   software distributed under the License is distributed on an
   "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
   KIND, either express or implied.  See the License for the
   specific language governing permissions and limitations
   under the License.
*/

; ( function () {

    // --- Start of file: lib/scripts/require.js ---

    var require, define; // Declare global variables for the module system

    ( function () {

        var modules = {}; // Internal storage for all defined modules.

        /*
         * Helper function to build a module's exports.
         * This function is called when a module is first required.
         * @param {object} module The module object containing factory and id.
         * @returns {object} The exports object of the module.
         */
        function build( module ) {

            var factory = module.factory; // Get the factory function.
            module.exports = {};          // Initialize exports.
            delete module.factory;        // Remove factory to prevent re-execution.

            // Execute the factory function with require, exports, and module.
            factory( require, module.exports, module );

            return module.exports; // Return the populated exports.
        }

        /**
         * The global require function for loading modules.
         * @param {string} id The unique identifier of the module to load.
         * @returns {object} The exports of the requested module.
         * @throws {string} If the module is not found.
         */
        require = function ( id ) {

            // Check if the module has been defined.
            if ( !modules[ id ] ) {
                throw "module " + id + " not found";
            }

            // If the module has a factory, it means it hasn't been built yet.
            // Build it and then return its exports, otherwise return existing exports.
            return modules[ id ].factory ? build( modules[ id ] ) : modules[ id ].exports;

        };


        /**
         * The global define function for registering modules.
         * @param {string} id The unique identifier for the module.
         * @param {function} factory The factory function that creates the module's exports.
         * @throws {string} If a module with the same ID is already defined.
         */
        define = function ( id, factory ) {

            // Ensure the module isn't already defined.
            if ( modules[ id ] ) {
                throw "module " + id + " already defined";
            }

            // Store the module with its ID and factory.
            modules[ id ] = {
                id      : id,
                factory : factory
            };

        };

        // Allows for removing a module definition, primarily for testing or dynamic loading.
        define.remove = function ( id ) {
            delete modules[ id ];
        };

    } )(); // End of IIFE for require/define implementation.


    // Export `require` and `define` for use in Node.js environments.
    // This check ensures compatibility with CommonJS module systems.
    if ( typeof module === "object" && typeof require === "function" ) {

        module.exports.require = require;
        module.exports.define = define;

    }

    // --- End of file: lib/scripts/require.js ---


    // --- Start of file: lib/cordova.js ---

    /*
     * Main Cordova module definition.
     * This module orchestrates various functionalities like event handling and plugin communication.
     */
    define( "cordova", function ( require, exports, module ) {

        var channel = require( 'cordova/channel' ); // Import the channel module for event management.

        /**
         * Set up a listener for the DOMContentLoaded event.
         * This fires when the initial HTML document has been completely loaded and parsed,
         * without waiting for stylesheets, images, and subframes to finish loading.
         * We then notify our internal channel subscribers.
         */
        document.addEventListener( 'DOMContentLoaded', function () {

            channel.onDOMContentLoaded.fire(); // Trigger the DOM content loaded event.

        }, false );

        // If the document is already complete or interactive, fire the event immediately.
        if ( document.readyState == 'complete' || document.readyState == 'interactive' ) {

            channel.onDOMContentLoaded.fire();

        }


        /**
         * Intercept calls to addEventListener and removeEventListener.
         * This allows Cordova to manage special events like 'deviceready',
         * 'resume', and 'pause' internally, providing a consistent API.
         */
        var m_document_addEventListener = document.addEventListener;
        var m_document_removeEventListener = document.removeEventListener;
        var m_window_addEventListener = window.addEventListener;
        var m_window_removeEventListener = window.removeEventListener;


        /**
         * These objects store custom event handlers for document and window events.
         * They allow Cordova to subscribe/unsubscribe handlers to its internal channels.
         */
        var documentEventHandlers = {},
            windowEventHandlers = {};


        /**
         * Overrides the native `document.addEventListener`.
         * If the event is a custom Cordova event, it's handled by our channels;
         * otherwise, the original `addEventListener` is called.
         * @param {string} evt The event type.
         * @param {function} handler The event handler function.
         * @param {boolean} capture Whether to use capture phase.
         */
        document.addEventListener = function ( evt, handler, capture ) {

            var e = evt.toLowerCase(); // Normalize event type to lowercase.

            // Check if we have a custom handler for this event type.
            if ( typeof documentEventHandlers[ e ] != 'undefined' ) {

                if ( evt === 'deviceready' ) {
                    // 'deviceready' should only fire once per handler.
                    documentEventHandlers[ e ].subscribeOnce( handler );
                } else {
                    // Other events can fire multiple times.
                    documentEventHandlers[ e ].subscribe( handler );
                }

            } else {

                // For non-Cordova events, call the original method.
                m_document_addEventListener.call( document, evt, handler, capture );

            }

        };


        /**
         * Overrides the native `window.addEventListener`.
         * Similar to `document.addEventListener` but for window events.
         * @param {string} evt The event type.
         * @param {function} handler The event handler function.
         * @param {boolean} capture Whether to use capture phase.
         */
        window.addEventListener = function ( evt, handler, capture ) {

            var e = evt.toLowerCase();

            if ( typeof windowEventHandlers[ e ] != 'undefined' ) {

                windowEventHandlers[ e ].subscribe( handler );

            } else {

                m_window_addEventListener.call( window, evt, handler, capture );

            }

        };


        /**
         * Overrides the native `document.removeEventListener`.
         * Removes handlers from custom Cordova channels or calls the original method.
         * @param {string} evt The event type.
         * @param {function} handler The event handler function.
         * @param {boolean} capture Whether to use capture phase.
         */
        document.removeEventListener = function ( evt, handler, capture ) {

            var e = evt.toLowerCase();

            // If unsubscribing from an event that is handled by a plugin...
            if ( typeof documentEventHandlers[ e ] != "undefined" ) {

                documentEventHandlers[ e ].unsubscribe( handler );

            } else {

                m_document_removeEventListener.call( document, evt, handler, capture );

            }

        };


        /**
         * Overrides the native `window.removeEventListener`.
         * Removes handlers from custom Cordova channels or calls the original method.
         * @param {string} evt The event type.
         * @param {function} handler The event handler function.
         * @param {boolean} capture Whether to use capture phase.
         */
        window.removeEventListener = function ( evt, handler, capture ) {

            var e = evt.toLowerCase();

            // If unsubscribing from an event that is handled by a plugin...
            if ( typeof windowEventHandlers[ e ] != "undefined" ) {

                windowEventHandlers[ e ].unsubscribe( handler );

            } else {

                m_window_removeEventListener.call( window, evt, handler, capture );

            }

        };


        /**
         * Creates a custom DOM event object.
         * @param {string} type The type of the event.
         * @param {object} data Optional data to attach to the event object.
         * @returns {Event} The created event object.
         */
        function createEvent( type, data ) {

            var event = document.createEvent( 'Events' ); // Create a generic DOM event.
            event.initEvent( type, false, false );        // Initialize it.

            // Attach any provided data properties to the event.
            if ( data ) {
                for ( var i in data ) {
                    if ( data.hasOwnProperty( i ) ) {
                        event[ i ] = data[ i ];
                    }
                }
            }

            return event;

        }

        // Simple console polyfill for environments that might not have it.
        // This prevents errors if `console.log` is called where `console` doesn't exist.
        if ( typeof window.console === "undefined" ) {
            window.console = {
                log : function () { } // Dummy log function.
            };
        }


        /**
         * The main Cordova object, providing core functionalities and APIs.
         * This object is exposed globally and contains methods for plugin interaction,
         * event management, and internal state.
         */
        var cordova = {
            define : define,  // Re-export the define function.
            require : require, // Re-export the require function.

            /**
             * Methods to add/remove your own addEventListener hijacking on document + window.
             * These allow external code to register custom event handlers that use Cordova's channel system.
             */
            addWindowEventHandler : function ( event, opts ) {
                return ( windowEventHandlers[ event ] = channel.create( event, opts ) );
            },
            addDocumentEventHandler : function ( event, opts ) {
                return ( documentEventHandlers[ event ] = channel.create( event, opts ) );
            },
            removeWindowEventHandler : function ( event ) {
                delete windowEventHandlers[ event ];
            },
            removeDocumentEventHandler : function ( event ) {
                delete documentEventHandlers[ event ];
            },

            /**
             * Retrieve original event handlers that were replaced by Cordova.
             * This can be useful for debugging or advanced scenarios where direct
             * access to native event methods is required.
             * @return {object} An object containing references to the original `addEventListener` and `removeEventListener` methods.
             */
            getOriginalHandlers : function () {
                return {
                    'document' : {
                        'addEventListener'    : m_document_addEventListener,
                        'removeEventListener' : m_document_removeEventListener
                    },
                    'window' : {
                        'addEventListener'    : m_window_addEventListener,
                        'removeEventListener' : m_window_removeEventListener
                    }
                };
            },

            /**
             * Method to fire a document event from native code.
             * This is typically used by the native platform to signal events to JavaScript.
             * @param {string} type The type of event to fire (e.g., 'deviceready').
             * @param {object} data Optional data to include with the event.
             */
            fireDocumentEvent : function ( type, data ) {

                var evt = createEvent( type, data );

                if ( typeof documentEventHandlers[ type ] != 'undefined' ) {
                    // Use setTimeout to ensure event firing is asynchronous and non-blocking.
                    setTimeout( function () {
                        documentEventHandlers[ type ].fire( evt );
                    }, 0 );
                } else {
                    document.dispatchEvent( evt ); // Fallback to native dispatch.
                }

            },

            /**
             * Method to fire a window event from native code.
             * Similar to `fireDocumentEvent` but for window-level events.
             * @param {string} type The type of event to fire.
             * @param {object} data Optional data.
             */
            fireWindowEvent : function ( type, data ) {

                var evt = createEvent( type, data );

                if ( typeof windowEventHandlers[ type ] != 'undefined' ) {
                    setTimeout( function () {
                        windowEventHandlers[ type ].fire( evt );
                    }, 0 );
                } else {
                    window.dispatchEvent( evt );
                }

            },

            // TODO: this is Android only; think about how to do this better
            shuttingDown : false,

            UsePolling : false,
            // END TODO

            // TODO: iOS only
            // This queue holds the currently executing command and all pending
            // commands executed with cordova.exec().
            commandQueue : [],

            // Indicates if we're currently in the middle of flushing the command
            // queue on the native side.
            commandQueueFlushing : false,
            // END TODO

            /**
             * Plugin callback mechanism.
             * Manages unique callback IDs and stores callback functions.
             */
            callbackId : 0,

            callbacks : {},

            /**
             * Standardized status codes for plugin callbacks.
             * These codes indicate the result of a native call.
             */
            callbackStatus : {
                NO_RESULT                 : 0,
                OK                        : 1,
                CLASS_NOT_FOUND_EXCEPTION : 2,
                ILLEGAL_ACCESS_EXCEPTION  : 3,
                INSTANTIATION_EXCEPTION   : 4,
                MALFORMED_URL_EXCEPTION   : 5,
                IO_EXCEPTION              : 6,
                INVALID_ACTION            : 7,
                JSON_EXCEPTION            : 8,
                ERROR                     : 9
            },

            /**
             * Called by native code when a successful result is returned from an action.
             * This function dispatches the result to the appropriate JavaScript callback.
             * @param {string} callbackId The ID of the callback to invoke.
             * @param {object} args An object containing status and message.
             */
            callbackSuccess : function ( callbackId, args ) {

                if ( cordova.callbacks[ callbackId ] ) {

                    // If result is to be sent to callback
                    if ( args.status == cordova.callbackStatus.OK ) {
                        try {
                            if ( cordova.callbacks[ callbackId ].success ) {
                                cordova.callbacks[ callbackId ].success( args.message );
                            }
                        }
                        catch ( e ) {
                            console.log( "Error in success callback: " + callbackId + " = " + e );
                        }
                    }

                    // Clear callback if not expecting any more results (i.e., not a keepCallback).
                    if ( !args.keepCallback ) {
                        delete cordova.callbacks[ callbackId ];
                    }
                }

            },

            /**
             * Called by native code when an error result is returned from an action.
             * This function dispatches the error message to the appropriate JavaScript callback.
             * @param {string} callbackId The ID of the callback to invoke.
             * @param {object} args An object containing status and message.
             */
            callbackError : function ( callbackId, args ) {

                if ( cordova.callbacks[ callbackId ] ) {
                    try {
                        if ( cordova.callbacks[ callbackId ].fail ) {
                            cordova.callbacks[ callbackId ].fail( args.message );
                        }
                    }
                    catch ( e ) {
                        console.log( "Error in error callback: " + callbackId + " = " + e );
                    }

                    // Clear callback if not expecting any more results.
                    if ( !args.keepCallback ) {
                        delete cordova.callbacks[ callbackId ];
                    }
                }

            },

            /**
             * Adds a function to be executed once Cordova is ready.
             * These functions are often called "constructors" as they set up initial states.
             * @param {function} func The function to execute.
             */
            addConstructor : function ( func ) {
                channel.onCordovaReady.subscribeOnce( function () {
                    try {
                        func();
                    } catch ( e ) {
                        console.log( "Failed to run constructor: " + e );
                    }
                } );
            }
        };


        // Register key channels as custom document events.
        // These events are managed by Cordova's event interception mechanism.
        channel.onPause = cordova.addDocumentEventHandler( 'pause' );
        channel.onResume = cordova.addDocumentEventHandler( 'resume' );
        channel.onDeviceReady = cordova.addDocumentEventHandler( 'deviceready' );


        // Export the cordova object as the module's public interface.
        module.exports = cordova;

    } );

    // --- End of file: lib/cordova.js ---


    // --- Start of file: lib/common/builder.js ---

    /*
     * This module provides utilities for dynamically building and merging JavaScript objects,
     * particularly for exposing Cordova plugin APIs into the global scope or other objects.
     */
    define( "cordova/builder", function ( require, exports, module ) {

        var utils = require( 'cordova/utils' ); // Import utility functions.

        /**
         * Iterates over properties of an object.
         * @param {object} objects The object to iterate over.
         * @param {function} func The callback function to execute for each property.
         * @param {object} context The `this` context for the callback.
         */
        function each( objects, func, context ) {
            for ( var prop in objects ) {
                if ( objects.hasOwnProperty( prop ) ) {
                    func.apply( context, [ objects[ prop ], prop ] );
                }
            }
        }

        /**
         * Includes a set of objects (modules/properties) into a parent object.
         * This function handles clobbering (overwriting) and merging logic.
         * @param {object} parent The target object to include properties into.
         * @param {object} objects A map of properties to include. Each property can specify a `path` to a module.
         * @param {boolean} clobber If true, existing properties in `parent` will be overwritten.
         * @param {boolean} merge If true, properties will be merged recursively instead of fully overwritten.
         */
        function include( parent, objects, clobber, merge ) {

            each( objects, function ( obj, key ) {
                try {
                    // Resolve the object's value: either by requiring a module or an empty object.
                    var result = obj.path ? require( obj.path ) : {};

                    if ( clobber ) {
                        // If clobbering is enabled:
                        // Clobber if the property doesn't exist yet, or if it's a new path.
                        if ( typeof parent[ key ] === 'undefined' ) {
                            parent[ key ] = result;
                        } else if ( typeof obj.path !== 'undefined' ) {
                            // If merging is also enabled, perform a recursive merge.
                            if ( merge ) {
                                recursiveMerge( parent[ key ], result );
                            } else {
                                // Otherwise, simply clobber (overwrite).
                                parent[ key ] = result;
                            }
                        }
                        result = parent[ key ]; // Ensure result points to the updated parent property.
                    } else {
                        // If clobbering is NOT enabled:
                        // Overwrite only if not currently defined.
                        if ( typeof parent[ key ] == 'undefined' ) {
                            parent[ key ] = result;
                        } else if ( merge && typeof obj.path !== 'undefined' ) {
                            // If merging, merge parent's existing properties onto the new result.
                            recursiveMerge( result, parent[ key ] );
                            parent[ key ] = result;
                        } else {
                            // Set result to what already exists, so children can be built into it.
                            result = parent[ key ];
                        }
                    }

                    // Recursively include children if they exist for the current object.
                    if ( obj.children ) {
                        include( result, obj.children, clobber, merge );
                    }
                } catch ( e ) {
                    // Log any exceptions that occur during the build process.
                    utils.alert( 'Exception building cordova JS globals: ' + e + ' for key "' + key + '"' );
                }
            } );
        }

        /**
         * Recursively merges properties from a source object into a target object.
         * Properties from the source object will overwrite existing target properties.
         * This is a deep merge operation.
         *
         * @param {object} target Object to merge properties into.
         * @param {object} src Object to merge properties from.
         * @returns {object} The modified target object.
         */
        function recursiveMerge( target, src ) {
            for ( var prop in src ) {
                if ( src.hasOwnProperty( prop ) ) {
                    if ( typeof target.prototype !== 'undefined' && target.prototype.constructor === target ) {
                        // If the target object is a constructor, override its prototype.
                        target.prototype[ prop ] = src[ prop ];
                    } else {
                        // If the source property is an object, recurse; otherwise, assign directly.
                        target[ prop ] = typeof src[ prop ] === 'object' ? recursiveMerge(
                            target[ prop ], src[ prop ] ) : src[ prop ];
                    }
                }
            }
            return target;
        }

        // Export the build function, which provides methods for different inclusion strategies.
        module.exports = {
            build : function ( objects ) {
                return {
                    intoButDontClobber : function ( target ) {
                        include( target, objects, false, false ); // Don't clobber, don't merge (overwrite only if undefined).
                    },
                    intoAndClobber : function ( target ) {
                        include( target, objects, true, false );  // Clobber, but don't deep merge (overwrite).
                    },
                    intoAndMerge : function ( target ) {
                        include( target, objects, true, true );   // Clobber and deep merge.
                    }
                };
            }
        };

    } );

    // --- End of file: lib/common/builder.js ---


    // --- Start of file: lib/common/channel.js ---

    /*
     * The channel module provides a custom publish-subscribe mechanism.
     * It's central to Cordova's initialization and event management.
     */
    define( "cordova/channel", function ( require, exports, module ) {

        var utils = require( 'cordova/utils' ); // Import utility functions.

        /**
         * Custom pub-sub "channel" that can have functions subscribed to it.
         * This object is used to define and control firing of events for
         * cordova initialization.
         *
         * The order of events during page load and Cordova startup is as follows:
         *
         * 1.  `onDOMContentLoaded`       : Internal event, web page is loaded and parsed.
         * 2.  `onNativeReady`            : Internal event, Cordova native side is ready.
         * 3.  `onCordovaReady`           : Internal event, all Cordova JavaScript objects have been created.
         * 4.  `onCordovaInfoReady`       : Internal event, device properties are available.
         * 5.  `onCordovaConnectionReady` : Internal event, connection property has been set.
         * 6.  `onDeviceReady`            : **User event**, indicates Cordova is fully ready.
         * 7.  `onResume`                 : **User event**, app has returned to foreground.
         * 8.  `onPause`                  : **User event**, app has moved to background.
         * 9.  `onDestroy`                : Internal event, app is being destroyed (users should use `window.onunload`).
         *
         * The only Cordova events that user code should register for are:
         *      - `deviceready`: Cordova native code is initialized and APIs can be called.
         *      - `pause`      : App has moved to background.
         *      - `resume`     : App has returned to foreground.
         *
         * Listeners can be registered as:
         *      `document.addEventListener("deviceready", myDeviceReadyListener, false);`
         *      `document.addEventListener("resume", myResumeListener, false);`
         *      `document.addEventListener("pause", myPauseListener, false);`
         *
         * The DOM lifecycle events should be used for saving and restoring state:
         *      `window.onload`
         *      `window.onunload`
         *
         */

        /**
         * Channel constructor.
         * Creates a new event channel.
         * @constructor
         * @param {string} type The name/type of the channel.
         * @param {object} [opts] Optional configuration options for the channel.
         *                 - `onSubscribe`: Callback fired when a handler subscribes.
         *                 - `onUnsubscribe`: Callback fired when a handler unsubscribes.
         */
        var Channel = function ( type, opts ) {
                this.type = type;           // The name of this channel.
                this.handlers = {};         // Stores subscribed handlers.
                this.numHandlers = 0;       // Count of active handlers.
                this.guid = 1;              // Unique ID generator for handlers.
                this.fired = false;         // True if the channel has fired at least once.
                this.enabled = true;        // Can be disabled to prevent firing.
                this.events = {             // Event hooks for subscribe/unsubscribe.
                    onSubscribe   : null,
                    onUnsubscribe : null
                };

                // Apply options if provided.
                if ( opts ) {
                    if ( opts.onSubscribe ) {
                        this.events.onSubscribe = opts.onSubscribe;
                    }
                    if ( opts.onUnsubscribe ) {
                        this.events.onUnsubscribe = opts.onUnsubscribe;
                    }
                }
            },
            channel = { // The main channel object, acting as a registry and factory.

                /**
                 * Calls the provided function only after all of the specified channels have fired.
                 * This is useful for synchronizing multiple asynchronous events.
                 * @param {function} h The handler function to call.
                 * @param {Array<Channel>} c An array of Channel objects to wait for.
                 */
                join : function ( h, c ) {
                    var i = c.length;
                    var len = i;
                    var f = function () {
                        if ( ! ( --i ) ) {
                            h();
                        }
                    };
                    for ( var j = 0; j < len; j++ ) {
                        !c[ j ].fired ? c[ j ].subscribeOnce( f ) : i--;
                    }
                    if ( !i ) {
                        h();
                    }
                },

                /**
                 * Creates a new Channel instance and registers it on the global `channel` object.
                 * @param {string} type The name for the new channel.
                 * @param {object} [opts] Options for the new channel.
                 * @returns {Channel} The newly created Channel object.
                 */
                create : function ( type, opts ) {
                    channel[ type ] = new Channel( type, opts );
                    return channel[ type ];
                },

                /**
                 * An array of Cordova Channels that must fire before "deviceready" is fired.
                 * This acts as a checklist for critical initialization steps.
                 */
                deviceReadyChannelsArray : [],

                /**
                 * A map (hash table) of the same channels for quick lookup.
                 */
                deviceReadyChannelsMap : {},

                /**
                 * Indicate that a feature needs to be initialized before it is ready to be used.
                 * This holds up Cordova's "deviceready" event until the feature has been initialized.
                 *
                 * Usage:
                 * `channel.waitForInitialization('myFeature');`
                 * `// ... later when 'myFeature' is ready ...`
                 * `channel.initializationComplete('myFeature');`
                 */
                // (Note: The actual implementation for waitForInitialization and initializationComplete
                // is missing in the provided snippet, but this comment describes its purpose.)
            };

    } );

    // --- End of file: lib/common/channel.js ---

} )(); // End of global IIFE.