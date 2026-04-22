// This module provides a robust and configurable line processing utility for interactive command-line interfaces.
// It handles input, output, history, and tab completion, adapting to terminal or non-terminal environments.

const MAX_LINE_HISTORY_COUNT = 30;   // Defines the maximum number of entries stored in the command history.
const BUFFER_CHUNK_SIZE = 10240;     // Specifies the internal buffer capacity for incoming data streams (10KB).

// Import necessary core Node.js utility modules.
const standardUtilities = require('util');
const extendObject = require('util').inherits; // Function to set up prototype inheritance.
const EventBroadcaster = require('events').EventEmitter; // Class for event-driven programming.

/**
 * Factory function to create a new input processing instance.
 * Supports both an options object or direct stream arguments.
 * @param {object|ReadableStream} inputSourceOrOptions - The input stream or an options object.
 * @param {WritableStream} [outputTarget] - The output stream.
 * @param {Function} [completionHandler] - Function for tab completion.
 * @param {boolean} [isTerminalMode] - Explicitly set terminal mode.
 * @returns {LineProcessor} A new LineProcessor instance.
 */
exports.buildInputProcessor = function(inputSourceOrOptions, outputTarget, completionHandler, isTerminalMode) {
  let processorInstance;

  // Check if the first argument is an options object or the input stream directly.
  if (arguments.length === 1 && typeof inputSourceOrOptions === 'object' && inputSourceOrOptions !== null) {
    // Single argument is an options object.
    processorInstance = new LineProcessor(inputSourceOrOptions);
  } else {
    // Multiple arguments are direct stream/handler values.
    processorInstance = new LineProcessor(inputSourceOrOptions, outputTarget, completionHandler, isTerminalMode);
  }
  return processorInstance;
};

/**
 * Represents an interactive line processor.
 * @class LineProcessor
 * @extends EventBroadcaster
 * @param {object|ReadableStream} inputSource - The readable stream for input, or an options object.
 * @param {WritableStream} [outputTarget] - The writable stream for output.
 * @param {Function} [completionLogic] - A function to handle tab completions.
 * @param {boolean} [terminalFlag] - A boolean indicating if the interface runs in a TTY terminal.
 */
