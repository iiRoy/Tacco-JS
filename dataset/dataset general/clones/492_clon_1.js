/*
 * This JavaScript module provides search functionality for deck.js presentations.
 * It allows users to search within slides and navigate to results.
 * @author Markus Ahonen, available at https://github.com/markahon for more details.
 */
( function ( $, deck ) {

	// Declare local variables for document and container.
	var $d = $( document ),
	    $cont;

	// Internal setting name for search configuration.
	var searchSettings = 'search';

	/*
	 * Default configuration options for the deck.search.js plugin.
	 * These can be overridden by passing options to showSearch().
	 */
	var defaults = {

		slideTitleSelectors: 'header, h1, h2, h3, h4', // Selectors to find slide titles for search results.
		useGo              : true,                     // Whether to use deck.js's 'go' function for navigation.

		container : {                                  // Settings for the main search container.
			target       : 'body',                     // Where to append the search container.
			id           : 'ds_container',             // Unique ID for the container element.
			styleDefault : {                           // Default CSS styles for the container.
				position   : 'fixed',
				top        : '0',
				left       : '0',                      /* Positioned at top-left. */
				background : 'none',
				border     : 'none',
				padding    : '0.4em',
				'font-size': '12pt',
				'z-index'  : '10',
				overflow   : 'auto'
			},
			styleWithResults : {                       // Styles applied when search results are present.
				background : '#fff',
				border     : '1px solid #aaa',
				'border-left': 'none',
				'border-top': 'none'
			}
		},

		hint : {                                       // Settings for the search hint text.
			show : true,                               // Display the hint.
			id   : 'ds_hint',                          // Unique ID for the hint element.
			text : "(Hint: Press 'F' to search)",      // The actual hint message.
			style: {                                   // CSS styles for the hint.
				'font-style': 'italic',
				color       : '#000',
				background  : '#fff',
				opacity     : '0.5',
				padding     : '0.2em'
			}
		},

		input : {                                      // Settings for the search input field.
			id          : 'ds_input',                  // Unique ID for the input element.
			styleInactive: {                           // CSS styles when the input is inactive/blurred.
				outline: 'none',
				width  : '3.3em'
			},
			styleActive : {                            // CSS styles when the input is active/focused.
				outline: 'none',
				width  : 'auto'
			}
		},

		results : {                                    // Settings for the search results display.
			id         : 'ds_results',                 // Unique ID for the results container.
			resultClass: 'searchResult',               // CSS class for individual result items.
			hitsStyle  : 'font-style: italic; font-size: 80%; color: #888;' // Inline style for hit count.
		},

		keys : {                                       // Keyboard shortcut key codes.
			focusSearch   : 70,                        // 'f' key to focus the search box.
			blurSearch    : 27,                        // 'esc' key to blur the search box.
			navigateToResult: 13                       // 'enter' key to navigate to the first result.
		}
	};

	// Merge deck.search defaults into the main deck.js defaults.
	$[ deck ].defaults[ searchSettings ] = {};
	$.extend( true, $[ deck ].defaults[ searchSettings ], defaults );


	/*
	 * Function to remove the search interface from the document.
	 * This cleans up event handlers and DOM elements.
	 */
	function removeSearch() {
		$d.unbind( '.decksearch' ); // Unbind all decksearch-namespaced events.
		if ( $cont ) {
			$cont.remove();         // Remove the main container if it exists.
		}
		$( '#' + defaults.container.id ).remove(); // Ensure the container is removed by ID as well.
	}


	/*
	 * Function to display and initialize the search interface.
	 * Accepts an optional options object to override default settings.
	 * @param {object} options - Optional settings to override defaults.
	 */
	function showSearch( options ) {
		var $hint,
		    $input,
		    $results;

		// Merge provided options with current settings.
		var settings = $.extend( true, $[ deck ].defaults[ searchSettings ], options );

		/*
		 * First, remove any existing search instances to prevent duplicates
		 * or stale state if this function is called multiple times.
		 */
		removeSearch();


		/*
		 * Initialize the main search container element.
		 * It will hold the hint, input field, and results.
		 */
		$cont = $( '<div id="' + settings.container.id + '" />' )
			.css( settings.container.styleDefault )
			.bind( 'focusin', function () {
				if ( $hint ) {
					$hint.remove(); // Remove hint when search container is focused.
					$hint = null;
				}
				$input.css( settings.input.styleActive ); // Apply active style to input.
			} )
			.bind( 'focusout', function () {
				$input.removeAttr( 'placeholder' ); // Remove placeholder when focus leaves.
				if ( ! $results.html() ) {          // If no results, revert input and container styles.
					$input.css( settings.input.styleInactive );
					$cont.css( settings.container.styleDefault );
				}
			} );


		/*
		 * Add the hint text to the container if enabled in settings.
		 */
		if ( settings.hint.show ) {
			$hint = $( '<div id="' + settings.hint.id + '">' + settings.hint.text + '</div>' )
				.css( settings.hint.style )
				.appendTo( $cont );
		}


		/*
		 * Initialize the search input field.
		 * Set attributes and attach event handlers for search logic.
		 */
		$input = $( '<input id="' + settings.input.id + '" type="search" results="5" autocomplete="on" placeholder="Search..." />' )
			.css( settings.input.styleInactive )
			/*
			 * Handle keyboard events within the search field.
			 * Keydown/keypress are stopped, keyup triggers the search.
			 */
			.bind( 'keyup keydown keypress', function ( event ) {
				// Prevent event propagation to avoid conflicts with deck.js navigation.
				event.stopPropagation();

				// Only process on keyup to ensure final input value is available.
				if ( event.type !== 'keyup' ) {
					return;
				}

				var searchString = $( this ).val();
				var links        = []; // Array to hold generated result links.

				if ( searchString.length ) {
					var regex = new RegExp( searchString, 'img' ); // Case-insensitive, global regex.

					$( '.slide' ).each( function ( i, n ) {
						var $slide       = $( this );
						var hits         = $slide.text().match( regex );
						var title        = "";
						var details      = "";
						var resultStyle  = "";

						var $parentSlide = $slide.parent().closest( '.slide' );

						if ( ! $parentSlide.length ) {
							resultStyle = 'margin: 0.5em 0 0;';
							// For main slides, extract and truncate the title.
							title = $slide.children( settings.slideTitleSelectors ).first().text();
							if ( title.length > 25 ) {
								title = title.substring( 0, 22 ) + "...";
							}
						} else {
							// Indent child slides in the results list.
							resultStyle += 'margin: 0 0 0 0.5em;';
						}

						if ( hits ) {
							details = [ '(', hits.length, ' hit', ( hits.length > 1 ? 's' : '' ), ')' ].join( '' );
						} else {
							details = '(slide #' + i + ')';
						}

						// Construct the HTML for each search result.
						links.push( [
							'<div class="', settings.results.resultClass, '" style="', resultStyle, '">',
							'<a id="result', i, '" href="#', this.id, '"><span style="font-weight: bold;">', title, '</span>', ( title ? '<br>' : '' ), '#', this.id, '</a> ',
							'<span style="', settings.results.hitsStyle, '">', details, '</span>',
							'</div>'
						].join( '' ) );
					} );

					if ( ! links.length ) {
						links.push( '(no results)' ); // Display message if no results found.
					}
				}

				var resultsHTML = links.join( '' );
				// Adjust container style based on whether results are present.
				$cont.css( resultsHTML ? settings.container.styleWithResults : settings.container.styleDefault );
				$cont.css( { 'max-height': $( window ).height() } ); // Ensure container fits within window height.

				$results.html( resultsHTML ); // Update results display.


				/*
				 * Handle keyboard actions: navigate to result or blur search.
				 */
				var key = event.keyCode || event.which;
				if ( key === settings.keys.navigateToResult ) {
					$results.find( 'a:first' ).click(); // Simulate click on the first result link.
				} else if ( key === settings.keys.blurSearch ) {
					$( this ).blur(); // Blur the input field.
				}
			} )
			/*
			 * Clear results when the "empty this input" icon (in some browsers) is clicked.
			 */
			.bind( 'click', function () {
				if ( ! $( this ).val().length ) {
					$results.empty();
				}
			} )
			.appendTo( $cont );


		/*
		 * Document-level event handlers for search focus and blur.
		 */
		$d.bind( 'keyup.decksearch', function ( event ) {
			var key = event.keyCode || event.which;
			if ( key === settings.keys.focusSearch ) {
				$input.removeAttr( 'placeholder' ); // Remove placeholder before focusing.
				$input.focus();                     // Focus the search input.
			}
		} )
		/*
		 * If a click occurs outside the search container, clear the search.
		 */
		.bind( 'click', function ( event ) {
			if ( ! $( event.target ).closest( '#' + settings.container.id ).length ) {
				$input.val( '' ).trigger( 'click' ); // Clear input and trigger click to refresh results.
				$cont.trigger( 'focusout' );         // Trigger focusout on container.
			}
		} );


		/*
		 * Initialize the results list container.
		 * Attach delegate event handlers for clicks and keyboard navigation on result links.
		 */
		$results = $( '<div id="' + settings.results.id + '" />' )
			.delegate( 'a', 'click', function () {
				if ( settings.useGo ) {
					// Navigate using deck.js 'go' function for better integration.
					var index = this.id.match( /\d*$/ )[ 0 ];
					$.deck( 'go', parseInt( index, 10 ) );
					return false; // Prevent default link behavior.
				}
			} )
			.delegate( 'a', 'keyup keydown keypress', function ( event ) {
				var key = event.keyCode || event.which;
				if ( key && key != 13 && key != 32 ) {
					// Allow non-Enter/Space keys to pass through normally.
					return;
				}

				// Stop event propagation to prevent conflicts with deck.js.
				event.stopPropagation();

				// Only process on keyup.
				if ( event.type !== 'keyup' ) {
					return;
				}

				// Simulate a click for Enter/Space keyups on result links.
				$( this ).click();
				return false;
			} )
			/*
			 * Hide results if ESC is pressed while focused on the results list.
			 */
			.bind( 'keyup', function ( event ) {
				var key = event.keyCode || event.which;
				if ( key === settings.keys.blurSearch ) {
					$input.val( '' ).trigger( 'click' ); // Clear input and results.
					$cont.trigger( 'focusout' );         // Trigger focusout.
				}
			} )
			.appendTo( $cont ); // Add results container to the main search container.

		/*
		 * Handle window resize events to adjust the maximum height of the search container.
		 * This ensures the container always fits within the visible window.
		 */
		$( window ).bind( 'resize', function () {
			$cont.css( { 'max-height': $( window ).height() } );
		} );

		/*
		 * Finally, append the entire search container to its target element in the document.
		 */
		$cont.appendTo( settings.container.target );
	}


	// Extend the deck.js API with our search functions.
	$[ deck ]( 'extend', 'showSearch', showSearch );
	$[ deck ]( 'extend', 'removeSearch', removeSearch );

	// Bind the showSearch function to the deck.init event, so search is available by default.
	$d.bind( 'deck.init', showSearch );

	// When the DOM is ready, set the font-family of the search container
	// to match the first slide's font-family for visual consistency.
	$( function () {
		$.extend( true, $.deck.defaults.search.container.styleDefault, { 'font-family': $( '.slide:first' ).css( 'font-family' ) } );
	} );

} )( jQuery, 'deck' ); // Pass jQuery and 'deck' alias into the immediately invoked function expression.