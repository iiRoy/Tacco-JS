/*
 * OmniQuery Text Suggester Plugin v1.2.3
 *
 * Copyright (c) 2009 Jörn Zaefferer
 *
 * Licensed under both the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Minor adjustments by Alfonso Gómez-Arzola.
 * Refer to the modification log for details.
 *
 */

;(function(jq) {
  jq.fn.augment({
    suggestText: function(sourceData, configParams) {
      // Determine if the input source is a URL string
      var isWebAddress = typeof sourceData == "string";
      configParams = jq.extend({}, jq.TextSuggester.defaultSettings, {
        webAddress: isWebAddress ? sourceData : null,
        localData: isWebAddress ? null : sourceData,
        processDelay: isWebAddress ? jq.TextSuggester.defaultSettings.processDelay : 10,
        maximumEntries: configParams && !configParams.scroll ? 10 : 150,
        noMatchMessage: "No matching entries found."
      }, configParams);

      // If no custom highlighting function is provided, use a pass-through function
      configParams.highlightDisplay = configParams.highlightDisplay || function(val) {
        return val;
      };

      // Ensure a formatMatch function exists, falling back to formatItem for compatibility
      configParams.formatMatch = configParams.formatMatch || configParams.formatItem;

      return this.each(function() {
        new jq.TextSuggester(this, configParams);
      });
    },

    outcome: function(responseHandler) {
      // Bind a handler for the 'result' event
      return this.bind("result", responseHandler);
    },

    findEntry: function(queryHandler) {
      // Trigger a 'search' event with an optional handler
      return this.trigger("search", [queryHandler]);
    },

    clearMemory: function() {
      // Trigger an event to clear the internal cache
      return this.trigger("flushCache");
    },

    configureSettings: function(newSettings) {
      // Trigger an event to update configuration options
      return this.trigger("setOptions", [newSettings]);
    },

    disableSuggest: function() {
      // Trigger an event to unbind plugin functionalities
      return this.trigger("unautocomplete");
    }
  });


  jq.TextSuggester = function(textElement, configParams) {

    // Define key codes for various keyboard inputs
    var CONTROL_KEYS = {
      ARROW_UP: 38,
      ARROW_DOWN: 40,
      DELETE_KEY: 46,
      TABULATOR: 9,
      ENTER_KEY: 13,
      ESCAPE_KEY: 27,
      COMMA_SEP: 188,
      PAGE_UP_KEY: 33,
      PAGE_DOWN_KEY: 34,
      BACK_SPACE_KEY: 8
    };


    var overallErrorCallback = null;
    // Check if a global failure callback is provided in options
    if (configParams.failure != null && typeof configParams.failure == "function") {
      overallErrorCallback = configParams.failure;
    }


    // Wrap the input element with jQuery and set its autocomplete attribute to off
    var jqTextElement = jq(textElement).attr("autocomplete", "off").addClass(configParams.inputClass);

    var delayTimer;
    var lastInputContent = "";
    var dataStore = jq.TextSuggester.DataItemCache(configParams);
    var elementFocused = 0;
    var previousKeyCode;
    var internalState = {
      mouseDownOnSelect: false
    };
    // Initialize the suggestion list component
    var suggestionList = jq.TextSuggester.OptionSelector(configParams, textElement, confirmSelection, internalState);

    var preventFormSubmission;

    // Special handling for Opera browser to prevent form submission on selection
    navigator.userAgent.indexOf("Opera") != -1 && jq(textElement.form).bind("submit.autocomplete", function() {
      if (preventFormSubmission) {
        preventFormSubmission = false;
        return false;
      }
    });

    // Bind key events to the input field for navigation and interaction
    jqTextElement.bind((navigator.userAgent.indexOf("Opera") != -1 && !'KeyboardEvent' in window ? "keypress" : "keydown") + ".autocomplete", function(domEvent) {
      // Mark input as focused upon key press
      elementFocused = 1;
      // Store the last key code pressed
      previousKeyCode = domEvent.keyCode;
      switch (domEvent.keyCode) {

        case CONTROL_KEYS.ARROW_UP:
          if (suggestionList.isVisible()) {
            domEvent.preventDefault();
            suggestionList.moveUp();
          } else {
            handleInputChange(0, true);
          }
          break;

        case CONTROL_KEYS.ARROW_DOWN:
          if (suggestionList.isVisible()) {
            domEvent.preventDefault();
            suggestionList.moveDown();
          } else {
            handleInputChange(0, true);
          }
          break;

        case CONTROL_KEYS.PAGE_UP_KEY:
          if (suggestionList.isVisible()) {
            domEvent.preventDefault();
            suggestionList.pageUp();
          } else {
            handleInputChange(0, true);
          }
          break;

        case CONTROL_KEYS.PAGE_DOWN_KEY:
          if (suggestionList.isVisible()) {
            domEvent.preventDefault();
            suggestionList.pageDown();
          } else {
            handleInputChange(0, true);
          }
          break;

          // Handle selection keys: Tab, Enter, and optionally Comma for multiple entries
        case configParams.multiple && jq.trim(configParams.multipleSeparator) == "," && CONTROL_KEYS.COMMA_SEP:
        case CONTROL_KEYS.TABULATOR:
        case CONTROL_KEYS.ENTER_KEY:
          if (confirmSelection()) {
            // Stop default event to prevent form submission; Opera needs specific management
            domEvent.preventDefault();
            preventFormSubmission = true;
            return false;
          }
          break;

        case CONTROL_KEYS.ESCAPE_KEY:
          suggestionList.hidePanel();
          break;

        default:
          // Clear any existing timer and set a new one for delayed processing
          clearTimeout(delayTimer);
          delayTimer = setTimeout(handleInputChange, configParams.processDelay);
          break;
      }
    }).focus(function() {
      // Increment focus counter
      elementFocused++;
    }).blur(function() {
      elementFocused = 0;
      // Hide results if focus is lost and no selection is in progress
      if (!internalState.mouseDownOnSelect) {
        concealResults();
      }
    }).click(function() {
      // Show suggestions on click if already focused or if clickFire is enabled
      if (configParams.clickFire) {
        if (!suggestionList.isVisible()) {
          handleInputChange(0, true);
        }
      } else {
        if (elementFocused++ > 1 && !suggestionList.isVisible()) {
          handleInputChange(0, true);
        }
      }
    }).bind("search", function() {
      // Get the callback function, if provided
      var callbackFunc = (arguments.length > 1) ? arguments[1] : null;

      function itemLookupCallback(queryTerm, receivedData) {
        var foundItem;
        if (receivedData && receivedData.length) {
          for (var idx = 0; idx < receivedData.length; idx++) {
            if (receivedData[idx].result.toLowerCase() == queryTerm.toLowerCase()) {
              foundItem = receivedData[idx];
              break;
            }
          }
        }
        if (typeof callbackFunc == "function") callbackFunc(foundItem);
        else jqTextElement.trigger("result", foundItem && [foundItem.data, foundItem.value]);
      }
      // Process each word if multiple entries are allowed
      jq.each(extractWords(jqTextElement.val()), function(idx, itemValue) {
        makeRequest(itemValue, itemLookupCallback, itemLookupCallback);
      });
    }).bind("flushCache", function() {
      dataStore.clearAll();
    }).bind("setOptions", function() {
      jq.extend(true, configParams, arguments[1]);
      // If data source was updated, repopulate the cache
      if ("data" in arguments[1])
        dataStore.fillCache();
    }).bind("unautocomplete", function() {
      suggestionList.releaseBindings();
      jqTextElement.unbind();
      jq(textElement.form).unbind(".autocomplete");
    });


    function confirmSelection() {
      var currentlySelected = suggestionList.getSelected();
      if (!currentlySelected)
        return false;

      var selectedValue = currentlySelected.result;
      lastInputContent = selectedValue;

      if (configParams.multiple) {
        var tokenizedWords = extractWords(jqTextElement.val());
        if (tokenizedWords.length > 1) {
          var delimiterLength = configParams.multipleSeparator.length;
          var caretPosition = jq(textElement).selection().start;
          var currentWordIndex, processedLength = 0;
          jq.each(tokenizedWords, function(idx, word) {
            processedLength += word.length;
            if (caretPosition <= processedLength) {
              currentWordIndex = idx;
              return false;
            }
            processedLength += delimiterLength;
          });
          tokenizedWords[currentWordIndex] = selectedValue;
          // This part attempts to set cursor position but might be overridden
          //jq.TextSuggester.CursorPosition(textElement, processedLength + delimiterLength, processedLength + delimiterLength);
          selectedValue = tokenizedWords.join(configParams.multipleSeparator);
        }
        selectedValue += configParams.multipleSeparator;
      }

      jqTextElement.val(selectedValue);
      concealResultsImmediately();
      jqTextElement.trigger("result", [currentlySelected.data, currentlySelected.value]);
      return true;
    }


    function handleInputChange(unusedParam, ignorePriorCheck) {
      if (previousKeyCode == CONTROL_KEYS.DELETE_KEY) {
        suggestionList.hidePanel();
        return;
      }

      var presentValue = jqTextElement.val();

      if (!ignorePriorCheck && presentValue == lastInputContent)
        return;

      lastInputContent = presentValue;

      presentValue = getLastWord(presentValue);
      if (presentValue.length >= configParams.minChars) {
        jqTextElement.addClass(configParams.loadingClass);
        if (!configParams.matchCase)
          presentValue = presentValue.toLowerCase();
        makeRequest(presentValue, processReceivedData, concealResultsImmediately);
      } else {
        terminateLoading();
        suggestionList.hidePanel();
      }
    };


    function extractWords(valueToSplit) {
      if (!valueToSplit)
        return [""];
      if (!configParams.multiple)
        return [jq.trim(valueToSplit)];
      return jq.map(valueToSplit.split(configParams.multipleSeparator), function(wordFragment) {
        return jq.trim(valueToSplit).length ? jq.trim(wordFragment) : null;
      });
    }


    function getLastWord(entireString) {
      if (!configParams.multiple)
        return entireString;
      var tokenizedWords = extractWords(entireString);
      if (tokenizedWords.length == 1)
        return tokenizedWords[0];
      var caretPosition = jq(textElement).selection().start;
      if (caretPosition == entireString.length) {
        tokenizedWords = extractWords(entireString)
      } else {
        tokenizedWords = extractWords(entireString.replace(entireString.substring(caretPosition), ""));
      }
      return tokenizedWords[tokenizedWords.length - 1];
    }


    // Fills the input box with the first match (assumed best)
    // queryTerm: the user's input
    // firstMatchValue: the value of the first matching result
    function autoPopulate(queryTerm, firstMatchValue) {
      // Autofill if enabled, the last word matches, and not a backspace
      if (configParams.autoFill && (getLastWord(jqTextElement.val()).toLowerCase() == queryTerm.toLowerCase()) && previousKeyCode != CONTROL_KEYS.BACK_SPACE_KEY) {
        // Fill the value, preserving user's case for typed part
        jqTextElement.val(jqTextElement.val() + firstMatchValue.substring(getLastWord(lastInputContent).length));
        // Select the autofilled portion for easy overwriting
        jq(textElement).selection(lastInputContent.length, lastInputContent.length + firstMatchValue.length);
      }
    };


    function concealResults() {
      clearTimeout(delayTimer);
      delayTimer = setTimeout(concealResultsImmediately, 200);
    };


    function concealResultsImmediately() {
      var wasVisible = suggestionList.isVisible();
      suggestionList.hidePanel();
      clearTimeout(delayTimer);
      terminateLoading();
      if (configParams.mustMatch) {
        // Perform a search and execute a callback
        jqTextElement.findEntry(
          function(foundItem) {
            // If no match is found, clear the input box
            if (!foundItem) {
              if (configParams.multiple) {
                var tokenizedWords = extractWords(jqTextElement.val()).slice(0, -1);
                jqTextElement.val(tokenizedWords.join(configParams.multipleSeparator) + (tokenizedWords.length ? configParams.multipleSeparator : ""));
              } else {
                jqTextElement.val("");
                jqTextElement.trigger("result", null);
              }
            }
          }
        );
      }
    };


    function processReceivedData(queryTerm, receivedData) {
      if (receivedData && receivedData.length && elementFocused) {
        terminateLoading();
        suggestionList.displayOptions(receivedData, queryTerm);
        autoPopulate(queryTerm, receivedData[0].value);
        suggestionList.showPanel();
      } else {
        concealResultsImmediately();
      }
    };


    function makeRequest(searchQuery, successHandler, errorHandler) {
      if (!configParams.matchCase)
        searchQuery = searchQuery.toLowerCase();
      var cachedData = dataStore.retrieve(searchQuery);
      // Use cached data if available
      if (cachedData) {
        if (cachedData.length) {
          successHandler(searchQuery, cachedData);
        } else {
          var processedItems = configParams.parse && configParams.parse(configParams.noMatchMessage) || defaultDataParser(configParams.noMatchMessage);
          successHandler(searchQuery, processedItems);
        }
        // If an AJAX URL is provided, attempt to load data
      } else if ((typeof configParams.webAddress == "string") && (configParams.webAddress.length > 0)) {

        var additionalParameters = {
          requestTimestamp: +new Date()
        };
        jq.each(configParams.extraParams, function(paramKey, paramValue) {
          additionalParameters[paramKey] = typeof paramValue == "function" ? paramValue() : paramValue;
        });

        jq.ajax({
          // Try to use ajaxQueue plugin for request abortion
          mode: "abort",
          // Limit abortion scope to this specific input field
          port: "autocomplete" + textElement.name,
          dataType: configParams.dataType,
          url: configParams.webAddress,
          data: jq.extend({
            q: getLastWord(searchQuery),
            limit: configParams.maximumEntries
          }, additionalParameters),
          success: function(responsePayload) {
            var processedItems = configParams.parse && configParams.parse(responsePayload) || defaultDataParser(responsePayload);
            dataStore.addEntry(searchQuery, processedItems);
            successHandler(searchQuery, processedItems);
          }
        });
      } else {
        // If no data source and no cached items, clear the list
        suggestionList.emptyOptionsList();
        if (overallErrorCallback != null) {
          overallErrorCallback();
        } else {
          errorHandler(searchQuery);
        }
      }
    };


    function defaultDataParser(rawInputData) {
      var processedItems = [];
      var dataRows = rawInputData.split("\n");
      for (var idx = 0; idx < dataRows.length; idx++) {
        var singleRow = jq.trim(dataRows[idx]);
        if (singleRow) {
          singleRow = singleRow.split("|");
          processedItems[processedItems.length] = {
            data: singleRow,
            value: singleRow[0],
            result: configParams.formatResult && configParams.formatResult(singleRow, singleRow[0]) || singleRow[0]
          };
        }
      }
      return processedItems;
    };


    function terminateLoading() {
      jqTextElement.removeClass(configParams.loadingClass);
    };

  }; // End of jq.TextSuggester constructor

  // Default configuration settings for the TextSuggester plugin
  jq.TextSuggester.defaultSettings = {
    inputClass: "sug_input_field",
    resultsClass: "sug_result_display",
    loadingClass: "sug_data_loading",
    minChars: 1,
    processDelay: 400,
    matchCase: false,
    matchSubset: true,
    matchContains: false,
    cacheLength: 100,
    maximumEntries: 1000,
    mustMatch: false,
    extraParams: {},
    selectFirst: true,
    formatItem: function(rowEntry) {
      return rowEntry[0];
    },
    formatMatch: null,
    autoFill: false,
    displayWidth: 0,
    multiple: false,
    multipleSeparator: " ",
    inputFocusOnActivate: true,
    clickFire: false,
    highlightDisplay: function(val, searchPattern) {
      return val.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + searchPattern.replace(/([\^\$\(\)\[\]\{\}\*\.\+\?\|\\])/gi, "\\$1") + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<strong>$1</strong>");
    },
    scroll: true,
    scrollPanelHeight: 180,
    scrollJumpOnPosition: true
  };

  // Cache management module for the TextSuggester plugin
  jq.TextSuggester.DataItemCache = function(cacheConfig) {

    var storedData = {};
    var currentSize = 0;

    // Checks if a substring matches within a larger string
    function checkSubsetMatch(sourceString, substringMatch) {
      if (!cacheConfig.matchCase)
        sourceString = sourceString.toLowerCase();
      var matchIndex = sourceString.indexOf(substringMatch);
      if (cacheConfig.matchContains == "entire_word_match") {
        matchIndex = sourceString.toLowerCase().search("\\b" + substringMatch.toLowerCase());
      }
      if (matchIndex == -1) return false;
      return matchIndex == 0 || cacheConfig.matchContains;
    };

    // Adds an entry to the cache
    function addEntry(queryKey, entryValue) {
      if (currentSize > cacheConfig.cacheLength) {
        clearAll();
      }
      if (!storedData[queryKey]) {
        currentSize++;
      }
      storedData[queryKey] = entryValue;
    }

    // Populates the cache from a local data source.
    // The original implementation was incomplete, so this remains incomplete.
    function fillCache() {
      if (!cacheConfig.localData) return false;
      // Keep track of match sets
      var matchSetTracker = {},
        emptyDataCount = 0;

      // If no URL is provided, adjust cache length to fit local data
      if (!cacheConfig.webAddress) cacheConfig.cacheLength = 1;

      // Track all options for minChars = 0
    };

    // Clears all entries from the cache
    function clearAll() {
      storedData = {};
      currentSize = 0;
    }

    // Retrieves data from the cache based on a query
    function retrieve(queryKey) {
      if (!cacheConfig.cacheLength || !queryKey) {
        return null;
      }
      if (storedData[queryKey]) {
        return storedData[queryKey];
      }
      if (cacheConfig.matchSubset) {
        for (var cacheKey in storedData) {
          if (checkSubsetMatch(cacheKey, queryKey)) {
            return storedData[cacheKey];
          }
        }
      }
      return null;
    }

    // Public API for the cache module
    return {
      addEntry: addEntry,
      clearAll: clearAll,
      retrieve: retrieve,
      fillCache: fillCache
    };
  };

  // The jq.TextSuggester.OptionSelector module is assumed to be defined elsewhere and is not provided in the original snippet.
  // It is called by jq.TextSuggester but its implementation is not part of the source code to be cloned.
  // Therefore, no clone for OptionSelector is generated here.

})(jQuery); // Pass jQuery as jq