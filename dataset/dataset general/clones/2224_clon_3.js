/*
 * Date Selection Interface - A customizable date picker widget for jQuery Mobile.
 *
 * Developed by MyCompany Solutions.
 *
 * Report issues and contribute at https://github.com/mycompany/date-selector/issues
 *
 * Version 1.1.0
 *
 * Licensed under the Apache License 2.0.
 * See LICENSE.txt for details.
 */
(function( pluginInitializer ) {
	// Check for AMD loader (RequireJS)
	if (typeof define === 'function' && define.amd) {
		// Register as an anonymous module with dependencies
		define( ['jquery', 'jquery.mobile'], pluginInitializer );
	} else {
		// Fallback for browser globals (no module loader)
		pluginInitializer( jQuery, jQuery.mobile );
	}
}( function( jQueryRef, jQueryMobileRef, optionalParam ){ // `optionalParam` is often `undefined` for robustness
jQueryRef.widget( "mycompany.calendarWidget", jQueryMobileRef.widget, {
	// Component's default configuration options
	options: {
		selectedDate          : null, // The currently chosen date
		displayFormatStandard : "yyyy-MM-dd", // Format for full date display
		displayFormatMonthOnly: "yyyy-MM",    // Format when only month is relevant
		displayFormatYearOnly : "yyyy",       // Format when only year is relevant
		fieldArrangement      : "d m y", // Order of day, month, year input fields
		languageCode          : "en",    // Locale string for internationalization
		useIsoFormat          : true,    // Whether to use ISO format for the input field
		controlTheme          : "b",     // jQuery Mobile theme for control buttons
		dialogConfig          : {        // Configuration for the jQuery Mobile popup dialog
			dismissible : false,
			history     : false,
			overlayTheme: "a",
			positionTo  : "window",
			theme       : "a",
			transition  : "none"
		}
	},

	// Internal references and properties
	_dateSelectionDialog: jQueryRef( [] ), // The jQuery object representing the date picker dialog
	eventTriggerPrefix  : "calendarWidget", // Prefix for custom events triggered by the widget

	/**
	 * Disposes of the widget instance, removing event handlers and DOM elements.
	 */
	dispose: function() {
		this._concealDialog(); // Ensure the dialog is closed
		this.element.off( "tap click" ); // Remove event listeners from the target input
		if (this._dateSelectionDialog && this._dateSelectionDialog.popup) {
			this._dateSelectionDialog.popup( "destroy" ); // Destroy the popup widget
		}
		// Call the parent widget's destroy method
		jQueryRef.Widget.prototype.destroy.call( this );
	},

	/**
	 * Initializes the widget on creation.
	 */
	_setupComponent: function() {
		// Verify XDate dependency is available
		if (typeof XDate === 'undefined') {
			console.error("XDate library is required for calendarWidget. Please include it.");
			return; // Abort initialization if XDate is missing
		}
		// Parse and set initial options from element attributes or widget options
		this._initializeConfiguration();
		// Construct and insert the UI elements into the DOM
		this._constructUserInterface();
		// Attach event listeners to the target input element to open the dialog
		this.element.on( "tap click", jQueryRef.proxy( this.showDialog, this ) );
	},

	/**
	 * Parses and applies initial configuration options.
	 * Reads date, minDate, maxDate from the input element's value/attributes.
	 */
	_initializeConfiguration: function() {
		let initialValue = this.element.val();
		let currentSelectedDate = initialValue || this.options.selectedDate;
		let minBoundary = this.element.attr( "min" ) || this.options.minDate;
		let maxBoundary = this.element.attr( "max" ) || this.options.maxDate;

		// Set the initial date, ensuring it's a valid XDate object
		if ( currentSelectedDate ) {
			this._configureOption( "selectedDate", currentSelectedDate );
		}

		// Minimum and maximum dates can be specified via HTML5 attributes.
		// These must be parsed and validated.
		if ( maxBoundary ) {
			this._configureOption( "maxDate", maxBoundary );
		}
		if ( minBoundary ) {
			this._configureOption( "minDate", minBoundary );
		}

		// Ensure locale is valid, default to 'en' if not
		this._configureOption( "languageCode", this.options.languageCode );
		// Ensure boolean options are correctly typed
		this._configureOption( "useIsoFormat", !!this.options.useIsoFormat );
	},

	/**
	 * Performs post-creation setup, such as filling the input field.
	 */
	_postCreationSetup: function() {
		// Fill the input field with the default/initial date if one is set
		const currentDate = this._getCurrentSelectedDate();
		if ( currentDate !== null && currentDate instanceof XDate ) {
			this.updateTargetElementValue();
		}
	},

	/**
	 * Displays the date selection dialog to the user.
	 * @param {Event} [triggerEvent] - The event that triggered the dialog opening.
	 */
	showDialog: function( triggerEvent ) {
		// Prevent default event behavior and stop propagation if an event is provided
		if( triggerEvent ) {
			triggerEvent.stopPropagation();
			triggerEvent.preventDefault();
		}

		// Guard against missing XDate
		if (typeof XDate === 'undefined') {
			console.warn("Cannot open calendarWidget: XDate library is not loaded.");
			return;
		}

		let currentChoice = this._getCurrentSelectedDate();
		// If no valid date is selected, initialize with today's date
		if( !this._isXDateInstance( currentChoice ) ) {
			currentChoice = new XDate();
		}
		// Adjust the date to fit within min/max boundaries and store it
		this._configureOption( "selectedDate", currentChoice );
		// Store a copy of the date as the original, for potential cancellation
		this._configureOption( "originalDate", this._getCurrentSelectedDate() );

		// Display the dialog, refresh its contents, and attach interaction handlers
		this._displayDialog();
		this._refreshUserInterface();
		this._attachEventHandlers();
	},

	/**
	 * Attaches event listeners to the dialog controls.
	 */
	_attachEventHandlers: function() {
		const instanceRef = this;
		const dialogElem  = this._dateSelectionDialog;

		// Handlers for confirmation and cancellation
		const confirmHandler = () => instanceRef._applySelection();
		const cancelHandler  = () => instanceRef._revertSelection();
		const escapeKeyHandler = (evt) => instanceRef._handleEscapeKey(evt);

		// Detach previous handlers to prevent duplicates
		dialogElem.find( ".cal-btn-confirm" ).off().on( "tap", confirmHandler );
		dialogElem.find( ".cal-btn-discard" ).off().on( "tap", cancelHandler );
		jQueryRef( document ).off( "keyup.calwidget" ).on( "keyup.calwidget", escapeKeyHandler ); // Use namespaced event

		// Map button selectors to their respective date adjustment methods
		const buttonActionMap = {
			".cal-btn-prev-day"   : "_decrementDay",
			".cal-btn-prev-month" : "_decrementMonth",
			".cal-btn-prev-year"  : "_decrementYear",
			".cal-btn-next-day"   : "_incrementDay",
			".cal-btn-next-month" : "_incrementMonth",
			".cal-btn-next-year"  : "_incrementYear"
		};

		// Attach handlers for date navigation buttons using event delegation
		// This is a more efficient way to handle events for multiple similar elements
		dialogElem.find(".cal-date-parts").off("tap", "a").on("tap", "a", function() {
			const clickedButton = jQueryRef(this);
			for (const selector in buttonActionMap) {
				if (clickedButton.is(selector)) {
					const handlerMethod = instanceRef[ buttonActionMap[selector] ];
					if (typeof handlerMethod === 'function') {
						instanceRef._processDateChange( handlerMethod.bind(instanceRef) );
					}
					break; // Found the handler, exit loop
				}
			}
			return false; // Prevent default action for anchor tags
		});
	},

	/**
	 * Closes the date selection dialog.
	 */
	_concealDialog: function() {
		if (this._dateSelectionDialog && this._dateSelectionDialog.popup) {
			this._dateSelectionDialog.popup("close");
		}
	},

	/**
	 * Processes a date change by applying the given handler and updating the view.
	 * @param {Function} dateModifierFn - A function that modifies the current date and returns a new XDate.
	 * @returns {boolean} Always returns false to prevent default event actions.
	 */
	_processDateChange: function( dateModifierFn ) {
		const newDate = dateModifierFn(); // Execute the date modification
		this._configureOption( "selectedDate", this._constrainDateToRange( newDate ) );
		return false;
	},

	/**
	 * Confirms the selected date, updates the input field, and closes the dialog.
	 * @returns {boolean} Always returns false to prevent default event actions.
	 */
	_applySelection: function() {
		let shouldProceed = true;
		const currentSelection = this._getCurrentSelectedDate();
		const initialSelection = this.options.originalDate;

		// Check if the date has truly changed
		const dateHasChanged = currentSelection && initialSelection &&
		                       currentSelection.diffDays( new XDate( initialSelection ) ) !== 0;

		// Check if a custom 'close' callback is provided and if it allows proceeding
		if( typeof this.options.close === "function" ) {
			shouldProceed = this.options.close.call( this.element[0], currentSelection ) !== false;
		}

		if( shouldProceed ) {
			if( dateHasChanged || this.element.val() === "" ) {
				// Update the original date and the input field
				this._configureOption( "originalDate", currentSelection );
				this.updateTargetElementValue();
				this.element.trigger("change"); // Trigger native change event
			} else {
				// If no change and no custom close, revert to original date
				this._configureOption( "selectedDate", initialSelection );
			}
		} else {
			// If custom close prevented proceeding, revert the selection
			this._configureOption( "selectedDate", initialSelection );
		}
		this._concealDialog();
		return false;
	},

	/**
	 * Cancels the date selection, reverting to the original date, and closes the dialog.
	 * @returns {boolean} Always returns false.
	 */
	_revertSelection: function() {
		this._configureOption( "selectedDate", this.options.originalDate );
		this._concealDialog();
		return false;
	},

	/**
	 * Handles the Escape key press to cancel date selection.
	 * @param {Event} keyboardEvent - The keyboard event object.
	 */
	_handleEscapeKey: function( keyboardEvent ) {
		if( keyboardEvent.keyCode === 27 ) { // 27 is the keyCode for Escape
			this._revertSelection();
		}
	},

	/**
	 * Sets a specific option for the widget, applying validation and updating the view.
	 * @param {string} key - The name of the option to set.
	 * @param {*} value - The new value for the option.
	 */
	_configureOption: function( key, value ) {
		let processedValue = value;
		let shouldUpdateView = true;

		switch( key ) {
			case "selectedDate":
				// Normalize and validate the date input
				processedValue = this._normalizeDateInput( value );
				// Store a native Date object, or null if invalid
				this.options[ key ] = processedValue ? processedValue.toDate() : null;
				break;
			case "originalDate":
				// Always sanitize original date
				processedValue = this._normalizeDateInput( value );
				this.options[ key ] = processedValue ? processedValue.toDate() : null;
				break;
			case "maxDate":
				// Validate and store the maximum allowed date
				processedValue = this._validateMaximumDate( value );
				this.options[ key ] = processedValue ? processedValue.toDate() : null;
				break;
			case "minDate":
				// Validate and store the minimum allowed date
				processedValue = this._validateMinimumDate( value );
				this.options[ key ] = processedValue ? processedValue.toDate() : null;
				break;
			case "useIsoFormat":
				// Ensure boolean type
				this.options[ key ] = !!value;
				break;
			case "languageCode":
				// Validate locale string, default to 'en' if invalid or XDate locales missing
				this.options[ key ] = (XDate.locales && this._checkValidLocale( value )) ? value : "en";
				break;
			default:
				// For other options, defer to the base widget's _setOption, and do not trigger view update
				shouldUpdateView = false;
				return jQueryRef.Widget.prototype._setOption.apply( this, arguments );
		}

		// Only update the view if the change warrants it and isn't handled by base _setOption
		if (shouldUpdateView) {
			this._refreshUserInterface();
		}
	},

	//
	// Data Model & Validation Helpers
	//

	/**
	 * Normalizes and validates a date input, converting it to an XDate object.
	 * @param {*} dateInput - The date value to sanitize (string, Date object, or XDate object).
	 * @returns {XDate|null} A valid XDate object, or null if the input is invalid or null.
	 * @throws {Error} If the input is a non-Date object that cannot be converted.
	 */
	_normalizeDateInput: function( dateInput ) {
		if ( dateInput === null || dateInput === optionalParam ) {
			return null;
		}

		let processedDate = dateInput;
		if ( typeof processedDate === "string" ) {
			try {
				processedDate = new XDate( processedDate );
			} catch (e) {
				console.warn("Invalid date string provided:", dateInput, e);
				return null;
			}
		}

		if ( this._isNativeDateObject( processedDate ) ) {
			processedDate = new XDate( processedDate );
		}

		if ( !this._isXDateInstance( processedDate ) ) {
			// Throw if it's an object but not a recognized date type
			if (typeof dateInput === 'object') {
				throw new Error( "Input 'dateInput' must be a string, Date object, or XDate instance." );
			}
			// Otherwise, if it's a primitive type that couldn't be parsed, return null
			return null;
		}

		// Create a new XDate instance representing only the year, month, and day
		return new XDate( processedDate.getFullYear(), processedDate.getMonth(), processedDate.getDate() );
	},

	/**
	 * Validates a potential minimum date against the current maximum date.
	 * @param {*} dateInput - The date to validate as minimum.
	 * @returns {XDate|null} A valid XDate for the minimum date.
	 * @throws {Error} If the minimum date is after the maximum date.
	 */
	_validateMinimumDate: function( dateInput ) {
		const minCandidate = this._normalizeDateInput( dateInput );
		if( minCandidate && this._isBeyondMaxBoundary( minCandidate ) ) {
			throw new Error( "Minimum date cannot be set after the current maximum date." );
		}
		return minCandidate;
	},

	/**
	 * Validates a potential maximum date against the current minimum date.
	 * @param {*} dateInput - The date to validate as maximum.
	 * @returns {XDate|null} A valid XDate for the maximum date.
	 * @throws {Error} If the maximum date is before the minimum date.
	 */
	_validateMaximumDate: function( dateInput ) {
		const maxCandidate = this._normalizeDateInput( dateInput );
		if( maxCandidate && this._isBeforeMinBoundary( maxCandidate ) ) {
			throw new Error( "Maximum date cannot be set before the current minimum date." );
		}
		return maxCandidate;
	},

	/**
	 * Determines the correct date format key based on the 'accuracy' option.
	 * @returns {string} The key for the date format string (e.g., "displayFormatStandard").
	 */
	_determineDateFormatKey: function() {
		const formatMap = {
			"month": "displayFormatMonthOnly",
			"year" : "displayFormatYearOnly"
		};
		// Default to standard format if accuracy is not 'month' or 'year'
		return formatMap[this.options.accuracy] || "displayFormatStandard";
	},

	/**
	 * Returns the selected date formatted as an ISO-like string (yyyy-MM-dd).
	 * @returns {string} The formatted date string, or an empty string if no date is selected.
	 */
	getIsoDateString: function() {
		const currentSelection = this._getCurrentSelectedDate();
		if (!currentSelection || !this._isXDateInstance(currentSelection)) {
			return '';
		}
		const formatKey = this._determineDateFormatKey();
		return currentSelection.toString( this.options[ formatKey ] );
	},

	/**
	 * Returns the selected date formatted according to the specified locale.
	 * @returns {string} The localized date string, or an empty string if no date is selected.
	 */
	getLocalizedDateString: function() {
		const currentSelection = this._getCurrentSelectedDate();
		if (!currentSelection || !this._isXDateInstance(currentSelection)) {
			return '';
		}
		const currentLocale = this.options.languageCode;
		const formatKey     = this._determineDateFormatKey();

		// Use locale-specific format if available, otherwise fall back to standard format
		if ( this._checkValidLocale( currentLocale ) && XDate.locales[ currentLocale ][ formatKey ] ) {
			return currentSelection.toString( XDate.locales[ currentLocale ][ formatKey ] );
		} else {
			return currentSelection.toString( this.options[ formatKey ] );
		}
	},

	/**
	 * Constrains a given date to be within the allowed min and max date boundaries.
	 * @param {XDate} targetDate - The date to fit.
	 * @returns {XDate} The constrained XDate object.
	 */
	_constrainDateToRange: function( targetDate ) {
		const maxDate = this._retrieveMaximumDate();
		const minDate = this._retrieveMinimumDate();

		if ( !this._isXDateInstance( targetDate ) ) {
			// If targetDate is invalid, return a default or error
			console.warn("Attempted to constrain an invalid date:", targetDate);
			return this._getCurrentSelectedDate() || new XDate();
		}

		if ( maxDate && this._isBeyondMaxBoundary( targetDate ) ) {
			return maxDate;
		}
		if ( minDate && this._isBeforeMinBoundary( targetDate ) ) {
			return minDate;
		}
		return targetDate;
	},

	/**
	 * Checks if a given date is after the maximum allowed date.
	 * @param {XDate} testDate - The date to check.
	 * @returns {boolean} True if testDate is after maxDate, false otherwise.
	 */
	_isBeyondMaxBoundary: function( testDate ) {
		const maxLimit = this._retrieveMaximumDate();
		return this._isXDateInstance( maxLimit ) && this._isXDateInstance( testDate ) && testDate.diffDays( maxLimit ) < 0;
	},

	/**
	 * Checks if a given date is before the minimum allowed date.
	 * @param {XDate} testDate - The date to check.
	 * @returns {boolean} True if testDate is before minDate, false otherwise.
	 */
	_isBeforeMinBoundary: function( testDate ) {
		const minLimit = this._retrieveMinimumDate();
		return this._isXDateInstance( minLimit ) && this._isXDateInstance( testDate ) && minLimit.diffDays( testDate ) < 0;
	},

	/**
	 * Checks if a given locale string is valid and supported by XDate.
	 * @param {string} localeStr - The locale string (e.g., "en", "fr").
	 * @returns {boolean} True if the locale is valid, false otherwise.
	 */
	_checkValidLocale: function( localeStr ) {
		return typeof localeStr === "string" && XDate.locales && XDate.locales[ localeStr ];
	},

	/**
	 * Checks if the given object is a native JavaScript Date object.
	 * @param {*} obj - The object to check.
	 * @returns {boolean} True if it's a Date object, false otherwise.
	 */
	_isNativeDateObject: function( obj ) {
		return obj instanceof Date;
	},

	/**
	 * Checks if the given object is an instance of XDate.
	 * @param {*} obj - The object to check.
	 * @returns {boolean} True if it's an XDate instance, false otherwise.
	 */
	_isXDateInstance: function( obj ) {
		return obj instanceof XDate;
	},

	/**
	 * Retrieves the maximum allowed date as an XDate object.
	 * @returns {XDate|null} The maximum date, or null if not set.
	 */
	_retrieveMaximumDate: function() {
		const maxDateOption = this.options.maxDate;
		return this._isNativeDateObject( maxDateOption ) ? new XDate( maxDateOption ) : null;
	},

	/**
	 * Retrieves the minimum allowed date as an XDate object.
	 * @returns {XDate|null} The minimum date, or null if not set.
	 */
	_retrieveMinimumDate: function() {
		const minDateOption = this.options.minDate;
		return this._isNativeDateObject( minDateOption ) ? new XDate( minDateOption ) : null;
	},

	/**
	 * Retrieves the currently selected date as an XDate object.
	 * @returns {XDate|null} The selected date, or null if not set.
	 */
	_getCurrentSelectedDate: function() {
		const selectedDateOption = this.options.selectedDate;
		return this._isNativeDateObject( selectedDateOption ) ? new XDate( selectedDateOption ) : null;
	},

	/**
	 * Decrements the selected date by one day.
	 * @returns {XDate} The new selected XDate object.
	 */
	_decrementDay: function() {
		return this._getCurrentSelectedDate().addDays( -1, true );
	},

	/**
	 * Increments the selected date by one day.
	 * @returns {XDate} The new selected XDate object.
	 */
	_incrementDay: function() {
		return this._getCurrentSelectedDate().addDays( 1, true );
	},

	/**
	 * Decrements the selected date by one month.
	 * @returns {XDate} The new selected XDate object.
	 */
	_decrementMonth: function() {
		return this._getCurrentSelectedDate().addMonths( -1, true );
	},

	/**
	 * Increments the selected date by one month.
	 * @returns {XDate} The new selected XDate object.
	 */
	_incrementMonth: function() {
		return this._getCurrentSelectedDate().addMonths( 1, true );
	},

	/**
	 * Decrements the selected date by one year.
	 * @returns {XDate} The new selected XDate object.
	 */
	_decrementYear: function() {
		return this._getCurrentSelectedDate().addYears( -1, true );
	},

	/**
	 * Increments the selected date by one year.
	 * @returns {XDate} The new selected XDate object.
	 */
	_incrementYear: function() {
		return this._getCurrentSelectedDate().addYears( 1, true );
	},

	//
	// User Interface (View) Markup and Logic
	//
	_dialogHtmlHeader: "<div class='cal-main-container ui-shadow'><div class='cal-formatted-display'>Selected Date</div><ul class='cal-date-parts'>",
	_dialogHtmlDayPart: "<li><div class='cal-part-wrapper'><button class='cal-btn-next-day ui-btn ui-icon-plus ui-btn-icon-notext ui-corner-all'>+</button><input type='text' class='cal-input-field cal-input-day' /><button class='cal-btn-prev-day ui-btn ui-icon-minus ui-btn-icon-notext ui-corner-all'>-</button></div></li>",
	_dialogHtmlMonthPart: "<li><div class='cal-part-wrapper'><button class='cal-btn-next-month ui-btn ui-icon-plus ui-btn-icon-notext ui-corner-all'>+</button><input type='text' class='cal-input-field cal-input-month' /><button class='cal-btn-prev-month ui-btn ui-icon-minus ui-btn-icon-notext ui-corner-all'>-</button></div></li>",
	_dialogHtmlYearPart: "<li><div class='cal-part-wrapper'><button class='cal-btn-next-year ui-btn ui-icon-plus ui-btn-icon-notext ui-corner-all'>+</button><input type='text' class='cal-input-field cal-input-year' /><button class='cal-btn-prev-year ui-btn ui-icon-minus ui-btn-icon-notext ui-corner-all'>-</button></div></li>",
	_dialogHtmlFooter: "</ul><div class='cal-action-buttons ui-grid-a'><div class='ui-block-a'><button class='cal-btn-confirm'>Confirm</button></div><div class='ui-block-b'><button class='cal-btn-discard'>Cancel</button></div></div></div>",

	/**
	 * Applies jQuery Mobile theming and custom styles to the dialog elements.
	 */
	_applyStyling: function() {
		const dialogRoot = this._dateSelectionDialog;
		const controlThemeClass = `ui-btn-up-${this.options.controlTheme}`;
		const popupThemeClass   = `ui-body-${this.options.dialogConfig.theme}`;

		// Add base theme and corner styling to the dialog itself
		dialogRoot.addClass( `${popupThemeClass} ui-corner-all` );

		// Style the increment/decrement buttons
		dialogRoot.find( "ul.cal-date-parts button" )
			.addClass( controlThemeClass ) // Apply the button theme
			.attr("role", "button"); // Add ARIA role

		// Style the action buttons (Confirm/Cancel)
		dialogRoot.find( ".cal-action-buttons button" )
			.addClass( `${controlThemeClass} ui-corner-all` )
			.attr("role", "button");

		// Make input fields read-only and apply inset shadow for visual effect
		dialogRoot.find( "input.cal-input-field" )
			.attr( "readonly", "readonly" )
			.addClass( "ui-shadow-inset ui-body-inherit" ); // Inherit body theme for input background

		// Custom styling for the increment/decrement buttons to make them visually flow
		dialogRoot.find( "ul.cal-date-parts li > div > button" ).each(function(idx) {
			const button = jQueryRef(this);
			// Apply corner styling based on position (top/bottom)
			if (idx % 2 === 0) { // First button in pair (top)
				button.css({
					"border-bottom-left-radius": "0",
					"border-bottom-right-radius": "0"
				});
			} else { // Second button in pair (bottom)
				button.css({
					"border-top-left-radius": "0",
					"border-top-right-radius": "0"
				});
			}
		});
	},

	/**
	 * Constructs the HTML markup for the date selection dialog and initializes it as a popup.
	 */
	_constructUserInterface: function() {
		// Ensure the target element is read-only to prevent manual input
		if (this.element) {
			this.element.attr( "readonly", "readonly" );
		} else {
			console.warn("CalendarWidget: Target element not found for UI construction.");
			return;
		}

		// Dynamically build the date parts based on the specified order
		const orderedParts = this.options.fieldArrangement.split(" ").map( (partCode) => {
			switch(partCode) {
				case 'd': return this._dialogHtmlDayPart;
				case 'm': return this._dialogHtmlMonthPart;
				case 'y': return this._dialogHtmlYearPart;
				default: return ''; // Ignore unrecognized codes
			}
		}).join("");

		// Combine header, ordered parts, and footer to form the complete dialog HTML
		const fullMarkup = this._dialogHtmlHeader + orderedParts + this._dialogHtmlFooter;

		// Create the jQuery object from the markup and initialize it as a jQuery Mobile popup
		this._dateSelectionDialog = jQueryRef( fullMarkup ).popup( this.options.dialogConfig );

		// Apply custom styling and theming
		this._applyStyling();
	},

	/**
	 * Refreshes the display of the dialog, updating date values and layout.
	 */
	_refreshUserInterface: function() {
		const currentSelection = this._getCurrentSelectedDate();
		const dialogRef      = this._dateSelectionDialog;

		if ( !dialogRef || !dialogRef.length ) {
			console.warn("CalendarWidget: Dialog element not available for UI refresh.");
			return;
		}

		// Update input fields and formatted display if a valid date is selected
		if( this._isXDateInstance( currentSelection ) ) {
			dialogRef.find( ".cal-input-year"  ).val( currentSelection.toString( "yyyy" ) );
			dialogRef.find( ".cal-input-month" ).val( currentSelection.toString( "MMM"  ) );
			dialogRef.find( ".cal-input-day"   ).val( currentSelection.toString( "dd"   ) );
			dialogRef.find( ".cal-formatted-display" ).text( this.getLocalizedDateString() );
		} else {
			// Clear fields if no valid date
			dialogRef.find( ".cal-input-year, .cal-input-month, .cal-input-day" ).val( "" );
			dialogRef.find( ".cal-formatted-display" ).text( "No Date Selected" );
		}

		// Update button texts based on current locale
		const currentLocaleData = XDate.locales[ this.options.languageCode ] || {};
		dialogRef.find( ".cal-btn-confirm" ).text( currentLocaleData.ok || "Confirm" );
		dialogRef.find( ".cal-btn-discard" ).text( currentLocaleData.cancel || "Cancel" );

		// Adjust visibility and width of date part columns based on 'accuracy' setting
		const datePartColumns = dialogRef.find( ".cal-date-parts > li" )
			.removeClass( "cal-hidden-item" ) // Ensure all are visible initially
			.addClass( "cal-inline-block-item" ); // Apply inline-block for column layout

		let dialogMaxWidth = "300px"; // Default max width for full date

		switch( this.options.accuracy ) {
			case "month":
				// Hide the day column, reduce dialog width
				dialogRef.find( ".cal-date-parts > li:first-child" ) // Assuming day is first
					.addClass( "cal-hidden-item" ).removeClass( "cal-inline-block-item" );
				dialogMaxWidth = "280px";
				break;
			case "year":
				// Hide day and month columns, reduce dialog width further
				dialogRef.find( ".cal-date-parts > li:not(:last-child)" ) // All but the last (year)
					.addClass( "cal-hidden-item" ).removeClass( "cal-inline-block-item" );
				dialogMaxWidth = "200px";
				break;
			// Default case handles "day" (or no accuracy specified)
		}
		dialogRef.css( "max-width", dialogMaxWidth );

		// Calculate and apply dynamic width to visible columns
		const visibleColumns = datePartColumns.filter( ":visible" );
		const columnCount    = visibleColumns.length;
		if (columnCount > 0) {
			// Distribute width evenly, accounting for a small margin (e.g., 1% left/right per column)
			const columnWidth = ( ( 100 - columnCount * 2 ) / columnCount ) + "%";
			visibleColumns.css( "width", columnWidth );
		}
	},

	/**
	 * Displays the date selection dialog to the user.
	 */
	_displayDialog: function() {
		if (this._dateSelectionDialog && this._dateSelectionDialog.popup) {
			this._dateSelectionDialog.popup("open").focus(); // Open and focus the popup
		}
	},

	/**
	 * Hides the date selection dialog.
	 */
	_concealDialog: function() {
		if (this._dateSelectionDialog && this._dateSelectionDialog.popup) {
			this._dateSelectionDialog.popup("close");
		}
	},

	/**
	 * Updates the value of the target input element with the selected date.
	 */
	updateTargetElementValue: function() {
		if (!this.element || !this.element.length) {
			console.warn("CalendarWidget: Target input element not available to update value.");
			return;
		}
		const formattedString = this.options.useIsoFormat ?
			this.getIsoDateString() : this.getLocalizedDateString();

		this.element.val( formattedString );
	}
});
}));