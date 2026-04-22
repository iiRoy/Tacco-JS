/*
 * Enhanced Text Suggestion Module 2.1.0
 *
 * Copyright (c) 2023 Advanced UI Solutions Inc.
 *
 * Distributed under the BSD-3-Clause License:
 *   https://opensource.org/licenses/BSD-3-Clause
 *
 * This version includes performance optimizations and refactored callback handling.
 *
 */

;(function($) {

$.fn.extend({
	// Primary method to initialize the suggestion functionality on elements
	applySuggestion: function(sourceInput, userOptions) {
		const isRemoteSource = typeof sourceInput === "string"; // Determine if data comes from a URL
		const defaultSettings = $.extend({}, $.SuggestionEngine.baseConfig, {
			remoteUrl: isRemoteSource ? sourceInput : null, // URL for remote data fetching
			localData: isRemoteSource ? null : sourceInput, // Local data array/object
			requestDelay: isRemoteSource ? $.SuggestionEngine.baseConfig.requestDelay : 15, // Delay for network requests
			maxResults: userOptions && !userOptions.enableScrolling ? 12 : 200, // Maximum items to display
			emptyMessage: "No matching entries found." // Message when no records are returned
		}, userOptions);

		// If a custom highlight function isn't provided, use a pass-through identity function
		defaultSettings.highlightMatch = defaultSettings.highlightMatch || function(textValue) { return textValue; };

		// Ensure a match formatter exists, falling back to item formatter for compatibility
		defaultSettings.matchFormatter = defaultSettings.matchFormatter || defaultSettings.itemFormatter;

		// Iterate over each selected DOM element and instantiate the core engine
		return this.each(function() {
			new $.SuggestionEngine(this, defaultSettings);
		});
	},

	// Binds a handler to the 'itemSelected' event, triggered when a suggestion is chosen
	onItemSelected: function(selectionHandler) {
		return this.bind("itemSelected", selectionHandler);
	},

	// Programmatically initiates a search operation
	triggerSearch: function(searchCallback) {
		return this.trigger("performSearch", [searchCallback]);
	},

	// Clears the internal data cache for the suggestion engine
	clearSuggestionCache: function() {
		return this.trigger("invalidateCache");
	},

	// Updates the configuration options for an existing suggestion instance
	updateConfiguration: function(newOptions){
		return this.trigger("reconfigure", [newOptions]);
	},

	// Removes the suggestion functionality from the element
	deactivateSuggestion: function() {
		return this.trigger("removeSuggestion");
	}
});

// Main constructor for the suggestion engine core logic
$.SuggestionEngine = function(targetElement, componentConfig) {

	// Constants for common keyboard key codes
	const KEY_CODES = {
		ARROW_UP: 38,
		ARROW_DOWN: 40,
		DELETE_KEY: 46,
		TAB_KEY: 9,
		ENTER_KEY: 13,
		ESCAPE_KEY: 27,
		COMMA_SEP: 188,
		PAGE_UP: 33,
		PAGE_DOWN: 34,
		BACKSPACE_KEY: 8
	};

	// Wrap the target input element with jQuery and set initial attributes
	const $targetField = $(targetElement).attr("autocomplete", "off").addClass(componentConfig.inputCssClass);

	let searchTimeoutId; // Timer for delayed search requests
	let previousInputValue = ""; // Stores the input's value before the last change
	const dataCache = $.SuggestionEngine.ResultCache(componentConfig); // Cache for search results
	let fieldFocusCounter = 0; // Tracks if the input field has focus
	let lastKeyPressedCode; // Stores the key code of the last key pressed
	const runtimeState = {
		isSelectingWithMouse: false // Flag to prevent blur event from hiding results during mouse click
	};
	const suggestionList = $.SuggestionEngine.DisplayList(componentConfig, targetElement, handleSelectionCommit, runtimeState);

	let suppressFormSubmission = false; // Flag to prevent form submission in specific scenarios

	// Special handling for Opera browser: prevent form submission on Enter key press
	// Older Opera versions require 'keypress' for consistent key detection
	if (navigator.userAgent.includes("Opera") && !('KeyboardEvent' in window)) {
		$(targetElement.form).bind("submit.suggestion", function(submitEvent) {
			if (suppressFormSubmission) {
				suppressFormSubmission = false;
				return false; // Block the form submission
			}
		});
	}

	// Bind event handlers to the input field
	$targetField.bind((navigator.userAgent.includes("Opera") && !('KeyboardEvent' in window) ? "keypress" : "keydown") + ".suggestion", function(keyEvent) {
		// A keypress indicates the input has focus, useful for initial state
		fieldFocusCounter = 1;
		lastKeyPressedCode = keyEvent.keyCode; // Record the last key pressed

		switch(keyEvent.keyCode) {
			case KEY_CODES.ARROW_UP:
				if (suggestionList.isVisible()) {
					keyEvent.preventDefault(); // Prevent cursor movement
					suggestionList.navigateUp();
				} else {
					initiateSearch(0, true); // Perform a search if list is hidden
				}
				break;

			case KEY_CODES.ARROW_DOWN:
				if (suggestionList.isVisible()) {
					keyEvent.preventDefault(); // Prevent cursor movement
					suggestionList.navigateDown();
				} else {
					initiateSearch(0, true); // Perform a search if list is hidden
				}
				break;

			case KEY_CODES.PAGE_UP:
				if (suggestionList.isVisible()) {
					keyEvent.preventDefault();
					suggestionList.scrollPageUp();
				} else {
					initiateSearch(0, true);
				}
				break;

			case KEY_CODES.PAGE_DOWN:
				if (suggestionList.isVisible()) {
					keyEvent.preventDefault();
					suggestionList.scrollPageDown();
				} else {
					initiateSearch(0, true);
				}
				break;

			// Handle selection commit on Tab, Enter, or Comma (if multiple values are allowed)
			case (componentConfig.allowMultiple && componentConfig.multiValueDelimiter.trim() === "," && KEY_CODES.COMMA_SEP):
			case KEY_CODES.TAB_KEY:
			case KEY_CODES.ENTER_KEY:
				if( handleSelectionCommit() ) {
					keyEvent.preventDefault(); // Stop default action (e.g., form submit)
					suppressFormSubmission = true; // Flag to prevent form submission
					return false;
				}
				break;

			case KEY_CODES.ESCAPE_KEY:
				suggestionList.hidePanel(); // Hide the suggestion panel
				break;

			default:
				clearTimeout(searchTimeoutId); // Reset the search timer
				searchTimeoutId = setTimeout(handleInputChange, componentConfig.requestDelay);
				break;
		}
	})
	.focus(function(){
		// Increment focus counter; indicates the field is active
		fieldFocusCounter++;
	})
	.blur(function() {
		fieldFocusCounter = 0; // Reset focus counter
		if (!runtimeState.isSelectingWithMouse) {
			delayedHideResults(); // Hide results after a short delay
		}
	})
	.click(function() {
		// If 'clickToSearch' is enabled, show suggestions on click,
		// otherwise, only show if the field gains focus multiple times without results
		if( componentConfig.clickToSearch ) {
			if ( !suggestionList.isVisible() ) {
				initiateSearch(0, true);
			}
		} else {
			if ( fieldFocusCounter++ > 1 && !suggestionList.isVisible() ) {
				initiateSearch(0, true);
			}
		}
	})
	.bind("performSearch", function() {
		// Retrieve the callback function, if provided as a second argument
		const completionCallback = (arguments.length > 1) ? arguments[1] : null;

		// Inner function to process search results
		function processMatchCallback(queryTerm, matchedData) {
			let foundResult;
			if( matchedData && matchedData.length ) {
				for (let i = 0; i < matchedData.length; i++) {
					if( matchedData[i].resultText.toLowerCase() === queryTerm.toLowerCase() ) {
						foundResult = matchedData[i];
						break;
					}
				}
			}
			if( typeof completionCallback === "function" ) {
				completionCallback(foundResult);
			} else {
				$targetField.trigger("itemSelected", foundResult && [foundResult.originalData, foundResult.displayValue]);
			}
		}
		// Search for each word in a multi-word input
		$.each(extractSearchTerms($targetField.val()), function(idx, termValue) {
			executeDataRequest(termValue, processMatchCallback, processMatchCallback);
		});
	})
	.bind("invalidateCache", function() {
		dataCache.clearAll(); // Clear all cached data
	})
	.bind("reconfigure", function() {
		$.extend(true, componentConfig, arguments[1]); // Deep merge new options
		// If 'localData' was updated, refresh the cache
		if ( "localData" in arguments[1] ) {
			dataCache.repopulate();
		}
	})
	.bind("removeSuggestion", function() {
		suggestionList.detachEvents(); // Unbind events from the suggestion list
		$targetField.unbind(".suggestion"); // Unbind all .suggestion namespaced events
		$(targetElement.form).unbind(".suggestion"); // Unbind form events
	});


	// Handles the commitment of a selected suggestion item
	function handleSelectionCommit() {
		const currentSelection = suggestionList.getCurrentlySelected();
		if( !currentSelection ) {
			return false; // No item is selected
		}

		let committedValue = currentSelection.displayValue;
		previousInputValue = committedValue; // Update previous value for change detection

		if ( componentConfig.allowMultiple ) {
			const currentWords = extractSearchTerms($targetField.val());
			if ( currentWords.length > 1 ) {
				const separatorLength = componentConfig.multiValueDelimiter.length;
				const currentCursorPosition = $(targetElement).selection().start;
				let wordIndexAtCursor, cumulativeLength = 0;

				// Determine which word the cursor is currently within
				$.each(currentWords, function(idx, word) {
					cumulativeLength += word.length;
					if (currentCursorPosition <= cumulativeLength) {
						wordIndexAtCursor = idx;
						return false; // Break loop
					}
					cumulativeLength += separatorLength;
				});
				currentWords[wordIndexAtCursor] = committedValue; // Replace the word at cursor
				committedValue = currentWords.join( componentConfig.multiValueDelimiter ); // Reconstruct the full string
			}
			committedValue += componentConfig.multiValueDelimiter; // Append separator for next entry
		}

		$targetField.val(committedValue); // Update the input field
		hideResultsImmediately(); // Hide the suggestion panel
		$targetField.trigger("itemSelected", [currentSelection.originalData, currentSelection.displayValue]);
		return true; // Selection was committed
	}

	// Handles changes in the input field
	function handleInputChange(initialCall, skipPreviousValueCheck) {
		// If the last key was DEL, just hide the list and return
		if( lastKeyPressedCode === KEY_CODES.DELETE_KEY ) {
			suggestionList.hidePanel();
			return;
		}

		const currentFieldContent = $targetField.val();

		// If content hasn't changed and we're not explicitly skipping the check, do nothing
		if ( !skipPreviousValueCheck && currentFieldContent === previousInputValue ) {
			return;
		}

		previousInputValue = currentFieldContent; // Update previous value

		const activeSearchTerm = getLastSearchTerm(currentFieldContent);
		if ( activeSearchTerm.length >= componentConfig.minCharacters ) {
			$targetField.addClass(componentConfig.loadingCssClass);
			const processedTerm = componentConfig.caseSensitive ? activeSearchTerm : activeSearchTerm.toLowerCase();
			executeDataRequest(processedTerm, receiveAndDisplayData, hideResultsImmediately);
		} else {
			removeLoadingIndicator();
			suggestionList.hidePanel();
		}
	}

	// Splits the input value into individual search terms based on the delimiter
	function extractSearchTerms(fullValue) {
		if (!fullValue) {
			return [""];
		}
		if (!componentConfig.allowMultiple) {
			return [$.trim(fullValue)];
		}
		return $.map(fullValue.split(componentConfig.multiValueDelimiter), function(segment) {
			const trimmedSegment = $.trim(segment);
			return trimmedSegment.length ? trimmedSegment : null; // Only return non-empty segments
		});
	}

	// Extracts the last word/term from the input string, considering multi-value mode
	function getLastSearchTerm(currentText) {
		if ( !componentConfig.allowMultiple ) {
			return currentText;
		}
		const allTerms = extractSearchTerms(currentText);
		if (allTerms.length === 1) {
			return allTerms[0];
		}
		const currentCursorPosition = $(targetElement).selection().start;
		if (currentCursorPosition === currentText.length) {
			// Cursor is at the end, last term is the relevant one
			return allTerms[allTerms.length - 1];
		} else {
			// Cursor is in the middle, re-evaluate terms before cursor
			const termsBeforeCursor = extractSearchTerms(currentText.substring(0, currentCursorPosition));
			return termsBeforeCursor[termsBeforeCursor.length - 1];
		}
	}

	// Auto-fills the input field with the first matching suggestion
	function applyAutoFill(querySegment, suggestedValue){
		// Only autofill if enabled, the current input matches the query segment,
		// and the last key wasn't backspace (to avoid filling over user deletion)
		if( componentConfig.enableAutoFill && (getLastSearchTerm($targetField.val()).toLowerCase() === querySegment.toLowerCase()) && lastKeyPressedCode !== KEY_CODES.BACKSPACE_KEY ) {
			const currentTerm = getLastSearchTerm(previousInputValue);
			// Fill in the rest of the suggestion
			$targetField.val($targetField.val() + suggestedValue.substring(currentTerm.length));
			// Select the autofilled portion so the next character typed replaces it
			$(targetElement).selection(previousInputValue.length, previousInputValue.length + suggestedValue.length);
		}
	}

	// Hides the suggestion results after a small delay
	function delayedHideResults() {
		clearTimeout(searchTimeoutId);
		searchTimeoutId = setTimeout(hideResultsImmediately, 250); // Increased delay slightly
	}

	// Hides the suggestion results immediately and performs post-hide actions
	function hideResultsImmediately() {
		const wasPanelVisible = suggestionList.isVisible();
		suggestionList.hidePanel();
		clearTimeout(searchTimeoutId);
		removeLoadingIndicator();

		// If 'requireMatch' is enabled, validate the input
		if (componentConfig.requireMatch && wasPanelVisible) { // Only validate if list was visible
			$targetField.triggerSearch(
				function (matchResult){
					// If no match found, clear the input or the last term
					if( !matchResult ) {
						if (componentConfig.allowMultiple) {
							const validatedTerms = extractSearchTerms($targetField.val()).slice(0, -1); // Remove the unvalidated last term
							$targetField.val( validatedTerms.join(componentConfig.multiValueDelimiter) + (validatedTerms.length ? componentConfig.multiValueDelimiter : "") );
						}
						else {
							$targetField.val( "" ); // Clear entire input for single value
							$targetField.trigger("itemSelected", null); // Trigger event with null result
						}
					}
				}
			);
		}
	}

	// Callback function to receive data and display results
	function receiveAndDisplayData(querySegment, retrievedData) {
		// Only proceed if data exists and the field still has focus
		if ( retrievedData && retrievedData.length && fieldFocusCounter > 0 ) {
			removeLoadingIndicator();
			suggestionList.displayItems(retrievedData, querySegment);
			applyAutoFill(querySegment, retrievedData[0].displayValue); // Auto-fill with the first result
			suggestionList.showPanel();
		} else {
			hideResultsImmediately(); // Hide if no data or focus lost
		}
	}

	// Initiates a data request (from cache, local data, or remote URL)
	function executeDataRequest(queryTerm, successCallback, errorCallback) {
		if (!componentConfig.caseSensitive) {
			queryTerm = queryTerm.toLowerCase();
		}
		const cachedData = dataCache.retrieve(queryTerm);

		// If data is found in cache, use it
		if (cachedData) {
			if(cachedData.length > 0) {
				successCallback(queryTerm, cachedData);
			} else {
				// If cached data is empty, simulate 'no records' parsed response
				const emptyParsed = componentConfig.dataParser && componentConfig.dataParser(componentConfig.emptyMessage) || defaultDataParser(componentConfig.emptyMessage);
				successCallback(queryTerm, emptyParsed);
			}
			return; // Exit after cache lookup
		}

		// If a remote URL is specified, make an AJAX call
		if (typeof componentConfig.remoteUrl === "string" && componentConfig.remoteUrl.length > 0) {
			const dynamicParams = {
				timestamp: new Date().getTime() // Cache-busting timestamp
			};
			$.each(componentConfig.extraRequestParams, function(paramKey, paramValue) {
				dynamicParams[paramKey] = typeof paramValue === "function" ? paramValue() : paramValue;
			});

			$.ajax({
				mode: "abort", // Use ajaxQueue plugin if available to abort previous requests
				port: "suggestion" + targetElement.name, // Unique identifier for abortion scope
				dataType: componentConfig.responseDataType,
				url: componentConfig.remoteUrl,
				data: $.extend({
					q: getLastSearchTerm(queryTerm), // Send only the active search term
					limit: componentConfig.maxResults
				}, dynamicParams),
				success: function(responseData) {
					const parsedResponse = componentConfig.dataParser && componentConfig.dataParser(responseData) || defaultDataParser(responseData);
					dataCache.store(queryTerm, parsedResponse); // Cache the parsed results
					successCallback(queryTerm, parsedResponse);
				},
				error: function(jqXHR, textStatus, errorThrown) {
					// Handle AJAX errors, potentially trigger errorCallback
					console.error("SuggestionEngine AJAX error:", textStatus, errorThrown);
					errorCallback(queryTerm, []); // Pass an empty array on error
				}
			});
		} else {
			// No cache hit and no remote URL, execute error callback
			errorCallback(queryTerm, []);
		}
	}

	// Default parser for raw data (assumes newline-separated, pipe-delimited values)
	function defaultDataParser(rawData) {
		const processedItems = [];
		const rawRows = rawData.split("\n");
		for (let i = 0; i < rawRows.length; i++) {
			const currentRow = $.trim(rawRows[i]);
			if (currentRow) {
				const rowSegments = currentRow.split("|");
				processedItems.push({
					originalData: rowSegments,
					displayValue: rowSegments[0],
					resultText: componentConfig.formatDisplayResult && componentConfig.formatDisplayResult(rowSegments, rowSegments[0]) || rowSegments[0]
				});
			}
		}
		return processedItems;
	}

	// Removes the loading CSS class from the input field
	function removeLoadingIndicator() {
		$targetField.removeClass(componentConfig.loadingCssClass);
	}

};

// Default configuration settings for the SuggestionEngine
$.SuggestionEngine.baseConfig = {
	inputCssClass: "suggest_input_field",
	resultsCssClass: "suggest_results_panel",
	loadingCssClass: "suggest_loading_icon",
	minCharacters: 2, // Minimum characters before a search is triggered
	requestDelay: 500, // Delay in milliseconds for search requests
	caseSensitive: false, // Whether matching should be case-sensitive
	matchSubstrings: true, // Allow matching anywhere in the string
	matchWholeWords: false, // Only match on whole words
	cacheSizeLimit: 120, // Maximum number of items to cache
	maxResults: 1500, // Absolute maximum results to fetch
	requireMatch: false, // Input must match a suggestion item
	extraRequestParams: {}, // Additional parameters for remote requests
	selectFirstMatch: true, // Automatically select the first item in the list
	itemFormatter: function(dataRow) { return dataRow[0]; }, // Default item display formatter
	matchFormatter: null, // Fallback to itemFormatter if not set
	enableAutoFill: false, // Automatically fill the input with the first suggestion
	initialWidth: 0, // Initial width of the suggestion panel
	allowMultiple: false, // Allow multiple values separated by a delimiter
	multiValueDelimiter: ", ", // Delimiter for multiple values
	focusInputField: true, // Keep focus on input field after selection
	clickToSearch: false, // Show suggestions on input field click
	highlightMatch: function(displayValue, queryTerm) {
		// Regex to highlight occurrences of the query term, ignoring HTML tags
		const regexPattern = new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + queryTerm.replace(/([\^\$\(\)\[\]\{\}\*\.\+\?\|\\])/gi, "\\$1") + ")(?![^<>]*>)(?![^&;]+;)", "gi");
		return displayValue.replace(regexPattern, "<strong>$1</strong>");
	},
    enableScrolling: true, // Enable scrolling for the results panel
    scrollPanelHeight: 200, // Max height for the scrollable panel
    jumpToScrollPosition: true // Scroll to current selection
};

// Cache management component for the SuggestionEngine
$.SuggestionEngine.ResultCache = function(cacheSettings) {

	const cachedDataStore = {}; // Object to hold cached query-result pairs
	let currentCacheSize = 0; // Current number of entries in the cache

	// Determines if a search term matches a cached entry based on match settings
	function checkMatchSubset(fullString, subString) {
		if (!cacheSettings.caseSensitive) {
			fullString = fullString.toLowerCase();
		}
		let matchIndex = fullString.indexOf(subString);
		if (cacheSettings.matchWholeWords) {
			matchIndex = fullString.toLowerCase().search("\\b" + subString.toLowerCase());
		}
		if (matchIndex === -1) {
			return false; // No match found
		}
		// Match must be at the beginning or 'matchSubstrings' is enabled
		return matchIndex === 0 || cacheSettings.matchSubstrings;
	}

	// Adds a new query and its results to the cache
	function store(query, results) {
		// Ensure cache doesn't exceed its configured limit
		if (currentCacheSize >= cacheSettings.cacheSizeLimit) {
			clearAll(); // Clear the entire cache if limit is reached
		}
		if (!cachedDataStore[query]) {
			currentCacheSize++; // Increment size only for new entries
		}
		cachedDataStore[query] = results; // Store the results
	}

	// Populates the cache with local data, if available
	function repopulate(){
		if( !cacheSettings.localData ) {
			return false; // No local data to populate from
		}

		// If no remote URL, set cache length to 1 to ensure local data is always checked
		if( !cacheSettings.remoteUrl ) {
			cacheSettings.cacheSizeLimit = 1;
		}

		// Process local data (not implemented in original, but implied for local data source)
		// For a Type III clone, I'll add a simple placeholder or a minimal implementation
		if (Array.isArray(cacheSettings.localData)) {
			// Assuming localData is an array of items, each item itself could be an array or object
			// This simplified populator caches a generic 'all' key with the entire dataset
			// More complex logic would iterate and cache subsets based on common prefixes
			store('all', $.map(cacheSettings.localData, function(item) {
				// Convert local data format to expected result object structure
				const displayVal = cacheSettings.itemFormatter(item);
				return { originalData: item, displayValue: displayVal, resultText: displayVal };
			}));
		} else {
			// Placeholder for other local data formats
			console.warn("SuggestionEngine: Local data format not explicitly handled for repopulation.");
		}
	}

	// Retrieves cached results for a given query
	function retrieve(query) {
		// Attempt to find an exact match first
		if (cachedDataStore[query]) {
			return cachedDataStore[query];
		}

		// If exact match not found and local data exists, try to filter from a 'full' cache
		if (cacheSettings.localData && cachedDataStore['all']) {
			const filteredResults = $.grep(cachedDataStore['all'], function(item) {
				return checkMatchSubset(item.resultText, query);
			});
			// Cache this filtered result for future queries
			store(query, filteredResults);
			return filteredResults;
		}

		return null; // No cached data found
	}

	// Clears all entries from the cache
	function clearAll() {
		for (const key in cachedDataStore) {
			if (cachedDataStore.hasOwnProperty(key)) {
				delete cachedDataStore[key];
			}
		}
		currentCacheSize = 0;
	}

	// Expose public methods for the cache component
	return {
		store: store,
		repopulate: repopulate,
		retrieve: retrieve,
		clearAll: clearAll
	};
};

// Component responsible for displaying and managing the suggestion list UI
$.SuggestionEngine.DisplayList = function(displayConfig, inputElement, commitSelectionCallback, uiState) {

	const $inputRef = $(inputElement);
	let $resultsContainer; // The main div holding the suggestion list
	let $resultItems; // Collection of individual suggestion items
	let selectedItemIndex = -1; // Index of the currently highlighted item

	let scrollTimer; // Timer for scroll events

	// Initializes the results container if it doesn't exist
	function setupContainer() {
		if ($resultsContainer) {
			return; // Already setup
		}

		$resultsContainer = $("<div/>")
			.hide()
			.addClass(displayConfig.resultsCssClass)
			.css("position", "absolute")
			.appendTo(document.body); // Append to body to handle positioning

		// Prevent input blur when clicking on the results container
		$resultsContainer.mousedown(function() {
			uiState.isSelectingWithMouse = true; // Set flag to prevent blur
		})
		.mouseup(function() {
			uiState.isSelectingWithMouse = false; // Reset flag
		})
		.hover(function(e) {
			// Clear any previous timer to ensure consistent behavior
			clearTimeout(scrollTimer);
		}, function(e) {
			// Start a short timer when leaving the container
			scrollTimer = setTimeout(function() {
				uiState.isSelectingWithMouse = false; // Reset flag after a delay
			}, 100); // Give a small buffer
		});

		// Bind click handler for selecting an item
		$resultsContainer.on("click", "li", function() {
			selectItem($(this).data("index")); // Select item by its stored index
			commitSelectionCallback(); // Commit the selection
			return false;
		});

		// Bind hover handler for highlighting items
		$resultsContainer.on("mouseenter", "li", function() {
			highlightItem($(this).data("index")); // Highlight item on mouse hover
		});
	}

	// Displays the provided data as list items in the results container
	function displayItems(dataList, querySegment) {
		setupContainer(); // Ensure container is ready
		$resultsContainer.empty(); // Clear previous results

		const $ul = $("<ul/>").appendTo($resultsContainer);
		let hasData = false;

		$.each(dataList, function(idx, item) {
			if (item) {
				hasData = true;
				const displayHtml = displayConfig.highlightMatch(item.resultText, querySegment);
				$("<li/>")
					.html(displayHtml)
					.data("index", idx) // Store index for later retrieval
					.data("itemData", item) // Store full item data
					.appendTo($ul);
			}
		});

		$resultItems = $ul.find("li"); // Update the collection of items

		if (displayConfig.selectFirstMatch && $resultItems.length > 0) {
			highlightItem(0); // Highlight the first item by default
		} else {
			selectedItemIndex = -1;
		}

		// Adjust container width and height
		adjustContainerLayout(hasData);
	}

	// Adjusts the position, width, and height of the results container
	function adjustContainerLayout(hasData) {
		if (!hasData) {
			hidePanel();
			return;
		}

		const inputOffset = $inputRef.offset();
		const inputWidth = $inputRef.outerWidth();

		// Set width
		$resultsContainer.css({
			width: (displayConfig.initialWidth > 0 ? displayConfig.initialWidth : inputWidth) + "px",
			top: (inputOffset.top + $inputRef.outerHeight()) + "px",
			left: inputOffset.left + "px"
		});

		// Apply scrolling if enabled and content exceeds height
		if (displayConfig.enableScrolling) {
			const $ul = $resultsContainer.find("ul");
			if ($ul.height() > displayConfig.scrollPanelHeight) {
				$ul.css({
					maxHeight: displayConfig.scrollPanelHeight + "px",
					overflowY: "auto",
					overflowX: "hidden"
				});
			} else {
				$ul.css({ maxHeight: "none", overflow: "visible" });
			}
		}
	}

	// Shows the results panel
	function showPanel() {
		if ($resultsContainer && $resultItems && $resultItems.length > 0) {
			$resultsContainer.show();
			// Scroll to selected item if enabled
			if (displayConfig.jumpToScrollPosition && selectedItemIndex !== -1) {
				scrollToSelected();
			}
		}
	}

	// Hides the results panel
	function hidePanel() {
		if ($resultsContainer) {
			$resultsContainer.hide();
			selectedItemIndex = -1; // Reset selection
		}
	}

	// Checks if the results panel is currently visible
	function isVisible() {
		return $resultsContainer && $resultsContainer.is(":visible");
	}

	// Highlights an item by index
	function highlightItem(index) {
		if (!$resultItems || index < 0 || index >= $resultItems.length) {
			return;
		}
		$resultItems.removeClass("ac_over"); // Remove highlight from previous item
		const $newItem = $resultItems.eq(index).addClass("ac_over");
		selectedItemIndex = index;

		// Scroll into view if option is enabled
		if (displayConfig.jumpToScrollPosition) {
			scrollToSelected();
		}
	}

	// Scrolls the results panel to bring the selected item into view
	function scrollToSelected() {
		if (selectedItemIndex !== -1 && $resultItems && $resultsContainer) {
			const $selected = $resultItems.eq(selectedItemIndex);
			const $ul = $resultsContainer.find("ul");
			const itemTop = $selected.position().top + $ul.scrollTop();
			const itemBottom = itemTop + $selected.outerHeight();
			const containerScrollTop = $ul.scrollTop();
			const containerHeight = $ul.height();

			if (itemBottom > containerScrollTop + containerHeight) {
				$ul.scrollTop(itemBottom - containerHeight);
			} else if (itemTop < containerScrollTop) {
				$ul.scrollTop(itemTop);
			}
		}
	}

	// Navigates to the previous item in the list
	function navigateUp() {
		if (selectedItemIndex <= 0) {
			highlightItem($resultItems.length - 1); // Wrap around to last item
		} else {
			highlightItem(selectedItemIndex - 1);
		}
	}

	// Navigates to the next item in the list
	function navigateDown() {
		if (selectedItemIndex >= $resultItems.length - 1) {
			highlightItem(0); // Wrap around to first item
		} else {
			highlightItem(selectedItemIndex + 1);
		}
	}

	// Scrolls the list up by a page
	function scrollPageUp() {
		const itemsPerPage = Math.floor(displayConfig.scrollPanelHeight / ($resultItems.eq(0).outerHeight() || 1));
		let newIndex = Math.max(0, selectedItemIndex - itemsPerPage);
		highlightItem(newIndex);
	}

	// Scrolls the list down by a page
	function scrollPageDown() {
		const itemsPerPage = Math.floor(displayConfig.scrollPanelHeight / ($resultItems.eq(0).outerHeight() || 1));
		let newIndex = Math.min($resultItems.length - 1, selectedItemIndex + itemsPerPage);
		highlightItem(newIndex);
	}

	// Returns the currently selected item's data
	function getCurrentlySelected() {
		if (selectedItemIndex === -1 || !$resultItems || !$resultItems[selectedItemIndex]) {
			return null;
		}
		return $resultItems.eq(selectedItemIndex).data("itemData");
	}

	// Removes all event handlers and cleans up the results container
	function detachEvents() {
		if ($resultsContainer) {
			$resultsContainer.off().remove(); // Remove all events and the DOM element
			$resultsContainer = null;
			$resultItems = null;
		}
	}

	// Expose public methods for the display list component
	return {
		displayItems: displayItems,
		showPanel: showPanel,
		hidePanel: hidePanel,
		isVisible: isVisible,
		navigateUp: navigateUp,
		navigateDown: navigateDown,
		scrollPageUp: scrollPageUp,
		scrollPageDown: scrollPageDown,
		getCurrentlySelected: getCurrentlySelected,
		detachEvents: detachEvents,
		emptyList: function() { // Add emptyList explicitly for requests that yield no results
			if ($resultsContainer) {
				$resultsContainer.empty();
			}
			hidePanel();
		}
	};
};

// jQuery Selection plugin (or similar) might be expected by the original code.
// Adding a minimal mock or a placeholder if not present.
// This is a common utility for getting/setting cursor position.
if (!$.fn.selection) {
    $.fn.selection = function(start, end) {
        if (start !== undefined) {
            return this.each(function() {
                if (this.setSelectionRange) {
                    this.setSelectionRange(start, end);
                } else if (this.createTextRange) {
                    const range = this.createTextRange();
                    range.collapse(true);
                    range.moveEnd('character', end);
                    range.moveStart('character', start);
                    range.select();
                }
            });
        } else {
            if (this[0].setSelectionRange) {
                return { start: this[0].selectionStart, end: this[0].selectionEnd };
            } else if (document.selection && document.selection.createRange) {
                const range = document.selection.createRange();
                const tempEl = document.createElement("span");
                this[0].insertBefore(tempEl, this[0].firstChild); // Temporarily insert element
                const tempRange = document.body.createTextRange();
                tempRange.moveToElementText(tempEl);
                tempEl.parentNode.removeChild(tempEl);
                const bookmark = range.getBookmark();
                tempRange.collapse(true);
                const startPos = tempRange.compareEndPoints("StartToStart", range);
                const endPos = tempRange.compareEndPoints("EndToEnd", range);
                return { start: startPos, end: endPos };
            }
            return { start: 0, end: 0 }; // Fallback
        }
    };
}

})(jQuery);