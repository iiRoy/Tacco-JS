/*
 *
 *  jQuery ContentEditable AC Autocompletion Plugin - A Type I Clone
 *
 *  This is an extensively modified version of the original source code
 *  to demonstrate Type I code cloning. All functional aspects,
 *  identifiers, and logic remain precisely as in the original.
 *  Only whitespace and comments have been altered.
 *
 *  Original project details:
 *  A significant fork of the Original AutoComplete by Jörn Zaeffererrequest.
 *
 *  Copyright (c) 2009 Jörn Zaeffererrequest and Aaron Raddon.
 *
 *  Dual licensed under the MIT and GPL licenses.
 *  Refer to:
 *    - http://www.opensource.org/licenses/mit-license.php
 *    - http://www.gnu.org/licenses/gpl.html
 *
 *  Revision: $Id: jquery.autocomplete.js 15 2009-08-22 10:30:27Z joern.zaefferer $
 *
 */

(function($) {

  // Ensure 'log' object exists globally to prevent errors.
  // If 'window.log' is not defined, create a stub object with
  // no-op methods for all expected functions.
  if (window['log'] == undefined) {
    window['log'] = {
      toggle: function() {},
      move:   function() {},
      resize: function() {},
      clear:  function() {},
      debug:  function() {},
      info:   function() {},
      warn:   function() {},
      error:  function() {},
      profile:function() {}
    };
  }


  // Extend jQuery's prototype with autocomplete-related functions.
  $.fn.extend({

    autocomplete: function(urlOrData, options) {

      // Determine if the first argument is a URL string.
      var isUrl = typeof urlOrData == "string";

      // Merge default options with user-provided options.
      // The order of merging is important:
      // 1. Base defaults ($.Autocompleter.defaults)
      // 2. Context-specific defaults (url/data, delay, max)
      // 3. User-provided options (overrides all previous)
      options = $.extend(
        {
          // Default formatter for editable results.
          // Creates a non-editable link with the term.
          formatEditableResult: function(row) {
            return '<a contenteditable="false" href="#" tabindex="-1" >@' + row[options.jsonterm] + '</a>&nbsp;';
          }
        },
        $.Autocompleter.defaults, // Standard autocomplete defaults.
        {
          url:   isUrl ? urlOrData : null, // Set URL if provided as string.
          data:  isUrl ? null : urlOrData, // Set data if provided as object/array.
          delay: isUrl ? $.Autocompleter.defaults.delay : 10, // Shorter delay for local data.
          max:   options && !options.scroll ? 10 : 150 // Max results, adjusted for scroll option.
        },
        options // User-defined options take precedence.
      );

      // Ensure formatResult is defined, defaulting to jsonterm if not.
      options.formatResult = options.formatResult || function(row) {
        return row[options.jsonterm];
      };

      // If highlight is explicitly set to false, replace it with a no-op function.
      // Otherwise, use the provided highlight function or default to identity.
      options.highlight = options.highlight || function(value) {
        return value;
      };

      // For backward compatibility, if formatMatch is not specified, use formatItem.
      options.formatMatch = options.formatMatch || function(row) {
        return row[options.jsonterm];
      };

      // Ensure formatItem is defined, defaulting to jsonterm.
      options.formatItem = options.formatItem || function(row) {
        return row[options.jsonterm];
      };

      // Iterate over each selected element and apply the Autocompleter.
      return this.each(function() {
        new $.Autocompleter(this, options);
      });
    },

    // Binds a handler to the "result" event.
    result: function(handler) {
      return this.bind("result", handler);
    },

    // Triggers a search, optionally with a handler.
    search: function(handler) {
      return this.trigger("search", [handler]);
    },

    // Triggers a cache flush.
    flushCache: function() {
      return this.trigger("flushCache");
    },

    // Triggers an update of options.
    setOptions: function(options) {
      return this.trigger("setOptions", [options]);
    },

    // Triggers removal of autocomplete functionality.
    unautocomplete: function() {
      return this.trigger("unautocomplete");
    },

    // Triggers an "ace_notfound" event.
    notfound: function() {
      return this.trigger("ace_notfound");
    }

  }); // End of $.fn.extend

  /**
   * Autocompleter constructor function.
   * Initializes the autocomplete behavior for a given input element.
   *
   * @param {HTMLElement} input The input element to attach autocomplete to.
   * @param {Object}      options Configuration options for the autocomplete.
   */
  $.Autocompleter = function(input, options) {

    // Define key codes for common keyboard actions.
    var KEY = {
      UP:        38,
      DOWN:      40,
      DEL:       46,
      TAB:       9,
      RETURN:    13,
      SHIFT:     16,
      ESC:       27,
      COMMA:     188,
      PAGEUP:    33,
      PAGEDOWN:  34,
      BACKSPACE: 8,
      SPACE:     32,
      LEFT:      37,
      RIGHT:     39,
      AT:        50,  // Key for '@' (Shift+2)
      POUND:     34,  // Key for '#' (Shift+3)
      DOLLAR:    52,  // Key for '$' (Shift+4)
      SEMIC:     59   // Key for ';'
    };

    // Wrap the input element with jQuery, set autocomplete off, and add a class.
    var $input = $(input).attr("autocomplete", "off").addClass(options.inputClass);

    // Internal state variables.
    var timeout;            // Timer for delayed onChange event.
    var previousValue = ""; // Stores the last processed input value.
    var cache = $.Autocompleter.Cache(options); // Autocomplete data cache.
    var hasFocus = 0;       // Tracks if the input element has focus.
    var cursorStart = 0;    // Cursor position for contenteditable.
    var editable = null;    // Reference to the contenteditable element.
    var editableSelection;  // Stores selection for contenteditable.
    var editableRange;      // Stores range for contenteditable.
    var lastKeyPressCode;   // Last key pressed code.
    var preKeyPressCode;    // Second to last key pressed code.
    var prePreKeyPressCode; // Third to last key pressed code.
    var hotKey = "@";       // The hotkey character (default: '@').
    // Autocompletion active flag, depends on hotkeymode option.
    var autocActive = options.hotkeymode ? false : true;
    var config = {
      mouseDownOnSelect: false // Flag to track mouse down state on select menu.
    };

    // Initialize the selection UI component.
    var select = $.Autocompleter.Select(options, input, selectCurrent, config);

    var blockSubmit; // Flag to prevent form submission.

    // If hotkey mode is enabled, multiple selection is disabled.
    if (options.hotkeymode) {
      options.multiple = false;
    }

    // Special handling for Opera to prevent form submission when selecting with RETURN key.
    if ($.browser.opera) {
      $(input.form).bind("submit.autocomplete", function() {
        if (blockSubmit) {
          blockSubmit = false; // Reset the flag.
          return false;        // Prevent default submit action.
        }
      });
    }

    // Check if the input is a contenteditable element and adjust options.
    // If input.value is undefined, it's likely a contenteditable div.
    if (input.value == undefined && options.width < 1) {
      editable = $(input)[0]; // Store reference to the contenteditable element.
      // Adjust width and left offset based on parent elements.
      options.width = $(input).parent().parent().width();
      options.left  = $(input).parent().parent().offset().left;
    }


    // Bind keydown (or keypress for Opera) event for autocomplete logic.
    $input.bind(($.browser.opera ? "keypress" : "keydown") + ".autocomplete", function(event) {
      // A keypress indicates the input has focus.
      // This helps avoid issues if focus was present before autocomplete was applied.
      hasFocus = 1;

      var k = event.keyCode || event.which; // Get key code, handling Gecko/FF 'keypress' event.
      // log.debug("keypress: " + k); // Debugging key presses.

      if (k == KEY.RETURN) {
        log.debug("in k = " + k + ' options.supressReturn =' + options.supressReturn);
      }

      // Track history of key presses.
      prePreKeyPressCode = preKeyPressCode;
      preKeyPressCode    = lastKeyPressCode;
      lastKeyPressCode   = k;

      // Hotkey mode logic: activate autocomplete only on hotkey sequence.
      if (options.hotkeymode && autocActive === false) {
        // Check for '@' key (KEY.AT, Shift+2) preceded by SPACE or at the beginning.
        if (k == KEY.AT && event.shiftKey && (KEY.SPACE == prePreKeyPressCode || prePreKeyPressCode == undefined)) {
          autocActive = true; // Activate autocomplete.
          log.debug("AutoComplete now active in Hotkey mode");
          clearTimeout(timeout); // Clear any existing timeout.
          timeout = setTimeout(onChange, options.delay); // Trigger onChange after delay.
        }
        return; // Exit if not active in hotkey mode.
      }

      // Handle different key presses.
      switch (k) {

        case KEY.UP:
          event.preventDefault(); // Prevent default scroll behavior.
          if (select.visible()) {
            select.prev(); // Move to previous item in the selection list.
          } else {
            onChange(0, true); // Trigger search if list is not visible.
          }
          break;

        case KEY.DOWN:
          event.preventDefault(); // Prevent default scroll behavior.
          if (select.visible()) {
            select.next(); // Move to next item in the selection list.
          } else {
            onChange(0, true); // Trigger search if list is not visible.
          }
          break;

        case KEY.PAGEUP:
          event.preventDefault(); // Prevent default page scroll.
          if (select.visible()) {
            select.pageUp(); // Scroll list up by a page.
          } else {
            onChange(0, true); // Trigger search if list is not visible.
          }
          break;

        case KEY.PAGEDOWN:
          event.preventDefault(); // Prevent default page scroll.
          if (select.visible()) {
            select.pageDown(); // Scroll list down by a page.
          } else {
            onChange(0, true); // Trigger search if list is not visible.
          }
          break;

        // Keys that trigger selection or closure of the autocomplete.
        case options.multiple && $.trim(options.multipleSeparator) == "," && KEY.COMMA: // Comma for multiple values.
        case KEY.TAB:    // Tab key.
        case KEY.RETURN: // Enter/Return key.
        case KEY.RIGHT:  // Right arrow key.
        case KEY.SEMIC:  // Semicolon key.

          if (k == KEY.RETURN) {
            event.preventDefault(); // Prevent default form submission on enter.
          }

          if (selectCurrent()) {
            // An item was selected from the list.
            log.debug("in k = " + k + ' options.supressReturn =' + options.supressReturn);
            if (k == KEY.RETURN && options.supressReturn) {
              event.preventDefault(); // Suppress return key if option is set.
            }
            blockSubmit = true; // Set flag to block form submission.
            hideResultsNow();   // Immediately hide the results list.
            if (options.hotkeymode || options.multiple === true) {
              log.debug("in return false");
              return false; // Prevent further event propagation for hotkey/multiple modes.
            }
          } else {
            // No item was selected.
            log.debug("nada found?  trigger notfound?");
            $input.trigger("ace_notfound", {}); // Trigger a 'notfound' event.
            hideResultsNow();                   // Hide results.
            if (k == KEY.RETURN && options.supressReturn) {
              event.preventDefault(); // Still suppress return if configured.
            }
          }
          if (k == KEY.TAB || k == KEY.RETURN) {
            log.debug("was tab"); // Debugging message.
          }
          break;

        case KEY.ESC:
          select.hide(); // Hide the autocomplete list on Escape key.
          break;

        default:
          // For any other key, if autocomplete is active,
          // clear previous timeout and set a new one to trigger onChange.
          if (autocActive === true) {
            clearTimeout(timeout);
            timeout = setTimeout(onChange, options.delay);
          }
          break;
      }
    })
      .focus(function() {
        // Track whether the field has focus.
        // We shouldn't process results if the field loses focus.
        log.debug("has focus");
        hasFocus++; // Increment focus counter.

        // If in hotkey mode and already active, or not in hotkey mode, trigger onChange.
        if (autocActive === true && options.hotkeymode) {
          onChange(0, true);
        } else if (!options.hotkeymode) {
          if (!autocActive) {
            autocActive = true; // Activate if not already.
          }
          onChange(0, true);
        }
      })
      .blur(function() {
        hasFocus = 0; // Reset focus counter.
        // If the blur wasn't caused by a mouse click on the select list, hide results.
        if (!config.mouseDownOnSelect) {
          hideResults();
        }
      })
      .click(function() {
        // If the field has gained focus and the select list is not visible, show it.
        if (hasFocus++ > 1 && !select.visible()) {
          onChange(0, true);
        } else {
          // Debugging messages for focus state.
          log.debug('hasfocus = ' + hasFocus);
          log.debug('hasfocus = ' + (hasFocus > 1));
          log.debug('visible()' + (!select.visible()));
          log.debug('visible()' + select.visible());
        }
      })
      .bind('result', function() {
        // When a result is selected, reset focus and hide results.
        hasFocus = 0;
        hideResults();
      })
      .bind("search", function() {
        // Handle custom search event.
        // The callback function can be passed as the second argument.
        var fn = (arguments.length > 1) ? arguments[1] : null;

        /**
         * Callback function for finding a value in the data.
         * @param {string} q The query string.
         * @param {Array} data The data array to search within.
         */
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
          // Invoke the provided callback or trigger a 'result' event.
          if (typeof fn == "function") {
            fn(result);
          } else {
            $input.trigger("result", result && [result.data, result.value]);
          }
        }

        // Process each word in the input (if multiple) and perform a request.
        $.each(trimWords(smartVal()), function(i, value) {
          request(value, findValueCallback, findValueCallback);
        });
      })
      .bind("flushCache", function() {
        cache.flush(); // Clear the autocomplete cache.
      })
      .bind("setOptions", function() {
        // Update options with new values.
        $.extend(options, arguments[1]);
        // If 'data' was updated, repopulate the cache.
        if ("data" in arguments[1]) {
          cache.populate();
        }
      })
      .bind("unautocomplete", function() {
        // Unbind all autocomplete-related events.
        select.unbind();
        $input.unbind();
        $(input.form).unbind(".autocomplete");
      });


    /**
     * Handles the selection of an item from the autocomplete list.
     * @returns {boolean} True if an item was selected, false otherwise.
     */
    function selectCurrent() {
      var selected = select.selected(); // Get the currently selected item.
      if (!selected) {
        return false; // No item is selected.
      }

      var v = selected.result; // The value of the selected item.
      previousValue = v;       // Update the previous value tracker.

      if (options.multiple) {
        // Handle multiple values separated by a separator.
        var words = trimWords(smartVal()); // Get current words.
        if (words.length > 1) {
          var seperator = options.multipleSeparator.length;
          var cursorAt = $(input).selection().start; // Get cursor position.
          var wordAt, progress = 0;
          // Find which word the cursor is currently in.
          $.each(words, function(i, word) {
            progress += word.length;
            if (cursorAt <= progress) {
              wordAt = i;
              return false; // Break from loop.
            }
            progress += seperator;
          });
          words[wordAt] = v; // Replace the word at cursor with selected value.
          // TODO: This should ideally set the cursor, but it gets overridden.
          // $.Autocompleter.Selection(input, progress + seperator, progress + seperator);
          v = words.join(options.multipleSeparator); // Rejoin words.
        }
        v += options.multipleSeparator; // Add separator for next entry.

      } else if (options.hotkeymode) {
        // Handle hotkey mode selection.
        autocActive = false; // Deactivate autocomplete after selection.
        var cur = smartVal();
        // Remove the hotkey and partial input that triggered autocomplete.
        cur = cur.substring(0, cursorStart - 1);
        log.info("found Data! " + selected.data[0] + ' ' + selected.data[1]);
        // Format the result and prepend the original text before the hotkey.
        v = cur + options.formatResult(selected.data);
        if (input.value == undefined) { // Check if it's a contenteditable.
          v = v + '<span id="cursorStart">—</span>'; // Add a cursor marker.
        }

        // storeContentEditableCursor(); // Original commented out line.
      }
      smartVal(v); // Set the new value to the input/contenteditable.
      hideResultsNow(); // Hide the autocomplete list immediately.
      $input.trigger("result", [selected.data, selected.value]); // Trigger result event.
      // If in hotkey mode and contenteditable, restore cursor.
      if (options.hotkeymode && input.value == undefined) {
        editableReturnCursor();
      }
      return true; // Selection successful.
    }

    /**
     * Placeholder function for contenteditable setup.
     * Original code seems to be incomplete or commented out.
     */
    function setupContentEditable() {
      if (editableSelection.getRangeAt !== undefined) {
        // OK, standard range API available.
      } else if (
        document.createRange &&
        editableSelection.anchorNode &&
        editableSelection.anchorOffset &&
        editableSelection.focusNode &&
        editableSelection.focusOffset
      ) {
        // Safari 2 specific range creation.
        var temp = ''; // Unused variable, possibly for debugging.
      }
    }

    /**
     * Stores the current selection/cursor position in a contenteditable div.
     * Inserts temporary span elements to mark the cursor position.
     */
    function storeContentEditableCursor() {
      // 'editable' refers to the contentEditable div.

      // Do not capture selection if it's outside the editable region.
      var isOrContainsAnchor = false,
        isOrContainsFocus = false,
        sel = window.getSelection(), // Get the current selection.
        parentAnchor = sel.anchorNode,
        parentFocus = sel.focusNode;

      // Traverse up the DOM tree from anchor node to check if it's within 'editable'.
      while (parentAnchor && parentAnchor != document.documentElement) {
        if (parentAnchor == editable) {
          isOrContainsAnchor = true;
        }
        parentAnchor = parentAnchor.parentNode;
      }

      // Traverse up the DOM tree from focus node to check if it's within 'editable'.
      while (parentFocus && parentFocus != document.documentElement) {
        if (parentFocus == editable) {
          isOrContainsFocus = true;
        }
        parentFocus = parentFocus.parentNode;
      }

      // If selection is not entirely within the editable element, return.
      if (!isOrContainsAnchor || !isOrContainsFocus) {
        return;
      }

      editableSelection = window.getSelection(); // Store the selection object.

      // editableSelection, editableRange; // Original commented out.

      // Get range using standard API (Firefox, Chrome, modern browsers).
      if (editableSelection.getRangeAt !== undefined) {
        editableRange = editableSelection.getRangeAt(0);
        // log.debug("in contenteditable keyup"); // Debug message.
      } else if (
        // Get range for Safari 2 (older WebKit).
        document.createRange &&
        editableSelection.anchorNode &&
        editableSelection.anchorOffset &&
        editableSelection.focusNode &&
        editableSelection.focusOffset
      ) {
        editableRange = document.createRange();
        editableRange.setStart(editableSelection.anchorNode, editableSelection.anchorOffset);
        editableRange.setEnd(editableSelection.focusNode, editableSelection.focusOffset);
      } else {
        // Fallback for unsupported browsers (e.g., IE, older ones).
        // TODO: Gracefully degrade to textarea or provide alternative.
      }

      var cursorStartSpan = document.createElement('span'),
        collapsed = !!editableRange.collapsed; // Check if the range is collapsed (no text selected).

      cursorStartSpan.id = 'cursorStart';
      cursorStartSpan.appendChild(document.createTextNode('—')); // Add a visual marker.

      // Insert the beginning cursor marker at the range's start.
      editableRange.insertNode(cursorStartSpan);

      // If text was selected (range not collapsed), insert an end marker.
      if (!collapsed) {
        var cursorEnd = document.createElement('span');
        cursorEnd.id = 'cursorEnd';
        editableRange.collapse(); // Collapse the range to its end.
        editableRange.insertNode(cursorEnd); // Insert the end marker.
      }
    }

    /**
     * Restores the cursor position in a contenteditable div after an autocomplete selection.
     * Locates the temporary cursor markers and positions the cursor there.
     */
    function editableReturnCursor() {
      // A slight delay is used to prevent initial browser selection
      // (e.g., at start or of contents) from interfering.
      setTimeout(function() {
        var cursorStartSpan = document.getElementById('cursorStart'),
          cursorEnd = document.getElementById('cursorEnd'); // Not used if no selection.

        if (window.getSelection) {
          // Standard DOM Level 2 Range and Selection (Firefox, Safari, Opera, Chrome).
          editableSelection = window.getSelection();
          var range = document.createRange();
          range.selectNode(cursorStartSpan); // Select the marker span.
          editableSelection.removeAllRanges(); // Clear existing selections.
          editableSelection.addRange(range);   // Add the new range.
          document.execCommand('delete', false, null); // Delete the marker span.
        } else {
          if (document.body.createTextRange) {
            // Internet Explorer specific text range handling.
            var rangeToSelect = document.body.createTextRange();
            rangeToSelect.moveToElementText(cursorStartSpan); // Move range to marker span.
            rangeToSelect.select(); // Select the range.
            document.selection.clear(); // Clear the selection (deletes the marker).
          }
        }

        // Register selection again - original commented out.
        // captureSelection();
      }, 10); // 10ms delay.
    }

    /**
     * Handles changes in the input field, triggering autocomplete search.
     * @param {*} crap Unused parameter.
     * @param {boolean} skipPrevCheck If true, bypasses check against previousValue.
     */
    function onChange(crap, skipPrevCheck) {
      if (lastKeyPressCode == KEY.DEL) {
        select.hide(); // Hide list if the last key was Delete.
        return;
      }

      var currentValue = smartVal(); // Get the current value from input/contenteditable.
      if (!skipPrevCheck && currentValue == previousValue) {
        return; // If value hasn't changed, do nothing unless skipPrevCheck is true.
      }

      currentValue = findSearchTerm(currentValue); // Extract the actual search term.
      previousValue = currentValue; // Update previous value.
      log.debug("onChange curVal = " + currentValue); // Debugging current value.

      if (currentValue.length >= options.minChars) {
        $input.addClass(options.loadingClass); // Add loading class to input.
        if (!options.matchCase) {
          currentValue = currentValue.toLowerCase(); // Convert to lowercase if case-insensitive.
        }
        request(currentValue, receiveData, hideResultsNow); // Make the search request.
      } else {
        log.debug("in else"); // Debugging message.
        stopLoading(); // Stop showing loading indicator.
        if (options.startmsg != null) {
          select.emptyList();    // Clear the list.
          select.display({}, null); // Display a message if startmsg is set.
          select.show();         // Show the message.
        } else {
          select.hide(); // Otherwise, hide the list.
        }