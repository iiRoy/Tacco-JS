// This is the jQuery Timepicker Addon.
// Version: 1.4.3
// Date: 2013-11-30
// Project URL: http://trentrichardson.com/examples/timepicker
// Copyright (c) 2013 Trent Richardson; Licensed MIT

( function ( $ ) {


	/*
	 * Ensure the timepicker plugin is not redefined,
	 * preventing potential errors like "Maximum call stack size exceeded".
	 */
	$.ui.timepicker = $.ui.timepicker || {};


	// If a version already exists, we should exit to avoid re-initialization.
	if ( $.ui.timepicker.version ) {
		return;
	}


	/*
	 * Extend the jQuery UI namespace to include our timepicker,
	 * and set its version number.
	 */
	$.extend( $.ui, {
		timepicker: {
			version: "1.4.3" /* Current version of the timepicker addon. */
		}
	} );


	// The core Timepicker manager constructor function.
	// This class manages the settings and behavior of the time picker.
	var Timepicker = function ( ) {

		// Initialize regional settings. This array holds different language configurations.
		this.regional = [ ]; // An empty array to store regional settings.

		// Default regional settings (for an empty language code).
		this.regional[ '' ] = {
			currentText: 'Now',           // Label for the 'now' button.
			closeText: 'Done',            // Label for the 'done' button.
			amNames: [ 'AM', 'A' ],       // Array of AM names.
			pmNames: [ 'PM', 'P' ],       // Array of PM names.
			timeFormat: 'HH:mm',          // Default time format string.
			timeSuffix: '',               // Suffix appended to the time string.
			timeOnlyTitle: 'Choose Time', // Title for the time-only dialog.
			timeText: 'Time',             // Label for the time section.
			hourText: 'Hour',             // Label for the hour slider/input.
			minuteText: 'Minute',         // Label for the minute slider/input.
			secondText: 'Second',         // Label for the second slider/input.
			millisecText: 'Millisecond',  // Label for the millisecond slider/input.
			microsecText: 'Microsecond',  // Label for the microsecond slider/input.
			timezoneText: 'Time Zone',    // Label for the timezone selector.
			isRTL: false                  // Boolean indicating right-to-left language.
		};


		// Global default options for all timepicker instances.
		this._defaults = {
			showButtonPanel: true,      // Whether to show the button panel.
			timeOnly: false,            // If true, only time picker is shown.
			showHour: null,             // Whether to show the hour component.
			showMinute: null,           // Whether to show the minute component.
			showSecond: null,           // Whether to show the second component.
			showMillisec: null,         // Whether to show the millisecond component.
			showMicrosec: null,         // Whether to show the microsecond component.
			showTimezone: null,         // Whether to show the timezone component.
			showTime: true,             // Whether to show any time components at all.
			stepHour: 1,                // Step size for hour changes.
			stepMinute: 1,              // Step size for minute changes.
			stepSecond: 1,              // Step size for second changes.
			stepMillisec: 1,            // Step size for millisecond changes.
			stepMicrosec: 1,            // Step size for microsecond changes.
			hour: 0,                    // Initial hour value.
			minute: 0,                  // Initial minute value.
			second: 0,                  // Initial second value.
			millisec: 0,                // Initial millisecond value.
			microsec: 0,                // Initial microsecond value.
			timezone: null,             // Initial timezone value (offset from UTC in minutes).
			hourMin: 0,                 // Minimum hour value.
			minuteMin: 0,               // Minimum minute value.
			secondMin: 0,               // Minimum second value.
			millisecMin: 0,             // Minimum millisecond value.
			microsecMin: 0,             // Minimum microsecond value.
			hourMax: 23,                // Maximum hour value.
			minuteMax: 59,              // Maximum minute value.
			secondMax: 59,              // Maximum second value.
			millisecMax: 999,           // Maximum millisecond value.
			microsecMax: 999,           // Maximum microsecond value.
			minDateTime: null,          // Minimum selectable date and time.
			maxDateTime: null,          // Maximum selectable date and time.
			onSelect: null,             // Callback function triggered on selection.
			hourGrid: 0,                // Grid interval for hours (0 for no grid).
			minuteGrid: 0,              // Grid interval for minutes.
			secondGrid: 0,              // Grid interval for seconds.
			millisecGrid: 0,            // Grid interval for milliseconds.
			microsecGrid: 0,            // Grid interval for microseconds.
			alwaysSetTime: true,        // Always set the time, even if not explicitly chosen.
			separator: ' ',             // Separator between date and time strings.
			altFieldTimeOnly: true,     // If true, altField only gets time, otherwise it gets full datetime.
			altTimeFormat: null,        // Time format for the altField.
			altSeparator: null,         // Separator for the altField.
			altTimeSuffix: null,        // Suffix for the altField.
			pickerTimeFormat: null,     // Time format used in the picker UI.
			pickerTimeSuffix: null,     // Time suffix used in the picker UI.
			showTimepicker: true,       // Whether the timepicker UI should be displayed.
			timezoneList: null,         // Custom list of timezones.
			addSliderAccess: false,     // Whether to add slider access functionality.
			sliderAccessArgs: null,     // Arguments for slider access.
			controlType: 'slider',      // Type of control used for time components ('slider' or 'select').
			defaultValue: null,         // Default date/time value.
			parse: 'strict'             // Parsing mode for date/time strings.
		};


		// Merge the default regional settings into the global defaults.
		$.extend( this._defaults, this.regional[ '' ] );
	};


	// Extend the Timepicker prototype with various properties and methods.
	$.extend( Timepicker.prototype, {
		$input: null,              // The jQuery object representing the primary input field.
		$altInput: null,           // The jQuery object representing the alternate input field.
		$timeObj: null,            // The jQuery object for the timepicker UI element itself.
		inst: null,                // The datepicker instance associated with this timepicker.
		hour_slider: null,         // Reference to the hour slider control.
		minute_slider: null,       // Reference to the minute slider control.
		second_slider: null,       // Reference to the second slider control.
		millisec_slider: null,     // Reference to the millisecond slider control.
		microsec_slider: null,     // Reference to the microsecond slider control.
		timezone_select: null,     // Reference to the timezone select dropdown.
		hour: 0,                   // Current hour value.
		minute: 0,                 // Current minute value.
		second: 0,                 // Current second value.
		millisec: 0,               // Current millisecond value.
		microsec: 0,               // Current microsecond value.
		timezone: null,            // Current timezone offset.
		hourMinOriginal: null,     // Original minimum hour (before dynamic adjustments).
		minuteMinOriginal: null,   // Original minimum minute.
		secondMinOriginal: null,   // Original minimum second.
		millisecMinOriginal: null, // Original minimum millisecond.
		microsecMinOriginal: null, // Original minimum microsecond.
		hourMaxOriginal: null,     // Original maximum hour.
		minuteMaxOriginal: null,   // Original maximum minute.
		secondMaxOriginal: null,   // Original maximum second.
		millisecMaxOriginal: null, // Original maximum millisecond.
		microsecMaxOriginal: null, // Original maximum microsecond.
		ampm: '',                  // AM/PM string.
		formattedDate: '',         // Formatted date string.
		formattedTime: '',         // Formatted time string.
		formattedDateTime: '',     // Formatted date and time string.
		timezoneList: null,        // List of timezone options.
		units: [ 'hour', 'minute', 'second', 'millisec', 'microsec' ], // Array of time units.
		support: { },              // Object to store supported time format components.
		control: null,             // The control object (slider or select) for time components.


		/**
		 * Overrides the default settings for all instances of the time picker.
		 *
		 * @param  {Object} settings An object containing new default settings.
		 * @return {Object} The timepicker manager object (this).
		 */
		setDefaults: function ( settings ) {
			// Merge provided settings into the internal _defaults object.
			extendRemove( this._defaults, settings || { } );
			return this;
		},


		/**
		 * Creates a new Timepicker instance for a given input field.
		 *
		 * @param  {jQuery} $input The jQuery object for the input field.
		 * @param  {Object} opts   Options specific to this instance.
		 * @return {Object} The newly created Timepicker instance.
		 */
		_newInst: function ( $input, opts ) {

			var tp_inst = new Timepicker(), // Create a new Timepicker object.
				inlineSettings = { },       // Object to hold settings from data attributes.
				fns = { },                  // Object to store event functions.
				overrides,                  // Placeholder for datepicker event overrides.
				i;                          // Loop counter.


			// Iterate through default settings to check for inline data attributes.
			for ( var attrName in this._defaults ) {

				if ( this._defaults.hasOwnProperty( attrName ) ) {
					var attrValue = $input.attr( 'time:' + attrName );

					if ( attrValue ) {
						try {
							// Attempt to evaluate the attribute value (e.g., for boolean/number types).
							inlineSettings[ attrName ] = eval( attrValue );
						} catch ( err ) {
							// If evaluation fails, treat it as a string.
							inlineSettings[ attrName ] = attrValue;
						}
					}
				}
			}


			// Define overrides for standard datepicker events.
			overrides = {
				beforeShow: function ( input, dp_inst ) {
					// Call the original beforeShow if it exists.
					if ( $.isFunction( tp_inst._defaults.evnts.beforeShow ) ) {
						return tp_inst._defaults.evnts.beforeShow.call( $input[ 0 ], input, dp_inst, tp_inst );
					}
				},
				onChangeMonthYear: function ( year, month, dp_inst ) {
					// Update the time when month/year changes to keep it in sync.
					tp_inst._updateDateTime( dp_inst );
					// Call the original onChangeMonthYear if it exists.
					if ( $.isFunction( tp_inst._defaults.evnts.onChangeMonthYear ) ) {
						tp_inst._defaults.evnts.onChangeMonthYear.call( $input[ 0 ], year, month, dp_inst, tp_inst );
					}
				},
				onClose: function ( dateText, dp_inst ) {
					// If time was defined and input is not empty, update date/time.
					if ( tp_inst.timeDefined === true && $input.val( ) !== '' ) {
						tp_inst._updateDateTime( dp_inst );
					}
					// Call the original onClose if it exists.
					if ( $.isFunction( tp_inst._defaults.evnts.onClose ) ) {
						tp_inst._defaults.evnts.onClose.call( $input[ 0 ], dateText, dp_inst, tp_inst );
					}
				}
			};


			// Store the original event functions from the opts.
			for ( i in overrides ) {
				if ( overrides.hasOwnProperty( i ) ) {
					fns[ i ] = opts[ i ] || null;
				}
			}


			// Merge all settings: global defaults, inline settings, instance options, and event overrides.
			tp_inst._defaults = $.extend( { }, this._defaults, inlineSettings, opts, overrides, {
				evnts: fns,           // Store original event handlers.
				timepicker: tp_inst   // Add a reference to the timepicker instance itself.
			} );


			// Convert AM/PM names to uppercase for consistent comparison.
			tp_inst.amNames = $.map( tp_inst._defaults.amNames, function ( val ) {
				return val.toUpperCase( );
			} );
			tp_inst.pmNames = $.map( tp_inst._defaults.pmNames, function ( val ) {
				return val.toUpperCase( );
			} );


			// Detect which time units (hour, minute, etc.) are supported based on the time format string.
			tp_inst.support = detectSupport(
				tp_inst._defaults.timeFormat +
				( tp_inst._defaults.pickerTimeFormat ? tp_inst._defaults.pickerTimeFormat : '' ) +
				( tp_inst._defaults.altTimeFormat ? tp_inst._defaults.altTimeFormat : '' )
			);


			// Determine the control type (slider or select).
			if ( typeof ( tp_inst._defaults.controlType ) === 'string' ) {
				// If slider is chosen but jQuery UI Slider is not available, fallback to 'select'.
				if ( tp_inst._defaults.controlType === 'slider' && typeof ( $.ui.slider ) === 'undefined' ) {
					tp_inst._defaults.controlType = 'select';
				}
				// Assign the control implementation from the internal _controls map.
				tp_inst.control = tp_inst._controls[ tp_inst._defaults.controlType ];
			}
			// If controlType is an object, it must directly implement the control methods.
			else {
				tp_inst.control = tp_inst._defaults.controlType;
			}


			// Prepare the timezone options list.
			var timezoneList = [ -720, -660, -600, -570, -540, -480, -420, -360, -300, -270, -240, -210, -180, -120, -60,
				0, 60, 120, 180, 210, 240, 270, 300, 330, 345, 360, 390, 420, 480, 525, 540, 570, 600, 630, 660, 690, 720, 765, 780, 840 ];
			// Use custom timezone list if provided.
			if ( tp_inst._defaults.timezoneList !== null ) {
				timezoneList = tp_inst._defaults.timezoneList;
			}
			var tzl = timezoneList.length, // Total number of timezones.
				tzi = 0,                   // Loop index for timezones.
				tzv = null;                // Current timezone value.


			// Format timezone labels if they are just raw offset numbers.
			if ( tzl > 0 && typeof timezoneList[ 0 ] !== 'object' ) {
				for ( ; tzi < tzl; tzi++ ) {
					tzv = timezoneList[ tzi ];
					timezoneList[ tzi ] = { value: tzv, label: $.timepicker.timezoneOffsetString( tzv, tp_inst.support.iso8601 ) };
				}
			}
			tp_inst._defaults.timezoneList = timezoneList; // Update the defaults with formatted list.


			// Set initial time units based on defaults, respecting min/max constraints.
			tp_inst.timezone = tp_inst._defaults.timezone !== null ? $.timepicker.timezoneOffsetNumber( tp_inst._defaults.timezone ) :
				( ( new Date( ) ).getTimezoneOffset( ) * -1 );
			tp_inst.hour = tp_inst._defaults.hour < tp_inst._defaults.hourMin ? tp_inst._defaults.hourMin :
				tp_inst._defaults.hour > tp_inst._defaults.hourMax ? tp_inst._defaults.hourMax : tp_inst._defaults.hour;
			tp_inst.minute = tp_inst._defaults.minute < tp_inst._defaults.minuteMin ? tp_inst._defaults.minuteMin :
				tp_inst._defaults.minute > tp_inst._defaults.minuteMax ? tp_inst._defaults.minuteMax : tp_inst._defaults.minute;
			tp_inst.second = tp_inst._defaults.second < tp_inst._defaults.secondMin ? tp_inst._defaults.secondMin :
				tp_inst._defaults.second > tp_inst._defaults.secondMax ? tp_inst._defaults.secondMax : tp_inst._defaults.second;
			tp_inst.millisec = tp_inst._defaults.millisec < tp_inst._defaults.millisecMin ? tp_inst._defaults.millisecMin :
				tp_inst._defaults.millisec > tp_inst._defaults.millisecMax ? tp_inst._defaults.millisecMax : tp_inst._defaults.millisec;
			tp_inst.microsec = tp_inst._defaults.microsec < tp_inst._defaults.microsecMin ? tp_inst._defaults.microsecMin :
				tp_inst._defaults.microsec > tp_inst._defaults.microsecMax ? tp_inst._defaults.microsecMax : tp_inst._defaults.microsec;
			tp_inst.ampm = ''; // Initialize AM/PM state.
			tp_inst.$input = $input; // Store the primary input element.


			// If an alternate field is specified, set it up.
			if ( tp_inst._defaults.altField ) {
				tp_inst.$altInput = $( tp_inst._defaults.altField ).css( {
					cursor: 'pointer' // Make the alt field look clickable.
				} ).focus( function ( ) {
					$input.trigger( "focus" ); // When alt field gets focus, transfer to main input.
				} );
			}


			// Handle minDate/maxDate set to 0 (meaning "today").
			if ( tp_inst._defaults.minDate === 0 || tp_inst._defaults.minDateTime === 0 ) {
				tp_inst._defaults.minDate = new Date( );
			}
			if ( tp_inst._defaults.maxDate === 0 || tp_inst._defaults.maxDateTime === 0 ) {
				tp_inst._defaults.maxDate = new Date( );
			}


			// Synchronize minDate/maxDate with minDateTime/maxDateTime, as datepicker uses one and timepicker the other.
			if ( tp_inst._defaults.minDate !== undefined && tp_inst._defaults.minDate instanceof Date ) {
				tp_inst._defaults.minDateTime = new Date( tp_inst._defaults.minDate.getTime( ) );
			}
			if ( tp_inst._defaults.minDateTime !== undefined && tp_inst._defaults.minDateTime instanceof Date ) {
				tp_inst._defaults.minDate = new Date( tp_inst._defaults.minDateTime.getTime( ) );
			}
			if ( tp_inst._defaults.maxDate !== undefined && tp_inst._defaults.maxDate instanceof Date ) {
				tp_inst._defaults.maxDateTime = new Date( tp_inst._defaults.maxDate.getTime( ) );
			}
			if ( tp_inst._defaults.maxDateTime !== undefined && tp_inst._defaults.maxDateTime instanceof Date ) {
				tp_inst._defaults.maxDate = new Date( tp_inst._defaults.maxDateTime.getTime( ) );
			}


			// Bind the focus event to the input field to trigger timepicker functionality.
			tp_inst.$input.bind( 'focus', function ( ) {
				tp_inst._onFocus( );
			} );


			return tp_inst; // Return the newly created instance.
		},


		/**
		 * Adds the timepicker sliders and UI elements to the datepicker calendar.
		 * This method is typically called when the datepicker is initialized or shown.
		 *
		 * @param {Object} dp_inst The datepicker instance.
		 */
		_addTimePicker: function ( dp_inst ) {

			// Determine the current date/time string from the input fields.
			// If an altField is used for time-only, combine its value with the main input.
			var currDT = ( this.$altInput && this._defaults.altFieldTimeOnly )
				? this.$input.val( ) + ' ' + this.$altInput.val( )
				: this.$input.val( );

			// Parse the time string to populate the timepicker's internal values.
			this.timeDefined = this._parseTime( currDT );
			// Adjust min/max date/time constraints after parsing.
			this._limitMinMaxDateTime( dp_inst, false );
			// Inject the timepicker HTML into the datepicker UI.
			this._injectTimePicker( );
		},


		/**
		 * Parses a time string and updates the timepicker instance's time components.
		 *
		 * @param  {string}  timeString The time string to parse.
		 * @param  {boolean} withDate   If true, parse as a full date/time string; otherwise, time-only.
		 * @return {boolean} True if parsing was successful, false otherwise.
		 */
		_parseTime: function ( timeString, withDate ) {

			// Ensure the datepicker instance is available.
			if ( !this.inst ) {
				this.inst = $.datepicker._getInst( this.$input[ 0 ] );
			}

			// Handle parsing based on whether a date is included or if it's time-only.
			if ( withDate || !this._defaults.timeOnly ) {

				var dp_dateFormat = $.datepicker._get( this.inst, 'dateFormat' ); // Get date format from datepicker.
				try {
					// Attempt to parse the full date and time string.
					var parseRes = parseDateTimeInternal( dp_dateFormat, this._defaults.timeFormat, timeString, $.datepicker._getFormatConfig( this.inst ), this._defaults );

					// If no time object was successfully parsed, return false.
					if ( !parseRes.timeObj ) {
						return false;
					}
					// Extend the current timepicker instance with the parsed time components.
					$.extend( this, parseRes.timeObj );
				} catch ( err ) {
					// Log any errors encountered during parsing.
					$.timepicker.log( "Error parsing the date/time string: " + err +
						"\ndate/time string = " + timeString +
						"\ntimeFormat = " + this._defaults.timeFormat +
						"\ndateFormat = " + dp_dateFormat );
					return false;
				}
				return true; // Parsing successful.

			} else {
				// If time-only, use datepicker's parseTime utility.
				var timeObj = $.datepicker.parseTime( this._defaults.timeFormat, timeString, this._defaults );

				if ( !timeObj ) {
					return false; // Time-only parsing failed.
				}
				$.extend( this, timeObj ); // Update instance with parsed time.
				return true; // Time-only parsing successful.
			}
		},


		/**
		 * Generates and injects the HTML for the timepicker UI into the jQuery UI datepicker.
		 */
		_injectTimePicker: function ( ) {

			var $dp = this.inst.dpDiv,           // The datepicker's main div element.
				o = this.inst.settings,          // Current datepicker settings.
				tp_inst = this,                  // Reference to the current timepicker instance.
				litem = '',                      // Lowercase name of the current time unit (e.g., 'hour').
				uitem = '',                      // Uppercase first letter name of the current time unit (e.g., 'Hour').
				show = null,                     // Boolean indicating if a time unit should be shown.
				max = { },                       // Object to store calculated max values for each unit.
				gridSize = { },                  // Object to store grid sizes for each unit.
				size = null,                     // Placeholder for calculated CSS size.
				i = 0,                           // Loop counter.
				l = 0;                           // Loop limit.


			// Prevent the timepicker from being injected multiple times.
			if ( $dp.find( "div.ui-timepicker-div" ).length === 0 && o.showTimepicker ) {

				var noDisplay = ' style="display:none;"', // Inline style to hide elements.
					html = '<div class="ui-timepicker-div' + ( o.isRTL ? ' ui-timepicker-rtl' : '' ) + '"><dl>' +
						'<dt class="ui_tpicker_time_label"' + ( ( o.showTime ) ? '' : noDisplay ) + '>' + o.timeText + '</dt>' +
						'<dd class="ui_tpicker_time"' + ( ( o.showTime ) ? '' : noDisplay ) + '></dd>';

				// Loop through each time unit (hour, minute, second, etc.) to build the markup.
				for ( i = 0, l = this.units.length; i < l; i++ ) {

					litem = this.units[ i ];                                         // e.g., 'hour'
					uitem = litem.substr( 0, 1 ).toUpperCase( ) + litem.substr( 1 ); // e.g., 'Hour'
					show = o[ 'show' + uitem ] !== null ? o[ 'show' + uitem ] : this.support[ litem ]; // Determine if unit should be shown.


					// Calculate the maximum value for the slider/select based on step values.
					// This ensures the max value is a multiple of the step, preventing off-by-one issues.
					max[ litem ] = parseInt( ( o[ litem + 'Max' ] - ( ( o[ litem + 'Max' ] - o[ litem + 'Min' ] ) % o[ 'step' + uitem ] ) ), 10 );
					gridSize[ litem ] = 0; // Initialize grid size counter for this unit.


					// Add the label and slider container for the current time unit.
					html += '<dt class="ui_tpicker_' + litem + '_label"' + ( show ? '' : noDisplay ) + '>' + o[ litem + 'Text' ] + '</dt>' +
						'<dd class="ui_tpicker_' + litem + '"><div class="ui_tpicker_' + litem + '_slider"' + ( show ? '' : noDisplay ) + '></div>';


					// If a grid is configured for this unit, generate the grid table.
					if ( show && o[ litem + 'Grid' ] > 0 ) {
						html += '<div style="padding-left: 1px"><table class="ui-tpicker-grid-label"><tr>';

						// Generate grid cells for hours (with AM/PM formatting if applicable).
						if ( litem === 'hour' ) {
							for ( var h = o[ litem + 'Min' ]; h <= max[ litem ]; h += parseInt( o[ litem + 'Grid' ], 10 ) ) {
								gridSize[ litem ]++;
								var tmph = $.datepicker.formatTime( this.support.ampm ? 'hht' : 'HH', { hour: h }, o );
								html += '<td data-for="' + litem + '">' + tmph + '</td>';
							}
						}
						// Generate grid cells for other units (minutes, seconds, etc.).
						else {
							for ( var m = o[ litem + 'Min' ]; m <= max[ litem ]; m += parseInt( o[ litem + 'Grid' ], 10 ) ) {
								gridSize[ litem ]++;
								html += '<td data-for="' + litem + '">' + ( ( m < 10 ) ? '0' : '' ) + m + '</td>';
							}
						}

						html += '</tr></table></div>';
					}
					html += '</dd>'; // Close the dd tag for the current time unit.
				}


				// Timezone section: label and dropdown.
				var showTz = o.showTimezone !== null ? o.showTimezone : this.support.timezone;
				html += '<dt class="ui_tpicker_timezone_label"' + ( showTz ? '' : noDisplay ) + '>' + o.timezoneText + '</dt>';
				html += '<dd class="ui_tpicker_timezone" ' + ( showTz ? '' : noDisplay ) + '></dd>';

				// Close the main timepicker div and dl tags.
				html += '</dl></div>';
				var $tp = $( html ); // Create jQuery object from the generated HTML.


				// If timeOnly option is true, hide datepicker elements and add a header.
				if ( o.timeOnly === true ) {
					$tp.prepend( '<div class="ui-widget-header ui-helper-clearfix ui-corner-all">' +
						'<div class="ui-datepicker-title">' + o.timeOnlyTitle + '</div>' +
						'</div>' );
					$dp.find( '.ui-datepicker-header, .ui-datepicker-calendar' ).hide( );
				}


				// Initialize sliders, adjust grid styles, and attach events for each time unit.
				for ( i = 0, l = tp_inst.units.length; i < l; i++ ) {

					litem = tp_inst.units[ i ];
					uitem = litem.substr( 0, 1 ).toUpperCase( ) + litem.substr( 1 );
					show = o[ 'show' + uitem ] !== null ? o[ 'show' + uitem ] : this.support[ litem ];

					// Create the slider control for the current unit.
					tp_inst[ litem + '_slider' ] = tp_inst.control.create( tp_inst, $tp.find( '.ui_tpicker_' + litem + '_slider' ), litem, tp_inst[ litem ], o[ litem + 'Min' ], max[ litem ], o[ 'step' + uitem ] );


					// If grid is enabled for this unit, adjust its styling and add click events.
					if ( show && o[ litem + 'Grid' ] > 0 ) {

						size = 100 * gridSize[ litem ] * o[ litem + 'Grid' ] / ( max[ litem ] - o[ litem + 'Min' ] );
						$tp.find( '.ui_tpicker_' + litem + ' table' ).css( {
							width: size + "%",
							marginLeft: o.isRTL ? '0' : ( ( size / ( -2 * gridSize[ litem ] ) ) + "%" ),
							marginRight: o.isRTL ? ( ( size / ( -2 * gridSize[ litem ] ) ) + "%" ) : '0',
							borderCollapse: 'collapse'
						} ).find( "td" ).click( function ( e ) {
							var $t = $( this ),
								h = $t.html( ),
								n = parseInt( h.replace( /[^0-9]/g ), 10 ), // Parse number from cell text.
								ap = h.replace( /[^apm]/ig ),             // Extract AM/PM part.
								f = $t.data( 'for' );                     // Get the unit name (hour, minute, etc.).

							// Adjust hour for AM/PM if necessary.
							if ( f === 'hour' ) {
								if ( ap.indexOf( 'p' ) !== -1 && n < 12 ) {
									n += 12; // Convert PM hours to 24-hour format.
								} else {
									if ( ap.indexOf( 'a' ) !== -1 && n === 12 ) {
										n = 0; // Convert 12 AM to 0 (midnight).
									}
								}
							}

							// Set the value of the corresponding slider/control.
							tp_inst.control.value( tp_inst, tp_inst[ f + '_slider' ], litem, n );

							tp_inst._onTimeChange( );     // Update time display.
							tp_inst._onSelectHandler( );  // Trigger select handler.
						} ).css( {
							cursor: 'pointer',
							width: ( 100 / gridSize[ litem ] ) + '%',
							textAlign: 'center',
							overflow: 'hidden'
						} );
					} // end if grid > 0
				} // end for loop for units


				// Add timezone options to the dropdown.
				this.timezone_select = $tp.find( '.ui_tpicker_timezone' ).append( '<select></select>' ).find( "select" );
				$.fn.append.apply( this.timezone_select,
					$.map( o.timezoneList, function ( val, idx ) {
						return $( "<option />" ).val( typeof val === "object" ? val.value : val ).text( typeof val === "object" ? val.label : val );
					} ) );

				// Set the initial value of the timezone select.
				if ( typeof ( this.timezone ) !== "undefined" && this.timezone !== null && this.timezone !== "" ) {
					var local_timezone = ( new Date( this.inst.selectedYear, this.inst.selectedMonth, this.inst.selectedDay, 12 ) ).getTimezoneOffset( ) * -1;
					if ( local_timezone === this.timezone ) {
						selectLocalTimezone( tp_inst );
					} else {
						this.timezone_select.val( this.timezone );
					}
				} else {
					if ( typeof ( this.hour ) !== "undefined" && this.hour !== null && this.hour !== "" ) {
						this.timezone_select.val( o.timezone );
					} else {
						selectLocalTimezone( tp_inst );
					}
				}

				// Attach change event handler to the timezone select.
				this.timezone_select.change( function ( ) {
					tp_inst._onTimeChange( );
					tp_inst._onSelectHandler( );
				} );
				// End timezone options setup.


				// Inject the timepicker HTML into the datepicker's button panel or directly to the div.
				var $buttonPanel = $dp.find( '.ui-datepicker-buttonpane' );
				if ( $buttonPanel.length ) {
					$buttonPanel.before( $tp ); // Insert before the button panel if it exists.
				} else {
					$dp.append( $tp ); // Otherwise, append directly to the datepicker div.
				}

				// Store a reference to the actual time display object.
				this.$timeObj = $tp.find( '.ui_tpicker_time' );

				// If datepicker instance exists, proceed with further initialization.
				if ( this.inst !== null ) {