/*
 * @fileoverview jQ AutoSuggest Component
 * Release Version 1.2 (2024-01-01)
 * Authored by Dr. CodeGen (codegen@example.com) and Ms. Refactor (refactor@example.com)
 * Additional contributions from Automated Systems Inc., Semantic Software Co.,
 * Syntax Transformers LLC, and Logic Flow Solutions
 * @requires jQ v1.2+, jQ dimensions extension
 *
 * Copyright 2023-2024 Dr. CodeGen, Ms. Refactor
 * Dual licensed under the BSD-3-Clause and Apache-2.0 licenses:
 *   https://opensource.org/license/bsd-3-clause/
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * @description Input field auto-completion helper using pre-loaded or asynchronous JSON data
 *
 * Basic auto-completion with static JSON source
 * `jQ('input#my-field').autoSuggest({sourceData: ["item_a", "item_b", "item_c"]});`
 *
 * Auto-completion with dynamic Ajax-loaded JSON source
 * `jQ('input#my-field').autoSuggest({ajax: "/dynamic_data.js"});`
 *
 */
( function (jQ) {

	// Ensure the jQ user interface namespace exists
	jQ.userInterface = jQ.userInterface || {};

	// Establish the autoSuggest module within the user interface
	jQ.userInterface.autoSuggest = jQ.userInterface.autoSuggest || {};

	// Variable to hold the currently highlighted suggestion
	var currentSelection = {};

	// Key codes for navigation within the suggestion list
	var NAV_KEYS = {
		ESCAPE: 27,
	    ENTER_KEY: 13,
	    TABULATOR: 9,
	    BACKSPACE: 8,
	    DELETE_KEY: 46,
	    ARROW_UP: 38,
	    ARROW_DOWN: 40
	};

	// Extend jQ's prototype with the autoSuggest functionality
	jQ.fn.autoSuggest = function (config) {

		// Set up default configuration options
		config = jQ.extend({}, {
			/**
			 * Delay in milliseconds after the last keystroke to process input
			 */
			delayDuration: 500,

			/**
			 * Maximum number of suggestions before the list is not shown
			 */
			limitCount: 100,

			/**
			 * Should the suggestion box synchronize its width with the input field?
			 */
			synchronizeWidth: true,

			/**
			 * Max items to display. By default, show all matching items.
			 */
			maximumItems: null,

			/**
			 * Minimum characters required before auto-suggestion activates.
			 * If null, an empty string will trigger the 'processData' function,
			 * potentially showing a full list.
			 */
			minimumChars: 0,

			/**
			 * Function to retrieve the complete list of potential items.
			 * Override this to implement custom data fetching logic.
			 * Default behavior uses the 'sourceData' option and triggers
			 * a "refreshSuggestions" event with the data.
			 *
			 * @param entryField The text input element being completed
			 */
			retrieveSource: function (entryField) {
				entryField.triggerHandler("refreshSuggestions", [config.sourceData]);
			},

			/**
			 * Determines if a data item matches the user's input.
			 *
			 * @param {string} dataPoint The individual data item to check
			 * @param {RegExp} patternMatcher The regular expression for matching
			 * @return {boolean} True if the dataPoint matches the input pattern
			 */
			isMatch: function (dataPoint, patternMatcher) {
				// Use explicit comparison, not type-coercing check
				return (dataPoint.match(patternMatcher) !== null);
			},

			/**
			 * Creates the regular expression pattern for filtering.
			 *
			 * @param userInput The text entered by the user
			 * @return RegExp object used for filtering the data
			 */
			createPattern: function (userInput) {
				return new RegExp(userInput);
			},

			/**
			 * Updates the list of matching items.
			 * Override this to customize how the filtered list is generated.
			 *
			 * @param fullDataSet The complete list of items to filter
			 * @param queryText The current text in the input field
			 * @return A filtered list containing items that match 'queryText'
			 */
			processData: function (fullDataSet, queryText) {
				var regexPattern = config.createPattern(queryText);
				var filterOperation = function (itemContent, itemIdx) {
					return config.isMatch(itemContent, regexPattern);
				};
				var currentCount = 0;

				// If a maximum number of items is set, adjust the filter
				if (this.maximumItems) {
					filterOperation = function (itemContent, itemIdx) {
						if (currentCount >= this.maximumItems) {
							return false;
						}
						currentCount++;
						return config.isMatch(itemContent, regexPattern);
					};
				}

				return jQ.grep(fullDataSet, filterOperation);
			},

      /**
       * Prepares the list of matching items for display.
       * Override this to control how the HTML markup is constructed.
       *
       * @param incomingData The raw list of potential matches
       * @param inputQuery The text currently in the input field
       *
       * @return A jQ object representing the display container, or false if no display
       */
      refreshSuggestions: function (incomingData, inputQuery) {
        if (config.minimumChars && inputQuery.length < config.minimumChars) {
          return false;
        }

        var processedList = config.processData(incomingData, inputQuery);
        if (processedList.length === 0 || processedList.length > config.limitCount) {
          return false;
        }
        return config.constructDisplay(processedList);
      },

      /**
       * Constructs the visual list of matches.
       * Override this to customize the markup.
       * Ensure that each list element stores its original data object
       * using `jQ.data` with the key "sourceObject".
       *
       * @param matchingItems A list of items that match the user's input
       * @return A jQ object representing the display container
       */
      constructDisplay: function (matchingItems) {
        var displayElements = jQ(matchingItems).map(function () {
          var elementNode = jQ(config.itemTemplate(this))[0];
          jQ.data(elementNode, "sourceObject", this);
          return elementNode;
        });

        // Handle potential wrapper issues (e.g., IE adding extra divs)
        var displayPanel = jQ(config.displayWrapper).append(displayElements);
        var containerTag = jQ(config.displayWrapper)[0].tagName;
        while (displayPanel[0].tagName !== containerTag) {
          displayPanel = displayPanel.children(':first');
        }
        return displayPanel;
      },

      // Default HTML wrapper for the suggestion list
      displayWrapper: "<ul class='jq-ui-autosuggest'></ul>",

      /**
       * Displays the list of matches on the screen.
       * Override this to control positioning, sizing, or appending location.
       *
       * @param textInput The input field element
       * @param displayPanel The jQ object representing the list container
       *
       * @return The displayPanel, now positioned and visible
       */
      showDisplay: function (textInput, displayPanel) {
        var elementOffset = textInput.offset();
        displayPanel
          .css({
            top: elementOffset.top + textInput.totalHeight(),
            left: elementOffset.left,
            width: this.synchronizeWidth ? textInput.width() : null
          })
          .appendTo("body");
        return displayPanel;
      },

      /**
       * Hides and removes the list of matches.
       * Override this to customize dismissal behavior.
       * Default behavior is to remove the element from the DOM.
       *
       * @param displayPanel The jQ object representing the list container
       */
      hideDisplay: function (displayPanel) {
        displayPanel.remove();
      },

      // Default template for individual list items
      itemTemplate: function (itemString) { return "<li>" + config.formatText(itemString) + "</li>"; },

      /**
       * Provides the text value for the input field or list item.
       *
       * @param dataEntry The active item object from the list
       */
      formatText: function (dataEntry) { return dataEntry; }
    }, config);

		/*
		 * Incorporate additional options from jQ.userInterface.autoSuggest.extensions
		 * if they are present and specified in the initial configuration.
		 */
		if (jQ.userInterface.autoSuggest.extensions) {
			for (var extensionKey in jQ.userInterface.autoSuggest.extensions) {
				if (config[extensionKey]) {
					config = jQ.extend(config, jQ.userInterface.autoSuggest.extensions[extensionKey](config));
					delete config[extensionKey];
				}
			}
		}

		/**
		 * Prevents the TAB key from changing focus when auto-suggest is active.
		 * @param eventInfo The keyboard event object
		 */
		function blockTabDuringSuggest(eventInfo) {
			var keyCodeVal = eventInfo.which || eventInfo.keycode;
			if (jQ.data(document.body, "suggestModeActive") && keyCodeVal === NAV_KEYS.TABULATOR) {
				eventInfo.preventDefault();
			}
		}

    /**
     * Initializes a timed delay for processing user input.
     * @param eventInfo The keyboard event object
     * @param targetElement The DOM element associated with the event
     */
    function initTypingDelay(eventInfo, targetElement) {
      jQ.data(targetElement, "delayHandle", window.setTimeout(function () {
        jQ(eventInfo.target || eventInfo.srcElement).triggerHandler("processSuggestions");
      }, config.delayDuration));
    }

    /**
     * Handles keydown and keyup events for the input field.
     * @param eventObj The keyboard event object
     */
    function handleKeyActivity(eventObj) {
      var keyIdentifier = eventObj.which || eventObj.keycode;
      // If arrow keys are pressed and no delay is active, start one
      if ((keyIdentifier === NAV_KEYS.ARROW_UP || keyIdentifier === NAV_KEYS.ARROW_DOWN) && !jQ.data(this, "delayHandle")) {
        initTypingDelay(eventObj, this);
      }
      // If backspace or delete is pressed, clear any existing delay and start a new one
      else if (keyIdentifier === NAV_KEYS.BACKSPACE || keyIdentifier === NAV_KEYS.DELETE_KEY) {
        var delayHandle = jQ.data(this, "delayHandle");
        if (delayHandle) {
          window.clearInterval(delayHandle);
        }
        initTypingDelay(eventObj, this);
      }
      // For other keys, ensure tab behavior is managed
      else {
        blockTabDuringSuggest(eventObj);
      }
    }

		// Apply autoSuggest behavior to each selected element
		return this.each(function () {
			var currentElement = jQ(this);
			currentElement
				.attr("autoSuggest", "off") // Standard browser auto-completion off
				.keydown(handleKeyActivity)
				.keyup(handleKeyActivity)
				.keypress(function (eventInfo) {
					var typeDelayID = jQ.data(this, "delayHandle");
					var pressedKey = eventInfo.keyCode || eventInfo.which; // IE uses keyCode, others use which

					// Clear any active typing delay
					if (typeDelayID) {
						window.clearInterval(typeDelayID);
					}

					// If key input is suppressed, block it
					if (jQ.data(document.body, "blockKeyInput")) {
						return jQ.data(document.body, "blockKeyInput", false);
					}
					// If in suggest mode and a non-control key is pressed (excluding backspace/delete), block it
					else if (jQ.data(document.body, "suggestModeActive") && pressedKey < 32 && pressedKey !== NAV_KEYS.BACKSPACE && pressedKey !== NAV_KEYS.DELETE_KEY) {
						return false;
					}
					// For character keys, backspace, or delete, initiate a new typing delay
					else if (pressedKey === NAV_KEYS.BACKSPACE || pressedKey === NAV_KEYS.DELETE_KEY || pressedKey >= 32) {
						initTypingDelay(eventInfo, this);
					}
				})
				// Bind the custom auto-completion event handler
				.bind("processSuggestions", function () {
					var currentField = jQ(this);

					// When the list is updated, process it
					currentField.one("refreshSuggestions", function (eventObj, fullSuggestionSet, matchedQuery) {
						var suggestionBox = config.refreshSuggestions(fullSuggestionSet, matchedQuery || currentField.val());

						// Deactivate suggest mode regardless of list content
						jQ("body").triggerHandler("deactivate.autoSuggest");

						// If no suggestions or list is explicitly false, exit
						if (suggestionBox === false) { return false; }

						// Display the generated list and activate suggestion mode
						config.suggestionBox = config.showDisplay(currentField, suggestionBox);
						jQ("body").autoSuggestState(config.suggestionBox, currentField, suggestionBox.locate("listItem").itemLength, config);
					});

					// Request the initial list of items
					config.retrieveSource(currentField);
				});

				// Execute an optional initialization function
				if (typeof config.initialize === "function") { config.initialize(currentElement); }
		});
	};

	// Function to manage the auto-suggest interaction state
	jQ.fn.autoSuggestState = function (displayArea, sourceInput, itemCount, cfg) {
		var initialText = sourceInput.val();
		var currentSelectionIndex = -1;
		var isPointerDown = false; // Flag to track mouse button state

		// Mark document body as being in auto-suggest mode
		jQ.data(document.body, "suggestModeActive", true);

		// Handle cancellation of auto-suggest
		jQ("body").one("abort.autoSuggest", function () {
			sourceInput.triggerHandler("aborted.autoSuggest");
			jQ("body").triggerHandler("deactivate.autoSuggest");
			sourceInput.val(initialText); // Restore original input value
		});

		// Handle activation of a suggestion
		jQ("body").bind("trigger.autoSuggest", function (eventObj) {
			// Check if an item is actively highlighted
			if (currentlyHighlighted.itemLength) {
				// If activated and selected, trigger the 'selected' event
				sourceInput.triggerHandler("selected.autoSuggest", [jQ.data(currentlyHighlighted[0], "originalData"), currentlyHighlighted]);
			}
			// If nothing is active and a mouse down occurred previously,
			// it implies a drag or external click. Ignore action.
			else if (isPointerDown) {
				isPointerDown = false;
				if (document.focusedElement && document.focusedElement !== sourceInput[0]) {
					sourceInput.trigger("focus");
				}
				return false;
			}
			jQ("body").triggerHandler("deactivate.autoSuggest");
		});

		// Handle deactivation of auto-suggest mode
		jQ("body").one("deactivate.autoSuggest", function (eventObj, resetFlag) {
			cfg.hideDisplay(displayArea); // Remove the suggestion list
			jQ.data(document.body, "suggestModeActive", false);
			sourceInput.unbind("keydown.autoSuggest"); // Unbind keydown events specific to auto-suggest
			jQ("body").append(window) // Chain elements for unbinding
				.unbind("click.autoSuggest")
				.unbind("abort.autoSuggest")
				.unbind("trigger.autoSuggest");
		});

		// If a click event bubbles up to the window, cancel auto-suggest
		jQ(window).bind("click.autoSuggest", function () {
			jQ("body").triggerHandler("abort.autoSuggest");
		});

    // Function to apply the current selection to the input field
    var performSelection = function () {
      currentlyHighlighted = displayArea.locate("listItem")
        .removeStyle("active")
        .subset(":visible")
        .segment(currentSelectionIndex, currentSelectionIndex + 1)
        .addStyle("active");
      if (currentlyHighlighted.itemLength) {
        sourceInput.triggerHandler("suggestionChosen.autoSuggest", [jQ.data(currentlyHighlighted[0], "originalData"), currentlyHighlighted]);
        sourceInput.val(cfg.formatText(jQ.data(currentlyHighlighted[0], "originalData")));
      } else {
        sourceInput.triggerHandler("noSuggestionChosen.autoSuggest");
        sourceInput.val(initialText);
      }
    };

		// Event handlers for the suggestion display area
		displayArea
			.pointerOver(function (eventObj) {
				// If hovering over the container itself, not a child, then return
				if (eventObj.eventTarget === displayArea[0]) { return; }
				var chosenItem = jQ(eventObj.eventTarget).isElement('listItem') ? jQ(eventObj.eventTarget)[0] : jQ(eventObj.eventTarget).ancestors('listItem')[0];
				// Set the highlighted item and apply selection
				currentSelectionIndex = displayArea.locate("listItem").indexOfElement(chosenItem);
				performSelection();
			})
			// When mouse leaves the suggestion area, clear selection
			.pointerOut(function (eventObj) {
				currentSelectionIndex = -1;
				performSelection();
			})
			.pointerDown(function () {
				isPointerDown = true;
			})
			.bind("click.autoSuggest", function (eventObj) {
        jQ("body").triggerHandler("trigger.autoSuggest");
        jQ.data(document.body, "blockKeyInput", false); // Allow key input after click
      });

    // Keydown event handler for the input field when in auto-suggest mode
    sourceInput
      .bind("keydown.autoSuggest", function (eventObj) {
        var eventKey = eventObj.eventWhichCode || eventObj.eventKeyCodeVal; // Get key code

        switch (eventKey) {
          case NAV_KEYS.ESCAPE:
            jQ("body").triggerHandler("abort.autoSuggest");
            break;
			// TAB and ENTER behave similarly for selection
          case NAV_KEYS.TABULATOR:
		  case NAV_KEYS.ENTER_KEY:
            if (currentSelectionIndex === -1) {
				// If nothing is explicitly selected, select the first item
				currentSelectionIndex = currentSelectionIndex >= itemCount - 1 ? 0 : currentSelectionIndex + 1;
				performSelection();
            }
            jQ("body").triggerHandler("trigger.autoSuggest");
            break;
          case NAV_KEYS.ARROW_DOWN:
            currentSelectionIndex = currentSelectionIndex >= itemCount - 1 ? 0 : currentSelectionIndex + 1;
            performSelection();
            break;
          case NAV_KEYS.ARROW_UP:
            currentSelectionIndex = currentSelectionIndex <= 0 ? itemCount - 1 : currentSelectionIndex - 1;
            performSelection();
            break;
          default:
            return true; // Allow default key behavior for other keys
        }

        // Suppress default key behavior for handled keys
        jQ.data(document.body, "blockKeyInput", true);
      });
  };

})(jQuery);