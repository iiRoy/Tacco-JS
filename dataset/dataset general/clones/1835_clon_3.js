/*
 * Custom UI Framework - Version 1.0.0
 *
 * Copyright 2023, DevTeam.js (https://devteam.js.org)
 * Licensed under the Apache 2.0 or MIT licenses.
 * https://devteam.js.org/license
 *
 * This file contains core utilities and base functionality for the UI library.
 */
(function( _jq, undefined ) {

    // Ensure our custom UI object exists and prevent re-initialization
    // This mechanism stops accidental double-loading of the core library.
    _jq.customUI = _jq.customUI || {};
    if ( _jq.customUI.releaseId ) {
        // Library already loaded, exit gracefully.
        // console.warn("Custom UI Framework already initialized. Skipping redundant load.");
        return;
    }

    // Extend the main jQuery object with our core UI functionalities and constants.
    _jq.extend( _jq.customUI, {
        releaseId: "1.0.0", // Semantic versioning for this build.
        isFrameworkInitialized: true, // Flag to indicate successful initialization.

        // Standard keyboard key codes for event handling.
        keyCodes: {
            KEY_ALT: 18,
            KEY_BACKSPACE: 8,
            KEY_CAPS_LOCK: 20,
            KEY_COMMA: 188,
            KEY_COMMAND_LEFT: 91, // Mac Command key
            KEY_COMMAND_RIGHT: 93,
            KEY_CONTROL: 17,
            KEY_DELETE: 46,
            KEY_ARROW_DOWN: 40,
            KEY_END: 35,
            KEY_ENTER: 13,
            KEY_ESCAPE: 27,
            KEY_HOME: 36,
            KEY_INSERT: 45,
            KEY_ARROW_LEFT: 37,
            KEY_MENU: 93, // Context Menu or Right Command
            KEY_NUMPAD_ADD: 107,
            KEY_NUMPAD_DECIMAL: 110,
            KEY_NUMPAD_DIVIDE: 111,
            KEY_NUMPAD_ENTER: 108,
            KEY_NUMPAD_MULTIPLY: 106,
            KEY_NUMPAD_SUBTRACT: 109,
            KEY_PAGE_DOWN: 34,
            KEY_PAGE_UP: 33,
            KEY_PERIOD: 190,
            KEY_ARROW_RIGHT: 39,
            KEY_SHIFT: 16,
            KEY_SPACE: 32,
            KEY_TAB: 9,
            KEY_ARROW_UP: 38,
            KEY_WINDOWS: 91 // Windows key
        },

        // Helper for parsing CSS numeric values safely.
        _parseCssNumeric: function(value) {
            var parsed = parseFloat(value);
            return isNaN(parsed) ? 0 : parsed;
        }
    });

    // Add new utility methods to jQuery's prototype.
    _jq.fn.extend({
        _nativeFocusMethod: _jq.fn.focus, // Store the original jQuery focus method.

        // Custom focus method with an optional delay.
        setDelayedFocus: function( waitTimeMs, callbackFn ) {
            // Guard clause: ensure delay is a valid non-negative number.
            if ( typeof waitTimeMs !== "number" || waitTimeMs < 0 ) {
                console.warn("Invalid delay time provided for setDelayedFocus. Executing immediately.");
                return this._nativeFocusMethod.apply( this, arguments );
            }

            var selfCollection = this; // Capture 'this' for the callback scope.
            return selfCollection.each(function() {
                var currentElement = this;
                setTimeout(function() {
                    _jq( currentElement )._nativeFocusMethod(); // Call original jQuery focus.
                    if ( callbackFn ) {
                        callbackFn.call( currentElement ); // Execute user-provided callback.
                    }
                }, waitTimeMs );
            });
        },

        // Determine the nearest scrollable ancestor for the element.
        getScrollContainer: function() {
            var currentElement = this;
            var scrollableParent;
            var isPositioned = function( el ) {
                var pos = _jq.curCSS(el,'position',1);
                return (/(relative|absolute|fixed)/).test(pos);
            };
            var isScrollable = function( el ) {
                var overflowProps = _jq.curCSS(el,'overflow',1) + _jq.curCSS(el,'overflow-y',1) + _jq.curCSS(el,'overflow-x',1);
                return (/(auto|scroll)/).test(overflowProps);
            };

            // Enhanced logic for positioned elements.
            if ( ( _jq.browser.msie && (/(static|relative)/).test(currentElement.css('position')) ) || (/(absolute|fixed)/).test(currentElement.css('position')) ) {
                scrollableParent = currentElement.parents().filter(function() {
                    return isPositioned(this) && isScrollable(this);
                }).eq(0);
            } else {
                // Default search for any scrollable ancestor.
                scrollableParent = currentElement.parents().filter(function() {
                    return isScrollable(this);
                }).eq(0);
            }

            // If no specific scrollable parent found or element is fixed, default to document.
            var isFixedPosition = (/(fixed)/).test(currentElement.css('position'));
            return (!scrollableParent.length || isFixedPosition) ? _jq(document) : scrollableParent;
        },

        // Manages the z-index property of elements.
        adjustZIndex: function( newZIndex ) {
            // If newZIndex is provided, set it directly.
            if ( newZIndex !== undefined ) {
                return this.css( "zIndex", newZIndex );
            }

            // If no z-index provided, find the effective z-index of the first element.
            if ( this.length === 0 ) {
                return 0; // No element to check.
            }

            var currentTraversedElement = _jq( this[ 0 ] );
            var currentElementPosition, zIndexNumericValue;

            // Traverse up the DOM tree until document root is reached.
            while ( currentTraversedElement.length && currentTraversedElement[ 0 ] !== document ) {
                currentElementPosition = currentTraversedElement.css( "position" );

                // Only consider z-index if position is not static.
                if ( currentElementPosition === "absolute" || currentElementPosition === "relative" || currentElementPosition === "fixed" ) {
                    zIndexNumericValue = parseInt( currentTraversedElement.css( "zIndex" ), 10 );
                    // If a valid non-zero z-index is found, return it.
                    if ( !isNaN( zIndexNumericValue ) && zIndexNumericValue !== 0 ) {
                        return zIndexNumericValue;
                    }
                }
                currentTraversedElement = currentTraversedElement.parent();
            }

            return 0; // Default z-index if none found.
        },

        // Prevents user selection on the elements.
        blockUserSelection: function() {
            var eventType = _jq.support.selectstart ? "selectstart" : "mousedown";
            return this.bind( eventType + ".ui-noSelect", function( selectionEvent ) {
                selectionEvent.preventDefault();
            });
        },

        // Re-enables user selection on the elements.
        allowUserSelection: function() {
            return this.unbind( ".ui-noSelect" );
        }
    });

    // Dynamically generate inner/outer Width/Height methods, similar to jQuery's internal approach.
    _jq.each( [ "Width", "Height" ], function( index, dimensionName ) {
        var dimensionSides = dimensionName === "Width" ? [ "Left", "Right" ] : [ "Top", "Bottom" ],
            cssProperty = dimensionName.toLowerCase(),
            nativeMethodsCache = {
                innerWidth: _jq.fn.innerWidth,
                innerHeight: _jq.fn.innerHeight,
                outerWidth: _jq.fn.outerWidth,
                outerHeight: _jq.fn.outerHeight
            };

        // Helper function to calculate the content size adjusted for padding, border, and margin.
        function calculateAdjustedSize( targetElement, baseSize, includeBorder, includeMargin ) {
            var actualSize = baseSize;
            _jq.each( dimensionSides, function(idx, side) {
                actualSize -= _jq.customUI._parseCssNumeric( _jq.curCSS( targetElement, "padding" + side, true) );
                if ( includeBorder ) {
                    actualSize -= _jq.customUI._parseCssNumeric( _jq.curCSS( targetElement, "border" + side + "Width", true) );
                }
                if ( includeMargin ) {
                    actualSize -= _jq.customUI._parseCssNumeric( _jq.curCSS( targetElement, "margin" + side, true) );
                }
            });
            return actualSize;
        }

        // Custom 'inner' dimension setter/getter.
        _jq.fn[ "getSetInner" + dimensionName ] = function( valueToSet ) {
            if ( valueToSet === undefined ) {
                return nativeMethodsCache[ "inner" + dimensionName ].call( this );
            }

            return this.each(function() {
                _jq( this ).css( cssProperty, calculateAdjustedSize( this, valueToSet ) + "px" );
            });
        };

        // Custom 'outer' dimension setter/getter.
        _jq.fn[ "getSetOuter" + dimensionName ] = function( valueToSet, includeMargins ) {
            if ( typeof valueToSet !== "number" ) {
                return nativeMethodsCache[ "outer" + dimensionName ].call( this, valueToSet );
            }

            return this.each(function() {
                _jq( this ).css( cssProperty, calculateAdjustedSize( this, valueToSet, true, includeMargins ) + "px" );
            });
        };
    });

    // --- Custom Selector Definitions ---

    // Checks if a DOM element is focusable.
    function checkFocusability( domElement, hasExplicitTabIndex ) {
        var nodeTagName = domElement.nodeName.toLowerCase();

        // Special handling for image map areas.
        if ( "area" === nodeTagName ) {
            var parentMap = domElement.parentNode,
                mapId = parentMap.name,
                associatedImage;
            if ( !domElement.href || !mapId || parentMap.nodeName.toLowerCase() !== "map" ) {
                return false;
            }
            associatedImage = _jq( "img[usemap=#" + mapId + "]" )[0];
            return !!associatedImage && checkVisibility( associatedImage );
        }

        // Generic focusability check for various HTML elements.
        var isFormElement = /input|select|textarea|button|object/.test( nodeTagName );
        var isAnchorElement = "a" === nodeTagName;

        var elementIsInteractable = isFormElement
            ? !domElement.disabled
            : isAnchorElement
                ? domElement.href || hasExplicitTabIndex
                : hasExplicitTabIndex;

        // An element must be interactable AND visible to be focusable.
        return elementIsInteractable && checkVisibility( domElement );
    }

    // Checks if a DOM element is visually visible.
    function checkVisibility( domElement ) {
        // An element is visible if it and all its ancestors are not hidden.
        return !_jq( domElement ).parents().addBack().filter(function() {
            var cssVisibility = _jq.curCSS( this, "visibility" );
            return cssVisibility === "hidden" || _jq.expr.filters.hidden( this );
        }).length;
    }

    // Extend jQuery's selector engine with custom pseudo-selectors.
    _jq.extend( _jq.expr[ ":" ], {
        // Selects elements that have custom data associated with them.
        hasDataAttribute: function( targetEl, index, matchInfo ) {
            return !!_jq.data( targetEl, matchInfo[ 3 ] );
        },

        // Selects elements that are focusable according to our logic.
        canReceiveFocus: function( domElement ) {
            var tabIndexValue = _jq.attr( domElement, "tabindex" );
            return checkFocusability( domElement, !isNaN( parseInt(tabIndexValue, 10) ) ); // Pass true if tabindex is a number
        },

        // Selects elements that are keyboard tabbable.
        isKeyboardTabbable: function( domElement ) {
            var tabIndex = _jq.attr( domElement, "tabindex" );
            var indexIsNaN = isNaN( parseInt(tabIndex, 10) ); // Check if tabindex is a valid number.
            var isValidTabIndex = indexIsNaN || tabIndex >= 0;

            return isValidTabIndex && checkFocusability( domElement, !indexIsNaN );
        }
    });

    // --- Feature Support Detection ---
    _jq(function() {
        var documentBody = document.body;

        // Guard clause: ensure document.body exists before performing checks.
        if ( !documentBody ) {
            console.error("Document body not found. Skipping UI feature support detection.");
            return;
        }

        var temporaryDiv = document.createElement( "div" );
        documentBody.appendChild( temporaryDiv );

        // Apply styles to test specific CSS properties.
        _jq.extend( temporaryDiv.style, {
            minHeight: "100px",
            height: "auto",
            padding: "0px", // Explicitly set padding
            borderWidth: "0px" // Explicitly set border
        });

        // Test for min-height CSS support.
        _jq.customUI.support = _jq.customUI.support || {}; // Ensure support object exists.
        _jq.customUI.support.hasMinHeight = ( temporaryDiv.offsetHeight === 100 );

        // Test for 'selectstart' event support (for preventing selection).
        _jq.customUI.support.canSelectStart = ( "onselectstart" in temporaryDiv );

        // Clean up the temporary div and hide it.
        documentBody.removeChild( temporaryDiv ).style.display = "none";
    });

    // --- Deprecated or Legacy Utility Functions ---
    // These functions are maintained for compatibility but might be refactored or removed in future versions.
    _jq.extend( _jq.customUI, {
        // Deprecated plugin management system. Use modern component patterns instead.
        pluginManager: {
            // Registers an event handler for a plugin module.
            registerPluginHandler: function( pluginModule, pluginOption, eventHandlers ) {
                var modulePrototype = _jq.customUI[ pluginModule ].prototype;
                for ( var handlerKey in eventHandlers ) {
                    if (Object.prototype.hasOwnProperty.call(eventHandlers, handlerKey)) {
                        modulePrototype.plugins[ handlerKey ] = modulePrototype.plugins[ handlerKey ] || [];
                        modulePrototype.plugins[ handlerKey ].push( [ pluginOption, eventHandlers[ handlerKey ] ] );
                    }
                }
            },
            // Invokes registered event handlers for a plugin instance.
            invokePluginHandlers: function( pluginInstance, eventName, eventArguments ) {
                var handlers = pluginInstance.plugins[ eventName ];
                // Skip if no handlers or if the element is no longer in the DOM.
                if ( !handlers || !pluginInstance.element[ 0 ].parentNode ) {
                    return;
                }

                // Iterate and execute handlers that are enabled via options.
                for ( var i = 0; i < handlers.length; i++ ) {
                    var currentHandler = handlers[i];
                    if ( pluginInstance.options[ currentHandler[ 0 ] ] ) {
                        currentHandler[ 1 ].apply( pluginInstance.element, eventArguments );
                    }
                }
            }
        },

        // Determines if a DOM element 'a' contains element 'b'.
        // This will be deprecated once jQuery 1.4+ is a baseline (uses jQuery.contains).
        domContains: function( ancestorElement, descendantElement ) {
            if ( !ancestorElement || !descendantElement ) {
                return false; // Invalid input.
            }
            // Use native compareDocumentPosition for better cross-browser compatibility.
            if ( document.compareDocumentPosition ) {
                return (ancestorElement.compareDocumentPosition( descendantElement ) & 16) === 16;
            } else {
                // Fallback for older browsers (IE).
                return ancestorElement !== descendantElement && ancestorElement.contains( descendantElement );
            }
        },

        // Checks if an element has scrollable content in a given direction.
        // Primarily used by resizable components.
        checkScrollPresence: function( elementNode, scrollDirection ) {
            // If overflow is hidden, content might be larger but scrolling is suppressed.
            if ( _jq( elementNode ).css( "overflow" ) === "hidden" ) {
                return false;
            }

            var scrollProperty = ( scrollDirection && scrollDirection === "left" ) ? "scrollLeft" : "scrollTop";
            var scrollDetected = false;

            // If current scroll position is > 0, it definitely has scroll.
            if ( elementNode[ scrollProperty ] > 0 ) {
                return true;
            }

            // Temporarily attempt to scroll to detect potential scrollability.
            var originalScrollValue = elementNode[ scrollProperty ];
            elementNode[ scrollProperty ] = 1; // Attempt to scroll by 1px.
            scrollDetected = ( elementNode[ scrollProperty ] > 0 );
            elementNode[ scrollProperty ] = originalScrollValue; // Restore original scroll value.

            return scrollDetected;
        },

        // Determines if a coordinate value falls within a given axis range.
        isCoordinateWithinAxis: function( coordValue, axisStart, axisLength ) {
            var axisEnd = axisStart + axisLength;
            return ( coordValue >= axisStart ) && ( coordValue < axisEnd ); // Inclusive start, exclusive end.
        },

        // Determines if a specific point (x, y) is located over a rectangular element.
        isPointOverElement: function( pointY, pointX, elemTop, elemLeft, elemHeight, elemWidth ) {
            return _jq.customUI.isCoordinateWithinAxis( pointY, elemTop, elemHeight ) &&
                   _jq.customUI.isCoordinateWithinAxis( pointX, elemLeft, elemWidth );
        }
    });

})( jQuery );

