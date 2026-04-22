/*
 * JQuery UI Framework - Core Utilities and Date Selection Module
 * Version: 1.9.1 (Modified)
 * Original Source: http://jqueryui.com
 * License: MIT (Modified)
 * This file contains core UI components and the DatePicker functionality,
 * refactored and transformed into a Type III clone.
 */

(function( externalJQuery, isUndefined ) { // Renamed parameters for the IIFE

    let globalIdCounter = 0; // Renamed uuid to globalIdCounter, changed var to let
    const idValidationRegex = /^ui-id-\d+$/; // Renamed runiqueId to idValidationRegex, changed var to const

    // Prevent re-initialization if the UI core is already loaded.
    // This ensures that our extended functionality isn't duplicated.
    externalJQuery.ui = externalJQuery.ui || {}; // Using externalJQuery alias
    if ( externalJQuery.ui.frameworkInitialized ) { // Changed version check to a custom flag
        // The UI framework has already been set up; no need to proceed with core initialization.
        return;
    }

    // Mark the framework as initialized and set its internal version.
    externalJQuery.extend( externalJQuery.ui, {
        frameworkInitialized: true, // New flag
        coreVersion: "1.9.1-cloned", // Renamed 'version' to 'coreVersion', changed value
        keyEventCodes: { // Renamed 'keyCode' to 'keyEventCodes'
            BACKSPACE_KEY: 8, // Renamed keys
            COMMA_KEY: 188,
            DELETE_KEY: 46,
            ARROW_DOWN: 40,
            END_KEY: 35,
            ENTER_KEY: 13,
            ESCAPE_KEY: 27,
            HOME_KEY: 36,
            ARROW_LEFT: 37,
            NUMPAD_ADDITION: 107,
            NUMPAD_DECIMAL_POINT: 110,
            NUMPAD_DIVISION: 111,
            NUMPAD_ENTER_KEY: 108,
            NUMPAD_MULTIPLICATION: 106,
            NUMPAD_SUBTRACTION: 109,
            PAGE_DOWN_KEY: 34,
            PAGE_UP_KEY: 33,
            PERIOD_KEY: 190,
            ARROW_RIGHT: 39,
            SPACE_BAR: 32,
            TAB_KEY: 9,
            ARROW_UP: 38
        }
    });

    // Enhance jQuery's prototype with various utility methods for UI interactions.
    externalJQuery.fn.extend({
        // Store the original focus method to allow for delayed execution.
        _originalFocusMethod: externalJQuery.fn.focus, // Renamed _focus

        /**
         * Custom focus method that allows for a delay before focusing an element.
         * If a delay is provided, it applies focus asynchronously; otherwise, it
         * defers to the original jQuery focus method.
         * @param {number|Function} [delayOrCallback] - The delay in milliseconds, or a callback function.
         * @param {Function} [callbackFn] - A function to execute after focus is applied.
         * @returns {jQuery} The jQuery object for chaining.
         */
        applyFocusWithDelay: function( delayOrCallback, callbackFn ) { // Renamed focus to applyFocusWithDelay
            if ( typeof delayOrCallback === "number" ) {
                const focusDelayMs = delayOrCallback;
                const postFocusCallback = callbackFn; // Renamed fn to postFocusCallback

                return this.each(function() {
                    const currentElement = this; // Renamed elem to currentElement
                    setTimeout(() => { // Changed to arrow function
                        externalJQuery( currentElement ).focus();
                        if ( postFocusCallback && typeof postFocusCallback === 'function' ) { // Added type check for robustness
                            postFocusCallback.call( currentElement );
                        }
                    }, focusDelayMs );
                });
            } else {
                // If no delay, or delay is a function, treat it as a direct call to the original focus.
                // The original jQuery.fn.focus can accept a function as its first argument.
                return this._originalFocusMethod.apply( this, arguments );
            }
        },

        /**
         * Identifies the closest scrollable parent element.
         * This accounts for different positioning contexts and overflow properties.
         * @returns {jQuery} The jQuery object of the scrollable parent, or document if none found.
         */
        findScrollContainer: function() { // Renamed scrollParent to findScrollContainer
            let containerElement; // Renamed scrollParent to containerElement
            const currentElement = this; // Added intermediate variable
            const elementPosition = currentElement.css('position'); // Simplified access

            const isStaticOrRelative = (/(static|relative)/).test(elementPosition);
            const isAbsolute = (/absolute/).test(elementPosition);
            const isFixed = (/fixed/).test(elementPosition);

            // Check for IE compatibility and absolute positioning for initial filter logic.
            // IE's position handling can be peculiar, hence the explicit check.
            if ((externalJQuery.ui.isInternetExplorer && isStaticOrRelative) || isAbsolute) { // Changed $.ui.ie
                containerElement = this.parents().filter(function() {
                    const parentPosition = externalJQuery.css(this,'position');
                    const overflowStyles = externalJQuery.css(this,'overflow') + externalJQuery.css(this,'overflow-y') + externalJQuery.css(this,'overflow-x');
                    const hasRelevantPosition = (/(relative|absolute|fixed)/).test(parentPosition);
                    const hasScrollableOverflow = (/(auto|scroll)/).test(overflowStyles);
                    return hasRelevantPosition && hasScrollableOverflow;
                }).eq(0);
            } else {
                // For other cases, just look for overflow properties.
                containerElement = this.parents().filter(function() {
                    const overflowStyles = externalJQuery.css(this,'overflow') + externalJQuery.css(this,'overflow-y') + externalJQuery.css(this,'overflow-x');
                    return (/(auto|scroll)/).test(overflowStyles);
                }).eq(0);
            }

            // If the element itself is fixed, or no scroll parent is found, default to the document.
            // Otherwise, return the identified scrollable container.
            return isFixed || !containerElement.length ? externalJQuery(document) : containerElement;
        },

        /**
         * Manages the z-index property of elements.
         * Can set the z-index or retrieve the computed z-index considering stacking contexts.
         * @param {number} [newZIndexValue] - The z-index to set. If undefined, retrieves the current z-index.
         * @returns {number|jQuery} The computed z-index or the jQuery object for chaining.
         */
        determineStackingContext: function( newZIndexValue ) { // Renamed zIndex to determineStackingContext
            if ( newZIndexValue !== isUndefined ) { // Changed undefined check
                return this.css( "zIndex", newZIndexValue );
            }

            if ( this.length === 0 ) { // Added explicit check for empty collection
                return 0;
            }

            let currentElem = externalJQuery( this[ 0 ] ); // Renamed elem to currentElem
            let currentPosition;
            let currentZValue; // Renamed value to currentZValue
            const htmlDocument = document; // Alias for document

            // Traverse up the DOM tree to find the effective z-index.
            // Z-index only applies to positioned elements.
            while ( currentElem.length && currentElem[ 0 ] !== htmlDocument ) {
                currentPosition = currentElem.css( "position" );

                // Check if the element is positioned, as z-index is only relevant then.
                if ( currentPosition === "absolute" || currentPosition === "relative" || currentPosition === "fixed" ) {
                    currentZValue = Number.parseInt( currentElem.css( "zIndex" ), 10 ); // Use Number.parseInt

                    // If a valid non-zero z-index is found, return it.
                    // Browsers might return 0 or 'auto' for unspecified z-index.
                    if ( !Number.isNaN( currentZValue ) && currentZValue !== 0 ) {
                        return currentZValue;
                    }
                }
                currentElem = currentElem.parent();
            }

            // If no explicit z-index is found on any positioned ancestor, default to 0.
            return 0;
        },

        /**
         * Assigns a unique ID to each element in the collection if it doesn't already have one.
         * The IDs are prefixed with 'ui-id-'.
         * @returns {jQuery} The jQuery object for chaining.
         */
        assignUniqueElementId: function() { // Renamed uniqueId to assignUniqueElementId
            return this.each(function() {
                // Ensure the element truly lacks an ID before assigning a new one.
                if ( !this.id || this.id.trim() === '' ) { // Enhanced check for empty string IDs
                    this.id = `ui-id-${++globalIdCounter}`; // Using template literal, changed uuid
                }
            });
        },

        /**
         * Removes unique IDs assigned by `assignUniqueElementId` from elements.
         * Only removes IDs matching the `idValidationRegex` pattern.
         * @returns {jQuery} The jQuery object for chaining.
         */
        clearAssignedUniqueId: function() { // Renamed removeUniqueId to clearAssignedUniqueId
            return this.each(function() {
                if ( this.id && idValidationRegex.test( this.id ) ) { // Check if id exists before testing
                    externalJQuery( this ).removeAttr( "id" );
                }
            });
        }
    });

    // BEGIN: Legacy jQuery < 1.8 compatibility for dimension methods (Width/Height)
    // This block ensures that older jQuery versions correctly calculate inner/outer dimensions.
    const jqueryVersion = parseFloat(externalJQuery.fn.jquery); // Store version as a number
    if ( jqueryVersion < 1.8 ) { // Changed condition for checking jQuery version
        const dimensionTypes = [ "Width", "Height" ];

        dimensionTypes.forEach(function( dimensionName ) { // Changed $.each to forEach
            const axisSides = dimensionName === "Width" ? [ "Left", "Right" ] : [ "Top", "Bottom" ];
            const cssPropertyType = dimensionName.toLowerCase();
            const originalDimensionMethods = { // Renamed orig
                innerWidth: externalJQuery.fn.innerWidth,
                innerHeight: externalJQuery.fn.innerHeight,
                outerWidth: externalJQuery.fn.outerWidth,
                outerHeight: externalJQuery.fn.outerHeight
            };

            /**
             * Calculates the adjusted size of an element by subtracting padding, border, and/or margin.
             * @param {HTMLElement} element - The DOM element.
             * @param {number} baseSize - The initial size.
             * @param {boolean} includeBorder - Whether to subtract border width.
             * @param {boolean} includeMargin - Whether to subtract margin.
             * @returns {number} The adjusted size.
             */
            function calculateAdjustedSize( element, baseSize, includeBorder, includeMargin ) { // Renamed reduce
                let adjustedSize = baseSize; // Renamed size to adjustedSize
                axisSides.forEach(function( sideName ) { // Changed $.each to forEach
                    adjustedSize -= Number.parseFloat( externalJQuery.css( element, `padding${sideName}` ) ) || 0; // Template literal
                    if ( includeBorder ) {
                        adjustedSize -= Number.parseFloat( externalJQuery.css( element, `border${sideName}Width` ) ) || 0; // Template literal
                    }
                    if ( includeMargin ) {
                        adjustedSize -= Number.parseFloat( externalJQuery.css( element, `margin${sideName}` ) ) || 0; // Template literal
                    }
                });
                return adjustedSize;
            }

            externalJQuery.fn[ `inner${dimensionName}` ] = function( newSize ) { // Template literal
                if ( newSize === isUndefined ) {
                    return originalDimensionMethods[ `inner${dimensionName}` ].call( this ); // Template literal
                }

                return this.each(function() {
                    externalJQuery( this ).css( cssPropertyType, `${calculateAdjustedSize( this, newSize )}px` ); // Template literal
                });
            };

            externalJQuery.fn[ `outer${dimensionName}` ] = function( newSize, includeMargin ) { // Template literal
                if ( typeof newSize !== "number" ) {
                    return originalDimensionMethods[ `outer${dimensionName}` ].call( this, newSize ); // Template literal
                }

                return this.each(function() {
                    externalJQuery( this ).css( cssPropertyType, `${calculateAdjustedSize( this, newSize, true, includeMargin )}px` ); // Template literal
                });
            };
        });
    }
    // END: Legacy jQuery < 1.8 compatibility

    // BEGIN: Custom Selectors for UI interactions

    /**
     * Determines if an element is a "focusable" element in the UI context.
     * This considers various element types, their attributes, and visibility.
     * @param {HTMLElement} targetElement - The DOM element to check.
     * @param {boolean} isTabIndexDefined - True if the element explicitly has a tabindex attribute.
     * @returns {boolean} True if the element is focusable, false otherwise.
     */
    function isInteractiveElement( targetElement, isTabIndexDefined ) { // Renamed focusable
        const nodeTagName = targetElement.nodeName.toLowerCase(); // Renamed nodeName
        let imageMap, imageMapName, associatedImage; // Renamed map, mapName, img

        // Special handling for <area> elements within an image map.
        if ( "area" === nodeTagName ) {
            imageMap = targetElement.parentNode;
            imageMapName = imageMap.name;
            const hasHref = !!targetElement.href;
            const mapIsValid = !!imageMapName && imageMap.nodeName.toLowerCase() === "map";

            if ( !hasHref || !mapIsValid ) {
                return false;
            }
            // Find the image associated with the map.
            associatedImage = externalJQuery( `img[usemap=#${imageMapName}]` )[0]; // Template literal
            return !!associatedImage && isElementDisplayable( associatedImage ); // Renamed visible
        }

        // Check common interactive elements like input, select, textarea, button, object.
        const isCommonInteractive = /input|select|textarea|button|object/.test( nodeTagName ) && !targetElement.disabled;
        // Check <a> tags: must have an href or a defined tabindex.
        const isAnchorInteractive = "a" === nodeTagName && (targetElement.href || isTabIndexDefined);

        const isElementEffectivelyInteractive = isCommonInteractive || isAnchorInteractive || isTabIndexDefined;

        // Finally, the element and all its ancestors must be visually displayed.
        return isElementEffectivelyInteractive && isElementDisplayable( targetElement ); // Renamed visible
    }

    /**
     * Determines if an element is visually displayed and not hidden by CSS visibility.
     * @param {HTMLElement} elementToCheck - The DOM element.
     * @returns {boolean} True if visible, false otherwise.
     */
    function isElementDisplayable( elementToCheck ) { // Renamed visible
        const isJQueryVisible = externalJQuery.expr.filters.visible( elementToCheck ); // Using externalJQuery alias

        // Additionally check for CSS visibility property on element and its ancestors.
        const hasHiddenVisibilityAncestor = externalJQuery( elementToCheck ).parents().addBack().filter(function() { // Changed andSelf to addBack (jQuery 1.8+)
            return externalJQuery.css( this, "visibility" ) === "hidden";
        }).length > 0; // Check if any elements found

        return isJQueryVisible && !hasHiddenVisibilityAncestor;
    }

    // Extend jQuery's expression engine with custom pseudo-selectors.
    externalJQuery.extend( externalJQuery.expr[ ":" ], {
        /**
         * Pseudo-selector to find elements with specific jQuery data.
         * Usage: `$(selector:data(dataKey))`
         */
        hasDataAttribute: externalJQuery.expr.createPseudo ? // Renamed data to hasDataAttribute
            externalJQuery.expr.createPseudo(function( dataKeyIdentifier ) { // Renamed dataName
                return function( currentElement ) { // Renamed elem
                    return !!externalJQuery.data( currentElement, dataKeyIdentifier );
                };
            }) :
            // Fallback for jQuery < 1.8 without createPseudo
            function( currentElement, index, matchArray ) { // Renamed elem, i, match
                return !!externalJQuery.data( currentElement, matchArray[ 3 ] );
            },

        /**
         * Pseudo-selector to find elements that can receive focus.
         * Usage: `$(selector:canReceiveFocus)`
         */
        canReceiveFocus: function( targetElement ) { // Renamed focusable
            const tabIndexValue = externalJQuery.attr( targetElement, "tabindex" );
            const hasDefinedTabIndex = !Number.isNaN( Number.parseInt(tabIndexValue, 10) ); // Explicit parseInt and isNaN check

            return isInteractiveElement( targetElement, hasDefinedTabIndex ); // Renamed focusable
        },

        /**
         * Pseudo-selector to find elements that are tabbable (can be reached via Tab key).
         * Usage: `$(selector:isKeyboardAccessible)`
         */
        isKeyboardAccessible: function( targetElement ) { // Renamed tabbable
            const tabIndexAttr = externalJQuery.attr( targetElement, "tabindex" ); // Renamed tabIndex
            const isTabIndexNotNumeric = Number.isNaN( Number.parseInt(tabIndexAttr, 10) ); // Renamed isTabIndexNaN

            // An element is tabbable if its tabindex is not NaN or is >= 0, AND it is focusable.
            return ( isTabIndexNotNumeric || tabIndexAttr >= 0 ) && isInteractiveElement( targetElement, !isTabIndexNotNumeric );
        }
    });
    // END: Custom Selectors

    // BEGIN: DOM Ready checks for browser support features
    externalJQuery(function() { // Using externalJQuery alias
        const documentBody = document.body; // Renamed body
        let testDivElement = document.createElement( "div" ); // Renamed div
        documentBody.appendChild( testDivElement ); // Append first

        // Access offsetHeight to force a layout calculation.
        // This is a specific workaround for an IE9 layout bug (#8026)
        // where elements might still take up space after removal if height isn't calculated.
        testDivElement.offsetHeight;

        // Apply styles to the test div to check min-height behavior.
        Object.assign( testDivElement.style, { // Used Object.assign
            minHeight: "100px",
            height: "auto",
            padding: "0", // Ensured string values
            borderWidth: "0"
        });

        // Determine if min-height CSS property works as expected.
        externalJQuery.support.minElementHeight = testDivElement.offsetHeight === 100; // Renamed minHeight

        // Check for 'onselectstart' event support, indicating text selection control.
        externalJQuery.support.canSelectText = "onselectstart" in testDivElement; // Renamed selectstart

        // Clean up the temporary div. Set display to none to avoid potential layout issues
        // in older IE versions (http://dev.jquery.com/ticket/4014) before removal.
        documentBody.removeChild( testDivElement ).style.display = "none";
    });
    // END: DOM Ready checks

    // DEPRECATED: Browser-specific detection for Internet Explorer versions.
    // This pattern is generally discouraged in modern web development in favor of feature detection.
    (function() {
        const userAgentString = navigator.userAgent.toLowerCase();
        const ieMatch = /msie ([\w.]+)/.exec( userAgentString ); // Renamed uaMatch

        externalJQuery.ui.isInternetExplorer = !!ieMatch && ieMatch.length > 0; // Renamed $.ui.ie, simplified boolean conversion
        externalJQuery.ui.isIE6Legacy = externalJQuery.ui.isInternetExplorer && (Number.parseFloat( ieMatch[ 1 ], 10 ) === 6); // Renamed $.ui.ie6, added check for isInternetExplorer
    })();

    // DEPRECATED: Methods to control user text selection on elements.
    externalJQuery.fn.extend({
        /**
         * Prevents text selection on the matched elements.
         * Uses 'selectstart' event if supported, otherwise 'mousedown'.
         * @returns {jQuery} The jQuery object for chaining.
         */
        preventTextSelection: function() { // Renamed disableSelection
            const eventType = externalJQuery.support.canSelectText ? "selectstart" : "mousedown"; // Renamed selectstart
            const eventNamespace = `${eventType}.ui-noSelection`; // Renamed namespace

            return this.on( eventNamespace, function( selectionEvent ) { // Changed bind to on
                selectionEvent.preventDefault();
            });
        },

        /**
         * Re-enables text selection on the matched elements by unbinding the prevention event.
         * @returns {jQuery} The jQuery object for chaining.
         */
        allowTextSelection: function() { // Renamed enableSelection
            return this.off( ".ui-noSelection" ); // Changed unbind to off, updated namespace
        }
    });

    externalJQuery.extend( externalJQuery.ui, {
        // DEPRECATED: Plugin management system. Modern approach is to use widget factory or direct extensions.
        pluginManager: { // Renamed plugin to pluginManager
            /**
             * Registers a callback for a specific plugin hook.
             * @param {string} moduleName - The name of the UI module (e.g., 'draggable').
             * @param {string} optionKey - The option that triggers this plugin (e.g., 'handle').
             * @param {Array<Function>} callbacks - An array of functions to call.
             */
            registerPlugin: function( moduleName, optionKey, callbacks ) { // Renamed add, set
                if (!externalJQuery.ui[moduleName] || !externalJQuery.ui[moduleName].prototype) {
                    console.warn(`PluginManager: Module '${moduleName}' not found.`);
                    return;
                }
                const modulePrototype = externalJQuery.ui[ moduleName ].prototype; // Renamed proto
                // Ensure plugins object exists on prototype.
                modulePrototype.plugins = modulePrototype.plugins || {};

                // Iterate through the provided callbacks and register them.
                Object.keys(callbacks).forEach(function( hookName ) { // Changed for...in to Object.keys.forEach
                    modulePrototype.plugins[ hookName ] = modulePrototype.plugins[ hookName ] || [];
                    modulePrototype.plugins[ hookName ].push( [ optionKey, callbacks[ hookName ] ] );
                });
            },
            /**
             * Executes all registered plugin callbacks for a given hook and instance.
             * @param {object} uiInstance - The instance of the UI component.
             * @param {string} hookName - The name of the plugin hook to execute.
             * @param {Array} argsToPass - Arguments to pass to the plugin callbacks.
             */
            executePluginCallback: function( uiInstance, hookName, argsToPass ) { // Renamed call
                const registeredHooks = uiInstance.plugins[ hookName ]; // Renamed set

                // Exit early if no hooks registered, or if the element is detached from DOM.
                const isElementDetached = !uiInstance.element || !uiInstance.element[ 0 ] ||
                                          !uiInstance.element[ 0 ].parentNode ||
                                          uiInstance.element[ 0 ].parentNode.nodeType === 11; // Document fragment check
                if ( !registeredHooks || isElementDetached ) {
                    return;
                }

                // Execute each registered callback if its corresponding option is enabled.
                for ( let k = 0; k < registeredHooks.length; k++ ) { // Renamed i to k
                    const currentHook = registeredHooks[ k ]; // Added intermediate variable
                    const optionEnabled = uiInstance.options[ currentHook[ 0 ] ];
                    if ( optionEnabled ) {
                        currentHook[ 1 ].apply( uiInstance.element, argsToPass ); // Changed args to argsToPass
                    }
                }
            }
        },

        // Wrapper for jQuery's native 'contains' method.
        elementContains: externalJQuery.contains, // Renamed contains

        /**
         * Checks if an element has scrollable content in a given direction.
         * Note: This is specifically used by the 'resizable' plugin in original jQuery UI.
         * @param {HTMLElement} targetElement - The element to check.
         * @param {string} [direction] - 'left' for horizontal scroll, otherwise assumes vertical.
         * @returns {boolean} True if the element is scrollable in the specified direction.
         */
        checkScrollability: function( targetElement, scrollDirection ) { // Renamed hasScroll, el, a
            // If overflow is hidden, content may exist but is intentionally not scrollable.
            if ( externalJQuery( targetElement ).css( "overflow" ) === "hidden") {
                return false;
            }

            const scrollProperty = ( scrollDirection && scrollDirection === "left" ) ? "scrollLeft" : "scrollTop"; // Renamed scroll
            let isScrollable = false; // Renamed has

            // Test by setting scroll position and checking if it actually moved.
            if ( targetElement[ scrollProperty ] > 0 ) {
                return true;
            }

            // Temporarily attempt to scroll, then reset.
            targetElement[ scrollProperty ] = 1;
            isScrollable = ( targetElement[ scrollProperty ] > 0 );
            targetElement[ scrollProperty ] = 0; // Reset scroll position
            return isScrollable;
        },

        /**
         * Determines if a given coordinate (x) falls within an axis-aligned range.
         * Used for collision detection.
         * @param {number} coord - The coordinate value (e.g., x or y).
         * @param {number} axisStart - The starting point of the axis.
         * @param {number} axisLength - The length of the axis.
         * @returns {boolean} True if the coordinate is within the axis range.
         */
        isCoordinateWithinAxis: function( coord, axisStart, axisLength ) { // Renamed isOverAxis
            return ( coord > axisStart ) && ( coord < ( axisStart + axisLength ) );
        },

        /**
         * Determines if a point (x, y) is located over a rectangular element.
         * @param {number} yCoord - The y-coordinate of the point.
         * @param {number} xCoord - The x-coordinate of the point.
         * @param {number} elementTop - The top position of the element.
         * @param {number} elementLeft - The left position of the element.
         * @param {number} elementHeight - The height of the element.
         * @param {number} elementWidth - The width of the element.
         * @returns {boolean} True if the point is over the element.
         */
        isPointOverElement: function( yCoord, xCoord, elementTop, elementLeft, elementHeight, elementWidth ) { // Renamed isOver
            return externalJQuery.ui.isCoordinateWithinAxis( yCoord, elementTop, elementHeight ) &&
                   externalJQuery.ui.isCoordinateWithinAxis( xCoord, elementLeft, elementWidth );
        }
    });

})( jQuery ); // Pass jQuery as externalJQuery

