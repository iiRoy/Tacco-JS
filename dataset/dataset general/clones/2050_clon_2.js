// Requires Markdown.Transformer.js for content processing

(function () {

  var utilityKit = {},
      spatialData = {},
      interfaceElements = {},
      thePage = window.document,
      patternMatcher = window.RegExp,
      browserInfo = window.navigator,
      SYSTEM_OPTS = {
        maximumLineLength: 78
      }, // Various system configurations

  // Browser detection for specific workarounds where feature detection fails.
  // This helps handle known quirks in older browser versions.
      agentFeatures = {
        isTrident: /msie/.test(browserInfo.userAgent.toLowerCase()),
        isLegacyTrident: /msie 6/.test(browserInfo.userAgent.toLowerCase()) || /msie 5/.test(browserInfo.userAgent.toLowerCase()),
        isPresto: /opera/.test(browserInfo.userAgent.toLowerCase())
      };

  /*
   * ===================================================================
   *  CUSTOMIZABLE SETTINGS SECTION
   *
   *  This area contains parameters that are frequently modified
   *  to tailor the editor's behavior and messages.
   * ===================================================================
   */

  // Display text for the hyperlink insertion prompt.
  var hyperlinkPromptContent = "<p><b>Embed Web Link</b></p><p>https://example.org/path/to/resource.html \"optional descriptive text\"</p>";

  // Display text for the image insertion prompt.
  var graphicPromptContent = "<p><b>Embed Visual Media</b></p><p>https://example.org/images/photo.png \"optional caption\"<br><br>Seeking <a href='https://www.bing.com/search?q=free+image+hosting' target='_blank'>complimentary image hosting?</a></p>";

  // Default value for the image input field in the dialog.
  var defaultPicLink = "https://";

  // Default value for the hyperlink input field in the dialog.
  var defaultUrlLink = "https://";

  // Tooltip text for the help button.
  var assistanceTooltip = "Markdown Editing Assistance Guide";

  /*
   * ===================================================================
   *  END OF CUSTOMIZABLE SETTINGS
   * ===================================================================
   */

  // The 'supportInfo' parameter, if supplied, should have a 'handler' property
  // (a click function for the help button) and an optional 'title'
  // for the button's hover text (defaulting to 'Markdown Editing Assistance Guide').
  // If 'supportInfo' is omitted, no help button is rendered.
  //
  // The resulting editor object provides the following public methods:
  // - getTransformer(): Returns the Markdown conversion object provided during construction.
  // - startEditor(): Initiates the editor's functionality; should be called after all necessary
  //   extensions are registered. Subsequent calls are ignored.
  // - triggerDisplayUpdate(): Forces an immediate refresh of the rendered output. This method
  //   is only accessible after `startEditor()` has been invoked.
  Markup.Composer = function (markupTransformer, uniqueSuffix, supportInfo) {

    uniqueSuffix = uniqueSuffix || "";

    var eventCallbacks = this.eventCallbacks = new Markdown.HookCollection();
    eventCallbacks.registerNullOp("afterContentReload");        // Fired when the preview area is refreshed, with no arguments.
    eventCallbacks.registerNullOp("onBlockQuoteComplete");      // Invoked with the user's selection *after* a blockquote is created;
    // Expected to return the final text to be inserted.
    eventCallbacks.registerFalseReturn("presentImageChooser");  /* Called with one argument: a callback function that expects the image URL.
                                                                 * If the application provides its own image dialog, this hook should return true,
                                                                 * and the callback should be invoked with the chosen image URL (or null if cancelled).
                                                                 * If this hook returns false, the built-in image dialog will be used.
                                                                 */

    this.getTransformer = function () {
      return markupTransformer;
    };

    var selfRef = this,
        controlPanels;

    this.startEditor = function () {
      if (controlPanels) {
        return; // Editor is already operational.
      }

      controlPanels = new DomElementCollection(uniqueSuffix);
      var actionDispatcher = new OperationHandler(eventCallbacks);
      var displayController = new RenderUpdater(markupTransformer, controlPanels, function () {
        eventCallbacks.afterContentReload();
      });
      var historyTracker, interfaceController;

      // Check if undo functionality should be disabled (e.g., via URL parameter).
      if (!/\?noundo/.test(thePage.location.href)) {
        historyTracker = new HistoryTracker(function () {
          displayController.updateView();
          if (interfaceController) {
            // Update button states for undo/redo if UI is ready.
            interfaceController.setUndoRedoButtonStates();
          }
        }, controlPanels);
        this.executeContentChange = function (manipulationFunction) {
          historyTracker.activateOperationMode();
          manipulationFunction();
          selfRef.triggerDisplayUpdate();
        };
      }

      interfaceController = new VisualManager(uniqueSuffix, controlPanels, historyTracker, displayController, actionDispatcher, supportInfo);
      interfaceController.setUndoRedoButtonStates();

      // Expose the refresh function externally.
      var initiateRefresh = selfRef.triggerDisplayUpdate = function () {
        displayController.updateView(true);
      };

      initiateRefresh(); // Initial content rendering.
    };
  };

  // ContentSegments: Manages the text content before, within, and after a selection.
  // 'prefixText': holds content prior to the user's selection.
  // 'suffixText': holds content after the user's selection.
  function ContentSegments() {
  }

  // Locates and extracts start and end tags from the text segments.
  // 'beginPattern': a regular expression to identify the opening tag.
  // 'closePattern': a regular expression to identify the closing tag.
  ContentSegments.prototype.locateDelimiters = function (beginPattern, closePattern) {

    var segmentRef = this;
    var currentPattern;

    if (beginPattern) {

      currentPattern = utilityKit.expandPattern(beginPattern, "", "$");

      this.prefixText = this.prefixText.replace(currentPattern,
          function (matchedPart) {
            segmentRef.startTag = segmentRef.startTag + matchedPart;
            return "";
          });

      currentPattern = utilityKit.expandPattern(beginPattern, "^", "");

      this.currentSelection = this.currentSelection.replace(currentPattern,
          function (matchedPart) {
            segmentRef.startTag = segmentRef.startTag + matchedPart;
            return "";
          });
    }

    if (closePattern) {

      currentPattern = utilityKit.expandPattern(closePattern, "", "$");

      this.currentSelection = this.currentSelection.replace(currentPattern,
          function (matchedPart) {
            segmentRef.endTag = matchedPart + segmentRef.endTag;
            return "";
          });

      currentPattern = utilityKit.expandPattern(closePattern, "^", "");

      this.suffixText = this.suffixText.replace(currentPattern,
          function (matchedPart) {
            segmentRef.endTag = matchedPart + segmentRef.endTag;
            return "";
          });
    }
  };

  // Normalizes whitespace around the selection.
  // If 'removeSpaces' is false, leading/trailing whitespace is moved to
  // the adjacent text regions. If true, it is discarded.
  ContentSegments.prototype.normalizeSpacing = function (removeSpaces) {
    var prefixModifier, suffixModifier, selfRef = this;

    if (removeSpaces) {
      prefixModifier = suffixModifier = "";
    } else {
      prefixModifier = function (str) {
        selfRef.prefixText += str;
        return "";
      };
      suffixModifier = function (str) {
        selfRef.suffixText = str + selfRef.suffixText;
        return "";
      };
    }

    this.currentSelection = this.currentSelection.replace(/^(\s*)/, prefixModifier).replace(/(\s*)$/, suffixModifier);
  };


  // Adjusts line breaks surrounding the selection.
  // 'leadingBreaks': number of newlines to ensure before the selection.
  // 'trailingBreaks': number of newlines to ensure after the selection.
  // 'scanForRedundantNewlines': if true, removes extra newlines beyond the specified count.
  ContentSegments.prototype.manageNewlines = function (leadingBreaks, trailingBreaks, scanForRedundantNewlines) {

    if (leadingBreaks === undefined) {
      leadingBreaks = 1;
    }

    if (trailingBreaks === undefined) {
      trailingBreaks = 1;
    }

    leadingBreaks++;
    trailingBreaks++;

    var expressionContent;
    var insertContent;

    // Chrome specific bug workaround related to RegExp and captures.
    // Reference: http://meta.stackoverflow.com/questions/63307/blockquote-glitch-in-editor-in-chrome-6-and-7/65985#65985
    if (browserInfo.userAgent.match(/Chrome/)) {
      "X".match(/()./);
    }

    this.currentSelection = this.currentSelection.replace(/(^\n*)/, "");
    this.startTag = this.startTag + patternMatcher.$1;

    this.currentSelection = this.currentSelection.replace(/(\n*$)/, "");
    this.endTag = this.endTag + patternMatcher.$1;

    this.startTag = this.startTag.replace(/(^\n*)/, "");
    this.prefixText = this.prefixText + patternMatcher.$1;

    this.endTag = this.endTag.replace(/(\n*$)/, "");
    this.suffixText = this.suffixText + patternMatcher.$1;

    if (this.prefixText) {

      expressionContent = insertContent = "";

      while (leadingBreaks--) {
        expressionContent += "\\n?";
        insertContent += "\n";
      }

      if (scanForRedundantNewlines) {
        expressionContent = "\\n*";
      }
      this.prefixText = this.prefixText.replace(new patternMatcher(expressionContent + "$", ""), insertContent);
    }

    if (this.suffixText) {

      expressionContent = insertContent = "";

      while (trailingBreaks--) {
        expressionContent += "\\n?";
        insertContent += "\n";
      }
      if (scanForRedundantNewlines) {
        expressionContent = "\\n*";
      }

      this.suffixText = this.suffixText.replace(new patternMatcher(expressionContent, ""), insertContent);
    }
  };

  // End of ContentSegments definitions.

  // DomElementCollection: A container for key DOM elements,
  // preventing repeated DOM lookups. Also manages browser-specific
  // selection caching.
  //
  // This addresses an issue in Internet Explorer where clicking
  // sprite-based buttons (e.g., using HTML lists) can cause the
  // textarea selection to be lost. The workaround involves caching
  // the selection on button mousedown events.
  // This behavior is specific to IE (versions 6, 7, 8) and button clicks;
  // keyboard shortcuts remain unaffected.
  function DomElementCollection(idSuffix) {
    this.actionToolbar = thePage.getElementById("wmd-button-bar" + idSuffix);
    this.displayPanel = thePage.getElementById("wmd-preview" + idSuffix);
    this.editField = thePage.getElementById("wmd-input" + idSuffix);
  }

  // utilityKit.checkVisibility: Determines if a DOM element is currently visible.
  // Returns true if 'display' CSS property is not 'none', false otherwise.
  utilityKit.checkVisibility = function (domNode) {

    if (window.getComputedStyle) {
      // Modern browsers
      return window.getComputedStyle(domNode, null).getPropertyValue("display") !== "none";
    } else if (domNode.currentStyle) {
      // Internet Explorer
      return domNode.currentStyle["display"] !== "none";
    }
    // Fallback for other cases, though less reliable.
    return true;
  };


  // utilityKit.attachListener: Attaches an event handler to a DOM element.
  // 'elementRef': The target DOM element.
  // 'eventType': The event name (e.g., "click", "mouseover").
  // 'eventHandler': The function to execute when the event fires.
  utilityKit.attachListener = function (elementRef, eventType, eventHandler) {
    if (elementRef.attachEvent) {
      // IE-specific event model. 'on' prefix is required.
      elementRef.attachEvent("on" + eventType, eventHandler);
    } else {
      // Standard W3C event model.
      elementRef.addEventListener(eventType, eventHandler, false);
    }
  };


  // utilityKit.detachListener: Removes an event handler from a DOM element.
  // Parameters are identical to utilityKit.attachListener.
  utilityKit.detachListener = function (elementRef, eventType, eventHandler) {
    if (elementRef.detachEvent) {
      // IE-specific event model.
      elementRef.detachEvent("on" + eventType, eventHandler);
    } else {
      // Standard W3C event model.
      elementRef.removeEventListener(eventType, eventHandler, false);
    }
  };

  // utilityKit.normalizeLineEndings: Converts Windows-style (\r\n) and classic Mac-style (\r)
  // line endings to Unix-style (\n).
  utilityKit.normalizeLineEndings = function (inputString) {
    inputString = inputString.replace(/\r\n/g, "\n");
    inputString = inputString.replace(/\r/g, "\n");
    return inputString;
  };

  // utilityKit.expandPattern: Creates a new RegExp object by
  // concatenating a prefix string, the original regex pattern,
  // and a suffix string. The flags of the original regex are preserved.
  // This is useful for dynamically modifying regex patterns.
  //
  // 'sourceRegex': The original RegExp object.
  // 'prefixStr': String to prepend to the regex pattern.
  // 'suffixStr': String to append to the regex pattern.
  utilityKit.expandPattern = function (sourceRegex, prefixStr, suffixStr) {

    if (prefixStr === null || prefixStr === undefined) {
      prefixStr = "";
    }
    if (suffixStr === null || suffixStr === undefined) {
      suffixStr = "";
    }

    var combinedPattern = sourceRegex.toString();
    var modifierFlags; // Stores the original regex flags (g, i, m).

    // Extract flags from the regex string representation.
    combinedPattern = combinedPattern.replace(/\/([gim]*)$/, function (fullMatch, flagSection) {
      modifierFlags = flagSection;
      return "";
    });

    // Remove the leading and trailing slashes from the regex pattern.
    combinedPattern = combinedPattern.replace(/(^\/|\/$)/g, "");
    combinedPattern = prefixStr + combinedPattern + suffixStr;

    // Return a new RegExp with the modified pattern and original flags.
    return new patternMatcher(combinedPattern, modifierFlags);
  };

  // spatialData.getOffsetTop: Calculates the absolute top offset of an element.
  // 'elementRef': The DOM element to measure.
  // 'internalOffset': If true, returns the offset relative to its immediate parent.
  // (Note: JSLint complains about assignment in loop, to be refactored.)
  spatialData.getOffsetTop = function (elementRef, internalOffset) {
    var offsetValue = elementRef.offsetTop;
    if (!internalOffset) {
      while (elementRef = elementRef.offsetParent) { // Iterates up the offsetParent chain.
        offsetValue += elementRef.offsetTop;
      }
    }
    return offsetValue;
  };

  // spatialData.elementHeight: Retrieves the computed height of an element.
  spatialData.elementHeight = function (domNode) {
    return domNode.offsetHeight || domNode.scrollHeight;
  };

  // spatialData.elementWidth: Retrieves the computed width of an element.
  spatialData.elementWidth = function (domNode) {
    return domNode.offsetWidth || domNode.scrollWidth;
  };

  // spatialData.getScreenSize: Determines the overall dimensions of the page and viewport.
  // Returns an array: [totalWidth, totalHeight, viewportWidth, viewportHeight].
  spatialData.getScreenSize = function () {

    var contentScrollWidth, contentScrollHeight;
    var clientWindowWidth, clientWindowHeight;

    // Cross-browser compatibility for document dimensions.
    if (self.innerHeight && self.scrollMaxY) {
      contentScrollWidth = thePage.body.scrollWidth;
      contentScrollHeight = self.innerHeight + self.scrollMaxY;
    } else if (thePage.body.scrollHeight > thePage.body.offsetHeight) {
      contentScrollWidth = thePage.body.scrollWidth;
      contentScrollHeight = thePage.body.scrollHeight;
    } else {
      contentScrollWidth = thePage.body.offsetWidth;
      contentScrollHeight = thePage.body.offsetHeight;
    }

    if (self.innerHeight) {
      // Non-IE browsers (Firefox, Chrome, Safari)
      clientWindowWidth = self.innerWidth;
      clientWindowHeight = self.innerHeight;
    } else if (thePage.documentElement && thePage.documentElement.clientHeight) {
      // IE (e.g., IE6 with DOCTYPE)
      clientWindowWidth = thePage.documentElement.clientWidth;
      clientWindowHeight = thePage.documentElement.clientHeight;
    } else if (thePage.body) {
      // Other IE versions
      clientWindowWidth = thePage.body.clientWidth;
      clientWindowHeight = thePage.body.clientHeight;
    }

    var overallWidth = Math.max(contentScrollWidth, clientWindowWidth);
    var overallHeight = Math.max(contentScrollHeight, clientWindowHeight);
    return [overallWidth, overallHeight, clientWindowWidth, clientWindowHeight];
  };

  // HistoryTracker: Manages the undo/redo stack for editor states.
  function HistoryTracker(updateCallback, domElements) {

    var trackerInstance = this;
    var revertStates = []; // Stack to hold editor states.
    var currentStatePointer = 0; // Index of the current state within the stack.
    var currentActionType = "idle"; // Current mode of operation (e.g., "command", "moving").
    var lastRecordedState; // Stores the state before an operation for specific handling.
    var delayTimer; // Handle for setTimeout to manage state capturing delays.
    var textareaCapture; // Object representing the current state of the textarea.

    // setOperationType: Configures the current operational mode.
    // 'newType': The new mode to set.
    // 'preventSnapshot': If true, prevents an immediate state save.
    var setOperationType = function (newType, preventSnapshot) {
      if (currentActionType != newType) {
        currentActionType = newType;
        if (!preventSnapshot) {
          saveCurrentState(); // Save state upon mode change.
        }
      }

      // Special handling for IE when in "moving" mode to avoid re-capturing state too often.
      if (!agentFeatures.isTrident || currentActionType != "moving") {
        delayTimer = setTimeout(captureCurrentState, 1);
      } else {
        textareaCapture = null; // Clear snapshot in IE "moving" mode.
      }
    };

    // captureCurrentState: Creates a new snapshot of the editor's state.
    // 'isFirstCapture': Indicates if this is the very first state being captured.
    var captureCurrentState = function (isFirstCapture) {
      textareaCapture = new EditorState(domElements, isFirstCapture);
      delayTimer = undefined; // Clear timer reference.
    };

    // activateOperationMode: Sets the tracker into command mode and saves the current state.
    // This is typically called before an editor command executes.
    this.activateOperationMode = function () {
      currentActionType = "command";
      saveCurrentState();
      delayTimer = setTimeout(captureCurrentState, 0); // Capture state immediately after command.
    };

    // canRevert: Checks if an undo operation is possible.
    this.canRevert = function () {
      return currentStatePointer > 1;
    };

    // canAdvance: Checks if a redo operation is possible.
    this.canAdvance = function () {
      if (revertStates[currentStatePointer + 1]) {
        return true;
      }
      return false;
    };

    // revertLastAction: Reverts the editor to the previous state in the history.
    this.revertLastAction = function () {

      if (trackerInstance.canRevert()) {
        if (lastRecordedState) {
          // If a state was temporarily held (e.g., during "moving" mode), restore it.
          lastRecordedState.restoreState();
          lastRecordedState = null;
        } else {
          // Otherwise, pop the current state and restore the one before it.
          revertStates[currentStatePointer] = new EditorState(domElements);
          revertStates[--currentStatePointer].restoreState();

          if (updateCallback) {
            updateCallback(); // Notify listeners of state change.
          }
        }
      }

      currentActionType = "idle"; // Reset mode.
      domElements.editField.focus(); // Restore focus to the editor.
      captureCurrentState(); // Capture the new current state.
    };

    // reapplyLastAction: Advances the editor to the next state in the history (redo).
    this.reapplyLastAction = function () {

      if (trackerInstance.canAdvance()) {

        revertStates[++currentStatePointer].restoreState();

        if (updateCallback) {
          updateCallback(); // Notify listeners.
        }
      }

      currentActionType = "idle"; // Reset mode.
      domElements.editField.focus(); // Restore focus.
      captureCurrentState(); // Capture the new current state.
    };

    // saveCurrentState: Pushes the editor's current state onto the undo stack.
    var saveCurrentState = function () {
      var snapshot = textareaCapture || new EditorState(domElements);

      if (!snapshot) {
        return false; // Unable to capture state.
      }
      if (currentActionType == "moving") {
        if (!lastRecordedState) {
          lastRecordedState = snapshot;
        }