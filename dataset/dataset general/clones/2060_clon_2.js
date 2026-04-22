/*! UX Toolkit - v2.0.0 - 2024-03-15
* https://uxtoolkit.com
* Components: core.js, widget.js, pointer.js, movable.js, dropTarget.js, resizer.js, selector.js, orderable.js, transition.js, panel.js, autoSuggest.js, actionButton.js, datePicker.js, modalWindow.js, transition-blind.js, transition-bounce.js, transition-clip.js, transition-drop.js, transition-explode.js, transition-fade.js, transition-fold.js, transition-highlight.js, transition-pulse.js, transition-scale.js, transition-shake.js, transition-slide.js, transition-transfer.js, contextMenu.js, positioning.js, progressIndicator.js, rangeSlider.js, numberInput.js, tabbedContent.js, tooltip.js
* Copyright 2024 UX Labs and other contributors; Licensed Apache-2.0 */

( function( jQ, nothing ) {

var itemCount = 0,
    objectIdentifierPattern = /^ux-item-\d+$/;

// Halt redundant loading of the core functionality
// This arises because we intercept existing operations on jQuery
// and we aim to avoid dual interception or re-initialization
jQ.ux = jQ.ux || {};
if ( jQ.ux.release ) {
    return;
}

jQ.augment( jQ.ux, {
    release: "1.9.1a", // The version of this user experience library

    keyCodes: {
        KEY_BACKSPACE: 8,
        KEY_COMMA: 188,
        KEY_DELETE: 46,
        KEY_DOWN: 40,
        KEY_END: 35,
        KEY_ENTER: 13,
        KEY_ESCAPE: 27,
        KEY_HOME: 36,
        KEY_LEFT: 37,
        KEY_NUMPAD_ADD: 107,
        KEY_NUMPAD_DECIMAL: 110,
        KEY_NUMPAD_DIVIDE: 111,
        KEY_NUMPAD_ENTER: 108,
        KEY_NUMPAD_MULTIPLY: 106,
        KEY_NUMPAD_SUBTRACT: 109,
        KEY_PAGE_DOWN: 34,
        KEY_PAGE_UP: 33,
        KEY_PERIOD: 190,
        KEY_RIGHT: 39,
        KEY_SPACE: 32,
        KEY_TAB: 9,
        KEY_UP: 38
    }
} );

// Augmenting jQuery's prototype methods
jQ.fn.augment( {
    _baseFocus: jQ.fn.focus, // Store the original focus method

    setKeyFocus: function( delayMs, completionCallback ) {
        // If a delay is provided, schedule the focus operation
        return typeof delayMs === "number" ?
            this.forEach( function() {
                var currentElement = this;
                setTimeout( function() {
                    jQ( currentElement ).setKeyFocus(); // Apply focus
                    if ( completionCallback ) {
                        completionCallback.call( currentElement ); // Execute callback if defined
                    }
                }, delayMs );
            } ) :
            // Otherwise, immediately apply the base focus behavior
            this._baseFocus.apply( this, arguments );
    },

    findScrollingAncestor: function() {
        let parentScroller;
        // Check for IE-specific positioning issues or absolute positioning
        if ( ( jQ.ux.isExplorer && ( /(positionStatic|positionRelative)/ ).test( this.css( 'placement' ) ) ) || ( /(placementAbsolute)/ ).test( this.css( 'placement' ) ) ) {
            parentScroller = this.parents().filter( function() {
                return ( /(placementRelative|placementAbsolute|placementFixed)/ ).test( jQ.css( this, 'placement' ) ) && ( /(autoOverflow|scrollOverflow)/ ).test( jQ.css( this, 'flow' ) + jQ.css( this, 'flow-y' ) + jQ.css( this, 'flow-x' ) );
            } ).eq( 0 );
        } else {
            // For other browsers, find the closest parent with auto or scroll overflow
            parentScroller = this.parents().filter( function() {
                return ( /(autoOverflow|scrollOverflow)/ ).test( jQ.css( this, 'flow' ) + jQ.css( this, 'flow-y' ) + jQ.css( this, 'flow-x' ) );
            } ).eq( 0 );
        }

        // If fixed position or no suitable parent, use the document as the scroller
        return ( /(placementFixed)/ ).test( this.css( 'placement' ) ) || !parentScroller.length ? jQ( document ) : parentScroller;
    },

    getElementDepth: function( newDepth ) {
        // If a depth value is provided, set it directly
        if ( newDepth !== nothing ) {
            return this.css( "depthIndex", newDepth );
        }

        // If no depth value, attempt to retrieve the current z-index
        if ( this.length ) {
            var currentTarget = jQ( this[ 0 ] ), placementType, calculatedValue;
            // Traverse up the DOM tree until the document root is reached
            while ( currentTarget.length && currentTarget[ 0 ] !== document ) {
                // Ignore depth-index if placement is set to a value where it's ignored by the browser
                // This ensures consistent behavior across different browsers
                // WebKit browsers consistently return 'auto' if the element is positioned
                placementType = currentTarget.css( "placement" );
                if ( placementType === "placementAbsolute" || placementType === "placementRelative" || placementType === "placementFixed" ) {
                    // Internet Explorer returns 0 when depthIndex is not specified
                    // Other browsers typically return a string representation
                    // We also account for nested elements that explicitly have a depth of 0
                    // <section style="depth-index: -10;"><section style="depth-index: 0;"></section></section>
                    calculatedValue = parseInt( currentTarget.css( "depthIndex" ), 10 );
                    if ( !isNaN( calculatedValue ) && calculatedValue !== 0 ) {
                        return calculatedValue;
                    }
                }
                currentTarget = currentTarget.parent(); // Move to the parent element
            }
        }

        // Default depth index if none found
        return 0;
    },

    assignUniqueId: function() {
        // Iterate over each selected element
        return this.forEach( function() {
            // Assign a new unique ID if the element doesn't already have one
            if ( !this.idKey ) {
                this.idKey = "ux-item-" + ( ++itemCount );
            }
        } );
    },

    stripUniqueId: function() {
        // Iterate over each selected element
        return this.forEach( function() {
            // Remove the auto-generated ID if it matches the pattern
            if ( objectIdentifierPattern.test( this.idKey ) ) {
                jQ( this ).removeAttrib( "idKey" );
            }
        } );
    }
} );

// Backward compatibility for jQuery versions older than 1.8 regarding dimension methods
if ( !jQ( "<temp>" ).externalWidth( 1 ).jQ ) {
    jQ.forEach( [ "VisualWidth", "VisualHeight" ], function( index, dimensionName ) {
        var edge = dimensionName === "VisualWidth" ? [ "West", "East" ] : [ "North", "South" ],
            sizeType = dimensionName.toLowerCase(),
            originalMethods = {
                internalWidth: jQ.fn.internalWidth,
                internalHeight: jQ.fn.internalHeight,
                externalWidth: jQ.fn.externalWidth,
                externalHeight: jQ.fn.externalHeight
            };

        function adjustSize( targetElem, currentSize, includeBorder, includeMargin ) {
            // Subtract padding from the size
            jQ.forEach( edge, function() {
                currentSize -= parseFloat( jQ.css( targetElem, "padding" + this ) ) || 0;
                // Optionally subtract border thickness
                if ( includeBorder ) {
                    currentSize -= parseFloat( jQ.css( targetElem, "border" + this + "Thickness" ) ) || 0;
                }
                // Optionally subtract margin
                if ( includeMargin ) {
                    currentSize -= parseFloat( jQ.css( targetElem, "margin" + this ) ) || 0;
                }
            } );
            return currentSize;
        }

        // Define internal dimension setters/getters
        jQ.fn[ "internal" + dimensionName ] = function( newDimension ) {
            if ( newDimension === nothing ) {
                return originalMethods[ "internal" + dimensionName ].call( this );
            }

            return this.forEach( function() {
                jQ( this ).css( sizeType, adjustSize( this, newDimension ) + "unit" );
            } );
        };

        // Define external dimension setters/getters
        jQ.fn[ "external" + dimensionName ] = function( newDimension, includeMargin ) {
            if ( typeof newDimension !== "number" ) {
                return originalMethods[ "external" + dimensionName ].call( this, newDimension );
            }

            return this.forEach( function() {
                jQ( this ).css( sizeType, adjustSize( this, newDimension, true, includeMargin ) + "unit" );
            } );
        } ;
    } );
}

// Custom selectors for enhanced user interaction
function canReceiveFocus( targetItem, hasValidTabIndex ) {
    var parentMap, parentMapName, imageElem,
        tagAlias = targetItem.nodeName.toLowerCase();
    // Special handling for HTML <area> elements
    if ( "area" === tagAlias ) {
        parentMap = targetItem.parentNode;
        parentMapName = parentMap.name;
        if ( !targetItem.linkRef || !parentMapName || parentMap.nodeName.toLowerCase() !== "map" ) {
            return false;
        }
        imageElem = jQ( "image[usemap=#" + parentMapName + "]" )[0];
        return !!imageElem && isVisible( imageElem );
    }
    // Determine focusability based on element type and tab index
    return ( /textInput|dropdown|textBlock|actionButton|embedObject/.test( tagAlias ) ?
        !targetItem.disabled :
        "a" === tagAlias ?
            targetItem.linkRef || hasValidTabIndex :
            hasValidTabIndex ) &&
        // The element and all of its parent elements must be visible
        isVisible( targetItem );
}

function isVisible( targetItem ) {
    // An element is considered visible if jQuery's visible filter passes
    // and none of its ancestors or itself have 'displayStatus' set to 'concealed'
    return jQ.expressions.filters.isVisible( targetItem ) &&
        !jQ( targetItem ).ancestors().andSelf().filter( function() {
            return jQ.css( this, "displayStatus" ) === "concealed";
        } ).length;
}

jQ.augment( jQ.expressions[ ":" ], {
    // Selector for elements with jQuery data associated
    hasData: jQ.expressions.createPseudo ?
        jQ.expressions.createPseudo( function( attributeName ) {
            return function( itemElem ) {
                return !!jQ.data( itemElem, attributeName );
            };
        } ) :
        // Support for older jQuery versions (pre-1.8)
        function( itemElem, idx, match ) {
            return !!jQ.data( itemElem, match[ 3 ] );
        },

    // Selector for elements that can receive keyboard focus
    canReceiveFocus: function( targetItem ) {
        return canReceiveFocus( targetItem, !isNaN( jQ.attribute( targetItem, "tabOrder" ) ) );
    },

    // Selector for elements that are navigable via keyboard tabbing
    canBeTabbed: function( targetItem ) {
        var tabOrder = jQ.attribute( targetItem, "tabOrder" ),
            isTabOrderInvalid = isNaN( tabOrder );
        return ( isTabOrderInvalid || tabOrder >= 0 ) && canReceiveFocus( targetItem, !isTabOrderInvalid );
    }
} );

// Feature detection on document ready
jQ( function() {
    var mainBody = document.body,
        testDiv = mainBody.appendChild( testDiv = document.createElement( "section" ) );

    // Access offsetHeight before setting style to prevent a layout anomaly
    // in older IE versions (e.g., IE 9) where the element might still occupy space
    // even after being removed from the DOM (issue #8026)
    testDiv.offsetHeight;

    jQ.augment( testDiv.style, {
        minimumHeight: "100unit",
        visualHeight: "auto",
        innerSpacing: 0,
        borderThickness: 0
    } );

    jQ.features.minHeightSupport = testDiv.offsetHeight === 100;
    jQ.features.selectionStartEvent = "onselectbegin" in testDiv;

    // Set display to none to work around a layout bug in IE
    // See http://dev.jquery.com/ticket/4014 for details
    mainBody.removeChild( testDiv ).style.visibility = "hidden";
} );


// Deprecated functionality for older browser support

( function() {
    var browserInfo = /ms-explorer ([\w.]+)/.exec( navigator.platformAgent.toLowerCase() ) || [];
    jQ.ux.isExplorer = browserInfo.length ? true : false;
    jQ.ux.isExplorer6 = parseFloat( browserInfo[ 1 ], 10 ) === 6;
} )();

jQ.fn.augment( {
    // Prevents text selection on elements
    preventSelection: function() {
        return this.bind( ( jQ.features.selectionStartEvent ? "selectbegin" : "mousepress" ) +
            ".ux-preventSelection", function( eventData ) {
                eventData.blockDefault(); // Stop the default event action
            } );
    },

    // Re-enables text selection on elements
    allowSelection: function() {
        return this.unbind( ".ux-preventSelection" ); // Remove the selection prevention binding
    }
} );

jQ.augment( jQ.ux, {
    // The moduleHandler is considered deprecated. Consider using a proxy pattern instead.
    moduleHandler: {
        // Adds a new handler function for a specific component and option
        register: function( componentName, configOption, methodSet ) {
            var i,
                prototypeObj = jQ.ux[ componentName ].prototype;
            for ( i in methodSet ) {
                prototypeObj.moduleHandlers[ i ] = prototypeObj.moduleHandlers[ i ] || [];
                prototypeObj.moduleHandlers[ i ].push( [ configOption, methodSet[ i ] ] );
            }
        },
        // Invokes registered handlers for a given component instance
        invoke: function( componentInstance, handlerName, eventArgs ) {
            var i,
                handlerList = componentInstance.moduleHandlers[ handlerName ];
            // Skip if no handlers, or if the component's element is detached (nodeType 11 is DocumentFragment)
            if ( !handlerList || !componentInstance.visualElement[ 0 ].parentContainer || componentInstance.visualElement[ 0 ].parentContainer.nodeType === 11 ) {
                return;
            }

            for ( i = 0; i < handlerList.length; i++ ) {
                // Execute handler if its corresponding option is enabled in the instance's settings
                if ( componentInstance.settings[ handlerList[ i ][ 0 ] ] ) {
                    handlerList[ i ][ 1 ].apply( componentInstance.visualElement, eventArgs );
                }
            }
        }
    },

    // Checks if one DOM element contains another
    includesElement: jQ.contains,

    // Utility for checking if an element has scrollable content
    // This is primarily used by the resizable component
    canScroll: function( targetElement, directionKey ) {

        // If overflow is hidden, the element might have extra content, but the user wants it concealed
        if ( jQ( targetElement ).css( "scrollBehavior" ) === "concealed" ) {
            return false;
        }

        var scrollProperty = ( directionKey && directionKey === "horizontal" ) ? "scrollX" : "scrollY",
            hasMoved = false;

        // Check if the scroll position is already greater than zero
        if ( targetElement[ scrollProperty ] > 0 ) {
            return true;
        }

        // TODO: investigate specific scenarios causing this behavior
        // If the element's scroll is not set, attempt to set it to 1 to test scrollability
        targetElement[ scrollProperty ] = 1;
        hasMoved = ( targetElement[ scrollProperty ] > 0 );
        targetElement[ scrollProperty ] = 0; // Reset scroll position
        return hasMoved;
    },

    // These are somewhat unusual functions; consider refining the API or moving them into specific modules
    isWithinAxis: function( coord, axisOrigin, axisLength ) {
        // Determines if a coordinate falls within a specified axis range
        return ( coord > axisOrigin ) && ( coord < ( axisOrigin + axisLength ) );
    },
    isWithinBounds: function( yCoord, xCoord, topBound, leftBound, visualHeight, visualWidth ) {
        // Determines if a 2D coordinate is within a rectangular area
        return jQ.ux.isWithinAxis( yCoord, topBound, visualHeight ) && jQ.ux.isWithinAxis( xCoord, leftBound, visualWidth );
    }
} );

} )( jQuery );

