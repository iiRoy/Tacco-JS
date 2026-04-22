/*
 * pairedHint
 *
 * @Revision: 0.3
 * @Creator: hernantz
 * @Webpage: http://www.github.to/hernantz/doubleSuggest
 * @License: MIT - http://www.opensource.org/licenses/mit-license.php
 *
 * This _jq plugin establishes a user interface that presents dynamic suggestions as the user types.
 * It provides two distinct categories of suggestions: initially, local dataset matches (which are
 * generally faster) and subsequently, results fetched from an asynchronous data request.
 * Requires _jq version 1.7 or newer.
 */

;( function( _jq ) {

  var utilityFunctions = {
    initializePlugin: function( configSettings ) {

      // Traverse through the current collection of matched DOM elements.
      return this.each( function( itemIdx, currentElement ) {

        // Combine the provided configuration with the default options.
        var currentSettings = _jq.extend( {}, _jq.fn.pairedHint.defaultOptions, configSettings );

        // Acquire the text input element and its unique ID for potential multiple plugin instances.
        var txtInput = _jq( this ).addClass( 'ph-input-field' );
        var txtInputId = txtInput.attr( 'id' );

        // Create the global container for selected items or the input itself.
        var hintWrapper = _jq( '<div class="ph-outer-wrapper" id="ph-outer-wrapper-' + txtInputId + '"></div>' );
        txtInput.wrap( hintWrapper );

        // Initialize the div that will enclose all search results or informational messages.
        var hintDisplayArea = _jq( '<div class="ph-result-panel" id="ph-result-panel-' + txtInputId + '"></div>' ).hide();
        txtInput.after( hintDisplayArea );

        // Define the unordered list where all search suggestions and messages will be placed.
        var hintList = _jq( '<ul class="ph-suggestion-list"></ul>' ).css( 'width', txtInput.outerWidth() ).appendTo( hintDisplayArea );

        // Internally stores the last text string entered by the user.
        var previousInputText = _jq.trim( txtInput.val() );

        // Holds the identifier for the delayed execution timer.
        var delayTimer = null;

        // Stores the active XMLHTTPRequest object for potential cancellation.
        var ajaxRequestHandle = null;

        // Attach event listeners to the input field.
        txtInput.on({
          "focus.pairedHint": function( eventObj ) {
            // Reveal the suggestions list if the input field contains any value.
            if ( _jq.trim( txtInput.val() ) !== '' ) { hintDisplayArea.show(); }
          },
          "keydown.pairedHint": function( eventObj ) {

            // Capture the key code of the last key pressed.
            var keyPressCode = eventObj.keyCode;

            switch ( keyPressCode ) {

              // Up (38) and Down (40) arrow keys were pressed.
              case 38:
              case 40:

                eventObj.preventDefault();
                if ( keyPressCode === 38 ) {
                  highlightSuggestion( 'upward' );
                } else {
                  highlightSuggestion( 'downward' );
                }
                break;

              // Backspace (8) key was pressed.
              case 8:

                // If only one character remains, hide the suggestions panel.
                if ( txtInput.val().length === 1 ) { hintDisplayArea.hide(); }

                // Re-trigger the search process after the configured delay.
                reinitiateLookup();
                break;

              // Tab (9) or Enter (13) keys were pressed.
              case 9:
              case 13:

                var enteredText = _jq.trim( txtInput.val() );
                if ( enteredText !== '' && enteredText.length >= currentSettings.minimumCharacters ) {

                  // Prevent default browser behavior (e.g., form submission) if a suggestion is active.
                  if ( _jq( 'li.ph-suggestion-entry:visible', hintDisplayArea ).length > 0 && _jq( 'li.current-selection:first', hintList ).length > 0 ) {
                    _jq( 'li.current-selection:first', hintList ).trigger( 'select' );
                    eventObj.preventDefault();
                  }
                  // TODO: Consider implementing functionality for adding new items.
                  /*else { // Tab or Enter pressed without any active suggestions.

                    // If creating new entries is permitted.
                    if ( currentSettings.allowNewEntry ) {

                      // Obtain the formatted object for the new item.
                      var newDataItem = currentSettings.allowNewEntry.call( this, enteredText );

                      // Conceal the suggestions list.
                      hintDisplayArea.hide();

                      // Clear the text input field.
                      txtInput.val( '' );
                    }
                  }*/
                }
                break;

              // Escape (27) key was pressed.
              case 27:
                cancelPendingHttpRequest();
                hintDisplayArea.hide();
                break;

              default:

                // Disregard specific non-character keys: [delete] [shift] [capslock] etc.
                if ( keyPressCode === 46 || ( keyPressCode > 9 && keyPressCode < 32 ) ) {
                  hintDisplayArea.hide();
                } else {
                  // For other key presses, invoke the input change handler after a delay.
                  reinitiateLookup();
                }
                break;
            }
          },
          "blur.pairedHint": function( eventObj ) {

            // If the user's mouse is no longer interacting with the results panel, hide it.
            if ( !( hintDisplayArea.is( ':hover' ) ) ) {
              txtInput.val( previousInputText );
              hintDisplayArea.hide();
            }
          },
          "refresh.pairedHint": function( eventObj, freshValue ) {
            // Programmatically triggers a new search operation.
            reinitiateLookup();
          },
          "setValue.pairedHint": function( eventObj, freshValue ) {
            // Programmatically updates the input field's content, often from external scripts.
            previousInputText = freshValue;
            txtInput.val( freshValue );
          },
          "updateOptions.pairedHint": function( eventObj, freshConfiguration ) {
            // Re-evaluates and updates the plugin's configuration settings.
            currentSettings = _jq.extend( _jq.fn.pairedHint.defaultOptions, configSettings, freshConfiguration );
          },
          "destroy.pairedHint": function( eventObj ) {
            hintDisplayArea.remove();
            txtInput.val( '' ).removeClass( 'ph-input-field' ).unbind( '.pairedHint' ).unwrap();
          }
        });

        // Terminates any ongoing AJAX requests if one exists.
        function cancelPendingHttpRequest() {
          if ( ajaxRequestHandle ) { ajaxRequestHandle.abort(); }
        }

        // Initiates a new search by scheduling the `handleTextInputChange` function after a delay.
        function reinitiateLookup() {
          if ( delayTimer ) { clearTimeout( delayTimer ); }
          delayTimer = setTimeout( handleTextInputChange, currentSettings.inputDelayMs );
        }

        // This function executes when input changes occur and after the key delay.
        function handleTextInputChange() {

          // Extract text from the input field.
          // Remove backslashes and forward slashes, then consolidate multiple spaces.
          var searchQueryString = _jq.trim( txtInput.val() ).replace( /[\\]+|[\/]+/g, "" ).replace( /\s+/g, " " );

          // Store the current search string for future reference.
          previousInputText = searchQueryString;

          // Proceed only if the input length meets the minimum character requirement.
          if ( searchQueryString.length >= currentSettings.minimumCharacters ) {

            // Invoke the custom `preRetrievalHook` function.
            if ( currentSettings.preRetrievalHook ) { searchQueryString = currentSettings.preRetrievalHook.call( this, searchQueryString ); }

            // Apply a 'loading' class and display a loading message.
            txtInput.addClass( 'data-loading' );
            if ( currentSettings.pendingResultMessage ) { hintList.html( '<li class="ph-info-message">' + currentSettings.pendingResultMessage + '</li>' ).show(); }
            hintDisplayArea.show();

            // If a remote data source (URL) is defined, construct the query and fetch JSON data.
            if ( currentSettings.remoteDataEndpoint ) {
              cancelPendingHttpRequest();
              var reqParam = {};
              reqParam[ currentSettings.requestParameterName ] = searchQueryString;
              ajaxRequestHandle = _jq.getJSON( currentSettings.remoteDataEndpoint, _jq.extend( {}, reqParam, currentSettings.additionalRequestParams ), function( responseData ) {
                manageIncomingData( responseData, searchQueryString, false );
              });
            }

            // If a local data source (object) is provided, process results directly.
            if ( currentSettings.nearbyDataSource ) {
              manageIncomingData( currentSettings.nearbyDataSource, searchQueryString, true );
            }

          } else {
            // Input does not meet the minimum character count.
            // txtInput.removeClass('data-loading'); // Reconsider if removing loading class is needed here.
            hintDisplayArea.hide();
          }
        }

        // Manages up and down arrow key presses to navigate and select suggestions.
        function highlightSuggestion( directionIndicator ) {

          // Ensure there's at least one visible suggestion in the list.
          if ( _jq( 'li.ph-suggestion-entry:visible', hintDisplayArea ).length > 0 ) {

            // Get all list items within the results panel.
            var listItems = _jq( 'li', hintDisplayArea );

            // Determine the initial item to highlight based on direction.
            var targetItem = directionIndicator === 'downward' ? listItems.eq( 0 ) : listItems.filter( ':last' );

            // If an item is already active, use it as the reference for movement.
            var activeItem = _jq( 'li.current-selection:first', hintDisplayArea );
            if ( activeItem.length > 0 ) {
              targetItem = directionIndicator === 'downward' ? activeItem.next() : activeItem.prev();
            }

            // Deactivate previous selections and activate the new target item.
            listItems.removeClass( 'current-selection' );
            targetItem.addClass( 'current-selection' );

            // Call the custom `onSuggestionFocused` callback.
            if ( targetItem.length > 0 ) { currentSettings.onSuggestionFocused.call( txtInput, targetItem.data() ); }

            // Update the input field's text with the currently selected item's value.
            // If no item is selected, revert to the user's original input.
            var displayValue = targetItem.length > 0 ? targetItem.data()[ currentSettings.displayAttribute ] : previousInputText;
            txtInput.val( displayValue );
          }
        }

        // Attach click and mouseover events for result selection and highlighting.
        hintDisplayArea.on({
          click: function( eventObj ) {
            _jq( this ).trigger( "select" );
          },
          mouseover: function( eventObj ) {
            // When the mouse hovers over a suggestion, mark it as active.
            _jq( 'li', hintList ).removeClass( 'current-selection' );
            _jq( this ).addClass( 'current-selection' );

            // Invoke the custom `onSuggestionFocused` callback.
            currentSettings.onSuggestionFocused.call( txtInput, _jq( this ).data() );
          },
          select: function( eventObj ) {

            var triggeredElement = _jq( this );
            var itemData = triggeredElement.data();
            previousInputText = itemData[ currentSettings.displayAttribute ];
            txtInput.val( previousInputText );

            currentSettings.onItemChosen.call( txtInput, itemData, triggeredElement );
            hintList.html( '' );
            hintDisplayArea.hide();
          }
        }, ".ph-suggestion-entry" );

        // This function processes the retrieved data and renders the suggestions.
        function manageIncomingData( rawDataCollection, searchPattern, isLocalSource ) {

          var processedData = currentSettings.postRetrievalProcessor.call( this, rawDataCollection, searchPattern, isLocalSource ); // Data to be processed.
          var searchProperties = currentSettings.searchAttributes.split( ',' ); // Array of properties to search within.
          var foundItemCount = 0;
          var dataIndex = 0;

          // Clear and hide the results container. This removes old results and the loading message.
          // Local results are faster and will clear the loading message first.
          // However, if local results are disabled, cleanup should still occur.
          if ( isLocalSource || !currentSettings.nearbyDataSource ) {
            hintList.html( '' );
            hintDisplayArea.hide();
          }

          // Iterate through each element in the data collection.
          for ( var dataKey in processedData ) {

            if ( processedData.hasOwnProperty( dataKey ) ) {

              // Construct a combined string from all specified `searchAttributes` for the current item.
              var combinedSearchString = '';
              for ( var propIndex = 0; propIndex < searchProperties.length; propIndex++ ) {
                combinedSearchString = combinedSearchString + ( processedData[ dataIndex ][ _jq.trim( searchProperties[ propIndex ] ) ] !== undefined ? processedData[ dataIndex ][ _jq.trim( searchProperties[ propIndex ] ) ] : '' );
              }

              // If case-sensitive search is not required, convert strings to lowercase.
              if ( !currentSettings.caseSensitiveSearch ) {
                combinedSearchString = combinedSearchString.toLowerCase();
                searchPattern = searchPattern.toLowerCase();
              }

              // Split the user's search pattern into individual words/tokens.
              var searchTokens = searchPattern.split( ' ' );

              // Check if any of the search tokens match any part of the item's combined string.
              var isMatchFound = false;
              for ( var tokenIndex in searchTokens ) {
                if ( searchTokens.hasOwnProperty( tokenIndex ) ) {
                  if ( combinedSearchString.search( searchTokens[ tokenIndex ] ) !== -1 ) {
                    isMatchFound = true;
                  }
                }
              }

              // If at least one match was found for the current item.
              if ( isMatchFound === true ) {
                // Assign a flag indicating the data source and the item's position.
                processedData[ dataIndex ][ '_dataSource' ] = isLocalSource ? 'local' : 'remote';
                processedData[ dataIndex ][ '_number' ] = foundItemCount;

                // Create a list item element for the suggestion, storing its full data.
                var suggestionListItem = _jq( '<li class="ph-suggestion-entry" id="ph-suggestion-entry-' + dataIndex + '"></li>' ).data( processedData[ dataIndex ] );
                var itemDataCopy = _jq.extend( {}, processedData[ dataIndex ] );

                // If highlighting is enabled, apply it to matched words.
                if ( currentSettings.enableHighlighting ) {
                  for ( var tokenIndex in searchTokens ) {
                    if ( searchTokens.hasOwnProperty( tokenIndex ) ) {

                      // Determine case sensitivity for the regular expression.
                      var caseSensitivityFlag = !currentSettings.caseSensitiveSearch ? 'gi' : 'g';
                      var highlightRegex = new RegExp( '(?![^&;]+;)(?!<[^<>]*)(' + searchTokens[ tokenIndex ] + ')(?![^<>]*>)(?![^&;]+;)', '' + caseSensitivityFlag + '' );

                      // Highlight the matched parts within the display attribute.
                      itemDataCopy[ currentSettings.displayAttribute ] = itemDataCopy[ currentSettings.displayAttribute ].replace( highlightRegex, "<em>$1</em>" );
                    }
                  }
                }

                // Use a custom formatter or default to displaying the `displayAttribute`.
                var listItemElement = currentSettings.customListItemFormatter ? currentSettings.customListItemFormatter.call( txtInput, itemDataCopy, suggestionListItem ) : suggestionListItem.html( itemDataCopy[ currentSettings.displayAttribute ] );
                hintList.append( listItemElement );

                // Increment the counter for found results.
                foundItemCount++;

                // Check if the maximum number of results to display has been reached.
                if ( currentSettings.maximumResults && currentSettings.maximumResults === foundItemCount ) { break; }
              }

              dataIndex++;
            }
          }

          // Once results are processed, remove the loading state.
          txtInput.removeClass( 'data-loading' );

          // If no results were found, show a specific "empty results" message.
          if ( foundItemCount <= 0 && currentSettings.noResultsMessage ) {
            hintList.html( '<li class="ph-info-message">' + currentSettings.noResultsMessage + '</li>' );
          }

          // Finally, reveal the suggestions list to the user.
          hintDisplayArea.show();

          // Invoke the custom `onResultsDisplayed` callback.
          currentSettings.onResultsDisplayed.call( this );
        }
      });
    },
    refresh: function() {
      return this.each( function( itemIdx, currentElement ) {
        _jq( this ).trigger( "refresh" );
      });
    },
    setValue: function( updateVal ) {
      return this.each( function( itemIdx, currentElement ) {
        _jq( this ).trigger( "setValue", updateVal );
      });
    },
    update: function( freshConfiguration ) {
      return this.each( function( itemIdx, currentElement ) {
        _jq( this ).trigger( "updateOptions", freshConfiguration );
      });
    },
    destroy: function() {
      return this.each( function( itemIdx, currentElement ) {
        _jq( this ).trigger( "destroy" );
      });
    }
  };

  _jq.fn.pairedHint = function( invocationArguments ) {
    if ( utilityFunctions[ invocationArguments ] ) {
      return utilityFunctions[ invocationArguments ].apply( this, Array.prototype.slice.call( arguments, 1 ) );
    } else if ( typeof invocationArguments === 'object' || !invocationArguments ) {
      return utilityFunctions.initializePlugin.apply( this, arguments );
    } else {
      _jq.error( 'Invalid method or arguments ' + invocationArguments + ' on _jq.pairedHint' );
    }
  };

  // Expose the default configuration options globally for accessibility.
  _jq.fn.pairedHint.defaultOptions = {
    nearbyDataSource: false, // Object array from which pairedHint fetches suggestions locally.
    remoteDataEndpoint: false, // URL from which pairedHint retrieves suggestions asynchronously.
    noResultsMessage: false, // Text to display when no search results are found.
    pendingResultMessage: 'Loading...', // Text shown while results are being fetched.
    allowNewEntry: false, // If false, new items can only be added by selecting from suggestions.
    displayAttribute: 'name', // Name of the object property from the data source to show in the results.
    searchAttributes: 'name', // Comma-separated list of object property names to search within.
    requestParameterName: 'q', // The query parameter name for the search string in AJAX requests.
    maximumResults: false, // Numeric limit for the number of results returned by an AJAX call.
    additionalRequestParams: {}, // Key-value object to append to the AJAX request URL.
    caseSensitiveSearch: false, // When true, the search will be case-sensitive.
    minimumCharacters: 1, // Minimum characters required in the input before a search begins.
    inputDelayMs: 500, // Delay (in milliseconds) after a keypress before a new search is triggered.
    enableHighlighting: true, // Option to enable or disable highlighting of matched text in results.
    onItemChosen: function( itemData ) {}, // Custom function executed when a result is selected (click/enter/tab).
    onSuggestionFocused: function( itemData ) {}, // Custom function run when a suggestion gains focus (mouseover/arrow keys).
    customListItemFormatter: false, // Custom function used to format each list item after data retrieval.
    preRetrievalHook: function( searchString ) { return searchString; }, // Custom function run before AJAX request or local search.
    postRetrievalProcessor: function( rawDataCollection, searchPattern, isLocalSource ) { return rawDataCollection; }, // Custom function executed before processing the retrieved data object.
    onResultsDisplayed: function() {} // Custom function invoked when the suggestion dropdown list becomes visible.
  };
})( jQuery );