function LineProcessor(inputSource, outputTarget, completionLogic, terminalFlag) {
  // Enforce 'new' keyword for constructor call.
  if (!(this instanceof LineProcessor)) {
    return new LineProcessor(inputSource, outputTarget, completionLogic, terminalFlag);
  }

  // Initialize EventEmitter capabilities.
  EventBroadcaster.call(this);

  // Internal flag to track if the last received character was a carriage return.
  this._carriageReturnDetected = false;
  this._partialLineBuffer = null; // Buffer for incomplete lines in non-terminal mode.
  this._previousDisplayRows = 0; // Tracks rows used by previous line refresh.

  let actualInputSource = inputSource;
  let actualOutputTarget = outputTarget;
  let actualCompletionLogic = completionLogic;
  let actualTerminalFlag = terminalFlag;

  // Handle argument parsing: either an options object or distinct parameters.
  if (arguments.length === 1 && typeof inputSource === 'object' && inputSource !== null) {
    // Options object provided.
    const configOptions = inputSource;
    actualOutputTarget = configOptions.output;
    actualCompletionLogic = configOptions.completer;
    actualTerminalFlag = configOptions.terminal;
    actualInputSource = configOptions.input;
  }

  // Essential stream validation.
  if (!actualInputSource || typeof actualInputSource.on !== 'function') {
      throw new Error("Invalid or missing input stream for LineProcessor.");
  }
  if (!actualOutputTarget || typeof actualOutputTarget.write !== 'function') {
      throw new Error("Invalid or missing output stream for LineProcessor.");
  }

  // Initialize completion handler: default to no-op if not provided.
  if (!actualCompletionLogic) {
    actualCompletionLogic = () => [];
  }
  // Validate completion handler type.
  if (typeof actualCompletionLogic !== 'function') {
    throw new TypeError('The provided completion handler must be a function.');
  }

  // Determine terminal mode if not explicitly specified.
  if (actualTerminalFlag === undefined) {
    actualTerminalFlag = !!actualOutputTarget.isTTY;
  }

  const currentProcessor = this; // Self-reference for event handlers.

  this.outputTarget = actualOutputTarget;
  this.inputSource = actualInputSource;

  // Wrap completion handler to ensure it's always async (callback-based).
  this.completionService = actualCompletionLogic.length === 2
    ? actualCompletionLogic // Already async.
    : function(currentValue, completionCallback) {
        // Wrap sync completer in process.nextTick to make it async.
        process.nextTick(() => {
          try {
            completionCallback(null, actualCompletionLogic(currentValue));
          } catch (e) {
            completionCallback(e);
          }
        });
      };

  this.configurePrompt('>> '); // Set initial prompt text.

  this.isOperatingInTerminal = !!actualTerminalFlag; // Store terminal mode status.

  // Define event handler functions.
  function handleDataReceipt(dataChunk) {
    currentProcessor._processRawInput(dataChunk);
  }

  function handleStreamEnd() {
    currentProcessor.terminateProcessor();
  }

  function handleKeyPress(character, keyMetadata) {
    currentProcessor._manageTerminalInput(character, keyMetadata);
  }

  function handleTerminalResize() {
    currentProcessor._refreshDisplayLine();
  }

  // Configure event listeners based on operating mode.
  if (!this.isOperatingInTerminal) {
    // Non-terminal mode: listen for 'data' and 'end' events from input.
    inputSource.on('data', handleDataReceipt);
    inputSource.on('end', handleStreamEnd);
    currentProcessor.once('closed', function() {
      // Clean up listeners when the processor is closed.
      inputSource.removeListener('data', handleDataReceipt);
      inputSource.removeListener('end', handleStreamEnd);
    });
    // Lazy load StringDecoder for decoding non-terminal byte streams.
    const TextDecoderUtility = require('string_decoder').StringDecoder;
    this._textDecoder = new TextDecoderUtility('utf8');

  } else {
    // Terminal mode: activate keypress event emission and manage line state.
    exports.emitKeypressSignal(inputSource); // External utility to enable keypress events.

    inputSource.on('keypress', handleKeyPress);

    this.currentLineBuffer = ''; // The buffer holding the current input line.
    this.cursorPosition = 0;     // Current cursor position within the `currentLineBuffer`.

    this._setTerminalRawMode(true); // Enable raw mode for direct key input.

    this.commandHistory = [];    // Array to store command history.
    this.historyPointer = -1;    // Pointer for navigating command history.

    outputTarget.on('resize', handleTerminalResize); // Listen for terminal resize events.
    currentProcessor.once('closed', function() {
      // Clean up listeners when the processor is closed.
      inputSource.removeListener('keypress', handleKeyPress);
      outputTarget.removeListener('resize', handleTerminalResize);
    });
  }

  // Ensure the input stream is in flowing mode to receive data.
  inputSource.resume();
}

// Establish prototype inheritance from EventBroadcaster.
extendObject(LineProcessor, EventBroadcaster);

/**
 * Getter for the number of available columns in the output terminal.
 * Defaults to Number.MAX_SAFE_INTEGER if not a TTY.
 * @member {number} LineProcessor#availableColumns
 */
Object.defineProperty(LineProcessor.prototype, 'availableColumns', {
  get: function() {
    return this.outputTarget.columns || Number.MAX_SAFE_INTEGER;
  }
});

/**
 * Configures the prompt text and updates its cached display length.
 * @param {string} newPromptText - The string to use as the prompt.
 * @param {number} [explicitLength] - Optional explicit length for the prompt (e.g., for ANSI sequences).
 */
LineProcessor.prototype.configurePrompt = function(newPromptText, explicitLength) {
  this._currentPromptText = newPromptText;

  if (explicitLength !== undefined && explicitLength !== null) {
    this._cachedPromptLength = explicitLength;
  } else {
    // Calculate effective length, considering potential multi-line prompts.
    const promptSegments = newPromptText.split(/[\r\n]/);
    const lastPromptSegment = promptSegments[promptSegments.length - 1];
    this._cachedPromptLength = lastPromptSegment.length;
  }
};

