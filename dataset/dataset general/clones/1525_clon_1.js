/* This file is part of the jQuery Countdown plugin.
   Original author: Keith Wood (kbwood{at}iinet.com.au)
   License information: Dual licensed under GPL (http://dev.jquery.com/browser/trunk/jquery/GPL-LICENSE.txt)
   and MIT (http://dev.jquery.com/browser/trunk/jquery/MIT-LICENSE.txt).
   Please retain this attribution if you use this code.
   Version: 1.5.4
   Project URL: http://keith-wood.name/countdown.html
*/

/*
 *  How to use this plugin:
 *  Simply select a div and call .countdown() with your desired options.
 *  Example:
 *  $('div.my-timer').countdown({
 *      until: new Date(2025, 1 - 1, 1, 0, 0, 0), // Countdown to Jan 1, 2025
 *      onExpiry: function() { console.log('Countdown finished!'); }
 *  });
 *
 */

( function ( $ ) { // Start of an immediately invoked function expression (IIFE) to encapsulate code and avoid global variable pollution.

	// Countdown class definition starts here.
	function Countdown ( )
	{
		// Array to hold regional settings for different languages.
		this.regional = [ ] ;

		// Default regional settings (English).
		this.regional [ '' ] = {
			// Labels for time periods (Years, Months, Weeks, etc.).
			labels         : [ 'Years', 'Months', 'Weeks', 'Days', 'Hours', 'Minutes', 'Seconds' ] ,
			// Labels for singular time periods (Year, Month, etc.).
			labels1        : [ 'Year', 'Month', 'Week', 'Day', 'Hour', 'Minute', 'Second' ] ,
			// Compact labels for shorter displays.
			compactLabels  : [ 'y', 'm', 'w', 'd' ] ,
			// Separator used between time components (e.g., "10:30:00").
			timeSeparator  : ':' ,
			// Boolean indicating Right-To-Left (RTL) language support.
			isRTL          : false
		} ;

		// Default options for all countdown instances.
		this._defaults = {
			until        : null , // Target date/time for countdown. Can be Date object, seconds offset (number), or string (e.g., '+10d +5h').
			since        : null , // Target date/time for count-up. Same formats as 'until'.
			timezone     : null , // Timezone offset in hours or minutes from GMT. Null means client's local timezone.
			serverSync   : null , // Function to get current server time for synchronization.
			format       : 'dHMS' , // Display format: 'Y' (years), 'O' (months), 'W' (weeks), 'D' (days), 'H' (hours), 'M' (minutes), 'S' (seconds).
			                     // Uppercase means always show, lowercase means show only if non-zero.
			layout       : '' ,   // Custom layout string for advanced formatting.
			compact      : false ,// If true, display in a compact format.
			description  : '' ,   // Text description to show alongside the countdown.
			expiryUrl    : '' ,   // URL to redirect to when countdown expires.
			expiryText   : '' ,   // Text to display when countdown expires, replacing the timer.
			alwaysExpire : false ,// If true, onExpiry is always triggered, even if the countdown never started or is already expired.
			onExpiry     : null , // Callback function executed when the countdown reaches its target time.
			                     // 'this' refers to the countdown div. No arguments.
			onTick       : null   // Callback function executed on each timer tick.
			                     // Receives an array of 7 integers (years, months, weeks, days, hours, minutes, seconds)
			                     // representing the breakdown of the remaining/elapsed time.
			                     // 'this' refers to the countdown div.
		} ;

		// Merge default regional settings into the main defaults.
		$.extend( this._defaults , this.regional [ '' ] ) ;
	} // End of Countdown constructor function.


	// Define a constant for the data property name to avoid magic strings.
	var PROP_NAME = 'countdown' ;

	// Constants for period array indices for better readability.
	var Y = 0 ; // Index for Years
	var O = 1 ; // Index for Months
	var W = 2 ; // Index for Weeks
	var D = 3 ; // Index for Days
	var H = 4 ; // Index for Hours
	var M = 5 ; // Index for Minutes
	var S = 6 ; // Index for Seconds


	// Extend the Countdown prototype with shared methods and properties.
	$.extend( Countdown.prototype , {
		// CSS class name added to elements that have been initialized as countdown widgets.
		markerClassName : 'hasCountdown' ,
		
		// A single, shared timer (interval) for all countdown instances on the page.
		// This optimizes performance by not creating multiple setIntervals.
		_timer : setInterval( function ( ) { $.countdown._updateTargets ( ) ; } , 980 ) , // Update every 980ms to ensure second changes are caught reliably.
		// Array to keep track of all elements currently managed by the countdown timer.
		_timerTargets : [ ] ,
		
		/**
		 *  Overrides the default settings for all countdown instances.
		 *  @param  options  (object) The new settings to use as defaults.
		 */
		setDefaults : function ( options ) {
			// Reset any custom labels if the main labels are being changed.
			this._resetExtraLabels( this._defaults , options ) ;
			// Merge the new options into the global defaults, removing nulls.
			extendRemove( this._defaults , options || { } ) ;
		} ,

		/**
		 *  Converts a date/time to its UTC equivalent based on a given timezone offset.
		 *  This is crucial for consistent countdowns across different client timezones.
		 *
		 *  @param  tz     (number) The hour or minute offset from GMT (e.g., +9 for +9:00, -360 for -06:00).
		 *  @param  year   (Date or number) The date/time object OR the year in that timezone.
		 *  @param  month  (number, optional) The month (0-11). Omit if 'year' is a Date object.
		 *  @param  day    (number, optional) The day of the month. Omit if 'year' is a Date object.
		 *  @param  hours  (number, optional) The hour (0-23). Omit if 'year' is a Date object.
		 *  @param  mins   (number, optional) The minute (0-59). Omit if 'year' is a Date object.
		 *  @param  secs   (number, optional) The second (0-59). Omit if 'year' is a Date object.
		 *  @param  ms     (number, optional) The millisecond (0-999). Omit if 'year' is a Date object.
		 *  @return (Date) The equivalent UTC date/time object.
		 */
		UTCDate : function ( tz , year , month , day , hours , mins , secs , ms ) {
			// If the 'year' argument is actually a Date object, extract its components.
			if ( typeof year == 'object' && year.constructor == Date )
			{
				ms    = year.getMilliseconds ( ) ;
				secs  = year.getSeconds ( ) ;
				mins  = year.getMinutes ( ) ;
				hours = year.getHours ( ) ;
				day   = year.getDate ( ) ;
				month = year.getMonth ( ) ;
				year  = year.getFullYear ( ) ;
			}

			// Create a new Date object to work with.
			var d = new Date ( ) ;

			// Set UTC date components.
			d.setUTCFullYear ( year ) ;
			d.setUTCDate ( 1 ) ; // Reset day to 1 to avoid month overflow issues when setting month.
			d.setUTCMonth ( month || 0 ) ;
			d.setUTCDate ( day || 1 ) ;
			d.setUTCHours ( hours || 0 ) ;
			// Adjust minutes for the given timezone offset.
			// If tz is less than 30 (likely hours), convert to minutes. Otherwise, assume tz is already minutes.
			d.setUTCMinutes ( ( mins || 0 ) - ( Math.abs ( tz ) < 30 ? tz * 60 : tz ) ) ;
			d.setUTCSeconds ( secs || 0 ) ;
			d.setUTCMilliseconds ( ms || 0 ) ;

			return d ;
		} ,

		/**
		 *  Attaches the countdown widget functionality to a specified DOM element.
		 *
		 *  @param  target   (element) The DOM element (e.g., a div) to attach the countdown to.
		 *  @param  options  (object) The initial configuration settings for this specific countdown instance.
		 */
		_attachCountdown : function ( target , options ) {
			// Wrap the target element in a jQuery object for easier manipulation.
			var $target = $( target ) ;

			// If the element already has the countdown class, it's already initialized, so return early.
			if ( $target.hasClass ( this.markerClassName ) ) {
				return ;
			}

			// Add the marker class to indicate that this element is now a countdown widget.
			$target.addClass ( this.markerClassName ) ;

			// Create an instance object to store countdown-specific data.
			var inst = {
				options : $.extend ( { } , options ) , // Deep copy of options to prevent unintended sharing.
				_periods : [ 0 , 0 , 0 , 0 , 0 , 0 , 0 ] // Initialize periods array (years, months, weeks, days, hours, minutes, seconds).
			} ;

			// Store the instance data directly on the DOM element using jQuery's data method.
			$.data( target , PROP_NAME , inst ) ;

			// Initialize or update the countdown display based on the new settings.
			this._changeCountdown( target ) ;
		} ,

		/**
		 *  Adds a given target element to the list of currently active countdowns.
		 *  This ensures that the shared timer will update this countdown.
		 *
		 *  @param  target  (element) The DOM element that is a countdown target.
		 */
		_addTarget : function ( target ) {
			// Only add if the target is not already in the list.
			if ( ! this._hasTarget ( target ) ) {
				this._timerTargets.push ( target ) ;
			}
		} ,

		/**
		 *  Checks if a specified target element is currently in the list of active countdowns.
		 *
		 *  @param  target  (element) The DOM element to check.
		 *  @return (boolean) True if the target is active, false otherwise.
		 */
		_hasTarget : function ( target ) {
			// Use $.inArray to efficiently check for the target's presence in the array.
			return ( $.inArray ( target , this._timerTargets ) > -1 ) ;
		} ,

		/**
		 *  Removes a target element from the list of active countdowns.
		 *  This stops the shared timer from updating this particular countdown.
		 *
		 *  @param  target  (element) The DOM element to remove.
		 */
		_removeTarget : function ( target ) {
			// Use $.map to create a new array, filtering out the specified target.
			this._timerTargets = $.map( this._timerTargets ,
				function ( value ) { return ( value == target ? null : value ) ; } ) ; // If value matches target, return null to remove it.
		} ,

		/**
		 *  Iterates through all active countdown targets and triggers an update for each.
		 *  This method is called by the shared `_timer` interval.
		 */
		_updateTargets : function ( ) {
			// Loop through the array of active targets.
			for ( var i = 0 ; i < this._timerTargets.length ; i++ ) {
				// Call the individual update function for each target.
				this._updateCountdown ( this._timerTargets [ i ] ) ;
			}
		} ,

		/**
		 *  Redraws the countdown display with the most current time information.
		 *  Handles expiry, tick callbacks, and layout generation.
		 *
		 *  @param  target  (jQuery) The jQuery object representing the containing division.
		 *  @param  inst    (object, optional) The current settings instance for this countdown.
		 *                  If not provided, it's retrieved from the element's data.
		 */
		_updateCountdown : function ( target , inst ) {
			var $target = $( target ) ;

			// Retrieve instance data if not provided.
			inst = inst || $.data( target , PROP_NAME ) ;

			// If no instance data, the countdown is not properly initialized or has been destroyed.
			if ( ! inst ) {
				return ;
			}

			// Generate and set the HTML content for the countdown display.
			$target.html( this._generateHTML ( inst ) ) ;

			// Add or remove the RTL class based on the 'isRTL' option.
			$target [ ( this._get ( inst , 'isRTL' ) ? 'add' : 'remove' ) + 'Class' ] ( 'countdown_rtl' ) ;

			// Retrieve the 'onTick' callback function.
			var onTick = this._get ( inst , 'onTick' ) ;

			// If an onTick callback is defined, execute it.
			if ( onTick ) {
				onTick.apply( target , [ inst._hold != 'lap' ? inst._periods :
					this._calculatePeriods( inst , inst._show , new Date ( ) ) ] ) ;
			}

			// Determine if the countdown has expired.
			// It's expired if not 'paused' and either counting up past 'since' or counting down past 'until'.
			var expired = inst._hold != 'pause' &&
				( inst._since ? inst._now.getTime ( ) <= inst._since.getTime ( ) :
				inst._now.getTime ( ) >= inst._until.getTime ( ) ) ;

			// Handle expiry logic.
			if ( expired && ! inst._expiring ) {
				inst._expiring = true ; // Set flag to prevent multiple expiry triggers.

				// If the target is active or 'alwaysExpire' is true, proceed with expiry actions.
				if ( this._hasTarget ( target ) || this._get ( inst , 'alwaysExpire' ) ) {
					this._removeTarget ( target ) ; // Stop updating this target.

					var onExpiry = this._get ( inst , 'onExpiry' ) ;
					if ( onExpiry ) {
						onExpiry.apply ( target , [ ] ) ; // Execute the onExpiry callback.
					}

					var expiryText = this._get ( inst , 'expiryText' ) ;
					if ( expiryText ) {
						var layout = this._get ( inst , 'layout' ) ; // Save current layout.
						inst.options.layout = expiryText ; // Temporarily change layout to expiry text.
						this._updateCountdown ( target , inst ) ; // Update display with expiry text.
						inst.options.layout = layout ; // Restore original layout.
					}

					var expiryUrl = this._get ( inst , 'expiryUrl' ) ;
					if ( expiryUrl ) {
						window.location = expiryUrl ; // Redirect to expiry URL.
					}
				}
				inst._expiring = false ; // Reset expiry flag.
			}
			// If the countdown is paused, remove it from active targets.
			else if ( inst._hold == 'pause' ) {
				this._removeTarget ( target ) ;
			}

			// Save the updated instance data back to the element.
			$.data( target , PROP_NAME , inst ) ;
		} ,

		/**
		 *  Reconfigures the settings for an existing countdown instance.
		 *  Can update multiple options at once or a single property.
		 *
		 *  @param  target   (element) The DOM element containing the countdown.
		 *  @param  options  (object or string) New settings object OR the name of a single property to change.
		 *  @param  value    (any, optional) The value for the single property if 'options' is a string.
		 */
		_changeCountdown : function ( target , options , value ) {
			options = options || { } ; // Ensure options is an object.

			// If options is a string, it means a single property is being changed.
			if ( typeof options == 'string' ) {
				var name = options ;
				options = { } ;
				options [ name ] = value ; // Create an object with the single property.
			}

			// Retrieve the current instance data for the target.
			var inst = $.data( target , PROP_NAME ) ;

			// If an instance exists, update its settings.
			if ( inst ) {
				// Reset extra labels if 'labels' options are being modified.
				this._resetExtraLabels ( inst.options , options ) ;
				// Merge new options into existing options, removing nulls.
				extendRemove ( inst.options , options ) ;
				// Recalculate internal settings based on updated options.
				this._adjustSettings ( target , inst ) ;
				// Store the updated instance data.
				$.data ( target , PROP_NAME , inst ) ;

				var now = new Date ( ) ;

				// If counting since a past date/time or until a future date/time, add to active targets.
				if ( ( inst._since && inst._since < now ) ||
						( inst._until && inst._until > now ) )
				{
					this._addTarget ( target ) ;
				}

				// Update the display with the new settings.
				this._updateCountdown ( target , inst ) ;
			}
		} ,

		/**
		 *  Resets any dynamically generated 'labelsN' or 'compactLabelsN' entries
		 *  if the primary 'labels' or 'compactLabels' are being changed.
		 *  This prevents stale custom labels from persisting.
		 *
		 *  @param  base     (object) The base options object (e.g., _defaults or inst.options) to be updated.
		 *  @param  options  (object) The new option values being applied.
		 */
		_resetExtraLabels : function ( base , options ) {
			var changingLabels = false ;

			// Check if any label-related option is present in the new options.
			for ( var n in options ) {
				if ( n.match ( /[Ll]abels/ ) ) {
					changingLabels = true ;
					break ;
				}
			}

			// If labels are changing, remove any custom numbered label entries.
			if ( changingLabels ) {
				for ( var n in base ) { // Iterate over all properties in the base options.
					if ( n.match ( /[Ll]abels[0-9]/ ) ) { // Look for properties like 'labels1', 'compactLabels2'.
						base [ n ] = null ; // Set them to null to remove them or reset them.
					}
				}
			}
		} ,
		
		/**
		 *  Calculates and sets internal instance settings like `_since`, `_until`, and `_show`.
		 *  Handles timezone adjustments and server synchronization.
		 *
		 *  @param  target  (element) The containing DOM element.
		 *  @param  inst    (object) The current settings instance for this countdown.
		 */
		_adjustSettings : function ( target , inst ) {
			// Get server sync function if defined, and execute it to get server time.
			var serverSync = this._get ( inst , 'serverSync' ) ;
			serverSync = ( serverSync ? serverSync.apply ( target , [ ] ) : null ) ;

			var now = new Date ( ) ; // Current client time.

			// Determine the timezone offset. If null, use client's local offset.
			var timezone = this._get ( inst , 'timezone' ) ;
			timezone = ( timezone == null ? - now.getTimezoneOffset ( ) : timezone ) ;

			// Process the 'since' date/time.
			inst._since = this._get ( inst , 'since' ) ;
			if ( inst._since ) {
				// Convert 'since' to UTC based on the determined timezone.
				inst._since = this.UTCDate ( timezone , this._determineTime ( inst._since , null ) ) ;
				// Adjust 'since' based on server time if synchronization is enabled.
				if ( inst._since && serverSync ) {
					inst._since.setMilliseconds ( inst._since.getMilliseconds ( ) +
						now.getTime ( ) - serverSync.getTime ( ) ) ;
				}
			}

			// Process the 'until' date/time.
			inst._until = this.UTCDate ( timezone , this._determineTime ( this._get ( inst , 'until' ) , now ) ) ;
			// Adjust 'until' based on server time if synchronization is enabled.
			if ( serverSync ) {
				inst._until.setMilliseconds ( inst._until.getMilliseconds ( ) +
					now.getTime ( ) - serverSync.getTime ( ) ) ;
			}

			// Set the current time for the instance, adjusting for server sync if applicable.
			inst._now = ( serverSync ? new Date ( serverSync.getTime ( ) + ( now.getTime ( ) - serverSync.getTime ( ) ) ) : now ) ;

			// Determine which periods (years, months, etc.) should be displayed.
			inst._show = this._determineShow ( inst ) ;
		} ,

		/**
		 *  Removes the countdown widget functionality and its display from a DOM element.
		 *
		 *  @param  target  (element) The DOM element from which to remove the countdown.
		 */
		_destroyCountdown : function ( target ) {
			var $target = $( target ) ;

			// If the element doesn't have the marker class, it's not a countdown widget.
			if ( ! $target.hasClass ( this.markerClassName ) ) {
				return ;
			}

			// Remove the target from the list of active countdowns.
			this._removeTarget ( target ) ;

			// Remove the marker class and clear the element's content.
			$target.removeClass ( this.markerClassName ).empty ( ) ;

			// Remove the stored instance data from the element.
			$.removeData ( target , PROP_NAME ) ;
		} ,

		/**
		 *  Pauses a countdown widget at its current display time.
		 *  The countdown internally stops running, and the displayed time is frozen.
		 *
		 *  @param  target  (element) The containing DOM element of the countdown.
		 */
		_pauseCountdown : function ( target ) {
			this._hold ( target , 'pause' ) ; // Call the general hold function with 'pause' state.
		} ,

		/**
		 *  "Laps" a countdown widget, freezing its display but allowing the internal timer
		 *  to continue running in the background. Useful for showing a snapshot.
		 *
		 *  @param  target  (element) The containing DOM element of the countdown.
		 */
		_lapCountdown : function ( target ) {
			this._hold ( target , 'lap' ) ; // Call the general hold function with 'lap' state.
		} ,

		/**
		 *  Resumes a previously paused or lapped countdown widget.
		 *  The timer will restart or the display will catch up to the current time.
		 *
		 *  @param  target  (element) The containing DOM element of the countdown.
		 */
		_resumeCountdown : function ( target ) {
			this._hold ( target , null ) ; // Call the general hold function with null to resume.
		} ,

		/**
		 *  Manages the 'hold' state of a countdown widget (pause, lap, or resume).
		 *
		 *  @param  target  (element) The containing DOM element.
		 *  @param  hold    (string or null) The new hold setting ('pause', 'lap', or null to resume).
		 */
		_hold : function ( target , hold ) {
			var inst = $.data ( target , PROP_NAME ) ;

			if ( inst ) {
				// If resuming from a 'pause' state.
				if ( inst._hold == 'pause' && ! hold ) {
					inst._periods = inst._savePeriods ; // Restore saved periods.
					// Recalculate _since or _until based on the saved periods to effectively resume from the paused point.
					var sign = ( inst._since ? '-' : '+' ) ; // Determine if counting up or down.
					inst [ inst._since ? '_since' : '_until' ] =
						this._determineTime ( sign + inst._periods [ 0 ] + 'y' + // Years
							sign + inst._periods [ 1 ] + 'o' + // Months
							sign + inst._periods [ 2 ] + 'w' + // Weeks
							sign + inst._periods [ 3 ] + 'd' + // Days
							sign + inst._periods [ 4 ] + 'h' + // Hours
							sign + inst._periods [ 5 ] + 'm' + // Minutes
							sign + inst._periods [ 6 ] + 's' ) ; // Seconds
					this._addTarget ( target ) ; // Add back to active targets for updates.
				}

				inst._hold = hold ; // Set the new hold state.
				// Save current periods if pausing, otherwise clear saved periods.
				inst._savePeriods = ( hold == 'pause' ? inst._periods : null ) ;

				$.data ( target , PROP_NAME , inst ) ; // Store updated instance.
				this._updateCountdown ( target , inst ) ; // Update display.
			}
		} ,

		/**
		 *  Returns the current time periods (years, months, weeks, etc.) for a countdown.
		 *
		 *  @param  target  (element) The containing DOM element.
		 *  @return (number[7] or null) An array of 7 numbers representing the periods,
		 *                               or null if the instance is not found.
		 */
		_getTimesCountdown : function ( target ) {
			var inst = $.data ( target , PROP_NAME ) ;

			// If no instance, return null. Otherwise, return current periods.
			// If in 'lap' mode, calculate periods based on current time, don't use frozen _periods.
			return ( ! inst ? null : ( ! inst._hold ? inst._periods :
				this._calculatePeriods ( inst , inst._show , new Date ( ) ) ) ) ;
		} ,

		/**
		 *  Retrieves a setting value for a specific countdown instance.
		 *  If the setting is not defined in the instance's options, it falls back to the global defaults.
		 *
		 *  @param  inst  (object) The current settings instance for this countdown.
		 *  @param  name  (string) The name of the required setting (e.g., 'labels', 'format').
		 *  @return (any) The value of the setting, or its default value if not overridden.
		 */
		_get : function ( inst , name ) {
			// Check if the option exists in the instance's options. If so, return it.
			// Otherwise, return the value from the global default settings.
			return ( inst.options [ name ] != null ?
				inst.options [ name ] : $.countdown._defaults [ name ] ) ;
		} ,

		/**
		 *  Determines a specific date/time based on a given setting, which can be
		 *  an exact Date, a numeric seconds offset, or a relative string offset.
		 *
		 *  @param  setting      (string, number, or Date) The date/time value.
		 *  @param  defaultTime  (Date) The date/time to use if no other is supplied.
		 *  @return (Date) The calculated date/time object.
		 */
		_determineTime : function ( setting , defaultTime ) {

			// Helper function to calculate a date/time from a numeric seconds offset.
			var offsetNumeric = function ( offset ) { // Example: +300 (seconds), -2 (seconds).
				var time = new Date ( ) ;
				time.setTime ( time.getTime ( ) + offset * 1000 ) ; // Add/subtract milliseconds.
				return time ;
			} ;

			// Helper function to calculate a date/time from a string offset.
			var offsetString = function ( offset ) { // Example: '+2d', '-4w', '+3h +30m'.
				offset = offset.toLowerCase ( ) ; // Convert to lowercase for case-insensitive matching.
				var time = new Date ( ) ;
				var year   = time.getFullYear ( ) ;
				var month  = time.getMonth ( ) ;
				var day    = time.getDate ( ) ;
				var hour   = time.getHours ( ) ;
				var minute = time.getMinutes ( ) ;
				var second = time.getSeconds ( ) ;

				// Regular expression to parse offset strings like "([+-]?[0-9]+)\s*(s|m|h|d|w|o|y)?".
				var pattern = /([+-]?[0-9]+)\s*(s|m|h|d|w|o|y)?/g ;
				var matches = pattern.exec ( offset ) ;

				// Loop through all matches found in the offset string.
				while ( matches ) {
					// Apply the offset based on the unit.
					switch ( matches [ 2 ] || 's' ) { // Default unit is seconds if not specified.
						case 's' : second += parseInt ( matches [ 1 ] , 10 ) ; break ; // Seconds
						case 'm' : minute += parseInt ( matches [ 1 ] , 10 ) ; break ; // Minutes
						case 'h' : hour   += parseInt ( matches [ 1 ] , 10 ) ; break ; // Hours
						case 'd' : day    += parseInt ( matches [ 1 ] , 10 ) ; break ; // Days
						case 'w' : day    += parseInt ( matches [ 1 ] , 10 ) * 7 ; break ; // Weeks (7 days)
						case 'o' : // Months
							month += parseInt ( matches [ 1 ] , 10 ) ;
							day = Math.min ( day , $.countdown._getDaysInMonth ( year , month ) ) ; // Adjust day to prevent overflow (e.g., Feb 30).
							break ;
						case 'y' : // Years
							year += parseInt ( matches [ 1 ] , 10 ) ;
							day = Math.min ( day , $.countdown._getDaysInMonth ( year , month ) ) ; // Adjust day for leap years or month changes.
							break ;
					}
					matches = pattern.exec ( offset ) ; // Find the next match.
				}
				// Return a new Date object constructed from the adjusted components.
				return new Date ( year , month , day , hour , minute , second , 0 ) ;
			} ;

			// Determine the final time based on the 'setting' type.
			var time = ( setting == null ? defaultTime :
				( typeof setting == 'string' ? offsetString ( setting ) :
				( typeof setting == 'number' ? offsetNumeric ( setting ) : setting ) ) ) ;

			// If a time was determined, set its milliseconds to 0 for consistency.
			if ( time ) {
				time.setMilliseconds ( 0 ) ;
			}
			return time ;
		} ,

		/**
		 *  Calculates the number of days in a given month for a specific year.
		 *  Handles leap years correctly.
		 *
		 *  @param  year   (number) The year (e.g., 2024).
		 *  @param  month  (number) The month (0-11, where 0 is January).
		 *  @return (number) The number of days in that month.
		 */
		_getDaysInMonth : function ( year , month ) {
			// Using `new Date(year, month, 32).getDate()` is a clever way:
			// It creates a date for the 32nd day of the month. Date objects automatically
			// roll over to the next month if the day exceeds the actual days in the month.
			// So, if month is February, and year is 2024 (leap year), Feb 29 + 3 days = March 3.
			// The date will be March 3. `getDate()` will return 3.
			// 32 - 3 = 29. Correct for Feb 2024.
			// If month is February, and year is 2023 (non-leap year), Feb 28 + 4 days = March 4.
			// The date will be March 4. `getDate()` will return 4.
			// 32 - 4 = 28. Correct for Feb 2023.
			return 32 - new Date ( year , month , 32 ).getDate ( ) ;
		} ,

		/**
		 *  Generates the HTML string to display the current state of the countdown widget.
		 *  This function handles compact vs. full display, custom layouts, and period formatting.
		 *
		 *  @param  inst  (object) The current settings instance for this countdown.
		 *  @return (string) The HTML string representing the countdown display.
		 */
		_generateHTML : function ( inst ) {
			// Determine the time periods (years, months, etc.) to display.
			// If the countdown is on 'hold', use the stored _periods; otherwise, calculate them dynamically.
			inst._periods = periods = ( inst._hold ? inst._periods :
				this._calculatePeriods ( inst , inst._show , new Date ( ) ) ) ;

			// Logic to handle 'asNeeded' display ('?') for periods:
			// Once a non-zero period is shown, all subsequent '?' periods are also shown.
			var shownNonZero = false ;
			var showCount = 0 ; // Counter for how many periods are actually shown.

			for ( var period = 0 ; period < inst._show.length ; period++ ) {
				// If current period is '?' and its value is > 0, set shownNonZero to true.
				shownNonZero |= ( inst._show [ period ] == '?' && periods [ period ] > 0 ) ;
				// If '?' and no non-zero period has been shown yet, set to null (don't show).
				inst._show [ period ] = ( inst._show [ period ] == '?' && ! shownNonZero ? null : inst._show [ period ] ) ;
				showCount += ( inst._show [ period ] ? 1 : 0 ) ; // Increment count if this period is to be shown.
			}

			// Retrieve display options.
			var compact       = this._get ( inst , 'compact' ) ;
			var layout        = this._get ( inst , 'layout' ) ;
			var labels        = ( compact ? this._get ( inst , 'compactLabels' ) : this._get ( inst , 'labels' ) ) ;
			var timeSeparator = this._get ( inst , 'timeSeparator' ) ;
			var description   = this._get ( inst , 'description' ) || '' ;

			// Helper function to generate HTML for a single period in compact format.
			var showCompact = function ( period ) {
				// Get specific label for the period value if available (e.g., labels1 for 1 Day).
				var labelsNum = $.countdown._get ( inst , 'compactLabels' + periods [ period ] ) ;
				return ( inst._show [ period ] ? periods [ period ] +
					( labelsNum ? labelsNum [ period ] : labels [ period ] ) + ' ' : '' ) ;
			} ;

			// Helper function to generate HTML for a single period in full format.
			var showFull = function ( period ) {
				// Get specific label for the period value if available.
				var labelsNum = $.countdown._get ( inst , 'labels' + periods [ period ] ) ;
				return ( inst._show [ period ] ?
					'<span class="countdown_section"><span class="countdown_amount">' +
					periods [ period ] + '</span><br/>' +
					( labelsNum ? labelsNum [ period ] : labels [ period ] ) + '</span>' : '' ) ;
			} ;

			// Return the final HTML string.
			return ( layout ? this._buildLayout ( inst , layout , compact ) : // If a custom layout is provided, use it.
				( ( compact ? // Otherwise, choose between compact or full default layout.
				// Compact version HTML:
				'<span class="countdown_row countdown_amount' +
				( inst._hold ? ' countdown_holding' : '' ) + '">' +
				showCompact ( Y ) + showCompact ( O ) + showCompact ( W ) + showCompact ( D ) +
				( inst._show [ H ] ? this._minDigits ( periods [ H ] , 2 ) : '' ) + // Hours, padded to 2 digits.
				( inst._show [ M ] ? ( inst._show [ H ] ? timeSeparator : '' ) + // Minutes, with separator if hours shown.
				this._minDigits ( periods [ M ] , 2 ) : '' ) +
				( inst._show [ S ] ? ( inst._show [ H ] || inst._show [ M ] ? timeSeparator : '' ) + // Seconds, with separator if hours or minutes shown.
				this._minDigits ( periods [ S ] , 2 ) : '' ) :
				// Full version HTML:
				'<span class="countdown_row countdown_show' + showCount +
				( inst._hold ? ' countdown_holding' : '' ) + '">' +
				showFull ( Y ) + showFull ( O ) + showFull ( W ) + showFull ( D ) +
				showFull ( H ) + showFull ( M ) + showFull ( S ) ) + '</span>' +
				// Add description if available.
				( description ? '<span class="countdown_row countdown_descr">' + description + '</span>' : '' ) ) ) ;
		} ,

		/**
		 *  Constructs the HTML for the countdown display using a custom layout string.
		 *  This allows users to define their own display structure using placeholders.
		 *
		 *  @param  inst     (object) The current settings instance.
		 *  @param  layout   (string) The custom layout string (e.g., "{hnn}:{mnn}:{snn}").
		 *  @param  compact  (boolean) True if compact labels should be used.
		 *  @return (string) The generated custom HTML.
		 */
		_buildLayout : function ( inst , layout , compact ) {
			var labels = this._get ( inst , ( compact ? 'compactLabels' : 'labels' ) ) ;

			// Helper function to get the appropriate label for a given period index.
			var labelFor = function ( index ) {
				// Try to get a specific label (e.g., 'labels1' for singular) first, then fallback to general labels.
				return ( $.countdown._get ( inst ,
					( compact ? 'compactLabels' : 'labels' ) + inst._periods [ index ] ) ||
					labels ) [ index ] ;
			} ;

			// Helper function to extract a specific digit from a number based on its position.
			var digit = function ( value , position ) {
				// E.g., digit(123, 10) gives 2 (tens place).
				return Math.floor ( value / position ) % 10 ;
			} ;

			// Object containing all available placeholders and their corresponding values.
			var subs = {
				desc : this._get ( inst , 'description' ) , // Description text.
				sep  : this._get ( inst , 'timeSeparator' ) , // Time separator.

				// Year placeholders:
				yl   : labelFor ( Y ) , // Year label.
				yn   : inst._periods [ Y ] , // Year value.
				ynn  : this._minDigits ( inst._periods [ Y ] , 2 ) , // Year padded to 2 digits.
				ynnn : this._minDigits ( inst._periods [ Y ] , 3 ) , // Year padded to 3 digits.
				y1   : digit ( inst._periods [ Y ] , 1 ) , // Units digit of year.
				y10  : digit ( inst._periods [ Y ] , 10 ) , // Tens digit of year.
				y100 : digit ( inst._periods [ Y ] , 100 ) , // Hundreds digit of year.

				// Month placeholders:
				ol   : labelFor ( O ) ,
				on   : inst._periods [ O ] ,
				onn  : this._minDigits ( inst._periods [ O ] , 2 ) ,
				onnn : this._minDigits ( inst._periods [ O ] , 3 ) ,
				o1   : digit ( inst._periods [ O ] , 1 ) ,
				o10  : digit ( inst._periods [ O ] , 10 ) ,
				o100 : digit ( inst._periods [ O ] , 100 ) ,

				// Week placeholders:
				wl   : labelFor ( W ) ,
				wn   : inst._periods [ W ] ,
				wnn  : this._minDigits ( inst._periods [ W ] , 2 ) ,
				wnnn : this._minDigits ( inst._periods [ W ] , 3 ) ,
				w1   : digit ( inst._periods [ W ] , 1 ) ,
				w10  : digit ( inst._periods [ W ] , 10 ) ,
				w100 : digit ( inst._periods [ W ] , 100 ) ,

				// Day placeholders:
				dl   : labelFor ( D ) ,
				dn   : inst._periods [ D ] ,
				dnn  : this._minDigits ( inst._periods [ D ] , 2 ) ,
				dnnn : this._minDigits ( inst._periods [ D ] , 3 ) ,
				d1   : digit ( inst._periods [ D ] , 1 ) ,
				d10  : digit ( inst._periods [ D ] , 10 ) ,
				d100 : digit ( inst._periods [ D ] , 100 ) ,

				// Hour placeholders:
				hl   : labelFor ( H ) ,
				hn   : inst._periods [ H ] ,
				hnn  : this._minDigits ( inst._periods [ H ] , 2 ) ,
				hnnn : this._minDigits ( inst._periods [ H ] , 3 ) ,
				h1   : digit ( inst._periods [ H ] , 1 ) ,
				h10  : digit ( inst._periods [ H ] , 10 ) ,
				h100 : digit ( inst._periods [ H ] , 100 ) ,

				// Minute placeholders:
				ml   : labelFor ( M ) ,
				mn   : inst._periods [ M ] ,
				mnn  : this._minDigits ( inst._periods [ M ] , 2 ) ,
				mnnn : this._minDigits ( inst._periods [ M ] , 3 ) ,
				m1   : digit ( inst._periods [ M ] , 1 ) ,
				m10  : digit ( inst._periods [ M ] , 10 ) ,
				m100 : digit ( inst._periods [ M ] , 100 ) ,

				// Second placeholders:
				sl   : labelFor ( S ) ,
				sn   : inst._periods [ S ] ,
				snn  : this._minDigits ( inst._periods [ S ] , 2 ) ,
				snnn : this._minDigits ( inst._periods [ S ] , 3 ) ,
				s1   : digit ( inst._periods [ S ] , 1 ) ,
				s10  : digit ( inst._periods [ S ] , 10 ) ,
				s100 : digit ( inst._periods [ S ] , 100 )
			} ;

			var html = layout ;

			// Replace period containers: {p<}...{p>}
			// These containers allow conditionally displaying content only if a period is shown.
			for ( var i = 0 ; i < 7 ; i++ ) {
				var period = 'yowdhms'.charAt ( i ) ; // Get the single-letter code for the period.
				// Create a regex to find placeholders like '{y<}...{y>}'.
				var re = new RegExp ( '\\{' + period + '<\\}(.*)\\{' + period + '>\\}' , 'g' ) ;
				// Replace the content if the period is shown, otherwise remove the content.
				html = html.replace ( re , ( inst._show [ i ] ? '$1' : '' ) ) ;
			}

			// Replace all placeholders in the layout string with their actual values.
			// This regex finds {key} and replaces it with subs[key].
			html = html.replace ( /\{([a-zA-Z0-9]+)\}/g , function ( match , key ) {
				return subs [ key ] || match ; // If key not found, keep the original placeholder.
			} ) ;
			return html ;
		} ,

		/**
		 *  Ensures a number is displayed with a minimum number of digits by padding with leading zeros.
		 *
		 *  @param  value   (number) The number to format.
		 *  @param  digits  (number) The minimum number of digits.
		 *  @return (string) The formatted number string.
		 */
		_minDigits : function ( value , digits ) {
			value = '' + value ; // Convert to string.
			if ( value.length >= digits ) {
				return value ;
			}
			// Pad with leading zeros.
			for ( var i = 0 ; i < digits - value.length ; i++ ) {
				value = '0' + value ;
			}
			return value ;
		} ,

		/**
		 *  Determines which time periods (years, months, weeks, etc.) should be displayed
		 *  based on the countdown's format string and current state.
		 *
		 *  @param  inst  (object) The current settings instance.
		 *  @return (boolean[] or string[]) An array indicating which periods to show (true/false)
		 *                                  or '?' for "show if non-zero".
		 */
		_determineShow : function ( inst ) {
			var format = this._get ( inst , 'format' ) ;
			var show = [ false , false , false , false , false , false , false ] ; // Default to not showing any periods.

			// Populate 'show' array based on the format string.
			// Uppercase means always show, lowercase means show if non-zero ('?').
			show [ Y ] = ( format.indexOf ( 'Y' ) > -1 ? true : ( format.indexOf ( 'y' ) > -1 ? '?' : false ) ) ;
			show [ O ] = ( format.indexOf ( 'O' ) > -1 ? true : ( format.indexOf ( 'o' ) > -1 ? '?' : false ) ) ;
			show [ W ] = ( format.indexOf ( 'W' ) > -1 ? true : ( format.indexOf ( 'w' ) > -1 ? '?' : false ) ) ;
			show [ D ] = ( format.indexOf ( 'D' ) > -1 ? true : ( format.indexOf ( 'd' ) > -1 ? '?' : false ) ) ;
			show [ H ] = ( format.indexOf ( 'H' ) > -1 ? true : ( format.indexOf ( 'h' ) > -1 ? '?' : false ) ) ;
			show [ M ] = ( format.indexOf ( 'M' ) > -1 ? true : ( format.indexOf ( 'm' ) > -1 ? '?' : false ) ) ;
			show [ S ] = ( format.indexOf ( 'S' ) > -1 ? true : ( format.indexOf ( 's' ) > -1 ? '?' : false ) ) ;

			return show ;
		} ,

		/**
		 *  Calculates the time breakdown into periods (years, months, etc.)
		 *  between a start and end date, considering which periods to display.
		 *
		 *  @param  inst     (object) The current settings instance.
		 *  @param  show     (boolean[] or string[]) Array indicating which periods to show.
		 *  @param  now      (Date) The current time.
		 *  @return (number[7]) An array of 7 numbers representing the calculated periods.
		 */
		_calculatePeriods : function ( inst , show , now ) {
			// Calculate the effective start and end times based on 'since' or 'until'.
			inst._now = now ;
			inst._since = inst._since || now ; // If no 'since', use now.
			inst._until = inst._until || now ; // If no 'until', use now.

			var diff = ( inst._until.getTime ( ) - inst._since.getTime ( ) ) / 1000 ; // Difference in seconds.

			// Determine if counting up or down.
			var neg = false ;
			if ( diff < 0 ) {
				diff = -diff ;
				neg = true ;
			}

			// Initialize periods array.
			var periods = [ 0 , 0 , 0 , 0 , 0 , 0 , 0 ] ;

			// If years are displayed, calculate years.
			if ( show [ Y ] ) {
				var years = Math.floor ( diff / ( 365.25 * 24 * 60 * 60 ) ) ; // Approximate years.
				if ( years > 0 ) {
					periods [ Y ] = years ;
					diff -= years * ( 365.25 * 24 * 60 * 60 ) ;
				}
			}

			// If months are displayed, calculate months.
			if ( show [ O ] ) {
				var months = Math.floor ( diff / ( 30.4375 * 24 * 60 * 60 ) ) ; // Approximate months.
				if ( months > 0 ) {
					periods [ O ] = months ;
					diff -= months * ( 30.4375 * 24 * 60 * 60 ) ;
				}
			}

			// If weeks are displayed, calculate weeks.
			if ( show [ W ] ) {
				var weeks = Math.floor ( diff / ( 7 * 24 * 60 * 60 ) ) ;
				if ( weeks > 0 ) {
					periods [ W ] = weeks ;
					diff -= weeks * ( 7 * 24 * 60 * 60 ) ;
				}
			}

			// If days are displayed, calculate days.
			if ( show [ D ] ) {
				var days = Math.floor ( diff / ( 24 * 60 * 60 ) ) ;
				if ( days > 0 ) {
					periods [ D ] = days ;
					diff -= days * ( 24 * 60 * 60 ) ;
				}
			}

			// If hours are displayed, calculate hours.
			if ( show [ H ] ) {
				var hours = Math.floor ( diff / ( 60 * 60 ) ) ;
				if ( hours > 0 ) {
					periods [ H ] = hours ;
					diff -= hours * ( 60 * 60 ) ;
				}
			}

			// If minutes are displayed, calculate minutes.
			if ( show [ M ] ) {
				var minutes = Math.floor ( diff / 60 ) ;
				if ( minutes > 0 ) {
					periods [ M ] = minutes ;
					diff -= minutes * 60 ;
				}
			}

			// If seconds are displayed, calculate seconds.
			if ( show [ S ] ) {
				periods [ S ] = Math.floor ( diff ) ;
			}

			// Apply negative sign if counting up past the target or down past zero.
			if ( neg ) {
				for ( var i = 0 ; i < 7 ; i++ ) {
					periods [ i ] = -periods [ i ] ;
				}
			}

			return periods ;
		}
	} ) ; // End of $.extend(Countdown.prototype, ...).


	// --- jQuery Plugin Integration ---

	// The `extendRemove` function is a utility to merge objects.
	// It's like `$.extend` but also removes properties that are explicitly set to `null` in the `options` object.
	function extendRemove ( target , options ) {
		$.extend ( target , options ) ;
		for ( var name in options ) {
			if ( options [ name ] == null ) {
				target [ name ] = null ;
			}
		}
		return target ;
	} ;


	// Expose the Countdown constructor to jQuery.
	// This makes it accessible as `$.countdown` and allows for global configuration.
	$.countdown = new Countdown ( ) ; // Create a singleton instance of Countdown.


	// Define the jQuery plugin method.
	$.fn.countdown = function ( options ) {
		// If options is a string, it's a method call (e.g., $(...).countdown('destroy')).
		var otherArgs = Array.prototype.slice.call ( arguments , 1 ) ;
		if ( typeof options == 'string' && options == 'isDisabled' ) {
			return $.countdown [ '_' + options + 'Countdown' ] .apply ( $.countdown , [ this [ 0 ] ] .concat ( otherArgs ) ) ;
		}

		// Apply the method to each selected element.
		return this.each ( function ( ) {
			// If options is a string, call the corresponding method on the countdown instance.
			if ( typeof options == 'string' ) {
				$.countdown [ '_' + options + 'Countdown' ] .apply ( $.countdown , [ this ] .concat ( otherArgs ) ) ;
			}
			// If options is an object or undefined, initialize or reconfigure the countdown.
			else {
				$.countdown [ '_attachCountdown' ] .apply ( $.countdown , [ this , options ] ) ;
			}
		} ) ;
	} ;


	// Add the `periods` method directly to the jQuery object for convenience.
	// This allows getting periods for an element like `$('#myCountdown').countdown('getTimes')`.
	$.fn.countdown.periods = function ( target ) {
		return $.countdown._getTimesCountdown ( target ) ;
	} ;

} ) ( jQuery ) ; // Pass jQuery into the IIFE.