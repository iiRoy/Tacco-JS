// This is a JavaScript file for the Mobi Pick datepicker widget.
// It's designed to provide an Android-style date selection experience
// within jQuery Mobile applications.
// Original author: Christoph Baudson.
// For bug reports or feature requests, please visit the official GitHub repository:
//      https://github.com/sustainablepace/mobipick/issues
// Current version: 0.9
// This software is distributed under the terms of the MIT license.
// Refer to MIT-license.txt for full license details.
( function ( factory ) {
    // Check if RequireJS (AMD) is available for module definition.
    if ( typeof define === 'function' && define.amd ) {
        // If AMD is present, register the module anonymously.
        // Dependencies are jQuery and jQuery Mobile.
        define ( [ 'jquery', 'jquery.mobile' ] , factory ) ;
    } else {
        // Otherwise, assume a browser global environment.
        // Pass global jQuery and jQuery.mobile objects to the factory.
        factory ( jQuery , jQuery.mobile ) ;
    }
} ( function ( $ , $mobile , undefined ) {


$ . widget ( "sustainablepace.mobipick" , $mobile.widget , {


    // Default configuration options for the widget.
    options : {

        date            : null             , // The currently selected date.
        dateFormat      : "yyyy-MM-dd"     , // Format for full date display.
        dateFormatMonth : "yyyy-MM"        , // Format for month-only accuracy.
        dateFormatYear  : "yyyy"           , // Format for year-only accuracy.
        inputOrder      : "d m y"          , // Order of day, month, year inputs.
        locale          : "en"             , // Current localization string.
        intlStdDate     : true             , // Use international standard date format for input.
        buttonTheme     : "b"              , // jQuery Mobile theme for buttons.

        // Popup specific options, passed directly to jQuery Mobile's popup widget.
        popup           : {
            dismissible : false     , // Prevent dismissal by tapping outside.
            history     : false     , // Do not add to browser history.
            overlayTheme: "a"       , // Theme for the popup overlay.
            positionTo  : "window"  , // Position the popup relative to the window.
            theme       : "a"       , // Theme for the popup content.
            transition  : "none"      // No transition effect for the popup.
        }

    } ,


    // Internal reference to the date picker popup element.
    _picker : $ ( [ ] ) ,


    // Prefix for custom events triggered by this widget.
    widgetEventPrefix : "mobipick" ,


    // Cleans up the widget instance.
    destroy : function ( ) {

        this . _close ( ) ; // Close any open picker.
        this . element . off ( "tap click" ) ; // Remove event handlers from the target element.
        this . _picker . popup ( "destroy" ) ; // Destroy the jQuery Mobile popup.

        // Call the parent widget's destroy method.
        $ . Widget . prototype . destroy . call ( this ) ;

    } ,


    // Initializes the widget upon creation.
    _create : function ( ) {

        this . _initOptions ( ) ; // Parse and set initial options.
        this . _createView ( ) ;  // Generate and insert the picker's HTML markup.

        // Attach event handlers to the input element to open the picker.
        this . element . on ( "tap click" , $ . proxy ( this . open , this ) ) ;

    } ,


    // Parses initial options, potentially from element attributes.
    _initOptions : function ( ) {

        // Retrieve date values from element's value or attributes, falling back to options.
        var date    = this . element . val ( )         || this . options . date    ,
            minDate = this . element . attr ( "min" ) || this . options . minDate ,
            maxDate = this . element . attr ( "max" ) || this . options . maxDate ;

        // If a date value is found, set it as the current date.
        if ( date ) {
            this . _setOption ( "date" , date ) ;
        }

        // HTML5 input 'min' and 'max' attributes can specify date constraints.
        // Reference: http://dev.w3.org/html5/markup/input.date.html
        if ( maxDate ) {
            this . _setOption ( "maxDate" , maxDate ) ;
        }
        if ( minDate ) {
            this . _setOption ( "minDate" , minDate ) ;
        }

        // Ensure the locale option is properly set.
        this . _setOption ( "locale" , this . options . locale ) ;

    } ,


    // Called after _create and _initOptions.
    _init : function ( ) {

        // If a date is already set, populate the input field with it.
        if ( this . _getDate ( ) !== null ) {
            this . updateDateInput ( ) ;
        }

    } ,


    // Opens the date picker popup.
    open : function ( evt ) {

        // Prevent default event behavior if an event object is provided.
        if ( evt ) {
            evt . stopPropagation ( ) ; // Stop event bubbling.
            evt . preventDefault ( ) ;  // Prevent default action (e.g., opening native picker).
        }

        var date = this . _getDate ( ) ;

        // If no valid XDate is currently set, initialize with a new XDate (current date).
        if ( ! this . _isXDate ( date ) ) {
            date = new XDate ( ) ;
        }

        // Set the current date, ensuring it fits within min/max constraints.
        this . _setOption ( "date"         , this . _fitDate ( date ) ) ;
        // Store the current date as the original, for potential cancellation.
        this . _setOption ( "originalDate" , this . _getDate ( )       ) ;

        // Display the picker UI.
        this . _showView ( ) ;
        // Refresh the picker's visual state.
        this . _updateView ( ) ;
        // Attach event listeners to the picker controls.
        this . _bindEvents ( ) ;

    } ,


    // Attaches event handlers to the date picker's controls.
    _bindEvents : function ( ) {

        var self    = this                                   , // Reference to the widget instance.
            p       = this . _picker                         , // The picker's jQuery element.
            confirm = $ . proxy ( this . _confirmDate , this ) , // Proxy for the confirm action.
            cancel  = $ . proxy ( this . _cancelDate  , this ) , // Proxy for the cancel action.
            esc     = $ . proxy ( this . _cancelDateOnEsc , this ) ; // Proxy for Escape key handling.

        // Event handling for the 'Set' and 'Cancel' buttons.
        p . find ( ".mobipick-set"    ) . off ( ) . on ( "tap" , confirm ) ;
        p . find ( ".mobipick-cancel" ) . off ( ) . on ( "tap" , cancel  ) ;

        // Global keyup listener for the Escape key to cancel.
        $ ( document ) . off ( "keyup" , esc ) . on ( "keyup" , esc ) ;

        // Map CSS selectors to their corresponding date manipulation methods.
        var selectorMap = {
            ".mobipick-prev-day"   : "_prevDay"   ,
            ".mobipick-prev-month" : "_prevMonth" ,
            ".mobipick-prev-year"  : "_prevYear"  ,
            ".mobipick-next-day"   : "_nextDay"   ,
            ".mobipick-next-month" : "_nextMonth" ,
            ".mobipick-next-year"  : "_nextYear"
        } ;

        // Iterate through the selector map to bind tap events to increment/decrement buttons.
        for ( var selector in selectorMap ) {
            // Using an IIFE to capture `selector` and `handler` for each iteration.
            ( function ( ) {
                var handler = self [ selectorMap [ selector ] ] ; // Get the method reference.
                p . find ( selector ) . off ( ) . on ( "tap" , $ . proxy ( function ( ) {
                    return self . _handleDate ( handler ) ; // Handle date change via the specific method.
                } , self ) ) ;
            } ) ( ) ;
        }

    } ,


    // Closes the date picker popup.
    _close : function ( ) {
        this . _hideView ( ) ;
    } ,


    // Generic handler for date manipulation actions (e.g., prev/next day/month/year).
    _handleDate : function ( dateHandler ) {
        // Apply the date manipulation method and then fit the new date to constraints.
        this . _setOption ( "date" , this . _fitDate ( dateHandler . apply ( this ) ) ) ;
        return false ; // Prevent default event action.
    } ,


    // Confirms the selected date and updates the input field.
    _confirmDate : function ( ) {

        var proceed    = true                                               , // Flag to continue with confirmation.
            dateDiff   = this . _getDate ( ) . diffDays ( this . options . originalDate ) , // Difference from original date.
            hasChanged = dateDiff !== 0 || this . element . val ( ) === ""  ; // Check if date actually changed or input was empty.

        // If a 'close' callback is defined, execute it.
        // If the callback returns false, the confirmation process is halted.
        if ( this . options . close && typeof this . options . close === "function" ) {
            proceed = this . options . close . call ( ) !== false ;
        }

        // If proceeding and the date has changed (or input was empty), update the value.
        if ( proceed && hasChanged ) {
            this . _setOption ( "originalDate" , this . _getDate ( ) ) ; // Update originalDate to current.
            this . updateDateInput ( ) ;                                 // Update the visible input field.
            this . element . trigger ( "change" ) ;                      // Trigger a 'change' event on the input.
        } else {
            // If not proceeding or no change, revert to the original date.
            this . _setOption ( "date" , this . options . originalDate ) ;
        }

        this . _close ( ) ; // Close the picker.
        return false ;      // Prevent default event.

    } ,


    // Cancels the date selection, reverting to the original date.
    _cancelDate : function ( ) {
        this . _setOption ( "date" , this . options . originalDate ) ; // Revert the date to its original value.
        this . _close ( ) ;                                         // Close the picker without saving.
        return false ;                                              // Prevent default event.
    } ,


    // Handles cancellation when the Escape key is pressed.
    _cancelDateOnEsc : function ( evt ) {
        if ( evt . keyCode === 27 ) { // Check if the pressed key is Escape (keyCode 27).
            this . _cancelDate ( ) ;  // Call the cancel date method.
        }
    } ,


    // Overrides the default _setOption method to handle specific date-related options.
    _setOption : function ( key , val ) {

        switch ( key ) {

            case "date" :
                // Sanitize the input date and store it as a native Date object.
                var sane = this . _sanitizeDate ( val ) ;
                this . options [ key ] = sane ? sane . toDate ( ) : sane ;
                break ;

            case "originalDate" :
                // Sanitize and store the original date.
                this . options [ key ] = this . _sanitizeDate ( val ) . toDate ( ) ;
                break ;

            case "maxDate" :
                // Sanitize and store the maximum allowable date.
                this . options [ key ] = this . _sanitizeMaxDate ( val ) . toDate ( ) ;
                break ;

            case "minDate" :
                // Sanitize and store the minimum allowable date.
                this . options [ key ] = this . _sanitizeMinDate ( val ) . toDate ( ) ;
                break ;

            case "intlStdDate" :
                // Ensure international standard date format is a boolean.
                this . options [ key ] = !! val ;
                break ;

            case "locale" :
                // Validate and set the locale, defaulting to 'en' if invalid.
                this . options [ key ] = this . _isValidLocale ( val ) ? val : "en" ;
                break ;

            default :
                // For other options, defer to the parent widget's _setOption.
                // Note: These changes do not trigger a view update.
                return $ . Widget . prototype . _setOption . apply ( this , arguments ) ;

        }

        // After setting a date-related option, update the view to reflect the change.
        this . _updateView ( ) ;

    } ,


    //
    // Model related methods (data handling and validation).
    //


    // Ensures a given value is a valid XDate object, stripping time components.
    _sanitizeDate : function ( date ) {

        if ( date === null ) {
            return null ;
        }

        var d = date ; // Use a local variable for manipulation.

        // If the input is a string, attempt to parse it into an XDate.
        if ( typeof d === "string" ) {
            d = new XDate ( d ) ;
        }

        // If it's already an XDate, convert it to a native Date object first.
        if ( this . _isXDate ( d ) ) {
            d = d . toDate ( ) ;
        }

        // After all conversions, if it's not a native Date object, throw an error.
        if ( ! this . _isDate ( d ) ) {
            throw "Parameter 'date' must be a Date." ;
        }

        // Return a new XDate instance, ensuring only year, month, and day are kept.
        return new XDate ( d . getFullYear ( ) , d . getMonth ( ) , d . getDate ( ) ) ;

    } ,


    // Sanitizes the minimum date, ensuring it's not after the maximum date.
    _sanitizeMinDate : function ( date ) {

        var minDate = this . _sanitizeDate ( date ) ; // Sanitize the date value.

        if ( this . _isAfterMaxDate ( minDate ) ) {
            throw "Min date must be before max date." ; // Enforce minDate <= maxDate.
        }

        return minDate ;

    } ,


    // Sanitizes the maximum date, ensuring it's not before the minimum date.
    _sanitizeMaxDate : function ( date ) {

        var maxDate = this . _sanitizeDate ( date ) ; // Sanitize the date value.

        if ( this . _isBeforeMinDate ( maxDate ) ) {
            throw "Max date must be after min date." ; // Enforce maxDate >= minDate.
        }

        return maxDate ;

    } ,


    // Determines the appropriate date format string based on the `accuracy` option.
    _getDateFormat : function ( ) {

        switch ( this . options . accuracy ) {
            case "month" :
                return "dateFormatMonth" ; // Return format for month-level accuracy.
            case "year" :
                return "dateFormatYear"  ; // Return format for year-level accuracy.
            default :
                return "dateFormat"      ; // Default to full date format.
        }

    } ,


    // Returns the current date formatted according to the selected `dateFormat` option.
    dateString : function ( ) {

        var format = this . _getDateFormat ( ) , // Get the format key (e.g., "dateFormat").
            date   = this . _getDate ( ) ;       // Get the current XDate object.

        // If no date is set, return an empty string; otherwise, format the date.
        return ! date ? '' : date . toString ( this . options [ format ] ) ;

    } ,


    // Returns the current date formatted according to the specified locale.
    localeString : function ( ) {

        var l    = this . options . locale     , // Current locale string.
            a    = this . _getDateFormat ( ) , // Date format key based on accuracy.
            date = this . _getDate ( ) ;       // Current XDate object.

        // If no date, return empty string. Otherwise, format using locale-specific format
        // if available, or fall back to generic format.
        return ! date ? '' : date . toString (
            this . _isValidLocale ( l ) ? XDate . locales [ l ] [ a ] : this . options [ a ]
        ) ;

    } ,


    // Adjusts a given date to fit within the `minDate` and `maxDate` constraints.
    _fitDate : function ( d ) {
        // If date `d` is after maxDate, return maxDate.
        // Else, if date `d` is before minDate, return minDate.
        // Otherwise, return the date `d` as is.
        return this . _isAfterMaxDate ( d ) ? this . _getMaxDate ( ) :
            ( this . _isBeforeMinDate ( d ) ? this . _getMinDate ( ) : d ) ;
    } ,


    // Checks if the given date `d` is after the maximum allowed date.
    _isAfterMaxDate : function ( d ) {
        var maxDate = this . _getMaxDate ( ) ; // Retrieve the maximum date.
        // Return true if maxDate exists and `d` is strictly after maxDate.
        return this . _isXDate ( maxDate ) && d . diffDays ( maxDate ) < 0 ;
    } ,


    // Checks if the given date `d` is before the minimum allowed date.
    _isBeforeMinDate : function ( d ) {
        var m = this . _getMinDate ( ) ; // Retrieve the minimum date.
        // Return true if minDate exists and `d` is strictly before minDate.
        return this . _isXDate ( m ) && m . diffDays ( d ) < 0 ;
    } ,


    // Determines if the provided locale string `l` corresponds to a valid, loaded locale.
    _isValidLocale : function ( l ) {
        return typeof l === "string" && XDate . locales && XDate . locales [ l ] ;
    } ,


    // Checks if the given object `d` is an instance of the native Date object.
    _isDate : function ( d ) {
        return typeof d === "object" && d !== null && d . constructor === Date ;
    } ,


    // Checks if the given object `x` is an instance of the XDate object.
    _isXDate : function ( x ) {
        return typeof x === "object" && x !== null && x . constructor === XDate ;
    } ,


    // Retrieves the maximum allowed date as an XDate object.
    _getMaxDate : function ( ) {
        var maxDate = this . options . maxDate ;
        return this . _isDate ( maxDate ) ? new XDate ( maxDate ) : null ;
    } ,


    // Retrieves the minimum allowed date as an XDate object.
    _getMinDate : function ( ) {
        var minDate = this . options . minDate ;
        return this . _isDate ( minDate ) ? new XDate ( minDate ) : null ;
    } ,


    // Retrieves the currently selected date as an XDate object.
    _getDate : function ( ) {
        var date = this . options . date ;
        return this . _isDate ( date ) ? new XDate ( date ) : null ;
    } ,


    // Decrements the current date by one day.
    _prevDay : function ( ) {
        return this . _addDay ( -1 ) ;
    } ,

    // Increments the current date by one day.
    _nextDay : function ( ) {
        return this . _addDay ( 1 ) ;
    } ,

    // Decrements the current date by one month.
    _prevMonth : function ( ) {
        return this . _addMonth ( -1 ) ;
    } ,

    // Increments the current date by one month.
    _nextMonth : function ( ) {
        return this . _addMonth ( 1 ) ;
    } ,

    // Decrements the current date by one year.
    _prevYear : function ( ) {
        return this . _addYear ( -1 ) ;
    } ,

    // Increments the current date by one year.
    _nextYear : function ( ) {
        return this . _addYear ( 1 ) ;
    } ,

    // Adds or subtracts `y` years from the current date.
    _addYear : function ( y ) {
        return this . _getDate ( ) . addYears ( y , true ) ; // `true` for exact day.
    } ,

    // Adds or subtracts `m` months from the current date.
    _addMonth : function ( m ) {
        var date     = this . _getDate ( )           , // Current XDate object.
            month    = date . getMonth ( )           , // Current month (0-11).
            newMonth = ( 12 + month + m ) % 12 ;     // Calculate new month, handling wrap-around.
        return date . setMonth ( newMonth , true ) ; // Set new month, preserving day if possible.
    } ,

    // Adds or subtracts `d` days from the current date.
    _addDay : function ( d ) {
        var dt = this . _getDate ( )                                         , // Current XDate object.
            n  = XDate . getDaysInMonth ( dt . getFullYear ( ) , dt . getMonth ( ) ) ; // Days in current month.
        // Calculate new day, handling wrap-around within the month.
        return dt . setDate ( ( dt . getDate ( ) - 1 + n + d ) % n + 1 ) ;
    } ,


    //
    // View related methods (DOM manipulation and rendering).
    //


    // HTML markup fragments for constructing the date picker's UI.
    _markup_header : "<div class='mobipick-main'><div class='mobipick-date-formatted'>Date</div><ul class='mobipick-groups'>" ,
    _markup_d      : "<li><ul><li><a class='mobipick-next-day'>+</a></li><li><input type='text' class='mobipick-input mobipick-day' /></li><li><a class='mobipick-prev-day'>-</a></li></ul></li>" ,
    _markup_m      : "<li><ul><li><a class='mobipick-next-month'>+</a></li><li><input type='text' class='mobipick-input mobipick-month' /></li><li><a class='mobipick-prev-month'>-</a></li></ul></li>" ,
    _markup_y      : "<li><ul><li><a class='mobipick-next-year'>+</a></li><li><input type='text' class='mobipick-input mobipick-year' /></li><li><a class='mobipick-prev-year'>-</a></li></ul></li>" ,
    _markup_trailer: "</ul><ul class='mobipick-buttons'><li><a class='mobipick-set'>Set</a></li><li><a class='mobipick-cancel'>Cancel</a></li></ul></div>" ,


    // Applies jQuery Mobile theming and styling to the picker's elements.
    _applyTheme : function ( ) {

        var p       = this . _picker , // Reference to the picker's jQuery object.
            buttons = {
                "bottom" : "ul.mobipick-groups ul > li:first-child > a" , // Selector for bottom buttons.
                "top"    : "ul.mobipick-groups ul > li:last-child > a"   // Selector for top buttons.
            } ;

        // Apply corner styling to the plus/minus buttons.
        for ( var key in buttons ) {
            p . find ( buttons [ key ] ) . addClass ( "ui-corner-all" )
                . css ( "border-" + key + "-left-radius" , "0" )  // Remove specific corner radius.
                . css ( "border-" + key + "-right-radius" , "0" ) ; // Remove specific corner radius.
        }

        // Apply overall popup theme and corner styling.
        p . addClass ( "ui-body-" + this . options . popup . theme + " ui-corner-all" ) ;

        // Style all anchor tags within the picker as jQuery Mobile buttons.
        p . find ( "a" ) . attr ( "href" , "#" )
            . addClass ( "ui-body-" + this . options . buttonTheme ) ;

        // Apply corner styling to the main action buttons (Set/Cancel).
        p . find ( "ul.mobipick-buttons a" ) . addClass ( "ui-corner-all" ) ;

        // Make input fields read-only and apply shadow inset style.
        p . find ( "input" )
            . attr ( "readonly" , "readonly" ) . addClass ( "ui-shadow-inset" ) ;

    } ,


    // Constructs the date picker's DOM structure and initializes it as a popup.
    _createView : function ( ) {

        this . element . attr ( "readonly" , "readonly" ) ; // Make the target input element read-only.

        // Assemble the full markup string based on input order.
        var markup = this . _markup_header +
            this . options . inputOrder . split ( " " ) . map ( function ( v , i , a ) {
                return this [ "_markup_" + v ] ; // Insert day, month, year markup in specified order.
            } , this ) . join ( "" ) +
            this . _markup_trailer ;

        // Create the jQuery Mobile popup from the generated markup.
        this . _picker = $ ( markup ) . popup ( this . options . popup ) ;

        // Store a reference to this widget instance on the element's data.
        $ . data ( this . element , "mobipick" , this ) ;

        this . _applyTheme ( ) ; // Apply jQuery Mobile themes and custom styles.

    } ,


    // Updates the visual representation of the date picker based on current options.
    _updateView : function ( ) {

        var date = this . _getDate ( ) , // Get the current XDate object.
            p    = this . _picker ;      // Reference to the picker's jQuery object.

        // If a valid date exists, update the input fields and formatted date display.
        if ( this . _isXDate ( date ) ) {
            p . find ( ".mobipick-year"  ) . val ( date . toString ( "yyyy" ) ) ; // Set year.
            p . find ( ".mobipick-month" ) . val ( date . toString ( "MMM"  ) ) ; // Set month (e.g., "Jan").
            p . find ( ".mobipick-day"   ) . val ( date . toString ( "dd"   ) ) ; // Set day (e.g., "01").
            p . find ( ".mobipick-date-formatted" ) . text ( this . localeString ( ) ) ; // Update formatted display.
        }

        var locale = { } ; // Initialize an empty locale object.

        // If a valid locale is set, use it to update button texts.
        if ( this . _isValidLocale ( this . options . locale ) ) {
            XDate . defaultLocale = this . options . locale ; // Set XDate's default locale.
            locale = XDate . locales [ this . options . locale ] ; // Load locale strings.
        }

        // Update 'Set' and 'Cancel' button texts based on locale, or use defaults.
        p . find ( ".mobipick-set"    ) . text ( locale . ok     || "Set"    ) ;
        p . find ( ".mobipick-cancel" ) . text ( locale . cancel || "Cancel" ) ;

        // Adjust visibility of day, month, year columns based on `accuracy` option.
        var columns = p . find ( ".mobipick-groups > li" )
            . removeClass ( "mobipick-hide" )       // Ensure all are initially visible.
            . addClass ( "mobipick-inline-block" ) ; // Apply inline-block display.

        if ( this . options . accuracy === "month" ) {
            p . css ( "max-width" , "280px" ) // Adjust picker width for month accuracy.
                . find ( ".mobipick-groups > li:first-child" ) // Target the day column.
                . addClass ( "mobipick-hide" )                  // Hide the day column.
                . removeClass ( "mobipick-inline-block" ) ;
        } else if ( this . options . accuracy === "year" ) {
            p . css ( "max-width" , "200px" ) // Adjust picker width for year accuracy.
                . find ( ".mobipick-groups > li:last-child" ) // Target the year column.
                . siblings ( ) . addClass ( "mobipick-hide" ) // Hide siblings (day, month).
                . removeClass ( "mobipick-inline-block" ) ;
        } else {
            p . css ( "max-width" , "300px" ) ; // Default width for full date accuracy.
        }

        // Calculate and apply width to visible columns for even distribution.
        // Account for 1% left and right margin per column.
        var columnCount = columns . filter ( ":visible" ) . size ( ) ,
            width       = ( ( 100 - columnCount * 2 ) / columnCount ) + "%" ;
        columns . css ( "width" , width ) ;

    } ,


    // Displays the date picker popup to the user.
    _showView : function ( ) {
        this . _picker . show ( ) . popup ( "open" ) . focus ( ) ; // Show, open as popup, and focus.
    } ,


    // Hides the date picker popup.
    _hideView : function ( ) {
        this . _picker . popup ( "close" ) ; // Close the jQuery Mobile popup.
    } ,


    // Updates the value of the associated input element with the current date.
    updateDateInput : function ( ) {
        this . element . val ( this . options . intlStdDate ?
            this . dateString ( ) : this . localeString ( )
        ) ;
    }
} ) ; // End of widget definition.

} ) ) ; // End of IIFE.