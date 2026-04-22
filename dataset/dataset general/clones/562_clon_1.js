/*
 * bic_calendar.js
 * Version: 1.0.0
 *
 * This JavaScript file is part of the bic calendar project.
 * Author: bichotll
 * Project Website: bic.cat
 * GitHub Repository: http://bichotll.github.io/bic_calendar/
 * License: Apache License, Version 2.0
 *
 * This code block is a Type I clone, meaning it's logically identical
 * to the original, with only variations in whitespace and comments.
 * All identifiers, operators, and expressions remain precisely the same.
 *
 */

$.fn.bic_calendar = function ( options ) {

  /* Merge default options with user-provided options */
  var opts = $.extend( { } , $.fn.bic_calendar.defaults , options );


  /* Iterate over each selected element to initialize the calendar */
  this.each( function ( ) {


    /* --- Variable Declarations Section --- */


    // The jQuery element on which the plugin is called
    var elem = $( this );

    // Variables to hold various parts of the calendar structure
    var calendar;             // The main calendar container
    var layoutMonth;          // Layout for a single month
    var daysMonthsLayer;      // Layer containing all months' days
    // Display for the current month name
    var textMonthCurrentLayer = $('<div class="visualmonth"></div>');
    // Display for the current year
    var textYearCurrentLayer  = $('<div class="visualyear"></div>');

    // Unique ID for the calendar instance
    var calendarId = "bic_calendar";

    // Event data for the calendar
    var events = opts.events;

    // Array for day names (e.g., 'Mon', 'Tue')
    var dayNames;
    if ( typeof opts.dayNames != "undefined" )
      dayNames = opts.dayNames;
    else
      dayNames = [ "l" , "m" , "x" , "j" , "v" , "s" , "d" ];

    // Array for month names (e.g., 'January', 'February')
    var monthNames;
    if ( typeof opts.monthNames != "undefined" )
      monthNames = opts.monthNames;
    else
      monthNames = [ "Enero" , "Febrero" , "Marzo" , "Abril" , "Mayo" , "Junio" , "Julio" , "Agosto" , "Septiembre" , "Octubre" , "Noviembre" , "Diciembre" ];

    // Flag to determine if day names should be displayed
    var showDays;
    if ( typeof opts.showDays != "undefined" )
      showDays = opts.showDays;
    else
      showDays = true;

    // Options for Bootstrap popovers, if used for events
    var popoverOptions;
    if ( typeof opts.popoverOptions != "undefined" )
      popoverOptions = opts.popoverOptions;
    else
      popoverOptions = { placement: 'bottom' , html: true , trigger: 'hover' };

    // Options for Bootstrap tooltips, if used for events
    var tooltipOptions;
    if ( typeof opts.tooltipOptions != "undefined" )
      tooltipOptions = opts.tooltipOptions;
    else
      tooltipOptions = { placement: 'bottom' , trigger: 'hover' };

    // AJAX request configuration for fetching events dynamically
    var reqAjax;
    if ( typeof opts.reqAjax != "undefined" )
      reqAjax = opts.reqAjax;
    else
      reqAjax = false;

    // Flag to enable date selection functionality
    var enableSelect = false;
    if ( typeof opts.enableSelect != 'undefined' )
      enableSelect = opts.enableSelect;

    // Flag for multi-day selection (range selection)
    var multiSelect = false;
    if ( typeof opts.multiSelect != 'undefined' )
      multiSelect = opts.multiSelect;

    // Variables to store selected date(s) for range selection
    var firstDaySelected  = '';
    var lastDaySelected   = '';
    var daySelected       = '';

    /* --- End of Variable Declarations --- */





    /* --- Function Definitions Section --- */

    /**
     * Initializes and displays the calendar structure.
     * This is the main entry point for rendering.
     */
    function showCalendar ( ) {

      // Create a layer to hold the days of all months
      daysMonthsLayer = $('<div id="monthsLayer" class="row"></div>');

      // Create a Date object to get the current year
      var objFecha = new Date( );
      objFecha.setMonth( 0 ); // Set to January 1st of the current year

      // Get the current year from the Date object
      var year = objFecha.getFullYear( );

      // Render the days for all months in the current year
      showMonths( year );

      // Create buttons for navigating to the next and previous years
      var nextYearButton     = $('<td><a href="#" class="button-year-next"><i class="glyphicon glyphicon-arrow-right" ></i></a></td>');
      // Attach click event for next year button
      nextYearButton.click( function ( e ) {
        e.preventDefault( ); // Prevent default link behavior
        year++;              // Increment the year
        changeDate( year );  // Update calendar with new year
      });

      var previousYearButton = $('<td><a href="#" class="button-year-previous"><i class="glyphicon glyphicon-arrow-left" ></i></a></td>');
      // Attach click event for previous year button
      previousYearButton.click( function ( e ) {
        e.preventDefault( );  // Prevent default link behavior
        year--;               // Decrement the year
        changeDate( year );   // Update calendar with new year
      });


      // Create header for the calendar, including year navigation
      var headerLayer       = $('<table class="table header"></table>');
      var yearTextLayer     = $('<tr></tr>');
      var yearControlTextLayer = $('<td colspan=5 class="monthAndYear span6"></td>');

      // Append navigation buttons and year display to the header row
      yearTextLayer.append( previousYearButton );
      yearTextLayer.append( yearControlTextLayer );
      yearTextLayer.append( nextYearButton );
      yearControlTextLayer.append( textYearCurrentLayer ); // Display current year text

      headerLayer.append( yearTextLayer ); // Add the row to the header table

      // Create the main calendar container div
      calendar = $('<div class="bic_calendar" id="' + calendarId + '" ></div>');
      calendar.prepend( headerLayer ); // Add header to the top
      // calendar.append(capaDiasSemana); // Original commented line
      // daysMonthLayer.prepend(capaDiasSemana); // Original commented line
      calendar.append( daysMonthsLayer ); // Add the months layer to the calendar

      // Insert the fully constructed calendar into the DOM element
      elem.append( calendar );

      // Check for and add any defined events to the calendar
      checkEvents( year );

      // Check if date selection is enabled and set up event listeners
      checkIfEnableMark( );
    }

    /**
     * Updates the calendar display when the month or year changes.
     *
     * @param {number} year - The new year to display.
     */
    function changeDate ( year ) {
      daysMonthsLayer.empty( );   // Clear existing month displays
      showMonths( year );         // Render months for the new year
      checkEvents( year );        // Re-check and mark events for the new year
      markSelectedDays( );        // Re-mark any previously selected days
    }

    /**
     * Generates and appends the row of day literals (e.g., "Mon", "Tue")
     * to the current month layout.
     */
    function listListeralsWeek ( ) {
      // Only show day names if opts.showDays is not explicitly false
      if ( showDays != false ) {
        var capaDiasSemana = $('<tr class="days-month" >');
        var codigoInsertar = '';
        // Iterate through dayNames array to create table cells for each day
        $( dayNames ).each( function ( indice , valor ) {
          codigoInsertar += '<td';
          if ( indice == 0 ) {
            codigoInsertar += ' class="primero"'; // First day of the week
          }
          if ( indice == 6 ) {
            codigoInsertar += ' class="domingo ultimo"'; // Last day (Sunday)
          }
          codigoInsertar += ">" + valor + '</td>'; // Day name
        });
        codigoInsertar += '</tr>'; // Close the row
        capaDiasSemana.append( codigoInsertar ); // Add generated HTML to the row

        layoutMonth.append( capaDiasSemana ); // Append the day names row to the month layout
      }
    }

    /**
     * Displays all 12 months for a given year.
     * Arranges months in rows of three.
     *
     * @param {number} year - The year for which to display months.
     */
    function showMonths ( year ) {
      for ( i = 0 ; i != 12 ; i++ ) {
        // Start a new row for every 3 months
        if ( i % 3 == false )
          daysMonthsLayer.append( $('</div><div class="row">') );
        showMonthDays( i , year ); // Render a single month
      }
    }

    /**
     * Renders the days of a specific month within a given year.
     * Includes calculations for first day of week and number of days.
     *
     * @param {number} month - The zero-indexed month (0-11).
     * @param {number} year  - The full year (e.g., 2023).
     */
    function showMonthDays ( month , year ) {

      // Initialize the layout for the current month
      layoutMonth = $('<table class="table"></table>');

      // Update the visual month and year layers
      textMonthCurrentLayer.text( monthNames[ month ] );
      textYearCurrentLayer.text( year );

      // Counter for the day of the month
      var daysCounter = 1;

      // Calculate the day of the week for the 1st of the month (0=Monday, 6=Sunday)
      var firstDay = calcNumberDayWeek( 1 , month , year );

      // Calculate the last day of the current month
      var lastDayMonth = lastDay( month , year );

      // Month number (1-indexed for display and data attributes)
      var nMonth = month + 1;

      // String to build up the HTML for the days of the month
      var daysMonthLayerString = "";

      // Render the first row of the week (handling leading blank days)
      for ( var i = 0 ; i < 7 ; i++ ) {
        if ( i < firstDay ) {
          // If 'i' is less than 'firstDay', it means these are blank cells before the 1st
          var dayCode = "";
          if ( i == 0 )
            dayCode += "<tr>"; // Start a new table row
          // Add an invalid (empty) day cell
          dayCode += '<td class="invalid-day week-day-' + i + '"';
          dayCode += '"></td>'; // Close the cell tag
        } else {
          // Render actual days of the month
          var dayCode = "";
          if ( i == 0 )
            dayCode += '<tr>'; // Start a new table row
          // Create a cell with a unique ID and data-date attribute
          dayCode += '<td id="' + calendarId + '_' + daysCounter + "_" + nMonth + "_" + year + '" data-date="' + nMonth + "/" + daysCounter + "/" + year + '" ';
          // Add a class indicating the day of the week
          dayCode += ' class="week-day-' + i + '"';
          // Inner div and anchor for the day number
          dayCode += '><div><a>' + daysCounter + '</a></div></span>';
          if ( i == 6 )
            dayCode += '</tr>'; // Close the table row if it's the end of the week
          daysCounter++; // Increment day counter
        }
        daysMonthLayerString += dayCode; // Append generated HTML to the string
      }

      // Render the remaining days of the month (after the first row)
      var currentWeekDay = 1; // Tracks the day of the week for positioning
      while ( daysCounter <= lastDayMonth ) {
        var dayCode = "";
        if ( currentWeekDay % 7 == 1 )
          dayCode += "<tr>"; // Start a new row for each week
        dayCode += '<td id="' + calendarId + '_' + daysCounter + "_" + nMonth + "_" + year + '" data-date="' + nMonth + "/" + daysCounter + "/" + year + '" ';
        // Add class for day of the week
        dayCode += ' class="week-day-' + ( ( currentWeekDay - 1 ) % 7 ) + '"';
        dayCode += '><div><a>' + daysCounter + '</a></div></td>';
        if ( currentWeekDay % 7 == 0 )
          dayCode += "</tr>"; // Close the row at the end of the week
        daysCounter++;     // Move to the next day
        currentWeekDay++;  // Move to the next day of the week
        daysMonthLayerString += dayCode; // Append to the HTML string
      }

      // Fill in any remaining empty cells in the last week of the month
      currentWeekDay--; // Adjust currentWeekDay to reflect the last day processed
      if ( currentWeekDay % 7 != 0 ) {
        dayCode = ""; // Reset dayCode for trailing empty cells
        for ( var i = ( currentWeekDay % 7 ) + 1 ; i <= 7 ; i++ ) {
          var dayCode = "";
          dayCode += '<td ';
          // Add classes for invalid day and day of the week
          dayCode += ' class="invalid-day week-day-' + ( i - 1 ) + '"';
          dayCode += '"></td>';
          if ( i == 7 )
            dayCode += '</tr>'; // Close the row if it's the end of the week
          daysMonthLayerString += dayCode; // Append to the HTML string
        }
      }

      // Add the literals for the days of the week (Mon, Tue, etc.)
      listListeralsWeek( );

      // Append all generated day HTML to the month's layout table
      layoutMonth.append( daysMonthLayerString );

      // Wrap the layoutMonth table in a container for styling
      layoutMonth = $('<div class="monthDisplayed" ></div>').append( layoutMonth );

      // Add the month name above the days table
      layoutMonth.prepend( $('<div class="month" >' + monthNames[ month ] + '</div>') );

      // Wrap the entire month display in a column div (e.g., for Bootstrap grid)
      layoutMonth = $('<div class="col-md-4" ></div>').append( layoutMonth );

      // Add the completed month layout to the main daysMonthsLayer
      daysMonthsLayer.append( layoutMonth );
    }

    /**
     * Calculates the day of the week for a given date.
     *
     * @param {number} day   - The day of the month (1-31).
     * @param {number} month - The zero-indexed month (0-11).
     * @param {number} year  - The full year.
     * @returns {number}     - The day of the week (0=Monday, 6=Sunday).
     */
    function calcNumberDayWeek ( day , month , year ) {
      var objFecha = new Date( year , month , day );
      var numDia   = objFecha.getDay( ); // getDay() returns 0 for Sunday, 1 for Monday, etc.
      if ( numDia == 0 )
        numDia = 6; // Convert Sunday (0) to 6 (for Monday=0, ..., Sunday=6)
      else
        numDia--;   // Decrement other days to match (Monday=0, ...)
      return numDia;
    }

    /**
     * Checks if a given date (month, day, year) is valid.
     *
     * @param {number} m - Month (1-12).
     * @param {number} d - Day (1-31).
     * @param {number} y - Year.
     * @returns {boolean} - True if the date is valid, false otherwise.
     * @thanks http://kevin.vanzonneveld.net
     * @thanks http://www.desarrolloweb.com/manuales/manual-librerias-phpjs.html
     */
    function checkDate ( m , d , y ) {
      // Check month, year range and if day exists in month
      return m > 0 && m < 13 && y > 0 && y < 32768 && d > 0 && d <= ( new Date( y , m , 0 ) ).getDate( );
    }

    /**
     * Returns the last day of a given month and year.
     *
     * @param {number} month - The zero-indexed month (0-11).
     * @param {number} year  - The full year.
     * @returns {number}     - The number of days in the specified month.
     */
    function lastDay ( month , year ) {
      var lastDayValue = 28; // Start with 28, as all months have at least 28 days
      // Increment lastDayValue until checkDate returns false (i.e., day no longer exists)
      while ( checkDate( month + 1 , lastDayValue + 1 , year ) ) {
        lastDayValue++;
      }
      return lastDayValue;
    }

    /**
     * Validates a date string in "DD/MM/YYYY" format.
     *
     * @param {string} fecha - The date string to validate.
     * @returns {boolean}    - True if the date string is valid, false otherwise.
     */
    function validateWritedDate ( fecha ) {
      var arrayFecha = fecha.split( "/" ); // Split the date string by '/'
      if ( arrayFecha.length != 3 )
        return false; // Invalid format if not three parts
      // Use checkDate with parts, adjusting month to be 1-indexed
      return checkDate( arrayFecha[ 1 ] , arrayFecha[ 0 ] , arrayFecha[ 2 ] );
    }

    /**
     * Checks for events, either from an AJAX source or local events array,
     * then marks them on the calendar.
     *
     * @param {number} year - The year for which to check and mark events.
     */
    function checkEvents ( year ) {
      if ( reqAjax != false ) {
        // If AJAX is configured, make a request
        $.ajax( {
          type    : reqAjax.type,
          url     : reqAjax.url,
          data    : { ano : year }, // Send the year as data
          dataType: 'json'
        } ).done( function ( data ) { // Callback when AJAX request is successful

          if ( typeof events == 'undefined' )
            events = [ ]; // Initialize events array if not already defined

          // Append new events from AJAX response to the existing events array
          $.each( data , function ( k , v ) {
            events.push( data[ k ] );
          } );

          markEvents( year ); // Mark all events on the calendar

        } );
      } else {
        // If no AJAX, just mark events from the local 'events' array
        markEvents( year );
      }
    }

    /**
     * Iterates through the 'events' array and applies visual styling
     * and interactive logic (tooltips/popovers, links) to corresponding
     * calendar days.
     *
     * @param {number} year - The current year being displayed.
     */
    function markEvents ( year ) {

      for ( var i = 0 ; i < events.length ; i++ ) {

        // Check if the event's year matches the current calendar year
        if ( events[ i ].date.split( '/' )[ 2 ] == year ) {

          // Get the table cell (<td>) element for the event date
          var loopDayTd = $( '#' + calendarId + '_' + events[ i ].date.replace( /\//g , "_" ) );
          // Get the anchor (<a>) element inside the table cell
          var loopDayA  = $( '#' + calendarId + '_' + events[ i ].date.replace( /\//g , "_" ) + ' a' );

          // Add 'event' class to the table cell
          loopDayTd.addClass( 'event' );

          // Set the title for the event (used by tooltips/popovers)
          loopDayA.attr( 'data-original-title' , events[ i ].title );

          // Apply background color if specified in event data
          if ( events[ i ].color )
            loopDayTd.css( 'background' , events[ i ].color );

          // Add a link if specified
          if ( typeof events[ i ].link != 'undefined' ) {
            loopDayA.attr( 'href' , events[ i ].link );
          }

          // Add custom class if specified
          if ( events[ i ].class )
            loopDayTd.addClass( events[ i ].class );

          // Determine whether to use a popover or tooltip based on 'content'
          if ( events[ i ].content ) {
            loopDayTd.addClass( 'event_popover' );
            loopDayA.attr( 'rel' , 'popover' ); // Attribute for popover initialization
            loopDayA.attr( 'data-content' , events[ i ].content ); // Popover content
          } else {
            loopDayTd.addClass( 'event_tooltip' );
            loopDayA.attr( 'rel' , 'tooltip' ); // Attribute for tooltip initialization
          }
        }
      }

      // Initialize Bootstrap tooltips and popovers for event elements
      $( '#' + calendarId + ' ' + '.event_tooltip a' ).tooltip( tooltipOptions );
      $( '#' + calendarId + ' ' + '.event_popover a' ).popover( popoverOptions );

      // Add click handler for manual popovers (if any)
      $( '.manual_popover' ).click( function ( ) {
        $( this ).popover( 'toggle' ); // Toggle popover visibility
      } );
    }

    /**
     * Sets up event listeners for date selection if 'enableSelect' is true.
     * Handles single-day and multi-day (range) selection.
     */
    function checkIfEnableMark ( ) {
      if ( enableSelect == true ) {

        var eventBicCalendarSelect; // Declare variable for custom event

        // Attach a click event listener to all table cells within #monthsLayer
        elem.on( 'click' , '#monthsLayer td' , function ( ) {
          // Check if multi-day selection is enabled
          if ( multiSelect == true ) {
            if ( daySelected == '' ) {
              // If no day is selected yet, mark this as the first day
              daySelected = $( this ).data( 'date' );
              markSelectedDays( ); // Visually mark the selected day
            } else {
              if ( lastDaySelected == '' ) {
                // If a first day is selected, but not a last day, this is the end of the range
                firstDaySelected = daySelected;     // Store the first selected day
                lastDaySelected  = $( this ).data( 'date' ); // Store the current clicked day as last
                
                markSelectedDays( ); // Visually mark the entire selected range

                // Create and dispatch a custom event for range selection
                var eventBicCalendarSelect = new CustomEvent( "bicCalendarSelect" , {
                  detail: {
                    dateFirst: firstDaySelected,
                    dateLast : lastDaySelected
                  }
                } );
                document.dispatchEvent( eventBicCalendarSelect ); // Fire the event
              } else {
                // If a range is already selected, clear the selection
                firstDaySelected  = '';
                lastDaySelected   = '';
                daySelected       = '';
                // Remove all selection classes from calendar cells
                elem.find( '.selection' ).removeClass( 'middle-selection selection first-selection last-selection' );
              }
            }
          } else {
            // Single-day selection logic
            // Remove 'selection' class from any previously selected day
            elem.find( 'td div' ).removeClass( 'selection' );
            // Add 'selection' class to the currently clicked day's inner div
            $( this ).find( 'div' ).addClass( 'selection' );
            // Create and dispatch a custom event for single-day selection
            var eventBicCalendarSelect = new CustomEvent( "bicCalendarSelect" , {
              detail: {
                date: $( this ).data( 'date' ) // Pass the selected date
              }
            } );
            document.dispatchEvent( eventBicCalendarSelect ); // Fire the event
          }
        } )
      }
    }

    /**
     * Visually marks selected days on the calendar.
     * Handles both single-day and multi-day (range) selections.
     */
    function markSelectedDays ( ) {
      // Logic for single day selection (when only daySelected is set)
      if ( daySelected != '' && firstDaySelected == '' ) {
        var arrayDate = daySelected.split( '/' );
        // Add 'selection' class to the div of the selected day
        $( '#bic_calendar_' + arrayDate[ 1 ] + '_' + arrayDate[ 0 ] + '_' + arrayDate[ 2 ] + ' div' ).addClass( 'selection' );
      } else if ( firstDaySelected != '' ) {
        // Logic for multi-day (range) selection
        // Split date strings into arrays
        var arrayFirstDay = firstDaySelected.split( '/' );
        var arrayLastDay  = lastDaySelected.split( '/' );

        // Remove all existing selection classes before marking new range
        elem.find( 'td.selection' ).removeClass( 'selection' );

        // Create Date objects from the selected date strings
        var oldSelectedDate = new Date( firstDaySelected );
        var newSelectedDate = new Date( lastDaySelected );

        // Ensure oldSelectedDate is always earlier than or equal to newSelectedDate
        if ( oldSelectedDate > newSelectedDate ) {
          // Swap dates if they are in the wrong order
          var tempSelectedDate = oldSelectedDate;
          oldSelectedDate      = newSelectedDate;
          newSelectedDate      = tempSelectedDate;
        }
        // Mark the first day of the range
        $( '#bic_calendar_' + oldSelectedDate.getDate( ) + '_' + ( parseInt( oldSelectedDate.getMonth( ) ) + 1 ) + '_' + oldSelectedDate.getFullYear( ) + ' div' ).addClass( 'selection first-selection' );
        // Loop through all days between the first and last selected day (inclusive)
        while ( oldSelectedDate < newSelectedDate ) {
          oldSelectedDate.setDate( oldSelectedDate.getDate( ) + 1 ); // Increment date by one day
          // ... (rest of the loop body would follow here)
        }
      }
    }
  });
};
$.fn.bic_calendar.defaults = {
  // Default values for bic_calendar plugin options
  // (This part is not present in the provided snippet's end, but typically follows)
};