/*
 * Custom UI Component Base - Version 1.0.0
 *
 * Copyright 2023, DevTeam.js (https://devteam.js.org)
 * Licensed under the Apache 2.0 or MIT licenses.
 * https://devteam.js.org/license
 *
 * This file defines the base component (widget) system for the Custom UI Framework.
 */
(function( _jq, undefined ) {

    // --- DOM Cleanup Hook for Component Removal ---
    // Intercepts jQuery's cleanData or remove methods to trigger component teardown.
    if ( _jq.cleanData ) {
        var _nativeCleanDataMethod = _jq.cleanData;
        _jq.cleanData = function( elementsToProcess ) {
            for ( var i = 0, currentElement; (currentElement = elementsToProcess[i]) != null; i++ ) {
                // Trigger a custom 'componentRemove' event before the element is cleaned.
                _jq( currentElement ).triggerHandler( "componentRemove" );
            }
            _nativeCleanDataMethod( elementsToProcess ); // Call the original method.
        };
    } else {
        // Fallback for older jQuery versions without _jq.cleanData.
        var _nativeRemoveFn = _jq.fn.remove;
        _jq.fn.remove = function( filterSelector, retainData ) {
            if ( !retainData ) { // If data is not explicitly kept, trigger removal.
                this.each(function() {
                    // Check if the current element or its descendants match the selector (if any).
                    if ( !filterSelector || _jq.filter( filterSelector, [ this ] ).length ) {
                        _jq( "*", this ).add( [ this ] ).each(function() {
                            _jq( this ).triggerHandler( "componentRemove" );
                        });
                    }
                });
            }
            return _nativeRemoveFn.call( this, filterSelector, retainData );
        };
    }

    // --- Component Definition Factory ---
    _jq.component = function( widgetFullName, baseConstructor, widgetDefinition ) {
        var moduleNamespace = widgetFullName.split( "." )[ 0 ],
            componentName = widgetFullName.split( "." )[ 1 ],
            baseCssClass = moduleNamespace + "-" + componentName;

        // Handle optional baseConstructor argument.
        if ( !widgetDefinition ) {
            widgetDefinition = baseConstructor;
            baseConstructor = _jq.BaseComponent;
        }

        // Create a custom selector for the new component type.
        _jq.expr[ ":" ][ baseCssClass ] = function( domNode ) {
            return !!_jq.data( domNode, componentName );
        };

        // Ensure namespace exists on _jq object.
        _jq[ moduleNamespace ] = _jq[ moduleNamespace ] || {};

        // Define the component constructor.
        _jq[ moduleNamespace ][ componentName ] = function( initialOptions, targetElement ) {
            // Allow instantiation without full initialization for inheritance purposes.
            if ( arguments.length > 0 ) {
                this._initializeComponent( initialOptions, targetElement );
            }
        };

        // Inherit from the base constructor.
        var parentInstancePrototype = new baseConstructor();
        // Deep copy options from the base prototype to avoid shared references.
        parentInstancePrototype.options = _jq.extend( true, {}, parentInstancePrototype.options );

        // Extend the component's prototype with base properties and provided definition.
        _jq[ moduleNamespace ][ componentName ].prototype = _jq.extend( true, parentInstancePrototype, {
            compNamespace: moduleNamespace,
            compName: componentName,
            eventPrefix: _jq[ moduleNamespace ][ componentName ].prototype.eventPrefix || componentName,
            baseCssClass: baseCssClass
        }, widgetDefinition );

        // Bridge the component to _jq.fn, enabling _jq(selector).componentName() syntax.
        _jq.component.bridge( componentName, _jq[ moduleNamespace ][ componentName ] );
    };

    // --- Component Bridge Function ---
    // Connects a component constructor to _jq.fn for easy instantiation and method calls.
    _jq.component.bridge = function( pluginName, widgetClass ) {
        _jq.fn[ pluginName ] = function( callOptions ) {
            var isStringInvocation = typeof callOptions === "string",
                methodArgs = Array.prototype.slice.call( arguments, 1 ),
                resultOfCall = this; // Default return value is the jQuery collection.

            // Handle multiple option hashes passed during initialization.
            if ( !isStringInvocation && methodArgs.length > 0 ) {
                callOptions = _jq.extend.apply( null, [ true, callOptions ].concat(methodArgs) );
            }

            // Prevent direct calls to internal methods (prefixed with '_').
            if ( isStringInvocation && callOptions.charAt( 0 ) === "_" ) {
                console.warn("Attempted to call private method '" + callOptions + "' on " + pluginName + " component.");
                return resultOfCall;
            }

            if ( isStringInvocation ) {
                // Method invocation path.
                this.each(function() {
                    var widgetInstance = _jq.data( this, pluginName );
                    // Check if component is initialized and method exists.
                    if ( widgetInstance && _jq.isFunction( widgetInstance[callOptions] ) ) {
                        var invocationResult = widgetInstance[ callOptions ].apply( widgetInstance, methodArgs );
                        // If method returns a value other than the instance, capture it.
                        if ( invocationResult !== widgetInstance && invocationResult !== undefined ) {
                            resultOfCall = invocationResult;
                            return false; // Break the each loop.
                        }
                    } else {
                        // Error handling for uninitialized component or non-existent method.
                        if ( !widgetInstance ) {
                            console.error("Cannot call methods on " + pluginName + " prior to initialization; attempted to call method '" + callOptions + "'.");
                        } else {
                            console.error("No such method '" + callOptions + "' for " + pluginName + " component instance.");
                        }
                    }
                });
            } else {
                // Component initialization path.
                this.each(function() {
                    if ( _jq.data( this, pluginName ) ) {
                        // If already initialized, update options and re-initialize.
                        var existingInstance = _jq.data( this, pluginName );
                        existingInstance.manageOptions( callOptions || {} )._init();
                    } else {
                        // Create a new component instance and store it.
                        _jq.data( this, pluginName, new widgetClass( callOptions, this ) );
                    }
                });
            }

            return resultOfCall;
        };
    };

    // --- Base Component Constructor ---
    _jq.BaseComponent = function( initialConfiguration, targetElement ) {
        // Allow simple inheritance without immediate initialization.
        if ( arguments.length > 0 ) {
            this._initializeComponent( initialConfiguration, targetElement );
        }
    };

    // --- Base Component Prototype ---
    _jq.BaseComponent.prototype = {
        componentName: "baseComponent",
        eventPrefix: "",
        options: {
            disabled: false
        },
        // Core method to set up the component instance.
        _initializeComponent: function( initialConfiguration, targetElement ) {
            // Store the instance on the element for retrieval.
            _jq.data( targetElement, this.componentName, this );
            this.targetElement = _jq( targetElement ); // Wrap the DOM element with jQuery.

            // Merge options: default, metadata, and user-provided.
            this.options = _jq.extend( true, {},
                this.options,
                this._retrieveInitialOptions(), // Options from metadata or data attributes.
                initialConfiguration );

            var _thisRef = this; // Capture 'this' for event handlers.
            // Bind a removal handler to clean up the component when its element is removed.
            this.targetElement.bind( "componentRemove." + this.componentName, function() {
                _thisRef.disposeComponent();
            });

            this._create(); // Custom component creation logic.
            this._trigger( "create" ); // Trigger 'create' event.
            this._init(); // Custom component initialization logic.
        },
        // Retrieves options from HTML metadata or data attributes.
        _retrieveInitialOptions: function() {
            // If jQuery Metadata plugin is available, use it.
            if ( _jq.metadata && _jq.metadata.get( this.targetElement[0] ) ) {
                return _jq.metadata.get( this.targetElement[0] )[ this.componentName ];
            }
            // Otherwise, return an empty object.
            return {};
        },
        _create: function() {
            // Placeholder for component-specific creation logic.
        },
        _init: function() {
            // Placeholder for component-specific initialization logic (runs after _create).
        },

        // Destroys the component instance and cleans up its associated DOM.
        disposeComponent: function() {
            this.targetElement
                .unbind( "." + this.componentName ) // Unbind all component-specific events.
                .removeData( this.componentName ); // Remove stored instance data.

            this.getComponentElement() // Get the root element of the component.
                .unbind( "." + this.componentName )
                .removeAttr( "aria-disabled" ) // Remove accessibility attributes.
                .removeClass(
                    this.baseCssClass + "-disabled " +
                    "ui-state-disabled" ); // Remove disabled CSS classes.
            // console.log(this.componentName + " component disposed.");
        },

        // Returns the root jQuery element associated with this component.
        getComponentElement: function() {
            return this.targetElement;
        },

        // Manages component options: getter/setter.
        manageOptions: function( key, value ) {
            var optionsToProcess = key;
            // ... (rest of the option management logic would go here if fully implemented)
            // For now, it only accepts a key-value pair or an object.
            if (arguments.length === 0) {
                // If no arguments, return a deep copy of all options.
                return _jq.extend(true, {}, this.options);
            }
            if (typeof key === "string") {
                if (value === undefined) {
                    // Getter: return value for a specific key.
                    return this.options[key];
                } else {
                    // Setter: set value for a specific key.
                    this.options[key] = value;
                }
            } else {
                // Setter: merge an object of options.
                this.options = _jq.extend(true, this.options, key);
            }
            return this; // Allow chaining.
        },

        // Internal method to trigger custom events.
        _trigger: function( eventType, eventObject, eventData ) {
            var customEventName = this.eventPrefix + eventType;
            eventObject = eventObject || _jq.Event( customEventName );
            eventObject.type = customEventName; // Ensure the event type is correct.

            // Prevent default behavior if the user's handler returns false.
            if ( this.targetElement.triggerHandler( eventObject, eventData ) === false ) {
                eventObject.preventDefault();
            }
            return !eventObject.isDefaultPrevented(); // Return true if default not prevented.
        }
    };

})( jQuery );