/**
 * Tries to set raw mode on the input stream.
 * @param {boolean} enableMode - True to enable raw mode, false to disable.
 * @returns {boolean|undefined} The result of `setRawMode` or undefined if not available.
 */
LineProcessor.prototype._setTerminalRawMode = function(enableMode) {
  if (typeof this.inputSource.setRawMode === 'function') {
    return this.inputSource.setRawMode(enableMode);
  }
  return undefined; // Not a TTY or function not present.
};

/**
 * Displays the current prompt to the output stream.
 * @param {boolean} [maintainCursorPosition=false] - If true, the cursor position is not reset.
 */
LineProcessor.prototype.displayPrompt = function(maintainCursorPosition = false) {
  if (this.isPaused) this.resumeProcessor(); // Ensure processor is active.

  if (this.isOperatingInTerminal) {
    if (!maintainCursorPosition) {
      this.cursorPosition = 0; // Reset cursor to the start of the line.
    }
    this._refreshDisplayLine(); // Refresh the entire line display.
  } else {
    this.outputTarget.write(this._currentPromptText); // Simply write the prompt.
  }
};

/**
 * Asks a question by setting the prompt and calling a callback when a line is entered.
 * @param {string} questionText - The question string to display as the prompt.
 * @param {Function} responseCallback - The callback function to receive the user's response.
 */
LineProcessor.prototype.askQuestion = function(questionText, responseCallback) {
  if (typeof responseCallback !== 'function') {
    console.warn('LineProcessor.askQuestion: A valid callback function is required.');
    return;
  }

  if (this._pendingQuestionCallback) {
    // If another question is active, just re-display the current prompt.
    this.displayPrompt();
  } else {
    // Store the current prompt and set the new question as the temporary prompt.
    this._storedPromptText = this._currentPromptText;
    this.configurePrompt(questionText);
    this._pendingQuestionCallback = responseCallback;
    this.displayPrompt();
  }
};

/**
 * Handles a complete line of input, either for a pending question or as a general line event.
 * @param {string} processedLine - The complete line of text received.
 */
LineProcessor.prototype._handleLineInput = function(processedLine) {
  if (this._pendingQuestionCallback) {
    const callbackToInvoke = this._pendingQuestionCallback;
    this._pendingQuestionCallback = null; // Clear the pending question state.
    this.configurePrompt(this._storedPromptText); // Restore the original prompt.
    callbackToInvoke(processedLine); // Invoke the question's callback.
  } else {
    this.emit('receivedLine', processedLine); // Emit a general line event.
  }
};

/**
 * Adds the current line buffer content to the command history, if not empty or redundant.
 * @returns {string} The line that was added or would have been added (trimmed).
 */
LineProcessor.prototype._addToCommandHistory = function() {
  const currentInput = this.currentLineBuffer.trim();
  if (currentInput.length === 0) {
    return ''; // Do not add empty lines.
  }

  // Add to history only if it's different from the most recent entry.
  if (this.commandHistory.length === 0 || this.commandHistory[0] !== currentInput) {
    this.commandHistory.unshift(currentInput); // Add to the front.

    // Enforce maximum history size.
    if (this.commandHistory.length > MAX_LINE_HISTORY_COUNT) {
      this.commandHistory.pop(); // Remove the oldest entry.
    }
  }

  this.historyPointer = -1; // Reset history navigation pointer.
  return currentInput;
};

/**
 * Calculates the visual row and column position of the cursor based on terminal width.
 * @returns {{cols: number, rows: number}} The visual column and row.
 */
LineProcessor.prototype._calculateCursorVisualPosition = function() {
  const totalColumns = this.availableColumns;
  const promptPart = this._currentPromptText;
  const inputPart = this.currentLineBuffer.slice(0, this.cursorPosition);
  const combinedLength = promptPart.length + inputPart.length;

  const visualCols = combinedLength % totalColumns;
  const visualRows = Math.floor(combinedLength / totalColumns);

  return { cols: visualCols, rows: visualRows };
};

