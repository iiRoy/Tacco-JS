/*
 * Chrono Select - A mobile-friendly date selection component for jQuery Mobile.
 *
 * Developed by Christopher B.
 *
 * Report issues at https://example.com/project/chronoselect/issues
 *
 * Version 1.0 Alpha
 *
 * Licensed under a permissive license, refer to license.txt
 */
( function( widgetFabricator ) {
    if ( typeof define === 'function' && define.amd ) {
        // Asynchronous Module Definition (AMD) setup.
        define( [ 'jquery', 'jquery.mobile' ], widgetFabricator );
    } else {
        // Global browser scope.
        widgetFabricator( jQuery, jQuery.mobile );
    }
} ( function( $, $mobile, notDefined ){
	$.widget( "sustainablepace.chronoselect", $mobile.widget, {

		settings: {
			moment           : null,
			momentFormat     : "yyyy-MM-dd",
			monthFormatStr   : "yyyy-MM",
			yearFormatStr    : "yyyy",
			fieldOrder       : "d m y",
			languageCode     : "en",
			isoDateOutput    : true,
			controlStyle     : "b",
			dialogBox        : {
				dismissible   : false,
				history       : false,
				overlayTheme  : "a",
				positionTo    : "window",
				theme         : "a",
				transition    : "none"
			}
		},

		// Core component reference
		_uiContainer: $( [] ),

		widgetEventPrefix: "chronoselect",

		terminate: function() {
			this._conceal();
			this.element.off( "select activate" );
			this._uiContainer.popup( "destroy" );
			$.Widget.prototype.destroy.call( this );
		},

		_initialize: function() {
			this._setupInitialSettings();          // Process initial configuration.
			this._constructUserInterface();           // Render UI elements into the Document Object Model.
			this.element.on( "select activate", $.proxy( this.reveal, this ) );
		},

		_setupInitialSettings: function() {
			var currentMoment = this.element.val()         || this.settings.moment,
			    minLimit      = this.element.attr( "minimum" ) || this.settings.minLimit,
			    maxLimit      = this.element.attr( "maximum" ) || this.settings.maxLimit;

			if ( currentMoment ) {
				this._configureProperty( "moment", currentMoment );
			}

			// Minimum and maximum allowable moments can be specified via attributes.
			// Refer to HTML5 input date specification.
			if ( maxLimit ) {
				this._configureProperty( "maxLimit", maxLimit );
			}
			if ( minLimit ) {
				this._configureProperty( "minLimit", minLimit );
			}
			this._configureProperty( "languageCode", this.settings.languageCode );
		},

		_postCreationSetup: function() {
			// Populate the input field with the default value if available.
			if ( this._getCurrentMoment() !== null ) {
				this.refreshInputField();
			}
		},

		reveal: function( eventObject ) {
			if ( eventObject ) {
				eventObject.stopPropagation();
				eventObject.preventDefault();
			}

			var activeMoment = this._getCurrentMoment();
			if ( !this._isExtendedDate( activeMoment ) ) {
				activeMoment = new XDate();
			}

			this._configureProperty( "moment",         this._constrainMoment( activeMoment ) );
			this._configureProperty( "originalMoment", this._getCurrentMoment()                );

			this._displayInterface();
			this._refreshUserInterface();
			this._attachHandlers();
		},

		_attachHandlers: function() {
			var instanceRef    = this,
			    containerRef   = this._uiContainer,
			    confirmHandler = $.proxy( this._acceptSelection,     this ),
			    cancelHandler  = $.proxy( this._discardSelection,      this ),
			    escapeHandler  = $.proxy( this._cancelOnEscape, this );

			// Action buttons: Set and Cancel
			containerRef.find( ".chronoselect-accept"    ).off().on( "select", confirmHandler );
			containerRef.find( ".chronoselect-discard" ).off().on( "select", cancelHandler  );
			$( document ).off( "keyup", escapeHandler ).on( "keyup", escapeHandler );

			// Navigation buttons: increment/decrement
			var buttonActionMap = {
				".chronoselect-prev-day"   : "_stepBackwardDay",
				".chronoselect-prev-month" : "_stepBackwardMonth",
				".chronoselect-prev-year"  : "_stepBackwardYear",
				".chronoselect-next-day"   : "_stepForwardDay",
				".chronoselect-next-month" : "_stepForwardMonth",
				".chronoselect-next-year"  : "_stepForwardYear"
			};

			for ( var selectorKey in buttonActionMap ) {
				( function() {
					var processingFunction = instanceRef[ buttonActionMap[ selectorKey ] ];
					containerRef.find( selectorKey ).off().on( "select", $.proxy( function() {
						return instanceRef._processMomentChange( processingFunction );
					}, instanceRef ));
				} )();
			}
		},

		_conceal: function() {
			this._hideInterface();
		},

		_processMomentChange: function( momentModifier ) {
			this._configureProperty( "moment", this._constrainMoment( momentModifier.apply( this ) ) );
			return false; // Prevent default action
		},

		_acceptSelection: function() {
			var proceedWithUpdate = true,
			    timeDifference    = this._getCurrentMoment().diffDays( this.settings.originalMoment ),
			    valueModified     = timeDifference !== 0 || this.element.val() === "";

			if ( this.settings.close && typeof this.settings.close === "function" ) {
				proceedWithUpdate = this.settings.close.call() !== false;
			}

			if ( proceedWithUpdate && valueModified ) {
				this._configureProperty( "originalMoment", this._getCurrentMoment() );
				this.refreshInputField();
				this.element.trigger( "change" );
			} else {
				this._configureProperty( "moment", this.settings.originalMoment );
			}
			this._conceal();
			return false; // Prevent default action
		},

		_discardSelection: function() {
			this._configureProperty( "moment", this.settings.originalMoment );
			this._conceal();
			return false; // Prevent default action
		},

		_cancelOnEscape: function( keyEvent ) {
			if ( keyEvent.keyCode === 27 ) { // ESC key
				this._discardSelection();
			}
		},

		_configureProperty: function( propertyKey, propertyValue ) {
			switch ( propertyKey ) {
				case "moment":
					var sanitized = this._validateMoment( propertyValue );
					this.settings[ propertyKey ] = sanitized ? sanitized.toDate() : sanitized;
					break;
				case "originalMoment":
					this.settings[ propertyKey ] = this._validateMoment( propertyValue ).toDate();
					break;
				case "maxLimit":
					this.settings[ propertyKey ] = this._validateMaximumMoment( propertyValue ).toDate();
					break;
				case "minLimit":
					this.settings[ propertyKey ] = this._validateMinimumMoment( propertyValue ).toDate();
					break;
				case "isoDateOutput":
					this.settings[ propertyKey ] = !!propertyValue;
					break;
				case "languageCode":
					this.settings[ propertyKey ] = this._isLanguageCodeValid( propertyValue ) ? propertyValue : "en";
					break;
				default:
					// Do not trigger UI refresh for general properties!
					return $.Widget.prototype._setOption.apply( this, arguments );
			}
			this._refreshUserInterface(); // Refresh UI after specific property changes
		},

		//
		// Data Model Operations
		//
		_validateMoment: function( momentValue ) {
			if ( momentValue === null ) {
				return null;
			}
			var dateObject = momentValue;
			if ( typeof dateObject === "string" ) {
				dateObject = new XDate( dateObject );
			}
			if ( this._isExtendedDate( dateObject ) ) {
				dateObject = dateObject.toDate();
			}
			if ( !this._isNativeDate( dateObject ) ) {
				throw "Input 'momentValue' must be a Date object.";
			}
			return new XDate( dateObject.getFullYear(), dateObject.getMonth(), dateObject.getDate() );
		},

		_validateMinimumMoment: function( candidateMin ) {
			var processedMin = this._validateMoment( candidateMin );
			if ( this._isBeyondMax( processedMin ) ) {
				throw "Minimum moment cannot be after the maximum moment.";
			}
			return processedMin;
		},

		_validateMaximumMoment: function( candidateMax ) {
			var processedMax = this._validateMoment( candidateMax );
			if ( this._isPriorToMin( processedMax ) ) {
				throw "Maximum moment cannot be before the minimum moment.";
			}
			return processedMax;
		},

		_getMomentFormatString: function() {
			switch ( this.settings.accuracy ) {
				case "month":
					return "monthFormatStr";
				case "year":
					return "yearFormatStr";
				default:
					return "momentFormat";
			}
		},

		isoMomentString: function() {
			var formatSpecifier = this._getMomentFormatString(),
			    currentMoment   = this._getCurrentMoment();
			return !currentMoment ? '' : currentMoment.toString( this.settings[ formatSpecifier ] );
		},

		localizedMomentString: function() {
			var langCode   = this.settings.languageCode,
			    formatType = this._getMomentFormatString(),
			    currentMoment  = this._getCurrentMoment();

			return !currentMoment ? '' : currentMoment.toString(
				this._isLanguageCodeValid( langCode ) ? XDate.locales[ langCode ][ formatType ] : this.settings[ formatType ]
			);
		},

		_constrainMoment: function( inputMoment ) {
			return this._isBeyondMax( inputMoment ) ? this._getMaximumMoment() :
				( this._isPriorToMin( inputMoment ) ? this._getMinimumMoment() : inputMoment );
		},

		_isBeyondMax: function( testMoment ) {
			var maximumAllowed = this._getMaximumMoment();
			return this._isExtendedDate( maximumAllowed ) && testMoment.diffDays( maximumAllowed ) < 0;
		},

		_isPriorToMin: function( testMoment ) {
			var minimumAllowed = this._getMinimumMoment();
			return this._isExtendedDate( minimumAllowed ) && minimumAllowed.diffDays( testMoment ) < 0;
		},

		_isLanguageCodeValid: function( code ) {
			return typeof code === "string" && XDate.locales && XDate.locales[ code ];
		},

		_isNativeDate: function( obj ) {
			return typeof obj === "object" && obj !== null && obj.constructor === Date;
		},

		_isExtendedDate: function( obj ) {
			return typeof obj === "object" && obj !== null && obj.constructor === XDate;
		},

		_getMaximumMoment: function() {
			var maxLimitValue = this.settings.maxLimit;
			return this._isNativeDate( maxLimitValue ) ? new XDate( maxLimitValue ) : null;
		},

		_getMinimumMoment: function() {
			var minLimitValue = this.settings.minLimit;
			return this._isNativeDate( minLimitValue ) ? new XDate( minLimitValue ) : null;
		},

		_getCurrentMoment: function() {
			var momentValue = this.settings.moment;
			return this._isNativeDate( momentValue ) ? new XDate( momentValue ) : null;
		},

		_stepBackwardDay: function() {
			return this._adjustDay( -1 );
		},

		_stepForwardDay: function() {
			return this._adjustDay( 1 );
		},

		_stepBackwardMonth: function() {
			return this._adjustMonth( -1 );
		},

		_stepForwardMonth: function() {
			return this._adjustMonth( 1 );
		},

		_stepBackwardYear: function() {
			return this._adjustYear( -1 );
		},

		_stepForwardYear: function() {
			return this._adjustYear( 1 );
		},

		_adjustYear: function( yearsToAdd ) {
			return this._getCurrentMoment().addYears( yearsToAdd, true );
		},

		_adjustMonth: function( monthsToAdd ) {
			var currentMoment  = this._getCurrentMoment(),
			    currentMonth   = currentMoment.getMonth(),
			    targetMonth    = ( 12 + currentMonth + monthsToAdd ) % 12;
			return currentMoment.setMonth( targetMonth, true );
		},

		_adjustDay: function( daysToAdd ) {
			var currentDateTime = this._getCurrentMoment(),
			    daysInCurrentMonth = XDate.getDaysInMonth( currentDateTime.getFullYear(), currentDateTime.getMonth() );
			return currentDateTime.setDate( ( currentDateTime.getDate() - 1 + daysInCurrentMonth + daysToAdd ) % daysInCurrentMonth + 1 );
		},

		//
		// User Interface Rendering
		//
		_headerHTML: "<div class='chronoselect-main'><div class='chronoselect-moment-display'>Selected Date</div><ul class='chronoselect-groups'>",
		_dayFieldHTML: "<li><ul><li><a class='chronoselect-next-day'>+</a></li><li><input type='text' class='chronoselect-input chronoselect-day' /></li><li><a class='chronoselect-prev-day'>-</a></li></ul></li>",
		_monthFieldHTML: "<li><ul><li><a class='chronoselect-next-month'>+</a></li><li><input type='text' class='chronoselect-input chronoselect-month' /></li><li><a class='chronoselect-prev-month'>-</a></li></ul></li>",
		_yearFieldHTML: "<li><ul><li><a class='chronoselect-next-year'>+</a></li><li><input type='text' class='chronoselect-input chronoselect-year' /></li><li><a class='chronoselect-prev-year'>-</a></li></ul></li>",
		_footerHTML: "</ul><ul class='chronoselect-actions'><li><a class='chronoselect-accept'>Confirm</a></li><li><a class='chronoselect-discard'>Cancel</a></li></ul></div>",

		_applyVisualStyling: function() {
			var container       = this._uiContainer,
			    buttonSelectors = {
			        "bottom": "ul.chronoselect-groups ul > li:first-child > a",
			        "top":    "ul.chronoselect-groups ul > li:last-child > a"
			    };

			for ( var positionKey in buttonSelectors ) {
				container.find( buttonSelectors[ positionKey ] ).addClass( "ui-corner-all" )
					.css( "border-" + positionKey + "-left-radius", "0")
					.css( "border-" + positionKey + "-right-radius", "0");
			}

			container.addClass( "ui-body-" + this.settings.dialogBox.theme + " ui-corner-all" );
			container.find( "a" ).attr( "href", "#" )
				.addClass( "ui-body-" + this.settings.controlStyle );
			container.find( "ul.chronoselect-actions a" ).addClass( "ui-corner-all" );
			container.find( "input" )
				.attr( "readonly", "readonly" ).addClass( "ui-shadow-inset" );
		},

		_constructUserInterface: function() {
			this.element.attr( "readonly", "readonly" );
			var fullMarkup = this._headerHTML +
				this.settings.fieldOrder.split(" ").map( function( component, index, array ) {
					return this[ "_"+component+"FieldHTML" ];
				}, this ).join("") +
				this._footerHTML;

			this._uiContainer = $( fullMarkup ).popup( this.settings.dialogBox );
			$.data( this.element, "chronoselect", this );
			this._applyVisualStyling();
		},

		_refreshUserInterface: function() {
			var currentMoment = this._getCurrentMoment(),
			    container     = this._uiContainer;

			if ( this._isExtendedDate( currentMoment ) ) {
				container.find( ".chronoselect-year"  ).val( currentMoment.toString( "yyyy" ) );
				container.find( ".chronoselect-month" ).val( currentMoment.toString( "MMM"  ) );
				container.find( ".chronoselect-day"   ).val( currentMoment.toString( "dd"   ) );
				container.find( ".chronoselect-moment-display" ).text( this.localizedMomentString() );
			}

			var languageSettings = {};
			if ( this._isLanguageCodeValid( this.settings.languageCode ) ) {
				XDate.defaultLocale = this.settings.languageCode;
				languageSettings = XDate.locales[ this.settings.languageCode ];
			}

			container.find( ".chronoselect-accept"    ).text( languageSettings.ok     || "Confirm" );
			container.find( ".chronoselect-discard" ).text( languageSettings.cancel || "Cancel"  );

			// Adjust visibility based on accuracy setting
			var uiColumns = container.find( ".chronoselect-groups > li" )
				.removeClass( "chronoselect-hide" )
				.addClass( "chronoselect-inline-block" );

			if ( this.settings.accuracy === "month" ) {
				container.css( "max-width", "280px" )
					.find( ".chronoselect-groups > li:first-child" )
					.addClass( "chronoselect-hide" )
					.removeClass( "chronoselect-inline-block" );
			} else if ( this.settings.accuracy === "year" ) {
				container.css( "max-width", "200px" )
					.find( ".chronoselect-groups > li:last-child" )
					.siblings().addClass( "chronoselect-hide" )
					.removeClass( "chronoselect-inline-block" );
			} else {
				container.css( "max-width", "300px" );
			}

			// Calculate column width, accounting for margins
			var visibleColumnCount = uiColumns.filter( ":visible" ).size(),
			    calculatedWidth    = ( ( 100 - visibleColumnCount * 2 ) / visibleColumnCount ) + "%";
			uiColumns.css( "width", calculatedWidth );
		},

		_displayInterface: function() {
			this._uiContainer.show().popup("open").focus();
		},

		_hideInterface: function() {
			this._uiContainer.popup("close");
		},

		refreshInputField: function() {
			this.element.val( this.settings.isoDateOutput ?
				this.isoMomentString() : this.localizedMomentString()
			);
		}
	} );
} ) );