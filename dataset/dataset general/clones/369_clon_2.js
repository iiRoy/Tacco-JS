;(function(jQ) {

jQ.fn.augment({
	suggestify: function(sourceInfo, configSettings) {
		// Determine if the data source is a remote URL string
		var isRemoteSource = typeof sourceInfo === "string";
		// Merge default settings with user-provided options
		configSettings = jQ.augment({}, jQ.Suggestifier.presetValues, {
			remoteURL: isRemoteSource ? sourceInfo : null,
			localDataSet: isRemoteSource ? null : sourceInfo,
			pauseDuration: isRemoteSource ? jQ.Suggestifier.presetValues.pauseDuration : 10,
			maxEntries: configSettings && !configSettings.enableScrolling ? 10 : 150
		}, configSettings);
		
		// If no custom highlight function is provided, use a passthrough one
		configSettings.emphasisFormatter = configSettings.emphasisFormatter || function(textVal) { return textVal; };
		
		// For backward compatibility, use itemFormatter if matchFormatter isn't specified
		configSettings.matchValueFormatter = configSettings.matchValueFormatter || configSettings.itemDisplayFormatter;
		
		// Apply the suggestify behavior to each selected element
		return this.forEachElement(function() {
			new jQ.Suggestifier(this, configSettings);
		});
	},
	selectionMade: function(callbackFunction) {
		// Attach an event handler for when a selection is made
		return this.attachEvent("selectionMade", callbackFunction);
	},
	initiateQuery: function(callbackFunction) {
		// Trigger a search operation, optionally with a callback
		return this.fireEvent("initiateQuery", [callbackFunction]);
	},
	clearStoredData: function() {
		// Trigger an event to clear the internal data cache
		return this.fireEvent("clearStoredData");
	},
	adjustSettings: function(newSettings){
		// Trigger an event to update the plugin's configuration
		return this.fireEvent("adjustSettings", [newSettings]);
	},
	deactivateSuggestify: function() {
		// Trigger an event to remove suggestify functionality
		return this.fireEvent("deactivateSuggestify");
	}
});

jQ.Suggestifier = function(targetElement, configSettings) {

	// Define key codes for navigation and control
	var KEY_CODES = {
		ARROW_UP: 38,
		ARROW_DOWN: 40,
		DELETE_KEY: 46,
		TAB_KEY: 9,
		ENTER_KEY: 13,
		ESCAPE_KEY: 27,
		COMMA_CHAR: 188,
		PAGE_UP: 33,
		PAGE_DOWN: 34,
		BACKSPACE_KEY: 8
	};

	// Wrap the target input element with jQuery and set attributes
	var jQTarget = jQ(targetElement).attr("autoComplete", "off").addClass(configSettings.inputFieldStyle);

	var timerHandle; // Timer for delayed input processing
	var lastKnownInput = ""; // Stores the input field's value from the last check
	var dataStore = jQ.Suggestifier.DataStore(configSettings); // Manages cached suggestions
	var elementFocusCounter = 0; // Tracks focus state
	var lastKeyPressed; // Stores the key code of the last key pressed
	var internalState = {
		mouseHeldOnSelection: false // Flag to prevent blur event on list item click
	};
	// Initialize the selection display component
	var selectionBox = jQ.Suggestifier.SelectionDisplay(configSettings, targetElement, confirmSelection, internalState);
	
	var preventSubmission; // Flag to prevent form submission
	
	// Special handling for Opera browser to prevent form submission when selecting with Enter
	jQ.browserInfo.isOpera && jQ(targetElement.form).attachEvent("formSubmit.suggestify", function() {
		if (preventSubmission) {
			preventSubmission = false;
			return false;
		}
	});
	
	// Bind key events for navigation and input processing
	jQTarget.attachEvent((jQ.browserInfo.isOpera ? "charPress" : "keyStroke") + ".suggestify", function(keyEvent) {
		// Keep track of the last key pressed
		lastKeyPressed = keyEvent.keyCode;
		switch(keyEvent.keyCode) {
		
			case KEY_CODES.ARROW_UP:
				keyEvent.haltDefault();
				if ( selectionBox.isDisplayed() ) {
					selectionBox.moveUp();
				} else {
					handleInputChange(0, true);
				}
				break;
				
			case KEY_CODES.ARROW_DOWN:
				keyEvent.haltDefault();
				if ( selectionBox.isDisplayed() ) {
					selectionBox.moveDown();
				} else {
					handleInputChange(0, true);
				}
				break;
				
			case KEY_CODES.PAGE_UP:
				keyEvent.haltDefault();
				if ( selectionBox.isDisplayed() ) {
					selectionBox.scrollPageUp();
				} else {
					handleInputChange(0, true);
				}
				break;
				
			case KEY_CODES.PAGE_DOWN:
				keyEvent.haltDefault();
				if ( selectionBox.isDisplayed() ) {
					selectionBox.scrollPageDown();
				} else {
					handleInputChange(0, true);
				}
				break;
			
			// Handle comma for multiple selections, and Tab/Enter
			case configSettings.allowMultiple && jQ.stripWhitespace(configSettings.itemDelimiter) === "," && KEY_CODES.COMMA_CHAR:
			case KEY_CODES.TAB_KEY:
			case KEY_CODES.ENTER_KEY:
				if( confirmSelection() ) {
					// Stop default action to prevent form submission; Opera needs special attention
					keyEvent.haltDefault();
					preventSubmission = true;
					return false;
				}
				break;
				
			case KEY_CODES.ESCAPE_KEY:
				selectionBox.conceal();
				break;
				
			default:
				clearTimeout(timerHandle);
				timerHandle = setTimeout(handleInputChange, configSettings.pauseDuration);
				break;
		}
	}).gainFocus(function(){
		// Increment focus counter to track if field has focus
		elementFocusCounter++;
	}).loseFocus(function() {
		elementFocusCounter = 0;
		if (!internalState.mouseHeldOnSelection) {
			deferHideResults();
		}
	}).mouseClick(function() {
		// Show suggestions if field is focused and list is not visible
		if ( elementFocusCounter++ > 1 && !selectionBox.isDisplayed() ) {
			handleInputChange(0, true);
		}
	}).attachEvent("initiateQuery", function() {
		// Handle custom query trigger
		var resultHandler = (arguments.length > 1) ? arguments[1] : null;
		function queryResultCallback(queryTerm, receivedData) {
			var resultEntry;
			if( receivedData && receivedData.length ) {
				for (var i=0; i < receivedData.length; i++) {
					if( receivedData[i].outcome.toLower() === queryTerm.toLower() ) {
						resultEntry = receivedData[i];
						break;
					}
				}
			}
			if( typeof resultHandler === "function" ) resultHandler(resultEntry);
			else jQTarget.fireEvent("selectionMade", resultEntry && [resultEntry.originalData, resultEntry.itemValue]);
		}
		jQ.forEach(splitAndClean(jQTarget.val()), function(idx, valueSegment) {
			fetchSuggestions(valueSegment, queryResultCallback, queryResultCallback);
		});
	}).attachEvent("clearStoredData", function() {
		dataStore.resetCache();
	}).attachEvent("adjustSettings", function() {
		jQ.augment(configSettings, arguments[1]);
		// If local data was updated, repopulate the cache
		if ( "localDataSet" in arguments[1] )
			dataStore.fillInitialCache();
	}).attachEvent("deactivateSuggestify", function() {
		selectionBox.detachEvents();
		jQTarget.detachEvents();
		jQ(targetElement.form).detachEvents(".suggestify");
	});
	
	// Confirms the currently highlighted selection in the list
	function confirmSelection() {
		var currentSelection = selectionBox.getCurrentSelection();
		if( !currentSelection )
			return false;
		
		var chosenValue = currentSelection.outcome;
		lastKnownInput = chosenValue;
		
		if ( configSettings.allowMultiple ) {
			var segments = splitAndClean(jQTarget.val());
			if ( segments.length > 1 ) {
				chosenValue = segments.slice(0, segments.length - 1).join( configSettings.itemDelimiter ) + configSettings.itemDelimiter + chosenValue;
			}
			chosenValue += configSettings.itemDelimiter;
		}
		
		jQTarget.val(chosenValue);
		immediatelyHideResults();
		jQTarget.fireEvent("selectionMade", [currentSelection.originalData, currentSelection.itemValue]);
		return true;
	}
	
	// Handles changes in the input field, triggering suggestions
	function handleInputChange(eventOrigin, ignorePreviousValue) {
		if( lastKeyPressed === KEY_CODES.DELETE_KEY ) {
			selectionBox.conceal();
			return;
		}
		
		var currentInputText = jQTarget.val();
		
		if ( !ignorePreviousValue && currentInputText === lastKnownInput )
			return;
		
		lastKnownInput = currentInputText;
		
		currentInputText = extractLastSegment(currentInputText);
		if ( currentInputText.length >= configSettings.minimumCharacters) {
			jQTarget.addClass(configSettings.loadingStateStyle);
			if (!configSettings.caseSensitiveMatch)
				currentInputText = currentInputText.toLower();
			fetchSuggestions(currentInputText, processFetchedData, immediatelyHideResults);
		} else {
			endLoadingIndicator();
			selectionBox.conceal();
		}
	}
	
	// Splits a string by delimiter and cleans whitespace from segments
	function splitAndClean(stringValue) {
		if ( !stringValue ) {
			return [""];
		}
		var segments = stringValue.split( configSettings.itemDelimiter );
		var processedSegments = [];
		jQ.forEach(segments, function(idx, segmentValue) {
			if ( jQ.stripWhitespace(segmentValue) )
				processedSegments[idx] = jQ.stripWhitespace(segmentValue);
		});
		return processedSegments;
	}
	
	// Extracts the last segment of a string, useful for multiple values
	function extractLastSegment(stringValue) {
		if ( !configSettings.allowMultiple )
			return stringValue;
		var segments = splitAndClean(stringValue);
		return segments[segments.length - 1];
	}
	
	// Fills the input box with the first match
	// queryTerm: the original term entered
	// suggestedValue: the first matching result's value
	function prepopulateInput(queryTerm, suggestedValue){
		// Autofill if enabled, the last typed word matches the query, and backspace wasn't pressed
		if( configSettings.autoPopulateInput && (extractLastSegment(jQTarget.val()).toLower() === queryTerm.toLower()) && lastKeyPressed !== KEY_CODES.BACKSPACE_KEY ) {
			// Fill in the value, preserving user's case
			jQTarget.val(jQTarget.val() + suggestedValue.substring(extractLastSegment(lastKnownInput).length));
			// Select the autofilled portion for easy overwriting
			jQ.Suggestifier.TextSelection(targetElement, lastKnownInput.length, lastKnownInput.length + suggestedValue.length);
		}
	}

	// Hides results after a short delay
	function deferHideResults() {
		clearTimeout(timerHandle);
		timerHandle = setTimeout(immediatelyHideResults, 200);
	}

	// Immediately hides the suggestion results
	function immediatelyHideResults() {
		var previouslyVisible = selectionBox.isDisplayed();
		selectionBox.conceal();
		clearTimeout(timerHandle);
		endLoadingIndicator();
		if (configSettings.requireExactMatch) {
			// Trigger a search to validate the current input
			jQTarget.initiateQuery(
				function (validationResult){
					// If no match found, clear the input or the last segment
					if( !validationResult ) {
						if (configSettings.allowMultiple) {
							var words = splitAndClean(jQTarget.val()).slice(0, -1);
							jQTarget.val( words.join(configSettings.itemDelimiter) + (words.length ? configSettings.itemDelimiter : "") );
						}
						else
							jQTarget.val( "" );
					}
				}
			);
		}
		if (previouslyVisible)
			// Place cursor at the end of the input field
			jQ.Suggestifier.TextSelection(targetElement, targetElement.value.length, targetElement.value.length);
	}

	// Processes data received from the suggestion source
	function processFetchedData(queryTerm, receivedData) {
		if ( receivedData && receivedData.length && elementFocusCounter ) {
			endLoadingIndicator();
			selectionBox.presentSuggestions(receivedData, queryTerm);
			prepopulateInput(queryTerm, receivedData[0].itemValue);
			selectionBox.reveal();
		} else {
			immediatelyHideResults();
		}
	}

	// Fetches suggestions from cache or remote source
	function fetchSuggestions(queryFragment, onSuccess, onFailure) {
		if (!configSettings.caseSensitiveMatch)
			queryFragment = queryFragment.toLower();
		var cachedData = dataStore.retrieve(queryFragment);
		cachedData = null; // Temporary override to always hit Solr/backend, remove for actual cache usage
		// If cached data is available, use it
		if (cachedData && cachedData.length) {
			onSuccess(queryFragment, cachedData);
		// If a remote URL is configured, make an AJAX request
		} else if( (typeof configSettings.remoteURL === "string") && (configSettings.remoteURL.length > 0) ){
			
			var additionalParameters = {
				currentTimeStamp: +new Date() // Add a unique timestamp to prevent caching
			};
			jQ.forEach(configSettings.additionalRequestParams, function(key, paramValue) {
				additionalParameters[key] = typeof paramValue === "function" ? paramValue() : paramValue;
			});
			
			jQ.asyncRequest({
				// Attempt to abort previous requests for this input
				requestMode: "abort",
				// Limit abortion to this specific input field
				requestPort: "suggestify" + targetElement.name,
				responseDataFormat: configSettings.responseDataFormat,
				targetURL: configSettings.remoteURL,
				requestPayload: jQ.augment({
					queryParam: extractLastSegment(queryFragment),
					maxResults: configSettings.maximumItems
				}, additionalParameters),
				requestSuccess: function(serverData) {
					var parsedResults = configSettings.customParser && configSettings.customParser(serverData) || defaultParser(serverData);
					dataStore.addItemToCache(queryFragment, parsedResults);
					onSuccess(queryFragment, parsedResults);
				}
			});
		} else {
			// If no data source or cache, clear the list and signal failure
			selectionBox.clearDisplayList();
			onFailure(queryFragment);
		}
	}
	
	// Default parser for newline-separated, pipe-delimited data
	function defaultParser(rawTextData) {
		var parsedResults = [];
		var dataLines = rawTextData.split("\n");
		for (var i=0; i < dataLines.length; i++) {
			var currentLine = jQ.stripWhitespace(dataLines[i]);
			if (currentLine) {
				currentLine = currentLine.split("|");
				parsedResults[parsedResults.length] = {
					originalData: currentLine,
					itemValue: currentLine[0],
					outcome: configSettings.resultDisplayFormatter && configSettings.resultDisplayFormatter(currentLine, currentLine[0]) || currentLine[0]
				};
			}
		}
		return parsedResults;
	}

	// Removes the loading indicator from the input field
	function endLoadingIndicator() {
		jQTarget.removeClass(configSettings.loadingStateStyle);
	}

};

// Default configuration settings for the suggestifier
jQ.Suggestifier.presetValues = {
	inputFieldStyle: "sg_input",
	resultsListStyle: "sg_results",
	loadingStateStyle: "sg_loading",
	minimumCharacters: 1,
	pauseDuration: 400,
	caseSensitiveMatch: false,
	partialMatch: true,
	containsMatch: false,
	maxCacheSize: 10,
	maximumItems: 100,
	requireExactMatch: false,
	additionalRequestParams: {},
	autoSelectFirst: false,
	itemDisplayFormatter: function(rowEntry) { return rowEntry[0]; },
	matchValueFormatter: null,
	autoPopulateInput: false,
	displayWidth: 0,
	allowMultiple: false,
	itemSeparator: ", ",
	textHighlighter: function(textValue, searchPattern) {
		// Highlights the search pattern within the text value
		return textValue.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + searchPattern.replace(/([\^\$\(\)\[\]\{\}\*\.\+\?\|\\])/gi, "\\$1") + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<strong>$1</strong>");
	},
    enableScrolling: true,
    scrollWindowHeight: 180
};

// Manages caching of suggestion data
jQ.Suggestifier.DataStore = function(cacheSettings) {

	var storedItems = {}; // Object to hold cached data
	var itemCount = 0; // Current number of items in cache
	
	// Checks if a substring matches a source string based on settings
	function checkPartialMatch(sourceString, subString) {
		if (!cacheSettings.caseSensitiveMatch) 
			sourceString = sourceString.toLower();
		var matchIndex = sourceString.findIndexOf(subString);
		if (cacheSettings.containsMatch === "wholeWord"){
			matchIndex = sourceString.toLower().regexSearch("\\b" + subString.toLower());
		}
		if (matchIndex === -1) return false;
		return matchIndex === 0 || cacheSettings.containsMatch;
	}
	
	// Adds an item to the cache, managing cache size
	function addItemToCache(queryKey, cachedValue) {
		if (itemCount > cacheSettings.maxCacheSize){
			resetCache(); // Clear cache if it exceeds max size
		}
		if (!storedItems[queryKey]){ 
			itemCount++;
		}
		storedItems[queryKey] = cachedValue;
	}
	
	// Populates the cache with initial local data if provided
	function fillInitialCache(){
		if( !cacheSettings.localDataSet ) return false;
		// Object to store matches structured by first character
		var structuredMatches = {},
			emptyQueryItemCount = 0;

		// If no remote URL, ensure cache can hold all local data
		if( !cacheSettings.remoteURL ) cacheSettings.maxCacheSize = 1;
		
		// Initialize for empty queries (minChars = 0)
		structuredMatches[""] = [];
		
		// Iterate through local data to build the lookup structure
		for ( var i = 0, originalLength = cacheSettings.localDataSet.length; i < originalLength; i++ ) {
			var unprocessedValue = cacheSettings.localDataSet[i];
			// Convert string values to array for consistency
			unprocessedValue = (typeof unprocessedValue === "string") ? [unprocessedValue] : unprocessedValue;
			
			var formattedMatchValue = cacheSettings.matchValueFormatter(unprocessedValue, i+1, cacheSettings.localDataSet.length);
			if ( formattedMatchValue === false )
				continue;
				
			var initialCharacter = formattedMatchValue.getFirstChar().toLower();
			// Create an array for this initial character if it doesn't exist
			if( !structuredMatches[initialCharacter] ) 
				structuredMatches[initialCharacter] = [];

			// Create a cache entry object
			var cacheEntry = {
				itemValue: formattedMatchValue,
				originalData: unprocessedValue,
				outcome: cacheSettings.resultDisplayFormatter && cacheSettings.resultDisplayFormatter(unprocessedValue) || formattedMatchValue
			};
			
			// Add the current match to its respective list
			structuredMatches[initialCharacter].addToArray(cacheEntry);

			// Keep track of items for zero-character queries
			if ( emptyQueryItemCount++ < cacheSettings.maximumItems ) {
				structuredMatches[""].addToArray(cacheEntry);
			}
		}

		// Add the structured data items to the cache
		jQ.forEach(structuredMatches, function(idx, segmentValue) {
			// Increase cache size to accommodate these internal entries
			cacheSettings.maxCacheSize++;
			// Store in the cache
			addItemToCache(idx, segmentValue);
		});
	}
	
	// Populate any existing local data after a short delay
	setTimeout(fillInitialCache, 25);
	
	// Clears all items from the cache
	function resetCache(){
		storedItems = {};
		itemCount = 0;
	}
	
	return {
		addItemToCache: addItemToCache,
		retrieve: function(queryKey) {
			// If full match is not required, find a suitable subset
			if (!cacheSettings.partialMatch)
				return storedItems[queryKey];
			
			var matchingItems = [];
			// Iterate through cached items to find matches
			for (var key in storedItems) {
				if (storedItems.hasOwnProperty(key) && checkPartialMatch(key, queryKey)) {
					matchingItems = matchingItems.concat(storedItems[key]);
				}
			}
			return matchingItems;
		},
		resetCache: resetCache,
		fillInitialCache: fillInitialCache
	};
};
// Add placeholder for TextSelection (could be a utility function)
jQ.Suggestifier.TextSelection = function(element, start, end) {
    if (element.setSelectionRange) {
        element.setSelectionRange(start, end);
    } else if (element.createTextRange) {
        var range = element.createTextRange();
        range.collapse(true);
        range.moveEnd('character', end);
        range.moveStart('character', start);
        range.select();
    }
};

// Add placeholder for SelectionDisplay (could be a separate file/module)
jQ.Suggestifier.SelectionDisplay = function(config, inputElem, selectCallback, stateConfig) {
    // This would be the full implementation of the UI for the suggestion list
    // For Type II clone, we just need the structure and name changes.
    // The actual DOM manipulation and event handling would be inside here.
    var displayContainer; // Placeholder for jQuery object representing the suggestion list container
    var currentSelectedIndex = -1; // Index of the currently highlighted item

    function createDisplay() {
        // Mock creation of the display container for structural cloning
        displayContainer = jQ('<div/>')
            .addClass(config.resultsListStyle)
            .css({
                position: 'absolute',
                display: 'none'
            })
            .appendTo(document.body); // Or append to a specific parent
        
        displayContainer.attachEvent('mousedown.suggestify', function() {
            stateConfig.mouseHeldOnSelection = true;
        });
        displayContainer.attachEvent('mouseup.suggestify', function() {
            stateConfig.mouseHeldOnSelection = false;
        });

        // Event delegation for clicks on suggestion items
        displayContainer.attachEvent('click.suggestify', 'li', function() {
            var listItem = jQ(this);
            currentSelectedIndex = listItem.data('item-index');
            selectCallback(); // Trigger the selection confirmation
            inputElem.focus(); // Return focus to the input
        });
    }

    createDisplay(); // Initialize the display container

    return {
        presentSuggestions: function(items, queryFragment) {
            displayContainer.empty();
            if (items.length === 0) {
                this.conceal();
                return;
            }
            
            var list = jQ('<ul/>');
            jQ.forEach(items, function(idx, item) {
                var displayValue = config.itemDisplayFormatter(item.originalData, idx + 1, items.length);
                if (displayValue === false) return; // Skip if formatter returns false

                var highlightedValue = config.textHighlighter(displayValue, queryFragment);
                jQ('<li/>')
                    .html(highlightedValue)
                    .data('item-data', item.originalData)
                    .data('item-value', item.itemValue)
                    .data('item-result', item.outcome)
                    .data('item-index', idx)
                    .appendTo(list);
            });
            displayContainer.append(list);
            currentSelectedIndex = -1; // Reset selection
        },
        reveal: function() {
            // Position and show the container
            var offset = jQ(inputElem).offset();
            displayContainer.css({
                left: offset.left,
                top: offset.top + jQ(inputElem).outerHeight(),
                width: config.displayWidth > 0 ? config.displayWidth : jQ(inputElem).outerWidth()
            }).show();
        },
        conceal: function() {
            displayContainer.hide();
        },
        isDisplayed: function() {
            return displayContainer.is(':visible');
        },
        moveUp: function() {
            var items = displayContainer.find('li');
            if (items.length === 0) return;

            if (currentSelectedIndex <= 0) {
                currentSelectedIndex = items.length - 1; // Wrap around to last item
            } else {
                currentSelectedIndex--;
            }
            this.highlightItem(currentSelectedIndex);
        },
        moveDown: function() {
            var items = displayContainer.find('li');
            if (items.length === 0) return;

            if (currentSelectedIndex >= items.length - 1) {
                currentSelectedIndex = 0; // Wrap around to first item
            } else {
                currentSelectedIndex++;
            }
            this.highlightItem(currentSelectedIndex);
        },
        pageUp: function() {
            // Simulate page up logic
            // For simplicity, just move up by a few items or to the first
            var newIndex = Math.max(0, currentSelectedIndex - 5);
            if (newIndex === currentSelectedIndex) { // If already at top
                newIndex = 0;
            }
            currentSelectedIndex = newIndex;
            this.highlightItem(currentSelectedIndex);
        },
        pageDown: function() {
            // Simulate page down logic
            // For simplicity, just move down by a few items or to the last
            var items = displayContainer.find('li');
            var newIndex = Math.min(items.length - 1, currentSelectedIndex + 5);
            if (newIndex === currentSelectedIndex) { // If already at bottom
                newIndex = items.length - 1;
            }
            currentSelectedIndex = newIndex;
            this.highlightItem(currentSelectedIndex);
        },
        highlightItem: function(index) {
            displayContainer.find('li').removeClass('ac_over'); // Assuming 'ac_over' is the highlight class
            var itemToHighlight = displayContainer.find('li').eq(index);
            itemToHighlight.addClass('ac_over');
            // Scroll into view if needed (simplified)
            // if (config.enableScrolling && itemToHighlight.length) {
            //     var container = displayContainer.find('ul');
            //     var itemTop = itemToHighlight.position().top;
            //     var itemBottom = itemTop + itemToHighlight.outerHeight();
            //     var containerScrollTop = container.scrollTop();
            //     var containerHeight = container.height();

            //     if (itemBottom > containerHeight + containerScrollTop) {
            //         container.scrollTop(itemBottom - containerHeight);
            //     } else if (itemTop < containerScrollTop) {
            //         container.scrollTop(itemTop);
            //     }
            // }
        },
        getCurrentSelection: function() {
            var highlightedItem = displayContainer.find('li.ac_over');
            if (highlightedItem.length === 0) return null;
            return {
                originalData: highlightedItem.data('item-data'),
                itemValue: highlightedItem.data('item-value'),
                outcome: highlightedItem.data('item-result')
            };
        },
        clearDisplayList: function() {
            displayContainer.empty();
            currentSelectedIndex = -1;
        },
        detachEvents: function() {
            displayContainer.detachEvents('.suggestify');
            displayContainer.remove();
        }
    };
};

// Placeholder for browser info utility
jQ.browserInfo = {
    isOpera: navigator.userAgent.indexOf('Opera') > -1
};

// Extend String prototype for convenience, simulating jQuery behavior
if (!String.prototype.toLower) {
    String.prototype.toLower = function() {
        return this.toLowerCase();
    };
}
if (!String.prototype.findIndexOf) {
    String.prototype.findIndexOf = function(substring) {
        return this.indexOf(substring);
    };
}
if (!String.prototype.regexSearch) {
    String.prototype.regexSearch = function(regexString) {
        return this.search(new RegExp(regexString));
    };
}
if (!String.prototype.getFirstChar) {
    String.prototype.getFirstChar = function() {
        return this.charAt(0);
    };
}
if (!Array.prototype.addToArray) {
    Array.prototype.addToArray = function(item) {
        this.push(item);
    };
}

// Add a simple forEach utility if not present (simulating jQuery.each)
if (!jQ.forEach) {
    jQ.forEach = function(obj, callback) {
        var i, len;
        if (Array.isArray(obj)) {
            for (i = 0, len = obj.length; i < len; i++) {
                if (callback.call(obj[i], i, obj[i]) === false) {
                    break;
                }
            }
        } else {
            for (i in obj) {
                if (obj.hasOwnProperty(i)) {
                    if (callback.call(obj[i], i, obj[i]) === false) {
                        break;
                    }
                }
            }
        }
    };
}

// Add a simple augment utility if not present (simulating jQuery.extend)
if (!jQ.augment) {
    jQ.augment = function() {
        var options, name, src, copy, copyIsArray, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;

        // Handle a deep copy situation
        if (typeof target === "boolean") {
            deep = target;
            target = arguments[i] || {};
            i++;
        }

        // Handle case when target is not an object or function
        if (typeof target !== "object" && typeof target !== "function") {
            target = {};
        }

        // Extend jQuery itself if only one argument is passed
        if (i === length) {
            target = this;
            i--;
        }

        for (; i < length; i++) {
            // Only deal with non-null/undefined values
            if ((options = arguments[i]) != null) {
                // Extend the base object
                for (name in options) {
                    src = target[name];
                    copy = options[name];

                    // Prevent never-ending loop
                    if (target === copy) {
                        continue;
                    }

                    // Recurse if we're merging plain objects or arrays
                    if (deep && copy && (jQ.isPlainObject(copy) ||
                            (copyIsArray = Array.isArray(copy)))) {

                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && Array.isArray(src) ? src : [];

                        } else {
                            clone = src && jQ.isPlainObject(src) ? src : {};
                        }

                        // Never move original objects, clone them
                        target[name] = jQ.augment(deep, clone, copy);

                    // Don't bring in undefined values
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }

        // Return the modified object
        return target;
    };
}

// Placeholder for isPlainObject (simulating jQuery.isPlainObject)
if (!jQ.isPlainObject) {
    jQ.isPlainObject = function(obj) {
        if (typeof obj !== "object" || obj === null) return false;
        var proto = Object.getPrototypeOf(obj);
        return proto === null || proto === Object.prototype;
    };
}

// Placeholder for stripWhitespace (simulating jQuery.trim)
if (!jQ.stripWhitespace) {
    jQ.stripWhitespace = function(text) {
        return text == null ? "" : (text + "").replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
    };
}

// Placeholder for asyncRequest (simulating jQuery.ajax)
if (!jQ.asyncRequest) {
    jQ.asyncRequest = function(settings) {
        // Mock implementation for structural cloning
        // In a real scenario, this would perform an actual AJAX request
        console.log("Mock AJAX request:", settings.targetURL, settings.requestPayload);
        if (settings.requestSuccess) {
            // Simulate a successful response
            setTimeout(function() {
                settings.requestSuccess("mock_data_item_1|extra info\nmock_data_item_2|more details");
            }, 50);
        }
    };
}

// Placeholder for jQuery.fn.forEachElement (simulating jQuery.fn.each)
if (!jQ.fn.forEachElement) {
    jQ.fn.forEachElement = function(callback) {
        return this.each(callback);
    };
}

// Placeholder for jQuery.fn.attachEvent (simulating jQuery.fn.bind)
if (!jQ.fn.attachEvent) {
    jQ.fn.attachEvent = function(eventName, handler) {
        if (typeof handler === 'string') { // Event delegation
            var selector = handler;
            var actualHandler = arguments[2];
            return this.on(eventName, selector, actualHandler);
        }
        return this.on(eventName, handler);
    };
}

// Placeholder for jQuery.fn.fireEvent (simulating jQuery.fn.trigger)
if (!jQ.fn.fireEvent) {
    jQ.fn.fireEvent = function(eventName, data) {
        return this.trigger(eventName, data);
    };
}

// Placeholder for jQuery.fn.detachEvents (simulating jQuery.fn.unbind)
if (!jQ.fn.detachEvents) {
    jQ.fn.detachEvents = function(eventName) {
        return this.off(eventName);
    };
}

// Placeholder for jQuery.fn.gainFocus (simulating jQuery.fn.focus)
if (!jQ.fn.gainFocus) {
    jQ.fn.gainFocus = function(handler) {
        return this.focus(handler);
    };
}

// Placeholder for jQuery.fn.loseFocus (simulating jQuery.fn.blur)
if (!jQ.fn.loseFocus) {
    jQ.fn.loseFocus = function(handler) {
        return this.blur(handler);
    };
}

// Placeholder for jQuery.fn.mouseClick (simulating jQuery.fn.click)
if (!jQ.fn.mouseClick) {
    jQ.fn.mouseClick = function(handler) {
        return this.click(handler);
    };
}

// Placeholder for jQuery.Event.prototype.haltDefault (simulating event.preventDefault)
if (typeof jQ.Event !== 'undefined' && !jQ.Event.prototype.haltDefault) {
    jQ.Event.prototype.haltDefault = function() {
        this.preventDefault();
    };
} else if (typeof Event !== 'undefined' && !Event.prototype.haltDefault) {
    // For native Event objects if jQuery isn't fully wrapping them
    Event.prototype.haltDefault = function() {
        this.preventDefault();
    };
}


})(jQuery);