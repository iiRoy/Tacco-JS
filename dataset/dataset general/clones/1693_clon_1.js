/////////////////////////////////////////////////////////////////////////////
//
// This file contains a JavaScript Autocomplete implementation.
// Original copyright by Matt V. Murphy, 2012.
// Licensed under the MIT-style license.
//
/////////////////////////////////////////////////////////////////////////////
( function (   window, document, undefined ) {
	"use strict" ;

	// Declare a variable for the Autocomplete prototype to shorten references later.
	var AutocompleteProto ;
	var Autocomplete = function ( element, options )
	{
		// Check if the element is valid, converting a string selector to a jQuery object if necessary.
		if ( ( this.element = ( typeof ( element ) === "string" ) ? $( element ) : element ) )
		{
			// Ensure the element is an input tag.
			if ( ( this.element.tagName || "" ).toLowerCase() === "input" )
			{
				this.boundCheckValue  =  bind ( this.checkValue, this ) ; // Bind checkValue for event listeners.
				this.cache            =  {} ; // Cache for search results.
				this.container        =  null ; // Container for the autocomplete suggestions.
				this.delayTimer       =  null ; // Timer for delayed input processing.
				this.elementHasFocus  =  false ; // Flag to track if the input element has focus.
				this.highlightIdx     =  -1 ; // Index of the currently highlighted suggestion.
				this.lastValue        =  "" ; // Stores the last value of the input field.
				this.lastOnInputValue =  null ; // Stores the value passed to the last onInput call.
				this.shownValues      =  [] ; // Array of values currently displayed as suggestions.
				this.throttle         =  -1 ; // Throttling counter for mousemove events.
				this.usesTouch        =  ( window.ontouchstart !== undefined ) ; // Detect touch capability.
				this.values           =  [] ; // All possible values for autocomplete.

				// Configure options and initialize the component.
				this.setOptions ( options ) ;
				this.init ( ) ;
			}
		}
	} ; // End of Autocomplete constructor.

	// Attach a dummy function to the prototype.
	AutocompleteProto = Autocomplete.prototype ;
	AutocompleteProto.nothing = function ( ) { } ;

	// Define the setOptions method for Autocomplete.
	AutocompleteProto.setOptions = function ( options ) {

		var hasOwnProp = Object.prototype.hasOwnProperty ,
		    option ;

		// Default options for the autocomplete.
		this.options = {
			useNativeInterface : true ,
			offsetTop          : 0 ,
			offsetLeft         : 0 ,
			maxChoices         : 6 ,
			highlightColor     : "#ffffff" ,
			highlightBgColor   : "#3399ff" ,
			srcType            : "" , // Expected values: "array", "dom", "xml"
			srcData            : "" ,
			onInput            : this.nothing ,
			onInputDelay       : 0
		} ;

		// Override default options with provided options.
		if ( options ) {
			for ( option in this.options ) {
				if ( hasOwnProp.call ( this.options, option ) && options[ option ] !== undefined ) {
					this.options[ option ] = options[ option ] ;
				}
			}
		}
	} ; // End of setOptions.

	// Initialize the Autocomplete instance.
	AutocompleteProto.init = function ( ) {
		var srcType = this.options.srcType ,
		    datalist , datalistId , boundSetElementFocus ;

		// Populate values based on the source type.
		this.values = ( srcType === "array" ) ? ( this.options.srcData || [] ).concat ( ) :
		              ( srcType === "dom" ) ? this.getDomValues ( ) :
		              ( srcType === "xml" ) ? this.getXmlValues ( ) : [] ;

		// Handle native datalist support.
		if ( datalistSupported && this.options.useNativeInterface ) {
			if ( this.options.onInput !== this.nothing ) {
				addEvent ( this.element, "input", this.boundCheckValue ) ;
			}
			return this.setDatalist ( ) ;
		}

		// Remove any attached datalist element if not using native interface.
		if ( datalistSupported && ( datalistId = this.element.getAttribute ( "list" ) ) ) {
			if ( ( datalist = $( datalistId ) ) ) {
				datalist.parentNode.removeChild ( datalist ) ;
			}
			this.element.removeAttribute ( "list" ) ;
		}

		// Attach focus and blur event listeners to the input element.
		boundSetElementFocus = bind ( this.setElementFocus, this ) ;
		addEvent ( this.element, "focus", boundSetElementFocus ) ;
		addEvent ( this.element, "blur", boundSetElementFocus ) ;
		if ( document.activeElement === this.element ) {
			boundSetElementFocus ( { type : "focus" } ) ;
		}
	} ; // End of init.

	// Retrieves values from a DOM element (e.g., a datalist or select element).
	AutocompleteProto.getDomValues = function ( ) {
		var datalistId = this.element.getAttribute ( "list" ) ,
		    container = ( datalistId ) ? ( $( datalistId ) || {} ).parentNode : null ,
		    options = ( container ) ? container.getElementsByTagName ( "option" ) : [] ,
		    option , i , v ,
		    values = [] ;

		// Iterate through options and extract their values.
		for ( i = 0, v = 0 ; option = options[ i ] ; i ++ ) {
			if ( ( option = option.value ) !== undefined ) {
				values[ v ++ ] = option ;
			}
		}
		return values ;
	} ; // End of getDomValues.

	// Retrieves values from XML data.
	AutocompleteProto.getXmlValues = function ( ) {
		var xml = parseXML ( this.options.srcData ) ,
		    nodes , node , n , value , v ,
		    values = [] ;

		// Parse XML to find options within a datalist element.
		if ( ( nodes = ( xml.getElementsByTagName ( "datalist" )[ 0 ] || {} ).childNodes ) ) {
			for ( n = 0, v = 0 ; node = nodes[ n ] ; n ++ ) {
				if ( node.nodeName === "option" && ( value = node.getAttribute ( "value" ) ) !== null ) {
					values[ v ++ ] = value ;
				}
			}
		}

		return values ;
	} ; // End of getXmlValues.

	// Sets up or updates the native datalist element.
	AutocompleteProto.setDatalist = function ( ) {
		var datalistId = this.element.getAttribute ( "list" ) ,
		    container = ( this.container = ( datalistId && $( datalistId ) ) ) ;

		// Create a new datalist if one doesn't exist, or update existing one.
		if ( ! container ) {
			container = ( this.container = document.createElement ( "datalist" ) ) ;
			container.id = "list" + Math.ceil ( Math.random ( ) * 50000 ) ;
			container.innerHTML = this.generateDatalistOptionsHtml ( ) ;
			this.element.parentNode.appendChild ( container ) ;
			this.element.setAttribute ( "list", container.id ) ;
		} else if ( this.options.srcType !== "dom" ) {
			container.innerHTML = this.generateDatalistOptionsHtml ( ) ;
		}
	} ; // End of setDatalist.

	// Generates the HTML string for datalist options.
	AutocompleteProto.generateDatalistOptionsHtml = function ( ) {
		if ( this.values.length ) {
			return "<option value=\"" + this.values.join ( "\"><option value=\"" ) + "\">" ;
		}
		return "" ;
	} ; // End of generateDatalistOptionsHtml.

	// Handles focus and blur events on the input element.
	AutocompleteProto.setElementFocus = function ( event ) {
		var isFocusEvent = ( ( ( event || window.event ).type || "" ).toLowerCase ( ) === "focus" ) ;

		if ( ( this.elementHasFocus = isFocusEvent ) ) {
			if ( ! this.container ) {
				this.lastValue = this.element.value ;
				this.generateContainer ( ) ;
				this.addInputListeners ( event ) ;
			}
		} else if ( this.shownValues.length ) {
			this.clearValues ( ) ;
		}
	} ; // End of setElementFocus.

	// Generates the custom autocomplete suggestion container.
	AutocompleteProto.generateContainer = function ( ) {
		var wrapper = document.createElement ( "div" ) ,
		    container = ( this.container = document.createElement ( "div" ) ) ,
		    cStyle , eStyle , wDisplay ;

		// Determine the display style for the wrapper based on the input element.
		if ( ( eStyle = window.getComputedStyle ) && ( eStyle = eStyle ( this.element, null ) ) ) {
			wDisplay = eStyle.getPropertyValue ( "display" ) ;
		} else if ( ( eStyle = this.element.currentStyle ) ) {
			wDisplay = eStyle[ "display" ] ;
		}

		// Initialize the suggestion container.
		container.className = "aCon" ;
		if ( ! this.usesTouch ) {
			addEvent ( container, "mousemove", bind ( this.highlightValue, this ) ) ;
			if ( msie === undefined || msie >= 9 ) {
				addEvent ( container, "mousedown", stopEvent ) ;
				addEvent ( container, "mouseup", bind ( this.selectValue, this ) ) ;
			} else {
				addEvent ( container, "mousedown", bind ( this.selectValue, this ) ) ;
			}
		} else {
			addEvent ( container, "touchstart", bind ( this.highlightValue, this ) ) ;
			addEvent ( container, "touchend", bind ( this.selectValue, this ) ) ;
		}
		( cStyle = container.style ).minWidth = this.element.offsetWidth + "px" ;
		cStyle.marginLeft = this.options.offsetLeft + "px" ;
		cStyle.marginTop = ( this.element.offsetHeight + this.options.offsetTop ) + "px" ;

		// Initialize the wrapper and insert into the DOM.
		wrapper.className = "aWrapper" ;
		wrapper.style.display = wDisplay || "block" ;
		wrapper.appendChild ( container ) ;
		this.element.parentNode.insertBefore ( wrapper, this.element ) ;
	} ; // End of generateContainer.

	// Adds input and keydown listeners to the element.
	AutocompleteProto.addInputListeners = function ( event ) {
		var boundToggleSelectionChangeEvent ;

		// Monitor text field value changes.
		if ( msie === undefined || msie >= 9 ) {
			addEvent ( this.element, "input", this.boundCheckValue ) ;
			if ( msie === 9 ) {
				boundToggleSelectionChangeEvent = bind ( this.toggleSelectionChangeEvent, this ) ;
				addEvent ( this.element, "focus", boundToggleSelectionChangeEvent ) ;
				addEvent ( this.element, "blur", boundToggleSelectionChangeEvent ) ;
				boundToggleSelectionChangeEvent ( event ) ;
			}
		} else {
			addEvent ( this.element, "propertychange", bind ( this.checkForValuePropertyChange, this ) ) ;
		}

		// Check for arrow navigation and enter/tab key presses.
		addEvent ( this.element, "keydown", bind ( this.performKeyAction, this ) ) ;
	} ; // End of addInputListeners.

	// Toggles the selectionchange event listener for IE9.
	AutocompleteProto.toggleSelectionChangeEvent = function ( event ) {
		// This is a workaround for MSIE 9's incomplete oninput event implementation.
		if ( event.type === "focus" ) {
			addEvent ( document, "selectionchange", this.boundCheckValue ) ;
		} else {
			removeEvent ( document, "selectionchange", this.boundCheckValue ) ;
		}
	} ; // End of toggleSelectionChangeEvent.

	// Checks for value property changes (for older IE versions).
	AutocompleteProto.checkForValuePropertyChange = function ( ) {
		// Simulates oninput event for MSIE < 9.
		if ( this.elementHasFocus && window.event.propertyName === "value" ) {
			this.checkValue ( window.event ) ;
		}
	} ; // End of checkForValuePropertyChange.

	// Checks the input value and triggers a match.
	AutocompleteProto.checkValue = function ( event ) {
		var newValue = this.element.value ,
		    lastValue = this.lastValue ,
		    delay ;

		if ( newValue !== lastValue ) {
			this.matchValue ( newValue ) ;

			// Trigger onInput callback instantly or after a delay.
			if ( ( delay = this.options.onInputDelay ) > 0 ) {
				if ( this.lastOnInputValue === null ) {
					this.lastOnInputValue = lastValue ;
				}
				this.delayTimer = ( this.delayTimer ) ? window.clearTimeout ( this.delayTimer ) : null ;
				this.delayTimer = window.setTimeout ( bind ( function ( ) {
					this.options.onInput.apply ( this, [ newValue, this.lastOnInputValue ] ) ;
					this.lastOnInputValue = null ;
				}, this ), delay ) ;
			} else {
				this.options.onInput.apply ( this, [ newValue, lastValue ] ) ;
			}
			this.lastValue = newValue ;
		}
	} ; // End of checkValue.

	// Matches the input value against available options.
	AutocompleteProto.matchValue = function ( val ) {
		var escapeRgx , matchResult , matchRgx , matchText , maxChoices , results ,
		    matches = [] , m = 0 ;

		if ( ! datalistSupported || ! this.options.useNativeInterface ) {
			if ( val && ! ( results = this.cache[ "r-" + val ] ) ) {
				// Find all matching values in the cached sorted list.
				escapeRgx = this.cache.escapeRgx || ( this.cache.escapeRgx = /([-.*+?^${}()|[\]\/\\])/g ) ;
				matchRgx = new RegExp ( "^(" + val.replace ( escapeRgx, "\\$1" ) + ".*)$", "igm" ) ;
				matchText = this.cache.values || ( this.cache.values = this.values.sort ( ).join ( "\n" ) ) ;
				maxChoices = this.options.maxChoices ;

				while ( ( matchResult = ( matchRgx.exec ( matchText ) || [] )[ 0 ] ) ) {
					if ( val !== matchResult ) {
						matches[ m ++ ] = matchResult ;
						if ( m === maxChoices ) { break ; }
					}
				}
				results = ( this.cache[ "r-" + val ] = matches ) ;
			}
			if ( results && results.length ) {
				this.showValues ( results ) ;
			} else {
				this.clearValues ( ) ;
			}
		}
	} ; // End of matchValue.

	// Performs actions based on key presses (e.g., navigation, selection).
	AutocompleteProto.performKeyAction = function ( event ) {
		var which = ( event = event || window.event ).which || event.keyCode ,
		    actionable = { 9 : 1, 13 : 1, 27 : 1, 38 : 1, 40 : 1 } ,
		    container , shownValuesLen ;

		if ( actionable[ which ] ) {
			// Handle TAB or ENTER key.
			if ( which === 9 || which === 13 ) {
				if ( this.highlightIdx > -1 ) {
					this.selectValue ( event ) ;
				} else if ( which === 13 && window.opera ) {
					window.setTimeout ( bind ( this.clearValues, this ), 0 ) ; // Opera bug workaround.
				} else {
					this.clearValues ( ) ;
				}

			// Handle ESC key.
			} else if ( which === 27 ) {
				this.clearValues ( ) ;

			// Handle DOWN or UP arrow keys.
			} else {
				if ( ( shownValuesLen = this.shownValues.length ) ) {
					if ( ( which === 38 && this.highlightIdx === 0 ) ||
					    ( which === 40 && this.highlightIdx === shownValuesLen - 1 ) ) {
						this.setHighlightedIndex ( -1 ) ;
					} else if ( which === 38 && this.highlightIdx === -1 ) {
						this.setHighlightedIndex ( shownValuesLen - 1 ) ;
					} else {
						this.setHighlightedIndex ( this.highlightIdx + ( ( which === 38 ) ? -1 : 1 ) ) ;
					}
				} else {
					this.checkValue ( event ) ;
				}
			}
		}
	} ; // End of performKeyAction.

	// Displays the given values as suggestions.
	AutocompleteProto.showValues = function ( values ) {
		var html = [] , h = 0 ,
		    rRgx = /</g ,
		    rStr = "&lt;" ,
		    len , i ;

		// Construct the HTML for the choices list.
		html[ h ++ ] = "<ul class='aList'>" ;
		for ( i = 0, len = values.length ; i < len ; i ++ ) {
			html[ h ++ ] = "<li data-idx='" + i + "' class='aLim'>" + values[ i ].replace ( rRgx, rStr ) + "</li>" ;
		}
		html[ h ++ ] = "</ul>" ;

		// Display the list and store the values.
		this.highlightIdx = -1 ;
		this.shownValues = values.concat ( ) ;
		this.container.innerHTML = html.join ( "" ) ;
	} ; // End of showValues.

	// Highlights a value in the suggestion list based on mouse/touch interaction.
	AutocompleteProto.highlightValue = function ( event ) {
		var target , targetClass , targetStyle , highlightIdx ;

		if ( this.usesTouch || ( this.throttle ++ ) & 1 ) {
			target = ( event = event || window.event ).target || event.srcElement ;
			targetClass = target.className || "" ;

			// Traverse up the DOM tree to find the suggestion item.
			while ( targetClass.indexOf ( "aLim" ) === -1 && targetClass !== "aCon" ) {
				targetClass = ( target = target.parentNode ).className || "" ;
			}
			if ( targetClass.indexOf ( "aLim" ) > -1 ) {
				if ( ( highlightIdx = parseInt ( target.getAttribute ( "data-idx" ) || -1, 10 ) ) > -1 ) {
					this.setHighlightedIndex ( highlightIdx ) ;
				}
			}
		}
	} ; // End of highlightValue.

	// Sets the highlighted index in the suggestion list.
	AutocompleteProto.setHighlightedIndex = function ( highlightIdx ) {
		var choices , choiceStyle ;

		if ( ( highlightIdx = Math.max ( -1, highlightIdx ) ) !== this.highlightIdx ) {
			if ( highlightIdx < this.shownValues.length ) {
				if ( highlightIdx > -1 || this.highlightIdx > -1 ) {
					choices = this.container.firstChild.children ;
				}

				// Apply highlighting to the new choice.
				if ( highlightIdx > -1 ) {
					( choiceStyle = choices[ highlightIdx ].style ).color = this.options.highlightColor ;
					choiceStyle.backgroundColor = this.options.highlightBgColor ;
				}

				// Remove highlighting from the previously selected choice.
				if ( this.highlightIdx > -1 ) {
					( choiceStyle = choices[ this.highlightIdx ].style ).color = "" ;
					choiceStyle.backgroundColor = "" ;
				}

				// Update the stored highlighted index.
				this.highlightIdx = highlightIdx ;
			}
		}
	} ; // End of setHighlightedIndex.

	// Selects a value from the suggestion list.
	AutocompleteProto.selectValue = function ( event ) {
		var eventType = ( event = event || window.event ).type.toLowerCase ( ) ,
		    returnFocus = eventType !== "keydown" || ( event.which || event.keyCode ) !== 9 ,
		    target , highlightIdx ;

		// If a mouse or touch event, check if clicking on an unselected value.
		if ( eventType.indexOf ( "mouse" ) > -1 || eventType.indexOf ( "touch" ) > -1 ) {
			if ( ( ( target = event.target || event.srcElement ).className || "" ).indexOf ( "aLim" ) > -1 ) {
				if ( ( highlightIdx = parseInt ( target.getAttribute ( "data-idx" ) || -1, 10 ) ) > -1 ) {
					this.highlightIdx = highlightIdx ;
				}
			}
		}

		// Set the input field's value to the selected suggestion.
		if ( this.highlightIdx > -1 ) {
			this.element.value = this.shownValues[ this.highlightIdx ] ;
			this.clearValues ( ) ;
		}
		if ( returnFocus ) {
			this.element.focus ( ) ;
			return stopEvent ( event ) ;
		}
	} ; // End of selectValue.

	// Clears the displayed suggestion values and resets related state.
	AutocompleteProto.clearValues = function ( ) {
		this.highlightIdx = -1 ;
		this.lastValue = "" ;
		this.shownValues = [] ;
		this.container.innerHTML = "" ;
	} ; // End of clearValues.

	// Adds new values to the autocomplete's dataset.
	AutocompleteProto.addValues = function ( values ) {
		var currentValues , cLen , c ;

		if ( values && values.length ) {
			cLen = c = ( currentValues = this.values ).length ;
			for ( var i = 0, value ; ( value = values[ i ] ) !== undefined ; i ++ ) {
				if ( value && indexOf ( currentValues, value ) === -1 ) {
					currentValues[ c ++ ] = value ;
				}
			}

			if ( c > cLen ) {
				this.refresh ( ) ;
			}
		}
	} ; // End of addValues.

	// Removes values from the autocomplete's dataset.
	AutocompleteProto.removeValues = function ( values ) {
		var currentValues , cLen , c , idx ;

		if ( values && values.length ) {
			cLen = c = ( currentValues = this.values ).length ;
			for ( var i = 0, value ; ( value = values[ i ] ) !== undefined ; i ++ ) {
				if ( value && ( idx = indexOf ( currentValues, value ) ) > -1 ) {
					currentValues.splice ( idx, 1 ) ;
				}
			}

			if ( currentValues.length < cLen ) {
				this.refresh ( ) ;
			}
		}
	} ; // End of removeValues.

	// Refreshes the autocomplete's internal state and displayed suggestions.
	AutocompleteProto.refresh = function ( ) {
		this.cache = {} ;

		if ( datalistSupported && this.options.useNativeInterface ) {
			this.container.innerHTML = this.generateDatalistOptionsHtml ( ) ;
		} else if ( this.highlightIdx === -1 ) {
			this.matchValue ( this.lastValue ) ;
		}
	} ; // End of refresh.

	////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	//                                   Utility Methods for Autocomplete
	//
	////////////////////////////////////////////////////////////////////////////////////////////////////
	var getIEVersion = function ( ) {
		var nav , version ;

		if ( ( nav = navigator ).appName === "Microsoft Internet Explorer" ) {
			if ( new RegExp ( "MSIE ([0-9]{1,}[\.0-9]{0,})" ).exec ( nav.userAgent ) ) {
				version = parseFloat ( RegExp.$1 ) ;
			}
		}