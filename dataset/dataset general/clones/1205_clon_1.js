/*!
 * jQuery UI - v1.9.1 - 2012-10-29
 * Project Home: http://jqueryui.com
 *
 * This file includes:
 *   - core functionality: jquery.ui.core.js
 *   - datepicker component: jquery.ui.datepicker.js
 *
 * Copyright (c) 2012 jQuery Foundation and other contributors.
 * All rights reserved.
 * Licensed under the MIT License.
 *
 * This is a Type I clone, meaning only whitespace and comments have been altered.
 */

( function ( $, undefined ) {

    // Unique ID counter for generating unique DOM element IDs.
    var uuid = 0,
        // Regular expression to test for generated UI IDs.
        runiqueId = /^ui-id-\d+$/;

    // Prevent duplicate loading of jQuery UI.
    // This check is crucial because we proxy existing jQuery functions,
    // and double-proxying would lead to unexpected behavior.
    $.ui = $.ui || {};

    // If jQuery UI is already loaded and has a version, exit early.
    if ( $.ui.version ) {

        return;
    }

    // Extend the jQuery UI namespace with core properties and utilities.
    $.extend( $.ui, {
        // Current version of jQuery UI.
        version: "1.9.1",

        // Key codes for common keyboard events.
        keyCode: {
            BACKSPACE:        8,
            COMMA:            188,
            DELETE:           46,
            DOWN:             40,
            END:              35,
            ENTER:            13,
            ESCAPE:           27,
            HOME:             36,
            LEFT:             37,
            NUMPAD_ADD:       107,
            NUMPAD_DECIMAL:   110,
            NUMPAD_DIVIDE:    111,
            NUMPAD_ENTER:     108,
            NUMPAD_MULTIPLY:  106,
            NUMPAD_SUBTRACT:  109,
            PAGE_DOWN:        34,
            PAGE_UP:          33,
            PERIOD:           190,
            RIGHT:            39,
            SPACE:            32,
            TAB:              9,
            UP:               38
        }
    } );

    // Extend jQuery.fn with custom UI plugins and utilities.
    $.fn.extend( {
        // Store a reference to the original `focus` method.
        _focus: $.fn.focus,

        // Custom focus method with an optional delay.
        focus: function ( delay, fn ) {
            // If a delay is provided, use setTimeout to defer focus.
            return typeof delay === "number" ?
                this.each( function () {
                    var elem = this;
                    setTimeout( function () {
                        $( elem ).focus(); // Apply focus.
                        if ( fn ) {
                            fn.call( elem ); // Execute callback if provided.
                        }
                    }, delay );
                } ) :
                // Otherwise, call the original jQuery focus method.
                this._focus.apply( this, arguments );
        },

        // Determine the scrollable parent of an element.
        scrollParent: function () {
            var scrollParent;

            // Handle IE-specific position checks and absolute positioning.
            if ( ( $.ui.ie && ( /(static|relative)/ ).test( this.css( 'position' ) ) ) || ( /absolute/ ).test( this.css( 'position' ) ) ) {
                scrollParent = this.parents().filter( function () {
                    // Filter for parents with position and scrollable overflow.
                    return ( /(relative|absolute|fixed)/ ).test( $.css( this, 'position' ) ) &&
                        ( /(auto|scroll)/ ).test( $.css( this, 'overflow' ) + $.css( this, 'overflow-y' ) + $.css( this, 'overflow-x' ) );
                } ).eq( 0 ); // Get the first matching parent.
            } else {
                scrollParent = this.parents().filter( function () {
                    // Filter for parents with scrollable overflow.
                    return ( /(auto|scroll)/ ).test( $.css( this, 'overflow' ) + $.css( this, 'overflow-y' ) + $.css( this, 'overflow-x' ) );
                } ).eq( 0 ); // Get the first matching parent.
            }

            // Return the scroll parent or the document if none found or position is fixed.
            return ( /fixed/ ).test( this.css( 'position' ) ) || !scrollParent.length ? $( document ) : scrollParent;
        },

        // Get or set the z-index of an element.
        zIndex: function ( zIndex ) {
            // If zIndex is provided, set it.
            if ( zIndex !== undefined ) {
                return this.css( "zIndex", zIndex );
            }

            // If the element exists, traverse up the DOM tree to find its effective z-index.
            if ( this.length ) {
                var elem = $( this[ 0 ] ),
                    position,
                    value;

                while ( elem.length && elem[ 0 ] !== document ) {
                    // Ignore z-index if position is set to a value where z-index is ignored by the browser.
                    // This ensures consistent behavior across different browsers.
                    // WebKit always returns "auto" if the element is positioned.
                    position = elem.css( "position" );

                    if ( position === "absolute" || position === "relative" || position === "fixed" ) {
                        // IE returns 0 when zIndex is not specified; other browsers return a string.
                        // We also ignore cases of nested elements with an explicit value of 0,
                        // e.g., <div style="z-index: -10;"><div style="z-index: 0;"></div></div>.
                        value = parseInt( elem.css( "zIndex" ), 10 );

                        if ( !isNaN( value ) && value !== 0 ) {
                            return value;
                        }
                    }
                    elem = elem.parent(); // Move to the parent element.
                }
            }

            // Default z-index if no explicit z-index is found.
            return 0;
        },

        // Assign a unique ID to each selected element if it doesn't already have one.
        uniqueId: function () {
            return this.each( function () {
                if ( !this.id ) {
                    this.id = "ui-id-" + ( ++uuid ); // Increment uuid and assign.
                }
            } );
        },

        // Remove unique IDs generated by `uniqueId()`.
        removeUniqueId: function () {
            return this.each( function () {
                if ( runiqueId.test( this.id ) ) {
                    $( this ).removeAttr( "id" ); // Remove the 'id' attribute.
                }
            } );
        }
    } );

    // Support for jQuery versions older than 1.8 regarding outerWidth/outerHeight.
    if ( !$( "<a>" ).outerWidth( 1 ).jquery ) {
        // Iterate over "Width" and "Height" to create corresponding methods.
        $.each( [ "Width", "Height" ], function ( i, name ) {
            var side = name === "Width" ? [ "Left", "Right" ] : [ "Top", "Bottom" ],
                type = name.toLowerCase(),
                orig = {
                    innerWidth: $.fn.innerWidth,
                    innerHeight: $.fn.innerHeight,
                    outerWidth: $.fn.outerWidth,
                    outerHeight: $.fn.outerHeight
                };

            // Helper function to reduce size by padding, border, and/or margin.
            function reduce( elem, size, border, margin ) {
                $.each( side, function () {
                    size -= parseFloat( $.css( elem, "padding" + this ) ) || 0;
                    if ( border ) {
                        size -= parseFloat( $.css( elem, "border" + this + "Width" ) ) || 0;
                    }
                    if ( margin ) {
                        size -= parseFloat( $.css( elem, "margin" + this ) ) || 0;
                    }
                } );
                return size;
            }

            // Implement custom innerWidth/innerHeight.
            $.fn[ "inner" + name ] = function ( size ) {
                if ( size === undefined ) {
                    return orig[ "inner" + name ].call( this );
                }

                return this.each( function () {
                    $( this ).css( type, reduce( this, size ) + "px" );
                } );
            };

            // Implement custom outerWidth/outerHeight.
            $.fn[ "outer" + name ] = function ( size, margin ) {
                if ( typeof size !== "number" ) {
                    return orig[ "outer" + name ].call( this, size );
                }

                return this.each( function () {
                    $( this ).css( type, reduce( this, size, true, margin ) + "px" );
                } );
            };
        } );
    }

    // --- Selector functions ---

    // Determine if an element is focusable.
    function focusable( element, isTabIndexNotNaN ) {
        var map,
            mapName,
            img,
            nodeName = element.nodeName.toLowerCase();

        if ( "area" === nodeName ) {
            map = element.parentNode;
            mapName = map.name;

            if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
                return false;
            }
            img = $( "img[usemap=#" + mapName + "]" )[ 0 ];
            return !!img && visible( img );
        }
        // Check if the element is an input-like control, an anchor with href, or has a valid tabindex.
        return ( /input|select|textarea|button|object/ .test( nodeName ) ?
            !element.disabled :
            "a" === nodeName ?
            element.href || isTabIndexNotNaN :
            isTabIndexNotNaN ) &&
            // The element and all of its ancestors must be visible.
            visible( element );
    }

    // Determine if an element is visible.
    function visible( element ) {
        return $.expr.filters.visible( element ) &&
            !$( element ).parents().andSelf().filter( function () {
                return $.css( this, "visibility" ) === "hidden";
            } ).length;
    }

    // Extend jQuery's selector expressions with custom filters.
    $.extend( $.expr[ ":" ], {
        // Custom data selector.
        data: $.expr.createPseudo ?
            $.expr.createPseudo( function ( dataName ) {
                return function ( elem ) {
                    return !!$.data( elem, dataName );
                };
            } ) :
            // Support for jQuery <1.8 (non-pseudo selectors).
            function ( elem, i, match ) {
                return !!$.data( elem, match[ 3 ] );
            },

        // Custom focusable selector.
        focusable: function ( element ) {
            return focusable( element, !isNaN( $.attr( element, "tabindex" ) ) );
        },

        // Custom tabbable selector.
        tabbable: function ( element ) {
            var tabIndex = $.attr( element, "tabindex" ),
                isTabIndexNaN = isNaN( tabIndex );
            return ( isTabIndexNaN || tabIndex >= 0 ) && focusable( element, !isTabIndexNaN );
        }
    } );

    // --- Support checks ---
    $( function () {
        var body = document.body,
            div = body.appendChild( div = document.createElement( "div" ) );

        // Access offsetHeight before setting the style to prevent a layout bug
        // in IE 9 which causes the element to continue to take up space even
        // after it is removed from the DOM (#8026).
        div.offsetHeight;

        // Apply styles to the test div.
        $.extend( div.style, {
            minHeight: "100px",
            height: "auto",
            padding: 0,
            borderWidth: 0
        } );

        // Check for min-height support.
        $.support.minHeight = div.offsetHeight === 100;

        // Check for selectstart event support.
        $.support.selectstart = "onselectstart" in div;

        // Set display to none to avoid a layout bug in IE
        // (http://dev.jquery.com/ticket/4014).
        body.removeChild( div ).style.display = "none";
    } );

    // --- Deprecated features ---

    // Self-executing anonymous function to determine IE version.
    ( function () {
        var uaMatch = /msie ([\w.]+)/ .exec( navigator.userAgent.toLowerCase() ) || [];
        $.ui.ie = uaMatch.length ? true : false;
        $.ui.ie6 = parseFloat( uaMatch[ 1 ], 10 ) === 6;
    } )();

    // Extend jQuery.fn with methods to disable/enable text selection.
    $.fn.extend( {
        // Disable text selection on elements.
        disableSelection: function () {
            return this.bind( ( $.support.selectstart ? "selectstart" : "mousedown" ) +
                ".ui-disableSelection", function ( event ) {
                    event.preventDefault(); // Prevent default action.
                } );
        },

        // Enable text selection on elements.
        enableSelection: function () {
            return this.unbind( ".ui-disableSelection" ); // Unbind the event.
        }
    } );

    // Extend jQuery UI with additional utilities.
    $.extend( $.ui, {
        // $.ui.plugin is deprecated. Use the proxy pattern instead.
        plugin: {
            // Add a plugin method to a widget's prototype.
            add: function ( module, option, set ) {
                var i,
                    proto = $.ui[ module ].prototype;
                for ( i in set ) {
                    proto.plugins[ i ] = proto.plugins[ i ] || [];
                    proto.plugins[ i ].push( [ option, set[ i ] ] );
                }
            },
            // Call a plugin method on a widget instance.
            call: function ( instance, name, args ) {
                var i,
                    set = instance.plugins[ name ];

                // If no plugin methods or element is detached, return.
                if ( !set || !instance.element[ 0 ].parentNode || instance.element[ 0 ].parentNode.nodeType === 11 ) {
                    return;
                }

                for ( i = 0; i < set.length; i++ ) {
                    if ( instance.options[ set[ i ][ 0 ] ] ) {
                        set[ i ][ 1 ].apply( instance.element, args );
                    }
                }
            }
        },

        // Alias for jQuery.contains.
        contains: $.contains,

        // Only used by resizable widget. Checks if an element has scrollbars.
        hasScroll: function ( el, a ) {
            // If overflow is hidden, the element might have extra content, but the user wants to hide it.
            if ( $( el ).css( "overflow" ) === "hidden" ) {
                return false;
            }

            var scroll = ( a && a === "left" ) ? "scrollLeft" : "scrollTop",
                has = false;

            if ( el[ scroll ] > 0 ) {
                return true;
            }

            // TODO: determine which cases actually cause this to happen.
            // If the element doesn't have the scroll set, see if it's possible to
            // set the scroll.
            el[ scroll ] = 1;
            has = ( el[ scroll ] > 0 );
            el[ scroll ] = 0; // Reset scroll position.
            return has;
        },

        // These are odd functions; fix the API or move into individual plugins.
        // Determines when an x coordinate is over "b" element's axis.
        isOverAxis: function ( x, reference, size ) {
            return ( x > reference ) && ( x < ( reference + size ) );
        },
        // Determines when x, y coordinates are over "b" element.
        isOver: function ( y, x, top, left, height, width ) {
            return $.ui.isOverAxis( y, top, height ) && $.ui.isOverAxis( x, left, width );
        }
    } );

} )( jQuery );

