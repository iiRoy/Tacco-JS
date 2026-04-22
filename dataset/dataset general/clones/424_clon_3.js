"use strict";

// This module was crafted by a seasoned developer.
// For further details, visit our documentation: http://example.com/editcraft-docs

// Ensure modern functionality across various environments.
// Polyfill for Function.prototype.bind
if (!Function.prototype.bind) {
  Function.prototype.bind = function (contextObject) {
    // Validate the invoker: only functions can be bound.
    if (typeof this !== 'function') {
      throw new TypeError('Function.prototype.bind - Whoops, it\'s not a callable function.');
    }

    const selfReference = this; // Store reference to the original function.
    const initialArguments = Array.prototype.slice.call(arguments, 1); // Capture arguments passed to bind.

    // A no-operation constructor function used for prototype chain inheritance.
    const emptyConstructor = function () { };

    // The actual bound function.
    const resultingBoundFunction = function () {
      // Determine the 'this' context:
      // If called with 'new', 'this' should be the new instance.
      // Otherwise, use the 'contextObject' provided to bind, or a new empty object if null/undefined.
      const actualContext = this instanceof emptyConstructor ? this : (contextObject || {});

      // Combine arguments: those from bind() and those from the call to the bound function.
      const combinedArguments = initialArguments.concat(Array.prototype.slice.call(arguments));

      // Invoke the original function with the determined context and combined arguments.
      return selfReference.apply(actualContext, combinedArguments);
    };

    // Set up prototype chain:
    // If the original function has a prototype, ensure the bound function inherits it.
    // This maintains `instanceof` behavior for bound constructors.
    if (selfReference.prototype) {
      emptyConstructor.prototype = selfReference.prototype;
    }
    resultingBoundFunction.prototype = new emptyConstructor();

    return resultingBoundFunction;
  };
}

// Polyfill for String.prototype.startsWith
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function (prefixString, position = 0) {
    // Basic validation for the prefix.
    if (typeof prefixString !== 'string') {
      throw new TypeError('Expected a string for the prefix.');
    }
    // Ensure position is a valid number and within bounds.
    const startPos = Math.max(0, Math.min(position | 0, this.length));
    const endPos = startPos + prefixString.length;

    // Check if the substring from startPos matches the prefix.
    return this.substring(startPos, endPos) === prefixString;
  };
}

