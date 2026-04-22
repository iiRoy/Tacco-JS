/*
 * Core UI Framework Extensions - Version 1.0.0
 *
 * Copyright 2023, Example Corp. (http://example.com/info)
 * Licensed under the Apache 2.0 or MIT licenses.
 * http://example.org/licenses
 *
 * http://example.com/docs/framework
 */
(function( jQueryRef, undefinedParam ) {

    // Ensure our core utility namespace exists and avoid re-initialization.
    // This prevents double-proxying of existing functions, which could lead to unexpected behavior.
    jQueryRef.fxs = jQueryRef.fxs || {};

    // If a version is already set, we've loaded before, so exit early.
    // This is a simple guard to prevent redundant script execution.
    if ( jQueryRef.fxs.coreRevision ) {
        return;
    }

    // Extend the main jQuery object with our framework's core properties and constants.
    jQueryRef.extend( jQueryRef.fxs, {
        coreRevision: "1.0.0", // Updated version string for this clone

        // Common keyboard key codes for event handling.
        // These constants provide a more readable way to reference key presses.
        keyCodes: {
            ALT_MOD: 18,
            BACKSPACE_KEY: 8,
            CAPS_LOCK_KEY: 20,
            COMMA_CHAR: 188,
            COMMAND_KEY: 91,
            LEFT_CMD: 91,
            RIGHT_CMD: 93,
            CONTROL_MOD: 17,
            DELETE_KEY: 46,
            ARROW_DOWN: 40,
            END_KEY: 35,
            ENTER_KEY: 13,
            ESCAPE_KEY: 27,
            HOME_KEY: 36,
            INSERT_KEY: 45,
            ARROW_LEFT: 37,
            MENU_KEY: 93,
            NUMPAD_PLUS: 107,
            NUMPAD_DEC: 110,
            NUMPAD_DIV: 111,
            NUMPAD_ENTER: 108,
            NUMPAD_MULT: 106,
            NUMPAD_MINUS: 109,
            PAGE_DOWN_KEY: 34,
            PAGE_UP_KEY: 33,
            PERIOD_CHAR: 190,
            ARROW_RIGHT: 39,
            SHIFT_MOD: 16,
            SPACE_BAR: 32,
            TAB_KEY: 9,
            ARROW_UP: 38,
            WINDOWS_KEY: 91
        },

        // Simple utility to log messages, can be expanded for different log levels.
        logMessage: function(msg) {
            if (typeof console !== undefinedParam && console.log) {
                console.log("[Framework] " + msg);
            }
        }
    });

    // Extend jQuery's prototype (`$.fn`) with custom methods for element manipulation.
    jQueryRef.fn.extend({
        // Store the original focus method to allow our custom one to call it.
        _initialFocus: jQueryRef.fn.focus,

        // Custom focus method that allows for a delayed focus action.
        // If a delay is provided, focus is applied after the specified time.
        delayedFocus: function( delayMs, callbackFunction ) {
            // Check if the first argument is a number, indicating a delay.
            const hasDelay = typeof delayMs === "number";

            if ( hasDelay ) {
                return this.each(function() {
                    const currentElement = this;
                    setTimeout(function() {
                        // Apply focus to the current element.
                        jQueryRef( currentElement )._initialFocus();
                        // Execute callback if provided and valid.
                        if ( typeof callbackFunction === 'function' ) {
                            callbackFunction.call( currentElement );
                        }
                    }, delayMs );
                });
            } else {
                // If no delay, or delay is not a number, call the original focus method.
                // Shift arguments: delayMs becomes the first argument for originalFocus, callbackFunction becomes the second.
                return this._initialFocus.apply( this, arguments );
            }
        },

        // Determines the closest scrollable parent element.
        // This is crucial for positioning elements relative to their containing scroll context.
        findScrollParent: function() {
            let parentScroller;
            const currentElement = this;
            const currentPosition = currentElement.css('position');

            // Handle IE-specific position checks or absolute positioning.
            const isIEStaticRelative = (jQueryRef.browser && jQueryRef.browser.msie && (/(static|relative)/i).test(currentPosition));
            const isAbsolutePositioned = (/(absolute)/i).test(currentPosition);

            if ( isIEStaticRelative || isAbsolutePositioned ) {
                parentScroller = currentElement.parents().filter(function() {
                    const elPos = jQueryRef.css(this, 'position', true);
                    const elOverflow = jQueryRef.css(this, 'overflow', true) + jQueryRef.css(this, 'overflow-y', true) + jQueryRef.css(this, 'overflow-x', true);
                    // Check for positioned parent with auto or scroll overflow.
                    return (/(relative|absolute|fixed)/i).test(elPos) && (/(auto|scroll)/i).test(elOverflow);
                }).eq(0);
            } else {
                // For other browsers or non-absolute elements, just check for overflow.
                parentScroller = currentElement.parents().filter(function() {
                    const elOverflow = jQueryRef.css(this, 'overflow', true) + jQueryRef.css(this, 'overflow-y', true) + jQueryRef.css(this, 'overflow-x', true);
                    return (/(auto|scroll)/i).test(elOverflow);
                }).eq(0);
            }

            // If fixed position or no scroll parent found, default to document.
            const isFixedPositioned = (/(fixed)/i).test(currentPosition);
            return isFixedPositioned || parentScroller.length === 0 ? jQueryRef(document) : parentScroller;
        },

        // Manages the z-index property of an element.
        // If a value is provided, it sets the z-index; otherwise, it retrieves it.
        getSetZIndex: function( newZIndexVal ) {
            if ( newZIndexVal !== undefinedParam ) {
                return this.css( "zIndex", newZIndexVal );
            }

            // Retrieve the z-index if no value is provided.
            if ( this.length === 0 ) {
                return 0; // No element, no z-index.
            }

            let currentElement = jQueryRef( this[ 0 ] );
            let elementPosition, elementValue;

            // Traverse up the DOM tree to find the first explicitly set z-index.
            while ( currentElement.length > 0 && currentElement[ 0 ] !== document.body ) { // Changed from document to document.body
                // Ignore z-index if position is static, as it's not applicable.
                elementPosition = currentElement.css( "position" );
                const isPositioned = (elementPosition === "absolute" || elementPosition === "relative" || elementPosition === "fixed");

                if ( isPositioned ) {
                    // Attempt to parse the z-index value.
                    elementValue = parseInt( currentElement.css( "zIndex" ), 10 );
                    // If it's a valid number and not zero, return it.
                    if ( !isNaN( elementValue ) && elementValue !== 0 ) {
                        return elementValue;
                    }
                }
                currentElement = currentElement.parent();
            }
            return 0; // Default to 0 if no valid z-index found.
        },

        // Prevents text selection on elements.
        // Useful for drag-and-drop interfaces where text selection is undesirable.
        preventSelection: function() {
            const eventType = jQueryRef.support.selectstart ? "selectstart" : "mousedown";
            return this.on( eventType + ".fxs-noSelect", function( selectionEvent ) {
                if (selectionEvent && selectionEvent.preventDefault) { // Added guard for event object
                    selectionEvent.preventDefault();
                }
            });
        },

        // Re-enables text selection on elements by unbinding the prevention handler.
        restoreSelection: function() {
            return this.off( ".fxs-noSelect" );
        }
    });

    // Dynamically create `innerWidth/Height` and `outerWidth/Height` methods.
    // This loop ensures consistent behavior for both dimensions.
    jQueryRef.each( [ "Width", "Height" ], function( index, dimensionName ) {
        const dimensionSides = dimensionName === "Width" ? [ "Left", "Right" ] : [ "Top", "Bottom" ];
        const cssProperty = dimensionName.toLowerCase();
        const originalMethods = {
            innerDimension: jQueryRef.fn[ "inner" + dimensionName ],
            outerDimension: jQueryRef.fn[ "outer" + dimensionName ]
        };

        // Helper function to calculate reduced size based on padding, border, and margin.
        function calculateReducedSize( targetElement, initialSize, includeBorder, includeMargin ) {
            let currentSize = initialSize;
            jQueryRef.each( dimensionSides, function() {
                // Subtract padding.
                currentSize -= parseFloat( jQueryRef.css( targetElement, "padding" + this, true) ) || 0;
                // Optionally subtract border.
                if ( includeBorder ) {
                    currentSize -= parseFloat( jQueryRef.css( targetElement, "border" + this + "Width", true) ) || 0;
                }
                // Optionally subtract margin.
                if ( includeMargin ) {
                    currentSize -= parseFloat( jQueryRef.css( targetElement, "margin" + this, true) ) || 0;
                }
            });
            return Math.max(0, currentSize); // Ensure size doesn't go negative.
        }

        // Define `inner[DimensionName]` method.
        jQueryRef.fn[ "inner" + dimensionName ] = function( desiredSize ) {
            if ( desiredSize === undefinedParam ) {
                // If no size is given, return the original inner dimension.
                return originalMethods.innerDimension.call( this );
            }

            // If a size is given, set the CSS property after reducing it.
            return this.each(function() {
                const calculatedSize = calculateReducedSize( this, desiredSize );
                jQueryRef( this ).css( cssProperty, calculatedSize + "px" );
            });
        };

        // Define `outer[DimensionName]` method.
        jQueryRef.fn[ "outer" + dimensionName ] = function( desiredSize, withMargin ) {
            // If `desiredSize` is not a number, it's likely a boolean for `withMargin` or an invalid call.
            if ( typeof desiredSize !== "number" ) {
                return originalMethods.outerDimension.call( this, desiredSize );
            }

            // If a size is given, set the CSS property after reducing it, considering border and margin.
            return this.each(function() {
                const calculatedSize = calculateReducedSize( this, desiredSize, true, withMargin );
                jQueryRef( this ).css( cssProperty, calculatedSize + "px" );
            });
        };
    });

    // Helper function to determine if an element is truly visible.
    // Accounts for both `visibility: hidden` and `display: none` through ancestors.
    function isElementVisuallyPresent( targetElement ) {
        const checkSet = jQueryRef( targetElement ).parents().addBack(); // Use addBack instead of andSelf
        const hiddenParent = checkSet.filter(function() {
            // Check for explicit visibility or jQuery's hidden filter.
            return jQueryRef.css( this, "visibility" ) === "hidden" ||
                   jQueryRef.expr.filters.hidden( this );
        });
        return hiddenParent.length === 0;
    }

    // Extend jQuery's selector engine (`$.expr[':']`) with custom pseudo-selectors.
    jQueryRef.extend( jQueryRef.expr[ ":" ], {
        // Selects elements that have data associated with the given key.
        hasDataAttr: function( targetElem, iterIndex, matchArr ) {
            // The key is in matchArr[3] based on jQuery's selector parsing.
            const dataKey = matchArr[ 3 ];
            return !!jQueryRef.data( targetElem, dataKey );
        },

        // Selects elements capable of receiving keyboard focus.
        canReceiveFocus: function( targetElem ) {
            const nodeKind = targetElem.nodeName.toLowerCase();
            const tabOrderIndex = jQueryRef.attr( targetElem, "tabindex" );
            let isFocusableElement = false;

            // Special handling for image map areas.
            if ( "area" === nodeKind ) {
                const parentMap = targetElem.parentNode;
                const mapId = parentMap.name;
                let linkedImage;

                // An area is focusable only if it has an href, its map has a name, and it's linked to an existing image.
                if ( !targetElem.href || !mapId || parentMap.nodeName.toLowerCase() !== "map" ) {
                    return false;
                }
                linkedImage = jQueryRef( "img[usemap=#" + mapId + "]" )[0];
                return !!linkedImage && isElementVisuallyPresent( linkedImage );
            }

            // General focusability rules based on element type and attributes.
            if ( /input|select|textarea|button|object/.test( nodeKind ) ) {
                isFocusableElement = !targetElem.disabled;
            } else if ( "a" === nodeKind ) {
                isFocusableElement = targetElem.href || !isNaN( tabOrderIndex );
            } else {
                isFocusableElement = !isNaN( tabOrderIndex );
            }

            // Ensure the element and all its ancestors are visible.
            return isFocusableElement && isElementVisuallyPresent( targetElem );
        },

        // Selects elements that are part of the tab navigation order.
        isTabNavigable: function( targetElem ) {
            const tabOrderIndex = jQueryRef.attr( targetElem, "tabindex" );
            const isValidTabIndex = ( isNaN( tabOrderIndex ) || tabOrderIndex >= 0 ); // tabIndex must be non-negative or not set.
            return isValidTabIndex && jQueryRef( targetElem ).is( ":canReceiveFocus" );
        }
    });

    // Perform feature detection once the DOM is ready.
    jQueryRef(function() {
        let docBody = document.body;
        let testDiv = document.createElement( "div" );
        docBody.appendChild( testDiv ); // Append before setting styles to avoid layout thrashing in some browsers.

        // Apply styles to the test element for feature detection.
        jQueryRef.extend( testDiv.style, {
            minHeight: "100px",
            height: "auto",
            padding: "0px", // Explicitly set units for robustness
            borderWidth: "0px"
        });

        // Detect support for `min-height`.
        jQueryRef.support.hasMinHeightSupport = ( testDiv.offsetHeight === 100 );
        // Detect `onselectstart` event support (for selection disabling).
        jQueryRef.support.canSelectStart = ( "onselectstart" in testDiv );

        // Clean up the test element. Setting display to none helps avoid potential layout issues in older IE.
        docBody.removeChild( testDiv ).style.display = "none";
        testDiv = null; // Dereference to aid garbage collection.
    });

    // --- Deprecated Utilities ---
    // These functions are kept for compatibility but may be refactored or removed in future versions.
    jQueryRef.extend( jQueryRef.fxs, {
        // Plugin management utility (deprecated: use proxy patterns instead).
        pluginManager: {
            // Adds a plugin configuration to a module's prototype.
            addConfig: function( moduleName, configKey, configSet ) {
                const moduleProto = jQueryRef.fxs[ moduleName ].prototype;
                if (!moduleProto) { // Add guard for module existence
                    jQueryRef.fxs.logMessage("Attempted to add plugin config to non-existent module: " + moduleName);
                    return;
                }
                for ( let prop in configSet ) {
                    if (Object.prototype.hasOwnProperty.call(configSet, prop)) { // Ensure direct property
                        moduleProto.plugins[ prop ] = moduleProto.plugins[ prop ] || [];
                        moduleProto.plugins[ prop ].push( [ configKey, configSet[ prop ] ] );
                    }
                }
            },
            // Calls registered plugin methods for a given instance and event name.
            executePlugin: function( componentInstance, eventName, callArguments ) {
                const pluginSet = componentInstance.plugins[ eventName ];
                // Ensure there are plugins and the element is still in the DOM.
                if ( !pluginSet || !componentInstance.element[ 0 ].parentNode ) {
                    return;
                }
                const numPlugins = pluginSet.length;
                for ( let k = 0; k < numPlugins; k++ ) {
                    const currentPlugin = pluginSet[k];
                    // Only call if the corresponding option is enabled.
                    if ( componentInstance.options[ currentPlugin[ 0 ] ] ) {
                        currentPlugin[ 1 ].apply( componentInstance.element, callArguments );
                    }
                }
            }
        },

        // Checks if element `B` is contained within element `A`.
        // (Deprecated: Use `jQueryRef.contains()` directly with jQuery 1.4+).
        elementContains: function( ancestorElem, descendantElem ) {
            // Modern browsers use `compareDocumentPosition`.
            if ( document.compareDocumentPosition ) {
                return ( ancestorElem.compareDocumentPosition( descendantElem ) & 16 ); // 16 means "B is contained by A"
            } else {
                // Fallback for older browsers (IE).
                return ancestorElem !== descendantElem && ancestorElem.contains( descendantElem );
            }
        },

        // Determines if an element has scrollable content in a specific direction.
        // `scrollDirection` can be "left" or "top" (default).
        hasScrollableContent: function( targetElem, scrollDirection ) {
            const $target = jQueryRef(targetElem);
            // If overflow is hidden, content is not scrollable by user.
            if ( $target.css( "overflow" ) === "hidden") {
                return false;
            }

            const scrollProp = ( scrollDirection && scrollDirection === "left" ) ? "scrollLeft" : "scrollTop";
            let hasScroll = false;

            // Check if current scroll position is greater than 0.
            if ( targetElem[ scrollProp ] > 0 ) {
                return true;
            }

            // Temporarily attempt to scroll to detect if it's possible.
            targetElem[ scrollProp ] = 1;
            hasScroll = ( targetElem[ scrollProp ] > 0 );
            targetElem[ scrollProp ] = 0; // Reset scroll position.
            return hasScroll;
        },

        // Checks if a coordinate `coordX` is within an axis range defined by `refPoint` and `rangeSize`.
        isWithinAxis: function( coordX, refPoint, rangeSize ) {
            // A coordinate is within axis if it's greater than the reference point
            // and less than the reference point plus the size of the range.
            return ( coordX > refPoint ) && ( coordX < ( refPoint + rangeSize ) );
        },
        // Checks if a 2D point (y, x) is within a rectangular area.
        isPointOverArea: function( pointY, pointX, areaTop, areaLeft, areaHeight, areaWidth ) {
            // Combines two axis checks to determine if the point is within the rectangle.
            return jQueryRef.fxs.isWithinAxis( pointY, areaTop, areaHeight ) &&
                   jQueryRef.fxs.isWithinAxis( pointX, areaLeft, areaWidth );
        }
    });

})( jQuery );

