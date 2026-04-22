/*
 * Date Range Picker Widget for jQuery UI
 * Copyright (C) 2015 Tamble, Inc. All rights reserved.
 * Distributed under the MIT License (see https://github.com/tamble/jquery-ui-daterangepicker/raw/master/LICENSE.txt for details).
 *
 * This widget relies on:
 *    - jQuery (version 1.8.3 or newer)
 *    - jQuery UI (version 1.9.0 or newer, specifically widget factory, position, button, menu, and datepicker modules)
 *    - moment.js (version 2.3.0 or newer)
 */

( function ( $, window, undefined ) {

	var uniqueId = 0 ; /* Global counter to ensure unique IDs across multiple plugin instances */

	$.widget ( 'comiseo.daterangepicker' , {

		version : '0.4.0' ,

		options : {
			/*
			 * presetRanges: An array of objects. Each object defines an entry in the presets menu.
			 * Each entry must contain:
			 *   - 'text': A string representing the display text for the preset.
			 *   - 'dateStart': A function that returns a moment.js object for the start date.
			 *   - 'dateEnd': A function that returns a moment.js object for the end date.
			 */
			presetRanges : [
				{ text : 'Today' , dateStart : function ( ) { return moment ( ) } , dateEnd : function ( ) { return moment ( ) } } ,
				{ text : 'Yesterday' , dateStart : function ( ) { return moment ( ) . subtract ( 'days' , 1 ) } , dateEnd : function ( ) { return moment ( ) . subtract ( 'days' , 1 ) } } ,
				{ text : 'Last 7 Days' , dateStart : function ( ) { return moment ( ) . subtract ( 'days' , 6 ) } , dateEnd : function ( ) { return moment ( ) } } ,
				{ text : 'Last Week (Mo-Su)' , dateStart : function ( ) { return moment ( ) . subtract ( 'days' , 7 ) . isoWeekday ( 1 ) } , dateEnd : function ( ) { return moment ( ) . subtract ( 'days' , 7 ) . isoWeekday ( 7 ) } } ,
				{ text : 'Month to Date' , dateStart : function ( ) { return moment ( ) . startOf ( 'month' ) } , dateEnd : function ( ) { return moment ( ) } } ,
				{ text : 'Previous Month' , dateStart : function ( ) { return moment ( ) . subtract ( 'month' , 1 ) . startOf ( 'month' ) } , dateEnd : function ( ) { return moment ( ) . subtract ( 'month' , 1 ) . endOf ( 'month' ) } } ,
				{ text : 'Year to Date' , dateStart : function ( ) { return moment ( ) . startOf ( 'year' ) } , dateEnd : function ( ) { return moment ( ) } }
			] ,

			verticalOffset : 0 , // Vertical pixel offset for the dropdown position
			initialText : 'Select date range...' , // Default placeholder text when no range is selected
			icon : 'ui-icon-triangle-1-s' , // jQuery UI icon class for the trigger button
			applyButtonText : 'Apply' ,
			clearButtonText : 'Clear' ,
			cancelButtonText : 'Cancel' ,
			rangeSplitter : ' - ' , // String separator between start and end dates in the display text
			dateFormat : 'M d, yy' , // Format for displayed dates. See http://api.jqueryui.com/datepicker/#utility-formatDate
			altFormat : 'yy-mm-dd' , // Format for submitted dates (JSON).
			mirrorOnCollision : true , // Reverse layout when space is limited on the right side
			applyOnMenuSelect : true , // Automatically apply selected preset range
			autoFitCalendars : true , // Adjust numberOfMonths dynamically to fit widget width
			onOpen : null , // Callback function invoked when the date range picker opens
			onClose : null , // Callback function invoked when the date range picker closes
			onChange : null , // Callback function invoked when the selected date range changes
			datepickerOptions : { // Additional options for the jQuery UI Datepicker. Refer to http://api.jqueryui.com/datepicker/#options
				numberOfMonths : 3 ,
				// showCurrentAtPos: 1 /* This option has a bug, using maxDate instead */
				maxDate : 0 // The maximum selectable date is today; current month is displayed at the last position
			}
		} ,

		_create : function ( ) {
			this . _dateRangePicker = buildDateRangePicker ( this . element , this . options ) ;
		} ,

		_destroy : function ( ) {
			this . _dateRangePicker . destroy ( ) ;
		} ,

		open : function ( ) {
			this . _dateRangePicker . open ( ) ;
		} ,

		close : function ( ) {
			this . _dateRangePicker . close ( ) ;
		} ,

		setRange : function ( range ) {
			this . _dateRangePicker . setRange ( range ) ;
		} ,

		getRange : function ( ) {
			return this . _dateRangePicker . getRange ( ) ;
		} ,

		clearRange : function ( ) {
			this . _dateRangePicker . clearRange ( ) ;
		} ,

		widget : function ( ) {
			return this . _dateRangePicker . getContainer ( ) ;
		}
	} ) ;

	// Factory function for creating the trigger button.
	// This button visually replaces the original input form element.
	// @param {jQuery} $originalElement - The jQuery object of the input form element.
	// @param {String} classnameContext - The base class name for the parent container.
	// @param {Object} options - Configuration options for the widget.
	function buildTriggerButton ( $originalElement , classnameContext , options ) {
		var $self ,
			id ;

		// Ensures correct label association by updating 'for' attribute
		function fixReferences ( ) {
			id = 'drp_autogen' + uniqueId ++ ;
			$ ( 'label[for="' + $originalElement . attr ( 'id' ) + '"]' )
				. attr ( 'for' , id ) ;
		}

		// Initializes the trigger button
		function init ( ) {
			fixReferences ( ) ;
			$self = $ ( '<button type="button"></button>' )
				. addClass ( classnameContext + '-triggerbutton' )
				. attr ( { 'title' : $originalElement . attr ( 'title' ) , 'tabindex' : $originalElement . attr ( 'tabindex' ) , id : id } )
				. button ( {
					icons : {
						secondary : options . icon
					} ,
					label : options . initialText
				} ) ;
		}

		// Retrieves the current label text of the button
		function getLabel ( ) {
			return $self . button ( 'option' , 'label' ) ;
		}

		// Sets the label text of the button
		function setLabel ( value ) {
			$self . button ( 'option' , 'label' , value ) ;
		}

		// Resets the button and original element to initial state
		function reset ( ) {
			$originalElement . val ( '' ) . change ( ) ;
			setLabel ( options . initialText ) ;
		}

		init ( ) ; // Perform initialization
		return {
			getElement : function ( ) { return $self ; } ,
			getLabel : getLabel ,
			setLabel : setLabel ,
			reset : reset
		} ;
	}

	// Factory function for the presets menu, which contains predefined date ranges.
	// @param {String} classnameContext - The base class name for the parent container.
	// @param {Object} options - Configuration options.
	// @param {Function} onClick - Callback function to execute when a preset is clicked.
	function buildPresetsMenu ( classnameContext , options , onClick ) {
		var $self ,
			$menu ;

		// Initializes the presets menu structure
		function init ( ) {
			$self = $ ( '<div></div>' )
				. addClass ( classnameContext + '-presets' ) ;

			$menu = $ ( '<ul></ul>' ) ;

			$ . each ( options . presetRanges , function ( ) {
				$ ( '<li><a href="#">' + this . text + '</a></li>' )
					. data ( 'dateStart' , this . dateStart )
					. data ( 'dateEnd' , this . dateEnd )
					. click ( onClick )
					. appendTo ( $menu ) ;
			} ) ;

			$self . append ( $menu ) ;

			$menu . menu ( )
				. data ( 'ui-menu' ) . delay = 0 ; // Disable submenu delays for better UX
		}

		init ( ) ; // Execute initialization
		return {
			getElement : function ( ) { return $self ; }
		} ;
	}

	// Factory function for the multiple-month date picker component.
	// @param {String} classnameContext - The base class name for the parent container.
	// @param {Object} options - Configuration options.
	function buildCalendar ( classnameContext , options ) {
		var $self ,
			range = { start : null , end : null } ; // Stores the currently selected date range

		// Sets up the datepicker
		function init ( ) {
			$self = $ ( '<div></div>' , { 'class' : classnameContext + '-calendar ui-widget-content' } ) ;

			$self . datepicker ( $ . extend ( { } , options . datepickerOptions , { beforeShowDay : beforeShowDay , onSelect : onSelectDay } ) ) ;
			updateAtMidnight ( ) ; // Schedule refresh at midnight
		}

		// Callback executed when a day is selected in the datepicker.
		function onSelectDay ( dateText , instance ) {
			var dateFormat = options . datepickerOptions . dateFormat || $ . datepicker . _defaults . dateFormat ,
				selectedDate = $ . datepicker . parseDate ( dateFormat , dateText ) ;

			if ( ! range . start || range . end ) { // If start date is not set, or both dates are already set
				range . start = selectedDate ;
				range . end = null ;
			} else if ( selectedDate < range . start ) { // If start date is set, but selected date is earlier
				range . end = range . start ;
				range . start = selectedDate ;
			} else { // Selected date is after or equal to start date
				range . end = selectedDate ;
			}
			if ( options . datepickerOptions . hasOwnProperty ( 'onSelect' ) ) {
				options . datepickerOptions . onSelect ( dateText , instance ) ;
			}
		}

		// Callback executed for each day before it is displayed in the datepicker.
		// Used to highlight the selected range.
		function beforeShowDay ( date ) {
			var result = [
					true , // Day is selectable
					range . start && ( ( + date === + range . start ) || ( range . end && range . start <= date && date <= range . end ) ) ? 'ui-state-highlight' : '' // Add highlight class if within range
				] ,
				userResult = [ true , '' ] ;

			if ( options . datepickerOptions . hasOwnProperty ( 'beforeShowDay' ) ) {
				userResult = options . datepickerOptions . beforeShowDay ( date ) ;
			}
			return [
					result [ 0 ] && userResult [ 0 ] ,
					result [ 1 ] + ' ' + userResult [ 1 ]
					] ;
		}

		// Schedules a refresh of the calendar at the start of the next day.
		function updateAtMidnight ( ) {
			setTimeout ( function ( ) {
				refresh ( ) ;
				updateAtMidnight ( ) ;
			} , moment ( ) . endOf ( 'day' ) - moment ( ) ) ;
		}

		// Scrolls the datepicker view to the start of the current range.
		function scrollToRangeStart ( ) {
			if ( range . start ) {
				$self . datepicker ( 'setDate' , range . start ) ;
			}
		}

		// Refreshes the datepicker.
		function refresh ( ) {
			$self . datepicker ( 'refresh' ) ;
			$self . datepicker ( 'setDate' , null ) ; // Clear any single selected date highlight
		}

		// Resets the selected range and refreshes the calendar.
		function reset ( ) {
			range = { start : null , end : null } ;
			refresh ( ) ;
		}

		init ( ) ; // Initialize the calendar
		return {
			getElement : function ( ) { return $self ; } ,
			scrollToRangeStart : function ( ) { return scrollToRangeStart ( ) ; } ,
			getRange : function ( ) { return range ; } ,
			setRange : function ( value ) { range = value ; refresh ( ) ; } ,
			refresh : refresh ,
			reset : reset
		} ;
	}

	// Factory function for the button panel, containing Apply, Clear, and Cancel buttons.
	// @param {String} classnameContext - The base class name for the parent container.
	// @param {Object} options - Configuration options.
	// @param {Object} handlers - Object containing callback functions for each button click.
	function buildButtonPanel ( classnameContext , options , handlers ) {
		var $self ,
			applyButton ,
			clearButton ,
			cancelButton ;

		// Initializes and structures the button panel.
		function init ( ) {
			applyButton = $ ( '<button type="button" class="ui-priority-primary"></button>' )
				. text ( options . applyButtonText )
				. button ( ) ;
			clearButton = $ ( '<button type="button" class="ui-priority-secondary"></button>' )
				. text ( options . clearButtonText )
				. button ( ) ;
			cancelButton = $ ( '<button type="button" class="ui-priority-secondary"></button>' )
				. text ( options . cancelButtonText )
				. button ( ) ;

			$self = $ ( '<div></div>' )
				. addClass ( classnameContext + '-buttonpanel' )
				. append ( applyButton )
				. append ( clearButton )
				. append ( cancelButton ) ;

			bindEvents ( ) ;
		}

		// Binds click event handlers to the buttons.
		function bindEvents ( ) {
			if ( handlers ) {
				applyButton . click ( handlers . onApply ) ;
				clearButton . click ( handlers . onClear ) ;
				cancelButton . click ( handlers . onCancel ) ;
			}
		}

		init ( ) ; // Initialize the button panel
		return {
			getElement : function ( ) { return $self ; }
		} ;
	}

	// Main factory function for the date range picker widget.
	// @param {jQuery} $originalElement - The jQuery object of the input form element.
	// @param {Object} options - Configuration options.
	function buildDateRangePicker ( $originalElement , options ) {
		var classname = 'comiseo-daterangepicker' ,
			$container , // The main dropdown container element
			$mask , // Overlay for UI blocking and closing on outside click
			triggerButton ,
			presetsMenu ,
			calendar ,
			buttonPanel ,
			isOpen = false ,
			autoFitNeeded = false ,
			LEFT = 0 ,
			RIGHT = 1 ,
			TOP = 2 ,
			BOTTOM = 3 ,
			sides = [ 'left' , 'right' , 'top' , 'bottom' ] ,
			hSide = RIGHT , // Initial horizontal side, used for CSS class styling
			vSide = null ;

		// Core initialization logic for the date range picker.
		function init ( ) {
			triggerButton = buildTriggerButton ( $originalElement , classname , options ) ;
			presetsMenu = buildPresetsMenu ( classname , options , usePreset ) ;
			calendar = buildCalendar ( classname , options ) ;
			// Store initial numberOfMonths to restore it after auto-fitting
			autoFit . numberOfMonths = options . datepickerOptions . numberOfMonths ;
			if ( autoFit . numberOfMonths instanceof Array ) { // Multi-month array not yet supported
				options . autoFitCalendars = false ;
			}
			buttonPanel = buildButtonPanel ( classname , options , {
				onApply : function ( ) {
						close ( ) ;
						setRange ( ) ;
				} ,
				onClear : function ( ) {
						close ( ) ;
						clearRange ( ) ;
				} ,
				onCancel : function ( ) {
					close ( ) ;
					reset ( ) ;
				}
			} ) ;
			render ( ) ; // Render the UI elements
			autoFit ( ) ; // Perform initial auto-fitting of calendars
			reset ( ) ; // Reset to initial range or stored value
			bindEvents ( ) ; // Attach event listeners
		}

		// Renders the main date range picker container and its sub-components.
		function render ( ) {
			$container = $ ( '<div></div>' , { 'class' : classname + ' ' + classname + '-' + sides [ hSide ] + ' ui-widget ui-widget-content ui-corner-all ui-front' } )
				. append ( $ ( '<div></div>' , { 'class' : classname + '-main ui-widget-content' } )
					. append ( presetsMenu . getElement ( ) )
					. append ( calendar . getElement ( ) ) )
				. append ( $ ( '<div class="ui-helper-clearfix"></div>' )
					. append ( buttonPanel . getElement ( ) ) )
				. hide ( ) ; // Initially hide the container
			$originalElement . hide ( ) . after ( triggerButton . getElement ( ) ) ; // Hide original input, show trigger button
			$mask = $ ( '<div></div>' , { 'class' : 'ui-front ' + classname + '-mask' } ) . hide ( ) ;
			$ ( 'body' ) . append ( $mask ) . append ( $container ) ; // Add mask and container to body
		}

		// Dynamically adjusts the number of months displayed in the date picker to fit screen width.
		function autoFit ( ) {
			if ( options . autoFitCalendars ) {
				var maxWidth = $ ( window ) . width ( ) ,
					initialWidth = $container . outerWidth ( true ) ,
					$calendar = calendar . getElement ( ) ,
					numberOfMonths = $calendar . datepicker ( 'option' , 'numberOfMonths' ) ,
					initialNumberOfMonths = numberOfMonths ;

				if ( initialWidth > maxWidth ) { // If current width exceeds window width, reduce months
					while ( numberOfMonths > 1 && $container . outerWidth ( true ) > maxWidth ) {
						$calendar . datepicker ( 'option' , 'numberOfMonths' , -- numberOfMonths ) ;
					}
					if ( numberOfMonths !== initialNumberOfMonths ) {
						// Calculate width per month for future adjustments
						autoFit . monthWidth = ( initialWidth - $container . outerWidth ( true ) ) / ( initialNumberOfMonths - numberOfMonths ) ;
					}
				} else { // If there's enough space, try to expand months up to the initial setting
					while ( numberOfMonths < autoFit . numberOfMonths && ( maxWidth - $container . outerWidth ( true ) ) >= autoFit . monthWidth ) {
						$calendar . datepicker ( 'option' , 'numberOfMonths' , ++ numberOfMonths ) ;
					}
				}
				reposition ( ) ; // Reposition after width change
				autoFitNeeded = false ;
			}
		}

		// Destroys the widget, removing all created elements and restoring the original input.
		function destroy ( ) {
			$container . remove ( ) ;
			triggerButton . getElement ( ) . remove ( ) ;
			$originalElement . show ( ) ;
		}

		// Binds all necessary event listeners.
		function bindEvents ( ) {
			triggerButton . getElement ( ) . click ( toggle ) ;
			triggerButton . getElement ( ) . keydown ( keyPressTriggerOpenOrClose ) ;
			$mask . click ( close ) ; // Close when clicking outside the picker (on the mask)
			$ ( window ) . resize ( function ( ) { isOpen ? autoFit ( ) : autoFitNeeded = true ; } ) ;
		}

		// Formats a date range for display in the trigger button label.
		function formatRangeForDisplay ( range ) {
			var dateFormat = options . dateFormat ;
			return $ . datepicker . formatDate ( dateFormat , range . start ) + ( + range . end !== + range . start ? options . rangeSplitter + $ . datepicker . formatDate ( dateFormat , range . end ) : '' ) ;
		}

		// Formats a date range into a JSON string for the original input element.
		function formatRange ( range ) {
			var dateFormat = options . altFormat ,
				formattedRange = { } ;
			formattedRange . start = $ . datepicker . formatDate ( dateFormat , range . start ) ;
			formattedRange . end = $ . datepicker . formatDate ( dateFormat , range . end ) ;
			return JSON . stringify ( formattedRange ) ;
		}

		// Parses a JSON string date range from the original input element.
		function parseRange ( text ) {
			var dateFormat = options . altFormat ,
				range = null ;
			if ( text ) {
				try {
					range = JSON . parse ( text , function ( key , value ) {
						return key ? $ . datepicker . parseDate ( dateFormat , value ) : value ;
					} ) ;
				} catch ( e ) {
					// Parsing error, range remains null
				}
			}
			return range ;
		}

		// Resets the widget to its initial state or to a stored range from the original element.
		function reset ( ) {
			var range = parseRange ( $originalElement . val ( ) ) ;
			if ( range ) {
				triggerButton . setLabel ( formatRangeForDisplay ( range ) ) ;
				calendar . setRange ( range ) ;
			} else {
				calendar . reset ( ) ;
			}
		}

		// Sets the selected date range, updates display, and triggers change event.
		function setRange ( value ) {
			var range = value || calendar . getRange ( ) ;
			if ( ! range . start ) {
				return ;
			}
			if ( ! range . end ) {
				range . end = range . start ;
			}
			value && calendar . setRange ( range ) ; // Only set calendar range if value is provided
			triggerButton . setLabel ( formatRangeForDisplay ( range ) ) ;
			$originalElement . val ( formatRange ( range ) ) . change ( ) ;
			if ( options . onChange ) {
				options . onChange ( ) ;
			}
		}

		// Retrieves the currently selected date range.
		function getRange ( ) {
			return parseRange ( $originalElement . val ( ) ) ;
		}

		// Clears the selected date range.
		function clearRange ( ) {
			triggerButton . reset ( ) ;
			calendar . reset ( ) ;
			$originalElement . val ( '' ) ;
		}

		// Callback function used when a preset range is selected from the menu.
		function usePreset ( ) {
			var $this = $ ( this ) ,
				start = $this . data ( 'dateStart' ) ( ) . startOf ( 'day' ) . toDate ( ) ,
				end = $this . data ( 'dateEnd' ) ( ) . startOf ( 'day' ) . toDate ( ) ;
			calendar . setRange ( { start : start , end : end } ) ;
			if ( options . applyOnMenuSelect ) {
				close ( ) ;
				setRange ( ) ;
			}
			return false ;
		}

		// Adjusts the dropdown's position based on available space and collision.
		function reposition ( ) {
			$container . position ( {
				my : 'left top' ,
				at : 'left bottom' + ( options . verticalOffset < 0 ? options . verticalOffset : '+' + options . verticalOffset ) ,
				of : triggerButton . getElement ( ) ,
				collision : 'flipfit flipfit' ,
				using : function ( coords , feedback ) {
					var containerCenterX = feedback . element . left + feedback . element . width / 2 ,
						triggerButtonCenterX = feedback . target . left + feedback . target . width / 2 ,
						newHSide = ( containerCenterX > triggerButtonCenterX ) ? RIGHT : LEFT ;
					if ( options . mirrorOnCollision && newHSide !== hSide ) { // If horizontal collision detected and mirroring is enabled
						hSide = newHSide ;
						$container . removeClass ( classname + '-' + sides [ LEFT ] + ' ' + classname + '-' + sides [ RIGHT ] )
							. addClass ( classname + '-' + sides [ hSide ] ) ;
					}
					vSide = feedback . vertical ;
					$ ( this ) . css ( {
						left : coords . left ,
						top : coords . top
					} ) ;
				}
			} ) ;
		}