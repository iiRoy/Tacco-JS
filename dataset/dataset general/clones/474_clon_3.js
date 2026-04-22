/*
 * Dynamic Typeahead Suggestion Module for ContentEditable Elements
 *
 * A significant evolution from the original Autocomplete system by J. Doe.
 *
 * Copyright (c) 2023 Acme Corp. and Innovative Devs
 *
 * Distributed under the Permissive and Open Source Licenses:
 *   https://example.com/licenses/permissive.txt
 *   https://example.com/licenses/open.txt
 *
 * Version: 2.1.0-alpha
 */

(function(jq) {

  // Initialize a basic logging utility if not already present.
  // This helps in debugging and understanding execution flow.
  if (window['devLogger'] === undefined) {
    window['devLogger'] = {
      enable: function() {},
      disable: function() {},
      movePanel: function() {},
      resizePanel: function() {},
      clearLogs: function() {},
      trace: function() {},
      info: function() {},
      warn: function() {},
      error: function() {},
      profile: function() {}
    };
  }

  jq.fn.extend({
    suggestiveInput: function(dataSrcOrUri, optConfig) {
      // Determine if the source is a URL string or direct data.
      const isExternalSource = typeof dataSrcOrUri === "string";

      // Merge user options with default settings.
      // Note: Data types (like delay) are slightly altered for variety.
      optConfig = jq.extend({
        formatDisplayEntry: function(itemRecord) {
          // Default formatting for editable results.
          // Note: Added a data attribute for context.
          return `<span contenteditable="false" data-item-id="${itemRecord.id || ''}" class="suggestion-tag" tabindex="-1">#${itemRecord[optConfig.jsonKey]}</span>&nbsp;`;
        }
      }, jq.SuggestionCore.defaultSettings, {
        sourceUrl: isExternalSource ? dataSrcOrUri : null,
        localData: isExternalSource ? null : dataSrcOrUri,
        fetchDelayMs: isExternalSource ? jq.SuggestionCore.defaultSettings.fetchDelayMs : 15,
        maxResults: optConfig && !optConfig.enableScrolling ? 12 : 200
      }, optConfig);

      // Ensure essential formatters are defined.
      optConfig.formatResultValue = optConfig.formatResultValue || function(itemRecord) {
        return itemRecord[optConfig.jsonKey];
      };
      optConfig.highlightMatch = optConfig.highlightMatch || function(textValue) {
        return textValue;
      }; // No-op if not provided.
      optConfig.formatMatchCriteria = optConfig.formatMatchCriteria || function(itemRecord) {
        return itemRecord[optConfig.jsonKey];
      };
      optConfig.formatListItem = optConfig.formatListItem || function(itemRecord) {
        return itemRecord[optConfig.jsonKey];
      };

      // Iterate over each selected element to apply the plugin.
      return this.each(function() {
        new jq.SuggestionCore(this, optConfig);
      });
    },
    // Custom event binding for when a result is selected.
    onResultSelection: function(eventHandler) {
      return this.on("itemSelected", eventHandler);
    },
    // Trigger a search explicitly.
    initiateSearch: function(triggerHandler) {
      return this.trigger("performSearch", [triggerHandler]);
    },
    // Clear the internal data cache.
    purgeCache: function() {
      return this.trigger("clearDataCache");
    },
    // Update plugin options dynamically.
    configureOptions: function(newOptions) {
      return this.trigger("updateSettings", [newOptions]);
    },
    // Remove the plugin functionality.
    removeSuggestiveInput: function() {
      return this.trigger("deactivateSuggestion");
    },
    // Custom event for no results found.
    noMatchFound: function() {
      return this.trigger("suggest_nomatch");
    }
  });

  jq.SuggestionCore = function(targetElement, operationalOptions) {

    // Define common keyboard key codes for event handling.
    const KEY_CODES = {
      ARROW_UP: 38,
      ARROW_DOWN: 40,
      DELETE_KEY: 46,
      TAB_KEY: 9,
      ENTER_KEY: 13,
      SHIFT_KEY: 16,
      ESCAPE_KEY: 27,
      COMMA_KEY: 188,
      PAGE_UP: 33,
      PAGE_DOWN: 34,
      BACKSPACE_KEY: 8,
      SPACE_KEY: 32,
      ARROW_LEFT: 37,
      ARROW_RIGHT: 39,
      AT_SYMBOL: 50, // Usually Shift+2
      HASH_SYMBOL: 34, // Usually Shift+3
      DOLLAR_SYMBOL: 52, // Usually Shift+4
      SEMICOLON_KEY: 59
    };

    // Wrap the input element with jQuery and set initial attributes.
    const $targetInput = jq(targetElement).attr("autocomplete", "off").addClass(operationalOptions.inputCssClass);

    let activityTimer; // Timer for delayed execution.
    let previousTextValue = ""; // Stores the last processed input value.
    const dataStore = jq.SuggestionCore.DataCache(operationalOptions); // Cache for suggestions.
    let elementHasFocus = 0; // Tracks focus state.
    let currentCursorPosition = 0; // Cursor position for contenteditable.
    let editableHostElement = null; // Reference to contenteditable div.
    let editableSelectionTracker, editableRangeTracker; // For managing contenteditable selections.
    let lastKeyCodePressed; // Last key pressed.
    let secondLastKeyCodePressed; // Second last key pressed.
    let thirdLastKeyCodePressed; // Third last key pressed.
    const activationTrigger = operationalOptions.hotkeyCharacter || "@"; // Hotkey character, default '@'.
    let isActiveAutocompletion = operationalOptions.enableHotkeyMode ? false : true; // Autocompletion state.
    const internalState = {
      isMouseDownOnDropdown: false // Flag to prevent blur on dropdown click.
    };
    const dropdownList = jq.SuggestionCore.SuggestionList(operationalOptions, targetElement, applyCurrentSelection, internalState);

    let blockFormSubmission; // Flag to prevent form submission.

    // Initialize contenteditable specific dimensions if applicable.
    if (targetElement.value === undefined && operationalOptions.panelWidth < 1) {
      editableHostElement = jq(targetElement)[0];
      operationalOptions.panelWidth = jq(targetElement).parent().parent().width();
      operationalOptions.panelLeftOffset = jq(targetElement).parent().parent().offset().left;
    }

    // Prevent form submission in Opera when an item is selected with Enter.
    // Note: Browser sniffing is legacy, but for Type III, mimicking original behavior.
    jq.browser.opera && jq(targetElement.form).on("submit.suggest", function(evt) {
      if (blockFormSubmission) {
        blockFormSubmission = false;
        return false; // Prevent default submit.
      }
    });

    // Bind keyboard events for suggestion control.
    $targetInput.on((jq.browser.opera ? "keypress" : "keydown") + ".suggest", function(keyboardEvent) {
      // Mark input as focused.
      elementHasFocus = 1;

      const eventKey = keyboardEvent.keyCode || keyboardEvent.which; // Standardize key code.
      // devLogger.trace("Key pressed: " + eventKey);

      // Log enter key specific behavior for debugging.
      if (eventKey === KEY_CODES.ENTER_KEY) {
        // devLogger.trace(`Enter key pressed (code: ${eventKey}). Suppress return: ${operationalOptions.suppressReturn}`);
      }

      // Update key press history.
      thirdLastKeyCodePressed = secondLastKeyCodePressed;
      secondLastKeyCodePressed = lastKeyCodePressed;
      lastKeyCodePressed = eventKey;

      // Handle hotkey activation mode.
      if (operationalOptions.enableHotkeyMode && isActiveAutocompletion === false) {
        if (eventKey === KEY_CODES.AT_SYMBOL && keyboardEvent.shiftKey &&
          (KEY_CODES.SPACE_KEY === thirdLastKeyCodePressed || thirdLastKeyCodePressed === undefined)) {
          isActiveAutocompletion = true;
          devLogger.info("Suggestion module now active in Hotkey mode.");
          clearTimeout(activityTimer);
          activityTimer = setTimeout(handleInputChange, operationalOptions.fetchDelayMs);
        }
        return; // Exit early if hotkey mode is not active.
      }

      // Process key events for navigation and selection.
      switch (eventKey) {
        case KEY_CODES.ARROW_UP:
          keyboardEvent.preventDefault();
          if (dropdownList.isVisible()) {
            dropdownList.selectPrevious();
          } else {
            handleInputChange(0, true); // Trigger search if dropdown not visible.
          }
          break;

        case KEY_CODES.ARROW_DOWN:
          keyboardEvent.preventDefault();
          if (dropdownList.isVisible()) {
            dropdownList.selectNext();
          } else {
            handleInputChange(0, true); // Trigger search if dropdown not visible.
          }
          break;

        case KEY_CODES.PAGE_UP:
          keyboardEvent.preventDefault();
          if (dropdownList.isVisible()) {
            dropdownList.navigatePageUp();
          } else {
            handleInputChange(0, true);
          }
          break;

        case KEY_CODES.PAGE_DOWN:
          keyboardEvent.preventDefault();
          if (dropdownList.isVisible()) {
            dropdownList.navigatePageDown();
          } else {
            handleInputChange(0, true);
          }
          break;

          // Handle selection and submission keys.
          // Includes comma for multiple selections and semicolon.
        case operationalOptions.allowMultiple && jq.trim(operationalOptions.multipleSeparator) === "," && KEY_CODES.COMMA_KEY:
        case KEY_CODES.TAB_KEY:
        case KEY_CODES.ENTER_KEY:
        case KEY_CODES.ARROW_RIGHT:
        case KEY_CODES.SEMICOLON_KEY:
          if (eventKey === KEY_CODES.ENTER_KEY) {
            keyboardEvent.preventDefault(); // Prevent default enter behavior initially.
          }
          if (applyCurrentSelection()) {
            // If an item was selected, prevent form submit and hide results.
            // devLogger.trace(`Selected item, key: ${eventKey}. Suppress return: ${operationalOptions.suppressReturn}`);
            if (eventKey === KEY_CODES.ENTER_KEY && operationalOptions.suppressReturn) {
              keyboardEvent.preventDefault(); // Final prevention for return key.
            }
            blockFormSubmission = true;
            hideSuggestionResultsImmediately();
            if (operationalOptions.enableHotkeyMode || operationalOptions.allowMultiple === true) {
              // devLogger.trace("Hotkey/multiple mode, returning false.");
              return false; // Stop further processing for these modes.
            }
          } else {
            // No selection made, trigger a 'not found' event.
            // devLogger.trace("No item selected. Triggering 'notfound' event.");
            $targetInput.trigger("suggest_nomatch", {});
            hideSuggestionResultsImmediately();
            if (eventKey === KEY_CODES.ENTER_KEY && operationalOptions.suppressReturn) {
              keyboardEvent.preventDefault();
            }
          }
          // devLogger.trace(`Key was TAB or ENTER: ${eventKey === KEY_CODES.TAB_KEY || eventKey === KEY_CODES.ENTER_KEY}`);
          break;

        case KEY_CODES.ESCAPE_KEY:
          dropdownList.hide();
          break;

        default:
          // For other keys, trigger a delayed search if active.
          if (isActiveAutocompletion === true) {
            clearTimeout(activityTimer);
            activityTimer = setTimeout(handleInputChange, operationalOptions.fetchDelayMs);
          }
          break;
      }
    }).focus(function() {
      // Track focus state.
      elementHasFocus++;
      // devLogger.trace("Input received focus. Focus count: " + elementHasFocus);

      if (isActiveAutocompletion === true && operationalOptions.enableHotkeyMode) {
        handleInputChange(0, true);
      } else if (!operationalOptions.enableHotkeyMode) {
        if (!isActiveAutocompletion) {
          isActiveAutocompletion = true;
        }
        handleInputChange(0, true);
      }
    }).blur(function() {
      elementHasFocus = 0;
      if (!internalState.isMouseDownOnDropdown) {
        hideSuggestionResults(); // Hide results on blur, unless mouse is on dropdown.
      }
    }).click(function() {
      // On click, if already focused and dropdown not visible, trigger search.
      if (elementHasFocus > 1 && !dropdownList.isVisible()) {
        handleInputChange(0, true);
      } else {
        // devLogger.trace(`Click event: focus=${elementHasFocus}, visible=${dropdownList.isVisible()}`);
      }
    }).on('itemSelected', function() {
      elementHasFocus = 0; // Reset focus state after selection.
      hideSuggestionResults();
    }).on("performSearch", function() {
      const callbackFn = (arguments.length > 1) ? arguments[1] : null;

      function processFoundValue(queryTerm, foundData) {
        let matchedResult;
        if (foundData && foundData.length) {
          for (let i = 0; i < foundData.length; i++) {
            if (foundData[i].result.toLowerCase() === queryTerm.toLowerCase()) {
              matchedResult = foundData[i];
              break;
            }
          }
        }
        if (typeof callbackFn === "function") {
          callbackFn(matchedResult);
        } else {
          $targetInput.trigger("itemSelected", matchedResult && [matchedResult.data, matchedResult.value]);
        }
      }
      // Assuming 'splitInputWords' and 'getCurrentInputValue' are helper methods.
      jq.each(splitInputWords(getCurrentInputValue()), function(idx, term) {
        fetchData(term, processFoundValue, processFoundValue);
      });
    }).on("clearDataCache", function() {
      dataStore.clearAll();
    }).on("updateSettings", function() {
      jq.extend(operationalOptions, arguments[1]);
      // If data was updated, re-populate the cache.
      if ("localData" in arguments[1]) {
        dataStore.refresh();
      }
    }).on("deactivateSuggestion", function() {
      dropdownList.unbindEvents();
      $targetInput.off(".suggest");
      jq(targetElement.form).off(".suggest");
    });


    // Function to apply the currently selected suggestion.
    function applyCurrentSelection() {
      const chosenItem = dropdownList.retrieveSelected();
      if (!chosenItem) {
        return false;
      }

      let newInputValue = chosenItem.result;
      previousTextValue = newInputValue;

      if (operationalOptions.allowMultiple) {
        let currentWords = splitInputWords(getCurrentInputValue());
        const separatorLength = operationalOptions.multipleSeparator.length;
        let caretAt = jq(targetElement).selection().start; // Assuming a selection plugin.
        let wordIndexAtCaret, currentProgress = 0;

        jq.each(currentWords, function(idx, word) {
          currentProgress += word.length;
          if (caretAt <= currentProgress) {
            wordIndexAtCaret = idx;
            return false; // Break loop.
          }
          currentProgress += separatorLength;
        });
        currentWords[wordIndexAtCaret] = newInputValue;
        newInputValue = currentWords.join(operationalOptions.multipleSeparator);

      } else if (operationalOptions.enableHotkeyMode) {
        isActiveAutocompletion = false; // Deactivate hotkey mode after selection.
        let currentContent = getCurrentInputValue();
        // Remove the partial word that triggered the suggestion.
        currentContent = currentContent.substring(0, currentCursorPosition - 1);
        // devLogger.info(`Data found: ${chosenItem.data[0]} ${chosenItem.data[1]}`);
        newInputValue = currentContent + operationalOptions.formatDisplayEntry(chosenItem.data);

        // For contenteditable, add a temporary cursor marker.
        if (targetElement.value === undefined) {
          newInputValue = newInputValue + '<span id="tempCaretMarker">—</span>';
        }
      }

      // Update input field and trigger 'itemSelected' event.
      setCurrentInputValue(newInputValue);
      hideSuggestionResultsImmediately();
      $targetInput.trigger("itemSelected", [chosenItem.data, chosenItem.value]);

      // Restore cursor position for contenteditable.
      if (operationalOptions.enableHotkeyMode && targetElement.value === undefined) {
        restoreEditableCaret();
      }
      return true;
    }

    // Placeholder for contenteditable setup, potentially more complex.
    function initializeContentEditable() {
      if (editableSelectionTracker && editableSelectionTracker.getRangeAt !== undefined) {
        // Standard browser handling.
      } else if (document.createRange && editableSelectionTracker &&
        editableSelectionTracker.anchorNode && editableSelectionTracker.anchorOffset &&
        editableSelectionTracker.focusNode && editableSelectionTracker.focusOffset) {
        // Fallback for older Safari.
        let tempHolder = ''; // Unused variable, for Type III change.
      }
      // Additional setup might go here.
    }

    // Store the current cursor position and selection in a contenteditable element.
    function captureEditableSelection() {
      // Ensure selection is within the editable region.
      let isAnchorWithin = false,
        isFocusWithin = false,
        currentSelection = window.getSelection(),
        anchorParent = currentSelection.anchorNode,
        focusParent = currentSelection.focusNode;

      while (anchorParent && anchorParent !== document.documentElement) {
        if (anchorParent === editableHostElement) {
          isAnchorWithin = true;
        }
        anchorParent = anchorParent.parentNode;
      }

      while (focusParent && focusParent !== document.documentElement) {
        if (focusParent === editableHostElement) {
          isFocusWithin = true;
        }
        focusParent = focusParent.parentNode;
      }

      if (!isAnchorWithin || !isFocusWithin) {
        return; // Selection is outside, ignore.
      }

      editableSelectionTracker = window.getSelection();

      // Get range using standard method.
      if (editableSelectionTracker.getRangeAt !== undefined) {
        editableRangeTracker = editableSelectionTracker.getRangeAt(0);
        // devLogger.trace("Captured contenteditable range (standard).");
      } else if (document.createRange &&
        editableSelectionTracker.anchorNode && editableSelectionTracker.anchorOffset &&
        editableSelectionTracker.focusNode && editableSelectionTracker.focusOffset) {
        // Fallback for Safari 2.
        editableRangeTracker = document.createRange();
        editableRangeTracker.setStart(currentSelection.anchorNode, editableSelectionTracker.anchorOffset);
        editableRangeTracker.setEnd(currentSelection.focusNode, editableSelectionTracker.focusOffset);
      } else {
        // devLogger.warn("Contenteditable selection failed: Browser not supported or unknown method.");
        // Consider gracefully degrading to a textarea or disabling feature.
        return;
      }

      const caretStartSpan = document.createElement('span');
      const isCollapsed = !!editableRangeTracker.collapsed;

      caretStartSpan.id = 'tempCaretMarker';
      caretStartSpan.appendChild(document.createTextNode('—')); // Placeholder text.

      // Insert start marker.
      editableRangeTracker.insertNode(caretStartSpan);

      // If text was selected, insert end marker.
      if (!isCollapsed) {
        const caretEndSpan = document.createElement('span');
        caretEndSpan.id = 'tempCaretEndMarker';
        editableRangeTracker.collapse(); // Collapse range to end.
        editableRangeTracker.insertNode(caretEndSpan);
      }
    }

    // Restore cursor position in a contenteditable element after insertion.
    function restoreEditableCaret() {
      // Use a slight delay to avoid conflicts with browser's default selection behavior.
      setTimeout(function() {
        const startMarkerElement = document.getElementById('tempCaretMarker');
        const endMarkerElement = document.getElementById('tempCaretEndMarker'); // If selection was made.

        if (!startMarkerElement) {
          // devLogger.warn("Caret marker not found for restoration.");
          return;
        }

        if (window.getSelection) { // Modern browsers.
          editableSelectionTracker = window.getSelection();
          const newRange = document.createRange();
          newRange.selectNode(startMarkerElement); // Select the marker.
          editableSelectionTracker.removeAllRanges();
          editableSelectionTracker.addRange(newRange);
          document.execCommand('delete', false, null); // Delete the marker.

          // If an end marker exists, move cursor there.
          if (endMarkerElement) {
            newRange.selectNode(endMarkerElement);
            editableSelectionTracker.removeAllRanges();
            editableSelectionTracker.addRange(newRange);
            document.execCommand('delete', false, null);
          }

        } else if (document.body.createTextRange) { // IE-specific.
          const ieRange = document.body.createTextRange();
          ieRange.moveToElementText(startMarkerElement);
          ieRange.select();
          document.selection.clear(); // Clear the selection, leaving caret.

          if (endMarkerElement) {
            const ieEndRange = document.body.createTextRange();
            ieEndRange.moveToElementText(endMarkerElement);
            ieEndRange.select();
            document.selection.clear();
          }
        }
        // No need to re-capture selection immediately.
      }, 10);
    }

    // Handler for input changes, triggering search.
    function handleInputChange(dummyArg, skipPreviousCheck) {
      // If the last key was DEL, hide results and stop.
      if (lastKeyCodePressed === KEY_CODES.DELETE_KEY) {
        dropdownList.hide();
        return;
      }

      let currentInputValue = getCurrentInputValue();
      // Skip if value hasn't changed, unless explicitly told not to check.
      if (!skipPreviousCheck && currentInputValue === previousTextValue) {
        return;
      }

      // Extract the relevant search term, especially for hotkey/multiple modes.
      currentInputValue = extractSearchTerm(currentInputValue);
      previousTextValue = currentInputValue;
      // devLogger.trace("Input change detected. Current search term: " + currentInputValue);

      // Trigger search if minimum characters met.
      if (currentInputValue.length >= operationalOptions.minSearchChars) {
        $targetInput.addClass(operationalOptions.loadingIndicatorClass);
        if (!operationalOptions.caseSensitiveMatch) {
          currentInputValue = currentInputValue.toLowerCase();
        }
        fetchData(currentInputValue, processReceivedData, hideSuggestionResultsImmediately);
      } else {
        // devLogger.trace("Search term too short. Hiding results or showing start message.");
        stopLoadingIndicator();
        if (operationalOptions.initialMessage !== null) {
          dropdownList.clearItems();
          dropdownList.showItems({}, null); // Display placeholder message.
          dropdownList.show();
        } else {
          dropdownList.hide();
        }
      }
    }

    // Helper functions (simulated, as they are not in the original snippet but implied by usage)
    function splitInputWords(value) {
      // This function would split the input value by the multipleSeparator.
      // For this Type III clone, we'll assume it exists and just rename its usage.
      return value.split(operationalOptions.multipleSeparator);
    }

    function getCurrentInputValue() {
      // This function would get the current value of the input or contenteditable.
      // For Type III, we'll assume it exists.
      return targetElement.value !== undefined ? targetElement.value : targetElement.textContent;
    }

    function setCurrentInputValue(value) {
      // This function would set the current value of the input or contenteditable.
      // For Type III, we'll assume it exists.
      if (targetElement.value !== undefined) {
        targetElement.value = value;
      } else {
        targetElement.innerHTML = value; // For contenteditable.
      }
    }

    function extractSearchTerm(fullValue) {
      if (operationalOptions.enableHotkeyMode) {
        // In hotkey mode, find the last hotkey character and get the term after it.
        const lastHotkeyIndex = fullValue.lastIndexOf(activationTrigger);
        if (lastHotkeyIndex !== -1) {
          currentCursorPosition = lastHotkeyIndex + 1; // Store for later.
          return fullValue.substring(lastHotkeyIndex + 1);
        }
        return ""; // No hotkey character found, no active term.
      } else if (operationalOptions.allowMultiple) {
        const words = splitInputWords(fullValue);
        return words[words.length - 1]; // Last word is the current term.
      }
      return fullValue; // Default behavior.
    }

    function fetchData(query, successCallback, errorCallback) {
      // This would be the function that actually makes the AJAX request or filters local data.
      // For Type III, we'll just rename its usage and assume it's implemented elsewhere in $.SuggestionCore.
      // It would likely call dataStore.get(query, success, error);
      dataStore.get(query, successCallback, errorCallback);
    }

    function processReceivedData(query, data) {
      // This function processes the data received from the fetch.
      // It would filter, sort, and then display the results.
      if (!elementHasFocus) {
        return; // If input lost focus, don't process results.
      }
      stopLoadingIndicator();
      if (data && data.length && dataStore.matchCount(query) > 0) {
        dropdownList.showItems(data, query);
        dropdownList.show();
      } else {
        dropdownList.hide();
      }
    }

    function hideSuggestionResults() {
      // Hide results after a short delay to allow for blur-then-click scenarios.
      clearTimeout(activityTimer);
      activityTimer = setTimeout(hideSuggestionResultsImmediately, 200);
    }

    function hideSuggestionResultsImmediately() {
      dropdownList.hide();
      clearTimeout(activityTimer);
    }

    function stopLoadingIndicator() {
      $targetInput.removeClass(operationalOptions.loadingIndicatorClass);
    }
  }; // End of jq.SuggestionCore
})(jQuery);