( function ( $, undefined ) {

    // Extend jQuery UI with datepicker specific properties.
    $.extend( $.ui, {
        datepicker: {
            version: "1.9.1" // Datepicker version.
        }
    } );

    // Constant for the data property name.
    var PROP_NAME = 'datepicker';
    // Generate a unique ID for datepicker instances.
    var dpuuid = new Date().getTime();
    // Reference to the currently active datepicker instance.
    var instActive;

    /*
     * Date picker manager.
     * Use the singleton instance of this class, $.datepicker, to interact with the date picker.
     * Settings for (groups of) date pickers are maintained in an instance object,
     * allowing multiple different settings on the same page.
     */
    function Datepicker() {
        this.debug = false; // Change this to true to start debugging output.
        this._curInst = null; // The current datepicker instance in use.
        this._keyEvent = false; // Flag if the last event was a key event.
        this._disabledInputs = []; // List of date picker input fields that have been disabled.
        this._datepickerShowing = false; // True if the popup picker is currently showing, false otherwise.
        this._inDialog = false; // True if showing within a "dialog", false otherwise.
        this._mainDivId = 'ui-datepicker-div'; // The ID of the main datepicker division element.
        this._inlineClass = 'ui-datepicker-inline'; // The CSS class name for inline datepickers.
        this._appendClass = 'ui-datepicker-append'; // The CSS class name for appended text.
        this._triggerClass = 'ui-datepicker-trigger'; // The CSS class name for the trigger button.
        this._dialogClass = 'ui-datepicker-dialog'; // The CSS class name for dialog datepickers.
        this._disableClass = 'ui-datepicker-disabled'; // The CSS class name for disabled datepicker covering.
        this._unselectableClass = 'ui-datepicker-unselectable'; // The CSS class name for unselectable cells.
        this._currentClass = 'ui-datepicker-current-day'; // The CSS class name for the current day.
        this._dayOverClass = 'ui-datepicker-days-cell-over'; // The CSS class name for day hover effect.
        this.regional = []; // Available regional settings, indexed by language code.

        // Default regional settings (English).
        this.regional[ '' ] = {
            closeText: 'Done', // Display text for the close link.
            prevText: 'Prev', // Display text for the previous month link.
            nextText: 'Next', // Display text for the next month link.
            currentText: 'Today', // Display text for the current month link.
            monthNames: [ 'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December' ], // Names of months for drop-down and formatting.
            monthNamesShort: [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ], // Short names for formatting.
            dayNames: [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ], // Full day names for formatting.
            dayNamesShort: [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ], // Short day names for formatting.
            dayNamesMin: [ 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa' ], // Column headings for days starting at Sunday.
            weekHeader: 'Wk', // Column header for week of the year.
            dateFormat: 'mm/dd/yy', // See format options on parseDate.
            firstDay: 0, // The first day of the week, Sun = 0, Mon = 1, etc.
            isRTL: false, // True if right-to-left language, false if left-to-right.
            showMonthAfterYear: false, // True if the year select precedes month, false for month then year.
            yearSuffix: '' // Additional text to append to the year in the month headers.
        };

        // Global defaults for all date picker instances.
        this._defaults = {
            showOn: 'focus', // 'focus' for popup on focus,
            // 'button' for trigger button, or 'both' for either.
            showAnim: 'fadeIn', // Name of jQuery animation for popup.
            showOptions: {}, // Options for enhanced animations.
            defaultDate: null, // Used when field is blank: actual date,
            // +/-number for offset from today, null for today.
            appendText: '', // Display text following the input box, e.g. showing the format.
            buttonText: '...', // Text for the trigger button.
            buttonImage: '', // URL for the trigger button image.
            buttonImageOnly: false, // True if the image appears alone, false if it appears on a button.
            hideIfNoPrevNext: false, // True to hide next/previous month links
            // if not applicable, false to just disable them.
            navigationAsDateFormat: false, // True if date formatting applied to prev/today/next links.
            gotoCurrent: false, // True if today link goes back to current selection instead.
            changeMonth: false, // True if month can be selected directly, false if only prev/next.
            changeYear: false, // True if year can be selected directly, false if only prev/next.
            yearRange: 'c-10:c+10', // Range of years to display in drop-down,
            // either relative to today's year (-nn:+nn), relative to currently displayed year
            // (c-nn:c+nn), absolute (nnnn:nnnn), or a combination of the above (nnnn:-n).
            showOtherMonths: false, // True to show dates in other months, false to leave blank.
            selectOtherMonths: false, // True to allow selection of dates in other months, false for unselectable.
            showWeek: false, // True to show week of the year, false to not show it.
            calculateWeek: this.iso8601Week, // How to calculate the week of the year,
            // takes a Date and returns the number of the week for it.
            shortYearCutoff: '+10', // Short year values < this are in the current century,
            // > this are in the previous century,
            // string value starting with '+' for current year + value.
            minDate: null, // The earliest selectable date, or null for no limit.
            maxDate: null, // The latest selectable date, or null for no limit.
            duration: 'fast', // Duration of display/closure animation.
            beforeShowDay: null, // Function that takes a date and returns an array with
            // [0] = true if selectable, false if not, [1] = custom CSS class name(s) or '',
            // [2] = cell title (optional), e.g. $.datepicker.noWeekends.
            beforeShow: null, // Function that takes an input field and
            // returns a set of custom settings for the date picker.
            onSelect: null, // Define a callback function when a date is selected.
            onChangeMonthYear: null, // Define a callback function when the month or year is changed.
            onClose: null, // Define a callback function when the datepicker is closed.
            numberOfMonths: 1, // Number of months to show at a time.
            showCurrentAtPos: 0, // The position in multiple months at which to show the current month (starting at 0).
            stepMonths: 1, // Number of months to step back/forward.
            stepBigMonths: 12, // Number of months to step back/forward for the big links.
            altField: '', // Selector for an alternate field to store selected dates into.
            altFormat: '', // The date format to use for the alternate field.
            constrainInput: true, // The input is constrained by the current date format.
            showButtonPanel: false, // True to show button panel, false to not show it.
            autoSize: false, // True to size the input for the date format, false to leave as is.
            disabled: false // The initial disabled state of the datepicker.
        };

        // Merge regional settings into defaults.
        $.extend( this._defaults, this.regional[ '' ] );

        // Initialize the main datepicker division element.
        this.dpDiv = bindHover( $( '<div id="' + this._mainDivId + '" class="ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all"></div>' ) );
    }

    // Extend the Datepicker prototype with methods and properties.
    $.extend( Datepicker.prototype, {
        /* Class name added to elements to indicate already configured with a date picker. */
        markerClassName: 'hasDatepicker',

        // Keep track of the maximum number of rows displayed (see #7043).
        maxRows: 4,

        /* Debug logging (if enabled). */
        log: function () {
            if ( this.debug ) {
                console.log.apply( '', arguments );
            }
        },

        // TODO rename to "widget" when switching to widget factory.
        _widgetDatepicker: function () {
            return this.dpDiv;
        },

        /*
         * Override the default settings for all instances of the date picker.
         * @param  settings  object - the new settings to use as defaults (anonymous object).
         * @return the manager object.
         */
        setDefaults: function ( settings ) {
            extendRemove( this._defaults, settings || {} );
            return this;
        },

        /*
         * Attach the date picker to a jQuery selection.
         * @param  target    element - the target input field or division or span.
         * @param  settings  object - the new settings to use for this date picker instance (anonymous).
         */
        _attachDatepicker: function ( target, settings ) {
            // Check for settings defined directly on the control itself in namespace 'date:'.
            var inlineSettings = null;

            for ( var attrName in this._defaults ) {
                var attrValue = target.getAttribute( 'date:' + attrName );
                if ( attrValue ) {
                    inlineSettings = inlineSettings || {};
                    try {
                        inlineSettings[ attrName ] = eval( attrValue ); // Evaluate attribute value as JS.
                    } catch ( err ) {
                        inlineSettings[ attrName ] = attrValue; // Treat as string if evaluation fails.
                    }
                }
            }

            var nodeName = target.nodeName.toLowerCase();
            var inline = ( nodeName == 'div' || nodeName == 'span' ); // Check if it's an inline element.

            if ( !target.id ) {
                this.uuid += 1; // Increment unique ID counter.
                target.id = 'dp' + this.uuid; // Assign a new unique ID.
            }

            // Create a new datepicker instance.
            var inst = this._newInst( $( target ), inline );
            inst.settings = $.extend( {}, settings || {}, inlineSettings || {} ); // Merge settings.

            if ( nodeName == 'input' ) {
                this._connectDatepicker( target, inst ); // Connect to an input field.
            } else if ( inline ) {
                this._inlineDatepicker( target, inst ); // Initialize as an inline datepicker.
            }
        }
    } );