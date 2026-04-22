/*!
 *
 * This is a modified version of the bootstrap-calendar plugin.
 * Original author: @ahmontero
 * License information: MIT license applies.
 *
 * This file also incorporates elements from the jQuery lightweight plugin boilerplate.
 * Boilerplate's original author: @ajpiano
 * Further modifications and comments by: @addyosmani
 * Boilerplate's license: MIT license.
 *
 */


// The following semicolon is a defensive measure.
// It helps prevent issues when this script is concatenated with other JavaScript files
// that might not have been properly terminated with a semicolon.
;( function ( $, window, document, undefined ) {

  // The `undefined` parameter is used here to ensure its true undefined value.
  // In ECMAScript 3, `undefined` was mutable and could potentially be reassigned.
  // By not passing a value for `undefined` into the IIFE, we guarantee
  // that its value within this scope is truly `undefined`.
  // In ES5 and later, `undefined` is no longer mutable globally.

  // `window` and `document` are passed as local variables for a slight performance gain.
  // This approach can also lead to more efficient minification,
  // especially when these global objects are frequently referenced within the plugin's code.

  // Establish default configuration settings for the plugin once.
  var pluginName = 'Calendar' ,

    defaults = {
      weekStart : 1 , // Default start day of the week (1 for Monday, 0 for Sunday)
      msg_days : [ "Su" , "Mo" , "Tu" , "We" , "Th" , "Fr" , "Sa" ] , // Abbreviated day names
      msg_months : [ "January" , "February" , "March" , "April" , "May" , "June" , "July" , "August" , "September" , "October" , "November" , "December" ] , // Full month names
      msg_today : 'Today' , // Text for the "Today" button
      msg_events_header : 'Events Today' , // Header for event popovers
      events : null // Placeholder for event data
    } ,

    // HTML template string for the calendar structure.
    // Note the string concatenation for multiline definition.
    template = '' +
      '<h1 class="year"></h1>' +
      '<h3 class="month"></h3>' +
      '<table class="calendar" id="calendar">' +
        '<thead class="calendar-header"></thead>' +
        '<tbody class="calendar-body"></tbody>' +
        '<tfoot>' +
          '<th colspan="2" class="sel" id="last"><div class="arrow"><i class="icon-arrow-left"></i></div></th>' +
          '<th colspan="3" class="sel" id="current">%msg_today%</th>' +
          '<th colspan="2" class="sel" id="next"><div class="arrow"><i class="icon-arrow-right"></i></div></th>' +
        '</tfoot>' +
      '</table>' +
    '' ,

    // Array storing the number of days in each month (non-leap year).
    daysInMonth = [ 31 , 28 , 31 , 30 , 31 , 30 , 31 , 31 , 30 , 31 , 30 , 31 ] ,

    // Initialize `today` with the current date.
    today = new Date() ;


  // The actual plugin constructor function.
  function Plugin ( element, options ) {
    this.element = $( element ) ; // Store the jQuery-wrapped DOM element.

    // jQuery's `extend` method merges objects.
    // We use an empty object `{}` as the first argument to ensure that
    // the `defaults` object is not modified, preserving it for future plugin instances.
    this.options = $.extend( {}, defaults, options ) ;

    this._defaults = defaults ; // Keep a reference to the original defaults.
    this._name = pluginName ; // Store the plugin's name.

    this.init() ; // Call the initialization method.
  }


  // Prototype methods for the Plugin.
  Plugin.prototype.init = function () {
    // This is where the plugin's primary initialization logic resides.
    // `this.element` refers to the DOM element the plugin was initialized on.
    // `this.options` holds the merged default and user-provided options.

    this.weekStart = this.options.weekStart || 1 ; // Set the starting day of the week.
    this.days = this.options.msg_days ; // Array of day names.
    this.months = this.options.msg_months ; // Array of month names.
    this.msg_today = this.options.msg_today ; // "Today" message.
    this.msg_events_hdr = this.options.msg_events_header ; // Events header message.
    this.events = this.options.events ; // Event data.

    // Append the calendar template to the element and attach a click handler.
    this.calendar = $( template.replace( "%msg_today%", this.msg_today ) ).appendTo( this.element ).on( {
      click : $.proxy( this.click, this ) // Use $.proxy to ensure `this` context.
    } ) ;

    this.live_date = new Date() ; // Store the currently viewed date.

    var now = new Date() ; // Get the current date and time.
    this.mm = now.getMonth() ; // Current month.
    this.yy = now.getFullYear() ; // Current year.

    var mon = new Date( this.yy, this.mm, 1 ) ; // Create a date object for the first day of the current month.
    this.yp = mon.getFullYear() ; // Year for previous month navigation.
    this.yn = mon.getFullYear() ; // Year for next month navigation.


    // Check if a component element is defined, otherwise use the main element.
    if ( this.component ) {
      this.component.on( 'click', $.proxy( this.show, this ) ) ;
    } else {
      this.element.on( 'click', $.proxy( this.show, this ) ) ;
    }

    this.renderCalendar( now ) ; // Render the calendar for the current date.
  } ;


  Plugin.prototype.renderEvents = function ( events, elem ) {
    var live_date = this.live_date ; // The date currently displayed in the calendar.
    var msg_evnts_hdr = this.msg_events_hdr ; // The header message for event popovers.

    // Loop through each day of the current month.
    for ( var i = 1 ; i <= daysInMonth[ live_date.getMonth() ] ; i++ ) {
      // Iterate over each event provided.
      $.each( events.event, function () {
        var year = 1900 + live_date.getYear() ; // Get the full year from the live_date.
        var month = live_date.getMonth() ; // Get the month from the live_date.

        var view_date = new Date( year, month, i, 0, 0, 0, 0 ) ; // Create a date for the current day being rendered.
        var event_date = new Date( this.date ) ; // Create a date object from the event's date string.

        // Compare if the event date matches the current view date.
        if ( event_date.getDate() == view_date.getDate()
          && event_date.getMonth() == view_date.getMonth()
          && event_date.getFullYear() == view_date.getFullYear()
        ) {
          // If dates match, update the corresponding day element in the calendar.
          elem.parent( 'div:first' ).find( '#day_' + i )
            .removeClass( "day" ) // Remove generic day class.
            .addClass( 'holiday' ) // Add holiday/event class.
            .empty() // Clear existing content.
            .append( '<span class="weekday">' + i + '</span>' ) // Add day number back.
            .popover( { // Attach a Bootstrap popover for event details.
              'title' : msg_evnts_hdr , // Popover title.
              'content' : 'You have ' + this.title + ' appointments' , // Popover content.
              'delay' : { 'show' : 250, 'hide' : 250 } // Delay for showing/hiding popover.
            } ) ;
        }
      } ) ;
    }
  } ;


  Plugin.prototype.loadEvents = function () {
    // Check if events data is provided and not null.
    if ( ! ( this.events === null ) ) {
      // If events is a function, execute it to get the event data.
      if ( typeof this.events == 'function' ) {
        this.renderEvents( this.events.apply( this, [] ), this.calendar ) ;
      }
    }
  } ;


  Plugin.prototype.renderCalendar = function ( date ) {
    var mon = new Date( this.yy, this.mm, 1 ) ; // Get the first day of the current month/year.

    // Clear previous year and month display.
    this.element.parent( 'div:first' ).find( '.year' ).empty() ;
    this.element.parent( 'div:first' ).find( '.month' ).empty() ;

    // Update year and month display.
    this.element.parent( 'div:first' ).find( '.year' ).append( mon.getFullYear() ) ;
    this.element.parent( 'div:first' ).find( '.month' ).append( this.months[ mon.getMonth() ] ) ;

    // Adjust days in February for leap years.
    if ( this.isLeapYear( date.getYear() ) ) {
      daysInMonth[ 1 ] = 29 ;
    } else {
      daysInMonth[ 1 ] = 28 ;
    }

    // Clear previous calendar header and body.
    this.calendar.find( '.calendar-header' ).empty() ;
    this.calendar.find( '.calendar-body' ).empty() ;

    // Render the days of the week header.
    this.renderDays() ;

    var fdom = mon.getDay() ; // Get the day of the week for the first day of the month (0=Sunday, 1=Monday, etc.).

    // Variables for rendering days.
    var dow = 0 ; // Day of month counter.
    var first = 0 ; // Counter for the first day of the month.
    var last = 0 ; // Counter for the last day of the month.

    // Loop to render calendar rows (weeks).
    for ( var i = 0 ; i >= last ; i++ ) {

      var _html = "" ; // Initialize HTML string for the current row.

      // Loop to render days within a week.
      for ( var j = this.weekStart ; j < this.days.length + this.weekStart ; j++ ) {

        var cls = "" ; // Class for the table cell.
        var msg = "" ; // Message (not currently used in this part).
        var id = "" ; // ID for the table cell.

        // Determine if we have reached the first day of the month.
        if ( first >= daysInMonth[ mon.getMonth() ] ) {
          dow = 0 ; // Reset day of month counter if past month's end.
        } else if ( ( ( dow % 7 ) > 0 && ( first % 7 ) > 0 ) || ( ( j % 7 ) == ( fdom % 7 ) ) ) {
          dow++ ; // Increment day of month.
          first++ ; // Increment first day counter.
        }

        // Check for the last day of the month.
        if ( dow == daysInMonth[ mon.getMonth() ] ) {
          last = daysInMonth[ mon.getMonth() ] ;
        }

        // Set CSS class for the day cell.
        if ( cls.length == 0 ) {
          if (
            today.getDate() == date.getDate()
            && dow == date.getDate()
            && today.getMonth() == date.getMonth()
            && today.getFullYear() == date.getFullYear()
          ) {
            cls = "today" ; // Mark the current day.
          } else if ( j % 7 == 0 || j % 7 == 6 ) {
            cls = "day weekend" ; // Mark weekend days.
          } else {
            cls = "day" ; // Generic day class.
          }
        }

        // Set ID for the day cell.
        id = "day_" + dow ;

        var month_ = date.getMonth() + 1 ; // Get the month (1-indexed).
        var year = date.getFullYear() ; // Get the full year.

        // Render HTML for the day cell.
        if ( dow == 0 ) {
          _html += '<td>&nbsp;</td>' ; // Empty cell for days before the 1st of the month.
        } else if ( msg.length > 0 ) {
          // This branch for 'msg' is currently not used, but kept for potential future feature.
          _html += '<td class="' + cls + '" id="' + id + '" year="' + year + '" month="' + month_ + '" day="' + dow + '"><span class="weekday">' + dow + '</span></td>' ;
        } else {
          _html += '<td class="' + cls + '" id="' + id + '" year="' + year + '" month="' + month_ + '" day="' + dow + '">' + dow + '</td>' ;
        }

      } // End of inner loop for days in a week.
      _html = "<tr>" + _html + "</tr>" ; // Wrap the week's days in a table row.
      this.calendar.find( '.calendar-body' ).append( _html ) ; // Append the row to the calendar body.
    } // End of outer loop for weeks.
    this.loadEvents() ; // Load and render events for the newly rendered calendar.
  } ;


  Plugin.prototype.renderDays = function () {
    var html = '' ; // Initialize HTML string for day headers.
    // Loop to create table headers for each day of the week.
    for ( var j = this.weekStart ; j < this.weekStart + 7 ; j++ ) {
      html += "<th>" + this.days[ j % 7 ] + "</th>" ; // Append day name.
    }

    var _html = "<tr>" + html + "</tr>" ; // Wrap day headers in a table row.
    this.calendar.find( '.calendar-header' ).append( _html ) ; // Append to calendar header.
  } ;


  Plugin.prototype.click = function ( e ) {
    e.stopPropagation() ; // Prevent event from bubbling up.
    e.preventDefault() ; // Prevent default action (e.g., link click).
    var target = $( e.target ).closest( 'td, th' ) ; // Find the closest table cell or header.

    if ( target.length == 1 ) {
      var day, month, year ; // Declare variables for day, month, year.
      switch ( target[ 0 ].nodeName.toLowerCase() ) {
        case 'td' : // If a table data cell was clicked.
          if ( target.is( '.day' ) ) {
            day = parseInt( target.attr( 'day' ), 10 ) || 1 ;
            month = parseInt( target.attr( 'month' ), 10 ) || 1 ;
            year = parseInt( target.attr( 'year' ), 10 ) || 1 ;

            this.element.trigger( {
              type : 'changeDay' , // Custom event for day change.
              day : day ,
              month : month ,
              year : year
            } ) ;
          } else if ( target.is( '.holiday' ) ) {
            day = parseInt( target.attr( 'day' ), 10 ) || 1 ;
            month = parseInt( target.attr( 'month' ), 10 ) || 1 ;
            year = parseInt( target.attr( 'year' ), 10 ) || 1 ;

            this.element.trigger( {
              type : 'onEvent' , // Custom event for event click.
              day : day ,
              month : month ,
              year : year
            } ) ;
          } else if ( target.is( '.today' ) ) {
            day = parseInt( target.attr( 'day' ), 10 ) || 1 ;
            month = parseInt( target.attr( 'month' ), 10 ) || 1 ;
            year = parseInt( target.attr( 'year' ), 10 ) || 1 ;

            this.element.trigger( {
              type : 'changeDay' , // Also trigger changeDay for 'today' cell.
              day : day ,
              month : month ,
              year : year
            } ) ;
          }
          break ; // End of 'td' case.
        case 'th' : // If a table header cell was clicked (for navigation).
          if ( target.is( '.sel' ) ) { // Check if it's a selectable navigation header.
            switch ( target.attr( "id" ) ) {
              case 'last' : // Previous month button.
                this.update_date( 'prv' ) ; // Update internal date state.
                var prv = new Date( this.yp, this.mm, 1 ) ; // Create date for previous month.
                this.live_date = prv ; // Set live_date.
                this.renderCalendar( prv, this.events ) ; // Render calendar for previous month.
                this.element.trigger( {
                  type : 'onPrev' // Custom event for previous month navigation.
                } ) ;
                break ;
              case 'current' : // Today button.
                this.update_date( 'crt' ) ; // Update internal date state to current.
                var now = new Date() ; // Get actual current date.
                this.live_date = now ; // Set live_date.
                this.renderCalendar( now, this.events ) ; // Render calendar for current month.
                this.element.trigger( {
                  type : 'onCurrent' // Custom event for current month navigation.
                } ) ;
                break ;
              case 'next' : // Next month button.
                this.update_date( 'nxt' ) ; // Update internal date state.
                var nxt = new Date( this.yn, this.mm, 1 ) ; // Create date for next month.
                this.live_date = nxt ; // Set live_date.
                this.renderCalendar( nxt, this.events ) ; // Render calendar for next month.
                this.element.trigger( {
                  type : 'onNext' // Custom event for next month navigation.
                } ) ;
                break ;
              default : // Fallback for other header clicks.
                break ;
            }
          }
          break ; // End of 'th' case.
        default : // Fallback for other elements clicked within the calendar.
          break ;
      } // End of switch(nodeName).
    } // End of if(target.length == 1).
  } ;


  Plugin.prototype.update_date = function ( action ) {
    var now = new Date() ; // Create a new Date object, initially representing the current moment.

    switch ( action ) {
      case 'prv' : // Action: navigate to previous month.
        now = new Date( this.yy, this.mm - 1, 1 ) ; // Set `now` to the first day of the previous month.
        break ;
      case 'nxt' : // Action: navigate to next month.
        now = new Date( this.yy, this.mm + 1, 1 ) ; // Set `now` to the first day of the next month.
        break ;
      case 'crt' : // Action: navigate to current month (no change to `now` needed).
        break ;
      default : // Default case, no date update.
        break ;
    }

    this.mm = now.getMonth() ; // Update the stored month.
    this.yy = now.getFullYear() ; // Update the stored year.

    var mon = new Date( this.yy, this.mm, 1 ) ; // Create a date object for the first day of the *updated* month.
    this.yp = mon.getFullYear() ; // Set year for previous month navigation.
    this.yn = mon.getFullYear() ; // Set year for next month navigation.
  } ;


  Plugin.prototype.isLeapYear = function ( year ) {
    // Determine if the given year is a leap year.
    // A year is a leap year if it is divisible by 4,
    // unless it is divisible by 100 but not by 400.
    return ( ( ( year % 4 === 0 ) && ( year % 100 !== 0 ) ) || ( year % 400 === 0 ) ) ;
  } ;


  // A lightweight jQuery plugin wrapper around the `Plugin` constructor.
  // This prevents multiple instantiations of the plugin on the same element.
  $.fn[ pluginName ] = function ( options ) {
    return this.each( function () {
      // Check if the plugin instance already exists on this element's data.
      if ( ! $.data( this, 'plugin_' + pluginName ) ) {
        // If not, create a new instance and store it in the element's data.
        $.data( this, 'plugin_' + pluginName,
          new Plugin( this, options ) ) ;
      }
    } ) ;
  } ;


} ) ( jQuery, window, document ) ; // Immediately-invoked function expression (IIFE) closure.