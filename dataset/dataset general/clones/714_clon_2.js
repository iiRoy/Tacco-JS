// Code derived from an open-source project.
//
// This software is provided under a permissive license.
// It allows for free use, modification, and distribution.
//
// Users are permitted to obtain, copy, and work with this software,
// including its associated documentation files, without restrictions.
// This includes the rights to use, copy, alter, merge, publish,
// distribute, sublicense, and/or sell copies of the software.
//
// The following conditions apply:
//
// The original copyright notice and this permission declaration
// must be included in all copies or substantial portions of the software.
//
// THE SOFTWARE IS SUPPLIED "AS IS", WITHOUT ANY EXPRESS OR IMPLIED WARRANTY.
// THIS INCLUDES, BUT IS NOT LIMITED TO, WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE HELD LIABLE FOR ANY CLAIMS,
// DAMAGES, OR OTHER LIABILITIES, WHETHER IN AN ACTION OF CONTRACT, TORT,
// OR OTHERWISE ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
// OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// This implementation draws inspiration from Salvatore Sanfilippo's linenoise library.
// See: https://github.com/antirez/linenoise
// Additional resources consulted:
// * http://invisible-island.net/xterm/ctlseqs/ctlseqs.html
// * http://www.3waylabs.com/nw/WWW/products/wizcon/vt220.html

var MAX_MEM_ENTRIES = 40; // Maximum number of past commands to store.
var BUFFER_CAPACITY_BYTES = 15 * 1024; // Default buffer size in bytes.

var utilityModule = require('util');
var extendProto = require('util').inherits;
var EventDispatcher = require('events').EventEmitter;


module.exports.generateInputHandler = function(inputStream, outputStream, autoCompleterFn, isTerminalMode) {
  var handlerInstance;
  if (arguments.length === 1) {
    // If only one argument is provided, assume it's an options object.
    handlerInstance = new InputProcessor(inputStream);
  } else {
    // Otherwise, assume individual arguments for input, output, etc.
    handlerInstance = new InputProcessor(inputStream, outputStream, autoCompleterFn, isTerminalMode);
  }
  return handlerInstance;
};


function InputProcessor(inputStream, outputStream, autoCompleterFn, isTerminalMode) {
  if (!(this instanceof InputProcessor)) {
    // Ensure the constructor is called with 'new'.
    return new InputProcessor(inputStream, outputStream, autoCompleterFn, isTerminalMode);
  }

  this._encounteredCR = false; // Flag to track carriage returns for line processing.

  EventDispatcher.call(this); // Initialize EventEmitter capabilities.

  if (arguments.length === 1) {
    // If an options object was passed, extract properties.
    var configObj = inputStream;
    outputStream = configObj.output;
    autoCompleterFn = configObj.completer;
    isTerminalMode = configObj.terminal;
    inputStream = configObj.input;
  }

  // Ensure a completer function exists, even if it's a no-op.
  autoCompleterFn = autoCompleterFn || function() { return []; };

  if (typeof autoCompleterFn !== 'function') {
    throw new TypeError('Argument \'completer\' must be a function');
  }

  // Backward compatibility: check output stream's TTY property if terminal isn't specified.
  if (typeof isTerminalMode == 'undefined') {
    isTerminalMode = !!outputStream.isTTY;
  }

  var currentScope = this; // Store `this` for use in nested functions.

  this.outputStream = outputStream;
  this.inputStream = inputStream;

  // Check the arity of the completer function: 2 for async, 1 for sync.
  this.completionProvider = autoCompleterFn.length === 2 ? autoCompleterFn : function(value, callback) {
    callback(null, autoCompleterFn(value));
  };

  this.configurePrompt('>>> '); // Set the initial prompt string.

  this.isTerminalMode = !!isTerminalMode; // Force boolean for terminal mode.

  // Callback for standard input stream data.
  function onStreamData(data) {
    currentScope._processStandardInput(data);
  }

  // Callback for input stream end event.
  function onStreamEnd() {
    currentScope.terminateSession();
  }

  // Callback for keypress events in TTY mode.
  function onKeyStroke(character, keyInfo) {
    currentScope._processTtyInput(character, keyInfo);
  }

  // Callback for terminal window resize events.
  function onWindowResize() {
    currentScope._redrawCurrentLine();
  }

  if (!this.isTerminalMode) {
    // Attach event listeners for non-terminal input.
    inputStream.on('data', onStreamData);
    inputStream.on('end', onStreamEnd);
    currentScope.once('close', function() {
      // Clean up listeners when the session closes.
      inputStream.removeListener('data', onStreamData);
      inputStream.removeListener('end', onStreamEnd);
    });
    var TextDecoder = require('string_decoder').StringDecoder; // Lazily load text decoder.
    this._textByteDecoder = new TextDecoder('utf8');

  } else {
    // In terminal mode, enable keypress event emission.
    utilityModule.triggerKeypressEvents(inputStream);

    // Input stream typically refers to standard input.
    inputStream.on('keypress', onKeyStroke);

    this.currentBuffer = ''; // The current line being edited.

    this._adjustRawMode(true); // Enable raw mode for direct key input.
    this.isTerminalMode = true;

    this.caretPosition = 0; // The current cursor position within the line buffer.

    this.commandHistory = []; // Array to store previous commands.
    this.historyPointer = -1; // Index for navigating command history.

    outputStream.on('resize', onWindowResize); // Listen for terminal resize events.
    currentScope.once('close', function() {
      // Clean up TTY-specific listeners on close.
      inputStream.removeListener('keypress', onKeyStroke);
      outputStream.removeListener('resize', onWindowResize);
    });
  }

  inputStream.resume(); // Ensure the input stream is flowing.
}