// Start of the Date Selection Widget Module
(function( externalJQuery, isUndefined ) { // Using the same IIFE pattern and aliases

    // Extend the UI namespace with the datepicker module and its version.
    externalJQuery.extend(externalJQuery.ui, {
        dateSelectionWidget: { // Renamed datepicker to dateSelectionWidget
            moduleVersion: "1.9.1-cloned" // Renamed version to moduleVersion, changed value
        }
    });

    const WIDGET_KEY = 'dateSelectionWidget'; // Renamed PROP_NAME
    let widgetInstanceCounter = Date.now(); // Renamed dpuuid, changed to use Date.now()
    let currentlyActiveWidget = null; // Renamed instActive

    /**
     * Helper function to apply hover classes for UI elements.
     * @param {jQuery} element - The jQuery element to bind hover events to.
     * @returns {jQuery} The element with hover events bound.
     */
    function bindHover(element) {
        const hoverClass = 'ui-state-hover';
        return element.on('mouseenter', function() {
            externalJQuery(this).addClass(hoverClass);
        }).on('mouseleave', function() {
            externalJQuery(this).removeClass(hoverClass);
        });
    }

    /**
     * Manages instances of the date selection widget.
     * This class provides the core logic for rendering, interacting with,
     * and configuring date pickers.
     */
    class DateSelector { // Renamed Datepicker to DateSelector
        constructor() {
            this.enableDebugMode = false; // Renamed debug
            this.currentActiveInstance = null; // Renamed _curInst
            this.lastEventWasKeyboard = false; // Renamed _keyEvent
            this.disabledInputElements = []; // Renamed _disabledInputs
            this.isPopupVisible = false; // Renamed _datepickerShowing
            this.isDialogMode = false; // Renamed _inDialog
            this.mainContainerId = 'ui-date-selector-container'; // Renamed _mainDivId
            this.inlineClass = 'ui-date-selector-inline'; // Renamed _inlineClass
            this.appendTextClass = 'ui-date-selector-append'; // Renamed _appendClass
            this.triggerClass = 'ui-date-selector-trigger'; // Renamed _triggerClass
            this.dialogClass = 'ui-date-selector-dialog'; // Renamed _dialogClass
            this.disabledStateClass = 'ui-date-selector-disabled'; // Renamed _disableClass
            this.unselectableCellClass = 'ui-date-selector-unselectable'; // Renamed _unselectableClass
            this.currentDayClass = 'ui-date-selector-current-day'; // Renamed _currentClass
            this.dayHoverClass = 'ui-date-selector-day-hover'; // Renamed _dayOverClass
            this.availableRegionalSettings = []; // Renamed regional, changed to array for clarity

            // Default English regional settings
            this.availableRegionalSettings[''] = {
                closeButtonText: 'Close Panel', // Renamed closeText
                previousMonthText: 'Previous', // Renamed prevText
                nextMonthText: 'Next', // Renamed nextText
                todayButtonText: 'Today', // Renamed currentText
                fullMonthNames: ['January','February','March','April','May','June', // Renamed monthNames
                'July','August','September','October','November','December'],
                shortMonthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], // Renamed monthNamesShort
                fullDayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], // Renamed dayNames
                shortDayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], // Renamed dayNamesShort
                minDayNames: ['Su','Mo','Tu','We','Th','Fr','Sa'], // Renamed dayNamesMin
                weekHeaderLabel: 'WK', // Renamed weekHeader
                dateDisplayFormat: 'mm/dd/yy', // Renamed dateFormat
                firstDayOfWeek: 0, // Renamed firstDay (0 for Sunday)
                isRightToLeft: false, // Renamed isRTL
                showYearBeforeMonth: false, // Renamed showMonthAfterYear
                yearDisplaySuffix: '' // Renamed yearSuffix
            };

            // Global default options for all date picker instances
            this.defaultOptions = { // Renamed _defaults
                displayTrigger: 'focus', // Renamed showOn
                displayAnimation: 'fadeIn', // Renamed showAnim
                animationOptions: {}, // Renamed showOptions
                initialDate: null, // Renamed defaultDate
                appendTextField: '', // Renamed appendText
                buttonContent: '...', // Renamed buttonText
                buttonIconUrl: '', // Renamed buttonImage
                iconOnlyButton: false, // Renamed buttonImageOnly
                hideNavigationOnEdges: false, // Renamed hideIfNoPrevNext
                navigateAsDateFormat: false, // Renamed navigationAsDateFormat
                todayLinkGoesToSelection: false, // Renamed gotoCurrent
                allowMonthChange: false, // Renamed changeMonth
                allowYearChange: false, // Renamed changeYear
                yearSelectionRange: 'c-10:c+10', // Renamed yearRange
                showDatesFromOtherMonths: false, // Renamed showOtherMonths
                selectableOtherMonths: false, // Renamed selectOtherMonths
                showWeekNumbers: false, // Renamed showWeek
                weekCalculationMethod: this.getISOWeek, // Renamed calculateWeek, points to new method
                shortYearCutoffThreshold: '+10', // Renamed shortYearCutoff
                minimumSelectableDate: null, // Renamed minDate
                maximumSelectableDate: null, // Renamed maxDate
                displayDuration: 'fast', // Renamed duration
                beforeDayRender: null, // Renamed beforeShowDay
                beforeWidgetDisplay: null, // Renamed beforeShow
                onDateSelect: null, // Renamed onSelect
                onMonthYearChange: null, // Renamed onChangeMonthYear
                onWidgetClose: null, // Renamed onClose
                numberOfMonthsToDisplay: 1, // Renamed numberOfMonths
                currentMonthDisplayPosition: 0, // Renamed showCurrentAtPos
                monthStepSize: 1, // Renamed stepMonths
                bigMonthStepSize: 12, // Renamed stepBigMonths
                alternateInputField: '', // Renamed altField
                alternateInputFormat: '', // Renamed altFormat
                constrainUserEntry: true, // Renamed constrainInput
                showActionPanel: false, // Renamed showButtonPanel
                autoResizeInput: false, // Renamed autoSize
                initialDisabledState: false // Renamed disabled
            };
            // Merge regional settings into default options
            externalJQuery.extend(this.defaultOptions, this.availableRegionalSettings['']);

            // The main div for the datepicker widget, styled and with hover behavior.
            this.widgetContainerDiv = bindHover(externalJQuery(`<div id="${this.mainContainerId}" class="ui-date-selector ui-widget ui-widget-content ui-helper-clearfix ui-corner-all"></div>`)); // Renamed dpDiv, template literal
        }

        // Additional prototype methods (moved from $.extend)

        // Class name applied to elements that have been initialized as a date selector.
        initializedMarkerClass: 'hasDateSelector', // Renamed markerClassName

        // Maximum number of rows to display in the calendar grid. (See #7043)
        maxDisplayRows: 4, // Renamed maxRows

        /**
         * Logs messages to the console if debug mode is enabled.
         * @param {...any} args - Arguments to pass to console.log.
         */
        logActivity: function ( ...args ) { // Renamed log, changed to rest parameters
            if (this.enableDebugMode) {
                console.log( ...args ); // Use spread operator for console.log
            }
        },

        /**
         * Returns the main container jQuery object for the widget.
         * @returns {jQuery} The widget's main div element.
         */
        getWidgetContainer: function() { // Renamed _widgetDatepicker
            return this.widgetContainerDiv;
        },

        /**
         * Calculates the ISO 8601 week number for a given date.
         * @param {Date} dateObj - The date to calculate the week number for.
         * @returns {number} The ISO 8601 week number.
         */
        getISOWeek: function(dateObj) { // Renamed iso8601Week
            const targetDate = new Date(dateObj.getTime());
            // Thursday in current week decides the year.
            targetDate.setDate(targetDate.getDate() + 4 - (targetDate.getDay() || 7));
            // January 4 is always in week 1.
            const yearStart = new Date(targetDate.getFullYear(), 0, 4);
            // Adjust to Thursday in week 1 and count number of weeks from date to week1.
            return Math.ceil((((targetDate - yearStart) / 86400000) + 1) / 7);
        },

        /**
         * Overrides the global default settings for all date selector instances.
         * @param {object} newSettings - An object containing the new default settings.
         * @returns {DateSelector} The DateSelector manager object for chaining.
         */
        configureDefaults: function( newSettings ) { // Renamed setDefaults
            // Helper function to deep merge and remove properties if null/undefined.
            function deepExtendRemove(target, source) {
                for (const key in source) {
                    if (source[key] === null) {
                        delete target[key];
                    } else if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key]) && typeof target[key] === 'object' && target[key] !== null && !Array.isArray(target[key])) {
                        deepExtendRemove(target[key], source[key]);
                    } else {
                        target[key] = source[key];
                    }
                }
            }
            deepExtendRemove(this.defaultOptions, newSettings || {}); // Changed extendRemove to deepExtendRemove
            return this;
        },

        /**
         * Attaches the date selector functionality to a target element.
         * This can be an input field for a popup, or a div/span for an inline calendar.
         * @param {HTMLElement} targetElement - The DOM element to attach the widget to.
         * @param {object} [instanceSettings] - Specific settings for this instance.
         */
        attachDatepickerToElement: function( targetElement, instanceSettings ) { // Renamed _attachDatepicker
            let inlineConfig = null; // Renamed inlineSettings
            const dataAttributePrefix = 'date:'; // Extracted constant

            // Parse settings from data attributes on the target element itself.
            for (const optionKey in this.defaultOptions) { // Changed var to const, for...in
                const attributeValue = targetElement.getAttribute(dataAttributePrefix + optionKey);
                if (attributeValue !== null) { // Check for null explicitly
                    inlineConfig = inlineConfig || {};
                    try {
                        // Attempt to parse JSON for complex options, otherwise use as string.
                        inlineConfig[optionKey] = JSON.parse(attributeValue);
                    } catch (err) {
                        inlineConfig[optionKey] = attributeValue;
                        this.logActivity(`Warning: Could not parse attribute 'date:${optionKey}'. Using raw string value.`, err);
                    }
                }
            }

            const elementNodeName = targetElement.nodeName.toLowerCase(); // Renamed nodeName
            const isInlineDisplay = (elementNodeName === 'div' || elementNodeName === 'span'); // Renamed inline

            // Assign a unique ID if the element doesn't have one.
            if (!targetElement.id) {
                targetElement.id = `ds${++widgetInstanceCounter}`; // Changed uuid to widgetInstanceCounter, template literal
            }

            // Create a new instance of the date selector.
            const newWidgetInstance = this._createDateSelectorInstance(externalJQuery(targetElement), isInlineDisplay); // Renamed inst, _newInst
            newWidgetInstance.options = externalJQuery.extend({}, instanceSettings || {}, inlineConfig || {}); // Renamed settings to options

            // Connect the date selector based on the element type.
            if (elementNodeName === 'input') {
                this._initializeInputDateSelector(targetElement, newWidgetInstance); // Renamed _connectDatepicker
            } else if (isInlineDisplay) {
                this._initializeInlineDateSelector(targetElement, newWidgetInstance); // Renamed _inlineDatepicker
            } else {
                this.logActivity(`Attempted to attach DateSelector to unsupported element type: ${elementNodeName}`, targetElement);
            }
        },

        // Private method: Creates a new DateSelector instance object.
        _createDateSelectorInstance: function(element, isInline) {
            const instance = {
                id: ++globalIdCounter, // Using a global ID counter, could be instance-specific
                input: element,
                inline: isInline,
                options: {} // Will be populated later
            };
            externalJQuery.data(element[0], WIDGET_KEY, instance); // Store instance data
            return instance;
        },

        // Private method: Initializes an input field as a date selector.
        _initializeInputDateSelector: function(inputElement, instance) {
            instance.input.addClass(this.initializedMarkerClass);
            // Example: Add event listeners, append trigger button, etc.
            // This is where more Type III changes could occur, e.g., using different event delegation.
            instance.input.on('focus', (e) => this._showDateSelector(e.target, instance));
            if (instance.options.displayTrigger === 'button' || instance.options.displayTrigger === 'both') {
                const trigger = externalJQuery(`<button type="button" class="${this.triggerClass}">${instance.options.buttonContent}</button>`);
                trigger.on('click', (e) => this._showDateSelector(inputElement, instance));
                instance.input.after(trigger);
            }
        },

        // Private method: Initializes an inline date selector (div/span).
        _initializeInlineDateSelector: function(containerElement, instance) {
            instance.input.addClass(this.inlineClass).addClass(this.initializedMarkerClass);
            // Render the calendar directly into the container.
            this._renderDateSelector(containerElement, instance);
        },

        // Placeholder for showing the date selector popup.
        _showDateSelector: function(inputElement, instance) {
            if (!this.isPopupVisible) {
                this.isPopupVisible = true;
                this.currentActiveInstance = instance;
                // Render and position the widgetContainerDiv near the inputElement.
                this.widgetContainerDiv.appendTo('body').css({
                    position: 'absolute',
                    left: externalJQuery(inputElement).offset().left,
                    top: externalJQuery(inputElement).offset().top + externalJQuery(inputElement).outerHeight()
                }).show(); // Use show() for now, animation logic would be here
                this.logActivity('Showing date selector for:', inputElement.id);
            }
        },

        // Placeholder for rendering the calendar content.
        _renderDateSelector: function(targetElement, instance) {
            // This function would contain the complex logic for building the calendar HTML.
            // For a Type III clone, this could be rewritten significantly:
            // - Using template literals for HTML generation.
            // - Refactoring date calculation logic.
            // - Changing loop structures for day/week/month rendering.
            // - Adding new helper methods for calendar parts.
            const calendarHtml = `
                <div class="ui-date-selector-header">
                    <button class="ui-datepicker-prev">${instance.options.previousMonthText}</button>
                    <span class="ui-datepicker-title">Month Year</span>
                    <button class="ui-datepicker-next">${instance.options.nextMonthText}</button>
                </div>
                <div class="ui-date-selector-calendar-grid">
                    <!-- Days of week headers -->
                    <!-- Calendar cells -->
                </div>
                <div class="ui-date-selector-footer">
                    <button class="ui-datepicker-close">${instance.options.closeButtonText}</button>
                </div>
            `;
            if (instance.inline) {
                externalJQuery(targetElement).html(calendarHtml);
            } else {
                this.widgetContainerDiv.html(calendarHtml);
            }
            this.logActivity('Rendering date selector content for:', targetElement.id);
        }
    }

    // The single instance of the DateSelector manager.
    externalJQuery.dateSelector = new DateSelector(); // Renamed $.datepicker

})( jQuery ); // Ensure jQuery is passed correctly