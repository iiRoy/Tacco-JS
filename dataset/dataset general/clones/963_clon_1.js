'use strict' ; /* This directive enables strict mode for the entire script. */

var DatePicker = function ( element ) // Define the DatePicker constructor.
{ // Start of the DatePicker constructor function body.
  var self = this ; /* Reference to the current instance. */
  var $window = $ ( window [ 'addEventListener' ] ? window : document . body ) ; // Determine the global event target.
  var $element = this . $element = $ ( element ) . children ( 'input:first-child' ) ; /* The jQuery wrapped input element. */
  var element = this . element = $element . get ( 0 ) ; // The raw DOM input element.
  var $labelElement = this . $labelElement = $element . siblings ( 'label.add-on' ) ; // The jQuery wrapped label element.
  var labelElement = this . labelElement = $labelElement . get ( 0 ) ; // The raw DOM label element.
  var $calendarElement = this . $calendarElement = $labelElement . children ( 'div.calendar' ) ; // The jQuery wrapped calendar display element.
  var calendarElement = this . calendarElement = $calendarElement . get ( 0 ) ; // The raw DOM calendar display element.
  var value = this . value = this . stringToDate ( $element . val ( ) ) || new Date ( ) ; // The currently selected date value.
  var format = $element . data ( 'format' ) ; // The date format string.
  var year = value . getFullYear ( ) ; // The current year being displayed.
  var month = value . getMonth ( ) ; // The current month being displayed (0-indexed).
  var isDraggingYear = false ; // Flag indicating if year dragging is active.
  var isDraggingMonth = false ; // Flag indicating if month dragging is active.
  var startDragYear = null ; // Year value at the start of a drag operation.
  var startDragMonth = null ; // Month value at the start of a drag operation.
  var startDragX = -1 ; // X-coordinate at the start of a drag.
  var startDragY = -1 ; // Y-coordinate at the start of a drag.


  this . setMonth ( year , month ) ; // Initialize the calendar display.


  $element . bind ( 'keydown keyup keypress' , function ( evt ) // Prevent direct input into the date field.
    { // Handler for keyboard events.
      return false ; // Always block default key actions.
    } ) ;


  $calendarElement . bind ( "webkitTransitionEnd transitionend oTransitionEnd transitionEnd" , function ( evt ) // Handle CSS transition end events.
    { // Transition end event handler.
      if ( ! $element . is ( ':focus' ) ) return ; // Only act if the input is focused.

      var value = self . value = self . stringToDate ( $element . val ( ) ) ; // Re-parse the input value.

      if ( ! value ) return ; // If parsing failed, do nothing.

      var year = value . getFullYear ( ) ; // Get the year from the parsed value.
      var month = value . getMonth ( ) ; // Get the month from the parsed value.

      self . setMonth ( year , month ) ; // Update calendar display based on new value.
    } ) ;


  $labelElement . bind ( 'mousedown' , function ( evt ) // Toggle focus on the input when label is clicked.
    { // Mousedown event handler for the label.
      if ( $element . is ( ':focus' ) ) { // If the input is currently focused.
        $element . blur ( ) ; // Unfocus it.
      } else { // If the input is not focused.
        $element . focus ( ) ; // Focus it.
      } // End of focus check.

      return false ; // Prevent default mousedown behavior.
    } ) ;


  $calendarElement . delegate ( 'td' , 'mousedown' , function ( evt ) // Handle clicks on individual days in the calendar.
    { // Mousedown event handler for table data cells.
      var $this = $ ( this ) ; // The clicked table data cell.

      value = self . value = new Date ( $this . data ( 'year' ) , $this . data ( 'month' ) , $this . data ( 'date' ) ) ; // Update the selected date.

      $calendarElement . find ( 'td.selected' ) . removeClass ( 'selected' ) ; // Remove 'selected' from previous day.
      $this . addClass ( 'selected' ) ; // Add 'selected' to the current day.

      var year = value . getFullYear ( ) + '' ; // Get full year as string.
      var month = value . getMonth ( ) + 1 + '' ; // Get month (1-indexed) as string.
      var date = value . getDate ( ) + '' ; // Get day of month as string.
      var dateString = new String ( format ) ; // Create a mutable string from the format.

      dateString = dateString // Apply format replacements.
        . replace ( 'yyyy' , year )
        . replace ( 'yy' , year . substring ( 2 ) )
        . replace ( 'mm' , month < 10 ? '0' + month : month )
        . replace ( 'm' , month )
        . replace ( 'dd' , date < 10 ? '0' + date : date )
        . replace ( 'd' , date ) ;

      $element . val ( dateString ) ; // Update the input field with the formatted date.

      setTimeout ( function ( ) // Delay blurring to allow visual feedback.
        { // Callback for setTimeout.
          $element . blur ( ) ; // Unfocus the input field.
        } , 200 ) ; // 200 milliseconds delay.

      return false ; // Prevent default mousedown behavior.
    } ) ;


  $calendarElement . delegate ( 'th' , 'mousedown' , function ( evt ) // Handle clicks on calendar header (navigation).
    { // Mousedown event handler for table header cells.
      var $this = $ ( this ) ; // The clicked table header cell.
      var buttonValue = $this . data ( 'value' ) ; // The action value from the data attribute.

      if ( ! buttonValue ) return ; // If no action value, exit.

      var year = self . year ; // Current displayed year.
      var month = self . month ; // Current displayed month.

      if ( buttonValue === 'year' ) { // If the year button was clicked.
        isDraggingYear = true ; // Enable year dragging.
      } else if ( buttonValue === 'month' ) { // If the month button was clicked.
        isDraggingMonth = true ; // Enable month dragging.
      }

      if ( isDraggingYear || isDraggingMonth ) { // If a drag operation is starting.
        startDragYear = year ; // Store initial year.
        startDragMonth = month ; // Store initial month.
        startDragX = evt . pageX ; // Store initial X position.
        startDragY = evt . pageY ; // Store initial Y position.
      }

      else { // If it's a simple navigation click (not a drag start).
        month += parseInt ( buttonValue , 10 ) ; // Adjust month by the button's value.

        if ( month < 0 ) { // If month goes below January.
          month = 11 ; // Wrap to December.
          year-- ; // Decrement year.
        } else if ( month > 11 ) { // If month goes above December.
          month = 0 ; // Wrap to January.
          year++ ; // Increment year.
        }

        self . setMonth ( year , month ) ; // Re-render the calendar for the new month/year.
      } // End of dragging check.

      return false ; // Prevent default mousedown behavior.
    } ) ;


  $window . bind ( 'mousemove' , function ( evt ) // Handle mouse movement for dragging year/month.
    { // Mousemove event handler.
      if ( ! isDraggingYear && ! isDraggingMonth ) return ; // Only process if a drag is active.

      var mouseX = evt . pageX ; // Current mouse X coordinate.
      var mouseY = evt . pageY ; // Current mouse Y coordinate.
      var deltaX = mouseX - startDragX ; // Change in X from drag start.
      var deltaY = mouseY - startDragY ; // Change in Y from drag start.
      var year = startDragYear ; // Year at the start of the drag.
      var month = startDragMonth ; // Month at the start of the drag.

      if ( isDraggingYear ) { // If dragging the year.
        year += Math . floor ( ( deltaX + deltaY ) / 16 ) ; // Adjust year based on mouse movement.
      } else { // If dragging the month.
        month += Math . floor ( ( deltaX + deltaY ) / 16 ) ; // Adjust month based on mouse movement.
        year += Math . floor ( month / 12 ) ; // Adjust year if month wraps.
        month = month % 12 ; // Keep month within 0-11 range.
        month += ( month < 0 ) ? 12 : 0 ; // Handle negative modulo results.
      }

      self . setMonth ( year , month ) ; // Update the calendar display.
    } ) ;


  $window . bind ( 'mouseup' , function ( evt ) // Handle mouse release to end dragging.
    { // Mouseup event handler.
      if ( ! isDraggingYear && ! isDraggingMonth ) return ; // Only process if a drag was active.

      isDraggingYear = isDraggingMonth = false ; // Reset dragging flags.
      startDragYear = startDragMonth = null ; // Clear drag start values.
      startDragX = startDragY = -1 ; // Reset drag start coordinates.
    } ) ;


  $element . data ( 'datepicker' , this ) ; // Store a reference to this DatePicker instance on the input element.
} ; // End of DatePicker constructor.


