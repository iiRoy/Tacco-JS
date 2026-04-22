(function( JQ, undefVal ) {

// A simple counter for unique element identifiers.
var uniqueIdCounter = 0,
    arrayPortion = Array.prototype.slice,
    originalDataCleanup = JQ.cleanData; // Store the initial data cleaning method.

// Override jQuery's cleanData to trigger custom "remove" events before actual cleanup.
JQ.cleanData = function( elementsToProcess ) {
    for ( var idx = 0, currentElement; (currentElement = elementsToProcess[idx]) != null; idx++ ) {
        try {
            // Attempt to fire a custom 'remove' event on each element.
            JQ( currentElement ).triggerHandler( "remove" );
        } catch( errorObject ) {
            // Suppress errors during removal, as per historical jQuery UI behavior.
        }
    }
    // Call the original data cleaning function after custom removal events.
    originalDataCleanup( elementsToProcess );
};

// Main function to define a new UI component.
JQ.component = function( componentName, baseComponent, componentPrototype ) {
    var fullComponentName, priorConstructor, componentConstructor, baseComponentProto,
        // The adaptedPrototype holds the component's methods and properties.
        // It remains unmodified from the original prototype argument, allowing mixins.
        adaptedPrototype = {},
        componentNamespace = componentName.split( "." )[ 0 ]; // Extract the top-level namespace.

    componentName = componentName.split( "." )[ 1 ]; // Get the component's specific name.
    fullComponentName = componentNamespace + "-" + componentName; // Construct the full identifier.

    // If no base component is provided, assume it's the root JQ.BaseComponent.
    if ( !componentPrototype ) {
        componentPrototype = baseComponent;
        baseComponent = JQ.BaseComponent;
    }

    // Register a selector for this component, allowing easy selection of instances.
    JQ.expr[ ":" ][ fullComponentName.toLowerCase() ] = function( targetElement ) {
        return !!JQ.data( targetElement, fullComponentName ); // Check if element has data for this component.
    };

    // Ensure the namespace object exists.
    JQ[ componentNamespace ] = JQ[ componentNamespace ] || {};
    priorConstructor = JQ[ componentNamespace ][ componentName ]; // Save any existing constructor.
    // Define the component's main constructor function.
    componentConstructor = JQ[ componentNamespace ][ componentName ] = function( configSettings, targetElement ) {
        // Allow instantiation without the 'new' keyword.
        if ( !this._initializeComponent ) {
            return new componentConstructor( configSettings, targetElement );
        }

        // Support simple inheritance without immediate initialization.
        // The 'new' keyword must be used in such cases.
        if ( arguments.length ) {
            this._initializeComponent( configSettings, targetElement );
        }
    };
    // Extend the new constructor with properties from any prior constructor and additional metadata.
    JQ.extend( componentConstructor, priorConstructor, {
        releaseVersion: componentPrototype.version, // Component's version number.
        // Store a copy of the original prototype object.
        _initialPrototype: JQ.extend( {}, componentPrototype ),
        // Keep track of components that inherit from this one.
        _derivedConstructors: []
    });

    // Create an instance of the base component to inherit its prototype chain.
    baseComponentProto = new baseComponent();
    // Ensure the options hash is a distinct property on the new instance, not a shared prototype reference.
    baseComponentProto.configSettings = JQ.component.extend( {}, baseComponentProto.configSettings );
    // Iterate through the provided prototype properties.
    JQ.each( componentPrototype, function( propertyKey, propertyValue ) {
        // Copy non-function properties directly.
        if ( !JQ.isFunction( propertyValue ) ) {
            adaptedPrototype[ propertyKey ] = propertyValue;
            return;
        }
        // Wrap function properties to enable 'super' method calls.
        adaptedPrototype[ propertyKey ] = (function() {
            var _baseMethod = function() {
                    return baseComponent.prototype[ propertyKey ].apply( this, arguments );
                },
                _baseMethodApply = function( args ) {
                    return baseComponent.prototype[ propertyKey ].apply( this, args );
                };
            return function() {
                var __priorBaseMethod = this._super,
                    __priorBaseMethodApply = this._superApply,
                    operationResult;

                this._super = _baseMethod; // Set _super to call the base method.
                this._superApply = _baseMethodApply; // Set _superApply for array arguments.

                operationResult = propertyValue.apply( this, arguments ); // Execute the current method.

                this._super = __priorBaseMethod; // Restore original _super.
                this._superApply = __priorBaseMethodApply; // Restore original _superApply.

                return operationResult;
            };
        })();
    });
    // Set up the component's prototype chain.
    componentConstructor.prototype = JQ.component.extend( baseComponentProto, {
        // Determine the event prefix.
        componentEventPrefix: priorConstructor ? baseComponentProto.componentEventPrefix : componentName
    }, adaptedPrototype, {
        constructor: componentConstructor, // Reference to the constructor.
        componentNamespace: componentNamespace, // Component's namespace.
        componentTypeName: componentName, // Component's short name.
        componentFullName: fullComponentName // Component's full name.
    });

    // Handle redefinition of an existing component.
    if ( priorConstructor ) {
        JQ.each( priorConstructor._derivedConstructors, function( idx, derivedComponent ) {
            var derivedPrototype = derivedComponent.prototype;

            // Redefine the derived component to inherit from the new version of this component.
            JQ.component( derivedPrototype.componentNamespace + "." + derivedPrototype.componentTypeName, componentConstructor, derivedComponent._initialPrototype );
        });
        // Clear the old constructor's list of derived components.
        delete priorConstructor._derivedConstructors;
    } else {
        // Add this new component constructor to its base's derived list.
        baseComponent._derivedConstructors.push( componentConstructor );
    }

    // Bridge the component to jQuery's fn object.
    JQ.component.bridge( componentName, componentConstructor );
};

// Utility function to extend objects deeply, similar to jQuery.extend but for component options.
JQ.component.extend = function( target ) {
    var sourceArguments = arrayPortion.call( arguments, 1 ),
        sourceIndex = 0,
        sourceCount = sourceArguments.length,
        attributeName,
        propertyValue;
    for ( ; sourceIndex < sourceCount; sourceIndex++ ) {
        for ( attributeName in sourceArguments[ sourceIndex ] ) {
            propertyValue = sourceArguments[ sourceIndex ][ attributeName ];
            // Only process own properties that are not undefined.
            if ( sourceArguments[ sourceIndex ].hasOwnProperty( attributeName ) && propertyValue !== undefVal ) {
                // If it's a plain object, clone it recursively.
                if ( JQ.isPlainObject( propertyValue ) ) {
                    target[ attributeName ] = JQ.isPlainObject( target[ attributeName ] ) ?
                        JQ.component.extend( {}, target[ attributeName ], propertyValue ) :
                        JQ.component.extend( {}, propertyValue ); // Create new object if target property is not.
                } else {
                    // Otherwise, copy by reference.
                    target[ attributeName ] = propertyValue;
                }
            }
        }
    }
    return target;
};

// Creates a jQuery plugin method for the component.
JQ.component.bridge = function( componentName, componentObject ) {
    var fullComponentName = componentObject.prototype.componentFullName || componentName;
    JQ.fn[ componentName ] = function( configSettings ) {
        var isFunctionInvocation = typeof configSettings === "string",
            invocationArguments = arrayPortion.call( arguments, 1 ),
            methodResult = this; // Default return value is the jQuery object.

        // Allow multiple option hashes to be passed for initialization.
        configSettings = !isFunctionInvocation && invocationArguments.length ?
            JQ.component.extend.apply( null, [ configSettings ].concat(invocationArguments) ) :
            configSettings;

        if ( isFunctionInvocation ) {
            this.each(function() {
                var invokedMethodResult,
                    componentInstance = JQ.data( this, fullComponentName );
                if ( !componentInstance ) {
                    return JQ.error( "Cannot call methods on " + componentName + " prior to initialization; " +
                        "attempted to call method '" + configSettings + "'" );
                }
                // Check if the method exists and is not a private method (starts with '_').
                if ( !JQ.isFunction( componentInstance[configSettings] ) || configSettings.charAt( 0 ) === "_" ) {
                    return JQ.error( "No such method '" + configSettings + "' for " + componentName + " component instance" );
                }
                invokedMethodResult = componentInstance[ configSettings ].apply( componentInstance, invocationArguments );
                // If the method returns something other than the instance itself and is not undefined,
                // update the return value of the bridge function.
                if ( invokedMethodResult !== componentInstance && invokedMethodResult !== undefVal ) {
                    methodResult = invokedMethodResult && invokedMethodResult.jquery ?
                        methodResult.pushStack( invokedMethodResult.get() ) :
                        invokedMethodResult;
                    return false; // Stop iteration.
                }
            });
        } else {
            this.each(function() {
                var componentInstance = JQ.data( this, fullComponentName );
                if ( componentInstance ) {
                    // If instance exists, update options and re-initialize.
                    componentInstance.configure( configSettings || {} )._postSetup();
                } else {
                    // Create a new component instance and store it.
                    JQ.data( this, fullComponentName, new componentObject( configSettings, this ) );
                }
            });
        }

        return methodResult; // Return the result of the operations.
    };
};

// Base Component constructor.
JQ.BaseComponent = function( /* configSettings, targetElement */ ) {};
JQ.BaseComponent._derivedConstructors = []; // List of components inheriting from BaseComponent.

JQ.BaseComponent.prototype = {
    componentTypeName: "basecomponent", // Default name for the component.
    componentEventPrefix: "", // Default prefix for events.
    standardElement: "<div>", // Default element type if none specified.
    configSettings: {
        disabled: false, // Default disabled state.

        // Event callbacks.
        create: null
    },
    // Initializes the component instance.
    _initializeComponent: function( configSettings, targetElement ) {
        targetElement = JQ( targetElement || this.standardElement || this )[ 0 ];
        this.element = JQ( targetElement );
        this.uniqueId = uniqueIdCounter++; // Assign a unique ID.
        this.triggerNamespace = "." + this.componentTypeName + this.uniqueId; // Event namespace.
        this.configSettings = JQ.component.extend( {},
            this.configSettings,
            this._getSetupOptions(),
            configSettings ); // Merge configuration settings.

        this.eventBindings = JQ(); // Collection for event handlers.
        this.hoverElements = JQ(); // Collection for hoverable elements.
        this.focusElements = JQ(); // Collection for focusable elements.

        if ( targetElement !== this ) {
            JQ.data( targetElement, this.componentFullName, this ); // Store instance on the DOM element.
            // Attach a remove handler to destroy the component when its element is removed.
            this._attachEventHandler( true, this.element, {
                remove: function( triggerEvent ) {
                    if ( triggerEvent.target === targetElement ) {
                        this.dispose(); // Call the dispose method.
                    }
                }
            });
            // Determine the component's document and window.
            this.componentDocument = JQ( targetElement.style ?
                targetElement.ownerDocument :
                targetElement.document || targetElement );
            this.componentWindow = JQ( this.componentDocument[0].defaultView || this.componentDocument[0].parentWindow );
        }

        this._setupComponent(); // Call the component's custom setup method.
        this._emitEvent( "create", null, this._getSetupEventData() ); // Emit a 'create' event.
        this._postSetup(); // Call the component's custom post-setup method.
    },
    _getSetupOptions: JQ.noop, // Placeholder for getting create options.
    _getSetupEventData: JQ.noop, // Placeholder for getting create event data.
    _setupComponent: JQ.noop, // Placeholder for custom component setup.
    _postSetup: JQ.noop, // Placeholder for custom post-setup logic.

    // Disposes of the component instance.
    dispose: function() {
        this._cleanupComponent(); // Call custom cleanup.
        // Unbind events, remove data, and clean up CSS classes.
        this.element
            .unbind( this.triggerNamespace )
            .removeData( this.componentTypeName )
            .removeData( this.componentFullName )
            .removeData( JQ.camelCase( this.componentFullName ) );
        this.componentElement()
            .unbind( this.triggerNamespace )
            .removeAttr( "aria-disabled" )
            .removeClass(
                this.componentFullName + "-disabled " +
                "ui-state-disabled" );

        // Clean up event bindings and state classes.
        this.eventBindings.unbind( this.triggerNamespace );
        this.hoverElements.removeClass( "ui-state-hover" );
        this.focusElements.removeClass( "ui-state-focus" );
    },
    _cleanupComponent: JQ.noop, // Placeholder for custom cleanup logic.

    // Returns the main DOM element associated with the component.
    componentElement: function() {
        return this.element;
    },

    // Gets or sets component configuration options.
    configure: function( attributeName, propertyValue ) {
        var configSettings = attributeName,
            optionSegments,
            currentOptionSegment,
            idx;

        if ( arguments.length === 0 ) {
            // Return a copy of the internal options hash.
            return JQ.component.extend( {}, this.configSettings );
        }

        if ( typeof attributeName === "string" ) {
            // Handle nested keys (e.g., "foo.bar").
            configSettings = {};
            optionSegments = attributeName.split( "." );
            attributeName = optionSegments.shift();
            if ( optionSegments.length ) {
                currentOptionSegment = configSettings[ attributeName ] = JQ.component.extend( {}, this.configSettings[ attributeName ] );
                for ( idx = 0; idx < optionSegments.length - 1; idx++ ) {
                    currentOptionSegment[ optionSegments[ idx ] ] = currentOptionSegment[ optionSegments[ idx ] ] || {};
                    currentOptionSegment = currentOptionSegment[ optionSegments[ idx ] ];
                }
                attributeName = optionSegments.pop();
                if ( propertyValue === undefVal ) {
                    return currentOptionSegment[ attributeName ] === undefVal ? null : currentOptionSegment[ attributeName ];
                }
                currentOptionSegment[ attributeName ] = propertyValue;
            } else {
                if ( propertyValue === undefVal ) {
                    return this.configSettings[ attributeName ] === undefVal ? null : this.configSettings[ attributeName ];
                }
                configSettings[ attributeName ] = propertyValue;
            }
        }

        this._applyConfigurations( configSettings ); // Apply the new settings.

        return this;
    },
    // Applies multiple configuration options.
    _applyConfigurations: function( configSettings ) {
        var attributeName;

        for ( attributeName in configSettings ) {
            this._applyConfiguration( attributeName, configSettings[ attributeName ] );
        }

        return this;
    },
    // Applies a single configuration option.
    _applyConfiguration: function( attributeName, propertyValue ) {
        this.configSettings[ attributeName ] = propertyValue;

        if ( attributeName === "disabled" ) {
            this.componentElement()
                .toggleClass( this.componentFullName + "-disabled ui-state-disabled", !!propertyValue )
                .attr( "aria-disabled", propertyValue );
            this.hoverElements.removeClass( "ui-state-hover" );
            this.focusElements.removeClass( "ui-state-focus" );
        }

        return this;
    },

    // Enables the component.
    activate: function() {
        return this._applyConfiguration( "disabled", false );
    },
    // Disables the component.
    deactivate: function() {
        return this._applyConfiguration( "disabled", true );
    },

    // Attaches event handlers to elements.
    _attachEventHandler: function( ignoreStateCheck, targetElement, eventHandlers ) {
        var delegatedTarget,
            instanceRef = this;

        // Adjust arguments if 'ignoreStateCheck' is not a boolean.
        if ( typeof ignoreStateCheck !== "boolean" ) {
            eventHandlers = targetElement;
            targetElement = ignoreStateCheck;
            ignoreStateCheck = false;
        }

        // If no element is provided, use the component's main element.
        if ( !eventHandlers ) {
            eventHandlers = targetElement;
            targetElement = this.element;
            delegatedTarget = this.componentElement();
        } else {
            targetElement = delegatedTarget = JQ( targetElement ); // Accept selectors or DOM elements.
            this.eventBindings = this.eventBindings.add( targetElement ); // Add to managed bindings.
        }

        JQ.each( eventHandlers, function( eventType, eventHandler ) {
            function proxyHandler() {
                // Check if the component or element is disabled.
                if ( !ignoreStateCheck &&
                        ( instanceRef.configSettings.disabled === true ||
                            JQ( this ).hasClass( "ui-state-disabled" ) ) ) {
                    return;
                }
                // Call the actual handler, either a string method name or a function.
                return ( typeof eventHandler === "string" ? instanceRef[ eventHandler ] : eventHandler )
                    .apply( instanceRef, arguments );
            }

            // Copy GUID to allow direct unbinding of the proxy.
            if ( typeof eventHandler !== "string" ) {
                proxyHandler.guid = eventHandler.guid =
                    eventHandler.guid || proxyHandler.guid || JQ.guid++;
            }

            var eventMatch = eventType.match( /^(\w+)\s*(.*)$/ ),
                fullEventName = eventMatch[1] + instanceRef.triggerNamespace,
                eventSelector = eventMatch[2];
            if ( eventSelector ) {
                delegatedTarget.delegate( eventSelector, fullEventName, proxyHandler );
            } else {
                targetElement.bind( fullEventName, proxyHandler );
            }
        });
    },

    // Detaches event handlers.
    _detachEventHandler: function( targetElement, eventName ) {
        eventName = (eventName || "").split( " " ).join( this.triggerNamespace + " " ) + this.triggerNamespace;
        targetElement.unbind( eventName ).undelegate( eventName );
    },

    // Schedules a function to run after a delay.
    _scheduleExecution: function( eventHandler, delayDuration ) {
        function proxyHandler() {
            return ( typeof eventHandler === "string" ? instanceRef[ eventHandler ] : eventHandler )
                .apply( instanceRef, arguments );
        }
        var instanceRef = this;
        return setTimeout( proxyHandler, delayDuration || 0 );
    },

    // Marks an element as hoverable.
    _makeHoverable: function( targetElement ) {
        this.hoverElements = this.hoverElements.add( targetElement );
        this._attachEventHandler( targetElement, {
            mouseenter: function( triggerEvent ) {
                JQ( triggerEvent.currentTarget ).addClass( "ui-state-hover" );
            },
            mouseleave: function( triggerEvent ) {
                JQ( triggerEvent.currentTarget ).removeClass( "ui-state-hover" );
            }
        });
    },

    // Marks an element as focusable.
    _makeFocusable: function( targetElement ) {
        this.focusElements = this.focusElements.add( targetElement );
        this._attachEventHandler( targetElement, {
            focusin: function( triggerEvent ) {
                JQ( triggerEvent.currentTarget ).addClass( "ui-state-focus" );
            },
            focusout: function( triggerEvent ) {
                JQ( triggerEvent.currentTarget ).removeClass( "ui-state-focus" );
            }
        });
    },

    // Triggers a custom component event.
    _emitEvent: function( eventType, triggerEvent, eventPayload ) {
        var propertyKey, originalEventObject,
            eventCallback = this.configSettings[ eventType ];

        eventPayload = eventPayload || {};
        triggerEvent = JQ.Event( triggerEvent );
        triggerEvent.type = ( eventType === this.componentEventPrefix ?
            eventType :
            this.componentEventPrefix + eventType ).toLowerCase();
        // Reset the target to the component's main element.
        triggerEvent.target = this.element[ 0 ];

        // Copy properties from the original event if it exists.
        originalEventObject = triggerEvent.originalEvent;
        if ( originalEventObject ) {
            for ( propertyKey in originalEventObject ) {
                if ( !( propertyKey in triggerEvent ) ) {
                    triggerEvent[ propertyKey ] = originalEventObject[ propertyKey ];
                }
            }
        }

        this.element.trigger( triggerEvent, eventPayload );
        // Return false if the callback explicitly returns false or default is prevented.
        return !( JQ.isFunction( eventCallback ) &&
            eventCallback.apply( this.element[0], [ triggerEvent ].concat( eventPayload ) ) === false ||
            triggerEvent.isDefaultPrevented() );
    }
};

// Add _show and _hide methods to the base component prototype.
JQ.each( { present: "fade_in", conceal: "fade_out" }, function( actionName, fallbackEffect ) {
    JQ.BaseComponent.prototype[ "_" + actionName ] = function( targetElement, displayOptions, completionCallback ) {
        if ( typeof displayOptions === "string" ) {
            displayOptions = { effect: displayOptions };
        }
        var hasDisplayOptions,
            visualEffectName = !displayOptions ?
                actionName :
                displayOptions === true || typeof displayOptions === "number" ?
                    fallbackEffect :
                    displayOptions.effect || fallbackEffect;
        displayOptions = displayOptions || {};
        if ( typeof displayOptions === "number" ) {
            displayOptions = { duration: displayOptions };
        }
        hasDisplayOptions = !JQ.isEmptyObject( displayOptions );
        // ... (rest of the _show/_hide logic would follow here, maintaining structure)
    };
});

}( jQuery ));