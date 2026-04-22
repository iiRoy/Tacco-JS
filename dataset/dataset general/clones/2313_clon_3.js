(function( $, undefined ) {

// A simple counter for unique instance identifiers
var uniqueIdCounter = 0;

// Reference to Array.prototype.slice for efficient array-like object conversion
var arraySliceMethod = Array.prototype.slice;

// Store the original cleanData method to extend its functionality
var originalDataCleaner = $.cleanData;

/**
 * Overrides jQuery's cleanData method to trigger a custom "remove" event
 * on elements before they are removed from the DOM. This allows widgets
 * to perform cleanup operations.
 *
 * @param {Array<HTMLElement>} elements - An array of DOM elements to be cleaned.
 */
$.cleanData = function( elements ) {
    // Iterate through each element slated for removal
    for ( var currentIdx = 0, currentElement; (currentElement = elements[ currentIdx ]) != null; currentIdx++ ) {
        // Attempt to trigger the "remove" event.
        // We wrap this in a try-catch to prevent errors in event handlers
        // from stopping the cleanup process for other elements.
        try {
            $( currentElement ).triggerHandler( "remove" );
        } catch( errorDetails ) {
            // Log the error for debugging, but continue processing.
            // console.error("Error during element removal cleanup:", errorDetails);
        }
    }
    // Call the original jQuery cleanData method to complete the cleanup
    originalDataCleaner( elements );
};

/**
 * Core function for defining jQuery UI components.
 * This method allows creating new components, extending existing ones,
 * and managing their lifecycle and inheritance.
 *
 * @param {string} componentId - The full identifier for the component (e.g., "myNamespace.myComponent").
 * @param {Function} [parentClass] - The base class/constructor to inherit from. Defaults to $.Widget.
 * @param {Object} componentDefinition - An object containing methods and properties for the new component.
 */
$.componentFactory = function( componentId, parentClass, componentDefinition ) {
    var fullComponentIdentifier,
        priorComponentConstructor,
        currentComponentConstructor,
        parentInstancePrototype,
        // The wrappedDefinition object stores the component's prototype without modification,
        // allowing it to be used as a mixin for multiple components later.
        wrappedDefinition = {},
        componentNamespace = componentId.substring( 0, componentId.indexOf(".") ); // Extract namespace

    // Update componentId to just the component's local name
    componentId = componentId.substring( componentId.indexOf(".") + 1 );
    fullComponentIdentifier = componentNamespace + "-" + componentId;

    // If only two arguments are provided, the second is the definition, and base is $.Widget
    if ( !componentDefinition ) {
        componentDefinition = parentClass;
        parentClass = $.WidgetClass; // Default base class
    }

    // Create a custom jQuery selector for instances of this component.
    // E.g., $( ":my-namespace-my-component" ) will find elements with this component's data.
    $.expr[ ":" ][ fullComponentIdentifier.toLowerCase() ] = function( domElement ) {
        return !!$.data( domElement, fullComponentIdentifier );
    };

    // Ensure the namespace object exists on jQuery
    $[ componentNamespace ] = $[ componentNamespace ] || {};

    // Store any existing constructor for this component, in case it's being redefined.
    priorComponentConstructor = $[ componentNamespace ][ componentId ];

    // Define the new component's constructor function.
    // This function can be called with or without the 'new' keyword.
    currentComponentConstructor = $[ componentNamespace ][ componentId ] = function( configurationSettings, domTarget ) {
        // If 'this' does not have _createComponent (meaning it wasn't called with 'new'),
        // then instantiate it using 'new'.
        if ( !this._createComponent ) {
            return new currentComponentConstructor( configurationSettings, domTarget );
        }

        // If arguments are provided, initialize the component.
        // This allows for simple inheritance where a child might call the parent
        // constructor without immediate initialization.
        if ( arguments.length > 0 ) {
            this._createComponent( configurationSettings, domTarget );
        }
    };

    // Extend the new constructor with static properties from the prior constructor
    // and component-specific metadata.
    $.extend( currentComponentConstructor, priorComponentConstructor, {
        version: componentDefinition.version, // Component version
        // Store a copy of the original definition object. Useful for redefinitions.
        _sourceDefinition: $.extend( {}, componentDefinition ),
        // An array to track child components that inherit from this one.
        _dependentConstructors: []
    });

    // Create an instance of the parent class to inherit its prototype properties.
    parentInstancePrototype = new parentClass();

    // Ensure the options hash is a direct property on the new instance,
    // not a reference to the parent's options, to prevent unintended modifications.
    parentInstancePrototype.configurationSettings = $.componentFactory.mergeOptions( {}, parentInstancePrototype.configurationSettings );

    // Iterate over the componentDefinition to set up prototype methods and properties.
    // This includes handling the "super" mechanism for method overriding.
    $.each( componentDefinition, function( propertyKey, propertyValue ) {
        // If the property is not a function, just copy it directly.
        if ( !$.isFunction( propertyValue ) ) {
            wrappedDefinition[ propertyKey ] = propertyValue;
            return;
        }

        // If it's a function, wrap it to provide _super and _superApply methods.
        wrappedDefinition[ propertyKey ] = (function() {
            // Helper function to call the base method with current arguments.
            var baseMethodInvoker = function() {
                    return parentClass.prototype[ propertyKey ].apply( this, arguments );
                },
                // Helper function to call the base method with an array of arguments.
                baseMethodApplyInvoker = function( args ) {
                    return parentClass.prototype[ propertyKey ].apply( this, args );
                };

            // The actual function that will be on the prototype.
            return function() {
                var cachedSuper = this._superMethod,
                    cachedSuperApply = this._superMethodApply,
                    operationResult;

                // Temporarily set _superMethod and _superMethodApply for this call.
                this._superMethod = baseMethodInvoker;
                this._superMethodApply = baseMethodApplyInvoker;

                // Execute the original component method.
                operationResult = propertyValue.apply( this, arguments );

                // Restore original _superMethod and _superMethodApply.
                this._superMethod = cachedSuper;
                this._superMethodApply = cachedSuperApply;

                return operationResult;
            };
        })();
    });

    // Extend the new component's prototype with the parent's prototype,
    // the wrapped definition, and additional component metadata.
    currentComponentConstructor.prototype = $.componentFactory.mergeOptions( parentInstancePrototype, {
        // Determine the event prefix. If redefining, use existing. Otherwise, use component name.
        eventPrefix: priorComponentConstructor ? parentInstancePrototype.eventPrefix : componentId
    }, wrappedDefinition, {
        constructor: currentComponentConstructor,
        componentNamespace: componentNamespace,
        componentName: componentId,
        fullComponentIdentifier: fullComponentIdentifier
    });

    // Handle component redefinition:
    // If this component is being redefined, we need to update all components
    // that inherited from the old version to now inherit from this new version.
    if ( priorComponentConstructor ) {
        if (priorComponentConstructor._dependentConstructors && priorComponentConstructor._dependentConstructors.length > 0) {
            $.each( priorComponentConstructor._dependentConstructors, function( idx, childConstructor ) {
                var childPrototype = childConstructor.prototype;

                // Recursively redefine the child component, inheriting from the new version.
                $.componentFactory( childPrototype.componentNamespace + "." + childPrototype.componentName, currentComponentConstructor, childConstructor._sourceDefinition );
            });
            // Clear the old list of child constructors to allow for garbage collection.
            delete priorComponentConstructor._dependentConstructors;
        }
    } else {
        // If this is a new component, add it to the parent's list of child constructors.
        if (parentClass._dependentConstructors) { // Ensure parentClass has this property
             parentClass._dependentConstructors.push( currentComponentConstructor );
        }
    }

    // Register the component with the jQuery plugin bridge.
    $.componentFactory.registerBridge( componentId, currentComponentConstructor );
};

/**
 * Custom extend function for merging options and objects.
 * Performs a deep merge for plain objects.
 *
 * @param {Object} target - The destination object.
 * @param {...Object} sources - One or more source objects to merge.
 * @returns {Object} The merged target object.
 */
$.componentFactory.mergeOptions = function( target ) {
    // Convert arguments to a real array, excluding the target.
    var sourceObjects = arraySliceMethod.call( arguments, 1 ),
        sourceIndex = 0,
        sourceCount = sourceObjects.length,
        objectKey,
        propertyValue;

    // Iterate through each source object.
    for ( ; sourceIndex < sourceCount; sourceIndex++ ) {
        // Iterate through properties of the current source object.
        for ( objectKey in sourceObjects[ sourceIndex ] ) {
            propertyValue = sourceObjects[ sourceIndex ][ objectKey ];

            // Only process own properties that are not undefined.
            if ( sourceObjects[ sourceIndex ].hasOwnProperty( objectKey ) && propertyValue !== undefined ) {
                // If the value is a plain object, perform a deep merge.
                if ( $.isPlainObject( propertyValue ) ) {
                    target[ objectKey ] = $.isPlainObject( target[ objectKey ] ) ?
                        $.componentFactory.mergeOptions( {}, target[ objectKey ], propertyValue ) :
                        // If target property is not an object, create a new object for deep merge.
                        $.componentFactory.mergeOptions( {}, propertyValue );
                } else {
                    // For all other types, copy by reference.
                    target[ objectKey ] = propertyValue;
                }
            }
        }
    }
    return target;
};

/**
 * Registers a component as a jQuery plugin (e.g., $(element).myComponent()).
 *
 * @param {string} componentName - The local name of the component.
 * @param {Function} componentConstructor - The constructor function for the component.
 */
$.componentFactory.registerBridge = function( componentName, componentConstructor ) {
    var fullComponentIdentifier = componentConstructor.prototype.fullComponentIdentifier || componentName;

    // Attach the component as a jQuery plugin method.
    $.fn[ componentName ] = function( configurationSettings ) {
        var isInvocationByMethodName = typeof configurationSettings === "string",
            invocationArguments = arraySliceMethod.call( arguments, 1 ),
            operationResult = this; // Default return value is the jQuery object itself.

        // If multiple configuration objects are passed during initialization, merge them.
        if ( !isInvocationByMethodName && invocationArguments.length > 0 ) {
            configurationSettings = $.componentFactory.mergeOptions.apply( null, [ configurationSettings ].concat( invocationArguments ) );
        }

        // Handle method calls (e.g., $(elem).myComponent("methodName", arg1)).
        if ( isInvocationByMethodName ) {
            this.each(function() {
                var resultOfMethodCall,
                    componentInstance = $.data( this, fullComponentIdentifier );

                // Error if method is called before initialization.
                if ( !componentInstance ) {
                    return $.error( "Cannot call methods on '" + componentName + "' prior to initialization; " +
                        "attempted to call method '" + configurationSettings + "'" );
                }
                // Error if method does not exist or is a private method (starts with '_').
                if ( !$.isFunction( componentInstance[ configurationSettings ] ) || configurationSettings.charAt( 0 ) === "_" ) {
                    return $.error( "No such method '" + configurationSettings + "' for '" + componentName + "' component instance" );
                }
                // Invoke the method on the component instance.
                resultOfMethodCall = componentInstance[ configurationSettings ].apply( componentInstance, invocationArguments );

                // If the method returns a value (and it's not the instance itself or undefined),
                // update the operationResult.
                if ( resultOfMethodCall !== componentInstance && resultOfMethodCall !== undefined ) {
                    operationResult = resultOfMethodCall && resultOfMethodCall.jquery ?
                        operationResult.pushStack( resultOfMethodCall.get() ) : // If it's a jQuery object, push its elements
                        resultOfMethodCall;
                    return false; // Stop .each iteration if a specific value is returned.
                }
            });
        } else {
            // Handle component initialization.
            this.each(function() {
                var componentInstance = $.data( this, fullComponentIdentifier );
                if ( componentInstance ) {
                    // If already initialized, re-configure and re-initialize.
                    componentInstance.setOption( configurationSettings || {} )._reinitialize();
                } else {
                    // Otherwise, create a new instance and store it.
                    $.data( this, fullComponentIdentifier, new componentConstructor( configurationSettings, this ) );
                }
            });
        }

        return operationResult;
    };
};

/**
 * The base class for all jQuery UI components.
 * Provides fundamental methods and properties for component lifecycle management.
 */
$.WidgetClass = function( /* configurationSettings, domTarget */ ) {};
$.WidgetClass._dependentConstructors = []; // Static property to track child constructors.

$.WidgetClass.prototype = {
    componentName: "baseComponent",
    eventPrefix: "",
    defaultDomElement: "<div>", // Default element type if none is provided.
    configurationSettings: {
        disabled: false, // Default disabled state.
        onCreation: null // Callback fired upon component creation.
    },

    /**
     * Initializes a new component instance.
     * This method is called by the constructor and sets up the component's state.
     *
     * @param {Object} configurationSettings - Initial configuration options.
     * @param {HTMLElement} domTarget - The DOM element the component is bound to.
     */
    _createComponent: function( configurationSettings, domTarget ) {
        // Ensure domTarget is a valid DOM element.
        // If domTarget is not provided, use defaultDomElement or 'this' context if applicable.
        domTarget = $( domTarget || this.defaultDomElement || this )[ 0 ];
        this.element = $( domTarget );

        // Assign a unique ID and event namespace for this instance.
        this.instanceId = uniqueIdCounter++;
        this.boundEventNamespace = "." + this.componentName + this.instanceId;

        // Merge default options, creation-specific options, and user-provided options.
        this.configurationSettings = $.componentFactory.mergeOptions( {},
            this.configurationSettings,
            this._getCreationOptions(),
            configurationSettings );

        // Initialize collections for event bindings and state-managed elements.
        this.eventBindingsCollection = $();
        this.hoverableElements = $();
        this.focusableElements = $();

        // If the component is bound to a specific DOM element (not just a conceptual widget)
        if ( domTarget !== this ) {
            // Store a reference to the component instance on the DOM element.
            $.data( domTarget, this.fullComponentIdentifier, this );

            // Bind a "remove" event handler to destroy the component when its element is removed.
            this._attachEventHandler( true, this.element, {
                remove: function( eventObject ) {
                    // Ensure the event targets the element this component is bound to.
                    if ( eventObject.target === domTarget ) {
                        this.destroyComponent();
                    }
                }
            });

            // Determine the document and window contexts for the component's element.
            this.componentDocument = $( domTarget.style ?
                domTarget.ownerDocument : // Element within the document
                domTarget.document || domTarget ); // Element is window or document
            this.componentWindow = $( this.componentDocument[0].defaultView || this.componentDocument[0].parentWindow );
        }

        // Call lifecycle methods.
        this._initializeComponent();
        this._triggerEvent( "onCreation", null, this._getCreationEventData() );
        this._reinitialize();
    },

    // Placeholder methods for customization.
    _getCreationOptions: $.noop,
    _getCreationEventData: $.noop,
    _initializeComponent: $.noop, // Called once upon creation.
    _reinitialize: $.noop, // Called on creation and subsequent option updates.

    /**
     * Destroys the component instance, cleaning up resources and event bindings.
     */
    destroyComponent: function() {
        this._performDestruction(); // Custom destruction logic.

        // Unbind all events associated with this component's namespace.
        this.element
            .unbind( this.boundEventNamespace )
            .removeData( this.componentName )
            .removeData( this.fullComponentIdentifier )
            .removeData( $.camelCase( this.fullComponentIdentifier ) ); // Backward compatibility

        // Clean up widget-specific attributes and classes on its main element.
        this.getComponentElement()
            .unbind( this.boundEventNamespace )
            .removeAttr( "aria-disabled" )
            .removeClass(
                this.fullComponentIdentifier + "-disabled " +
                "ui-state-disabled" );

        // Clean up specific event bindings and visual states.
        this.eventBindingsCollection.unbind( this.boundEventNamespace );
        this.hoverableElements.removeClass( "ui-state-hover" );
        this.focusableElements.removeClass( "ui-state-focus" );
    },
    _performDestruction: $.noop, // Custom destruction hook.

    /**
     * Returns the main DOM element associated with this component.
     * @returns {jQuery} The jQuery object representing the component's element.
     */
    getComponentElement: function() {
        return this.element;
    },

    /**
     * Manages component options. Can get all options, a specific option, or set options.
     *
     * @param {string|Object} [key] - The option name (string) or an object of options to set.
     * @param {*} [value] - The value to set for a specific option.
     * @returns {*} The option value if getting, or the component instance for chaining if setting.
     */
    setOption: function( key, value ) {
        var optionsToSet = key,
            optionPathParts,
            currentOptionSegment,
            segmentIndex;

        // If no arguments, return a cloned copy of all options.
        if ( arguments.length === 0 ) {
            return $.componentFactory.mergeOptions( {}, this.configurationSettings );
        }

        // If 'key' is a string, it could be a single option or a nested path (e.g., "foo.bar").
        if ( typeof key === "string" ) {
            optionsToSet = {}; // Prepare an object to hold the option to set.
            optionPathParts = key.split( "." );
            key = optionPathParts.shift(); // Get the top-level key.

            // If there are nested parts, traverse the options object.
            if ( optionPathParts.length > 0 ) {
                currentOptionSegment = optionsToSet[ key ] = $.componentFactory.mergeOptions( {}, this.configurationSettings[ key ] );
                for ( segmentIndex = 0; segmentIndex < optionPathParts.length - 1; segmentIndex++ ) {
                    // Ensure each segment exists as an object.
                    currentOptionSegment[ optionPathParts[ segmentIndex ] ] = currentOptionSegment[ optionPathParts[ segmentIndex ] ] || {};
                    currentOptionSegment = currentOptionSegment[ optionPathParts[ segmentIndex ] ];
                }
                key = optionPathParts.pop(); // The final key in the path.

                // If value is undefined, it's a getter for the nested option.
                if ( value === undefined ) {
                    return currentOptionSegment[ key ] === undefined ? null : currentOptionSegment[ key ];
                }
                // Otherwise, set the nested option.
                currentOptionSegment[ key ] = value;
            } else {
                // No nested parts, direct option access.
                if ( value === undefined ) {
                    return this.configurationSettings[ key ] === undefined ? null : this.configurationSettings[ key ];
                }
                optionsToSet[ key ] = value;
            }
        }

        this._applyOptions( optionsToSet );

        return this; // Allow chaining.
    },

    /**
     * Applies a set of options by calling _setSingleOption for each one.
     *
     * @param {Object} newOptions - An object containing options to apply.
     * @returns {Object} The component instance.
     */
    _applyOptions: function( newOptions ) {
        var optionKey;
        for ( optionKey in newOptions ) {
            // Only process own properties to avoid iterating prototype chain.
            if ( newOptions.hasOwnProperty(optionKey) ) {
                this._setSingleOption( optionKey, newOptions[ optionKey ] );
            }
        }
        return this;
    },

    /**
     * Sets a single option and handles side effects (e.g., updating UI for 'disabled').
     *
     * @param {string} optionKey - The name of the option.
     * @param {*} optionValue - The value to set for the option.
     * @returns {Object} The component instance.
     */
    _setSingleOption: function( optionKey, optionValue ) {
        this.configurationSettings[ optionKey ] = optionValue;

        if ( optionKey === "disabled" ) {
            // Toggle disabled classes and aria attribute.
            this.getComponentElement()
                .toggleClass( this.fullComponentIdentifier + "-disabled ui-state-disabled", !!optionValue )
                .attr( "aria-disabled", optionValue );
            // Remove hover/focus states if disabled.
            this.hoverableElements.removeClass( "ui-state-hover" );
            this.focusableElements.removeClass( "ui-state-focus" );
        }

        return this;
    },

    /**
     * Enables the component.
     * @returns {Object} The component instance.
     */
    enableComponent: function() {
        return this._setSingleOption( "disabled", false );
    },

    /**
     * Disables the component.
     * @returns {Object} The component instance.
     */
    disableComponent: function() {
        return this._setSingleOption( "disabled", true );
    },

    /**
     * Binds event handlers to elements, optionally handling disabled states and delegation.
     *
     * @param {boolean} [ignoreDisabledState] - If true, event fires even if component is disabled.
     * @param {jQuery|HTMLElement|string} [domTarget] - The element(s) to bind events to. Defaults to this.element.
     * @param {Object} handlers - An object where keys are event strings (e.g., "click", "mouseover .item")
     *                             and values are handler functions or method names (string).
     */
    _attachEventHandler: function( ignoreDisabledState, domTarget, handlers ) {
        var delegationTarget,
            componentReference = this;

        // Argument shuffling: if first arg is not boolean, it's the element.
        if ( typeof ignoreDisabledState !== "boolean" ) {
            handlers = domTarget;
            domTarget = ignoreDisabledState;
            ignoreDisabledState = false;
        }

        // Argument shuffling: if domTarget is not provided, use this.element.
        if ( !handlers ) {
            handlers = domTarget;
            domTarget = this.element;
            delegationTarget = this.getComponentElement();
        } else {
            // Ensure domTarget is a jQuery object.
            domTarget = delegationTarget = $( domTarget );
            // Add to eventBindingsCollection for later cleanup.
            this.eventBindingsCollection = this.eventBindingsCollection.add( domTarget );
        }

        // Iterate through each event/handler pair.
        $.each( handlers, function( eventString, originalHandler ) {
            // Create a wrapper function for the actual handler.
            function eventHandlerWrapper() {
                // If not ignoring disabled state, check if the component or element is disabled.
                if ( !ignoreDisabledState &&
                        ( componentReference.configurationSettings.disabled === true ||
                            $( this ).hasClass( "ui-state-disabled" ) ) ) {
                    return; // Do not execute handler if disabled.
                }
                // Execute the handler. If it's a string, call the corresponding method on the instance.
                return ( typeof originalHandler === "string" ? componentReference[ originalHandler ] : originalHandler )
                    .apply( componentReference, arguments );
            }

            // Copy the guid for direct unbinding compatibility.
            if ( typeof originalHandler !== "string" ) {
                eventHandlerWrapper.guid = originalHandler.guid =
                    originalHandler.guid || eventHandlerWrapper.guid || $.guid++;
            }

            // Parse the event string for event type and optional selector.
            var eventMatchResult = eventString.match( /^(\w+)\s*(.*)$/ ),
                fullEventName = eventMatchResult[1] + componentReference.boundEventNamespace,
                eventSelector = eventMatchResult[2];

            // Bind using delegate for selectors, otherwise direct bind.
            if ( eventSelector ) {
                delegationTarget.delegate( eventSelector, fullEventName, eventHandlerWrapper );
            } else {
                domTarget.bind( fullEventName, eventHandlerWrapper );
            }
        });
    },

    /**
     * Unbinds event handlers.
     *
     * @param {jQuery|HTMLElement} domTarget - The element(s) to unbind from.
     * @param {string} [eventName] - The specific event name(s) to unbind. If omitted, all component events are unbound.
     */
    _detachEventHandler: function( domTarget, eventName ) {
        // Append the component's event namespace to all event names for targeted unbinding.
        eventName = (eventName || "").split( " " ).join( this.boundEventNamespace + " " ) + this.boundEventNamespace;
        // Unbind both direct and delegated events.
        domTarget.unbind( eventName ).undelegate( eventName );
    },

    /**
     * Executes a function after a specified delay.
     *
     * @param {Function|string} handler - The function to execute or the name of a component method.
     * @param {number} [delayMs] - The delay in milliseconds. Defaults to 0.
     * @returns {number} The timeout ID.
     */
    _delayExecution: function( handler, delayMs ) {
        var componentReference = this; // Capture 'this' for the proxy.
        function handlerProxy() {
            return ( typeof handler === "string" ? componentReference[ handler ] : handler )
                .apply( componentReference, arguments );
        }
        return setTimeout( handlerProxy, delayMs || 0 );
    },

    /**
     * Marks an element as hoverable, applying 'ui-state-hover' class on mouseenter/mouseleave.
     *
     * @param {jQuery|HTMLElement} element - The element to make hoverable.
     */
    _makeHoverable: function( element ) {
        this.hoverableElements = this.hoverableElements.add( element );
        this._attachEventHandler( element, {
            mouseenter: function( eventObject ) {
                $( eventObject.currentTarget ).addClass( "ui-state-hover" );
            },
            mouseleave: function( eventObject ) {
                $( eventObject.currentTarget ).removeClass( "ui-state-hover" );
            }
        });
    },

    /**
     * Marks an element as focusable, applying 'ui-state-focus' class on focusin/focusout.
     *
     * @param {jQuery|HTMLElement} element - The element to make focusable.
     */
    _makeFocusable: function( element ) {
        this.focusableElements = this.focusableElements.add( element );
        this._attachEventHandler( element, {
            focusin: function( eventObject ) {
                $( eventObject.currentTarget ).addClass( "ui-state-focus" );
            },
            focusout: function( eventObject ) {
                $( eventObject.currentTarget ).removeClass( "ui-state-focus" );
            }
        });
    },

    /**
     * Triggers a custom event on the component's element.
     *
     * @param {string} eventType - The base type of the event (e.g., "create", "change").
     * @param {Event} [eventObject] - The original DOM event that triggered this.
     * @param {Object} [eventData] - Additional data to pass with the event.
     * @returns {boolean} False if event was prevented or callback returned false, true otherwise.
     */
    _triggerEvent: function( eventType, eventObject, eventData ) {
        var eventProperty, originalEventObject,
            eventCallback = this.configurationSettings[ eventType ];

        eventData = eventData || {};
        eventObject = $.Event( eventObject ); // Create a new jQuery event object.

        // Construct the full event name, e.g., "widgetnamecreate".
        eventObject.type = ( eventType === this.eventPrefix ?
            eventType :
            this.eventPrefix + eventType ).toLowerCase();

        // The target of the new event should be the component's main element.
        eventObject.target = this.element[ 0 ];

        // Copy properties from the original event (if any) to the new event.
        originalEventObject = eventObject.originalEvent;
        if ( originalEventObject ) {
            for ( eventProperty in originalEventObject ) {
                // Only copy properties that don't already exist on the new event.
                if ( !( eventProperty in eventObject ) ) {
                    eventObject[ eventProperty ] = originalEventObject[ eventProperty ];
                }
            }
        }

        // Trigger the event on the component's element.
        this.element.trigger( eventObject, eventData );

        // If a callback is defined in options and returns false, or if the event is prevented,
        // return false to indicate prevention.
        var callbackResult = $.isFunction( eventCallback ) &&
            eventCallback.apply( this.element[0], [ eventObject ].concat( eventData ) );

        return !( callbackResult === false || eventObject.isDefaultPrevented() );
    }
};

// Extend $.WidgetClass.prototype with _show and _hide methods for animation.
// This block is slightly modified to use Object.entries and a different loop structure.
Object.entries({ display: "fadeIn", conceal: "fadeOut" }).forEach(function( [animationMethod, fallbackEffect] ) {
    $.WidgetClass.prototype[ "_" + animationMethod ] = function( elementToAnimate, animationOptions, completionCallback ) {
        // If options is a string, assume it's the effect name.
        if ( typeof animationOptions === "string" ) {
            animationOptions = { effect: animationOptions };
        }

        var chosenEffectName = !animationOptions ?
                animationMethod :
                animationOptions === true || typeof animationOptions === "number" ?
                    fallbackEffect :
                    animationOptions.effect || fallbackEffect;

        animationOptions = animationOptions || {};

        // If options is a number, assume it's the duration.
        if ( typeof animationOptions === "number" ) {
            animationOptions = { duration: animationOptions };
        }

        var hasConfigurableOptions = !$.isEmptyObject( animationOptions );

        // This part of the original code was incomplete. I'll add a simple placeholder to make it functional
        // for demonstration of Type III changes. In a real scenario, this would call jQuery UI's effects API.
        if (chosenEffectName === "fadeIn") {
            $(elementToAnimate).fadeIn(animationOptions.duration || 400, completionCallback);
        } else if (chosenEffectName === "fadeOut") {
            $(elementToAnimate).fadeOut(animationOptions.duration || 400, completionCallback);
        } else {
            // Fallback for custom effects or if jQuery UI effects are not loaded
            $(elementToAnimate)[animationMethod === "display" ? "show" : "hide"](animationOptions.duration || 0, completionCallback);
        }
    };
});

})( jQuery );