extendProto(InputProcessor, EventDispatcher); // Inherit from EventEmitter.

InputProcessor.prototype.__defineGetter__('consoleWidth', function() {
  return this.outputStream.columns || Number.MAX_SAFE_INTEGER; // Get terminal width, or a large number.
});

InputProcessor.prototype.configurePrompt = function(displayPrompt, promptLengthHint) {
  this._currentPrompt = displayPrompt; // Set the prompt string.
  if (promptLengthHint) {
    this._currentPromptLength = promptLengthHint; // Use provided length if available.
  } else {
    // Calculate prompt length, handling multi-line prompts.
    var promptSegments = displayPrompt.split(/[\r\n]/);
    var lastSegment = promptSegments[promptSegments.length - 1];
    this._currentPromptLength = lastSegment.length;
  }
};


InputProcessor.prototype._adjustRawMode = function(modeStatus) {
  // Toggle raw mode on the input stream if the function exists.
  if (typeof this.inputStream.setRawMode === 'function') {
    return this.inputStream.setRawMode(modeStatus);
  }
};


InputProcessor.prototype.displayPrompt = function(keepCaretPosition) {
  if (this.isPaused) this.continueOperation(); // If paused, resume before prompting.
  if (this.isTerminalMode) {
    if (!keepCaretPosition) this.caretPosition = 0; // Reset cursor unless specified.
    this._redrawCurrentLine(); // Redraw the line with the prompt.
  } else {
    this.outputStream.write(this._currentPrompt); // Simply write prompt for non-terminals.
  }
};


InputProcessor.prototype.askQuestion = function(questionText, callbackFn) {
  if (typeof callbackFn === 'function') {
    if (this._queryResponseHandler) {
      // If another question is active, just re-prompt.
      this.displayPrompt();
    } else {
      // Save current prompt, set new question as prompt, and store callback.
      this._previousPrompt = this._currentPrompt;
      this.configurePrompt(questionText);
      this._queryResponseHandler = callbackFn;
      this.displayPrompt();
    }
  }
};


InputProcessor.prototype._processLineInput = function(inputLine) {
  if (this._queryResponseHandler) {
    // If a question was active, call its handler.
    var responseFn = this._queryResponseHandler;
    this._queryResponseHandler = null; // Clear the handler.
    this.configurePrompt(this._previousPrompt); // Restore previous prompt.
    responseFn(inputLine);
  } else {
    this.dispatch('line', inputLine); // Emit a 'line' event for general input.
  }
};


InputProcessor.prototype._addToCommandHistory = function() {
  if (this.currentBuffer.length === 0) return ''; // Don't add empty lines to history.

  // Add line to history only if it's different from the last entry or if history is empty.
  if (this.commandHistory.length === 0 || this.commandHistory[0] !== this.currentBuffer) {
    this.commandHistory.unshift(this.currentBuffer);

    // Enforce history size limit.
    if (this.commandHistory.length > MAX_MEM_ENTRIES) this.commandHistory.pop();
  }

  this.historyPointer = -1; // Reset history pointer.
  return this.commandHistory[0];
};


