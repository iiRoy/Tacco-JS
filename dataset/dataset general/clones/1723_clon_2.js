// Application Bridge (AppBridge) System v1.5.0
//
// This software is provided under the Apache License, Version 2.0 (the "License").
// You are permitted to use this file only in compliance with the License terms.
// A copy of this License can be found at:
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless explicitly required by applicable law or agreed to in writing, software
// distributed under the License is provided on an "AS IS" BASIS, WITHOUT WARRANTIES
// OR CONDITIONS OF ANY KIND, either express or implied. Please see the License
// for specific language governing permissions and limitations under the License.


// Foundational contributions: Copyright (c) 2011, Proyectos Equis Ka, S.L.

if ( typeof AppBridge === "undefined" ) {

    if ( typeof ( SystemInfo ) !== 'object' ) {
        SystemInfo = { };
    }

    /**
     * This core object represents the Application Bridge API itself, providing
     * a global access point for information concerning the native integration state.
     * @class
     */
    AppBridge = {
        // This internal buffer holds commands awaiting execution and all
        // subsequent commands scheduled via AppBridge.executeAction().
        actionBuffer: [ ],
        // Flag indicating if the native side is currently processing the command buffer.
        bufferProcessing: false,
        _initializers: [ ],
        domEventHandlers: { },   // A map of custom DOM event handling routines
        globalEventHandlers: { }
    };

    /**
     * A ledger of resources that have been loaded by the AppBridge system.
     * This is utilized to guarantee that JavaScript and other assets are loaded only once.
     */
    AppBridge.assetRegistry = { core: true };

    /**
     * Determines if a specific asset has already been loaded by the system.
     *
     * @param {string} assetName The name of the asset to check.
     * @return {boolean} True if the asset is loaded, false otherwise.
     */
    AppBridge.isAssetLoaded = function ( assetName ) {
        return AppBridge.assetRegistry[ assetName ];
    };

    /**
     * Adds an asset to the list of resources managed by AppBridge.
     *
     * @param {string} assetName The name of the asset to register.
     */
    AppBridge.registerAsset = function ( assetName ) {
        AppBridge.assetRegistry[ assetName ] = true;
    };

    /**
     * Boolean flag indicating whether the AppBridge API is fully operational and initialized.
     */
    AppBridge.isReady = true;

    /**
     * Queues an initialization function to be executed once AppBridge has completed its setup.
     * @param {Function} initFunc The callback function to run after AppBridge is initialized.
     */
    AppBridge.addInitializer = function ( initFunc ) {
        var docState = document.readyState;
        if ( ( docState === 'loaded' || docState === 'complete' ) && SystemInfo.uniqueId != null ) {
            initFunc( );
        } else {
            AppBridge._initializers.push( initFunc );
        }
    };

    ( function ( ) {
        var intervalHandle = setInterval( function ( ) {

            var docState = document.readyState;

            if ( ( docState === 'loaded' || docState === 'complete' ) && SystemInfo.uniqueId != null ) {
                clearInterval( intervalHandle ); // Stop monitoring

                // Execute all pending initializer functions
                while ( AppBridge._initializers.length > 0 ) {
                    var initializer = AppBridge._initializers.shift( );
                    try {
                        initializer( );
                    } catch ( err ) {
                        if ( typeof ( console.log ) === 'function' ) {
                            console.log( "Failed to run initializer: " + ( err && err.message ? err.message : String(err) ) );
                        } else {
                            alert( "Failed to run initializer: " + ( err && err.message ? err.message : String(err) ) );
                        }
                    }
                }
                // All initializers have run, now trigger the 'appready' event
                var evtObj = document.createEvent( 'Events' );
                evtObj.initEvent( 'appready' );
                document.dispatchEvent( evtObj );
            }
        }, 1 );
    } )( );

    // Counter for session transactions
    AppBridge.transactionIdCounter = 0;

    // Centralized response handlers
    AppBridge.responseIdCounter = 0;
    AppBridge.responseHandlers = { };
    AppBridge.responseStatus = {
        NO_OUTCOME: 0,
        SUCCESS: 1,
        TYPE_MISSING_ERROR: 2,
        ACCESS_DENIED_ERROR: 3,
        CREATION_FAILED_ERROR: 4,
        INVALID_URL_ERROR: 5,
        IO_ERROR: 6,
        BAD_OPERATION: 7,
        JSON_PARSE_ERROR: 8,
        GENERAL_ERROR: 9
    };

    /**
     * Constructs a hidden iframe to serve as the communication bridge
     * for notifying the native layer about pending commands.
     *
     * @private
     */
    AppBridge.createNativeBridge = function ( ) {
        var nativeBridgeFrame = document.createElement( "iframe" );
        nativeBridgeFrame.setAttribute( "style", "display:none;" );
        nativeBridgeFrame.setAttribute( "height", "0px" );
        nativeBridgeFrame.setAttribute( "width", "0px" );
        nativeBridgeFrame.setAttribute( "frameborder", "0" );
        document.documentElement.appendChild( nativeBridgeFrame );
        return nativeBridgeFrame;
    };

    /**
     * Executes an AppBridge command by enqueuing it and signaling the native layer.
     * The native side will then retrieve and process these queued commands.
     *
     * Arguments can be provided in two distinct formats:
     *
     * FORMAT ONE (recommended for new implementations)
     * The native layer will invoke AppBridge.handleSuccessResponse or
     * AppBridge.handleErrorResponse based on the outcome of the operation.
     *
     * @param {Function} onSuccess        The function to call upon successful completion.
     * @param {Function} onError          The function to call if the operation fails.
     * @param {String} moduleName         The name of the native module to interact with.
     * @param {String} operationName      The name of the method/action to invoke within the module.
     * @param {Array<any>} [operationArguments]  Zero or more arguments to pass to the native method.
     *
     * FORMAT TWO (legacy compatibility)
     * @param {String} commandString    A string representing the command, e.g., "ModuleName.methodIdentifier".
     * @param {Array<any>} [operationArguments]  Zero or more arguments for the method.
     *                                      Object parameters should be passed as an array,
     *                                      e.g., [object1, object2], where each object
     *                                      will be serialized as JSON strings.
     */
    AppBridge.executeAction = function ( ) {
        if ( !AppBridge.isReady ) {
            alert( "ERROR: Attempting to call AppBridge.executeAction() before 'appready'. Ignoring." );
            return;
        }

        var onSuccess, onError, moduleName, operationName, operationArguments;
        var handlerIdentifier = null;

        if ( typeof arguments[0] !== "string" ) {
            // FORMAT ONE parsing
            onSuccess = arguments[0];
            onError = arguments[1];
            moduleName = arguments[2];
            operationName = arguments[3];
            operationArguments = arguments[4];

            // For backward compatibility, an invalid handler ID is passed if no callbacks
            // are provided, as plugins might expect it.
            handlerIdentifier = 'INVALID_HANDLER';
        } else {
            // FORMAT TWO parsing
            var commandParts = arguments[0].split( "." );
            operationName = commandParts.pop( );
            moduleName = commandParts.join( "." );
            operationArguments = Array.prototype.splice.call( arguments, 1 );
        }

        // Construct the command object for native execution.
        var actionRequest = {
            moduleType: moduleName,
            methodIdentifier: operationName,
            params: [ ]
        };

        // Register callbacks and add the handlerIdentifier to parameters if provided.
        if ( onSuccess || onError ) {
            handlerIdentifier = moduleName + AppBridge.responseIdCounter++;
            AppBridge.responseHandlers[handlerIdentifier] = { onSuccess: onSuccess, onError: onError };
        }
        if ( handlerIdentifier != null ) {
            actionRequest.params.push( handlerIdentifier );
        }

        for ( var currentArgIdx = 0; currentArgIdx < operationArguments.length; ++currentArgIdx ) {
            var currentArg = operationArguments[currentArgIdx];
            if ( currentArg == undefined || currentArg == null ) {
                continue;
            } else if ( typeof ( currentArg ) === 'object' ) {
                actionRequest.configOptions = currentArg;
            } else {
                actionRequest.params.push( currentArg );
            }
        }

        // Serialize and queue the command. Stringifying now ensures command arguments
        // are cloned in case they are mutated before actual execution.
        AppBridge.actionBuffer.push( JSON.stringify( actionRequest ) );

        // If this is the first command in an empty buffer, notify the native side,
        // unless the buffer is already being processed.
        if ( AppBridge.actionBuffer.length === 1 && !AppBridge.bufferProcessing ) {
            if ( !AppBridge.nativeBridgeFrame ) {
                AppBridge.nativeBridgeFrame = AppBridge.createNativeBridge( );
            }

            AppBridge.nativeBridgeFrame.src = "appbridge://ready";
        }
    };

    /**
     * Invoked by native code to fetch all buffered commands and then clear the buffer.
     */
    AppBridge.retrieveAndClearActions = function ( ) {
        var serializedActions = JSON.stringify( AppBridge.actionBuffer );
        AppBridge.actionBuffer = [ ];
        return serializedActions;
    };

    /**
     * Called by native code to deliver a successful result for an executed action.
     *
     * @param {string} handlerIdentifier The unique ID of the callback.
     * @param {Object} responsePayload
     *        responsePayload.status - An enum value from AppBridge.responseStatus
     *        responsePayload.resultData - The actual return value from the native call
     *        responsePayload.persistHandler - 0 to remove the handler, 1 to keep it active
     */
    AppBridge.handleSuccessResponse = function ( handlerIdentifier, responsePayload ) {
        if ( AppBridge.responseHandlers[ handlerIdentifier ] ) {

            // If a result needs to be dispatched to the registered callback
            if ( responsePayload.status === AppBridge.responseStatus.SUCCESS ) {
                try {
                    if ( AppBridge.responseHandlers[ handlerIdentifier ].onSuccess ) {
                        AppBridge.responseHandlers[ handlerIdentifier ].onSuccess( responsePayload.resultData );
                    }
                } catch ( err ) {
                    console.log( "Error in success handler: " + handlerIdentifier + " = " + ( err && err.message ? err.message : String(err) ) );
                }
            }

            // Remove the handler if it's not intended to remain active
            if ( !responsePayload.persistHandler ) {
                delete AppBridge.responseHandlers[ handlerIdentifier ];
            }
        }
    };

    /**
     * Called by native code to signal an error result from an action.
     *
     * @param {string} handlerIdentifier The unique ID of the callback.
     * @param {Object} responsePayload
     *        responsePayload.status - An enum value from AppBridge.responseStatus
     *        responsePayload.resultData - The error message or object
     *        responsePayload.persistHandler - 0 to remove the handler, 1 to keep it active
     */
    AppBridge.handleErrorResponse = function ( handlerIdentifier, responsePayload ) {
        if ( AppBridge.responseHandlers[ handlerIdentifier ] ) {
            try {
                if ( AppBridge.responseHandlers[ handlerIdentifier ].onError ) {
                    AppBridge.responseHandlers[ handlerIdentifier ].onError( responsePayload.resultData );
                }
            } catch ( err ) {
                console.log( "Error in error handler: " + handlerIdentifier + " = " + ( err && err.message ? err.message : String(err) ) );
            }

            // Remove the handler if it's not intended to remain active
            if ( !responsePayload.persistHandler ) {
                delete AppBridge.responseHandlers[ handlerIdentifier ];
            }
        }
    };


    /**
     * Performs a recursive deep copy of an object.
     *
     * @param {Object} sourceObject The object to copy.
     * @return {Object} A deep copy of the source object.
     */
    AppBridge.deepCopy = function ( sourceObject ) {
        if ( !sourceObject ) {
            return sourceObject;
        }

        if ( sourceObject instanceof Array ) {
            var copiedArray = [ ];
            for ( var idx = 0; idx < sourceObject.length; ++idx ) {
                copiedArray.push( AppBridge.deepCopy( sourceObject[ idx ] ) );
            }
            return copiedArray;
        }

        if ( sourceObject instanceof Function ) {
            return sourceObject;
        }

        if ( !( sourceObject instanceof Object ) ) {
            return sourceObject;
        }

        if ( sourceObject instanceof Date ) {
            return new Date( sourceObject.getTime( ) ); // Create a new Date object
        }

        var copiedObject = { };
        for ( var propName in sourceObject ) {
            if ( Object.prototype.hasOwnProperty.call( sourceObject, propName ) && ( !( propName in copiedObject ) || copiedObject[ propName ] !== sourceObject[ propName ] ) ) {
                copiedObject[ propName ] = AppBridge.deepCopy( sourceObject[ propName ] );
            }
        }
        return copiedObject;
    };

    // Store original document.addEventListener for later use.
    AppBridge.originalDocumentAddListener = document.addEventListener;

    // Store original window.addEventListener for later use.
    AppBridge.originalWindowAddListener = window.addEventListener;

    /**
     * Registers a custom handler for a global window event.
     *
     * @param {String} eventName        The name of the window event.
     * @param {Function} eventCallback  The function to be called for the event.
     */
    AppBridge.registerGlobalEventHandler = function ( eventName, eventCallback ) {
        AppBridge.globalEventHandlers[ eventName ] = eventCallback;
    };

    /**
     * Registers a custom handler for a document-level event.
     *
     * @param {String} eventName        The name of the document event.
     * @param {Function} eventCallback  The function to be called for the event.
     */
    AppBridge.registerDomEventHandler = function ( eventName, eventCallback ) {
        AppBridge.domEventHandlers[ eventName ] = eventCallback;
    };

    /**
     * Intercepts calls to document.addEventListener to manage custom event handlers.
     *
     * @param {Event} eventType          The event to listen for.
     * @param {Function} eventHandler    The callback function.
     * @param {boolean} useCapture       Whether to use capture phase.
     */
    document.addEventListener = function ( eventType, eventHandler, useCapture ) {
        var normalizedEvent = eventType.toLowerCase( );

        // Check if a plugin-specific handler exists for this event.
        if ( typeof AppBridge.domEventHandlers[ normalizedEvent ] !== "undefined" ) {
            if ( AppBridge.domEventHandlers[ normalizedEvent ]( normalizedEvent, eventHandler, true ) ) {
                return; // Custom handler took over, prevent default behavior.
            }
        }

        AppBridge.originalDocumentAddListener.call( document, eventType, eventHandler, useCapture );
    };

    /**
     * Intercepts calls to window.addEventListener to manage custom event handlers.
     *
     * @param {Event} eventType          The event to listen for.
     * @param {Function} eventHandler    The callback function.
     * @param {boolean} useCapture       Whether to use capture phase.
     */
    window.addEventListener = function ( eventType, eventHandler, useCapture ) {
        var normalizedEvent = eventType.toLowerCase( );

        // Check if a plugin-specific handler exists for this event.
        if ( typeof AppBridge.globalEventHandlers[ normalizedEvent ] !== "undefined" ) {
            if ( AppBridge.globalEventHandlers[ normalizedEvent ]( normalizedEvent, eventHandler, true ) ) {
                return; // Custom handler took over, prevent default behavior.
            }
        }

        AppBridge.originalWindowAddListener.call( window, eventType, eventHandler, useCapture );
    };

    // Store original document.removeEventListener for later use.
    AppBridge.originalDocumentRemoveListener = document.removeEventListener;

    // Store original window.removeEventListener for later use.
    AppBridge.originalWindowRemoveListener = window.removeEventListener;

    /**
     * Intercepts calls to document.removeEventListener to manage custom event handlers.
     *
     * @param {Event} eventType          The event to stop listening for.
     * @param {Function} eventHandler    The callback function to remove.
     * @param {boolean} useCapture       Whether capture phase was used during registration.
     */
    document.removeEventListener = function ( eventType, eventHandler, useCapture ) {
        var normalizedEvent = eventType.toLowerCase( );

        // Check if a plugin-specific handler exists for this event.
        if ( typeof AppBridge.domEventHandlers[ normalizedEvent ] !== "undefined" ) {
            if ( AppBridge.domEventHandlers[ normalizedEvent ]( normalizedEvent, eventHandler, false ) ) {
                return; // Custom handler took over, prevent default behavior.
            }
        }

        AppBridge.originalDocumentRemoveListener.call( document, eventType, eventHandler, useCapture );
    };

    /**
     * Intercepts calls to window.removeEventListener to manage custom event handlers.
     *
     * @param {Event} eventType          The event to stop listening for.
     * @param {Function} eventHandler    The callback function to remove.
     * @param {boolean} useCapture       Whether capture phase was used during registration.
     */
    window.removeEventListener = function ( eventType, eventHandler, useCapture ) {
        var normalizedEvent = eventType.toLowerCase( );

        // Check if a plugin-specific handler exists for this event.
        if ( typeof AppBridge.globalEventHandlers[ normalizedEvent ] !== "undefined" ) {
            if ( AppBridge.globalEventHandlers[ normalizedEvent ]( normalizedEvent, eventHandler, false ) ) {
                return; // Custom handler took over, prevent default behavior.
            }
        }

        AppBridge.originalWindowRemoveListener.call( window, eventType, eventHandler, useCapture );
    };

    /**
     * Utility method to programmatically dispatch a document event.
     *
     * @param {String} eventName        The type of event to trigger.
     * @param {Object} eventData        Optional data object to attach to the event.
     */
    AppBridge.triggerDomEvent = function ( eventName, eventData ) {
        var newEvent = document.createEvent( 'Events' );
        newEvent.initEvent( eventName );
        if ( eventData ) {
            for ( var prop in eventData ) {
                if ( Object.prototype.hasOwnProperty.call( eventData, prop ) ) {
                    newEvent[ prop ] = eventData[ prop ];
                }
            }
        }
        document.dispatchEvent( newEvent );
    };

}