/**
 * Refreshes the entire displayed input line, including the prompt and cursor position.
 * This involves clearing the current line and rewriting it.
 */
LineProcessor.prototype._refreshDisplayLine = function() {
  const totalColumns = this.availableColumns;

  // Construct the full string to be displayed.
  const fullDisplayedLine = this._currentPromptText + this.currentLineBuffer;
  const totalLineLength = fullDisplayedLine.length;

  // Calculate wrapped line properties for the full string.
  const effectiveLineColumns = totalLineLength % totalColumns;
  const effectiveLineRows = Math.floor(totalLineLength / totalColumns);

  // Get the current visual cursor position.
  const currentCursorVisualPos = this._calculateCursorVisualPosition();

  // Move cursor up to clear previously displayed lines.
  if (this._previousDisplayRows > 0) {
    exports.moveTerminalCursor(this.outputTarget, 0, -this._previousDisplayRows);
  }

  // Move cursor to the beginning of the line (column 0).
  exports.positionTerminalCursor(this.outputTarget, 0);
  // Clear the screen from the cursor down to ensure old text is removed.
  exports.eraseScreenDownFromCursor(this.outputTarget);

  // Write the complete prompt + line buffer.
  this.outputTarget.write(fullDisplayedLine);

  // If the line exactly fills the last column, write a space to force a new line,
  // preventing the last character from being overwritten on subsequent refreshes.
  if (effectiveLineColumns === 0 && totalLineLength > 0) {
    this.outputTarget.write(' ');
  }

  // Restore the cursor to its correct visual column position.
  exports.positionTerminalCursor(this.outputTarget, currentCursorVisualPos.cols);

  // Adjust cursor vertically if line wrapping caused it to move.
  const rowDifference = effectiveLineRows - currentCursorVisualPos.rows;
  if (rowDifference > 0) {
    exports.moveTerminalCursor(this.outputTarget, 0, -rowDifference);
  }

  // Store the number of rows occupied by the current line for the next refresh cycle.
  this._previousDisplayRows = currentCursorVisualPos.rows;
};

/**
 * Terminates the LineProcessor instance, cleaning up resources.
 */
LineProcessor.prototype.terminateProcessor = function() {
  if (this.isTerminated) return; // Prevent double termination.

  if (this.isOperatingInTerminal) {
    this._setTerminalRawMode(false); // Disable raw mode.
  }
  this.pauseProcessor(); // Pause input processing.
  this.isTerminated = true;
  this.emit('closed'); // Emit a 'closed' event.
};

/**
 * Pauses the input stream and emits a 'paused' event.
 */
LineProcessor.prototype.pauseProcessor = function() {
  if (this.isPaused) return;

  this.inputSource.pause();
  this.isPaused = true;
  this.emit('paused');
};

/**
 * Resumes the input stream and emits a 'resumed' event.
 */
LineProcessor.prototype.resumeProcessor = function() {
  if (!this.isPaused) return;

  this.inputSource.resume();
  this.isPaused = false;
  this.emit('resumed');
};

/**
 * Injects data into the line processor, routing it based on terminal mode.
 * @param {string|Buffer} dataPayload - The data to inject.
 * @param {object} [keyInfo] - Key metadata if in terminal mode.
 */
LineProcessor.prototype.injectInput = function(dataPayload, keyInfo) {
  if (this.isPaused) this.resumeProcessor();

  if (this.isOperatingInTerminal) {
    this._manageTerminalInput(dataPayload, keyInfo);
  } else {
    this._processRawInput(dataPayload);
  }
};

// Regular expression to detect common line endings: \r\n, \n, or \r (not followed by \n).
const newlinePattern = /\r?\n|\r(?!\n)/;

/**
 * Processes raw input data chunks, buffering partial lines and emitting complete lines.
 * This method is primarily used in non-terminal mode.
 * @param {Buffer} inputBuffer - The raw data buffer received from the input stream.
 */
