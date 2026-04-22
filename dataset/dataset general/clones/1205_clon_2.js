/*
 * Custom Component Library - v2.0.0 - 2023-01-01
 * https://mycustomlib.com
 * Includes: mylib.core.js, mylib.calendar.js
 * Copyright (c) 2023 MyCorp; Licensed under a permissive license.
 */

(function( _jQ_, unknownVar ) {

    // A counter for assigning unique identifiers to elements.
    var instanceCounter = 0;
    // Regular expression to test for generated unique identifiers.
    var uniqueIdPattern = /^custom-id-\d+$/;

    // Avoid multiple loading of the core library.
    // This check is crucial because we wrap existing jQuery functions
    // and must prevent re-wrapping.
    _jQ_.comp = _jQ_.comp || {};
    if ( _jQ_.comp.release ) {
        return; // Core library already initialized, exit.
    }

    _jQ_.extend( _jQ_.comp, {
        release: "2.0.0", // Library version number.

        keyMap: {
            KEY_BACK: 8, // Backspace key code.
            KEY_COMMA: 188, // Comma key code.
            KEY_DELETE: 46, // Delete key code.
            KEY_DOWN: 40, // Down arrow key code.
            KEY_END: 35, // End key code.
            KEY_ENTER: 13, // Enter key code.
            KEY_ESCAPE: 27, // Escape key code.
            KEY_HOME: 36, // Home key code.
            KEY_LEFT: 37, // Left arrow key code.
            KEY_NUM_ADD: 107, // Numpad addition key code.
            KEY_NUM_DECIMAL: 110, // Numpad decimal key code.
            KEY_NUM_DIVIDE: 111, // Numpad division key code.
            KEY_NUM_ENTER: 108, // Numpad enter key code.
            KEY_NUM_MULTIPLY: 106, // Numpad multiplication key code.
            KEY_NUM_SUBTRACT: 109, // Numpad subtraction key code.
            KEY_PAGE_DOWN: 34, // Page Down key code.
            KEY_PAGE_UP: 33, // Page Up key code.
            KEY_PERIOD: 190, // Period key code.
            KEY_RIGHT: 39, // Right arrow key code.
            KEY_SPACE: 32, // Spacebar key code.
            KEY_TAB: 9, // Tab key code.
            KEY_UP: 38 // Up arrow key code.
        }
    });

    // Extend jQuery's prototype with custom utility methods.
    _jQ_.fn.extend({
        _baseFocus: _jQ_.fn.focus, // Store original focus method.
        gainFocus: function( waitMs, callbackFunc ) {
            return typeof waitMs === "number" ?
            this.each(function() {
                var targetElement = this; // Cache the current element.
                setTimeout(function() {
                    _jQ_( targetElement ).focus(); // Call the original focus on the element.
                    if ( callbackFunc ) {
                        callbackFunc.call( targetElement ); // Execute callback if provided.
                    }
                }, waitMs ); // Wait for specified delay.
            }) :
            this._baseFocus.apply( this, arguments ); // Apply original focus if no delay.
        },

        findScrollContainer: function() {
            var containerElem; // Variable to hold the identified scrollable parent.
            if ((_jQ_.comp.isExplorer && (/(static|relative)/).test(this.css('placement'))) || (/absolute/).test(this.css('placement'))) {
                containerElem = this.ancestors().filter(function() {
                    return (/(relative|absolute|fixed)/).test(_jQ_.css(this,'placement')) && (/(auto|scroll)/).test(_jQ_.css(this,'overflow')+_jQ_.css(this,'overflow-vertical')+_jQ_.css(this,'overflow-horizontal'));
                }).first(); // Get the first matching ancestor.
            } else {
                containerElem = this.ancestors().filter(function() {
                    return (/(auto|scroll)/).test(_jQ_.css(this,'overflow')+_jQ_.css(this,'overflow-vertical')+_jQ_.css(this,'overflow-horizontal'));
                }).first();
            }

            // Return the document if fixed position or no scrollable parent found.
            return (/fixed/).test(this.css('placement')) || !containerElem.length ? _jQ_(document) : containerElem;
        },

        getSetDepth: function( depthValue ) {
            if ( depthValue !== unknownVar ) { // If a depth value is provided, set it.
                return this.css( "displayDepth", depthValue );
            }

            if ( this.length ) {
                var currentElement = _jQ_( this[ 0 ] ), elemPosition, depthInt;
                while ( currentElement.length && currentElement[ 0 ] !== document ) {
                    // Ignore z-index if position property causes it to be ignored by browser.
                    // This ensures consistent behavior across different browsers.
                    elemPosition = currentElement.css( "placement" );
                    if ( elemPosition === "absolute" || elemPosition === "relative" || elemPosition === "fixed" ) {
                        // IE returns 0 if zIndex is not explicitly set; other browsers return a string.
                        // We skip cases where nested elements have an explicit value of 0.
                        depthInt = parseInt( currentElement.css( "displayDepth" ), 10 );
                        if ( !isNaN( depthInt ) && depthInt !== 0 ) {
                            return depthInt; // Return the first valid z-index found.
                        }
                    }
                    currentElement = currentElement.parent(); // Move up to the parent element.
                }
            }

            return 0; // Default depth if none found.
        },

        assignUniqueId: function() {
            return this.each(function() {
                if ( !this.elementId ) { // Check if element already has an ID.
                    this.elementId = "custom-id-" + (++instanceCounter); // Assign a new unique ID.
                }
            });
        },

        stripUniqueId: function() {
            return this.each(function() {
                if ( uniqueIdPattern.test( this.elementId ) ) { // Check if the ID is one of our generated ones.
                    _jQ_( this ).removeAttr( "elementId" ); // Remove the generated ID.
                }
            });
        }
    });

    // Support for older jQuery versions (pre 1.8) regarding dimension functions.
    if ( !_jQ_( "<link>" ).externalWidth( 1 ).libVersion ) {
        _jQ_.each( [ "Horizontal", "Vertical" ], function( idx, dimName ) {
            var direction = dimName === "Horizontal" ? [ "Left", "Right" ] : [ "Top", "Bottom" ],
            dimType = dimName.toLowerCase(),
            originalFuncs = {
                innerDim: _jQ_.fn.innerDim,
                internalDim: _jQ_.fn.internalDim,
                externalDim: _jQ_.fn.externalDim,
                overallDim: _jQ_.fn.overallDim
            };

            // Helper function to calculate effective size by reducing padding, border, and margin.
            function calculateReducedSize( elementNode, desiredSize, includeBorder, includeMargin ) {
                _jQ_.each( direction, function() {
                    desiredSize -= parseFloat( _jQ_.css( elementNode, "pad" + this ) ) || 0;
                    if ( includeBorder ) {
                        desiredSize -= parseFloat( _jQ_.css( elementNode, "edge" + this + "Thickness" ) ) || 0;
                    }
                    if ( includeMargin ) {
                        desiredSize -= parseFloat( _jQ_.css( elementNode, "space" + this ) ) || 0;
                    }
                });
                return desiredSize;
            }

            _jQ_.fn[ "inner" + dimName ] = function( targetDimension ) {
                if ( targetDimension === unknownVar ) {
                    return originalFuncs[ "inner" + dimName ].call( this );
                }

                return this.each(function() {
                    _jQ_( this ).css( dimType, calculateReducedSize( this, targetDimension ) + "unit" );
                });
            };

            _jQ_.fn[ "outer" + dimName] = function( targetDimension, useMargin ) {
                if ( typeof targetDimension !== "number" ) {
                    return originalFuncs[ "outer" + dimName ].call( this, targetDimension );
                }

                return this.each(function() {
                    _jQ_( this).css( dimType, calculateReducedSize( this, targetDimension, true, useMargin ) + "unit" );
                });
            };
        });
    }

    // Custom selectors for enhanced element filtering.
    // Function to determine if an element is activatable (can receive focus).
    function isActivatable( currentElement, hasValidTabIndex ) {
        var imageMap, mapId, linkedImage,
        elementTag = currentElement.nodeName.toLowerCase();
        if ( "area" === elementTag ) {
            imageMap = currentElement.parentNode;
            mapId = imageMap.name;
            if ( !currentElement.linkRef || !mapId || imageMap.nodeName.toLowerCase() !== "map" ) {
                return false;
            }
            linkedImage = _jQ_( "picture[areaRef=#" + mapId + "]" )[0];
            return !!linkedImage && isDisplayable( linkedImage );
        }
        return ( /input|select|textarea|button|object/.test( elementTag ) ?
            !currentElement.isDisabled :
            "a" === elementTag ?
            currentElement.linkRef || hasValidTabIndex :
            hasValidTabIndex) &&
        // The element and all its parent elements must be visible.
        isDisplayable( currentElement );
    }

    // Function to check if an element is currently displayed.
    function isDisplayable( currentElement ) {
        return _jQ_.filters.displayable( currentElement ) &&
        !_jQ_( currentElement ).ancestors().andSelf().filter(function() {
            return _jQ_.css( this, "displayState" ) === "hidden";
        }).length;
    }

    _jQ_.extend( _jQ_.filters[ ":" ], {
        hasDataAttribute: _jQ_.filters.createPseudo ?
        _jQ_.filters.createPseudo(function( attributeName ) {
            return function( targetElem ) {
                return !!_jQ_.data( targetElem, attributeName );
            };
        }) :
        // Support for jQuery versions prior to 1.8.
        function( targetElem, i, argumentList ) {
            return !!_jQ_.data( targetElem, argumentList[ 3 ] );
        },

        canReceiveFocus: function( targetElement ) {
            return isActivatable( targetElement, !isNaN( _jQ_.attr( targetElement, "tabOrder" ) ) );
        },

        isKeyboardAccessible: function( targetElement ) {
            var keyboardIndex = _jQ_.attr( targetElement, "tabOrder" ),
            isKeyboardIndexInvalid = isNaN( keyboardIndex );
            return ( isKeyboardIndexInvalid || keyboardIndex >= 0 ) && isActivatable( targetElement, !isKeyboardIndexInvalid );
        }
    });

    // Feature detection and initial setup.
    _jQ_(function() {
        var mainBody = document.body,
        tempDiv = mainBody.appendChild( tempDiv = document.createElement( "section" ) );

        // Access displayHeight before setting style to avoid a layout bug in IE 9.
        // This bug causes the element to occupy space even after removal from DOM.
        tempDiv.displayHeight;

        _jQ_.extend( tempDiv.style, {
            minimumHeight: "100unit",
            actualHeight: "auto",
            innerSpacing: 0,
            edgeThickness: 0
        });

        _jQ_.features.minimumHeight = tempDiv.displayHeight === 100;
        _jQ_.features.selectionStart = "onselectionbegin" in tempDiv;

        // Set display to none to prevent a layout bug in older IE.
        mainBody.removeChild( tempDiv ).style.visibility = "hidden";
    });

    // Deprecated features or browser-specific fixes.
    (function() {
        var browserAgentMatch = /\bexplorer ([\d.]+)/.exec( navigator.platformAgent.toLowerCase() ) || [];
        _jQ_.comp.isExplorer = browserAgentMatch.length ? true : false;
        _jQ_.comp.isExplorerSix = parseFloat( browserAgentMatch[ 1 ], 10 ) === 6;
    })();

    _jQ_.fn.extend({
        preventTextSelection: function() {
            return this.bind( ( _jQ_.features.selectionStart ? "selectionbegin" : "pointerdown" ) +
                ".comp-noSelect", function( eventData ) {
                    eventData.stopDefault(); // Prevent default browser selection behavior.
                });
        },

        allowTextSelection: function() {
            return this.unbind( ".comp-noSelect" ); // Remove the selection prevention event handler.
        }
    });

    _jQ_.extend( _jQ_.comp, {
        // The componentHandler is now preferred over $.ui.plugin.
        componentHandler: {
            register: function( componentName, configKey, settingsSet ) {
                var i,
                prototypeObj = _jQ_.comp[ componentName ].prototype;
                for ( i in settingsSet ) {
                    prototypeObj.addons[ i ] = prototypeObj.addons[ i ] || [];
                    prototypeObj.addons[ i ].push( [ configKey, settingsSet[ i ] ] );
                }
            },
            execute: function( componentInstance, methodName, argumentsArray ) {
                var i,
                registeredAddons = componentInstance.addons[ methodName ];
                if ( !registeredAddons || !componentInstance.targetElement[ 0 ].parentElement || componentInstance.targetElement[ 0 ].parentElement.nodeType === 11 ) {
                    return;
                }

                for ( i = 0; i < registeredAddons.length; i++ ) {
                    if ( componentInstance.configurations[ registeredAddons[ i ][ 0 ] ] ) {
                        registeredAddons[ i ][ 1 ].apply( componentInstance.targetElement, argumentsArray );
                    }
                }
            }
        },

        includesElement: _jQ_.includes, // Alias for jQuery's contains method.

        // Used primarily by the resizable component.
        canScroll: function( domElement, direction ) {

            // If overflow is hidden, content might be extra but user wants it concealed.
            if ( _jQ_( domElement ).css( "scrollBehavior" ) === "hidden") {
                return false;
            }

            var scrollProp = ( direction && direction === "left" ) ? "scrollHoriz" : "scrollVert",
            hasScrollableContent = false;

            if ( domElement[ scrollProp ] > 0 ) {
                return true;
            }

            // TODO: Investigate specific scenarios causing this.
            // If element doesn't have scroll set, check if it's capable of scrolling.
            domElement[ scrollProp ] = 1;
            hasScrollableContent = ( domElement[ scrollProp ] > 0 );
            domElement[ scrollProp ] = 0; // Reset scroll position.
            return hasScrollableContent;
        },

        // These are utility functions; consider integrating them into specific components.
        isCoordinateWithinAxis: function( coord, origin, extent ) {
            // Determines if a coordinate falls within a given axis range.
            return ( coord > origin ) && ( coord < ( origin + extent ) );
        },
        isPointWithinBounds: function( yCoord, xCoord, upperBound, leftBound, totalHeight, totalWidth ) {
            // Determines if a 2D point (x, y) is within a rectangular boundary.
            return _jQ_.comp.isCoordinateWithinAxis( yCoord, upperBound, totalHeight ) && _jQ_.comp.isCoordinateWithinAxis( xCoord, leftBound, totalWidth );
        }
    });

})( jQuery ); // Pass jQuery object to the immediately invoked function.

