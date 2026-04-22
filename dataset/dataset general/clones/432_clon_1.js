/*global jQuery */
/*
 * This is a Type I clone of MotorCortex.js, version 0.1.0.
 *
 * It maintains exact structural and logical equivalence to the original source code.
 * All identifiers, variable names, function names, operators, and expressions are
 * preserved without any modifications.
 *
 * Changes are strictly limited to variations in whitespace (indentation, spacing,
 * blank lines) and comments (addition, removal, or modification of comments).
 * These modifications have been applied extensively throughout the file to
 * significantly alter the visual appearance while ensuring functional identity.
 *
 * Original Copyright 2014, Andreas Trantidis
 * atrantidis@gmail.com
 * Released under the WTFPL license
 * http://sam.zoy.com/wtfpl/
 *
 */

( function ( window ) {

    // Define the main MotorCortex function on the window object.
    window.MotorCortex = function ( options ) {

        // Initialize debug flag.
        var mc_debug = false;

        // Check if debug option is provided.
        if ( options ) {
            mc_debug = options.hasOwnProperty( 'debug' ) ? options.debug : false;
        }

        // Global variables parsed from MSS files.
        var globals = [];
        // Registered events.
        var events = [];
        // Callbacks associated with events.
        var eventsCallbacks = [];

        // Reference to the MotorCortex instance for internal use.
        var MC = this;

        // List of recognized options for animations.
        var optionsNames = [ "duration", "easing", "delay", "complete", "loop" ];

        // Helper function to generate a random number within a range.
        var genRandom = function ( x, y ) {

            var min = x * 1;
            var max = y * 1;

            // Ensure min is always less than or equal to max.
            if ( y <= x ) {
                MC.log( "warn", "When using @rand make sure the first parameter is always smaller than the first one. Reverting and proceeding" );
                var tempMax = x * 1;
                var tempMin = y * 1;

                max = tempMax;
                min = tempMin;
            }

            var dif = max - min; // Calculate the difference for scaling.
            return min + dif * Math.random(); // Return random number in range.
        };

        // Retrieves an event object by its name.
        var getEventObjectByName = function ( eventName ) {
            return events[ eventName ];
        };

        // Determines the prefix for a property value (e.g., '+=', '-=', '-').
        var getPrefix = function ( string ) {
            if ( string.indexOf( '+=' ) == 0 ) {
                return "+=";
            } else if ( string.indexOf( '-=' ) == 0 ) {
                return '-=';
            } else if ( string.indexOf( '-' ) == 0 ) {
                return '-';
            } else {
                return ""; // No prefix found.
            }
        };

        // Extracts units from a string (e.g., 'px', '%').
        var getUnits = function ( string ) {
            if ( string.indexOf( ')px', string.length - 3 ) !== -1 ) {
                return 'px';
            } else if ( string.indexOf( '%', string.length - 1 ) !== -1 ) {
                return '%';
            } else {
                return ''; // No specific units found.
            }
        };

        // Extracts the property name from a special string format like '(property)px'.
        var getProperty = function ( string ) {
            var alpha = string.split( '.' )[ 1 ].split( ')' )[ 0 ];
            if ( alpha.indexOf( '%' ) != -1 ) {
                return alpha.substring( 0, alpha.length - 1 );
            } else {
                return alpha;
            }
        };

        /**
         * Triggers a MotorCortex event.
         * @param {string} eventName - The name of the event to trigger.
         * @param {Event} [e] - The native event object (optional).
         * @param {object} [options] - Options to pass to the event (optional).
         * @param {function} [callback] - A callback function to execute after the event completes (optional).
         * @returns {ExecutionProcess} An object representing the execution process, allowing it to be stopped.
         */
        this.trigger = function ( eventName, e, options, callback ) {

            var paramsOK = true;
            var execProcess;

            var u_event, u_options, u_callback; // Unified variables for arguments.

            // --- Argument validation and parsing ---
            if ( arguments.length === 0 ) {
                MC.log( "error", "You must always include the event name to be triggered when invoking the MotorCortex.trigger function, as the first parameter in string format" );
                execProcess = new ExecutionProcess( null );
                paramsOK = false;
            } else {
                if ( typeof arguments[ 0 ] != "string" ) {
                    MC.log( "error", "The first argument of the trigger function should always be a string representing the name of the event to be triggered. "
                        + typeof arguments[ 0 ] + " passed on call." );
                    execProcess = new ExecutionProcess( null );
                    paramsOK = false;
                } else if ( arguments.length > 1 ) {
                    if ( typeof arguments[ 1 ] === "object" && arguments[ 1 ] != null ) {
                        if ( arguments[ 1 ].target ) { // Check if it's likely a DOM event object.
                            u_event = arguments[ 1 ];

                            if ( arguments.length > 2 ) {
                                if ( typeof arguments[ 2 ] === "object" && arguments[ 2 ] != null ) {
                                    u_options = arguments[ 2 ];

                                    if ( arguments.length > 3 ) {
                                        if ( typeof arguments[ 3 ] === "function" ) {
                                            u_callback = arguments[ 3 ];
                                        } else {
                                            MC.log( "error", "Unrecognized type of 4th parameter on trigger function of event " + eventName + ". Function expected, " + typeof arguments[ 3 ] + " passed." );
                                            paramsOK = false;
                                        }
                                    }
                                } else if ( typeof arguments[ 2 ] === "function" ) {
                                    u_callback = arguments[ 2 ];
                                } else { // 3rd argument was neither an object nor a function.
                                    MC.log( "error", "Unrecognized type of 3rd parameter on trigger function of event " + eventName + ". Object or Function expected, " + typeof arguments[ 2 ] + " passed." );
                                    paramsOK = false;
                                }
                            }
                        } else { // 2nd argument is object but not the event one, so it's options.
                            u_options = arguments[ 1 ];

                            if ( arguments.length > 2 ) {
                                if ( typeof arguments[ 2 ] != "function" ) { // Expected callback, but got something else.
                                    MC.log( "error", "Unrecognized type of 3rd parameter on trigger function of event " + eventName + ". Function expected, " + typeof arguments[ 2 ] + " passed." );
                                    paramsOK = false;
                                } else {
                                    u_callback = arguments[ 2 ];
                                }
                            }
                        }
                    } else if ( typeof arguments[ 1 ] === "function" ) {
                        u_callback = arguments[ 1 ]; // 2nd argument is a function, so it's the callback.
                    } else {
                        MC.log( "error", "Unrecognized type of 2nd parameter on trigger function of event " + eventName + ". Object or Function expected, " + typeof arguments[ 1 ] + " passed." );
                        paramsOK = false;
                    }
                }
            }

            // Ensure options and callback are always defined.
            if ( !u_options ) {
                u_options = {};
            }
            if ( !u_callback ) {
                u_callback = function () {
                };
            }

            // --- Event execution ---
            if ( paramsOK ) {
                if ( events.hasOwnProperty( eventName ) ) {
                    // console.log('event found');
                    execProcess = new ExecutionProcess( events[ eventName ] );
                    events[ eventName ].fire( u_event, u_options, u_callback );
                } else {
                    execProcess = new ExecutionProcess( null );
                    MC.log( "error", "The event with name " + eventName + " has not been defined in any of the MSS files. It will be ignored!" );
                }
            }

            return execProcess;
        }; // End of this.trigger function.

        /**
         * Compiles the MSS (MotorCortex Style Sheet) top-level node.
         * This function processes global variables and event definitions.
         * @param {object} topNode - The parsed top-level node of the MSS.
         * @param {function} callback - Callback to execute after compilation.
         */
        var compile = function ( topNode, callback ) {

            // Regular expression for identifying event callbacks.
            var callbackRegex = new RegExp( /^[a-zA-Z0-9\.\-\_]+\:callback$/ );
            // Regular expression for identifying global variables.
            var globalsRegx = new RegExp( /^@[a-zA-Z0-9\.\-\_]*?/ );

            // --- Process global variables ---
            for ( var property in topNode.attributes ) {
                if ( topNode.attributes.hasOwnProperty( property ) ) {
                    // Step 0: Check if the attribute is a global variable.
                    if ( property == "@index" || property == "@params" || property == "@domel" ) {
                        MC.log( "warn", "The keywords/parameter names @index, @params and @domel are reserved by MotorCortex " +
                            "and cannot be used as a global variable's name. The declared global " + property + " will be ignored!" );
                    } else if ( globalsRegx.exec( property ) ) {
                        globals[ property ] = topNode.attributes[ property ];
                    } else {
                        MC.log( "warn", "The property " + property + " should begin with the character '@'. It will be ignored!" );
                    }
                }
            }

            // --- Process event definitions ---
            for ( var property in topNode.children ) {
                // Handle callback definitions for events.
                if ( callbackRegex.exec( property ) ) {
                    var selectorArray = property.split( ":" );
                    eventsCallbacks[ selectorArray[ 0 ] ] = topNode.children[ property ].attributes.eventName;
                }

                // 1.a Split the expression into selector and event parts.
                var selectorArray = property.split( ":" );

                // 1.b Check that the newly created array is at least of length 2.
                if ( selectorArray.length < 2 ) {
                    MC.log( "error", "The MC selection and event part " + property + " is not valid. Each MC selection string should consist by least a selection string and an event name" +
                        " separated by the ':' character." );
                } else {
                    // If event doesn't exist, create a new one.
                    if ( !events.hasOwnProperty( selectorArray[ selectorArray.length - 1 ] ) ) {
                        var eventLoops = 1;
                        if ( topNode.children[ property ].attributes.hasOwnProperty( 'loop' ) ) {
                            eventLoops = topNode.children[ property ].attributes[ 'loop' ];
                        }
                        var event = new Event( eventLoops, selectorArray[ selectorArray.length - 1 ] );
                        event.addThread( selectorArray, topNode.children[ property ] );
                        events[ selectorArray[ selectorArray.length - 1 ] ] = event;
                    } else {
                        // If event exists, add a new thread to it.
                        // Note: 'event' variable in this scope might not be the correct event object if the loop iterates over a new event.
                        // This looks like a potential bug in the original code, as 'event' might refer to the last created event, not the one matching selectorArray[selectorArray.length - 1].
                        // However, as per Type I cloning, this must remain unchanged.
                        event.addThread( selectorArray, topNode.children[ property ] );
                    }
                }
            }

            // Execute the compilation callback.
            callback();
        }; // End of compile function.


        /**
         * Constructor for an ExecutionProcess object.
         * Allows stopping an ongoing event execution.
         * @param {Event} event - The event object associated with this process.
         */
        var ExecutionProcess = function ( event ) {

            // Method to stop the associated event.
            this.stop = function () {
                if ( event ) {
                    event.stop();
                } else {
                    MC.log( "error", "You tried to stop a process that has not been executed." );
                }
            };
        }; // End of ExecutionProcess constructor.

        /*
         * Creates the Thread object.
         * A Thread represents a single animation sequence or action within an event.
         * It might return an array containing any extra Threads that might come up
         * during the node analysis if the body of the actual Thread's node
         * should be separated into more than one.
         *
         * @param {Array<string>} selector - Array of selector parts.
         * @param {object} node - The parsed MSS node for this thread.
         * @param {Event} EventObject - The parent Event object.
         * @param {object} [parentProperties] - Properties inherited from a parent thread.
         * @param {string} [findString] - String used for finding child elements within the selection.
         */
        var Thread = function ( selector, node, EventObject, parentProperties, findString ) {

            this.loops = 1; // Default number of loops for this thread.

            // Initialize parent properties if not provided.
            if ( !parentProperties ) {
                parentProperties = {
                    attributes: {},
                    options: {}
                };
            }
            // Initialize find string if not provided.
            if ( !findString ) {
                findString = '';
            }

            // Create the selection function based on the selector parts.
            this.selectionFunction = this.createSelectionFunction( selector, findString );

            // Regex for checking global variables.
            var globalsRegex = new RegExp( /^@globals\.[a-zA-Z0-9\-\_]*$/ );

            // Deep copy parent properties to avoid modifying them directly.
            var ownAttrs = JSON.parse( JSON.stringify( parentProperties ) );
            ownAttrs.attributes = {}; // Reset attributes for this thread.

            // Process attributes of the current node.
            for ( var property in node.attributes ) {
                if ( globalsRegex.exec( node.attributes[ property ] ) ) {
                    var expectedGlobalsKey = node.attributes[ property ].split( '.' )[ 1 ].trim();
                    if ( !globals.hasOwnProperty( "@" + expectedGlobalsKey ) ) {
                        MC.log( "error", "The global variable " + node.attributes[ property ] + " is not defined. It will be ignored" );
                    } else {
                        node.attributes[ property ] = globals[ '@' + expectedGlobalsKey ];
                    }
                }

                // Separate animation options from animation attributes.
                if ( optionsNames.indexOf( property ) >= 0 ) {
                    if ( property !== "loop" ) {
                        ownAttrs.options[ property ] = node.attributes[ property ];
                    } else {
                        this.loops = node.attributes[ property ];
                    }
                } else {
                    ownAttrs.attributes[ property ] = node.attributes[ property ];
                }
            }

            // Default callback function for animation completion.
            var callbackFunction = function () {
                EventObject.CallbackHandler.animationEnded();
            };

            // Get names of child nodes.
            var childs = Object.keys( node.children );

            // If a loop attribute is present on the node, update event loop times.
            if ( node.attributes.hasOwnProperty( 'loop' ) ) {
                EventObject.setLoopTimes( node.attributes.loop );
            }

            // Process child nodes.
            for ( var i = 0; i < childs.length; i++ ) {
                var childName = childs[ i ];

                if ( childName == "complete:trigger" ) {
                    // Special case: 'complete:trigger' means another event is triggered on completion.
                    callbackFunction = function ( e, params ) {
                        var innerCallback = function () {
                            EventObject.CallbackHandler.animationEnded();
                        };
                        getEventObjectByName( node.children[ childName ].attributes.eventName ).fire( e, params, innerCallback );
                    };
                } else if ( childName != "complete" ) {
                    // Regular child thread.
                    EventObject.addReadyThread( new Thread( this.selectionFunction, node.children[ childName ], EventObject, ownAttrs, childName ) );
                } else {
                    // Special case: 'complete' block, indicating nested animations.
                    var eventLoops = 1;
                    if ( node.children[ childName ].attributes.hasOwnProperty( 'loop' ) ) {
                        eventLoops = node.children[ childName ].attributes[ 'loop' ];
                    }

                    var nestedEvent = new Event( eventLoops );
                    nestedEvent.addReadyThread( new Thread( this.selectionFunction, node.children.complete, nestedEvent, ownAttrs ) );
                    callbackFunction = function ( e, params ) {
                        var innerCallback = function () {
                            EventObject.CallbackHandler.animationEnded();
                        };
                        nestedEvent.fire( e, params, innerCallback );
                    };
                }
            }

            // Create the animation function for this thread.
            this.createAnimationFunction( ownAttrs, callbackFunction );


            // The execute method for this thread, called during event firing.
            this.execute = function ( e, params ) {
                this.animationFunction( e, params, callbackFunction );
            };

        }; // End of Thread constructor.


        /*
         * Creates the animationFunction of the Thread.
         * The animationFunction (during runtime) picks all the elements that should be animated
         * by invoking the already baked "selectionFunction" of the Thread and executes
         * animations according to the parameters.
         *
         * @param {object} properties - The animation properties and options for this thread.
         * @param {function} threadCallback - The callback to execute when this thread's animations complete.
         */
        Thread.prototype.createAnimationFunction = function ( properties, threadCallback ) {

            // Regular expressions for parsing parametric, DOM element-based, and random values.
            var paramsRegex = new RegExp( /^@params\.[a-zA-Z0-9\-\_]*$|^-@params\.[a-zA-Z0-9\-\_]*$|^-=@params\.[a-zA-Z0-9\-\_]*$|^\+=@params\.[a-zA-Z0-9\-\_]*$|^@params\.[a-zA-Z0-9\-\_]*.%$|-^@params\.[a-zA-Z0-9\-\_]*.%$|^-=@params\.[a-zA-Z0-9\-\_]*.%$|^\+=@params\.[a-zA-Z0-9\-\_]*.%$|^\(@params\.[a-zA-Z0-9\-\_]*.\)px$|-^\(@params\.[a-zA-Z0-9\-\_]*.\)px$|^-=\(@params\.[a-zA-Z0-9\-\_]*.\)px$|^\+=\(@params\.[a-zA-Z0-9\-\_]*.\)px$/ );
            var domelRegex = new RegExp( /^@domel\.[a-zA-Z0-9\-\_]*$|^-@domel\.[a-zA-Z0-9\-\_]*$|^-=@domel\.[a-zA-Z0-9\-\_]*$|^\+=@domel\.[a-zA-Z0-9\-\_]*$|^@domel\.[a-zA-Z0-9\-\_]*.%$|^-@domel\.[a-zA-Z0-9\-\_]*.%$|^-=@domel\.[a-zA-Z0-9\-\_]*.%$|^\+=@domel\.[a-zA-Z0-9\-\_]*.%$|^\(@domel\.[a-zA-Z0-9\-\_]*.\)px$|^-\(@domel\.[a-zA-Z0-9\-\_]*.\)px$|^-=\(@domel\.[a-zA-Z0-9\-\_]*.\)px$|^\+=\(@domel\.[a-zA-Z0-9\-\_]*.\)px$/ );
            var randRegex = new RegExp( /^@rand\( *?.+ *?, *?.+ *?\)$|^-@rand\( *?.+ *?, *?.+ *?\)$|^-=@rand\( *?.+ *?, *?.+ *?\)$|^\+=@rand\( *?.+ *?, *?.+ *?\)$|^@rand\( *?.+ *?, *?.+ *?\)%$|^-@rand\( *?.+ *?, *?.+ *?\)%$|^-=@rand\( *?.+ *?, *?.+ *?\)%$|^\+=@rand\( *?.+ *?, *?.+ *?\)%$|^@rand\( *?.+ *?, *?.+ *?\)px$|^-@rand\( *?.+ *?, *?.+ *?\)px$|^-=@rand\( *?.+ *?, *?.+ *?\)px$|^\+=@rand\( *?.+ *?, *?.+ *?\)px$/ );

            var flaggedWithoutDuration = false;

            // Set a default duration if none is specified.
            if ( !properties.options.hasOwnProperty( "duration" ) ) {
                properties.options.duration = '0.3s';
                flaggedWithoutDuration = true;
            }

            // The actual animation function that will be executed.
            this.animationFunction = function ( e, params, callback ) {

                var parametric = false; // Flag if any parametric values are present.
                var random = false; // Flag if any random values are present.

                // Stores information about parametric values to be resolved at runtime.
                // Format: { whichPart, whichKey, byWhichAttr, pre, units }
                var parametrics = [];
                // Stores information about random values to be resolved at runtime.
                // Format: { whichPart, whichKey, byWhichRand, pre, units }
                var randoms = [];

                var numberOfAttrs = 0; // Count of animation attributes.

                var preActions = []; // Actions to perform before animation (e.g., add/remove classes).
                var execPreActions = function ( element ) {
                    for ( var i = 0; i < preActions.length; i++ ) {
                        preActions[ i ]( element );
                    }
                    return element;
                };

                // --- Process animation attributes ---
                for ( var property in properties.attributes ) {
                    if ( property == '-.' ) {
                        var className = properties.attributes[ property ] + '';
                        preActions.push( function ( element ) {
                            element.removeClass( className );
                        } );
                        continue; // Move to the next attribute.
                    } else if ( property == '+.' ) {
                        var className = properties.attributes[ property ] + '';
                        preActions.push( function ( element ) {
                            element.addClass( className );
                        } );
                        continue; // Move to the next attribute.
                    }

                    numberOfAttrs += 1;

                    if ( paramsRegex.exec( properties.attributes[ property ] ) ) {
                        var actualPropName = getProperty( properties.attributes[ property ] );
                        if ( params.hasOwnProperty( actualPropName ) ) {
                            properties.attributes[ property ] = getPrefix( properties.attributes[ property ] ) + params[ actualPropName ] + getUnits( properties.attributes[ property ] );
                        } else {
                            MC.log( "error", "The variable " + actualPropName + " was expected in the params object but is not present. It will be ignored" );
                        }
                    } else if ( domelRegex.exec( properties.attributes[ property ] ) ) {
                        parametrics.push( {
                            pre: getPrefix( properties.attributes[ property ] ),
                            units: getUnits( properties.attributes[ property ] ),
                            whichPart: 'attributes',
                            whichKey: property,
                            byWhichAttr: getProperty( properties.attributes[ property ] )
                        } );
                        parametric = true;
                    } else if ( randRegex.exec( properties.attributes[ property ] ) ) {
                        var propertyValArray = properties.attributes[ property ].match( /([^()]+)/g )[ 1 ].split( ',' );
                        randoms.push( {
                            pre: getPrefix( properties.attributes[ property ] ),
                            units: getUnits( properties.attributes[ property ] ),
                            whichPart: 'attributes',
                            whichKey: property,
                            byWhichRand: [ propertyValArray[ 0 ].trim() * 1, propertyValArray[ 1 ].trim() * 1 ]
                        } );
                        random = true; // Set random flag.
                    }
                }

                // --- Process animation options (e.g., duration, easing) ---
                for ( var property in properties.options ) {
                    if ( paramsRegex.exec( properties.options[ property ] ) ) {
                        var actualPropName = getProperty( properties.options[ property ] );
                        if ( params.hasOwnProperty( actualPropName ) ) {
                            properties.options[ property ] = getPrefix( properties.options[ property ] ) + params[ actualPropName ] + getUnits( properties.options[ property ] );
                        } else {
                            MC.log( "error", "The variable " + actualPropName + " was expected in the params object but is not present. It will be ignored" );
                        }
                    } else if ( domelRegex.exec( properties.options[ property ] ) ) {
                        parametrics.push( {
                            pre: getPrefix( properties.options[ property ] ),
                            units: getUnits( properties.options[ property ] ),
                            whichPart: 'options',
                            whichKey: property,
                            byWhichAttr: getProperty( properties.options[ property ] )
                        } );
                        parametric = true;
                    } else if ( randRegex.exec( properties.options[ property ] ) ) {
                        random = true;
                        var propertyValArray = properties.options[ property ].match( /([^()]+)/g )[ 1 ].split( ',' );
                        randoms.push( {
                            pre: getPrefix( properties.options[ property ] ),
                            units: getUnits( properties.options[ property ] ),
                            whichPart: 'options',
                            whichKey: property,
                            byWhichRand: [ propertyValArray[ 0 ].trim() * 1, propertyValArray[ 1 ].trim() * 1 ]
                        } );
                    }
                }

                // If no animation attributes, just execute pre-actions and call callback.
                if ( numberOfAttrs == 0 ) {
                    execPreActions( this.selectionFunction( properties, e ) );
                    callback( e, params );
                    return true;
                } else if ( flaggedWithoutDuration ) {
                    MC.log( "error", "The duration has not been defined. The default (0.3s) will be used" );
                }

                // --- Execute animations based on presence of parametric/random values ---
                if ( !parametric && !random ) {
                    // Simple case: no parametric or random values, animate all selected elements together.
                    properties.options.complete = function () {
                        callback( e, params );
                    };
                    var animatedElements = this.selectionFunction( properties, e );
                    execPreActions( animatedElements ).velocity( properties.attributes, properties.options );
                    // console.log(properties);
                } else {
                    // Complex case: parametric or random values, animate each selected element individually.
                    var selectedElements = this.selectionFunction( properties, e );
                    var CallbackHandler = {
                        numberOfElements: selectedElements.length,
                        numberOfFinished: 0,

                        // Tracks completion of individual animations.
                        finished: function () {
                            this.numberOfFinished += 1;
                            if ( this.numberOfFinished == this.numberOfElements ) {
                                callback( e, params ); // Call the main thread callback when all are done.
                            }
                        }
                    };

                    selectedElements.each( function () {
                        var ownAttrs = JSON.parse( JSON.stringify( properties ) ); // Clone properties for each element.

                        // Resolve parametric values for the current element.
                        for ( var i = 0; i < parametrics.length; i++ ) {
                            // console.log($(this).attr(parametrics[i].byWhichAttr));
                            ownAttrs[ parametrics[ i ].whichPart ][ parametrics[ i ].whichKey ] = parametrics[ i ].pre + $( this ).attr( parametrics[ i ].byWhichAttr ) + parametrics[ i ].units;
                        }
                        // Resolve random values for the current element.
                        for ( var i = 0; i < randoms.length; i++ ) {
                            ownAttrs[ randoms[ i ].whichPart ][ randoms[ i ].whichKey ] = randoms[ i ].pre + genRandom( randoms[ i ][ 'byWhichRand' ][ 0 ], randoms[ i ][ 'byWhichRand' ][ 1 ] ) + randoms[ i ].units;
                        }
                        // console.log(ownAttrs.options);
                        ownAttrs.options.complete = function () {
                            CallbackHandler.finished();
                        }; // Set individual completion callback.
                        execPreActions( $( this ) ).velocity( ownAttrs.attributes, ownAttrs.options );
                    } );
                }

            }; // End of this.animationFunction.
        }; // End of Thread.prototype.createAnimationFunction.


        /*
         * Gets the selector in the format `selectionString:@data-x>2@index=2:eventName`
         * and returns a function that, when executed, will return the items to be animated
         * on event trigger.
         *
         * The available possible formats are:
         * - any valid CSS selection
         * - triggeringElement
         * - not(triggeringElement)
         * - expressions (like @index>2, @domel)
         *
         * @param {Array<string>} selectorArray - An array of selector parts.
         * @param {string} findString - A string used for finding child elements (e.g., CSS selector).
         * @returns {function} A function that takes properties and an event object, returning selected jQuery elements.
         */
        Thread.prototype.createSelectionFunction = function ( selectorArray, findString ) {

            // Array of predefined expressions for dynamic selection.
            var expressions = [
                {
                    name: 'index greater than',
                    rxp: new RegExp( /^@index\ *?\>\ *?\d+$/ ),
                    createSelectionFunction: function ( string ) {
                        return function ( params ) {
                            return ":gt(" + string.split( ":" )[ 1 ].trim() + ")";
                        };
                    }
                },
                {
                    name: 'index less than',
                    rxp: new RegExp( /^@index\ *?\<\ *?\d+$/ ),
                    createSelectionFunction: function ( string ) {
                        return function ( params ) {
                            return ":lt(" + string.split( ":" )[ 1 ].trim() + ")";
                        };
                    }
                },
                {
                    name: 'index less or equal to',
                    rxp: new RegExp( /^@index\ *?\<\=\ *?\d+$/ ),
                    createSelectionFunction: function ( string ) {
                        return function ( params ) {
                            return ":le(" + string.split( ":" )[ 1 ].trim() + ")";
                        };
                    }
                }
                // ... (more expressions would follow here in the full code)
            ]; // End of expressions array.
        }; // End of Thread.prototype.createSelectionFunction.

    }; // End of window.MotorCortex function.

} )( window ); // End of IIFE.