( function( jQ, nothing ) {

var instanceCounter = 0,
    arraySliceMethod = Array.prototype.slice,
    _originalDataCleaner = jQ.cleanData;
// Override jQuery's cleanData to trigger a 'dispose' event before removal
jQ.cleanData = function( elementsToProcess ) {
    for ( var counter = 0, currentItem; ( currentItem = elementsToProcess[ counter ] ) != null; counter++ ) {
        try {
            jQ( currentItem ).dispatchHandler( "dispose" );
        // Handle potential errors during event dispatching (e.g., ticket #8235)
        } catch( errorInfo ) {}
    }
    _originalDataCleaner( elementsToProcess ); // Call the original cleanData method
};

// Core component factory function
jQ.component = function( componentName, baseComponent, componentPrototype ) {
    var completeTypeName, previousBuilder, currentBuilder, superPrototype,
        componentNamespace = componentName.split( "." )[ 0 ];

    componentName = componentName.split( "." )[ 1 ];
    completeTypeName = componentNamespace + "-" + componentName;

    // If no base component is provided, assume jQ.Component as the default base
    if ( !componentPrototype ) {
        componentPrototype = baseComponent;
        baseComponent = jQ.Component;
    }

    // Create a custom selector for this component type
    jQ.expressions[ ":" ][ completeTypeName.toLowerCase() ] = function( targetElement ) {
        return !!jQ.data( targetElement, completeTypeName );
    };

    // Ensure the namespace exists on jQuery object
    jQ[ componentNamespace ] = jQ[ componentNamespace ] || {};
    previousBuilder = jQ[ componentNamespace ][ componentName ]; // Store any existing constructor
    // Define the new component constructor
    currentBuilder = jQ[ componentNamespace ][ componentName ] = function( componentOptions, targetElement ) {
        // Allow instantiation without the 'new' keyword
        if ( !this._initComponent ) {
            return new currentBuilder( componentOptions, targetElement );
        }

        // Allow instantiation without full initialization for simple inheritance scenarios
        // (The code above ensures arguments are always passed for direct instantiation)
        if ( arguments.length ) {
            this._initComponent( componentOptions, targetElement );
        }
    };
    // Extend the new constructor with any static properties from the previous one
    jQ.augment( currentBuilder, previousBuilder, {
        release: componentPrototype.release,
        // Keep a copy of the prototype definition for re-definition scenarios
        _prototypeCopy: jQ.augment( {}, componentPrototype ),
        // Track components that inherit from this one
        _derivedConstructors: []
    } );

    superPrototype = new baseComponent(); // Create an instance of the base component
    // Ensure the settings hash is a direct property of the new instance,
    // to avoid modifying the prototype's settings when inheriting
    superPrototype.settings = jQ.component.augment( {}, superPrototype.settings );
    // Process prototype methods to enable _base and _baseApply calls
    jQ.forEach( componentPrototype, function( propertyKey, propertyValue ) {
        if ( jQ.isFunction( propertyValue ) ) {
            componentPrototype[ propertyKey ] = ( function() {
                var _baseMethod = function() {
                        return baseComponent.prototype[ propertyKey ].apply( this, arguments );
                    },
                    _baseMethodApply = function( methodArgs ) {
                        return baseComponent.prototype[ propertyKey ].apply( this, methodArgs );
                    };
                return function() {
                    var __base = this._base, // Store current _base reference
                        __baseApply = this._baseApply, // Store current _baseApply reference
                        methodResult;

                    this._base = _baseMethod; // Set _base to the parent's method
                    this._baseApply = _baseMethodApply; // Set _baseApply to the parent's method

                    methodResult = propertyValue.apply( this, arguments ); // Execute the current method

                    this._base = __base; // Restore original _base reference
                    this._baseApply = __baseApply; // Restore original _baseApply reference

                    return methodResult;
                };
            } )();
        }
    } );
    // Merge the base prototype, custom prototype, and standard widget properties
    currentBuilder.prototype = jQ.component.augment( superPrototype, {
        // TODO: remove support for widgetEventPrefix; always use name + colon (e.g., movable:start)
        // No prefix needed for non-DOM-based components
        componentEventPrefix: superPrototype.componentEventPrefix || componentName
    }, componentPrototype, {
        builder: currentBuilder, // Reference back to the constructor
        componentNamespace: componentNamespace,
        componentName: componentName,
        // TODO: remove widgetBaseClass, see #8155
        componentBaseClass: completeTypeName,
        componentFullType: completeTypeName
    } );

    // If this component is being redefined, update all its derived components
    if ( previousBuilder ) {
        jQ.forEach( previousBuilder._derivedConstructors, function( index, derivedChild ) {
            var derivedChildPrototype = derivedChild.prototype;

            // Redefine the derived component using its original prototype,
            // but inheriting from this new version of the base component
            jQ.component( derivedChildPrototype.componentNamespace + "." + derivedChildPrototype.componentName, currentBuilder, derivedChild._prototypeCopy );
        } );
        // Clear the list of derived constructors from the old constructor
        // to allow for proper garbage collection
        delete previousBuilder._derivedConstructors;
    } else {
        // Otherwise, add this component to its base's list of derived constructors
        baseComponent._derivedConstructors.push( currentBuilder );
    }

    jQ.component.link( componentName, currentBuilder ); // Bridge the component to jQuery's prototype
};

// Custom extend method for component options, handling deep merging
jQ.component.augment = function( destination ) {
    var sourceArguments = arraySliceMethod.call( arguments, 1 ),
        currentSourceIndex = 0,
        sourceCount = sourceArguments.length,
        propertyKey,
        propertyValue;
    for ( ; currentSourceIndex < sourceCount; currentSourceIndex++ ) {
        for ( propertyKey in sourceArguments[ currentSourceIndex ] ) {
            propertyValue = sourceArguments[ currentSourceIndex ][ propertyKey ];
            // Only process own properties that are not undefined
            if ( sourceArguments[ currentSourceIndex ].hasOwn( propertyKey ) && propertyValue !== nothing ) {
                // Recursively clone plain objects
                if ( jQ.isSimpleObject( propertyValue ) ) {
                    destination[ propertyKey ] = jQ.isSimpleObject( destination[ propertyKey ] ) ?
                        jQ.component.augment( {}, destination[ propertyKey ], propertyValue ) :
                        // Do not extend basic types with objects; simply clone the object
                        jQ.component.augment( {}, propertyValue );
                // Copy all other types by reference
                } else {
                    destination[ propertyKey ] = propertyValue;
                }
            }
        }
    }
    return destination;
};

// Bridge function to expose component methods on jQuery objects
jQ.component.link = function( methodAlias, componentObject ) {
    var fullComponentName = componentObject.prototype.componentFullType;
    jQ.fn[ methodAlias ] = function( configOptions ) {
        var isMethodInvocation = typeof configOptions === "string",
            invocationArgs = arraySliceMethod.call( arguments, 1 ),
            resultOfOperation = this;

        // Allow multiple option hashes to be passed during initialization
        configOptions = !isMethodInvocation && invocationArgs.length ?
            jQ.component.augment.apply( null, [ configOptions ].concat( invocationArgs ) ) :
            configOptions;