LineProcessor.prototype._processRawInput = function(inputBuffer) {
  if (inputBuffer === undefined || inputBuffer === null) {
    return; // Guard against invalid input.
  }

  let decodedString = this._textDecoder.write(inputBuffer);

  // Adjust for fragmented newlines (e.g., '\r' in one chunk, '\n' in the next).
  if (this._carriageReturnDetected) {
    decodedString = decodedString.replace(/^\n/, '');
    this._carriageReturnDetected = false;
  }

  // Prepend any previously buffered partial line.
  if (this._partialLineBuffer) {
    decodedString = this._partialLineBuffer + decodedString;
    this._partialLineBuffer = null;
  }

  // Check for line endings within the decoded string.
  if (newlinePattern.test(decodedString)) {
    // Determine if the string ends with a carriage return for potential fragmentation.
    this._carriageReturnDetected = /\r$/.test(decodedString);

    const lineSegments = decodedString.split(newlinePattern);
    // The last segment might be an empty string or an incomplete line.
    this._partialLineBuffer = lineSegments.pop(); // Store it for next chunk.

    // Process each complete line segment.
    lineSegments.forEach(function(segment) {
      this._handleLineInput(segment);
    }, this);
  } else if (decodedString.length > 0) {
    // No newlines found, so buffer the entire string.
    this._partialLineBuffer = decodedString;
  }
};

/**
 * Inserts a given text string at the current cursor position.
 * @param {string} textToInsert - The string to insert.
 */
LineProcessor.prototype._insertTextAtCursor = function(textToInsert) {
  if (!textToInsert || textToInsert.length === 0) {
    return;
  }

  const currentBuffer = this.currentLineBuffer;
  const currentCursor = this.cursorPosition;

  if (currentCursor < currentBuffer.length) {
    // Insert in the middle of the line.
    const startSegment = currentBuffer.slice(0, currentCursor);
    const endSegment = currentBuffer.slice(currentCursor);
    this.currentLineBuffer = startSegment + textToInsert + endSegment;
    this.cursorPosition += textToInsert.length;
    this._refreshDisplayLine();
  } else {
    // Append to the end of the line.
    this.currentLineBuffer += textToInsert;
    this.cursorPosition += textToInsert.length;

    // Optimization: if appending doesn't cause a line wrap, just write the text.
    if (this._calculateCursorVisualPosition().cols === 0) {
      this._refreshDisplayLine();
    } else {
      this.outputTarget.write(textToInsert);
    }
    // After direct write, ensure cursor is visually correct. A full refresh is robust.
    this._refreshDisplayLine();
  }
};

/**
 * Handles tab completion requests.
 */
LineProcessor.prototype._handleTabCompletion = function() {
  const processorInstance = this;

  processorInstance.pauseProcessor(); // Temporarily pause input.
  processorInstance.completionService(
    processorInstance.currentLineBuffer.slice(0, processorInstance.cursorPosition),
    function(completionError, completionResult) {
      processorInstance.resumeProcessor(); // Resume input after completion processing.

      if (completionError) {
        // Log or emit error for completion service failures.
        console.error('Completion service encountered an error:', completionError);
        processorInstance.emit('completionError', completionError);
        return;
      }

      const suggestions = completionResult[0];  // Array of suggested completions.
      const completionBase = completionResult[1]; // The fragment of text being completed.

      if (suggestions && suggestions.length > 0) {
        if (suggestions.length === 1) {
          // If only one suggestion, insert the unique part.
          processorInstance._insertTextAtCursor(suggestions[0].slice(completionBase.length));
        } else {
          // Multiple suggestions: display them and find common prefix.
          processorInstance.outputTarget.write('\r\n'); // Move to a new line for list display.

          // Calculate optimal display width for suggestions.
          let maxWidth = 0;
          for (const s of suggestions) {
            if (s.length > maxWidth) maxWidth = s.length;
          }
          const itemDisplayWidth = maxWidth + 2; // Add 2 spaces for padding.

          const maxItemsPerRow = Math.floor(processorInstance.availableColumns / itemDisplayWidth) || 1;
          let currentGroup = [];
          for (let i = 0; i < suggestions.length; i++) {
            const suggestionItem = suggestions[i];
            if (suggestionItem === '') {
              // Empty string can act as a group separator for display.
              displayCompletionGroup(processorInstance, currentGroup, itemDisplayWidth, maxItemsPerRow);
              currentGroup = [];
            } else {
              currentGroup.push(suggestionItem);
            }
          }
          displayCompletionGroup(processorInstance, currentGroup, itemDisplayWidth, maxItemsPerRow); // Display any remaining items.

          // Find and insert the longest common prefix among all valid suggestions.
          const validSuggestions = suggestions.filter(s => s.length > 0);
          const commonPrefixText = findCommonPrefix(validSuggestions);
          if (commonPrefixText.length > completionBase.length) {
            processorInstance._insertTextAtCursor(commonPrefixText.slice(completionBase.length));
          }
        }
        processorInstance._refreshDisplayLine(); // Refresh the input line after display/insertion.
      }
    }
  );
};

