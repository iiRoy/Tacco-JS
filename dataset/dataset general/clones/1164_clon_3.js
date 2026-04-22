// Self-contained module for enhanced input suggestion capabilities.
//
// This script implements an advanced autocomplete/autosuggest jQuery plugin,
// building upon the foundational concepts of an earlier design. It provides
// dynamic suggestions for text input fields, offering improved configurability,
// user experience, and robust event handling.
//
// Contributions and modifications are subject to open-source licensing.

(function(jq) { // Utilizing 'jq' as an alias for jQuery to prevent global namespace collisions.

  // Pre-flight check: Verify that jQuery is loaded.
  // If not, log an error and gracefully exit to prevent runtime failures.
  if (typeof jq === 'undefined' || !jq.fn || !jq.fn.jquery) {
    console.error("Dependency Error: The autoSuggestPro plugin requires jQuery to be loaded.");
    return;
  }

  // --- Core Configuration Constants ---
  // Define a mapping of key codes for keyboard navigation and interaction within the suggestion list.
  const navigationKeyCodes = {
    upArrow: 38,             // Up arrow key to move selection upwards.
    downArrow: 40,           // Down arrow key to move selection downwards.
    confirmSelection: 13,    // Enter key to finalize the selection.
    dismissSuggestions: 27   // Escape key to close the suggestion box without selection.
  };

  // Define comprehensive CSS styles for a highlighted (active) suggestion item.
  // These styles make the currently selected item visually distinct.
  const selectedItemStyle = {
    listStyle: 'none',
    backgroundColor: '#e0f2f7', // A light, calming blue for active state.
    color: '#1a1a1a',            // Darker text for better contrast.
    cursor: 'pointer',           // Indicates interactivity.
    padding: '6px 10px',         // Generous padding for readability.
    borderRadius: '3px'          // Slightly rounded corners.
  };

  // Define CSS styles for unselected (inactive) suggestion items.
  // These are the default visual properties for items in the list.
  const defaultItemStyle = {
    listStyle: 'none',
    backgroundColor: '#ffffff',  // Standard white background.
    color: '#333333',            // Standard dark grey text.
    cursor: 'pointer',
    padding: '6px 10px',
    borderRadius: '3px'
  };

  // Define the base CSS for the suggestion container box itself.
  // This box dynamically appears below the input field.
  const suggestionContainerBaseStyle = {
    minWidth: '200px',           // Ensure a minimum width for the container.
    position: 'absolute',        // Absolute positioning relative to the viewport.
    border: '1px solid #c0c0c0', // Subtle grey border.
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)', // A more pronounced shadow for depth.
    zIndex: 1050,                // High z-index to ensure visibility above other elements.
    maxHeight: '300px',          // Limit height to prevent excessive scrolling.
    overflowY: 'auto',           // Enable vertical scrolling if contents exceed maxHeight.
    listStyleType: 'none',       // Remove default list bullet points.
    margin: '0',                 // Remove default margin.
    padding: '5px 0'             // Internal vertical padding.
  };

  // --- Plugin Definition: autoSuggestPro ---
  // Extends jQuery's prototype to make 'autoSuggestPro' available on jQuery objects.
  jq.fn.autoSuggestPro = function(userOptions) {

    // Establish default configuration settings for the plugin.
    // These can be overridden by the 'userOptions' object.
    const pluginDefaults = {
      sourceDataArray: [],             // Array of strings to use for suggestions.
      minimumInputLength: 2,           // Minimum characters required to trigger suggestions.
      debounceDelayMs: 250,            // Delay in milliseconds before processing keyup events.
      maximumDisplayItems: 12,         // Max number of suggestions shown at once.
      suggestionWrapperId: 'pro-suggestion-panel', // Unique ID for the suggestion container.
      customContainerStyles: {},       // Object for custom CSS overrides on the container.
      customHighlightStyles: {},       // Object for custom CSS overrides on highlighted items.
      customNormalStyles: {},          // Object for custom CSS overrides on normal items.
      onItemSelect: null,              // Callback function executed when a suggestion is chosen.
      noSuggestionsMessage: 'No matches found.' // Message to display if no suggestions.
    };

    // Merge default settings with the provided user options.
    // Deep merge ensures nested objects are correctly combined.
    const settings = jq.extend(true, {}, pluginDefaults, userOptions);

    // Initial validation of the 'sourceDataArray'.
    if (!Array.isArray(settings.sourceDataArray)) {
      console.warn("autoSuggestPro: 'sourceDataArray' must be an array. Plugin initialized with an empty data source.");
      settings.sourceDataArray = [];
    }

    // Iterate over each selected input element to apply the autoSuggestPro functionality.
    return this.each(function() {

      const currentInputElement = jq(this); // Reference to the current input element.
      let suggestionPanel;                   // The jQuery object representing the suggestion container.
      let activeItemIndex = -1;              // Tracks the index of the currently highlighted suggestion.
      let keyupDebounceTimer = null;         // Timer ID for debouncing keyup events.

      // --- Internal Utility Functions ---

      /**
       * Ensures the suggestion panel exists and returns its jQuery object.
       * Creates it if it doesn't already exist in the DOM.
       * @returns {jQuery} The suggestion panel jQuery object.
       */
      function retrieveOrCreateSuggestionPanel() {
        let panel = jq(`#${settings.suggestionWrapperId}`);
        if (panel.length === 0) {
          panel = jq('<ul></ul>') // Using <ul> instead of <div> for semantic list.
            .attr('id', settings.suggestionWrapperId)
            .css(suggestionContainerBaseStyle)
            .css(settings.customContainerStyles) // Apply any custom styles.
            .appendTo('body') // Append to body for flexible positioning.
            .hide(); // Initially hide the panel.
        }
        return panel;
      }

      /**
       * Positions the suggestion panel directly below the input element.
       * It also matches the width of the input for a consistent look.
       */
      function setPanelPosition() {
        const inputPosition = currentInputElement.offset();
        const inputHeight = currentInputElement.outerHeight();
        const inputWidth = currentInputElement.outerWidth();

        suggestionPanel
          .css({
            top: inputPosition.top + inputHeight,
            left: inputPosition.left,
            width: inputWidth // Align width with the input field.
          })
          .show(); // Make the panel visible.
      }

      /**
       * Clears all suggestions from the panel and hides it.
       * Resets the active item index.
       */
      function hideAndClearSuggestions() {
        activeItemIndex = -1; // Reset active item.
        if (suggestionPanel) {
          suggestionPanel.empty().hide(); // Remove all list items and hide the panel.
        }
      }

      /**
       * Applies either the highlighted or normal style to a given list item.
       * @param {jQuery} itemElement - The list item to style.
       * @param {boolean} shouldHighlight - True to apply highlight style, false for normal style.
       */
      function applyListItemStyling(itemElement, shouldHighlight) {
        if (shouldHighlight) {
          itemElement.css(selectedItemStyle).css(settings.customHighlightStyles);
        } else {
          itemElement.css(defaultItemStyle).css(settings.customNormalStyles);
        }
      }

      /**
       * Navigates the suggestion list, updating the highlighted item.
       * Supports moving up or down and wraps around the list.
       * @param {number} keyDirection - The key code indicating up (38) or down (40).
       */
      function navigateSuggestionList(keyDirection) {
        const listItems = suggestionPanel.children('li');
        const itemCount = listItems.length;

        if (itemCount === 0) return; // No items to navigate.

        let nextIndex = activeItemIndex;

        if (keyDirection === navigationKeyCodes.upArrow) {
          nextIndex = (activeItemIndex <= 0) ? itemCount - 1 : activeItemIndex - 1;
        } else if (keyDirection === navigationKeyCodes.downArrow) {
          nextIndex = (activeItemIndex >= itemCount - 1) ? 0 : activeItemIndex + 1;
        } else {
          return; // Invalid navigation key.
        }

        // Remove highlight from the previously active item, if any.
        if (activeItemIndex !== -1) {
          applyListItemStyling(listItems.eq(activeItemIndex), false);
        }

        // Apply highlight to the new active item.
        applyListItemStyling(listItems.eq(nextIndex), true);
        activeItemIndex = nextIndex;

        // Ensure the newly highlighted item is visible within the scrollable panel.
        const highlightedElement = listItems.eq(nextIndex);
        if (highlightedElement.length) {
          const itemTopOffset = highlightedElement.position().top;
          const itemHeight = highlightedElement.outerHeight();
          const panelScrollTop = suggestionPanel.scrollTop();
          const panelHeight = suggestionPanel.height();

          // Scroll up if item is above the visible area.
          if (itemTopOffset < 0) {
            suggestionPanel.scrollTop(panelScrollTop + itemTopOffset);
          }
          // Scroll down if item is below the visible area.
          else if (itemTopOffset + itemHeight > panelHeight) {
            suggestionPanel.scrollTop(panelScrollTop + itemTopOffset - panelHeight + itemHeight);
          }
        }
      }

      /**
       * Selects a suggestion, updates the input field, and dismisses the panel.
       * Triggers an optional callback function.
       * @param {string} selectedValue - The text value of the selected suggestion.
       */
      function finalizeSelection(selectedValue) {
        currentInputElement.val(selectedValue);
        hideAndClearSuggestions();
        // Invoke the custom callback if provided.
        if (typeof settings.onItemSelect === 'function') {
          settings.onItemSelect.call(currentInputElement[0], selectedValue);
        }
        currentInputElement.focus(); // Return focus to the input for continued interaction.
      }

      /**
       * Prevents the default browser action for an event and stops propagation.
       * Crucial for handling key events like Enter or Up/Down arrows.
       * @param {jQuery.Event} eventObject - The jQuery event object.
       * @returns {boolean} Always false to stop default and propagation for jQuery handlers.
       */
      function preventBrowserDefault(eventObject) {
        if (eventObject.preventDefault) {
          eventObject.preventDefault();
        } else {
          eventObject.returnValue = false; // For older IE.
        }
        if (eventObject.stopPropagation) {
          eventObject.stopPropagation();
        }
        // For older IE event bubbling.
        if (eventObject.cancelBubble) {
          eventObject.cancelBubble = true;
        }
        return false;
      }

      // --- Initialization of the Suggestion Panel ---
      suggestionPanel = retrieveOrCreateSuggestionPanel();

      // --- Event Delegation for Mouse Interactions on Suggestions ---
      // Using .on() for event delegation makes it efficient for dynamically added items.
      suggestionPanel
        .on('mouseover', 'li', function() {
          const hoveredItemIndex = jq(this).index();
          // Deselect previous item if different from current hover.
          if (activeItemIndex !== -1 && activeItemIndex !== hoveredItemIndex) {
            applyListItemStyling(suggestionPanel.children('li').eq(activeItemIndex), false);
          }
          applyListItemStyling(jq(this), true); // Highlight the currently hovered item.
          activeItemIndex = hoveredItemIndex;
        })
        .on('click', 'li', function() {
          const selectedText = jq(this).text();
          finalizeSelection(selectedText);
        });

      // --- Input Element Event Handlers ---

      // Handle the 'blur' event (when the input loses focus).
      currentInputElement.on('blur', function() {
        // Introduce a slight delay to allow click events on suggestions to register.
        // This prevents the panel from hiding before a click can be processed.
        setTimeout(function() {
          // Only hide if the panel itself is not being hovered over AND the input is not focused.
          // This allows users to interact with the suggestion list with their mouse.
          if (!suggestionPanel.is(':hover') && !currentInputElement.is(':focus')) {
            hideAndClearSuggestions();
          }
        }, 150); // 150ms delay.
      });

      // Handle 'keydown' events for keyboard-based navigation and selection.
      currentInputElement.on('keydown', function(keyboardEvent) {
        const currentKeyCode = keyboardEvent.keyCode;

        // If the suggestion panel is not visible, only process the Escape key to ensure it's hidden.
        if (suggestionPanel.is(':hidden') && currentKeyCode !== navigationKeyCodes.dismissSuggestions) {
            return;
        }

        switch (currentKeyCode) {
          case navigationKeyCodes.confirmSelection: // Enter key.
            if (activeItemIndex !== -1) {
              const itemTextToSelect = suggestionPanel.children('li').eq(activeItemIndex).text();
              finalizeSelection(itemTextToSelect);
              return preventBrowserDefault(keyboardEvent); // Prevent form submission or newline.
            }
            // If no item is active, allow default Enter behavior (e.g., form submission).
            break;

          case navigationKeyCodes.upArrow:
          case navigationKeyCodes.downArrow:
            navigateSuggestionList(currentKeyCode);
            return preventBrowserDefault(keyboardEvent); // Prevent cursor movement in input.

          case navigationKeyCodes.dismissSuggestions: // Escape key.
            hideAndClearSuggestions();
            return preventBrowserDefault(keyboardEvent); // Prevent default browser actions.

          default:
            // For all other keys, allow default browser behavior.
            break;
        }
      });

      // Handle 'keyup' events for triggering suggestions based on input changes.
      currentInputElement.on('keyup', function(keyboardEvent) {
        const currentKeyCode = keyboardEvent.keyCode;

        // Ignore navigation, selection, and dismissal keys on keyup, as they are handled by keydown.
        if (Object.values(navigationKeyCodes).includes(currentKeyCode)) {
          return;
        }

        // Clear any pending debounce timer to reset the delay.
        if (keyupDebounceTimer) {
          clearTimeout(keyupDebounceTimer);
        }

        const inputText = currentInputElement.val().trim(); // Get and trim the current input value.

        // If input is too short or empty, clear suggestions immediately.
        if (inputText.length < settings.minimumInputLength) {
          hideAndClearSuggestions();
          return;
        }

        // Apply debouncing to avoid excessive filtering on rapid typing.
        keyupDebounceTimer = setTimeout(function() {
          activeItemIndex = -1; // Reset active index for new suggestion list.
          suggestionPanel.empty(); // Clear existing list items before populating.

          const lowerCaseInput = inputText.toLowerCase();
          const matchedSuggestions = [];

          // Filter the source data based on the current input.
          jq.each(settings.sourceDataArray, function(idx, candidateTerm) {
            if (candidateTerm.toLowerCase().includes(lowerCaseInput)) {
              matchedSuggestions.push(candidateTerm);
            }
            // Stop filtering if the maximum number of display items has been reached.
            if (matchedSuggestions.length >= settings.maximumDisplayItems) {
                return false; // Break out of the jq.each loop.
            }
          });

          // If no suggestions were found, display a "no matches" message or hide the panel.
          if (matchedSuggestions.length === 0) {
            if (settings.noSuggestionsMessage) {
                const noMatchItem = jq('<li></li>').text(settings.noSuggestionsMessage).css({
                    padding: '6px 10px',
                    color: '#666',
                    fontStyle: 'italic'
                });
                suggestionPanel.append(noMatchItem).show();
                setPanelPosition(); // Position even if showing 'no matches'.
            } else {
                hideAndClearSuggestions();
            }
            return;
          }

          // Build and append the list items to the suggestion panel.
          jq.each(matchedSuggestions, function(idx, termValue) {
            // Create a regular expression to highlight matching parts within the suggestion.
            // The regex is designed to avoid highlighting inside HTML tags or entities.
            // It escapes special characters in the input text to prevent regex errors.
            const highlightPattern = new RegExp(
              `(?![^&;]+;)(?!<[^<>]*>)(?![^&;]+;)(${inputText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})(?![^<>]*>)(?![^&;]+;)`,
              "gi" // Case-insensitive, global search.
            );
            const highlightedHtml = termValue.replace(highlightPattern, "<strong>$1</strong>");

            const listItemElement = jq('<li></li>')
              .html(highlightedHtml); // Use .html() to render the strong tags.
            applyListItemStyling(listItemElement, false); // Apply default style initially.
            suggestionPanel.append(listItemElement);
          });

          // After populating, ensure the panel is correctly positioned and visible.
          setPanelPosition();

          // Automatically highlight the first suggestion item if available.
          const firstListItem = suggestionPanel.children('li').first();
          if (firstListItem.length > 0) {
            applyListItemStyling(firstListItem, true);
            activeItemIndex = 0;
          }

        }, settings.debounceDelayMs); // End of debounced function.

      }); // End of keyup handler.

    }); // End of .each() loop for input elements.

  }; // End of autoSuggestPro plugin definition.

})(jQuery); // Pass the global jQuery object into the IIFE.