DatePicker . prototype = { // Define prototype properties and methods for DatePicker.
  element : null , // Raw DOM element reference.
  $element : null , // jQuery wrapped element reference.
  labelElement : null , // Raw DOM label element reference.
  $labelElement : null , // jQuery wrapped label element reference.
  calendarElement : null , // Raw DOM calendar element reference.
  $calendarElement : null , // jQuery wrapped calendar element reference.
  value : null , // The currently selected Date object.
  format : 'yyyy-mm-dd' , // Default format string for dates.
  year : 0 , // Current displayed year.
  month : 0 , // Current displayed month (0-indexed).
  getDaysInMonth : function ( year , month ) // Calculates the number of days in a given month.
  { // Start of getDaysInMonth function.
    return 32 - new Date ( year , month , 32 ) . getDate ( ) ; // Clever trick to get days in month.
  } , // End of getDaysInMonth function.
  getMonthNameByIndex : function ( month ) // Returns the full name of a month given its 0-indexed number.
  { // Start of getMonthNameByIndex function.
    switch ( month ) { // Switch statement for month indices.
      case 0 : // January.
        return 'January' ;
      case 1 : // February.
        return 'February' ;
      case 2 : // March.
        return 'March' ;
      case 3 : // April.
        return 'April' ;
      case 4 : // May.
        return 'May' ;
      case 5 : // June.
        return 'June' ;
      case 6 : // July.
        return 'July' ;
      case 7 : // August.
        return 'August' ;
      case 8 : // September.
        return 'September' ;
      case 9 : // October.
        return 'October' ;
      case 10 : // November.
        return 'November' ;
      case 11 : // December.
        return 'December' ;
    } // End of switch.
  } , // End of getMonthNameByIndex function.
  setMonth : function ( year , month ) // Renders the calendar display for the specified year and month.
  { // Start of setMonth function.
    var firstDateOfMonth = new Date ( year , month , 1 ) ; // First day of the target month.
    var firstDayOfWeek = firstDateOfMonth . getDay ( ) ; // Day of the week for the first day (0=Sunday).
    var daysInMonth = this . getDaysInMonth ( year , month ) ; // Total days in the target month.

    var todaysFullDate = new Date ( ) ; // Current date.
    var todaysYear = todaysFullDate . getFullYear ( ) ; // Current year.
    var todaysMonth = todaysFullDate . getMonth ( ) ; // Current month.
    var todaysDate = todaysFullDate . getDate ( ) ; // Current day.

    var selectedFullDate = this . value ; // The currently selected date.
    var selectedYear = selectedFullDate . getFullYear ( ) ; // Year of the selected date.
    var selectedMonth = selectedFullDate . getMonth ( ) ; // Month of the selected date.
    var selectedDate = selectedFullDate . getDate ( ) ; // Day of the selected date.

    var date = 0 ; // Counter for days to display in the calendar grid.

    var thead = '<thead>' + // Start building the table header HTML.
      '<tr>' + // Navigation row.
        '<th data-value="-1">&lt;</th>' + // Previous month button.
        '<th data-value="month" colspan="3" style="border-right: none;">' + this . getMonthNameByIndex ( month ) + '</th>' + // Month name display.
        '<th data-value="year" colspan="2">' + year + '</th>' + // Year display.
        '<th data-value="1">&gt;</th>' + // Next month button.
      '</tr>' +
      '<tr>' + // Day of week labels row.
        '<th>S</th><th>M</th><th>T</th><th>W</th><th>H</th><th>F</th><th>S</th>' + // Day labels.
      '</tr>' +
    '</thead>' ; // End of table header HTML.

    var tbody = '<tbody>' ; // Start building the table body HTML.

    for ( var week = 0 ; week < 6 ; week++ ) { // Loop for up to 6 weeks.
      tbody += '<tr>' ; // Start a new table row.

      for ( var day = 0 ; day < 7 ; day++ ) { // Loop for 7 days in a week.
        if ( date > 0 || day === firstDayOfWeek ) { // If we've started counting days or this is the first day of the month.
          date++ ; // Increment day counter.

          if ( date <= daysInMonth ) { // If the current day is within the month.
            tbody += '<td class="' ; // Start table data cell with classes.

            if ( todaysYear === year && todaysMonth === month && todaysDate === date ) { // Check if this day is today.
              tbody += 'today ' ; // Add 'today' class.
            }

            if ( selectedYear === year && selectedMonth === month && selectedDate === date ) { // Check if this day is selected.
              tbody += 'selected ' ; // Add 'selected' class.
            }

            tbody += '" data-year="' + year + '" data-month="' + month + '" data-date="' + date + '">' + date + '</td>' ; // Close cell and add data attributes and day number.
          } else { // If the current day is beyond the month's end.
            tbody += '<td>&nbsp;</td>' ; // Add an empty cell.
          }
        } else { // If we are before the first day of the month.
          tbody += '<td>&nbsp;</td>' ; // Add an empty cell.
        }
      } // End of day loop.

      tbody += '</tr>' ; // End the table row.
    } // End of week loop.

    tbody += '</tbody>' ; // End of table body HTML.

    this . $calendarElement . html ( '<table>' + thead + tbody + '</table>' ) ; // Update the calendar's HTML content.
    this . year = year ; // Store the current displayed year.
    this . month = month ; // Store the current displayed month.
  } , // End of setMonth function.
  dateToString : function ( value ) // Converts a Date object into a 'yyyy-mm-dd' formatted string.
  { // Start of dateToString function.
    var year = value . getFullYear ( ) ; year = '' + year ; // Get year and convert to string.
    var month = value . getMonth ( ) + 1 ; month = ( ( month < 10 ) ? '0' : '' ) + month ; // Get month (1-indexed) and pad with zero if needed.
    var date = value . getDate ( ) ; date = ( ( date < 10 ) ? '0' : '' ) + date ; // Get day and pad with zero if needed.
    return year + '-' + month + '-' + date ; // Return the formatted date string.
  } , // End of dateToString function.
  stringToDate : function ( value ) // Converts a 'yyyy-mm-dd' formatted string into a Date object.
  { // Start of stringToDate function.
    var dateParts = value . split ( '-' ) ; if ( dateParts . length !== 3 ) return null ; // Split string, return null if format is incorrect.
    var year = parseInt ( dateParts [ 0 ] , 10 ) ; // Parse year component.
    var month = parseInt ( dateParts [ 1 ] , 10 ) - 1 ; // Parse month component (0-indexed).
    var date = parseInt ( dateParts [ 2 ] , 10 ) ; // Parse day component.
    return new Date ( year , month , date ) ; // Return new Date object.
  } , // End of stringToDate function.
} ; // End of DatePicker prototype object.

$ ( function ( ) // jQuery document ready function to initialize datepickers.
  { // Start of document ready handler.

    var $datepickers = $ ( '.datepicker' ) ; // Select all elements with the 'datepicker' class.
    $datepickers . each ( function ( index , element ) { new DatePicker ( element ) ; } ) ; // Initialize a new DatePicker for each found element.

  } ) ; // End of document ready handler.