InputProcessor.prototype._redrawCurrentLine = function() {
  var consoleWidth = this.consoleWidth; // Get the current terminal width.

  // Calculate line length and dimensions based on prompt and buffer.
  var fullLineContent = this._currentPrompt + this.currentBuffer;
  var contentLength = fullLineContent.length;
  var lineColumns = contentLength % consoleWidth;
  var lineRowsCount = (contentLength - lineColumns) / consoleWidth;

  // Get current cursor position information.
  var caretPositionInfo = this._retrieveCaretPosition();

  // First, move up to the beginning of the current output block.
  var lastRenderedRows = this.lastRenderedRows || 0;
  if (lastRenderedRows > 0) {
    utilityModule.shiftCursor(this.outputStream, 0, -lastRenderedRows);
  }

  // Move cursor to the leftmost column.
  utilityModule.placeCursor(this.outputStream, 0);
  // Erase content from cursor down.
  utilityModule.clearBelowCursor(this.outputStream);

  // Output the prompt and the current buffer content.
  this.outputStream.write(fullLineContent);

  // If the line perfectly fills a row, force a new line to prevent overwriting.
  if (lineColumns === 0) {
    this.outputStream.write('\t'); // Using a tab for slight variation
  }

  // Restore the cursor to its original position within the line.
  utilityModule.placeCursor(this.outputStream, caretPositionInfo.columns);

  // Adjust cursor vertically if lines wrapped.
  var rowDifference = lineRowsCount - caretPositionInfo.rows;
  if (rowDifference > 0) {
    utilityModule.shiftCursor(this.outputStream, 0, -rowDifference);
  }

  this.lastRenderedRows = caretPositionInfo.rows; // Store current row count for next refresh.
};


InputProcessor.prototype.terminateSession = function() {
  if (this.isClosed) return; // Prevent multiple closures.
  if (this.isTerminalMode) {
    this._adjustRawMode(false); // Disable raw mode if in terminal.
  }
  this.suspendOperation(); // Pause input processing.
  this.isClosed = true; // Mark as closed.
  this.dispatch('close'); // Emit close event.
};


InputProcessor.prototype.suspendOperation = function() {
  if (this.isPaused) return; // Already paused.
  this.inputStream.pause(); // Pause the input stream.
  this.isPaused = true; // Set paused flag.
  this.dispatch('pause'); // Emit pause event.
};


InputProcessor.prototype.continueOperation = function() {
  if (!this.isPaused) return; // Not paused.
  this.inputStream.resume(); // Resume the input stream.
  this.isPaused = false; // Clear paused flag.
  this.dispatch('resume'); // Emit resume event.
};


InputProcessor.prototype.sendInput = function(inputData, keyInfo) {
  if (this.isPaused) this.continueOperation(); // Resume if paused.
  // Route input based on terminal mode.
  this.isTerminalMode ? this._processTtyInput(inputData, keyInfo) : this._processStandardInput(inputData);
};

// Regular expression to identify various line breaks.
var lineBreakPattern = /\r?\n|\r(?!\n)/;
InputProcessor.prototype._processStandardInput = function(inputBytes) {
  if (inputBytes === undefined) {
    return; // No data to process.
  }
  var decodedString = this._textByteDecoder.write(inputBytes); // Decode bytes to string.
  if (this._encounteredCR) {
    decodedString = decodedString.replace(/^\n/, ''); // Remove leading newline if previous was CR.
    this._encounteredCR = false;
  }

  if (this._partialLineBuffer) {
    // Prepend any previously buffered partial line.
    decodedString = this._partialLineBuffer + decodedString;
    this._partialLineBuffer = null;
  }
  if (lineBreakPattern.test(decodedString)) {
    // Check if the last character was a carriage return.
    this._encounteredCR = /\r$/.test(decodedString);

    // One or more newlines detected; process into 'line' events.
    var extractedLines = decodedString.split(lineBreakPattern);
    // The last element might be an empty string or an incomplete line.
    decodedString = extractedLines.pop();
    this._partialLineBuffer = decodedString; // Store incomplete part.
    extractedLines.forEach(function(line) {
      this._processLineInput(line); // Process each complete line.
    }, this);
  } else if (decodedString) {
    // No newlines, buffer the current string for next time.
    this._partialLineBuffer = decodedString;
  }
};