// Main EditorCraft module constructor.
var EditCraft = function () {
  // Reference to the DOM textarea element.
  let editorElement = null;

  // Link to external documentation or help resources.
  const DOCS_URI = "https://daringfireball.net/projects/markdown/syntax";

  // Key codes for common shortcuts.
  const KEY_CODES = {
    UNDO_KEY: 90,   // Z
    ITALIC_KEY: 73, // I
    DELETE_KEY: 68, // D
    BOLD_KEY: 66,   // B
    CODE_KEY: 75,   // K
    SPACEBAR: 32,
    RETURN_KEY: 13
  };

  // Default string for indentation (can be configured later).
  let indentationString = "    "; // Four spaces by default.
  let isPendingListExit = false;
  let activeListMode = ''; // Can be 'unordered' or 'numbered'.
  let lastLineSelectionRange = null;
  let currentListCounter = null;
  let storedSelectionContext = null; // Used for IE selection caching.

  // Environment flags for browser-specific behaviors.
  const needsEolAdjustment = (typeof window.opera !== "undefined") ||
                             (navigator.appName && navigator.appName === "Microsoft Internet Explorer");
  const isLegacyBrowser = navigator.appName && navigator.appName === "Microsoft Internet Explorer";

  // Internal debugging utility.
  // This function will be removed by minifiers if EDITOR_DEBUG_MODE is not defined.
  function debugTrace(messagePayload) {
    // Check for global debug flag.
    if (typeof EDITOR_DEBUG_MODE === "undefined" || !EDITOR_DEBUG_MODE) {
      return; // Skip logging if debug mode is off.
    }

    // Guard against environments without console.
    if (typeof console === "undefined" || !console.log) {
      return;
    }

    const nowStamp = new Date();
    const formattedTime = [
      nowStamp.getHours().toString().padStart(2, '0'),
      nowStamp.getMinutes().toString().padStart(2, '0'),
      nowStamp.getSeconds().toString().padStart(2, '0')
    ].join(':');

    console.log(`EditCraft Debug [${formattedTime}] ${messagePayload}`);
  }

  // --- State Management Sub-Module ---
  // Encapsulates undo/redo functionality.
  this.revisionController = {};
  ((hostEditorInstance) => {
    let _revisionSnapshots = []; // Array to store historical states.

    const _historyModes = {
      liveEditingMode: 0, // User is actively typing.
      playbackMode: 1     // User is navigating history (undo/redo).
    };

    let _currentHistoryMode = _historyModes.liveEditingMode;
    let _redoAvailable = false; // Flag if redo operation is possible.
    let _playbackIndex = null; // Index into _revisionSnapshots when in playbackMode.

    /**
     * Internal helper to trigger editor's undo/redo state callbacks.
     * @param {boolean} canRedoStatus - New status for redo availability.
     * @param {boolean} canUndoStatus - New status for undo availability.
     */
    const _updateEditorStateCallbacks = (canRedoStatus, canUndoStatus) => {
      if (hostEditorInstance.setRedoStateCallback) {
        hostEditorInstance.setRedoStateCallback(canRedoStatus);
      }
      if (hostEditorInstance.setUndoStateCallback) {
        hostEditorInstance.setUndoStateCallback(canUndoStatus);
      }
    };

    /**
     * Initializes the revision controller, saving the editor's initial state.
     */
    this.init = function () {
      debugTrace("RevisionController initialized. Saving initial state.");
      this.saveRevision();
    };

    /**
     * Transitions the controller back to live editing mode.
     * This typically happens when the user types after undoing.
     * Any states that could have been redone are discarded.
     */
    this.returnToLiveEditing = function () {
      if (_currentHistoryMode === _historyModes.playbackMode) {
        // Remove any future states that were discarded by new edits.
        const futureStatesCount = _revisionSnapshots.length - _playbackIndex - 1;
        if (futureStatesCount > 0) {
          debugTrace(`Discarding ${futureStatesCount} future states.`);
          _revisionSnapshots.splice(_playbackIndex + 1, futureStatesCount);
        }

        _redoAvailable = false;
        _currentHistoryMode = _historyModes.liveEditingMode;
        _playbackIndex = null; // Reset playback index.
        _updateEditorStateCallbacks(this.canRedo(), this.canUndo());
      }
    };

    /**
     * Saves the current editor state as a new revision.
     * Only allowed in live editing mode and if the state is different from the last.
     */
    this.saveRevision = function () {
      if (_currentHistoryMode !== _historyModes.liveEditingMode) {
        // Guard against saving new states while in playback.
        debugTrace("Attempted to save revision in playback mode. Operation denied.");
        return;
      }

      const latestState = this.fetchCurrentEditorState();

      // Only save if the new state is distinct from the last saved state.
      if (_revisionSnapshots.length === 0 || !_revisionSnapshots[_revisionSnapshots.length - 1].isIdenticalTo(latestState)) {
        _revisionSnapshots.push(latestState);
        debugTrace(`Revision saved. Total revisions: ${_revisionSnapshots.length}`);
        _updateEditorStateCallbacks(this.canRedo(), this.canUndo());
      } else {
        debugTrace("Current state identical to last; skipping save.");
      }
    };

    /**
     * Reverts the editor to a previous state.
     */
    this.performUndo = function () {
      if (this.canUndo()) {
        if (_playbackIndex === null) {
          // Entering playback mode for the first time.
          _currentHistoryMode = _historyModes.playbackMode;
          _playbackIndex = _revisionSnapshots.length - 1;

          // Before undoing, save the *current* state as a potential redo target.
          _revisionSnapshots.push(this.fetchCurrentEditorState());
          _redoAvailable = true;
          debugTrace("Entered playback mode, saved current state for redo.");
        } else {
          _playbackIndex--; // Move to an older state.
        }

        _revisionSnapshots[_playbackIndex].applySnapshot(); // Restore the selected state.
        debugTrace(`Undid to revision index: ${_playbackIndex}`);
        _updateEditorStateCallbacks(this.canRedo(), this.canUndo());
      } else {
        debugTrace("Undo not possible.");
      }
    };

    /**
     * Advances the editor to a more recent state after an undo.
     */
    this.performRedo = function () {
      if (this.canRedo()) {
        _playbackIndex++; // Move to a newer state.
        _revisionSnapshots[_playbackIndex].applySnapshot(); // Restore the selected state.
        debugTrace(`Redid to revision index: ${_playbackIndex}`);

        // If we've reached the end of the history, exit playback mode.
        if (_playbackIndex === _revisionSnapshots.length - 1) {
          _playbackIndex = null;
          _currentHistoryMode = _historyModes.liveEditingMode;
          _redoAvailable = false;
          debugTrace("Exited playback mode, no more redo states.");
        }
        _updateEditorStateCallbacks(this.canRedo(), this.canUndo());
      } else {
        debugTrace("Redo not possible.");
      }
    };

    /**
     * Checks if an undo operation is currently available.
     * @returns {boolean} True if undo is possible, false otherwise.
     */
    this.canUndo = function () {
      if (_currentHistoryMode === _historyModes.liveEditingMode) {
        // In live mode, undo is possible if there's more than one state,
        // and the current text is different from the last saved state.
        // (The original code's check `_states[_states.length - 1] != _ueditor.getText()`
        // is problematic if `saveRevision` already prevents identical states.)
        // A more robust check: can undo if there's at least one previous unique state.
        return _revisionSnapshots.length > 1 &&
               !_revisionSnapshots[_revisionSnapshots.length - 1].isIdenticalTo(this.fetchCurrentEditorState());
      } else if (_currentHistoryMode === _historyModes.playbackMode) {
        // In playback mode, undo is possible if the current index is not the very first state.
        return _playbackIndex > 0;
      }
      return false;
    };

    /**
     * Checks if a redo operation is currently available.
     * @returns {boolean} True if redo is possible, false otherwise.
     */
    this.canRedo = function () {
      return _redoAvailable && _currentHistoryMode === _historyModes.playbackMode;
    };

    /**
     * Retrieves the currently active state (either the playback state or the latest).
     * @returns {object} The state object.
     */
    this.getPresentState = function () {
      if (_currentHistoryMode === _historyModes.playbackMode) {
        return _revisionSnapshots[_playbackIndex];
      } else {
        return _revisionSnapshots[_revisionSnapshots.length - 1];
      }
    };

    /**
     * Creates a snapshot of the editor's current content and selection.
     * @returns {object} An object representing the current editor state.
     */
    this.fetchCurrentEditorState = function () {
      return {
        stateId: Date.now() + Math.random(), // Unique ID for debugging/tracking.
        currentRange: hostEditorInstance.retrieveSelectionDetails(),
        documentContent: hostEditorInstance.retrieveContent(),

        /**
         * Restores this state to the editor.
         */
        applySnapshot: function () {
          debugTrace(`Applying snapshot (ID: ${this.stateId})`);
          hostEditorInstance.updateContent(this.documentContent);
          hostEditorInstance.applySelectionRange(this.currentRange);
        },

        /**
         * Compares this state with another state object for equality.
         * @param {object} otherState - The state to compare against.
         * @returns {boolean} True if states are identical, false otherwise.
         */
        isIdenticalTo: function (otherState) {
          if (!otherState) return false;
          return this.documentContent === otherState.documentContent &&
                 this.currentRange.compareRanges(otherState.currentRange);
        }
      };
    };
  }).bind(this.revisionController, this)(); // Bind `this` of EditCraft as `hostEditorInstance`.

  // --- Core Editor Methods ---

  /**
   * Initializes the editor with a target textarea element.
   * @param {HTMLTextAreaElement} inputElementRef - The textarea element to manage.
   * @throws {Error} If the provided element is not a valid textarea.
   */
  this.initializeEditor = function (inputElementRef) {
    if (!inputElementRef || inputElementRef.nodeName.toLowerCase() !== "textarea") {
      throw new Error("Invalid target element: must be an HTML textarea.");
    }
    editorElement = inputElementRef;
    this.revisionController.init(); // Initialize state management.

    // Bind event handlers to the editor element.
    // Using addEventListener for better practice, though original used direct assignment.
    editorElement.addEventListener('keyup', this.handleKeyUpEvent.bind(this));
    editorElement.addEventListener('keydown', this.handleKeyDownEvent.bind(this));

    // Handle paste and cut operations as state-changing events.
    editorElement.addEventListener('paste', () => {
      this.revisionController.saveRevision();
    });
    editorElement.addEventListener('cut', () => {
      this.revisionController.saveRevision();
    });

    debugTrace("Editor initialized and event listeners attached.");
  };

  /**
   * Normalizes line endings in a given text to use only LF (`\n`).
   * @param {string} inputText - The text to normalize.
   * @returns {string} The text with normalized line endings.
   */
  this.normalizeLineEndings = function (inputText) {
    let processedText = inputText.replace(/\r\n/g, "\n"); // CRLF to LF
    processedText = processedText.replace(/\r/g, "\n");   // CR to LF
    return processedText;
  };

  /**
   * Retrieves the current width of the browser window's viewport.
   * @returns {number|null} The width in pixels, or null if unable to determine.
   */
  this.getDisplayWidth = function () {
    return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth || null;
  };

  /**
   * Retrieves the current height of the browser window's viewport.
   * @returns {number|null} The height in pixels, or null if unable to determine.
   */
  this.getDisplayHeight = function () {
    return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || null;
  };

  // --- Text Range Object ---
  /**
   * Represents a text selection range within the editor.
   * @param {number} startIndex - The starting character index of the selection.
   * @param {number} endIndex - The ending character index of the selection.
   */
  function TextRange(startIndex, endIndex) {
    if (typeof startIndex !== 'number' || typeof endIndex !== 'number') {
      throw new TypeError("TextRange expects numeric start and end indices.");
    }
    this.startIndex = startIndex;
    this.endIndex = endIndex;

    /**
     * Compares this TextRange with another for equality.
     * @param {TextRange} otherRange - The other range to compare.
     * @returns {boolean} True if start and end indices are identical.
     */
    this.compareRanges = function (otherRange) {
      if (!(otherRange instanceof TextRange)) return false;
      return this.startIndex === otherRange.startIndex &&
             this.endIndex === otherRange.endIndex;
    };

    /**
     * Calculates the length of the selection.
     * @returns {number} The number of characters selected.
     */
    this.getSpan = function () {
      return this.endIndex - this.startIndex;
    };

    /**
     * Provides a string representation of the range.
     * @returns {string} E.g., "[0, 5]".
     */
    this.toString = function() {
      return `[${this.startIndex}, ${this.endIndex}]`;
    };
  }

  /**
   * Retrieves the current selection details from the editor.
   * Handles cross-browser differences for selection retrieval.
   * @returns {TextRange} An object representing the current selection.
   */
  this.retrieveSelectionDetails = function () {
    let startChar = 0, endChar = 0;
    const currentTextarea = editorElement;

    // Modern browsers (and IE9+).
    if (typeof currentTextarea.selectionStart === "number" && typeof currentTextarea.selectionEnd === "number") {
      startChar = currentTextarea.selectionStart;
      endChar = currentTextarea.selectionEnd;
    } else {
      // Legacy IE (IE8 and below).
      let docRange;
      try {
        docRange = storedSelectionContext || document.selection.createRange();
      } catch (e) {
        debugTrace(`Error creating document selection range: ${e.message}`);
        // Fallback or re-throw if critical.
        return new TextRange(0, 0);
      }

      if (docRange && docRange.parentElement() === currentTextarea) {
        const fullContentLength = currentTextarea.value.length;
        const normalizedContent = currentTextarea.value.replace(/\r\n/g, "\n");

        // Create working TextRanges to determine start/end.
        const inputRange = currentTextarea.createTextRange();
        inputRange.moveToBookmark(docRange.getBookmark());

        const endBoundaryRange = currentTextarea.createTextRange();
        endBoundaryRange.collapse(false); // Collapse to the end of the input.

        if (inputRange.compareEndPoints("StartToEnd", endBoundaryRange) > -1) {
          // Selection ends at the very end of the input.
          startChar = endChar = fullContentLength;
        } else {
          startChar = -inputRange.moveStart("character", -fullContentLength);
          // Adjust for line breaks in the normalized string.
          startChar += normalizedContent.slice(0, startChar).split("\n").length - 1;

          if (inputRange.compareEndPoints("EndToEnd", endBoundaryRange) > -1) {
            endChar = fullContentLength;
          } else {
            endChar = -inputRange.moveEnd("character", -fullContentLength);
            // Adjust for line breaks.
            endChar += normalizedContent.slice(0, endChar).split("\n").length - 1;
          }
        }
      }
    }

    // Adjust for `\r` characters that might be present in `textarea.value` but not `selectionStart/End`.
    // This correction is crucial for consistency across different browser line ending behaviors.
    const precedingCarriageReturns = (currentTextarea.value.substring(0, startChar).match(/\r/g) || []).length;
    if (precedingCarriageReturns > 0) {
      startChar -= precedingCarriageReturns;
      endChar -= precedingCarriageReturns;
    }

    return new TextRange(startChar, endChar);
  };

  /**
   * Applies a given selection range to the editor.
   * @param {TextRange} rangeToApply - The TextRange object to set.
   */
  this.applySelectionRange = function (rangeToApply) {
    if (!(rangeToApply instanceof TextRange)) {
      debugTrace("Attempted to apply invalid range object.");
      return;
    }

    const currentTextarea = editorElement;
    let actualStart = rangeToApply.startIndex;
    let actualEnd = rangeToApply.endIndex;

    if (currentTextarea.setSelectionRange) {
      // Modern browsers.
      // Adjust indices if the browser internally uses CRLF but `TextRange` is LF-based.
      const normalizedTextContent = this.normalizeLineEndings(currentTextarea.value);
      const matches = (normalizedTextContent.substring(0, actualStart).match(/\n/g) || []).length;

      if (matches > 0 && needsEolAdjustment) {
        actualStart += matches;
        actualEnd += matches;
      }
      currentTextarea.setSelectionRange(actualStart, actualEnd);
    } else {
      // Legacy IE.
      const range = currentTextarea.createTextRange();
      const totalLength = this.retrieveContent().length;
      range.moveStart("character", -totalLength); // Move to start.
      range.moveEnd("character", -totalLength);   // Collapse to start.
      range.moveEnd("character", actualEnd);      // Extend to end.
      range.moveStart("character", actualStart);  // Move start to selection start.
      range.select();
    }

    // Ensure the editor has focus after setting selection, unless it's already focused.
    if (document.activeElement !== currentTextarea) {
      currentTextarea.focus();
    }
  };

  /**
   * Retrieves the full text content of the editor.
   * @returns {string} The editor's current text.
   */
  this.retrieveContent = function () {
    return editorElement.value;
  };

  /**
   * Updates the editor's text content.
   * @param {string} newText - The new text to set.
   */
  this.updateContent = function (newText) {
    editorElement.value = newText;
  };

  /**
   * Retrieves the text currently selected in the editor.
   * @returns {string} The selected text.
   */
  this.extractSelectedText = function () {
    const currentSelection = this.retrieveSelectionDetails();
    return this.normalizeLineEndings(editorElement.value).substring(
      currentSelection.startIndex,
      currentSelection.startIndex + currentSelection.getSpan()
    );
  };

  /**
   * Caches the current selection range, primarily for IE's `document.selection`.
   */
  this.storeCurrentSelection = function () {
    if (document.selection && document.selection.createRange) {
      storedSelectionContext = document.selection.createRange();
      debugTrace("Selection context stored.");
    }
  };

  /**
   * Clears any cached selection range.
   */
  this.clearStoredSelection = function () {
    storedSelectionContext = null;
    debugTrace("Selection context cleared.");
  };

  /**
   * Inserts text at the current selection point, or replaces selected text.
   * @param {string} insertionString - The text to insert.
   * @returns {TextRange} The new selection range after insertion.
   */
  this.injectText = function (insertionString) {
    const currentSelection = this.retrieveSelectionDetails();
    const fullText = this.retrieveContent();

    const before = fullText.substring(0, currentSelection.startIndex);
    const after = fullText.substring(currentSelection.endIndex);

    this.updateContent(before + insertionString + after);

    const newStart = currentSelection.startIndex;
    const newEnd = newStart + insertionString.length;
    const newRange = new TextRange(newStart, newEnd);
    this.applySelectionRange(newRange);
    return newRange;
  };

  /**
   * Replaces text within a specific range.
   * @param {string} newText - The text to insert.
   * @param {TextRange} targetRange - The range of text to replace.
   * @returns {TextRange} The new selection range after replacement.
   */
  this.replaceTextAtRange = function (newText, targetRange) {
    if (!(targetRange instanceof TextRange)) {
      debugTrace("Attempted to replace text with invalid target range.");
      return this.retrieveSelectionDetails(); // Return current selection as a fallback.
    }

    const fullText = this.retrieveContent();
    const before = fullText.substring(0, targetRange.startIndex);
    const after = fullText.substring(targetRange.endIndex);

    this.updateContent(before + newText + after);

    const newStart = targetRange.startIndex;
    const newEnd = newStart + newText.length;
    const newRange = new TextRange(newStart, newEnd);
    this.applySelectionRange(newRange);
    return newRange;
  };

  /**
   * Moves the selection to the end of a given range.
   * @param {TextRange} targetRange - The range to move the cursor to its end.
   */
  this.selectEnd = function (targetRange) {
    this.applySelectionRange(new TextRange(targetRange.endIndex, targetRange.endIndex));
  };

  /**
   * Retrieves the content of the line where the current selection starts.
   * @returns {string} The text of the current line.
   */
  this.getCurrentLine = function () {
    const currentSelection = this.retrieveSelectionDetails();
    const fullContent = this.normalizeLineEndings(this.retrieveContent());
    const lines = fullContent.split('\n');

    let charCount = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (currentSelection.startIndex >= charCount && currentSelection.startIndex <= charCount + line.length) {
        return line;
      }
      charCount += line.length + 1; // +1 for the newline character.
    }
    return ''; // Should not happen if selection is valid.
  };

  /**
   * Retrieves a TextRange object for the line where the current selection starts.
   * @returns {TextRange} The TextRange of the current line.
   */
  this.getCurrentLineSelection = function () {
    const currentSelection = this.retrieveSelectionDetails();
    const fullContent = this.normalizeLineEndings(this.retrieveContent());
    const lines = fullContent.split('\n');

    let charCount = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (currentSelection.startIndex >= charCount && currentSelection.startIndex <= charCount + line.length) {
        return new TextRange(charCount, charCount + line.length);
      }
      charCount += line.length + 1;
    }
    return new TextRange(0, 0); // Fallback.
  };

  // --- Event Handlers ---

  /**
   * Handles the keyup event from the editor element.
   * @param {KeyboardEvent} keyEvent - The keyboard event object.
   */
  this.handleKeyUpEvent = function (keyEvent) {
    // Ensure event object is consistent.
    const e = keyEvent || window.event;

    // Check if the editor content has changed since the last saved state.
    // If so, and we were in playback mode, transition back to live editing.
    if (this.revisionController.getPresentState().documentContent !== this.retrieveContent()) {
      debugTrace("Content changed on keyup, returning to live editing mode.");
      this.revisionController.returnToLiveEditing();
    }

    // Logic for exiting list items when Enter is pressed.
    if (e.keyCode === KEY_CODES.RETURN_KEY && isPendingListExit) {
      const lastItemContent = this.getCurrentLine();

      if (activeListMode === 'unordered') {
        const unorderedPattern = /^( {2}\*\s*)$/i; // Matches '  * '
        if (unorderedPattern.test(lastItemContent)) {
          // If only '  * ' was left, remove it.
          this.replaceTextAtRange("\n", lastLineSelectionRange);
        } else {
          // Insert a new '  * ' for the next item.
          this.selectEnd(this.injectText(indentationString + '* '));
        }
      } else if (activeListMode === 'numbered') {
        const numberedPattern = /^( {2}\d+\.\s*)$/i; // Matches '  1. '
        if (numberedPattern.test(lastItemContent)) {
          // If only '  N. ' was left, remove it.
          this.replaceTextAtRange("\n", lastLineSelectionRange);
        } else {
          // Insert the next number in the list.
          this.selectEnd(this.injectText(indentationString + (++currentListCounter) + '. '));
        }
      }

      // Reset list-related flags.
      isPendingListExit = false;
      activeListMode = '';
      lastLineSelectionRange = null;
      currentListCounter = null;
      debugTrace("List item exit logic processed.");
    }
  };

  // Helper for `handleKeyDownEvent` to prevent default actions.
  const preventDefaultAction = (keyEvent) => {
    if (keyEvent.preventDefault) {
      keyEvent.preventDefault();
    } else {
      keyEvent.returnValue = false; // For older IE.
      if (keyEvent.cancelBubble !== undefined) {
          keyEvent.cancelBubble = true; // Also for older IE.
      }
    }
  };

  // Debounce state saving for frequent key presses.
  let saveStateTimeout = null;
  const DEBOUNCE_SAVE_DELAY = 500; // milliseconds

  const debouncedSaveState = () => {
      clearTimeout(saveStateTimeout);
      saveStateTimeout = setTimeout(() => {
          this.revisionController.saveRevision();
          debugTrace("Debounced state save triggered.");
      }, DEBOUNCE_SAVE_DELAY);
  };


  /**
   * Handles the keydown event from the editor element.
   * Manages keyboard shortcuts and list item behavior.
   * @param {KeyboardEvent} keyEvent - The keyboard event object.
   */
  this.handleKeyDownEvent = function (keyEvent) {
    const e = keyEvent || window.event; // Normalize event object.

    // Handle special key combinations for editor actions.
    const isCtrl = e.ctrlKey || e.metaKey; // MetaKey for Cmd on Mac.
    const isAlt = e.altKey;
    const isShift = e.shiftKey;

    let handled = false;

    // Undo/Redo shortcuts (Ctrl+Z / Ctrl+Shift+Z or Cmd+Z / Cmd+Shift+Z)
    if (isCtrl && e.keyCode === KEY_CODES.UNDO_KEY) {
      preventDefaultAction(e);
      if (isShift) {
        this.revisionController.performRedo();
        debugTrace("Redo triggered by shortcut.");
      } else {
        this.revisionController.performUndo();
        debugTrace("Undo triggered by shortcut.");
      }
      handled = true;
    }
    // Formatting shortcuts (Ctrl+B, Ctrl+I, Ctrl+D, Ctrl+K)
    else if (isCtrl && !isAlt) {
      preventDefaultAction(e);
      switch (e.keyCode) {
        case KEY_CODES.BOLD_KEY:
          // this.button_bold(); // Assuming these button methods exist.
          debugTrace("Bold shortcut triggered.");
          break;
        case KEY_CODES.ITALIC_KEY:
          // this.button_italic();
          debugTrace("Italic shortcut triggered.");
          break;
        case KEY_CODES.DELETE_KEY:
          // this.button_deleted();
          debugTrace("Deleted text shortcut triggered.");
          break;
        case KEY_CODES.CODE_KEY:
          // this.button_code();
          debugTrace("Code shortcut triggered.");
          break;
        default:
          // Not a recognized Ctrl shortcut.
          handled = false; // Don't prevent default if not handled.
      }
      if (handled) {
          // If a formatting shortcut was handled, save the state.
          this.revisionController.saveRevision();
      }
    }
    // Space or Enter key: trigger a debounced state save.
    else if (e.keyCode === KEY_CODES.RETURN_KEY || e.keyCode === KEY_CODES.SPACEBAR) {
      debouncedSaveState(); // Debounce to avoid saving on every character.
    }


    // Logic for detecting list items when Enter is pressed.
    if (e.keyCode === KEY_CODES.RETURN_KEY && !handled) { // Only if Enter wasn't used for undo/redo.
      const currentLineText = this.getCurrentLine();
      const currentLineRange = this.getCurrentLineSelection();
      let matches = null;

      // Check for unordered list item (e.g., '  * some text')
      if (currentLineText.startsWith(indentationString + '*')) {
        isPendingListExit = true;
        activeListMode = 'unordered';
        lastLineSelectionRange = currentLineRange;
        debugTrace("Unordered list item detected on Enter.");
      }
      // Check for numbered list item (e.g., '  1. some text')
      else if ((matches = currentLineText.match(new RegExp(`^${indentationString}(\\d+)\\.`, 'i'))) !== null) {
        isPendingListExit = true;
        activeListMode = 'numbered';
        lastLineSelectionRange = currentLineRange;
        currentListCounter = parseInt(matches[1], 10); // Extract the number.
        debugTrace(`Numbered list item detected on Enter, counter: ${currentListCounter}`);
      }
    }
  };

  // --- Placeholder for Markdown Formatting Buttons (original methods not implemented in snippet) ---
  // The original code referenced `this.button_bold()`, `this.button_italic()`, etc.
  // These are placeholders to avoid errors. In a full implementation, these would apply markdown.
  this.button_bold = function() { debugTrace("Bold button action (placeholder)"); };
  this.button_italic = function() { debugTrace("Italic button action (placeholder)"); };
  this.button_deleted = function() { debugTrace("Deleted button action (placeholder)"); };
  this.button_code = function() { debugTrace("Code button action (placeholder)"); };
};