/*******************************************************************************
 * doubleSuggest - jQuery Plugin for Dual-Source Typeahead Suggestions
 *
 * @Version: 0.3.0
 * @Author: hernantz (Hernan Garcia)
 * @Url:    http://www.github.to/hernantz/doubleSuggest
 * @License: MIT - http://www.opensource.org/licenses/mit-license.php
 *
 * This jQuery plugin orchestrates a user interface that provides real-time
 * suggestions as a user types into an input field. It's designed to display
 * two categories of suggestions:
 *   1. Local Data Suggestions: Faster, drawn from client-side data.
 *   2. Remote (AJAX) Suggestions: Fetched from a server-side query.
 *
 * Requires jQuery version 1.7 or newer for full compatibility.
 ******************************************************************************/

;(function( $ ) {

	// Define all the methods for the doubleSuggest plugin.
	var methods = {

		// The initialization method for the plugin.
		init: function ( options ) {

			// Iterate over each selected element to apply the plugin.
			return this.each( function( index, element ) {

				// Merge user-provided options with the plugin's default settings.
				var opts = $.extend( {}, $.fn.doubleSuggest.defaultOptions, options );

				// Get the current input element and assign a specific class.
				var $input = $( this ).addClass( 'ds-input' );

				// Retrieve the ID of the input element to ensure unique container IDs.
				var input_id = $input.attr( 'id' );

				// Create the main container for doubleSuggest, wrapping the input.
				var $dsContainer = $( '<div class="ds-container" id="ds-container-' + input_id + '"></div>' );
				$input.wrap( $dsContainer ); // Wrap the input with the new container.

				// Create the results holder div, initially hidden.
				var $resultsHolder = $( '<div class="ds-results" id="ds-results-' + input_id + '"></div>' ).hide();
				$input.after( $resultsHolder ); // Insert the results holder after the input.

				// Create the unordered list (UL) for search results and messages.
				// Set its width to match the input field.
				var $resultsUL = $( '<ul class="ds-list"></ul>' ).css( 'width', $input.outerWidth() ).appendTo( $resultsHolder );

				// Internal variable to store the text currently typed by the user.
				var currentValue = $.trim( $input.val() );

				// Timer variable for debouncing keyup events.
				var timeout = null;

				// Variable to hold the XMLHTTPRequest object for AJAX calls, allowing abortion.
				var jqxhr = null;

				// Bind various event handlers to the input field.
				$input.on( {
					"focus.doubleSuggest": function( e ) {
						// When the input gains focus, show the results list if there's text.
						if ( $.trim( $input.val() ) !== '' ) {
							$resultsHolder.show();
						}
					},
					"keydown.doubleSuggest": function( e ) {

						// Store the key code of the last pressed key.
						var lastKey = e.keyCode;

						// Handle different key presses.
						switch ( lastKey ) {

							// Up (38) and Down (40) arrow keys for navigation.
							case 38:
							case 40:

								e.preventDefault(); // Prevent default scroll behavior.
								if ( lastKey === 38 ) {
									spotResult( 'up' ); // Move selection up.
								} else {
									spotResult( 'down' ); // Move selection down.
								}
								break;

							// Delete (8) key.
							case 8:

								// If only one character remains, hide the results.
								if ( $input.val().length === 1 ) {
									$resultsHolder.hide();
								}

								// Trigger a new search after a short delay.
								refreshSearch();
								break;

							// Tab (9) or Enter (13) keys.
							case 9:
							case 13:

								var nInput = $.trim( $input.val() );
								if ( nInput !== '' && nInput.length >= opts.minChars ) {

									// If there are visible results and an active selection,
									// prevent form submission and trigger the 'select' event on the active item.
									if ( $( 'li.ds-result-item:visible', $resultsHolder ).length > 0 && $( 'li.active:first', $resultsUL ).length > 0 ) {
										$( 'li.active:first', $resultsUL ).trigger( 'select' );
										e.preventDefault(); // Stop default tab/enter action.
									}
									/*
                                    // TODO: Consider implementing a feature for adding new items here.
									else { // No results found, but tab/enter was pressed.

										// Check if adding new items is allowed by options.
										if ( opts.newItem ) {

											// Call the custom newItem function to get formatted data.
											var nData = opts.newItem.call( this, nInput );

											// Hide the results list.
											$resultsHolder.hide();

											// Clear the input field.
											$input.val( '' );
										}
									}
                                    */
								}
								break;

							// Escape (27) key.
							case 27:
								clearAjaxRequest(); // Abort any ongoing AJAX requests.
								$resultsHolder.hide(); // Hide the results list.
								break;

							default:

								// Ignore certain special keys (Delete, Shift, CapsLock).
								if ( lastKey === 46 || ( lastKey > 9 && lastKey < 32 ) ) {
									$resultsHolder.hide(); // Hide if these keys are pressed.
								} else {
									// For other keys, trigger a search after the configured delay.
									refreshSearch();
								}
								break;
						}
					},
					"blur.doubleSuggest": function( e ) {

						// If the results holder is not being hovered, hide it and restore input value.
						if ( !( $resultsHolder.is( ':hover' ) ) ) {
							$input.val( currentValue ); // Revert to the last confirmed value.
							$resultsHolder.hide();
						}
					},
					"refresh.doubleSuggest": function( e, newValue ) {
                        // Custom event to programmatically trigger a new search.
                        refreshSearch();
                    },
					"setValue.doubleSuggest": function( e, newValue ) {
                        // Custom event to update the input's value programmatically.
                        currentValue = newValue; // Update internal value.
                        $input.val( newValue );  // Update input field.
                    },
					"updateOptions.doubleSuggest": function( e, newOptions ) {
						// Custom event to refresh the plugin's options.
						opts = $.extend( $.fn.doubleSuggest.defaultOptions, options, newOptions );
					},
					"destroy.doubleSuggest": function( e ) {
						// Custom event to clean up and remove the plugin's elements and bindings.
						$resultsHolder.remove(); // Remove the results container.
						$input.val( '' ).removeClass( 'ds-input' ).unbind( '.doubleSuggest' ).unwrap(); // Unbind events, remove class, unwrap.
					}
				} );

				// Helper function to abort any active AJAX requests.
				function clearAjaxRequest() {
					if ( jqxhr ) {
						jqxhr.abort(); // Abort the request if it exists.
					}
				}

				// Helper function to debounce the search initiation.
				function refreshSearch() {
					if ( timeout ) {
						clearTimeout( timeout ); // Clear any existing timeout.
					}
					timeout = setTimeout( keyChange, opts.keyDelay ); // Set a new timeout.
				}

				// This function is executed after the key delay timeout.
				function keyChange() {

					// Get the current text from the input, clean it (remove slashes, normalize whitespace).
					var string = $.trim( $input.val() ).replace( /[\\]+|[\/]+/g, "" ).replace( /\s+/g, " " );

					// Store the cleaned string as the current value.
					currentValue = string;

					// Proceed only if the input string meets the minimum character requirement.
					if ( string.length >= opts.minChars ) {

						// Call a custom 'beforeRetrieve' function if provided, allowing modification of the search string.
						if ( opts.beforeRetrieve ) {
							string = opts.beforeRetrieve.call( this, string );
						}

						// Add a 'loading' class to the input and display a loading message.
						$input.addClass( 'loading' );
						if ( opts.loadingText ) {
							$resultsUL.html( '<li class="ds-message">' + opts.loadingText + '</li>' ).show();
						}
						$resultsHolder.show(); // Ensure results holder is visible.

						// If a remote source (URL) is defined, make an AJAX request.
						if ( opts.remoteSource ) {
							clearAjaxRequest(); // Abort any previous AJAX request.
							var queryParam = {};
							queryParam[ opts.queryParam ] = string; // Set the query parameter.
							jqxhr = $.getJSON( opts.remoteSource, $.extend( {}, queryParam, opts.extraParams ), function( response ) {
								processData( response, string, false ); // Process remote data.
							} );
						}

						// If a local source (object) is defined, process it directly.
						if ( opts.localSource ) {
							processData( opts.localSource, string, true ); // Process local data.
						}

					} else {
						// If minChars requirement is not met, hide results.
						//$input.removeClass('loading'); // Optionally remove loading class.
						$resultsHolder.hide();
					}
				}

				// Function to handle navigation (up/down arrow keys) within results.
				function spotResult( dir ) {

					// Check if there are any visible result items.
					if ( $( 'li.ds-result-item:visible', $resultsHolder ).length > 0 ) {

						// Get all list items within the results holder.
						var $lis = $( 'li', $resultsHolder );

						// Determine the initial item to spot based on direction.
						var $spot = dir === 'down' ? $lis.eq( 0 ) : $lis.filter( ':last' );

						// If an item is already active, use it as the base for next/prev.
						var $active = $( 'li.active:first', $resultsHolder );
						if ( $active.length > 0 ) {
							$spot = dir === 'down' ? $active.next() : $active.prev();
						}

						// Remove 'active' class from all, then add to the current spotted item.
						$lis.removeClass( 'active' );
						$spot.addClass( 'active' );

						// Call the custom onResultFocus callback if an item is spotted.
						if ( $spot.length > 0 ) {
							opts.onResultFocus.call( $input, $spot.data() );
						}

						// Update the input field with the text of the selected item,
						// or revert to the user's typed value if no item is selected.
						var newText = $spot.length > 0 ? $spot.data()[ opts.selectValue ] : currentValue;
						$input.val( newText );
					}
				}

				// Bind click and mouseover events to result items within the results holder.
				$resultsHolder.on( {
					click: function( e ) {
						// On click, trigger the 'select' event for the item.
						$( this ).trigger( "select" );
					},
					mouseover: function( e ) {
						// On mouseover, activate the hovered item.
						$( 'li', $resultsUL ).removeClass( 'active' ); // Deactivate others.
						$( this ).addClass( 'active' ); // Activate current.

						// Call the custom onResultFocus callback.
						opts.onResultFocus.call( $input, $( this ).data() );
					},
					select: function( e ) {

						var $elem = $( this ); // The selected element.
						var data = $elem.data(); // Its associated data.
						currentValue = data[ opts.selectValue ]; // Update current value.
						$input.val( currentValue ); // Set input value.

						opts.onSelect.call( $input, data, $elem ); // Call custom onSelect.
						$resultsUL.html( '' ); // Clear results list.
						$resultsHolder.hide(); // Hide results holder.
					}
				}, ".ds-result-item" ); // Delegate events to '.ds-result-item' children.

				// Function to process retrieved data and display results.
				function processData ( data, queryString, isLocal ) {

					// Call retrieveComplete to allow data modification before processing.
					var data = opts.retrieveComplete.call( this, data, queryString, isLocal ),
						props = opts.seekValue.split( ',' ), // Array of properties to search within.
						matchCount = 0, // Counter for matched results.
						i = 0; // Loop index.

					// Clean and hide the results container. This removes old results and loading messages.
					// Local results are typically faster, but even if local results are disabled,
					// cleanup should occur.
					if ( isLocal || !opts.localSource ) {
						$resultsUL.html( '' ); // Clear the UL.
						$resultsHolder.hide(); // Hide the holder.
					}

					// Loop through each item in the data source.
					for ( var k in data ) {

						if ( data.hasOwnProperty( k ) ) {

							// Build a searchable string from the 'seekValue' properties of the current item.
							var str = '';
							for ( var y = 0; y < props.length; y++ ) {
								str = str + ( data[ i ][ $.trim( props[ y ] ) ] !== undefined ? data[ i ][ $.trim( props[ y ] ) ] : '' );
							}

							// If case-insensitive search, convert both strings to lowercase.
							if ( !opts.matchCase ) {
								str = str.toLowerCase();
								queryString = queryString.toLowerCase();
							}

							// Split the query string into individual words.
							var queryWords = queryString.split( ' ' );

							// Check if any query word matches the item's searchable string.
							var matched = false;
							for ( var w in queryWords ) {
								if ( queryWords.hasOwnProperty( w ) ) {
									if ( str.search( queryWords[ w ] ) !== -1 ) {
										matched = true;
										break; // Found a match, no need to check further words.
									}
								}
							}

							// If a match is found.
							if ( matched === true ) {
								// Attach data source (local/remote) and a unique number for the match.
								data[ i ][ '_dataSource' ] = isLocal ? 'local' : 'remote';
								data[ i ][ '_number' ] = matchCount;

								// Create a new LI element for the result and store its data.
								var resultLI = $( '<li class="ds-result-item" id="ds-result-item-' + i + '"></li>' ).data( data[ i ] );
								var resultData = $.extend( {}, data[ i ] ); // Create a copy for highlighting.

								// If results highlighting is enabled.
								if ( opts.resultsHighlight ) {
									for ( var w in queryWords ) {
										if ( queryWords.hasOwnProperty( w ) ) {

											// Determine regex case sensitivity.
											var cType = !opts.matchCase ? 'gi' : 'g';
											// Create a regex to find and highlight query words.
											var regx = new RegExp( '(?![^&;]+;)(?!<[^<>]*)(' + queryWords[ w ] + ')(?![^<>]*>)(?![^&;]+;)', '' + cType + '' );

											// Apply highlighting to the display value.
											resultData[ opts.selectValue ] = resultData[ opts.selectValue ].replace( regx, "<em>$1</em>" );
										}
									}
								}

								// Call the formatList function or use default HTML for the LI element.
								var $elem = opts.formatList ? opts.formatList.call( $input, resultData, resultLI ) : resultLI.html( resultData[ opts.selectValue ] );
								$resultsUL.append( $elem ); // Add the formatted element to the results list.

								// Increment the match counter.
								matchCount++;

								// Check if the query limit has been reached.
								if ( opts.queryLimit && opts.queryLimit === matchCount ) {
									break; // Stop processing further results.
								}
							}

							i++; // Move to the next data item.
						}
					}

					// All results processed, remove the loading state from the input.
					$input.removeClass( 'loading' );

					// If no results were found and emptyText is defined, display the message.
					if ( matchCount <= 0 && opts.emptyText ) {
						$resultsUL.html( '<li class="ds-message">' + opts.emptyText + '</li>' );
					}

					// Finally, show the results list.
					$resultsHolder.show();

					// Call the custom resultsComplete function.
					opts.resultsComplete.call( this );
				}
			} );
		},

		// Method to programmatically refresh the search.
		refresh: function() {
			return this.each( function( index, element ) {
				$( this ).trigger( "refresh.doubleSuggest" ); // Trigger custom refresh event.
			} );
		},

		// Method to programmatically set the input's value.
		setValue: function( value ) {
			return this.each( function( index, element ) {
				$( this ).trigger( "setValue.doubleSuggest", value ); // Trigger custom setValue event.
			} );
		},

		// Method to update plugin options dynamically.
		update: function( options ) {
			return this.each( function( index, element ) {
				$( this ).trigger( "updateOptions.doubleSuggest", options ); // Trigger custom updateOptions event.
			} );
		},

		// Method to destroy the plugin instance and clean up.
		destroy: function() {
			return this.each( function( index, element ) {
				$( this ).trigger( "destroy.doubleSuggest" ); // Trigger custom destroy event.
			} );
		}
	};

	// The main plugin entry point.
	$.fn.doubleSuggest = function( args ) {
		// Check if the passed argument is a method name.
		if ( methods[ args ] ) {
			// Call the method with arguments.
			return methods[ args ].apply( this, Array.prototype.slice.call( arguments, 1 ) );
		}
		// If no arguments or an object (options) is passed, call the init method.
		else if ( typeof args === 'object' || !args ) {
			return methods.init.apply( this, arguments );
		}
		// Handle invalid arguments.
		else {
			$.error( 'Invalid arguments ' + args + ' on jQuery.doubleSuggest' );
		}
	};

	// Define the default options for the doubleSuggest plugin.
	$.fn.doubleSuggest.defaultOptions = {
		localSource: false, // Default: no local data source.
		remoteSource: false, // Default: no remote data source (URL).
		emptyText: false, // Default: no message for empty results.
		loadingText: 'Loading...', // Text displayed during data retrieval.
		newItem: false, // Default: cannot add new items.
		selectValue: 'name', // Property name to display in results and set as input value.
		seekValue: 'name', // Comma-separated property names to search within.
		queryParam: 'q', // Name of the parameter for the search string in AJAX requests.
		queryLimit: false, // Default: no limit on the number of results.
		extraParams: {}, // Additional key-value pairs for AJAX requests.
		matchCase: false, // Default: case-insensitive search.
		minChars: 1, // Minimum characters required before a search begins.
		keyDelay: 500, // Delay in milliseconds after keydown before searching.
		resultsHighlight: true, // Default: highlight matched text in results.
		onSelect: function( data ) {
		}, // Callback after a result is selected.
		onResultFocus: function( data ) {
		}, // Callback when a result is focused (mouseover/arrow keys).
		formatList: false, // Custom function to format each list item.
		beforeRetrieve: function( string ) {
			return string;
		}, // Callback before data retrieval, can modify search string.
		retrieveComplete: function( data, queryString, isLocal ) {
			return data;
		}, // Callback after data retrieved, before processing, can modify data.
		resultsComplete: function() {
		} // Callback when the suggestion dropdown is made visible.
	};

})( jQuery ); // Pass jQuery object to the IIFE.