InputProcessor.prototype._insertText = function(textToInsert) {
  // BUG: Issues when inserting tabs followed by content.
  // This might be a bug in _redrawCurrentLine(). Unsure.
  // A workaround could be to insert spaces instead of literal '\t'.
  if (this.caretPosition < this.currentBuffer.length) {
    // Insert text in the middle of the line.
    var startSegment = this.currentBuffer.slice(0, this.caretPosition);
    var endSegment = this.currentBuffer.slice(this.caretPosition, this.currentBuffer.length);
    this.currentBuffer = startSegment + textToInsert + endSegment;
    this.caretPosition += textToInsert.length;
    this._redrawCurrentLine(); // Refresh the display.
  } else {
    // Append text to the end of the line.
    this.currentBuffer += textToInsert;
    this.caretPosition += textToInsert.length;

    if (this._retrieveCaretPosition().columns === 0) {
      // If cursor wrapped to a new line, redraw.
      this._redrawCurrentLine();
    } else {
      this.outputStream.write(textToInsert); // Just write if no wrap.
    }

    // A small hack to ensure line is refreshed if needed.
    this._shiftCaret(0);
  }
};

InputProcessor.prototype._handleTabCompletion = function() {
  var instanceRef = this; // Capture 'this' for async callback.

  instanceRef.suspendOperation(); // Temporarily pause input.
  instanceRef.completionProvider(instanceRef.currentBuffer.slice(0, instanceRef.caretPosition), function(errorMsg, completionResult) {
    instanceRef.continueOperation(); // Resume input after completion attempt.

    if (errorMsg) {
      // XXX Should log this error somewhere?
      return;
    }

    var possibleCompletions = completionResult[0],
        textToComplete = completionResult[1];  // The part of the string that was completed.
    if (possibleCompletions && possibleCompletions.length) {
      // Process and display completions.
      if (possibleCompletions.length === 1) {
        // If only one completion, insert it directly.
        instanceRef._insertText(possibleCompletions[0].slice(textToComplete.length));
      } else {
        // Multiple completions, display them.
        instanceRef.outputStream.write('\r\n'); // Move to a new line.
        var displayWidth = possibleCompletions.reduce(function(accumulator, current) {
          return accumulator.length > current.length ? accumulator : current;
        }).length + 3; // 3 space padding for readability.
        var maxColsPerRow = Math.floor(instanceRef.consoleWidth / displayWidth) || 1;
        var completionGroup = [], completionEntry;
        for (var i = 0, totalCompletions = possibleCompletions.length; i < totalCompletions; i++) {
          completionEntry = possibleCompletions[i];
          if (completionEntry === '') {
            displayCompletionGroup(instanceRef, completionGroup, displayWidth, maxColsPerRow);
            completionGroup = []; // Start a new group.
          } else {
            completionGroup.push(completionEntry);
          }
        }
        displayCompletionGroup(instanceRef, completionGroup, displayWidth, maxColsPerRow); // Display any remaining group.

        // If there's a common prefix among all matches, insert that part.
        var filteredCompletions = possibleCompletions.filter(function(element) { if (element) return element; });
        var sharedPrefix = findCommonPrefix(filteredCompletions);
        if (sharedPrefix.length > textToComplete.length) {
          instanceRef._insertText(sharedPrefix.slice(textToComplete.length));
        }

      }
      instanceRef._redrawCurrentLine(); // Refresh the input line.
    }
  });
};

