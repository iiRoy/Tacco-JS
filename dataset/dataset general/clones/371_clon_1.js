/*******************************************************************************
 *  jQuery Autocomplete Plugin                                                 *
 *  Version 1.2.3                                                              *
 *                                                                             *
 *  Copyright (c) 2009 Jörn Zaefferer                                          *
 *                                                                             *
 *  This software is dual licensed under the MIT and GPL licenses.             *
 *  Please see:                                                                *
 *    http://www.opensource.org/licenses/mit-license.php                       *
 *    http://www.gnu.org/licenses/gpl.html                                     *
 *                                                                             *
 *  Minor modifications by Alfonso Gómez-Arzola are included.                  *
 *  Refer to the changelog for further details on these modifications.         *
 *******************************************************************************/

;
(
	function ($) {


		// Extend jQuery's prototype to add autocomplete functionality
		$.fn.extend({

			// The primary autocomplete method, initializes the plugin
			autocomplete: function (urlOrData, options) {

				// Determine if the first argument is a URL string
				var isUrl = typeof urlOrData == "string";

				// Merge default options with user-provided options
				options = $.extend(
					{},
					$.Autocompleter.defaults, {
						url: isUrl ? urlOrData : null, // Set URL if provided as string
						data: isUrl ? null : urlOrData, // Set data if provided as object/array
						delay: isUrl ? $.Autocompleter.defaults.delay : 10, // Adjust delay for local data
						max: options && !options.scroll ? 10 : 150, // Max items to display
						noRecord: "No Records." // Message for no records found
					},
					options
				);

				// Ensure highlight function is defined; default to identity function if not
				options.highlight = options.highlight || function (value) {
					return value;
				};

				// For backward compatibility, use formatItem if formatMatch is not specified
				options.formatMatch = options.formatMatch || options.formatItem;

				// Iterate over each selected element and apply the autocompleter
				return this.each(function () {
					new $.Autocompleter(this, options);
				});
			},

			// Binds a handler to the "result" event
			result: function (handler) {
				return this.bind("result", handler);
			},

			// Triggers the "search" event
			search: function (handler) {
				return this.trigger("search", [handler]);
			},

			// Triggers the "flushCache" event
			flushCache: function () {
				return this.trigger("flushCache");
			},

			// Triggers the "setOptions" event to update configurations
			setOptions: function (options) {
				return this.trigger("setOptions", [options]);
			},

			// Triggers the "unautocomplete" event to remove autocomplete functionality
			unautocomplete: function () {
				return this.trigger("unautocomplete");
			}
		});


		// The core Autocompleter constructor function
		$.Autocompleter = function (input, options) {

			// Define key codes for various keyboard events
			var KEY = {
				UP: 38, // Up arrow key
				DOWN: 40, // Down arrow key
				DEL: 46, // Delete key
				TAB: 9, // Tab key
				RETURN: 13, // Enter key
				ESC: 27, // Escape key
				COMMA: 188, // Comma key (for multiple selections)
				PAGEUP: 33, // Page Up key
				PAGEDOWN: 34, // Page Down key
				BACKSPACE: 8 // Backspace key
			};

			// Initialize a global failure callback
			var globalFailure = null;

			// If a failure callback is provided in options, set it
			if (options.failure != null && typeof options.failure == "function") {
				globalFailure = options.failure;
			}

			// Wrap the input element with jQuery and set its autocomplete attribute to "off"
			// Also add the input class defined in options
			var $input = $(input).attr("autocomplete", "off").addClass(options.inputClass);

			var timeout; // Timer for delaying requests
			var previousValue = ""; // Stores the input's value before a change
			var cache = $.Autocompleter.Cache(options); // Autocomplete data cache
			var hasFocus = 0; // Tracks if the input field has focus
			var lastKeyPressCode; // Stores the key code of the last pressed key
			var config = {
				mouseDownOnSelect: false // Flag to prevent blur event when clicking on select list
			};
			var select = $.Autocompleter.Select(options, input, selectCurrent, config); // The dropdown select list object

			var blockSubmit; // Flag to block form submission

			// Special handling for Opera browser: prevent form submit when selecting with return key
			if (navigator.userAgent.indexOf("Opera") != -1 && $(input.form)) {
				$(input.form).bind("submit.autocomplete", function () {
					if (blockSubmit) {
						blockSubmit = false; // Reset the flag
						return false; // Prevent default form submission
					}
				});
			}

			// Bind keyboard and focus events to the input field
			$input.bind(
				// Use "keypress" for older Opera, "keydown" for others
				(navigator.userAgent.indexOf("Opera") != -1 && !('KeyboardEvent' in window) ? "keypress" : "keydown") + ".autocomplete",
				function (event) {
					// Mark that the input has focus
					hasFocus = 1;

					// Store the key code of the currently pressed key
					lastKeyPressCode = event.keyCode;

					// Handle different key presses
					switch (event.keyCode) {

						case KEY.UP: // Up arrow key
							if (select.visible()) { // If select list is visible
								event.preventDefault(); // Prevent default scroll behavior
								select.prev(); // Move selection up
							} else {
								onChange(0, true); // Trigger change to show suggestions
							}
							break;

						case KEY.DOWN: // Down arrow key
							if (select.visible()) { // If select list is visible
								event.preventDefault(); // Prevent default scroll behavior
								select.next(); // Move selection down
							} else {
								onChange(0, true); // Trigger change to show suggestions
							}
							break;

						case KEY.PAGEUP: // Page Up key
							if (select.visible()) { // If select list is visible
								event.preventDefault(); // Prevent default scroll behavior
								select.pageUp(); // Scroll page up
							} else {
								onChange(0, true); // Trigger change to show suggestions
							}
							break;

						case KEY.PAGEDOWN: // Page Down key
							if (select.visible()) { // If select list is visible
								event.preventDefault(); // Prevent default scroll behavior
								select.pageDown(); // Scroll page down
							} else {
								onChange(0, true); // Trigger change to show suggestions
							}
							break;

							// Handle selection confirmation keys: TAB, RETURN, and COMMA (if multiple enabled)
						case options.multiple && $.trim(options.multipleSeparator) == "," && KEY.COMMA:
						case KEY.TAB:
						case KEY.RETURN:
							if (selectCurrent()) { // If an item was selected
								event.preventDefault(); // Prevent default action (e.g., form submit)
								blockSubmit = true; // Set flag to block form submission
								return false; // Stop further event propagation
							}
							break;

						case KEY.ESC: // Escape key
							select.hide(); // Hide the select list
							break;

						default: // Any other key
							clearTimeout(timeout); // Clear any pending timeout
							timeout = setTimeout(onChange, options.delay); // Set new timeout to trigger change
							break;
					}
				})
				.focus(function () {
					// Increment focus counter
					hasFocus++;
				})
				.blur(function () {
					// Reset focus counter
					hasFocus = 0;
					// If not clicking on the select list, hide results
					if (!config.mouseDownOnSelect) {
						hideResults();
					}
				})
				.click(function () {
					// Show select list when clicking in a focused field
					if (options.clickFire) {
						// If clickFire is true, always show on click if not visible
						if (!select.visible()) {
							onChange(0, true);
						}
					} else {
						// Otherwise, only show if already focused and not visible
						if (hasFocus++ > 1 && !select.visible()) {
							onChange(0, true);
						}
					}
				})
				.bind("search", function () {
					// Extract the callback function from arguments
					var fn = (arguments.length > 1) ? arguments[1] : null;

					// Callback function to find a value in the data
					function findValueCallback(q, data) {
						var result;
						if (data && data.length) {
							// Iterate through data to find a matching result
							for (var i = 0; i < data.length; i++) {
								if (data[i].result.toLowerCase() == q.toLowerCase()) {
									result = data[i];
									break;
								}
							}
						}
						// Call the provided callback or trigger the "result" event
						if (typeof fn == "function") fn(result);
						else $input.trigger("result", result && [result.data, result.value]);
					}
					// Process each word if multiple selection is enabled
					$.each(trimWords($input.val()), function (i, value) {
						request(value, findValueCallback, findValueCallback);
					});
				})
				.bind("flushCache", function () {
					// Clear the autocomplete cache
					cache.flush();
				})
				.bind("setOptions", function () {
					// Deep merge new options into existing ones
					$.extend(true, options, arguments[1]);
					// If data was updated, repopulate the cache
					if ("data" in arguments[1])
						cache.populate();
				})
				.bind("unautocomplete", function () {
					// Unbind all autocomplete-related events
					select.unbind();
					$input.unbind(".autocomplete");
					$(input.form).unbind(".autocomplete");
				});


			// Handles the selection of an item from the dropdown list
			function selectCurrent() {
				var selected = select.selected(); // Get the currently selected item
				if (!selected)
					return false; // No item selected

				var v = selected.result; // Get the result value
				previousValue = v; // Store for future comparison

				// Handle multiple selections
				if (options.multiple) {
					var words = trimWords($input.val()); // Get words from input
					if (words.length > 1) {
						var seperator = options.multipleSeparator.length; // Length of separator
						var cursorAt = $(input).selection().start; // Cursor position
						var wordAt, progress = 0;
						$.each(words, function (i, word) {
							progress += word.length;
							if (cursorAt <= progress) {
								wordAt = i;
								return false; // Found the word at cursor
							}
							progress += seperator;
						});
						words[wordAt] = v; // Replace the word at cursor with selected value
						v = words.join(options.multipleSeparator); // Rejoin words
					}
					v += options.multipleSeparator; // Add separator for next entry
				}

				$input.val(v); // Update input field value
				hideResultsNow(); // Hide the dropdown immediately
				$input.trigger("result", [selected.data, selected.value]); // Trigger result event
				return true; // Item successfully selected
			}

			// Handles changes in the input field
			function onChange(crap, skipPrevCheck) {
				// If the last key pressed was DEL, hide the select list and return
				if (lastKeyPressCode == KEY.DEL) {
					select.hide();
					return;
				}

				var currentValue = $input.val(); // Get current input value

				// If value hasn't changed and not skipping check, return
				if (!skipPrevCheck && currentValue == previousValue)
					return;

				previousValue = currentValue; // Update previous value

				currentValue = lastWord(currentValue); // Get the last word for multiple inputs

				// If current value meets minChars requirement
				if (currentValue.length >= options.minChars) {
					$input.addClass(options.loadingClass); // Add loading class
					if (!options.matchCase)
						currentValue = currentValue.toLowerCase(); // Convert to lowercase if case-insensitive
					request(currentValue, receiveData, hideResultsNow); // Make a data request
				} else {
					stopLoading(); // Stop loading animation
					select.hide(); // Hide the select list
				}
			};

			// Trims words based on the multiple separator
			function trimWords(value) {
				if (!value)
					return [""]; // Return empty array for no value
				if (!options.multiple)
					return [$.trim(value)]; // Return single trimmed word
				// Split by separator, trim each word, and filter out empty strings
				return $.map(value.split(options.multipleSeparator), function (word) {
					return $.trim(value).length ? $.trim(word) : null;
				});
			}

			// Gets the last word from the input value
			function lastWord(value) {
				if (!options.multiple)
					return value; // Return full value if not multiple
				var words = trimWords(value);
				if (words.length == 1)
					return words[0]; // Return the only word
				var cursorAt = $(input).selection().start; // Get cursor position
				if (cursorAt == value.length) {
					words = trimWords(value)
				} else {
					words = trimWords(value.replace(value.substring(cursorAt), "")); // Get words before cursor
				}
				return words[words.length - 1]; // Return the last word
			}

			// Fills in the input box with the first match (autofill)
			// q: the query term entered by the user
			// sValue: the first matching result value
			function autoFill(q, sValue) {
				// Only autofill if enabled, the last word matches the query, and not backspacing
				if (options.autoFill && (lastWord($input.val()).toLowerCase() == q.toLowerCase()) && lastKeyPressCode != KEY.BACKSPACE) {
					// Fill in the value, preserving user's case for the typed part
					$input.val($input.val() + sValue.substring(lastWord(previousValue).length));
					// Select the autofilled portion
					$(input).selection(previousValue.length, previousValue.length + sValue.length);
				}
			};

			// Hides the results after a short delay
			function hideResults() {
				clearTimeout(timeout);
				timeout = setTimeout(hideResultsNow, 200);
			};

			// Hides the results immediately
			function hideResultsNow() {
				var wasVisible = select.visible(); // Check if select list was visible
				select.hide(); // Hide the select list
				clearTimeout(timeout); // Clear any pending timeouts
				stopLoading(); // Stop loading animation
				if (options.mustMatch) {
					// If mustMatch is true, perform a search to validate the current input
					$input.search(
						function (result) {
							// If no result found
							if (!result) {
								if (options.multiple) {
									// For multiple inputs, remove the last word
									var words = trimWords($input.val()).slice(0, -1);
									$input.val(words.join(options.multipleSeparator) + (words.length ? options.multipleSeparator : ""));
								} else {
									// For single input, clear the field
									$input.val("");
									$input.trigger("result", null); // Trigger result with null
								}
							}
						}
					);
				}
			};

			// Callback function to receive and display data
			function receiveData(q, data) {
				// If data exists, has items, and input has focus
				if (data && data.length && hasFocus) {
					stopLoading(); // Stop loading animation
					select.display(data, q); // Display the data in the select list
					autoFill(q, data[0].value); // Attempt to autofill
					select.show(); // Show the select list
				} else {
					hideResultsNow(); // Otherwise, hide results
				}
			};

			// Makes a request for data
			function request(term, success, failure) {
				if (!options.matchCase)
					term = term.toLowerCase(); // Convert term to lowercase if case-insensitive
				var data = cache.load(term); // Try to load data from cache

				// If data is found in cache
				if (data) {
					if (data.length) {
						success(term, data); // Call success callback with cached data
					} else {
						// If cached data is empty, use 'noRecord' message
						var parsed = options.parse && options.parse(options.noRecord) || parse(options.noRecord);
						success(term, parsed);
					}
				}
				// If an AJAX URL is provided and no cache hit
				else if ((typeof options.url == "string") && (options.url.length > 0)) {

					var extraParams = {
						timestamp: +new Date() // Add a unique timestamp
					};
					// Add any extra parameters, evaluating functions if necessary
					$.each(options.extraParams, function (key, param) {
						extraParams[key] = typeof param == "function" ? param() : param;
					});

					// Perform AJAX request
					$.ajax({
						mode: "abort", // Use ajaxQueue plugin to abort previous requests
						port: "autocomplete" + input.name, // Unique port for this input
						dataType: options.dataType, // Expected data type
						url: options.url, // URL for the request
						data: $.extend({
							q: lastWord(term), // Query term
							limit: options.max // Max results limit
						}, extraParams),
						success: function (data) {
							// Parse the received data
							var parsed = options.parse && options.parse(data) || parse(data);
							cache.add(term, parsed); // Add parsed data to cache
							success(term, parsed); // Call success callback
						}
					});
				} else {
					// If no data source (cache or URL), empty the list
					select.emptyList();
					if (globalFailure != null) {
						globalFailure(); // Call global failure handler
					} else {
						failure(term); // Call local failure handler
					}
				}
			};

			// Default function to parse raw data into a structured format
			function parse(data) {
				var parsed = []; // Array to store parsed items
				var rows = data.split("\n"); // Split data by newlines
				for (var i = 0; i < rows.length; i++) {
					var row = $.trim(rows[i]); // Trim whitespace from each row
					if (row) {
						row = row.split("|"); // Split row by pipe character
						parsed[parsed.length] = {
							data: row, // Raw data array
							value: row[0], // First element as value
							result: options.formatResult && options.formatResult(row, row[0]) || row[0] // Formatted result
						};
					}
				}
				return parsed; // Return the array of parsed items
			};

			// Removes the loading class from the input field
			function stopLoading() {
				$input.removeClass(options.loadingClass);
			};

		}; // End of $.Autocompleter constructor


		// Default options for the Autocompleter plugin
		$.Autocompleter.defaults = {
			inputClass: "ac_input", // Class for the input field
			resultsClass: "ac_results", // Class for the results container
			loadingClass: "ac_loading", // Class added to input while loading
			minChars: 1, // Minimum characters to trigger search
			delay: 400, // Delay before triggering search (milliseconds)
			matchCase: false, // Case-sensitive matching
			matchSubset: true, // Match any subset of the input
			matchContains: false, // Match anywhere in the string
			cacheLength: 100, // Maximum number of items to cache
			max: 1000, // Maximum number of results to display
			mustMatch: false, // Must select an item from the list
			extraParams: {}, // Additional parameters for AJAX requests
			selectFirst: true, // Automatically select the first item
			formatItem: function (row) {
				return row[0];
			}, // Default item formatter
			formatMatch: null, // Default match formatter (falls back to formatItem)
			autoFill: false, // Autofill the input with the first match
			width: 0, // Width of the results list (0 for auto)
			multiple: false, // Allow multiple selections
			multipleSeparator: " ", // Separator for multiple selections
			inputFocus: true, // Retain focus on input after selection
			clickFire: false, // Fire autocomplete on click even if not focused
			highlight: function (value, term) { // Default highlight function
				// Escapes special characters in the term for regex
				var escapedTerm = term.replace(/([\^\$\(\)\[\]\{\}\*\.\+\?\|\\])/gi, "\\$1");
				// Replaces occurrences of the term with strong tags, avoiding HTML tags and entities
				return value.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + escapedTerm + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<strong>$1</strong>");
			},
			scroll: true, // Enable scrolling for results
			scrollHeight: 180, // Height of the scrollable area
			scrollJumpPosition: true // Jump to the selected item's position on scroll
		};

		// Autocompleter Cache object constructor
		$.Autocompleter.Cache = function (options) {

			var data = {}; // Stores cached data
			var length = 0; // Current number of items in cache

			// Checks if a subset matches a string
			function matchSubset(s, sub) {
				if (!options.matchCase)
					s = s.toLowerCase(); // Convert to lowercase if case-insensitive
				var i = s.indexOf(sub); // Find index of subset

				if (options.matchContains == "word") {
					// Search for whole word match
					i = s.toLowerCase().search("\\b" + sub.toLowerCase());
				}
				if (i == -1) return false; // No match
				return i == 0 || options.matchContains; // Match at start or anywhere
			};

			// Adds an item to the cache
			function add(q, value) {
				if (length > options.cacheLength) {
					flush(); // Flush cache if it exceeds max length
				}
				if (!data[q]) {
					length++; // Increment length if new entry
				}
				data[q] = value; // Store the value
			}

			// Populates the cache with local data
			function populate() {
				if (!options.data) return false; // No local data provided

				var stMatchSets = {}, // Stores match sets
					nullData = 0; // Counter for null data

				// If no URL, adjust cache length to fit local data
				if (!options.url) options.cacheLength = 1;

				// Track all options for minChars = 0
				// ... (rest of populate logic would go here, which is omitted in original)
			}

			// This is an incomplete function in the original code,
			// so it remains as is, demonstrating Type I clone.
			// It would likely continue to process `options.data`
			// and populate the cache based on matching rules.

		}; // End of $.Autocompleter.Cache constructor

	}
)(jQuery); // Pass jQuery object into the closure