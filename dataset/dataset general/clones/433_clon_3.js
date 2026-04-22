/*
 * autoSuggestWidget: a jQuery plugin, version: 1.0 (2023-10-27)
 * @requires jQuery v1.3 or later
 *
 * This plugin transforms a standard HTML select element into an interactive,
 * autocompleting input field with a dynamic suggestion list. It's designed
 * for quick, "Quicksilver-style" fuzzy matching.
 *
 * For usage and examples, refer to the project documentation.
 *
 * Licensed under the MIT License.
 *
 * Copyright (c) 2009-2023, Various Contributors.
 */
(function($) {
  // Main constructor for the autoSuggestWidget.
  $.autoSuggestWidget = function(sourceSelectElement, configOpts) {
    this.initializeWidget(sourceSelectElement, configOpts);
  };

  // Extend the prototype with core functionalities.
  $.extend($.autoSuggestWidget.prototype, {
    // Default configuration for the widget.
    moduleConfig: {
      permitUnmatchedInput: false,      // If true, allows arbitrary text not in the list.
      activeItemClass: "suggestion_active", // CSS class for the currently highlighted suggestion.
      suggestionListClass: "suggestion_panel", // CSS class for the dropdown container.
      // Functions to generate IDs for the new input and dropdown.
      inputFieldIdGen:    function(originalId)   { return originalId + "_suggest_input"; },
      inputFieldNameGen:  function(originalName) { return; }, // Original behavior was not to set a name on the display input.
      dropdownContainerIdGen: function(originalId) { return originalId + "_suggest_panel"; },
      minCharsForSearch: 1, // Minimum characters before triggering search.
      debugMode: false // Enable console logging for debugging.
    },
    originSelect: null,             // Reference to the original <select> element (after removal).
    displayInput: null,             // The visible text input field.
    valueStoreInput: null,          // The hidden input field to store the actual selected value.
    suggestionContainer: null,      // The div element holding the suggestion list.
    suggestionItemsList: null,      // The <ul> element within the suggestionContainer.
    cachedOptionsData: [],          // Array of objects: {displayText, actualValue, matchScore}.
    filteredMatches: [],            // Current list of matching suggestions.
    lastQueryString: undefined,     // Stores the last search query to avoid redundant processing.
    initialFocusValue: undefined,   // Input value before gaining focus, used for reset.
    currentSelectionIndex: -1,      // Index of the currently highlighted item in filteredMatches.
    itemChosen: false,              // Flag to indicate if an item was explicitly selected.
    mouseOverDropdown: false,       // Flag for handling blur events when mouse is over dropdown.

    /**
     * Initializes the widget by setting up configuration, caching data,
     * rendering UI, and binding events.
     * @param {HTMLElement} sourceSelectElement - The original SELECT element.
     * @param {Object} configOpts - User-defined options.
     */
    initializeWidget: function(sourceSelectElement, configOpts) {
      if (!sourceSelectElement || sourceSelectElement.tagName !== 'SELECT') {
          if (this.moduleConfig.debugMode) console.error("autoSuggestWidget: Invalid source element provided. Must be a SELECT tag.");
          return; // Guard clause: Exit if source element is invalid.
      }
      // Merge user options with default settings.
      $.extend(this.moduleConfig, configOpts);

      this.originSelect = $(sourceSelectElement); // Wrap the source element with jQuery.
      this.prepareOptionCache();                  // Populate the internal cache.
      this.constructUIElements();                 // Create and insert new input/dropdown elements.
      this.bindEventHandlers();                   // Attach all necessary event listeners.

      if (this.moduleConfig.debugMode) console.log("autoSuggestWidget initialized for:", this.originSelect.attr("id"));
    },

    /**
     * Extracts options from the original select and populates the internal cache.
     */
    prepareOptionCache: function() {
      const widgetInstance = this; // Capture 'this' for use within map.
      widgetInstance.cachedOptionsData = widgetInstance.originSelect.find("option").map(function() {
        const optionElem = $(this);
        const displayTxt = $.trim(optionElem.text());
        const actualVal  = optionElem.val();
        return { displayText: displayTxt, actualValue: actualVal, matchScore: 0 };
      }).get(); // .get() to convert jQuery object to a plain array.

      if (widgetInstance.moduleConfig.debugMode) console.log("Cached options:", widgetInstance.cachedOptionsData.length);
    },

    /**
     * Renders the new input field, hidden value field, and the suggestion dropdown.
     * Replaces the original select element.
     */
    constructUIElements: function() {
      const widgetInstance = this;
      const preselectedOption = widgetInstance.originSelect.children("option:selected");
      const originalSelectId = widgetInstance.originSelect.attr("id");
      const originalSelectName = widgetInstance.originSelect.attr("name");
      const originalSelectClass = widgetInstance.originSelect.attr("class");
      const originalSelectStyle = widgetInstance.originSelect.attr("style");
      const originalTabIndex = widgetInstance.originSelect.attr("tabindex");

      // Create the hidden input to hold the actual value.
      widgetInstance.valueStoreInput = $("<input type='hidden'/>").attr({
        id: originalSelectId, // Keep original ID for hidden input
        name: originalSelectName
      }).val(preselectedOption.val() || ""); // Set default value or empty string

      // Create the visible text input.
      widgetInstance.displayInput = $("<input type='text' autocomplete='off' role='combobox' aria-autocomplete='list'/>").attr({
        id: widgetInstance.moduleConfig.inputFieldIdGen(originalSelectId),
        name: widgetInstance.moduleConfig.inputFieldNameGen(originalSelectName), // Will be undefined per original behavior
        tabindex: originalTabIndex,
        style: originalSelectStyle,
        'aria-haspopup': 'listbox',
        'aria-expanded': 'false',
        'aria-controls': widgetInstance.moduleConfig.dropdownContainerIdGen(originalSelectId)
      }).addClass(originalSelectClass || "").val($.trim(preselectedOption.text()));

      // Create the dropdown container.
      widgetInstance.suggestionContainer = $("<div></div>").attr({
        id: widgetInstance.moduleConfig.dropdownContainerIdGen(originalSelectId),
        role: "listbox"
      }).addClass(widgetInstance.moduleConfig.suggestionListClass);

      // Create the unordered list for suggestions.
      widgetInstance.suggestionItemsList = $("<ul></ul>");
      widgetInstance.suggestionContainer.append(widgetInstance.suggestionItemsList);

      // Replace the original select element with the new inputs and append dropdown to body.
      widgetInstance.originSelect.after(widgetInstance.displayInput).after(widgetInstance.valueStoreInput).remove();
      $("body").append(widgetInstance.suggestionContainer);

      if (widgetInstance.moduleConfig.debugMode) console.log("UI elements constructed.");
    },

    /**
     * Binds all necessary event handlers to the input and dropdown elements.
     */
    bindEventHandlers: function() {
      const widgetInstance = this; // Alias 'this' for use in event handlers.

      // Click on input: clear last query, then focus and show suggestions.
      widgetInstance.displayInput.on("click", function(evtObj) {
        evtObj.preventDefault(); // Prevent default browser behavior for click
        widgetInstance.lastQueryString = undefined;
        widgetInstance.setFocusOnInput();
        widgetInstance.processInputForSuggestions(); // Show all if input is empty
      });

      // Mouseup on input: prevent default browser selection in Safari.
      widgetInstance.displayInput.on("mouseup", function(evtObj) {
        evtObj.preventDefault();
      });

      // Focus on input: store current value, select text, then filter if not already picked.
      widgetInstance.displayInput.on("focus", function() {
        widgetInstance.initialFocusValue = widgetInstance.displayInput.val();
        widgetInstance.displayInput.select();
        if (!widgetInstance.itemChosen) {
            widgetInstance.processInputForSuggestions();
        }
        widgetInstance.suggestionContainer.attr('aria-expanded', 'true');
      });

      // Blur from input: hide dropdown if mouse not over it, and reset if no item was picked.
      widgetInstance.displayInput.on("blur", function() {
        if (!widgetInstance.mouseOverDropdown) {
          widgetInstance.concealDropdown();
          if (!widgetInstance.itemChosen && !widgetInstance.moduleConfig.permitUnmatchedInput) {
            widgetInstance.revertInputContent();
          }
        }
        widgetInstance.suggestionContainer.attr('aria-expanded', 'false');
      });

      // Delegate mouseover events on the suggestion list.
      widgetInstance.suggestionItemsList.on("mouseover", "li", function(evtObj) {
        const targetListItem = $(evtObj.currentTarget);
        const listItems = widgetInstance.suggestionItemsList.find("li");
        const itemIndex = listItems.index(targetListItem);
        widgetInstance.highlightSuggestionAtIndex(itemIndex);
      });

      // Mouseleave from the suggestion list: unhighlight all.
      widgetInstance.suggestionItemsList.on("mouseleave", function() {
        widgetInstance.highlightSuggestionAtIndex(-1);
      });

      // Mouseup on suggestion list: confirm selection and refocus.
      widgetInstance.suggestionItemsList.on("mouseup", function(evtObj) {
        evtObj.preventDefault(); // Prevent blur from input
        widgetInstance.confirmSelection();
        widgetInstance.refocusAndConceal();
      });

      // Mouseover on dropdown container: set flag.
      widgetInstance.suggestionContainer.on("mouseover", function() {
        widgetInstance.mouseOverDropdown = true;
      });

      // Mouseleave from dropdown container: clear flag.
      widgetInstance.suggestionContainer.on("mouseleave", function() {
        widgetInstance.mouseOverDropdown = false;
      });

      // Mousedown on dropdown container: prevent input blur.
      widgetInstance.suggestionContainer.on("mousedown", function(evtObj) {
        evtObj.preventDefault();
      });

      // Keyup on input: handle selection/escape/filtering.
      widgetInstance.displayInput.on("keyup", function(evtObj) {
        const keyCode = evtObj.keyCode;
        if (widgetInstance.moduleConfig.debugMode) console.log("Key Up:", keyCode);

        // Handle specific keys with if/else if for variety
        if (keyCode === 13) { // Enter key
          evtObj.preventDefault();
          widgetInstance.confirmSelection();
          widgetInstance.refocusAndConceal();
        } else if (keyCode === 27) { // Escape key
          evtObj.preventDefault();
          widgetInstance.revertInputContent();
          widgetInstance.refocusAndConceal();
        } else {
          // Only process if input value length meets minCharsForSearch or is empty
          if (widgetInstance.displayInput.val().length >= widgetInstance.moduleConfig.minCharsForSearch || widgetInstance.displayInput.val().length === 0) {
              widgetInstance.processInputForSuggestions();
          } else {
              widgetInstance.concealDropdown(); // Hide if input is too short
          }
        }
      });

      // Keydown on input: handle navigation and prevent default actions for specific keys.
      widgetInstance.displayInput.on("keydown", function(evtObj) {
        const keyCode = evtObj.keyCode;
        if (widgetInstance.moduleConfig.debugMode) console.log("Key Down:", keyCode);

        switch (keyCode) {
          case 9:  // Tab key
            widgetInstance.confirmSelection();
            widgetInstance.concealDropdown();
            break;
          case 33: // Page Up
            evtObj.preventDefault();
            widgetInstance.highlightFirst();
            break;
          case 34: // Page Down
            evtObj.preventDefault();
            widgetInstance.highlightLast();
            break;
          case 38: // Up arrow
            evtObj.preventDefault();
            widgetInstance.shiftSelection(-1);
            break;
          case 40: // Down arrow
            evtObj.preventDefault();
            widgetInstance.shiftSelection(1);
            break;
          case 13: // Enter
          case 27: // Escape
            evtObj.preventDefault(); // Prevent form submission or other default actions
            evtObj.stopPropagation(); // Stop propagation to avoid issues with parent elements
            break;
        }
      });

      if (widgetInstance.moduleConfig.debugMode) console.log("Event handlers bound.");
    },

    /**
     * Filters the cached options based on the current input value.
     * Uses a fuzzy matching algorithm (assumed `FuzzyMatcher` globally available).
     */
    processInputForSuggestions: function() {
      const widgetInstance = this;
      const currentInputQuery = widgetInstance.displayInput.val();

      // Guard: If query hasn't changed, no need to re-filter.
      if (currentInputQuery === widgetInstance.lastQueryString) {
          return;
      }
      // Guard: If input is too short and not empty, hide dropdown.
      if (currentInputQuery.length < widgetInstance.moduleConfig.minCharsForSearch && currentInputQuery.length > 0) {
          widgetInstance.concealDropdown();
          return;
      }

      const matchingResults = [];
      // Use forEach for iteration instead of $.each
      widgetInstance.cachedOptionsData.forEach(function(optionItem) {
        // Assume FuzzyMatcher.score is available globally (e.g., LiquidMetal.js)
        // If query is empty, all items get a full score to be displayed.
        optionItem.matchScore = (typeof FuzzyMatcher !== 'undefined' && currentInputQuery.length > 0)
                                ? FuzzyMatcher.score(optionItem.displayText, currentInputQuery)
                                : (currentInputQuery.length === 0 ? 1.0 : 0.0);

        if (optionItem.matchScore > 0.0) {
          matchingResults.push(optionItem);
        }
      });
      widgetInstance.filteredMatches = matchingResults;

      widgetInstance.orderSuggestionsByScore();
      widgetInstance.displaySuggestionDropdown();
      widgetInstance.highlightFirst();
      widgetInstance.lastQueryString = currentInputQuery;
      widgetInstance.itemChosen = false;

      if (widgetInstance.moduleConfig.debugMode) console.log("Suggestions filtered. Matches:", widgetInstance.filteredMatches.length);
    },

    /**
     * Sorts the filtered suggestions by their match score in descending order.
     */
    orderSuggestionsByScore: function() {
      this.filteredMatches.sort(function(itemA, itemB) {
        return itemB.matchScore - itemA.matchScore;
      });
    },

    /**
     * Positions and populates the dropdown with the current filtered suggestions.
     */
    displaySuggestionDropdown: function() {
      const widgetInstance = this;
      const inputField = widgetInstance.displayInput;
      const dropdownPanel = widgetInstance.suggestionContainer;
      const inputPosition = inputField.offset();

      // Calculate dropdown width based on input field.
      const inputWidth = inputField.outerWidth();
      const dropdownPaddingBorder = dropdownPanel.outerWidth() - dropdownPanel.innerWidth();
      const calculatedDropdownWidth = inputWidth - dropdownPaddingBorder;

      // Set dropdown position and width.
      dropdownPanel.css({
        width: calculatedDropdownWidth + "px",
        top: (inputPosition.top + inputField.outerHeight()) + "px",
        left: inputPosition.left + "px"
      });

      const targetListElement = widgetInstance.suggestionItemsList.empty(); // Clear existing items

      if (widgetInstance.filteredMatches.length === 0) {
        // Add a "no results" message if no matches found
        targetListElement.append($("<li class='no-results' role='option' aria-disabled='true'>No matches found</li>"));
      } else {
        // Populate the list with new suggestions.
        widgetInstance.filteredMatches.forEach(function(match, index) {
          // Added a data attribute for potential future use or debugging
          const listItemId = `suggestion-${widgetInstance.originSelect.attr("id")}-${index}`;
          const listItem = $("<li/>")
                            .html(match.displayText)
                            .attr({
                                'data-value': match.actualValue,
                                'role': 'option',
                                'id': listItemId
                            });
          targetListElement.append(listItem);
        });
      }

      dropdownPanel.show();
      inputField.attr('aria-expanded', 'true'); // Update ARIA attribute
      if (widgetInstance.moduleConfig.debugMode) console.log("Dropdown displayed with", widgetInstance.filteredMatches.length, "items.");
    },

    /**
     * Highlights a suggestion item at the given index.
     * @param {number} idx - The index of the item to highlight, or -1 to unhighlight all.
     */
    highlightSuggestionAtIndex: function(idx) {
      if (idx >= this.filteredMatches.length || idx < -1) {
          // Guard: Index out of bounds, do nothing.
          return;
      }

      const listItems = this.suggestionContainer.find("li:not(.no-results)"); // Exclude "no results" message
      listItems.removeClass(this.moduleConfig.activeItemClass);
      this.currentSelectionIndex = idx;

      if (idx >= 0) {
        const selectedItem = $(listItems[idx]);
        selectedItem.addClass(this.moduleConfig.activeItemClass);
        // Add ARIA attributes for accessibility
        this.displayInput.attr('aria-activedescendant', selectedItem.attr('id'));
      } else {
        this.displayInput.removeAttr('aria-activedescendant');
      }

      if (this.moduleConfig.debugMode) console.log("Highlighted index:", idx);
    },

    /**
     * Confirms the current selection, updates input fields, and sets itemChosen flag.
     */
    confirmSelection: function() {
      const widgetInstance = this;
      const selectedMatch = widgetInstance.filteredMatches[widgetInstance.currentSelectionIndex];

      if (selectedMatch) {
        widgetInstance.displayInput.val(selectedMatch.displayText);
        widgetInstance.valueStoreInput.val(selectedMatch.actualValue);
        widgetInstance.itemChosen = true;
      } else if (widgetInstance.moduleConfig.permitUnmatchedInput) {
        // If no selection but mismatch is allowed, clear hidden value.
        widgetInstance.valueStoreInput.val("");
        widgetInstance.itemChosen = true; // Still considered "chosen" in a sense
      } else {
        // If no selection and mismatch not allowed, revert to initial state.
        widgetInstance.revertInputContent();
      }

      if (widgetInstance.moduleConfig.debugMode) console.log("Selection confirmed.");
    },

    /**
     * Hides the suggestion dropdown and clears the last query.
     */
    concealDropdown: function() {
      this.suggestionContainer.hide();
      this.lastQueryString = undefined; // Reset for next search
      this.displayInput.attr('aria-expanded', 'false'); // Update ARIA
      if (this.moduleConfig.debugMode) console.log("Dropdown concealed.");
    },

    /**
     * Moves the highlighted selection up or down by a given delta.
     * @param {number} delta - The number of positions to move (e.g., -1 for up, 1 for down).
     */
    shiftSelection: function(delta) {
      if (this.filteredMatches.length === 0) return; // Guard: No items to select.

      let nextIndex = this.currentSelectionIndex + delta;
      const maxIndex = this.filteredMatches.length - 1;

      // Wrap around logic
      if (nextIndex < 0) {
        nextIndex = maxIndex;
      } else if (nextIndex > maxIndex) {
        nextIndex = 0;
      }
      this.highlightSuggestionAtIndex(nextIndex);
      this.updateInputWithHighlightedItem(); // New intermediate step to update input field.
    },

    /**
     * Updates the input field with the text of the currently highlighted item.
     * This provides a visual cue during navigation.
     */
    updateInputWithHighlightedItem: function() {
      if (this.currentSelectionIndex >= 0 && this.filteredMatches[this.currentSelectionIndex]) {
        const highlightedText = this.filteredMatches[this.currentSelectionIndex].displayText;
        this.displayInput.val(highlightedText);
      } else {
        // If nothing is highlighted, revert to the user's initial input for navigation
        this.displayInput.val(this.initialFocusValue);
      }
    },

    /**
     * Highlights the first item in the suggestion list.
     */
    highlightFirst: function()  { this.highlightSuggestionAtIndex(0); },

    /**
     * Highlights the last item in the suggestion list.
     */
    highlightLast: function()   { this.highlightSuggestionAtIndex(this.filteredMatches.length - 1); },

    /**
     * Resets the input field to its value before it gained focus.
     */
    revertInputContent: function() {
      this.displayInput.val(this.initialFocusValue || ""); // Fallback to empty string
      // Also reset the hidden value if reverting
      const originalOption = this.cachedOptionsData.find(opt => opt.displayText === this.initialFocusValue);
      this.valueStoreInput.val(originalOption ? originalOption.actualValue : "");
      this.itemChosen = false; // Indicate no item was picked
    },

    /**
     * Sets focus on the display input field.
     */
    setFocusOnInput: function() { this.displayInput.focus(); },

    /**
     * Sets focus on the input field and then hides the dropdown.
     */
    refocusAndConceal: function() { this.setFocusOnInput(); this.concealDropdown(); }
  });

  // jQuery plugin definition.
  $.fn.autoSuggest = function(configOpts) {
    this.each(function() {
      // Ensure the element is a SELECT and hasn't been initialized already.
      if (this.tagName === "SELECT" && !$(this).data("autoSuggestWidgetInstance")) {
        const widgetInstance = new $.autoSuggestWidget(this, configOpts);
        $(this).data("autoSuggestWidgetInstance", widgetInstance); // Store instance for future reference
      }
    });
    return this; // Allow chaining.
  };
})(jQuery);