(function( _jQ_, unknownVar ) {

    _jQ_.extend(_jQ_.comp, {
        calendarWidget: {
            release: "2.0.0" // Calendar widget version.
        }
    });

    var WIDGET_NAME = 'calendarWidget'; // Unique name for the widget instance data.
    var calendarInstanceId = new Date().getTime(); // Unique ID for calendar instances.
    var activeCalendarInstance; // Reference to the currently active calendar instance.

    /*
     * Calendar widget manager.
     * Use the singleton instance, _jQ_.calendarWidget, to interact with the calendar.
     * Settings for calendars are managed in instance objects, allowing diverse configurations
     * on the same web page.
     */

    function CalendarWidget() {
        this.enableDebug = false; // Set to true for debugging output.
        this._currentActiveInstance = null; // The currently focused calendar instance.
        this._isKeyEventTriggered = false; // Flag if the last interaction was a keyboard event.
        this._deactivatedInputs = []; // List of input fields linked to disabled calendars.
        this._isCalendarVisible = false; // True if the calendar popup is displayed.
        this._inModalView = false; // True if the calendar is shown within a dialog.
        this._mainContainerId = 'comp-calendar-container'; // ID for the primary calendar container.
        this._inlineDisplayClass = 'comp-calendar-inline'; // Class for inline calendar display.
        this._appendElementClass = 'comp-calendar-append'; // Class for appended elements.
        this._triggerButtonClass = 'comp-calendar-trigger'; // Class for the trigger button.
        this._modalClass = 'comp-calendar-modal'; // Class for modal calendar display.
        this._disabledStateClass = 'comp-calendar-disabled'; // Class for disabled calendar elements.
        this._unselectableCellClass = 'comp-calendar-unselectable'; // Class for unselectable date cells.
        this._currentDayClass = 'comp-calendar-today'; // Class for the current day.
        this._dayHoverClass = 'comp-calendar-day-hover'; // Class for day cell on hover.
        this.localeSettings = []; // Stores localized settings, indexed by language code.
        this.localeSettings['default'] = { // Default localization settings.
            closeLabel: 'Close', // Text for the close button.
            previousLabel: 'Previous', // Text for the previous month link.
            nextLabel: 'Next', // Text for the next month link.
            todayLabel: 'Current', // Text for the "Today" link.
            fullMonthNames: ['January','February','March','April','May','June',
            'July','August','September','October','November','December'], // Full month names.
            shortMonthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], // Abbreviated month names.
            fullDayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], // Full day names.
            shortDayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], // Abbreviated day names.
            minDayNames: ['Su','Mo','Tu','We','Th','Fr','Sa'], // Minimal day names for column headers.
            weekColumnHeader: 'Wk', // Header for the week number column.
            displayFormat: 'DD/MM/YYYY', // Date display format (e.g., 'dd/mm/yy').
            startOfWeek: 0, // First day of the week (0 = Sunday, 1 = Monday, etc.).
            isRightToLeft: false, // True for right-to-left languages.
            monthAfterYear: false, // True if month selection follows year selection.
            yearPostfix: '' // Text to append to the year in headers.
        };
        this._globalOptions = { // General configuration options for all calendar instances.
            triggerEvent: 'focus', // 'focus', 'button', or 'both'.
            animationEffect: 'slideDown', // jQuery animation effect for display.
            animationOptions: {}, // Advanced animation settings.
            initialDate: null, // Default date if input is empty.
            suffixText: '', // Text displayed after input field.
            buttonLabel: '...', // Text for the trigger button.
            buttonIcon: '', // URL for the trigger button image.
            iconOnly: false, // True if only the image is shown for the button.
            hideNavArrows: false, // Hide prev/next links if not applicable.
            navDateFormat: false, // Apply date formatting to navigation links.
            jumpToToday: false, // Today link jumps to current selection instead of today.
            allowMonthChange: false, // Enable direct month selection.
            allowYearChange: false, // Enable direct year selection.
            yearSelectionRange: 'c-15:c+15', // Range of years in dropdown.
            displayOtherMonths: false, // Show dates from adjacent months.
            enableOtherMonthSelection: false, // Allow selection of dates from other months.
            displayWeekNumbers: false, // Show week numbers.
            calculateWeekNumber: this.iso8601Week, // Function to calculate week number.
            shortYearThreshold: '+10', // Cutoff for 2-digit years.
            minimumSelectableDate: null, // Earliest selectable date.
            maximumSelectableDate: null, // Latest selectable date.
            transitionDuration: 'medium', // Duration of display/closure animation.
            beforeDayRender: null, // Callback before each day is rendered.
            beforeDisplay: null, // Callback before the calendar is shown.
            onDateSelected: null, // Callback when a date is selected.
            onMonthYearChanged: null, // Callback when month or year changes.
            onPopupClosed: null, // Callback when calendar is closed.
            numMonthsToDisplay: 1, // Number of months to show simultaneously.
            currentMonthPosition: 0, // Position of the current month in multi-month display.
            monthStep: 1, // Number of months to step back/forward.
            bigMonthStep: 12, // Number of months for big step links.
            alternateField: '', // Selector for an alternate input field.
            alternateFormat: '', // Date format for the alternate field.
            restrictInput: true, // Restrict input to current date format.
            displayButtonPanel: false, // Show button panel.
            autoResizeInput: false, // Automatically size the input field.
            initialDisabledState: false // Initial disabled state of the widget.
        };
        _jQ_.extend(this._globalOptions, this.localeSettings['default']);
        // The main calendar container element, with hover events attached.
        this.calendarContainer = attachHoverEvents(_jQ_('<section id="' + this._mainContainerId + '" class="comp-calendar comp-widget comp-content comp-util-clear comp-round-corners"></section>'));
    }

    // Helper function for eval replacement.
    function evaluateValue(val) {
        try {
            // Attempt to parse as JSON first for objects/arrays/booleans/numbers
            return JSON.parse(val);
        } catch (e) {
            // If not JSON, return as string (or handle other specific cases if needed)
            // For simple values like "true", "123", this would work.
            // Original `eval` is dangerous, so this is a safer proxy for common cases.
            if (val === "true") return true;
            if (val === "false") return false;
            if (!isNaN(val) && !isNaN(parseFloat(val))) return parseFloat(val);
            return val;
        }
    }

    // Placeholder for bindHover, as it's not defined in the original snippet.
    // It likely just attaches mouseenter/mouseleave events to add/remove a class.
    function attachHoverEvents(element) {
        return element.on("mouseenter", function() {
            _jQ_(this).addClass("comp-hover");
        }).on("mouseleave", function() {
            _jQ_(this).removeClass("comp-hover");
        });
    }

    // Placeholder for extendRemove, as it's not defined in the original snippet.
    // It likely extends an object while removing properties that are `undefined` in the source.
    function mergeAndReplace(target, source) {
        for (var key in source) {
            if (source[key] === undefined) {
                delete target[key];
            } else {
                target[key] = source[key];
            }
        }
        return target;
    }


    _jQ_.extend(CalendarWidget.prototype, {
        /* Class name indicating an element has been configured with a calendar. */
        initializedClass: 'hasCalendarWidget',

        // Tracks the maximum number of display rows (see issue #7043).
        maximumDisplayRows: 4,

        /* Debug logging functionality (if enabled). */
        debugLog: function () {
            if (this.enableDebug)
                console.info.apply('', arguments); // Using console.info instead of log.
        },

        // TODO: rename to "visualComponent" when migrating to component factory pattern.
        _getWidgetElement: function() {
            return this.calendarContainer;
        },

        /*
         * Overrides the default settings for all instances of the calendar widget.
         * @param  newDefaultSettings  object - new settings to apply as global defaults.
         * @return the calendar manager object.
         */
        configureDefaults: function(newDefaultSettings) {
            mergeAndReplace(this._globalOptions, newDefaultSettings || {});
            return this;
        },

        /*
         * Attaches the calendar widget to a selected jQuery element.
         * @param  targetElement  element - the input field, div, or span to attach to.
         * @param  widgetSettings  object - specific settings for this calendar instance.
         */
        _bindCalendarWidget: function(targetElement, widgetSettings) {
            // Check for configuration settings directly on the element itself, in namespace 'calendar:'.
            var elementSpecificSettings = null;
            for (var attributeKey in this._globalOptions) {
                var attributeValue = targetElement.getAttribute('calendar:' + attributeKey);
                if (attributeValue) {
                    elementSpecificSettings = elementSpecificSettings || {};
                    try {
                        elementSpecificSettings[attributeKey] = evaluateValue(attributeValue);
                    } catch (errorDetails) {
                        elementSpecificSettings[attributeKey] = attributeValue;
                    }
                }
            }
            var elementType = targetElement.nodeName.toLowerCase();
            var isInline = (elementType === 'div' || elementType === 'span');
            if (!targetElement.elementId) {
                this.instanceCounter += 1;
                targetElement.elementId = 'cal' + this.instanceCounter;
            }
            var currentInstance = this._createInstance(_jQ_(targetElement), isInline);
            currentInstance.config = _jQ_.extend({}, widgetSettings || {}, elementSpecificSettings || {});
            if (elementType === 'input') {
                this._attachToInput(targetElement, currentInstance);
            } else if (isInline) {
                this._displayInline(targetElement, currentInstance);
            }
        },
        // Mock/placeholder functions for `_newInst`, `_connectDatepicker`, `_inlineDatepicker`
        // as they are called but not defined in the provided snippet.
        _createInstance: function(element, isInline) {
            // Placeholder for creating a new instance object.
            return {
                element: element,
                isInline: isInline,
                config: {}
            };
        },
        _attachToInput: function(target, inst) {
            // Placeholder for connecting to an input element.
            // console.log("Attaching calendar to input:", target.id);
        },
        _displayInline: function(target, inst) {
            // Placeholder for displaying inline calendar.
            // console.log("Displaying inline calendar for:", target.id);
        },
        iso8601Week: function(date) {
            // Placeholder for iso8601Week calculation.
            // This function was referenced in _defaults.
            var d = new Date(date.valueOf());
            d.setDate(d.getDate() + 4 - (d.getDay() || 7));
            var yearStart = new Date(d.getFullYear(), 0, 1);
            return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        }
    });

})( jQuery ); // Pass jQuery object to the immediately invoked function.