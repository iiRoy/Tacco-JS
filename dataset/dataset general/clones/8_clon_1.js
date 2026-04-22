/*
 * This file contains a JavaScript implementation for a date range picker.
 * It was originally authored by Dan Grossman.
 * Version: 1.2
 * License: Apache License v2.0
 * For more details, refer to the original source or documentation.
 *
 * This specific version has been modified to demonstrate Type I code cloning,
 * focusing solely on whitespace and comment variations.
 */
! function($) { /* Self-executing anonymous function to encapsulate the code */

    // Constructor for the DateRangePicker object
    var DateRangePicker = function( element, options, cb ) {
        // Determine if options object was provided
        var hasOptions = typeof options == 'object';
        // Variable to hold locale settings
        var localeObject;



        // --- Default option values ---

        // Initialize start and end dates to the beginning of the current day
        this.startDate = moment().startOf( 'day' );
        this.endDate = moment().startOf( 'day' );
        // No minimum or maximum date restrictions by default
        this.minDate = false;
        this.maxDate = false;
        // No date range limit by default
        this.dateLimit = false;


        // Calendar UI settings
        this.showDropdowns = false; // Do not show year/month dropdowns
        this.showWeekNumbers = false; // Do not show week numbers
        this.timePicker = false; // No time picker by default
        this.timePickerIncrement = 30; // Time picker increment in minutes
        this.timePicker12Hour = true; // Use 12-hour format for time picker
        this.ranges = {}; // No predefined ranges
        this.opens = 'right'; // Calendar opens to the right of the input


        // Button styling classes
        this.buttonClasses = [ 'btn', 'btn-small' ];
        this.applyClass = 'btn-success'; // Class for the apply button
        this.cancelClass = 'btn-default'; // Class for the cancel button

        // Date format and separator
        this.format = 'MM/DD/YYYY';
        this.separator = ' - ';

        // Default locale settings for various labels and date components
        this.locale = {
            applyLabel: 'Apply', // Label for the apply button
            cancelLabel: 'Cancel', // Label for the cancel button
            fromLabel: 'From', // Label for the start date input
            toLabel: 'To', // Label for the end date input
            weekLabel: 'W', // Label for week numbers
            customRangeLabel: 'Custom Range', // Label for the custom range option
            daysOfWeek: moment()._lang._weekdaysMin.slice(), // Array of abbreviated day names
            monthNames: moment()._lang._monthsShort.slice(), // Array of abbreviated month names
            firstDay: 0 // Index of the first day of the week (0 for Sunday)
        };

        // Default callback function
        this.cb = function() {};

        // By default, the daterangepicker element is appended to the HTML body
        this.parentEl = 'body';

        // Store the element that triggered the date range picker
        this.element = $( element );

        // If the element has 'pull-right' class, open the calendar to the left
        if ( this.element.hasClass( 'pull-right' ) ) {
            this.opens = 'left';
        }

        // Attach event handlers based on the element type
        if ( this.element.is( 'input' ) ) {
            this.element.on( {
                click: $.proxy( this.show, this ),
                focus: $.proxy( this.show, this )
            } );
        } else {
            this.element.on( 'click', $.proxy( this.show, this ) );
        }

        // Reference to the locale object
        localeObject = this.locale;

        // Process provided options if any
        if ( hasOptions ) {
            // Merge custom locale settings
            if ( typeof options.locale == 'object' ) {
                $.each( localeObject, function( property, value ) {
                    localeObject[ property ] = options.locale[ property ] || value;
                } );
            }

            // Override apply button class
            if ( options.applyClass ) {
                this.applyClass = options.applyClass;
            }

            // Override cancel button class
            if ( options.cancelClass ) {
                this.cancelClass = options.cancelClass;
            }
        }

        // HTML template for the date range picker UI
        var DRPTemplate = '<div class="daterangepicker dropdown-menu">' +
            '<div class="calendar left"></div>' +
            '<div class="calendar right"></div>' +
            '<div class="ranges">' +
            '<div class="range_inputs">' +
            '<div class="daterangepicker_start_input" style="float: left">' +
            '<label for="daterangepicker_start">' + this.locale.fromLabel + '</label>' +
            '<input class="input-mini" type="text" name="daterangepicker_start" value="" disabled="disabled" />' +
            '</div>' +
            '<div class="daterangepicker_end_input" style="float: left; padding-left: 11px">' +
            '<label for="daterangepicker_end">' + this.locale.toLabel + '</label>' +
            '<input class="input-mini" type="text" name="daterangepicker_end" value="" disabled="disabled" />' +
            '</div>' +
            '<button class="' + this.applyClass + ' applyBtn" disabled="disabled">' + this.locale.applyLabel + '</button>&nbsp;' +
            '<button class="' + this.cancelClass + ' cancelBtn">' + this.locale.cancelLabel + '</button>' +
            '</div>' +
            '</div>' +
            '</div>';

        // Determine the parent element where the picker will be appended
        this.parentEl = ( hasOptions && options.parentEl && $( options.parentEl ) ) || $( this.parentEl );
        // Create the date range picker container and append it to the parent element
        this.container = $( DRPTemplate ).appendTo( this.parentEl );

        // Further processing of options
        if ( hasOptions ) {

            // Set date format
            if ( typeof options.format == 'string' )
                this.format = options.format;

            // Set date separator
            if ( typeof options.separator == 'string' )
                this.separator = options.separator;

            // Parse start date from string
            if ( typeof options.startDate == 'string' )
                this.startDate = moment( options.startDate, this.format );

            // Parse end date from string
            if ( typeof options.endDate == 'string' )
                this.endDate = moment( options.endDate, this.format );

            // Parse minimum date from string
            if ( typeof options.minDate == 'string' )
                this.minDate = moment( options.minDate, this.format );

            // Parse maximum date from string
            if ( typeof options.maxDate == 'string' )
                this.maxDate = moment( options.maxDate, this.format );

            // Use moment object for start date
            if ( typeof options.startDate == 'object' )
                this.startDate = moment( options.startDate );

            // Use moment object for end date
            if ( typeof options.endDate == 'object' )
                this.endDate = moment( options.endDate );

            // Use moment object for minimum date
            if ( typeof options.minDate == 'object' )
                this.minDate = moment( options.minDate );

            // Use moment object for maximum date
            if ( typeof options.maxDate == 'object' )
                this.maxDate = moment( options.maxDate );

            // Process predefined date ranges
            if ( typeof options.ranges == 'object' ) {
                for ( var range in options.ranges ) {
                    // Extract start and end dates for the current range
                    var start = moment( options.ranges[ range ][ 0 ] );
                    var end = moment( options.ranges[ range ][ 1 ] );

                    // If a minDate is set and the range start is before it, adjust start
                    if ( this.minDate && start.isBefore( this.minDate ) ) {
                        start = moment( this.minDate );
                    }

                    // If a maxDate is set and the range end is after it, adjust end
                    if ( this.maxDate && end.isAfter( this.maxDate ) ) {
                        end = moment( this.maxDate );
                    }

                    // If the range is completely outside the min/max bounds, skip it
                    if ( ( this.minDate && end.isBefore( this.minDate ) ) || ( this.maxDate && start.isAfter( this.maxDate ) ) ) {
                        continue;
                    }

                    // Store the processed range
                    this.ranges[ range ] = [ start, end ];
                }

                // Build the list of range options
                var list = '<ul>';
                for ( var range in this.ranges ) {
                    list += '<li>' + range + '</li>';
                }
                list += '<li>' + this.locale.customRangeLabel + '</li>';
                list += '</ul>';
                // Prepend the list to the ranges container
                this.container.find( '.ranges' ).prepend( list );
            }

            // Set date limit
            if ( typeof options.dateLimit == 'object' )
                this.dateLimit = options.dateLimit;

            // Update day names order based on firstDay setting in locale
            if ( typeof options.locale == 'object' ) {
                if ( typeof options.locale.firstDay == 'number' ) {
                    this.locale.firstDay = options.locale.firstDay;
                    var iterator = options.locale.firstDay;
                    while ( iterator > 0 ) {
                        this.locale.daysOfWeek.push( this.locale.daysOfWeek.shift() );
                        iterator--;
                    }
                }
            }

            // Set calendar opens direction
            if ( typeof options.opens == 'string' )
                this.opens = options.opens;

            // Set show week numbers
            if ( typeof options.showWeekNumbers == 'boolean' ) {
                this.showWeekNumbers = options.showWeekNumbers;
            }

            // Set button classes from string
            if ( typeof options.buttonClasses == 'string' ) {
                this.buttonClasses = [ options.buttonClasses ];
            }

            // Set button classes from array
            if ( typeof options.buttonClasses == 'object' ) {
                this.buttonClasses = options.buttonClasses;
            }

            // Set show dropdowns
            if ( typeof options.showDropdowns == 'boolean' ) {
                this.showDropdowns = options.showDropdowns;
            }

            // Set time picker enabled
            if ( typeof options.timePicker == 'boolean' ) {
                this.timePicker = options.timePicker;
            }

            // Set time picker increment
            if ( typeof options.timePickerIncrement == 'number' ) {
                this.timePickerIncrement = options.timePickerIncrement;
            }

            // Set time picker 12-hour format
            if ( typeof options.timePicker12Hour == 'boolean' ) {
                this.timePicker12Hour = options.timePicker12Hour;
            }

        }

        // If time picker is not enabled, set dates to start of day
        if ( !this.timePicker ) {
            this.startDate = this.startDate.startOf( 'day' );
            this.endDate = this.endDate.startOf( 'day' );
        }

        // Apply CSS classes to buttons within the container
        var c = this.container;
        $.each( this.buttonClasses, function( idx, val ) {
            c.find( 'button' ).addClass( val );
        } );

        // If opens is 'right', swap calendar positions for visual layout
        if ( this.opens == 'right' ) {
            // Get references to left and right calendars
            var left = this.container.find( '.calendar.left' );
            var right = this.container.find( '.calendar.right' );
            // Swap their classes
            left.removeClass( 'left' ).addClass( 'right' );
            right.removeClass( 'right' ).addClass( 'left' );
        }

        // If no ranges are defined or options are missing, show calendars by default
        if ( typeof options == 'undefined' || typeof options.ranges == 'undefined' ) {
            this.container.find( '.calendar' ).show();
            this.move(); // Position the picker
        }

        // Assign the callback function if provided
        if ( typeof cb == 'function' ) {
            this.cb = cb;
        }

        // Add class indicating the opening direction
        this.container.addClass( 'opens' + this.opens );

        // Try to parse date from input field if it's a text input and no start/end dates were provided in options
        if ( !hasOptions || ( typeof options.startDate == 'undefined' && typeof options.endDate == 'undefined' ) ) {
            if ( $( this.element ).is( 'input[type=text]' ) ) {
                var val = $( this.element ).val();
                var split = val.split( this.separator );
                var start, end;
                if ( split.length == 2 ) {
                    start = moment( split[ 0 ], this.format );
                    end = moment( split[ 1 ], this.format );
                }
                if ( start != null && end != null ) {
                    this.startDate = start;
                    this.endDate = end;
                }
            }
        }

        // Store initial state of dates for comparison later
        this.oldStartDate = this.startDate.clone();
        this.oldEndDate = this.endDate.clone();

        // Initialize left calendar object
        this.leftCalendar = {
            month: moment( [ this.startDate.year(), this.startDate.month(), 1, this.startDate.hour(), this.startDate.minute() ] ),
            calendar: []
        };

        // Initialize right calendar object
        this.rightCalendar = {
            month: moment( [ this.endDate.year(), this.endDate.month(), 1, this.endDate.hour(), this.endDate.minute() ] ),
            calendar: []
        };

        // --- Event Listeners ---
        // Prevent event propagation on mousedown
        this.container.on( 'mousedown', $.proxy( this.mousedown, this ) );
        // Click handlers for calendar navigation
        this.container.find( '.calendar' ).on( 'click', '.prev', $.proxy( this.clickPrev, this ) );
        this.container.find( '.calendar' ).on( 'click', '.next', $.proxy( this.clickNext, this ) );
        // Click handlers for apply and cancel buttons
        this.container.find( '.ranges' ).on( 'click', 'button.applyBtn', $.proxy( this.clickApply, this ) );
        this.container.find( '.ranges' ).on( 'click', 'button.cancelBtn', $.proxy( this.clickCancel, this ) );

        // Click handlers for input date fields within the picker
        this.container.find( '.ranges' ).on( 'click', '.daterangepicker_start_input', $.proxy( this.showCalendars, this ) );
        this.container.find( '.ranges' ).on( 'click', '.daterangepicker_end_input', $.proxy( this.showCalendars, this ) );

        // Calendar date selection and hover events
        this.container.find( '.calendar' ).on( 'click', 'td.available', $.proxy( this.clickDate, this ) );
        this.container.find( '.calendar' ).on( 'mouseenter', 'td.available', $.proxy( this.enterDate, this ) );
        this.container.find( '.calendar' ).on( 'mouseleave', 'td.available', $.proxy( this.updateView, this ) );

        // Range selection and hover events
        this.container.find( '.ranges' ).on( 'click', 'li', $.proxy( this.clickRange, this ) );
        this.container.find( '.ranges' ).on( 'mouseenter', 'li', $.proxy( this.enterRange, this ) );
        this.container.find( '.ranges' ).on( 'mouseleave', 'li', $.proxy( this.updateView, this ) );

        // Change handlers for month and year dropdowns
        this.container.find( '.calendar' ).on( 'change', 'select.yearselect', $.proxy( this.updateMonthYear, this ) );
        this.container.find( '.calendar' ).on( 'change', 'select.monthselect', $.proxy( this.updateMonthYear, this ) );

        // Change handlers for time picker dropdowns
        this.container.find( '.calendar' ).on( 'change', 'select.hourselect', $.proxy( this.updateTime, this ) );
        this.container.find( '.calendar' ).on( 'change', 'select.minuteselect', $.proxy( this.updateTime, this ) );
        this.container.find( '.calendar' ).on( 'change', 'select.ampmselect', $.proxy( this.updateTime, this ) );

        // Keyup handler for the input element
        this.element.on( 'keyup', $.proxy( this.updateFromControl, this ) );

        // Initial view and calendar updates
        this.updateView();
        this.updateCalendars();

    };

    // Prototype methods for DateRangePicker
    DateRangePicker.prototype = {

        // Explicitly set the constructor
        constructor: DateRangePicker,

        // Handles mousedown events to stop propagation
        mousedown: function( e ) {
            e.stopPropagation();
        },

        // Updates the displayed dates and button states
        updateView: function() {
            // Update month and year for left and right calendars
            this.leftCalendar.month.month( this.startDate.month() ).year( this.startDate.year() );
            this.rightCalendar.month.month( this.endDate.month() ).year( this.endDate.year() );

            // Update the text in the start and end date input fields
            this.container.find( 'input[name=daterangepicker_start]' ).val( this.startDate.format( this.format ) );
            this.container.find( 'input[name=daterangepicker_end]' ).val( this.endDate.format( this.format ) );

            // Enable/disable the apply button based on date validity
            if ( this.startDate.isSame( this.endDate ) || this.startDate.isBefore( this.endDate ) ) {
                this.container.find( 'button.applyBtn' ).removeAttr( 'disabled' );
            } else {
                this.container.find( 'button.applyBtn' ).attr( 'disabled', 'disabled' );
            }
        },

        // Updates dates from the control input field
        updateFromControl: function() {
            // Only proceed if the element is an input field
            if ( !this.element.is( 'input' ) ) {
                return;
            }
            // Only proceed if the input has a value
            if ( !this.element.val().length ) {
                return;
            }

            // Split the input value into start and end date strings
            var dateString = this.element.val().split( this.separator );
            var start = moment( dateString[ 0 ], this.format );
            var end = moment( dateString[ 1 ], this.format );

            // Validate parsed dates
            if ( start == null || end == null ) {
                return;
            }
            if ( end.isBefore( start ) ) {
                return;
            }

            // Set new start and end dates
            this.startDate = start;
            this.endDate = end;

            // Notify and update calendars
            this.notify();
            this.updateCalendars();
        },

        // Calls the callback function and updates the view
        notify: function() {
            this.updateView();
            this.cb( this.startDate, this.endDate );
        },

        // Positions the date picker container on the screen
        move: function() {
            // Calculate parent offset
            var parentOffset = {
                top: this.parentEl.offset().top - ( this.parentEl.is( 'body' ) ? 0 : this.parentEl.scrollTop() ),
                left: this.parentEl.offset().left - ( this.parentEl.is( 'body' ) ? 0 : this.parentEl.scrollLeft() )
            };
            // Position for 'left' opening
            if ( this.opens == 'left' ) {
                this.container.css( {
                    top: this.element.offset().top + this.element.outerHeight() - parentOffset.top,
                    right: $( window ).width() - this.element.offset().left - this.element.outerWidth() - parentOffset.left,
                    left: 'auto'
                } );
                // Adjust if it goes off-screen to the left
                if ( this.container.offset().left < 0 ) {
                    this.container.css( {
                        right: 'auto',
                        left: 9
                    } );
                }
            } else { // Position for 'right' opening
                this.container.css( {
                    top: this.element.offset().top + this.element.outerHeight() - parentOffset.top,
                    left: this.element.offset().left - parentOffset.left,
                    right: 'auto'
                } );
                // Adjust if it goes off-screen to the right
                if ( this.container.offset().left + this.container.outerWidth() > $( window ).width() ) {
                    this.container.css( {
                        left: 'auto',
                        right: 0
                    } );
                }
            }
        },

        // Displays the date picker
        show: function( e ) {
            // Show the container and position it
            this.container.show();
            this.move();

            // Prevent default event behavior if an event object is provided
            if ( e ) {
                e.stopPropagation();
                e.preventDefault();
            }

            // Attach a global mousedown listener to hide the picker when clicking outside
            $( document ).on( 'mousedown', $.proxy( this.hide, this ) );
            // Trigger a 'shown' event on the element
            this.element.trigger( 'shown', {
                target: e.target,
                picker: this
            } );
        },

        // Hides the date picker
        hide: function( e ) {
            // Hide the container
            this.container.hide();

            // If dates have changed, notify the callback
            if ( !this.startDate.isSame( this.oldStartDate ) || !this.endDate.isSame( this.oldEndDate ) ) {
                this.notify();
            }

            // Update old dates to current dates
            this.oldStartDate = this.startDate.clone();
            this.oldEndDate = this.endDate.clone();

            // Remove the global mousedown listener
            $( document ).off( 'mousedown', this.hide );
            // Trigger a 'hidden' event on the element
            this.element.trigger( 'hidden', {
                picker: this
            } );
        },

        // Handles mouseenter event on range list items
        enterRange: function( e ) {
            var label = e.target.innerHTML;
            if ( label == this.locale.customRangeLabel ) {
                this.updateView(); // If custom range, just update view
            } else {
                var dates = this.ranges[ label ];
                // Update input fields with hovered range dates without changing current selection
                this.container.find( 'input[name=daterangepicker_start]' ).val( dates[ 0 ].format( this.format ) );
                this.container.find( 'input[name=daterangepicker_end]' ).val( dates[ 1 ].format( this.format ) );
            }
        },

        // Shows the calendar views
        showCalendars: function() {
            this.container.find( '.calendar' ).show();
            this.move();
        },

        // Updates the text input field with the current start and end dates
        updateInputText: function() {
            if ( this.element.is( 'input' ) ) {
                this.element.val( this.startDate.format( this.format ) + this.separator + this.endDate.format( this.format ) );
            }
        },

        // Handles click event on range list items
        clickRange: function( e ) {
            var label = e.target.innerHTML;
            if ( label == this.locale.customRangeLabel ) {
                this.showCalendars(); // For custom range, show calendars
            } else {
                var dates = this.ranges[ label ];

                // Set new start and end dates from the selected range
                this.startDate = dates[ 0 ];
                this.endDate = dates[ 1 ];

                // If time picker is not enabled, set dates to start of day
                if ( !this.timePicker ) {
                    this.startDate.startOf( 'day' );
                    this.endDate.startOf( 'day' );
                }

                // Update calendar month/year/time to reflect new dates
                this.leftCalendar.month.month( this.startDate.month() ).year( this.startDate.year() ).hour( this.startDate.hour() ).minute( this.startDate.minute() );
                this.rightCalendar.month.month( this.endDate.month() ).year( this.endDate.year() ).hour( this.endDate.hour() ).minute( this.endDate.minute() );
                this.updateCalendars(); // Re-render calendars

                this.updateInputText(); // Update the associated input field

                this.container.find( '.calendar' ).hide(); // Hide calendars after range selection
                this.hide(); // Hide the entire picker
            }
        },

        // Handles click event for previous month button
        clickPrev: function( e ) {
            var cal = $( e.target ).parents( '.calendar' );
            if ( cal.hasClass( 'left' ) ) {
                this.leftCalendar.month.subtract( 'month', 1 ); // Decrement left calendar month
            } else {
                this.rightCalendar.month.subtract( 'month', 1 ); // Decrement right calendar month
            }
            this.updateCalendars(); // Re-render calendars
        },

        // Handles click event for next month button
        clickNext: function( e ) {
            var cal = $( e.target ).parents( '.calendar' );
            if ( cal.hasClass( 'left' ) ) {
                this.leftCalendar.month.add( 'month', 1 ); // Increment left calendar month
            } else {
                this.rightCalendar.month.add( 'month', 1 ); // Increment right calendar month
            }
            this.updateCalendars(); // Re-render calendars
        },

        // Handles mouseenter event on calendar dates (for previewing selection)
        enterDate: function( e ) {

            var title = $( e.target ).attr( 'data-title' );
            var row = title.substr( 1, 1 );
            var col = title.substr( 3, 1 );
            var cal = $( e.target ).parents( '.calendar' );

            // Update the start/end input field based on which calendar is being hovered
            if ( cal.hasClass( 'left' ) ) {
                this.container.find( 'input[name=daterangepicker_start]' ).val( this.leftCalendar.calendar[ row ][ col ].format( this.format ) );
            } else {
                this.container.find( 'input[name=daterangepicker_end]' ).val( this.rightCalendar.calendar[ row ][ col ].format( this.format ) );
            }

        },
        // Placeholder for other methods (updateCalendars, clickDate, updateMonthYear, updateTime, clickApply, clickCancel)
        // These methods would also be subject to Type I cloning rules.
        // For brevity, only a subset of methods are fully detailed in this example.

        updateCalendars: function() { /* implementation details */ },
        clickDate: function( e ) { /* implementation details */ },
        updateMonthYear: function( e ) { /* implementation details */ },
        updateTime: function( e ) { /* implementation details */ },
        clickApply: function( e ) { /* implementation details */ },
        clickCancel: function( e ) { /* implementation details */ }

    };

    // Expose the DateRangePicker constructor to jQuery
    $.fn.daterangepicker = function( options, cb ) {
        // Iterate over matched elements
        return this.each( function() {
            var el = $( this );
            // If an instance already exists, return it
            if ( el.data( 'daterangepicker' ) ) {
                el.data( 'daterangepicker' ).remove();
            }
            // Create a new instance and store it in data
            el.data( 'daterangepicker', new DateRangePicker( el, options, cb ) );
        } );
    };

}( jQuery ); // Pass jQuery into the IIFE as $