/**
 * Helper function to format and display a group of completion suggestions in columns.
 * @param {LineProcessor} processorRef - Reference to the LineProcessor instance.
 * @param {string[]} suggestionGroup - Array of suggestions to display.
 * @param {number} itemDisplayWidth - The calculated width for each suggestion item.
 * @param {number} maxItemsPerRow - The maximum number of items to display per row.
 */
function displayCompletionGroup(processorRef, suggestionGroup, itemDisplayWidth, maxItemsPerRow) {
  if (suggestionGroup.length === 0) {
    return;
  }

  const requiredRows = Math.ceil(suggestionGroup.length / maxItemsPerRow);

  for (let rowIdx = 0; rowIdx < requiredRows; rowIdx++) {
    for (let colIdx = 0; colIdx < maxItemsPerRow; colIdx++) {
      const globalIdx = rowIdx * maxItemsPerRow + colIdx;
      if (globalIdx >= suggestionGroup.length) {
        break;
      }
      const currentSuggestion = suggestionGroup[globalIdx];
      processorRef.outputTarget.write(currentSuggestion);

      // Add padding spaces.
      if (colIdx < maxItemsPerRow - 1) {
        const suggestionLength = currentSuggestion.length;
        const paddingNeeded = itemDisplayWidth - suggestionLength;
        for (let s = 0; s < paddingNeeded; s++) {
          processorRef.outputTarget.write(' ');
        }
      }
    }
    processorRef.outputTarget.write('\r\n'); // New line after each row.
  }
  processorRef.outputTarget.write('\r\n'); // Extra new line after the entire group.
}

/**
 * Helper function to find the longest common prefix among an array of strings.
 * @param {string[]} candidateStrings - An array of strings to compare.
 * @returns {string} The longest common prefix.
 */
function findCommonPrefix(candidateStrings) {
  if (!candidateStrings || candidateStrings.length === 0) {
    return '';
  }
  if (candidateStrings.length === 1) {
    return candidateStrings[0];
  }

  // Sort the array to easily compare the first and last strings.
  const sortedCandidates = candidateStrings.slice().sort();
  const firstString = sortedCandidates[0];
  const lastString = sortedCandidates[sortedCandidates.length - 1];
  const minLength = Math.min(firstString.length, lastString.length);

  // Compare characters from the beginning until a mismatch is found.
  for (let charIdx = 0; charIdx < minLength; charIdx++) {
    if (firstString[charIdx] !== lastString[charIdx]) {
      return firstString.slice(0, charIdx);
    }
  }
  return firstString.slice(0, minLength); // All characters up to minLength are common.
}

/**
 * Moves the cursor one word to the left.
 */
