/*
 * Autocomplete - jQuery plugin 1.1pre
 *
 * This plugin provides autocomplete functionality for input fields.
 *
 * Copyright (c) 2007 Dylan Verheul, Dan G. Switzer, Anjesh Tuladhar, Jörn Zaefferer
 *
 * It is distributed under a dual license model:
 *   - MIT License: http://www.opensource.org/licenses/mit-license.php
 *   - GPL License: http://www.gnu.org/licenses/gpl.html
 *
 * Current Revision ID: $Id: jquery.autocomplete.js 5785 2008-07-12 10:37:33Z joern.zaefferer $
 *
 * This file contains the core Autocompleter logic and its integration with jQuery.
 */

// Encapsulate the plugin within an immediately invoked function expression (IIFE)
// to prevent conflicts with other libraries and ensure '$' refers to jQuery.
;
(
	function ($) {

		// Extend jQuery's prototype with autocomplete-related methods.
		$.fn.extend({

			// Main autocomplete method for initializing the plugin on elements.
			autocomplete: function (urlOrData, options) {
				var isUrl = typeof urlOrData == "string";

				options = $.extend({}, $.Autocompleter.defaults, {
					url: isUrl ? urlOrData : null, // Set URL if data is a string, otherwise null.
					data: isUrl ? null : urlOrData, // Set data if not a string, otherwise null.
					delay: isUrl ? $.Autocompleter.defaults.delay : 10, // Use default delay for URL, faster for local data.
					max: options && !options.scroll ? 10 : 150 // Max items, adjusted for scroll option.
				}, options);

				// If highlight function is not provided, use a no-op function.
				options.highlight = options.highlight || function (value) {
					return value;
				};

				// For backward compatibility, if formatMatch is not set, use formatItem.
				options.formatMatch = options.formatMatch || options.formatItem;

				// Iterate over each selected element and initialize Autocompleter.
				return this.each(function () {
					new $.Autocompleter(this, options);
				});
			},

			// Method to bind a handler to the 'result' event.
			result: function (handler) {
				return this.bind("result", handler);
			},

			// Method to trigger a search programmatically.
			search: function (handler) {
				return this.trigger("search", [handler]);
			},

			// Method to clear the autocomplete cache.
			flushCache: function () {
				return this.trigger("flushCache");
			},

			// Method to update options after initialization.
			setOptions: function (options) {
				return this.trigger("setOptions", [options]);
			},

			// Method to remove autocomplete functionality from an element.
			unautocomplete: function () {
				return this.trigger("unautocomplete");
			}
		});


		// The core Autocompleter constructor function.
		$.Autocompleter = function (input, options) {

			// Define key codes for common keyboard actions.
			var KEY = {
				UP: 38, // Up arrow key
				DOWN: 40, // Down arrow key
				DEL: 46, // Delete key
				TAB: 9, // Tab key
				RETURN: 13, // Enter/Return key
				ESC: 27, // Escape key
				COMMA: 188, // Comma key
				PAGEUP: 33, // Page Up key
				PAGEDOWN: 34, // Page Down key
				BACKSPACE: 8 // Backspace key
			};

			// Wrap the input element in a jQuery object, disable browser autocomplete,
			// and add the specified input class.
			var $input = $(input)
				.attr("autocomplete", "off")
				.addClass(options.inputClass);

			var timeout; // Timer for delayed requests.
			var previousValue = ""; // Stores the input's value before the last change.
			var cache = $.Autocompleter.Cache(options); // Instance of the cache.
			var hasFocus = 0; // Tracks if the input field currently has focus.
			var lastKeyPressCode; // Stores the key code of the last key pressed.
			var config = {
				mouseDownOnSelect: false // Flag to prevent blur event when clicking on results.
			};
			var select = $.Autocompleter.Select(options, input, selectCurrent, config); // The results dropdown manager.

			var blockSubmit; // Flag to prevent form submission in Opera.

			// Special handling for Opera to prevent form submission when selecting with Return key.
			$.browser.opera && $(input.form).bind("submit.autocomplete", function () {
				if (blockSubmit) {
					blockSubmit = false; // Reset flag.
					return false; // Prevent default form submission.
				}
			});

			// Bind keyboard events to the input field.
			// Using keypress for Opera, keydown for other browsers.
			$input.bind(($.browser.opera ? "keypress" : "keydown") + ".autocomplete", function (event) {
				// Store the key code of the event.
				lastKeyPressCode = event.keyCode;

				switch (event.keyCode) {

					case KEY.UP: // Up arrow pressed
						event.preventDefault(); // Prevent cursor movement.
						if (select.visible()) {
							select.prev(); // Move to previous item in results.
						} else {
							onChange(0, true); // Show results if not visible.
						}
						break;

					case KEY.DOWN: // Down arrow pressed
						event.preventDefault(); // Prevent cursor movement.
						if (select.visible()) {
							select.next(); // Move to next item in results.
						} else {
							onChange(0, true); // Show results if not visible.
						}
						break;

					case KEY.PAGEUP: // Page Up pressed
						event.preventDefault(); // Prevent page scrolling.
						if (select.visible()) {
							select.pageUp(); // Scroll results up.
						} else {
							onChange(0, true); // Show results if not visible.
						}
						break;

					case KEY.PAGEDOWN: // Page Down pressed
						event.preventDefault(); // Prevent page scrolling.
						if (select.visible()) {
							select.pageDown(); // Scroll results down.
						} else {
							onChange(0, true); // Show results if not visible.
						}
						break;

						// Handle selection with comma (if multiple and separator is comma), Tab, or Return.
					case options.multiple && $.trim(options.multipleSeparator) == "," && KEY.COMMA:
					case KEY.TAB:
					case KEY.RETURN:
						if (selectCurrent()) { // If an item is selected and applied.
							// Stop default event to prevent form submission (Opera needs special handling).
							event.preventDefault();
							blockSubmit = true; // Set flag for Opera.
							return false; // Prevent further event propagation.
						}
						break;

					case KEY.ESC: // Escape key pressed
						select.hide(); // Hide the results dropdown.
						break;

					default: // Any other key pressed
						clearTimeout(timeout); // Clear any existing delay timer.
						timeout = setTimeout(onChange, options.delay); // Set new delay timer for change detection.
						break;
				}
			})
				.focus(function () {
					// Track whether the field has focus. We shouldn't process results
					// if the field no longer has focus.
					hasFocus++;
				})
				.blur(function () {
					hasFocus = 0; // Reset focus tracker.
					// If the blur wasn't caused by clicking on a select item, hide results.
					if (!config.mouseDownOnSelect) {
						hideResults();
					}
				})
				.click(function () {
					// If field has focus and results are not visible, show them on click.
					if (hasFocus++ > 1 && !select.visible()) {
						onChange(0, true);
					}
				})
				.bind("search", function () {
					// Handle the custom 'search' event.
					// Determine the callback function based on arguments.
					var fn = (arguments.length > 1) ? arguments[1] : null;

					// Callback function for finding a specific value.
					function findValueCallback(q, data) {
						var result;
						if (data && data.length) {
							// Iterate through data to find a match.
							for (var i = 0; i < data.length; i++) {
								if (data[i].result.toLowerCase() == q.toLowerCase()) {
									result = data[i];
									break;
								}
							}
						}
						// Invoke the provided callback or trigger 'result' event.
						if (typeof fn == "function") fn(result);
						else $input.trigger("result", result && [result.data, result.value]);
					}

					// Process each word if multiple values are allowed.
					$.each(trimWords($input.val()), function (i, value) {
						request(value, findValueCallback, findValueCallback);
					});
				})
				.bind("flushCache", function () {
					// Clear the internal cache.
					cache.flush();
				})
				.bind("setOptions", function () {
					// Extend current options with new ones.
					$.extend(options, arguments[1]);
					// If data was updated, repopulate the cache.
					if ("data" in arguments[1])
						cache.populate();
				})
				.bind("unautocomplete", function () {
					// Unbind all autocomplete-related events and clean up.
					select.unbind();
					$input.unbind(".autocomplete"); // Unbind all namespaced events.
					$(input.form).unbind(".autocomplete"); // Unbind form events.
				});


			// Function to select the currently highlighted item in the dropdown.
			function selectCurrent() {
				var selected = select.selected(); // Get the selected item.
				if (!selected)
					return false; // No item selected.

				var v = selected.result; // Get the result value.
				previousValue = v; // Update previous value.

				// Handle multiple values scenario.
				if (options.multiple) {
					var words = trimWords($input.val());
					if (words.length > 1) {
						// Reconstruct the input value with the selected item.
						v = words.slice(0, words.length - 1).join(options.multipleSeparator) + options.multipleSeparator + v;
					}
					v += options.multipleSeparator; // Add separator for next entry.
				}

				$input.val(v); // Set the input field's value.
				hideResultsNow(); // Immediately hide results.
				$input.trigger("result", [selected.data, selected.value]); // Trigger 'result' event.
				return true; // Item was selected.
			}

			// Handles changes in the input field, triggering search if criteria are met.
			function onChange(crap, skipPrevCheck) {
				// If DEL key was pressed, hide results and return.
				if (lastKeyPressCode == KEY.DEL) {
					select.hide();
					return;
				}

				var currentValue = $input.val(); // Get current input value.

				// If value hasn't changed and not forced to skip check, return.
				if (!skipPrevCheck && currentValue == previousValue)
					return;

				previousValue = currentValue; // Update previous value.

				currentValue = lastWord(currentValue); // Get the last word for multiple mode.
				if (currentValue.length >= options.minChars) {
					$input.addClass(options.loadingClass); // Add loading class.
					if (!options.matchCase)
						currentValue = currentValue.toLowerCase(); // Convert to lowercase if case-insensitive.
					request(currentValue, receiveData, hideResultsNow); // Make request for data.
				} else {
					stopLoading(); // Remove loading class.
					select.hide(); // Hide results.
				}
			};

			// Splits the input value into words based on the multiple separator.
			function trimWords(value) {
				if (!value) {
					return [""]; // Return an empty array if no value.
				}
				var words = value.split(options.multipleSeparator); // Split by separator.
				var result = [];
				$.each(words, function (i, value) {
					if ($.trim(value)) // Only add non-empty trimmed words.
						result[i] = $.trim(value);
				});
				return result;
			}

			// Extracts the last word from the input value, useful for multiple mode.
			function lastWord(value) {
				if (!options.multiple)
					return value; // Return full value if not in multiple mode.
				var words = trimWords(value); // Get words array.
				return words[words.length - 1]; // Return the last word.
			}

			// Automatically fills in the input box with the first match.
			// q: the query term entered
			// sValue: the first matching result's value
			function autoFill(q, sValue) {
				// Auto-fill only if option is enabled, last word matches query, and last key wasn't backspace.
				if (options.autoFill && (lastWord($input.val()).toLowerCase() == q.toLowerCase()) && lastKeyPressCode != KEY.BACKSPACE) {
					// Fill in the value, preserving user's case for the typed part.
					$input.val($input.val() + sValue.substring(lastWord(previousValue).length));
					// Select the auto-filled portion so the next character typed will replace it.
					$.Autocompleter.Selection(input, previousValue.length, previousValue.length + sValue.length);
				}
			};

			// Delays hiding the results dropdown.
			function hideResults() {
				clearTimeout(timeout);
				timeout = setTimeout(hideResultsNow, 200); // Hide after a short delay.
			};

			// Immediately hides the results dropdown and performs cleanup.
			function hideResultsNow() {
				var wasVisible = select.visible(); // Check if results were visible.
				select.hide(); // Hide the results.
				clearTimeout(timeout); // Clear any pending hide timeout.
				stopLoading(); // Stop loading animation.
				if (options.mustMatch) {
					// If mustMatch is true, perform a search and clear input if no match.
					$input.search(
						function (result) {
							// If no value found, clear the input box.
							if (!result) {
								if (options.multiple) {
									// In multiple mode, remove the last (unmatched) word.
									var words = trimWords($input.val()).slice(0, -1);
									$input.val(words.join(options.multipleSeparator) + (words.length ? options.multipleSeparator : ""));
								} else
									$input.val(""); // Clear the entire input.
							}
						}
					);
				}
				if (wasVisible)
					// Position cursor at the end of the input field.
					$.Autocompleter.Selection(input, input.value.length, input.value.length);
			};

			// Processes received data and displays results.
			function receiveData(q, data) {
				// If data exists, has items, and input has focus.
				if (data && data.length && hasFocus) {
					stopLoading(); // Remove loading indicator.
					select.display(data, q); // Display the results.
					autoFill(q, data[0].value); // Auto-fill with the first result.
					select.show(); // Show the results dropdown.
				} else {
					hideResultsNow(); // Otherwise, hide results.
				}
			};

			// Makes a request for autocomplete data.
			function request(term, success, failure) {
				// Convert term to lowercase if matchCase is false.
				if (!options.matchCase)
					term = term.toLowerCase();

				var data = cache.load(term); // Try to load from cache.
				data = null; // Override: Avoid buggy cache and go to Solr every time. (This line was in original code)

				// If cached data is available, use it.
				if (data && data.length) {
					success(term, data);
					// If an AJAX URL is provided and cache is empty.
				} else if ((typeof options.url == "string") && (options.url.length > 0)) {

					// Prepare extra parameters for the AJAX request.
					var extraParams = {
						timestamp: +new Date() // Add a unique timestamp to prevent caching.
					};
					$.each(options.extraParams, function (key, param) {
						extraParams[key] = typeof param == "function" ? param() : param; // Resolve dynamic params.
					});

					$.ajax({
						// Use ajaxQueue plugin if available to abort previous requests.
						mode: "abort",
						// Limit abortion to requests from this specific input.
						port: "autocomplete" + input.name,
						dataType: options.dataType,
						url: options.url,
						data: $.extend({ // Combine query term and limit with extra params.
							q: lastWord(term), // Query term (last word if multiple).
							limit: options.max // Max number of results.
						}, extraParams),
						success: function (data) {
							// Parse data using custom parser or default parser.
							var parsed = options.parse && options.parse(data) || parse(data);
							cache.add(term, parsed); // Add parsed data to cache.
							success(term, parsed); // Call success callback.
						}
					});
				} else {
					// If no data source (cache or URL) found, or failure.
					// Empty the list to prevent TAB key from selecting a stale match.
					select.emptyList();
					failure(term); // Call failure callback.
				}
			};

			// Default parser for raw data (expects newline-separated, pipe-delimited values).
			function parse(data) {
				var parsed = [];
				var rows = data.split("\n"); // Split data by newlines.
				for (var i = 0; i < rows.length; i++) {
					var row = $.trim(rows[i]); // Trim whitespace from each row.
					if (row) {
						row = row.split("|"); // Split row by pipe character.
						parsed[parsed.length] = { // Add to parsed results.
							data: row, // Raw data array.
							value: row[0], // First element is the value.
							result: options.formatResult && options.formatResult(row, row[0]) || row[0] // Formatted result.
						};
					}
				}
				return parsed;
			};

			// Removes the loading class from the input field.
			function stopLoading() {
				$input.removeClass(options.loadingClass);
			};

		}; // End of $.Autocompleter constructor.


		// Default options for Autocompleter.
		$.Autocompleter.defaults = {
			inputClass: "ac_input", // Class applied to the input element.
			resultsClass: "ac_results", // Class applied to the results container.
			loadingClass: "ac_loading", // Class applied to input while loading.
			minChars: 1, // Minimum characters required to trigger a search.
			delay: 400, // Delay in milliseconds before triggering a search.
			matchCase: false, // Whether to perform case-sensitive matching.
			matchSubset: true, // Whether to match any subset of the string.
			matchContains: false, // Whether to match if the query is contained anywhere in the result.
			cacheLength: 10, // Number of previous searches to cache.
			max: 100, // Maximum number of results to display.
			mustMatch: false, // If true, input value must match a result.
			extraParams: {}, // Additional parameters to send with AJAX requests.
			selectFirst: false, // If true, the first result is automatically selected.
			formatItem: function (row) {
				return row[0];
			}, // Function to format a single item for display.
			formatMatch: null, // Function to format an item for matching.
			autoFill: false, // Whether to auto-fill the input with the first result.
			width: 0, // Width of the results dropdown (0 for auto-width).
			multiple: false, // Whether to allow multiple values separated by a delimiter.
			multipleSeparator: ", ", // Separator for multiple values.
			highlight: function (value, term) { // Function to highlight the matching term in results.
				// Regex to match the term, avoiding HTML tags and entities.
				return value.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + term.replace(/([\^\$\(\)\[\]\{\}\*\.\+\?\|\\])/gi, "\\$1") + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<strong>$1</strong>");
			},
			scroll: true, // Whether to enable scrolling for results if they exceed height.
			scrollHeight: 180 // Max height for results container before scrolling.
		};


		// Cache management object for Autocompleter.
		$.Autocompleter.Cache = function (options) {

			var data = {}; // Stores cached data, keyed by query.
			var length = 0; // Current number of items in cache.

			// Helper function to check if a substring matches.
			function matchSubset(s, sub) {
				if (!options.matchCase)
					s = s.toLowerCase(); // Convert to lowercase if case-insensitive.
				var i = s.indexOf(sub); // Find first occurrence.
				if (options.matchContains == "word") {
					i = s.toLowerCase().search("\\b" + sub.toLowerCase()); // Match whole words.
				}
				if (i == -1) return false; // No match.
				return i == 0 || options.matchContains; // Match at start or anywhere if matchContains.
			};

			// Adds data to the cache.
			function add(q, value) {
				if (length > options.cacheLength) {
					flush(); // Clear cache if it exceeds max length.
				}
				if (!data[q]) {
					length++; // Increment length if new entry.
				}
				data[q] = value; // Store the value.
			}

			// Populates the cache with local data provided in options.data.
			function populate() {
				if (!options.data) return false; // No local data to populate.

				// Stores match sets for different first characters.
				var stMatchSets = {},
					nullData = 0;

				// If no URL, adjust cache length to fit local data.
				if (!options.url) options.cacheLength = 1;

				// Initialize an empty set for minChars = 0 queries.
				stMatchSets[""] = [];

				// Loop through the local data array.
				for (var i = 0, ol = options.data.length; i < ol; i++) {
					var rawValue = options.data[i];
					// Ensure rawValue is an array.
					rawValue = (typeof rawValue == "string") ? [rawValue] : rawValue;

					var value = options.formatMatch(rawValue, i + 1, options.data.length);
					if (value === false)
						continue; // Skip if formatMatch returns false.

					var firstChar = value.charAt(0).toLowerCase(); // Get first char for indexing.
					// If no lookup array for this character exists, create it.
					if (!stMatchSets[firstChar])
						stMatchSets[firstChar] = [];

					// Create a row object for the current data item.
					var row = {
						value: value, // Value used for matching.
						data: rawValue, // Original raw data.
						result: options.formatResult && options.formatResult(rawValue) || value // Formatted result.
					};

					// Push the current match into the set list for its first character.
					stMatchSets[firstChar].push(row);

					// Keep track of items for minChars zero (empty query).
					if (nullData++ < options.max) {
						stMatchSets[""].push(row);
					}
				};

				// Add all generated match sets to the cache.
				$.each(stMatchSets, function (i, value) {
					options.cacheLength++; // Increase cache size.
					add(i, value); // Add to the cache.
				});
			}

			// Populate the cache with initial data after a short delay to allow DOM to render.
			setTimeout(populate, 25);

			// Clears the entire cache.
			function flush() {
				data = {}; // Reset data object.
				length = 0; // Reset length counter.
			}

			// Return the cache object's public methods.
			return {
				flush: flush,
				add: add,
				populate: populate,
				load: function (q) {
					// If matchSubset is enabled, try to find a subset match in cache.
					if (!options.cacheLength || !length)
						return null; // No cache or empty cache.
					if (!options.matchSubset)
						return data[q]; // Return exact match if subset matching is off.

					// Iterate through cached data to find a subset match.
					for (var i = 0; i < length; i++) {
						var entry = data[q.charAt(0).toLowerCase()]; // Try first char match.
						if (entry) {
							var ret = [];
							$.each(entry, function (j, value) {
								if (matchSubset(value.value, q)) {
									ret.push(value);
								}
							});
							return ret;
						}
					}
					return null; // No match found.
				}
			};
		}; // End of $.Autocompleter.Cache.

	}
) // End of IIFE.
(
	jQuery
); // Pass jQuery as the '$' argument.