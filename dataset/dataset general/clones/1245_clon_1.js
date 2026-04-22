/*
 * This is a modified version of Supercal 0.1.1.
 * It's a jQuery plugin that provides a calendar widget,
 * with support for Bootstrap styling.
 *
 * Original Author: James Waples (2013)
 * Project Link: https://github.com/jamwaffles/SuperCal
 *
 * This file has been subjected to Type I cloning,
 * meaning only whitespace and comments have been altered.
 */

( function ( factory ) {

    // Check for AMD loader (e.g., RequireJS)
    if ( typeof define === 'function' && define.amd ) {

        // Define module with jQuery dependency
        define( [ 'jquery' ] , factory );

    } else {

        // Fallback for environments without AMD, attach to global jQuery
        factory( jQuery );

    }

} ( function ( $ ) {

    // The main plugin logic starts here

    // Default configuration options for the SuperCal plugin.
    var defaults = {
        todayButton: true, // Indicates whether to display a button that navigates to today's date.
        showInput: true, // Controls the visibility of the date input field in the footer.
        weekStart: 1, // Defines the starting day of the week. 0 for Sunday, 1 for Monday (common default), up to 6 for Saturday.
        widget: true, // General widget setting (might be used for specific internal logic or future extensions).
        cellRatio: 1, // Ratio for calendar cell dimensions (potentially affects styling and layout).
        format: 'd/m/y', // The default date format string for display in the input and footer.
        footer: true, // Determines if the calendar footer (with input and today button) is shown.
        dayHeader: true, // Controls the visibility of the day names (e.g., Sun, Mon) header row.
        mode: 'widget', // The operational mode of the calendar: 'widget' (default), 'tiny', 'popup', or 'page'.
        animDuration: 200, // Duration in milliseconds for animations (e.g., month transitions).
        transition: '', // Specifies the type of transition animation between months (e.g., 'fade', 'carousel-horizontal').
        tableClasses: 'table table-condensed', // CSS classes applied to the main calendar table, useful for Bootstrap integration.
        hidden: true, // If true, the popup calendar will initially be hidden upon creation.
        setOnMonthChange: true, // When true, navigating to a new month will update the associated input field.
        condensed: false // A flag to apply a condensed styling to the calendar's appearance.
    };


    // Current date and time, used as a reference point for 'today'.
    var now = new Date();


    // Arrays for full and abbreviated month names, indexed 0-11.
    var months      = [ 'January' , 'February' , 'March' , 'April' , 'May' , 'June' , 'July' , 'August' , 'September' , 'October' , 'November' , 'December' ];
    var shortMonths = [ 'Jan'     , 'Feb'      , 'Mar'   , 'Apr'   , 'May'  , 'Jun'  , 'Jul'  , 'Aug'    , 'Sep'       , 'Oct'     , 'Nov'      , 'Dec'      ];

    // Arrays for full and abbreviated day names, indexed 0-6 (Sunday-Saturday).
    var days        = [ 'Sunday' , 'Monday' , 'Tuesday' , 'Wednesday' , 'Thursday' , 'Friday' , 'Saturday' ];
    var shortDays   = [ 'Sun'    , 'Mon'    , 'Tue'     , 'Wed'       , 'Thu'      , 'Fri'    , 'Sat'      ];


    // Extend the Date prototype with utility functions.

    /*
     * Calculates the number of days in the current month, or a month relative to it.
     * @param {number} [delta=0] - Offset from the current month (e.g., 1 for next month, -1 for previous).
     * @returns {number} The number of days in the specified month.
     */
    Date.prototype.daysInMonth = function ( delta ) {

        // Ensure delta is a number, defaulting to 0 if undefined.
        delta = ( delta === undefined ) ? 0 : delta;

        // Create a date object for the 0th day of the month after the target month.
        // This cleverly gets the last day of the target month.
        return new Date( this.getFullYear() , this.getMonth() + 1 + delta , 0 ) .getDate();
    };


    /*
     * Checks if this Date object represents the same day as another Date object, or today if none is provided.
     * @param {Date} [day] - The Date object to compare against. If omitted, compares to the current date.
     * @returns {boolean} True if the dates represent the same day (year, month, and date), false otherwise.
     */
    Date.prototype.isDay = function ( day ) {

        // If no comparison day is provided, use the current date.
        if ( day === undefined ) {
            day = new Date();
        }

        // Compare year, month, and day components using loose equality.
        return this.getFullYear() == day.getFullYear()
            && this.getMonth() == day.getMonth()
            && this.getDate() == day.getDate();
    };


    /*
     * Determines if the Date object is a valid date.
     * @returns {boolean} True if the date is valid, false if it's an "Invalid Date".
     */
    Date.prototype.isValid = function () {
        // Check if it's a Date object and if its time value is not NaN.
        return Object.prototype.toString.call( this ) === "[object Date]" && !isNaN( this.getTime() );
    };


    // Define the SuperCal jQuery plugin.
    $.fn.supercal = function ( method ) {

        // Private utility methods, not exposed directly to the plugin user.
        var pMethods = {

            /**
             * Draws the main calendar widget into the target element.
             * This is used for 'widget' mode.
             * @param {Date} selectedDate - The date to display in the calendar. Defaults to 'now'.
             * @param {boolean} [replace=false] - If true, clears the existing content before drawing.
             * @returns {jQuery} The target element.
             */
            drawCalendar: function ( selectedDate , replace ) {

                // Retrieve plugin options from the data attribute of the target element.
                var options = $( this ).data( 'options' );

                // Default to current date if no selectedDate is provided.
                selectedDate = selectedDate || now;

                // If 'replace' is true, empty the container before adding new elements.
                if ( replace !== undefined && replace == true ) {
                    this.empty();
                }

                // Draw the calendar header and append it to the current element.
                pMethods.drawHeader( selectedDate , options ) .appendTo( this );

                // Draw the month grid and mark it as the current active month.
                var month = pMethods
                                .drawMonth( selectedDate , options )
                                .addClass( 'current' );

                // Create a container div for the month grid and append it.
                $( '<div />' )
                    .addClass( 'supercal-month' )
                    .html( month )
                    .appendTo( this );

                // Draw the calendar footer and append it.
                pMethods.drawFooter( selectedDate , options ) .appendTo( this );

                // Store state information in the element's data attributes for later access.
                $( this ).data( 'supercal' , true );
                $( this ).data( 'date' , selectedDate );
                $( this ).data( 'element' , this ); // Store a reference to the element itself.

                return this; // Allow for method chaining.
            },


            /**
             * Draws a popup calendar, typically associated with an input field.
             * This is used for 'popup' mode.
             * @param {Date} selectedDate - The date to display. Defaults to 'now'.
             * @param {boolean} [replace=false] - Placeholder, not fully utilized in current implementation for popups.
             * @returns {jQuery} The target element (the input field that triggers the popup).
             */
            drawPopupCalendar: function ( selectedDate , replace ) {

                var options = $( this ).data( 'options' ); // Get options for the current instance.

                selectedDate = selectedDate || now; // Use current date if not specified.

                var container , calendar;

                // Check if the popup wrapper already exists to avoid recreating it.
                if ( $( this ).parent( '.supercal-popup-wrapper' ).length ) {
                    container = $( this ).parent(); // Use existing wrapper.
                    calendar  = $( this ).parent().find( '.supercal-popup' ); // Use existing popup.
                    calendar.empty(); // Clear its contents before redrawing.
                } else {
                    // Create new wrapper and popup elements if they don't exist.
                    container = $( '<div />' ).addClass( 'supercal-popup-wrapper' );
                    calendar  = $( '<div />' )
                                    .addClass( 'supercal supercal-popup' )
                                    .width( $( this ).outerWidth( true ) ); // Match the width of the trigger element.

                    $( this ).wrap( container ); // Wrap the trigger element with the container.
                }

                $( this ).after( calendar ); // Insert the calendar popup element immediately after the trigger.

                // Hide the calendar if the 'hidden' option is true.
                if ( options.hidden ) {
                    calendar.hide();
                }

                pMethods.drawHeader( selectedDate , options ) .appendTo( calendar ); // Add header to popup.

                var month = pMethods
                                .drawMonth( selectedDate , options )
                                .addClass( 'current' ); // Draw month grid.

                $( '<div />' )
                    .addClass( 'supercal-month' )
                    .html( month )
                    .appendTo( calendar ); // Add month grid to popup.

                // Store data on the popup calendar element itself.
                calendar.data( 'supercal' , true );
                calendar.data( 'date' , selectedDate );
                calendar.data( 'element' , this ); // Reference back to the original trigger element.
                calendar.data( 'options' , options );

                // Wrap the parent (wrapper) in another div for positioning/affixing purposes.
                $( this ).parent().wrap( $( '<div />' ).addClass( 'supercal-affix' ) );

                return this; // Return the original trigger element for chaining.
            },


            /**
             * Renders the header section of the calendar, including navigation buttons and month/year display.
             * @param {Date} date - The date currently displayed in the calendar.
             * @param {object} options - The plugin options.
             * @returns {jQuery} The generated header element.
             */
            drawHeader: function ( date , options ) {

                var header = $( '<div />' ).addClass( 'supercal-header' ); // Create the main header container.
                var monthNames = options.shortMonths ? shortMonths : months; // Determine whether to use short or full month names.

                // Add the "previous month" button.
                $( '<button />' )
                    .addClass( 'prev-month change-month btn' )
                    .html( '&laquo;' ) // HTML entity for a left arrow.
                    .appendTo( header );

                // Add the "next month" button.
                $( '<button />' )
                    .addClass( 'next-month change-month btn' )
                    .html( '&raquo;' ) // HTML entity for a right arrow.
                    .appendTo( header );

                // Add the display for the current month and year.
                $( '<span />' )
                    .addClass( 'month' )
                    .append( '<div>' + monthNames[ date.getMonth() ] + ' ' + date.getFullYear() + '</div>' )
                    .appendTo( header );

                return header; // Return the complete header element.
            },


            /**
             * Generates the HTML table for a given month's calendar grid.
             * This includes days from the previous and next months to fill out the grid.
             * @param {Date} date - The date for which to draw the month.
             * @param {object} options - The plugin options.
             * @returns {jQuery} The generated table element representing the month.
             */
            drawMonth: function ( date , options ) {

                date = date || now; // Default to current date if none provided.
                // Get the first day of the month being drawn.
                var monthStart = new Date( date.getFullYear() , date.getMonth() , 1 , 0 , 0 , 0 );
                var daysArray = []; // Array to hold all day objects for the grid (42 cells).
                var rows = []; // Array to hold rows of 7 days.
                var table = $( '<table />' ).addClass( options.tableClasses ); // Create the main calendar table element.

                // Calculate number of days from previous month to display.
                // This determines how many days from the *previous* month appear in the *current* month's grid.
                var numPrevDays = monthStart.getDay() - options.weekStart;
                // If the result is negative, it means the first day of the month is after the configured 'weekStart'.
                // For example, if weekStart is Monday (1) and monthStart.getDay() is Sunday (0), numPrevDays would be -1.
                // In such cases, no days from the previous month are shown, which is implicitly handled by the loop condition.


                // Get number of days in the current month.
                var numCurrentDays = date.daysInMonth();
                // Calculate number of days from the next month to display to fill a standard 6-week grid (42 cells).
                var numNextDays = 42 - numPrevDays - numCurrentDays;

                // Get the total days in the previous month, needed for displaying previous month's dates.
                var daysInLastMonth = date.daysInMonth( -1 );


                // --- Header Row for Days of the Week ---
                if ( options.dayHeader ) {
                    var tableHeader = $( '<tr />' ); // Create a table row for day names.

                    for ( var i = 0 ; i <= 6 ; i++ ) {
                        var dayIndex = i + options.weekStart;

                        // Adjust dayIndex if it wraps around the end of the week (e.g., if weekStart is Monday and i=0 is Monday).
                        if ( dayIndex > 6 ) {
                            dayIndex = i - 7 + options.weekStart; // Corrected calculation for wrapping
                        }

                        $( '<th />' )
                            .text( shortDays[ dayIndex ] ) // Display abbreviated day name.
                            .appendTo( tableHeader );
                    }

                    table.append( tableHeader ); // Add the header row to the table.
                }


                // --- Populate Days: Previous Month ---
                for ( var i = 1 ; i <= numPrevDays ; i++ ) {
                    var day = ( daysInLastMonth - numPrevDays ) + i;

                    daysArray.push( {
                        date: new Date( date.getFullYear() , date.getMonth() - 1 , day , 0 , 0 , 0 ),
                        displayNumber: day,
                        classes: 'month-prev' // Class to style days from the previous month.
                    } );
                }


                // --- Populate Days: Current Month ---
                for ( var i = 1 ; i <= numCurrentDays ; i++ ) {
                    var dayObj = {
                        date: new Date( date.getFullYear() , date.getMonth() , i , 0 , 0 , 0 ),
                        displayNumber: i,
                        classes: ''
                    };

                    // Add 'today' class if the day is today's date.
                    if ( dayObj.date.isDay() ) {
                        dayObj.classes = 'today';
                    }

                    // Add 'selected' class if the day matches the selectedDate for this calendar instance.
                    if ( dayObj.date.isDay( date ) ) {
                        dayObj.classes += ( dayObj.classes ? ' ' : '' ) + 'selected';
                    }

                    daysArray.push( dayObj ); // Add the day object to the main array.
                }


                // --- Populate Days: Next Month ---
                for ( var i = 1 ; i <= numNextDays ; i++ ) {
                    daysArray.push( {
                        date: new Date( date.getFullYear() , date.getMonth() + 1 , i , 0 , 0 , 0 ),
                        displayNumber: i,
                        classes: 'month-next' // Class to style days from the next month.
                    } );
                }


                // --- Slice the flat array of days into weeks (rows of 7 days) ---
                rows = [
                    daysArray.slice( 0 , 7 ),
                    daysArray.slice( 7 , 14 ),
                    daysArray.slice( 14 , 21 ),
                    daysArray.slice( 21 , 28 ),
                    daysArray.slice( 28 , 35 ),
                    daysArray.slice( 35 ) // The last row, which might have fewer than 7 days if the calendar doesn't fill 6 full weeks.
                ];


                // --- Append rows and cells to the table ---
                for ( var rowIdx = 0 ; rowIdx < 6 ; rowIdx++ ) {
                    var tr = $( '<tr />' ); // Create a new table row.

                    for ( var colIdx = 0 ; colIdx < 7 ; colIdx++ ) {
                        var cellData = rows[ rowIdx ][ colIdx ]; // Get the day data for the current cell.

                        // Create a table data cell (<td>).
                        $( '<td />' )
                            .data( 'date' , cellData.date ) // Store the actual Date object in the cell's data.
                            .text( cellData.displayNumber ) // Display the day number.
                            .addClass( cellData.classes ) // Apply relevant CSS classes to the cell.
                            .appendTo( tr );
                    }

                    tr.appendTo( table ); // Add the completed row to the table.
                }

                return table; // Return the fully constructed month table.
            },


            /**
             * Renders the footer section of the calendar, which may include a "Today" button and a date input/display.
             * @param {Date} date - The currently selected date.
             * @param {object} options - The plugin options.
             * @returns {jQuery} The generated footer element.
             */
            drawFooter: function ( date , options ) {

                var footer = $( '<div />' ).addClass( 'supercal-footer input-prepend' );

                // Hide the footer if the 'footer' option is explicitly set to false.
                if ( options.footer == false ) {
                    footer.hide();
                }

                // Add the "Today" button if enabled by options.
                if ( options.todayButton ) {
                    $( '<button />' )
                        .text( 'Today' )
                        .addClass( 'btn supercal-today' )
                        .attr( 'type' , 'button' ) // Explicitly set type to 'button' to prevent form submission.
                        .appendTo( footer );
                }

                // Add the display input field (as an uneditable span) if enabled.
                if ( options.showInput ) {
                    $( '<span />' )
                        .text( pMethods.formatDate( date , options ) ) // Format the date for display.
                        .addClass( 'supercal-input uneditable-input span2' )
                        .appendTo( footer );
                }

                // Always add a hidden input field to store the date timestamp, regardless of showInput.
                $( '<input />' )
                    .prop( 'type' , 'hidden' )
                    .val( parseInt( date.getTime() / 1000 , 10 ) ) // Store date as Unix timestamp (seconds since epoch).
                    .appendTo( footer );

                return footer; // Return the complete footer element.
            },


            /**
             * Formats a given Date object into a string based on the specified format.
             * This is a simple formatter, not a full-featured date library, but handles common cases.
             * Supported format characters: 'd' (day), 'm' (month), 'y' (two-digit year), 'Y' (four-digit year).
             * @param {Date} date - The Date object to format.
             * @param {object} options - The plugin options, containing the 'format' string.
             * @returns {string} The formatted date string.
             */
            formatDate: function ( date , options ) { // This is a rather primitive date format function, designed for specific needs.

                return options.format
                    .replace( 'd' , ( '0' + date.getDate() ).substr( -2 ) ) // Day of the month (e.g., 01, 15, 31).
                    .replace( 'm' , ( '0' + ( date.getMonth() + 1 ) ).substr( -2 ) ) // Month of the year (e.g., 01, 07, 12).
                    .replace( 'y' , date.getFullYear().toString().substr( -2 ) ) // Two-digit year (e.g., 13 for 2013).
                    .replace( 'Y' , date.getFullYear() ); // Four-digit year (e.g., 2013).
            }
        };


        // Public methods that can be called on the SuperCal plugin instance.
        var methods = {

            /**
             * Initializes the SuperCal plugin on the selected elements.
             * Sets up options, attaches global event handlers (if not already done),
             * and draws the initial calendar based on the configured mode.
             * @param {object} [settings] - User-provided options to override defaults.
             * @returns {jQuery} The jQuery object for chaining.
             */
            init: function ( settings ) {

                // Merge default options with user-provided settings to create the final options object.
                var options = $.extend( {} , defaults , settings );


                // --- Global Event Handlers (attached only once to the document) ---
                // Check if events have already been bound to avoid duplicates.
                if ( !$( document ).data( 'supercal-events' ) ) {

                    $( document )

                        // Event for changing month via navigation buttons (prev/next).
                        .on( 'click.supercal' , '.supercal .change-month' , function ( e ) {
                            e.preventDefault(); // Prevent default button action (e.g., page scroll).
                            e.stopPropagation(); // Stop event propagation to avoid conflicts.

                            // Determine direction based on button class ('next-month' or 'prev-month')
                            // and call the changeMonth method on the closest calendar instance.
                            methods.changeMonth.apply( $( this ).closest( '.supercal' ) , [ $( this ).hasClass( 'next-month' ) ? 1 : -1 , $( this ).closest( '.supercal' ).data( 'options' ) ] );
                        } )

                        // Event for the "Today" button in the calendar footer.
                        .on( 'click.supercal' , '.supercal-today' , function () {
                            // Call changeMonth to navigate to today's date, using the global 'now' variable.
                            methods.changeMonth.apply( $( this ).closest( '.supercal' ) , [ now , $( this ).closest( '.supercal' ).data( 'options' ) ] );
                        } )

                        // Event for selecting a day within the current month's calendar grid.
                        .on( 'click.supercal' , '.supercal table.current td' , function () {
                            var container = $( this ).closest( '.supercal' ); // The main calendar container element.
                            var table     = $( this ).closest( 'table' ); // The specific calendar table.

                            table.find( '.selected' ).removeClass( 'selected' ); // Remove 'selected' class from any previously selected day.
                            $( this ).addClass( 'selected' ); // Add 'selected' class to the clicked day cell.

                            // Redraw the footer with the newly selected date to update the display.
                            container.find( '.supercal-footer' ).replaceWith( pMethods.drawFooter( $( this ).data( 'date' ) , $( this ).closest( '.supercal' ).data( 'options' ) ) );
                            container.data( 'date' , $( this ).data( 'date' ) ); // Update the container's stored date.
                        } )

                        // --- Popup specific events ---
                        // Event for opening a popup calendar when its trigger element is clicked.
                        .on( 'click.supercal' , '.supercal-popup-trigger' , function ( e ) {
                            // Add 'supercal-open' class to the parent wrapper and show the popup calendar.
                            $( this ).parent( '.supercal-popup-wrapper' ).addClass( 'supercal-open' ).find( '.supercal-popup' ).show();

                            // Close any other currently open popup calendars to ensure only one is active at a time.
                            $( '.supercal-popup-wrapper.supercal-open' ).not( $( this ).parent() ).removeClass( 'supercal-open' ).find( '.supercal-popup' ).hide();
                        } )

                        // Event for clicking anywhere on the document to close an open popup calendar.
                        .on( 'click.supercal' , function ( e ) {
                            var target = $( e.target ); // The element that was clicked.

                            // If the click was not inside any active popup wrapper, close all open popups.
                            if ( !target.closest( '.supercal-popup-wrapper' ).length ) {
                                $( '.supercal-popup-wrapper.supercal-open' ).removeClass( 'supercal-open' ).find( '.supercal-popup' ).hide();
                            }
                        } )

                        // Event triggered when any calendar day (<td>) is clicked.
                        .on( 'click.supercal' , '.supercal td' , function () {
                            var thisDate        = $( this ).data( 'date' ); // The Date object of the clicked cell.
                            var originalElement = $( this ).closest( '.supercal' ).data( 'element' ); // The original element that initialized the calendar (e.g., the input field).
                            var formattedDate   = pMethods.formatDate( $( this ).data( 'date' ) , $( this ).closest( '.supercal' ).data( 'options' ) ); // Formatted date string for display.

                            // Trigger a custom 'dateselect' event on the original element, passing the selected date.
                            $( originalElement ).trigger( 'dateselect' , [ thisDate ] );

                            // If the original element has a 'supercal-popup-trigger' child (i.e., an input), update its value.
                            $( originalElement ).children( '.supercal-popup-trigger' ).val( formattedDate ).trigger( 'change' );
                        } );

                    $( document ).data( 'supercal-events' , true ); // Mark events as bound to prevent re-binding.
                }


                // --- Initialization for each selected element in the jQuery collection ---
                return this.each( function () {

                    var element;

                    // If the target element is an input field, create a wrapper div for the calendar and place it after the input.
                    if ( $( this ).is( ':input' ) ) {
                        element = $( '<div />' ); // The calendar will be drawn into this new div.
                        $( this ).addClass( 'supercal-target' ).after( element ); // Add target class to input and insert the new div after it.
                    } else {
                        element = this; // If not an input, use the element itself as the calendar container.
                    }

                    // Add base classes and the specified transition class to the calendar element.
                    $( element ).addClass( 'supercal ' + options.transition );
                    $( element ).data( 'options' , options ); // Store the resolved options on the element for instance-specific settings.

                    if ( options.transition ) {
                        $( element ).addClass( 'transition' );
                    }

                    if ( options.condensed ) {
                        $( element ).addClass( 'condensed' );
                    }

                    // Draw the calendar based on the specified mode.
                    switch ( options.mode ) {
                        case 'popup':
                            $( element ).addClass( 'supercal-popup-trigger' ); // Mark this element as the trigger for a popup.
                            pMethods.drawPopupCalendar.apply( element , options.date ); // Draw the popup calendar.
                            break; // Explicit break for switch case.
                        case 'widget':
                        default:
                            pMethods.drawCalendar.call( element , options.date ); // Draw the standard widget calendar.
                            break; // Explicit break for switch case.
                    }
                } );
            },


            /**
             * Changes the displayed month of the calendar.
             * Can navigate to a relative month (e.g., next/prev) or a specific date (like 'today').
             * @param {number|Date} month - If a number, it's a delta (1 or -1) for next/prev month. If a Date object, navigates to that date.
             * @param {object} options - The plugin options for the current instance.
             */
            changeMonth: function ( month , options ) {

                var newDay , newDate , direction , newCalendar;

                var container   = $( this ); // The main calendar container element.
                var calendar    = $( this ).find( 'table' ); // The currently displayed month table.

                var currentDate = container.data( 'date' ); // The date currently stored in the container's data.
                var calWidth    = calendar.outerWidth( true ); // Outer width of the calendar table (including padding/margin).
                var calHeight   = calendar.outerHeight( true ); // Outer height of the calendar table.

                // Set the height of the calendar's parent to match the table's height to prevent layout jumps during animation.
                calendar.parent().height( calHeight );


                // Determine the new target date and the direction of navigation.
                if ( typeof month === 'number' ) {
                    direction = ( month > 0 ) ? 1 : -1; // +1 for next month, -1 for previous.
                    // Calculate the new day, clamping it to the maximum days in the target month.
                    // For example, if current date is March 31st and navigating to February, it becomes February 28th/29th.
                    newDay    = Math.min( currentDate.daysInMonth( month ) , currentDate.getDate() );
                    newDate   = new Date( currentDate.getFullYear() , currentDate.getMonth() + direction , newDay );
                } else if ( month instanceof Date ) {
                    direction = ( month > currentDate ) ? 1 : -1; // Determine direction based on comparison with current date.
                    newDate   = now; // If 'month' is a Date object, it's typically 'now' for the "Today" button action.
                }

                calendar.stop( true , true ); // Stop any current animations on the calendar and clear its animation queue.
                container.data( 'date' , newDate ); // Update the stored date in the container to the new month's date.
                newCalendar = pMethods.drawMonth( newDate , options ).addClass( 'current' ); // Draw the new month's calendar table.


                // --- Apply Transition Effects based on options.transition ---
                switch ( options.transition ) {
                    case 'fade':
                        calendar.fadeOut( options.animDuration , function () {
                            // After the old calendar fades out, replace it with the new one and fade the new one in.
                            $( this ).replaceWith( newCalendar.hide().fadeIn( options.animDuration ) );
                        } );
                        break;
                    case 'crossfade': // Crossfade effect: old fades out while new fades in.
                        calendar.removeClass( 'current' ).after( newCalendar ); // Add new calendar next to the old one.
                        calendar.animate( { opacity: 0 } , options.animDuration ); // Animate the old calendar's opacity to 0.
                        newCalendar.css( { opacity: 0 , position: 'absolute' , top: 0 } ).animate( { opacity: 1 } , options.animDuration ); // Animate the new calendar's opacity to 1.
                        break;
                    case 'carousel-horizontal':
                        calendar.css( { position: 'absolute' } ).animate( { left: -( calWidth * direction ) } ).after( newCalendar ); // Slide the old calendar out horizontally.
                        newCalendar.css( { left: direction * calWidth , position: 'absolute' } ).animate( { left: 0 } ); // Slide the new calendar in horizontally.
                        break;
                    case 'carousel-vertical': // Vertical slide effect.
                        calendar.css( { position: 'absolute' } ).animate( { top: -( calHeight * direction ) } ).after( newCalendar ); // Slide the old calendar out vertically.
                        newCalendar.css( { top: direction * calHeight , position: 'absolute' } ).animate( { top: 0 } ); // Slide the new calendar in vertically.
                        break;
                    default: // No transition - default behavior, simply replace.
                        calendar.replaceWith( newCalendar ); // Immediately replace the old calendar with the new one.
                        break;
                }

                // Remove the old calendar table after the transition completes or immediately if no transition.
                newCalendar.promise().done( function () {
                    container.find( 'table' ).not( newCalendar ).remove();
                } );

                // Update the header and footer sections with the new month's information.
                container.find( '.supercal-header' ).replaceWith( pMethods.drawHeader( newDate , options ) );
                container.find( '.supercal-footer' ).replaceWith( pMethods.drawFooter( newDate , options ) );

                // If enabled, update the value of the associated input element (if it exists).
                if ( options.setOnMonthChange ) {
                    container.prev( '.supercal-target' ).val( $( this ).data( 'date' ) ).trigger( 'change' );
                }
            },


            /**
             * Retrieves the currently selected date from the calendar instance.
             * This method can be called externally on the plugin.
             * @returns {Date|boolean} The selected Date object, or false if no calendar instance or date is found.
             */
            date: function () { // Returns the currently selected date of the calendar instance.
                // If the plugin was initialized on an input, the calendar itself is the next sibling.
                if ( $( this ).next( '.supercal' ).length ) {
                    return $( this ).next( '.supercal' ).data( 'date' );
                }
                // If the plugin was initialized directly on a container element.
                else if ( $( this ).data( 'supercal' ) ) {
                    return $( this ).data( 'date' );
                }

                return false; // No calendar instance or date found.
            }
        };


        // --- Plugin Method Dispatcher ---
        // This handles calling specific methods or initializing the plugin.
        if ( methods[ method ] ) {
            // If the requested method exists, call it with the provided arguments (excluding the method name itself).
            return methods[ method ].apply( this , Array.prototype.slice.call( arguments , 1 ) );
        } else if ( typeof method === 'object' || !method ) {
            // If the argument is an object (settings) or no argument is provided, initialize the plugin.
            return methods.init.apply( this , arguments );
        }
    };

} ) );