LineProcessor.prototype._moveCursorWordLeft = function() {
  if (this.cursorPosition > 0) {
    const textBeforeCursor = this.currentLineBuffer.slice(0, this.cursorPosition);
    // Matches the last word/non-word segment including trailing spaces.
    const wordBoundaryMatch = textBeforeCursor.match(/([^\w\s]+|\w+|)\s*$/);
    if (wordBoundaryMatch && wordBoundaryMatch[0]) {
      this._adjustCursorPosition(-wordBoundaryMatch[0].length);
    } else {
      this._adjustCursorPosition(-this.cursorPosition); // Fallback to start of line.
    }
  }
};

/**
 * Moves the cursor one word to the right.
 */
LineProcessor.prototype._moveCursorWordRight = function() {
  if (this.cursorPosition < this.currentLineBuffer.length) {
    const textAfterCursor = this.currentLineBuffer.slice(this.cursorPosition);
    // Matches the first word/non-word segment including leading spaces.
    const wordBoundaryMatch = textAfterCursor.match(/^(\s+|\W+|\w+)\s*/);
    if (wordBoundaryMatch && wordBoundaryMatch[0]) {
      this._adjustCursorPosition(wordBoundaryMatch[0].length);
    } else {
      this._adjustCursorPosition(this.currentLineBuffer.length - this.cursorPosition); // Fallback to end of line.
    }
  }
};

/**
 * Deletes the character to the left of the cursor.
 */
LineProcessor.prototype._deleteCharacterLeft = function() {
  if (this.cursorPosition > 0 && this.currentLineBuffer.length > 0) {
    const preCursor = this.currentLineBuffer.slice(0, this.cursorPosition - 1);
    const postCursor = this.currentLineBuffer.slice(this.cursorPosition);
    this.currentLineBuffer = preCursor + postCursor;
    this.cursorPosition--;
    this._refreshDisplayLine();
  }
};

/**
 * Deletes the character to the right of the cursor.
 */
LineProcessor.prototype._deleteCharacterRight = function() {
  if (this.cursorPosition < this.currentLineBuffer.length) {
    const preCursor = this.currentLineBuffer.slice(0, this.cursorPosition);
    const postCursor = this.currentLineBuffer.slice(this.cursorPosition + 1);
    this.currentLineBuffer = preCursor + postCursor;
    this._refreshDisplayLine();
  }
};

/**
 * Deletes the word to the left of the cursor.
 */
LineProcessor.prototype._deletePreviousWord = function() {
  if (this.cursorPosition > 0) {
    let textBeforeCursor = this.currentLineBuffer.slice(0, this.cursorPosition);
    const wordSegmentMatch = textBeforeCursor.match(/([^\w\s]+|\w+|)\s*$/);

    let charactersToDelete = 0;
    if (wordSegmentMatch && wordSegmentMatch[0]) {
        charactersToDelete = wordSegmentMatch[0].length;
    } else {
        const leadingSpacesMatch = textBeforeCursor.match(/\s+$/);
        if (leadingSpacesMatch && leadingSpacesMatch[0]) {
            charactersToDelete = leadingSpacesMatch[0].length;
        } else {
            charactersToDelete = 1; // Fallback to single character deletion.
        }
    }

    const newLeadingText = textBeforeCursor.slice(0, textBeforeCursor.length - charactersToDelete);
    this.currentLineBuffer = newLeadingText + this.currentLineBuffer.slice(this.cursorPosition);
    this.cursorPosition = newLeadingText.length;
    this._refreshDisplayLine();
  }
};

/**
 * Deletes the word to the right of the cursor.
 */
LineProcessor.prototype._deleteNextWord = function() {
  if (this.cursorPosition < this.currentLineBuffer.length) {
    const textAfterCursor = this.currentLineBuffer.slice(this.cursorPosition);
    const wordSegmentMatch = textAfterCursor.match(/^(\s+|\W+|\w+)\s*/);

    let charactersToDelete = 0;
    if (wordSegmentMatch && wordSegmentMatch[0]) {
        charactersToDelete = wordSegmentMatch[0].length;
    } else {
        charactersToDelete = 1; // Fallback to single character deletion.
    }

    this.currentLineBuffer = this.currentLineBuffer.slice(0, this.cursorPosition) +
                             textAfterCursor.slice(charactersToDelete);
    this._refreshDisplayLine();
  }
};