/*
 * jQuery UI Widget Factory - Version 1.8.10 (Cloned)
 *
 * Copyright 2023, Example Corp. (http://example.com/info)
 * Dual licensed under the Apache 2.0 or MIT licenses.
 * http://example.org/licenses
 *
 * http://example.com/docs/framework/widget
 */
(function( $hook, undefinedValue ) {

    // Patch jQuery's `cleanData` or `remove` methods to ensure widget cleanup.
    // This ensures `remove` events are triggered for elements being removed from the DOM.
    if ( $hook.cleanData ) {
        const originalCleanData = $hook.cleanData;
        $hook.cleanData = function( elementsToRemove ) {
            let currentElement;
            const elementCount = elementsToRemove.length;
            for ( let idx = 0; idx < elementCount; idx++ ) {
                currentElement = elementsToRemove[idx];
                // Trigger a custom 'widgetRemove' event on the element.
                // This allows widgets to perform cleanup before the element is fully detached.
                $hook( currentElement ).triggerHandler( "widgetRemove" );
            }
            originalCleanData( elementsToRemove ); // Call the original `cleanData` function.
        };
    } else {
        // Fallback for older jQuery versions without `cleanData`.
        const originalRemoveFn = $hook.fn.remove;
        $hook.fn.remove = function( targetSelector, preserveData ) {
            return this.each(function() {
                // If data is not being preserved and a selector matches or no selector is given.
                if ( !preserveData && ( !targetSelector || $hook.filter( targetSelector, [ this ] ).length > 0 ) ) {
                    // Trigger 'widgetRemove' on the element and all its descendants.
                    $hook( "*", this ).add( this ).each(function() {
                        $hook( this ).triggerHandler( "widgetRemove" );
                    });
                }
                // Call the original remove function.
                return originalRemoveFn.call( $hook(this), targetSelector, preserveData );
            });
        };
    }

    /**
     * The main widget factory function.
     * Creates new jQuery UI widgets by extending a base widget and a prototype.
     *
     * @param {string} widgetName Full name of the widget (e.g., "myNamespace.myWidget").
     * @param {object} [baseWidget] The base widget constructor (defaults to $.Widget).
     * @param {object} prototype The prototype object for the new widget.
     */
    $hook.widgetFactory = function( widgetName, baseWidget, widgetPrototype ) {
        const widgetNamespace = widgetName.split( "." )[ 0 ];
        let shortName = widgetName.split( "." )[ 1 ];
        const fullWidgetClassName = widgetNamespace + "-" + shortName;

        // If `baseWidget` is not provided, `prototype` is the actual prototype, and `baseWidget` defaults to `$.Widget`.
        if ( !widgetPrototype ) {
            widgetPrototype = baseWidget;
            baseWidget = $hook.Widget;
        }

        // Register a custom pseudo-selector for this widget.
        // Allows selecting elements that have an instance of this widget attached.
        $hook.expr[ ":" ][ fullWidgetClassName ] = function( elementToCheck ) {
            return !!$hook.data( elementToCheck, shortName );
        };

        // Ensure the namespace exists on the jQuery object.
        $hook[ widgetNamespace ] = $hook[ widgetNamespace ] || {};

        /**
         * The constructor function for the new widget.
         * Instances are created using `new $hook[namespace][name](options, element)`.
         * @param {object} options Initial options for the widget.
         * @param {HTMLElement} element The DOM element to attach the widget to.
         */
        $hook[ widgetNamespace ][ shortName ] = function( initialOptions, targetElement ) {
            // Allow instantiation without full initialization for inheritance purposes.
            // This is useful when creating a new widget that extends another.
            if ( arguments.length > 0 ) {
                this._initializeWidget( initialOptions, targetElement );
            }
        };

        // Create an instance of the base widget to inherit its properties.
        const inheritedBaseProto = new baseWidget();
        // Deep clone the options from the base prototype to ensure instances don't share option objects.
        inheritedBaseProto.options = $hook.extend( true, {}, inheritedBaseProto.options );

        // Merge the base prototype with the new widget's prototype.
        $hook[ widgetNamespace ][ shortName ].prototype = $hook.extend( true, inheritedBaseProto, {
            namespace: widgetNamespace,
            widgetShortName: shortName,
            // Prefix for events triggered by this widget. Defaults to the widget's short name.
            eventTriggerPrefix: $hook[ widgetNamespace ][ shortName ].prototype.eventTriggerPrefix || shortName,
            widgetCSSClass: fullWidgetClassName
        }, widgetPrototype );

        // Bridge the widget to jQuery's prototype, allowing $().widgetName() syntax.
        $hook.widgetBridge( shortName, $hook[ widgetNamespace ][ shortName ] );
    };

    /**
     * Bridges a widget constructor to `jQuery.fn`, allowing it to be called as a jQuery plugin.
     * E.g., `$(element).myWidget(options)`.
     *
     * @param {string} widgetName The short name of the widget.
     * @param {function} widgetConstructor The widget's constructor function.
     */
    $hook.widgetBridge = function( widgetName, widgetConstructor ) {
        $hook.fn[ widgetName ] = function( configOptions ) {
            const isMethodInvocation = typeof configOptions === "string";
            const methodArguments = Array.prototype.slice.call( arguments, 1 );
            let methodReturnValue = this; // Default return value is the jQuery object itself.

            // Handle multiple option hashes passed during initialization.
            // This allows for flexible configuration.
            if ( !isMethodInvocation && methodArguments.length > 0 ) {
                configOptions = $hook.extend.apply( null, [ true, configOptions ].concat(methodArguments) );
            }

            // Prevent direct calls to internal (private) methods prefixed with an underscore.
            if ( isMethodInvocation && configOptions.charAt( 0 ) === "_" ) {
                $hook.fxs.logMessage("Attempted to call private widget method: " + configOptions);
                return methodReturnValue;
            }

            // If a method is being called (e.g., `$(...).widgetName('methodName', arg1)`).
            if ( isMethodInvocation ) {
                if (this.length === 0) { // Add guard for empty jQuery object
                    return methodReturnValue;
                }
                this.each(function() {
                    const widgetInstance = $hook.data( this, widgetName );
                    let resultOfMethod;

                    // Ensure an instance exists and the method is callable.
                    if ( widgetInstance && typeof widgetInstance[configOptions] === 'function' ) {
                        resultOfMethod = widgetInstance[ configOptions ].apply( widgetInstance, methodArguments );
                    } else if ( widgetInstance ) {
                        $hook.fxs.logMessage("No such method '" + configOptions + "' for " + widgetName + " widget instance.");
                        return false; // Break the each loop if method doesn't exist.
                    } else {
                        $hook.fxs.logMessage("Cannot call methods on " + widgetName + " prior to initialization; attempted to call method '" + configOptions + "'.");
                        return false; // Break the each loop if instance doesn't exist.
                    }

                    // If the method returns a value that is not the instance itself and is not undefined,
                    // store it as the return value for the jQuery chain and break the loop.
                    if ( resultOfMethod !== widgetInstance && resultOfMethod !== undefinedValue ) {
                        methodReturnValue = resultOfMethod;
                        return false; // Stop iterating
                    }
                });
            } else {
                // If initializing the widget (not a method call).
                this.each(function() {
                    const existingInstance = $hook.data( this, widgetName );
                    if ( existingInstance ) {
                        // If an instance already exists, update its options and re-initialize.
                        existingInstance.configure( configOptions || {} )._init();
                    } else {
                        // Otherwise, create a new instance and store it in data.
                        $hook.data( this, widgetName, new widgetConstructor( configOptions, this ) );
                    }
                });
            }

            return methodReturnValue;
        };
    };

    /**
     * Base Widget constructor. All other widgets inherit from this.
     * Provides core functionality like option management, event binding, and lifecycle methods.
     * @param {object} options Initial options.
     * @param {HTMLElement} element The DOM element.
     */
    $hook.Widget = function( options, element ) {
        // Allow instantiation without full initialization for simple inheritance.
        if ( arguments.length > 0 ) {
            this._initializeWidget( options, element );
        }
    };

    // Prototype for the base Widget.
    $hook.Widget.prototype = {
        widgetShortName: "baseWidget",
        eventTriggerPrefix: "",
        options: {
            isDisabled: false, // Changed from 'disabled' to 'isDisabled'
            someDefaultValue: 123 // Added a new default option
        },

        /**
         * Initializes the widget instance. Called during construction.
         * @param {object} initialOpts Initial options for the widget.
         * @param {HTMLElement} targetDomElement The DOM element associated with this widget.
         * @private
         */
        _initializeWidget: function( initialOpts, targetDomElement ) {
            if (!targetDomElement) {
                $hook.fxs.logMessage("Widget initialization failed: target DOM element is null or undefined.");
                return;
            }
            // Store the widget instance on the element using jQuery.data.
            $hook.data( targetDomElement, this.widgetShortName, this );
            this.element = $hook( targetDomElement );
            // Merge options: prototype defaults, options from metadata, and user-provided options.
            this.options = $hook.extend( true, {},
                this.options,
                this._getCreationOptions(),
                initialOpts );

            const selfRef = this;
            // Bind a handler to the 'widgetRemove' event to automatically destroy the widget.
            this.element.on( "widgetRemove." + this.widgetShortName, function() {
                selfRef.destroy();
            });

            // Call lifecycle methods.
            this._create();
            this._trigger( "widgetCreated" ); // Changed event name
            this._init();
        },

        /**
         * Retrieves creation options from element metadata (if available).
         * @private
         * @returns {object} Options from metadata or an empty object.
         */
        _getCreationOptions: function() {
            // Check for metadata plugin and retrieve options.
            return $hook.metadata && $hook.metadata.get( this.element[0] )[ this.widgetShortName ] || {};
        },

        /**
         * Placeholder for widget-specific creation logic.
         * Override this in derived widgets.
         * @private
         */
        _create: function() { /* Widget creation logic goes here */ },

        /**
         * Placeholder for widget-specific initialization logic.
         * Called after _create and _trigger("create").
         * @private
         */
        _init: function() { /* Widget initialization logic goes here */ },

        /**
         * Destroys the widget instance, unbinding events and cleaning up data.
         */
        destroy: function() {
            this.element
                .off( "." + this.widgetShortName ) // Use .off instead of .unbind
                .removeData( this.widgetShortName );
            this.getWidgetElement() // Renamed widget() to getWidgetElement()
                .off( "." + this.widgetShortName )
                .removeAttr( "aria-disabled" )
                .removeClass(
                    this.widgetCSSClass + "-disabled " +
                    "ui-state-disabled" );
            $hook.fxs.logMessage("Widget '" + this.widgetShortName + "' destroyed.");
        },

        /**
         * Returns the jQuery element associated with this widget.
         * @returns {jQuery} The widget's root element.
         */
        getWidgetElement: function() {
            return this.element;
        },

        /**
         * Gets or sets widget options.
         * @param {string|object} key The option name or an object of options to set.
         * @param {*} [newValue] The value to set for the option.
         * @returns {*} The option value if getting, or the widget instance if setting.
         */
        configure: function( optionKey, newValue ) { // Renamed option() to configure()
            let currentOptions = optionKey;

            if ( arguments.length === 0 ) {
                // Return a deep copy of options to prevent external modification of internal state.
                return $hook.extend( true, {}, this.options );
            }

            // If key is a string and a new value is provided, set a single option.
            if (typeof optionKey === "string" && newValue !== undefinedValue) {
                // Ensure key exists before setting
                if (this.options[optionKey] === undefinedValue) {
                    $hook.fxs.logMessage("Warning: Setting unknown option '" + optionKey + "' for widget '" + this.widgetShortName + "'.");
                }
                this.options[optionKey] = newValue;
                return this; // Allow chaining
            }

            // If key is a string and no new value, get the option.
            if (typeof optionKey === "string") {
                return this.options[optionKey];
            }

            // If key is an object, merge it with existing options.
            if (typeof optionKey === "object") {
                $hook.extend(true, this.options, optionKey);
            }

            // Re-run _init to apply new options if necessary.
            // This might be a simplification; some widgets might need a more granular update.
            this._init();
            return this;
        },

        /**
         * Triggers a widget event.
         * @param {string} eventName The name of the event to trigger.
         * @param {object} [eventObj] The event object to pass.
         * @param {object} [uiData] UI-specific data to pass.
         * @private
         */
        _trigger: function( eventName, eventObj, uiData ) {
            const eventPrefix = this.eventTriggerPrefix ? this.eventTriggerPrefix + this.widgetShortName : this.widgetShortName;
            const finalEventName = ( eventPrefix + eventName ).toLowerCase();
            const eventData = $hook.extend({ type: finalEventName, target: this.element[0] }, eventObj );

            eventObj = eventObj || {};
            if ( eventObj.originalEvent ) {
                // Preserve original event if it exists.
                for ( let prop in eventObj.originalEvent ) {
                    if (Object.prototype.hasOwnProperty.call(eventObj.originalEvent, prop) && !(prop in eventObj)) {
                        eventObj[ prop ] = eventObj.originalEvent[ prop ];
                    }
                }
            }

            const elementTarget = this.element;
            let callbackResult = true;

            // Trigger the event on the widget's element.
            // The `trigger` method returns false if `preventDefault()` was called.
            elementTarget.trigger( eventData, uiData );

            // Check if a callback function exists in options and call it.
            const callback = this.options[ eventName ];
            if ( typeof callback === "function" ) {
                // Call the option callback. If it returns false, prevent default.
                if ( callback.apply( elementTarget[0], [ eventData ].concat(uiData) ) === false ) {
                    eventData.preventDefault();
                }
            }

            return !eventData.isDefaultPrevented();
        }
    };

})( jQuery );