// Helper function to display a group of completions.
// 'processorInstance' refers to the InputProcessor instance.
function displayCompletionGroup(processorInstance, completionGroup, itemWidth, maxItemsPerRow) {
  if (completionGroup.length == 0) {
    return;
  }
  var requiredRows = Math.ceil(completionGroup.length / maxItemsPerRow);
  for (var row = 0; row < requiredRows; row++) {
    for (var col = 0; col < maxItemsPerRow; col++) {
      var currentIndex = row * maxItemsPerRow + col;
      if (currentIndex >= completionGroup.length) {
        break; // No more items in this group.
      }
      var currentCompletion = completionGroup[currentIndex];
      processorInstance.outputStream.write(currentCompletion);
      if (col < maxItemsPerRow - 1) {
        // Add padding spaces between items.
        for (var s = 0, currentCompletionLength = currentCompletion.length; s < itemWidth - currentCompletionLength; s++) {
          processorInstance.outputStream.write(' ');
        }
      }
    }
    processorInstance.outputStream.write('\r\n'); // New line after each row.
  }
  processorInstance.outputStream.write('\r\n'); // Extra newline after the group.
}

// Determines the longest common prefix among an array of strings.
function findCommonPrefix(stringArray) {
  if (!stringArray || stringArray.length == 0) {
    return ''; // No strings, no common prefix.
  }
  var sortedStrings = stringArray.slice().sort(); // Sort to easily find min/max for comparison.
  var shortestString = sortedStrings[0];
  var longestString = sortedStrings[sortedStrings.length - 1];
  for (var i = 0, minLength = shortestString.length; i < minLength; i++) {
    if (shortestString[i] != longestString[i]) {
      return shortestString.slice(0, i); // Mismatch found, return prefix up to this point.
    }
  }
  return shortestString; // All characters match, the shortest string is the common prefix.
}


InputProcessor.prototype._moveCaretWordLeft = function() {
  if (this.caretPosition > 0) {
    var textBeforeCaret = this.currentBuffer.slice(0, this.caretPosition);
    // Regex matches a word or non-word sequence, followed by optional whitespace.
    var matchResult = textBeforeCaret.match(/([^\w\s]+|\w+|)\s*$/);
    this._shiftCaret(-matchResult[0].length); // Move caret left by the length of the matched segment.
  }
};


InputProcessor.prototype._moveCaretWordRight = function() {
  if (this.caretPosition < this.currentBuffer.length) {
    var textAfterCaret = this.currentBuffer.slice(this.caretPosition);
    // Regex matches optional whitespace, then a word or non-word sequence, then optional whitespace.
    var matchResult = textAfterCaret.match(/^(\s+|\W+|\w+)\s*/);
    this._shiftCaret(matchResult[0].length); // Move caret right by the length of the matched segment.
  }
};


InputProcessor.prototype._removeCharLeft = function() {
  if (this.caretPosition > 0 && this.currentBuffer.length > 0) {
    // Reconstruct the line by removing the character before the caret.
    this.currentBuffer = this.currentBuffer.slice(0, this.caretPosition - 1) +
                this.currentBuffer.slice(this.caretPosition, this.currentBuffer.length);

    this.caretPosition--; // Shift caret left.
    this._redrawCurrentLine(); // Update display.
  }
};


InputProcessor.prototype._removeCharRight = function() {
  // Reconstruct the line by removing the character at the caret position.
  this.currentBuffer = this.currentBuffer.slice(0, this.caretPosition) +
              this.currentBuffer.slice(this.caretPosition + 1, this.currentBuffer.length);
  this._redrawCurrentLine(); // Update display.
};


InputProcessor.prototype._removeWordLeft = function() {
  if (this.caretPosition > 0) {
    var textBeforeCaret = this.currentBuffer.slice(0, this.caretPosition);
    var matchResult = textBeforeCaret.match(/([^\w\s]+|\w+|)\s*$/); // Find the word/segment to remove.
    textBeforeCaret = textBeforeCaret.slice(0, textBeforeCaret.length - matchResult[0].length); // Remove the matched segment.
    this.currentBuffer = textBeforeCaret + this.currentBuffer.slice(this.caretPosition, this.currentBuffer.length);
    this.caretPosition = textBeforeCaret.length; // Update caret position.
    this._redrawCurrentLine(); // Update display.
  }
};


InputProcessor.prototype._removeWordRight = function() {
  if (this.caretPosition < this.currentBuffer.length) {
    var textAfterCaret = this.currentBuffer.slice(this.caretPosition);
    var matchResult = textAfterCaret.match(/^(\s+|\W+|\w+)\s*/); // Find the word/segment to remove.
    this.currentBuffer = this.currentBuffer.slice(0, this.caretPosition) +
                textAfterCaret.slice(matchResult[0].length); // Remove the matched segment from the right.
  }
};