/**
 * Adjusts the internal cursor position by a given delta and refreshes the display.
 * This is a simplified internal helper, the actual terminal cursor movement is handled by external utilities.
 * @param {number} delta - The amount to move the cursor (positive for right, negative for left).
 */
LineProcessor.prototype._adjustCursorPosition = function(delta) {
  const newPosition = this.cursorPosition + delta;
  this.cursorPosition = Math.max(0, Math.min(newPosition, this.currentLineBuffer.length));
  this._refreshDisplayLine(); // Update the display to reflect the new cursor position.
};

/**
 * Handles raw keypress events in terminal mode. This is a simplified implementation
 * of the comprehensive logic found in a full readline module.
 * @param {string} char - The character pressed (if printable).
 * @param {object} key - Object containing key metadata (name, ctrl, meta, shift, etc.).
 */
LineProcessor.prototype._manageTerminalInput = function(char, key) {
  // Basic key handling for common actions. A full implementation would be much more extensive.
  if (key) {
    if (key.name === 'return') {
        this._handleLineInput(this._addToCommandHistory());
        this.currentLineBuffer = '';
        this.cursorPosition = 0;
        this._refreshDisplayLine();
    } else if (key.name === 'backspace') {
        this._deleteCharacterLeft();
    } else if (key.name === 'delete') {
        this._deleteCharacterRight();
    } else if (key.name === 'left') {
        this._adjustCursorPosition(-1);
    } else if (key.name === 'right') {
        this._adjustCursorPosition(1);
    } else if (key.name === 'tab') {
        this._handleTabCompletion();
    } else if (key.name === 'up') {
        // Implement history navigation (move up).
    } else if (key.name === 'down') {
        // Implement history navigation (move down).
    } else if (char && !key.ctrl && !key.meta && !key.shift) {
        // Insert printable characters.
        this._insertTextAtCursor(char);
    }
  } else if (char) {
      // Handle characters without specific key metadata (e.g., paste events).
      this._insertTextAtCursor(char);
  }
};


// --- External Terminal Control Utilities (placeholders for Node.js internal tty/readline utils) ---
// In a real Node.js environment, these would be imported from 'tty' or 'internal/readline/utils'.

/**
 * Moves the terminal cursor by a relative amount (dx columns, dy rows).
 * @param {WritableStream} stream - The output stream (e.g., process.stdout).
 * @param {number} dx - Horizontal movement (positive for right, negative for left).
 * @param {number} dy - Vertical movement (positive for down, negative for up).
 */
exports.moveTerminalCursor = function(stream, dx, dy) {
  // Actual implementation would use ANSI escape codes.
  // Example: if (dx !== 0) stream.write(`\x1b[${Math.abs(dx)}${dx > 0 ? 'C' : 'D'}`);
  // if (dy !== 0) stream.write(`\x1b[${Math.abs(dy)}${dy > 0 ? 'B' : 'A'}`);
};

/**
 * Sets the terminal cursor position to an absolute column.
 * @param {WritableStream} stream - The output stream.
 * @param {number} x - The absolute column position (0-indexed).
 */
exports.positionTerminalCursor = function(stream, x) {
  // Actual implementation would use ANSI escape codes.
  // Example: stream.write(`\x1b[${x + 1}G`);
};

/**
 * Clears the screen from the current cursor position down to the end of the screen.
 * @param {WritableStream} stream - The output stream.
 */
exports.eraseScreenDownFromCursor = function(stream) {
  // Actual implementation would use ANSI escape codes.
  // Example: stream.write('\x1b[J');
};

/**
 * Enables the emission of 'keypress' events on a ReadableStream.
 * This function typically attaches a listener that parses raw input into key events.
 * @param {ReadableStream} stream - The input stream (e.g., process.stdin).
 */
exports.emitKeypressSignal = function(stream) {
  // This is a placeholder. Node.js's actual implementation involves complex byte parsing
  // and mapping to key objects, often found in `tty.js` or `internal/readline/utils.js`.
};