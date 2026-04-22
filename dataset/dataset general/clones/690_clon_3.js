(function(jq){
  // Terminal Emulator Core 2.1
  // (C) 2023 - A.N. Other, based on JQuery Console 1.0 by Chris Done & Simon David Pratt
  // Licensed under the same terms as the original software.
  //
  // This code has been extensively refactored to achieve a Type III clone.
  // Changes include:
  // - Renaming of all identifiers (variables, functions, CSS classes)
  // - Rewriting of comments and internal documentation
  // - Alteration of code structure, logic flow, and data types (e.g., const/let)
  // - Addition of new helper functions, guard clauses, and intermediate steps
  // - Removal of redundant or non-essential code fragments

  // Internal flag to track browser specifics, simplified from original.
  const isModernBrowser = ('onpaste' in document.createElement('input'));

  jq.fn.terminalEmulator = function(settings){
    // Ensure the target element exists.
    if (!this.length) {
      console.warn("Terminal Emulator: No target element found for initialization.");
      return this;
    }

    ////////////////////////////////////////////////////////////////////////
    // Configuration and Utility Constants
    // These maps define actions for various keyboard inputs.
    // Original key codes (37=left, 39=right, etc.) are preserved for functionality.
    const standardKeyActions = {
      37: _shiftCaretLeft,    // Left arrow
      39: _shiftCaretRight,   // Right arrow
      38: _navigateHistoryUp, // Up arrow
      40: _navigateHistoryDown,// Down arrow
      8:  _removeCharBackward, // Backspace
      46: _removeCharForward,  // Delete
      35: _moveCaretToEnd,    // End key
      36: _moveCaretToStart,  // Home key
      13: _executeInputLine,  // Enter/Return
      9:  _attemptCompletion  // Tab
    };

    const controlKeyActions = {
      65: _moveCaretToStart,   // Ctrl-A
      69: _moveCaretToEnd,     // Ctrl-E
      68: _removeCharForward,   // Ctrl-D
      78: _navigateHistoryDown, // Ctrl-N
      80: _navigateHistoryUp,   // Ctrl-P
      66: _shiftCaretLeft,     // Ctrl-B
      70: _shiftCaretRight,    // Ctrl-F
      75: _deleteUntilEnd      // Ctrl-K
    };

    const altKeyActions = {
      70: _moveCaretToNextWord,     // Alt-F
      66: _moveCaretToPreviousWord,  // Alt-B
      68: _deleteNextWord           // Alt-D
    };

    const shiftKeyActions = {
      13: _insertNewLine           // Shift-Enter
    };

    // Merge custom control codes if provided in settings.
    if (settings && settings.customControlCodes) {
      jq.extend(controlKeyActions, settings.customControlCodes);
    }

    // HTML snippet for the blinking caret indicator.
    const blinkIndicatorHTML = '<span class="emulator-caret-indicator">&nbsp;</span>';

    ////////////////////////////////////////////////////////////////////////
    // Internal State Variables
    let hostElement = jq(this); // The main container for the terminal.
    let contentWrapper = _createEl('div', 'emulator-content-wrapper'); // Inner scrollable area.
    let inputBuffer = _createEl('textarea', 'emulator-input-buffer', {
      autocomplete: 'off', autocorrect: 'off', autocapitalize: 'off', spellcheck: 'false'
    }); // Hidden textarea for input capture.

    let currentLineContainer; // The DOM element holding the current prompt and input.
    let editableSpan;         // The span where the user's input is visually rendered.
    let continuationPromptString = settings && settings.continuationPromptText ?
      settings.continuationPromptText : "> ";

    let caretPosition = 0;          // Current position of the caret within `currentInputText`.
    let currentInputText = '';      // The actual text content of the current input line.
    let tempRestoreBuffer = '';     // Buffer to restore input after history navigation.
    let animateResetTransition = settings.animateResetTransition !== undefined ? settings.animateTransition : true;

    // Command history management.
    let commandHistoryStack = [];
    let historyIndex = 0; // 0 means current input, 1 means last command, etc.

    // A flag to prevent duplicate keypress events from firing after keydown.
    let keyEventConsumed = 0;
    // Controls whether the terminal accepts user input.
    let inputEnabled = true;

    // Public API exposed by the terminal instance.
    const exposedAPI = {};

    // Internal state object for easier management
    const terminalState = {
      isInputActive: true,
      isExecutingCommand: false,
      currentPromptPrefix: settings && settings.mainPromptText ? settings.mainPromptText : "> ",
      isMultilineInput: false
    };

    ////////////////////////////////////////////////////////////////////////
    // Initialization Sequence
    (function(){
      hostElement.append(contentWrapper);
      contentWrapper.append(inputBuffer);

      // Position the hidden input buffer off-screen.
      inputBuffer.css({position:'absolute', top:0, left:'-9999px'});

      // Display a welcome message if configured.
      if (settings.welcomeMessage) {
        _displayMessage(settings.welcomeMessage, 'emulator-welcome-message');
      }

      // Create the initial prompt line.
      _createNewPromptLine();

      // Set initial focus if configured.
      if (settings.autoFocus) {
        _focusTerminalInput();
        // A small delay sometimes helps with browser focus issues.
        setTimeout(_focusTerminalInput, 100);
      }

      // Expose internal elements and utilities via the public API.
      exposedAPI.contentWrapper = contentWrapper;
      exposedAPI.inputBuffer = inputBuffer;
      exposedAPI.scrollTerminalToBottom = _scrollTerminalToBottom;
      exposedAPI.outputResult = _outputResult;
      exposedAPI.clearContent = _clearTerminalContent;
      exposedAPI.focus = _focusTerminalInput;
      exposedAPI.reset = _resetTerminal;
      exposedAPI.showNotification = _showNotification;
    })();

    ////////////////////////////////////////////////////////////////////////
    // Core Terminal Operations

    // Resets the terminal to its initial state, clearing all output.
    function _resetTerminal(){
      const hasWelcomeMessage = (typeof settings.welcomeMessage !== 'undefined');

      const removeAllOutput = function() {
        contentWrapper.find('div').each(function(){
          // Skip the welcome message if it should persist through reset.
          if (!hasWelcomeMessage || !jq(this).hasClass('emulator-welcome-message')) {
            jq(this).remove();
          }
        });
      };

      if (animateResetTransition) {
        hostElement.fadeOut(function() {
          removeAllOutput();
          _createNewPromptLine();
          hostElement.fadeIn(_focusTerminalInput);
        });
      } else {
        removeAllOutput();
        _createNewPromptLine();
        _focusTerminalInput();
      }
    }

    // Sets focus on the hidden input buffer and applies focus styling.
    function _focusTerminalInput() {
      contentWrapper.addClass('emulator-focused');
      inputBuffer.focus();
    }

    // Displays a temporary notification message.
    function _showNotification(msg, type){
      const notificationBox = _createEl('div', 'emulator-notification')
        .append(_createEl('div').text(msg))
        .css({visibility:'hidden'});

      hostElement.append(notificationBox);

      let interactionRequired = false;
      if (type === 'fadeout') {
        setTimeout(function(){
          notificationBox.fadeOut(function(){
            notificationBox.remove();
          });
        }, 4000); // Notification fades after 4 seconds.
      } else if (type === 'prompt') {
        const actionPrompt = _createEl('div', 'emulator-action-prompt')
          .append(_createEl('a', '', { href: 'javascript:void(0)' }).text('OK'))
          .append(_createEl('div', 'clear-float')); // Clearfix
        notificationBox.append(_createEl('br/')).append(actionPrompt);
        interactionRequired = true;
        actionPrompt.on('click', function(){
          notificationBox.fadeOut(function(){
            notificationBox.remove();
            contentWrapper.css({opacity:1}); // Restore full opacity.
          });
        });
      }

      const originalHeight = notificationBox.height();
      notificationBox.css({height:'0px', visibility:'visible'})
        .animate({height:originalHeight+'px'}, function(){
          if (interactionRequired) {
            contentWrapper.css({opacity:0.5}); // Dim terminal if interaction is needed.
          }
        });
      notificationBox.css('cursor','default');
      return notificationBox;
    }

    // Creates and appends a new prompt line element.
    function _createNewPromptLine() {
      caretPosition = 0;
      currentInputText = '';
      historyIndex = 0; // Reset history navigation.
      _enableInput();

      currentLineContainer = _createEl('div', 'emulator-prompt-line');
      const promptLabel = _createEl('span', 'emulator-prompt-label');
      const labelText = terminalState.isMultilineInput ? continuationPromptString : terminalState.currentPromptPrefix;
      promptLabel.text(labelText).show();
      // Replace space with non-breaking space for consistent display.
      promptLabel.html(promptLabel.html().replace(' ','&nbsp;'));
      editableSpan = _createEl('span', 'emulator-editable-input');
      currentLineContainer.append(promptLabel).append(editableSpan);
      contentWrapper.append(currentLineContainer);
      _updatePromptDisplay();
      _scrollTerminalToBottom();
    }

    // Clears all content from the terminal display.
    function _clearTerminalContent() {
      contentWrapper.find('div.emulator-prompt-line, div.emulator-output-message, div.emulator-welcome-message, div.emulator-notification').remove();
      _createNewPromptLine();
    }

    ////////////////////////////////////////////////////////////////////////
    // Event Handlers

    // Handles clicks on the terminal container to refocus the input.
    hostElement.on('click', function(){
      // Do not interfere if text is currently selected.
      if (window.getSelection().toString()) {
        return false;
      }
      _focusTerminalInput();
      _scrollTerminalToBottom();
      return false;
    });

    // Handles loss of focus for the input buffer.
    inputBuffer.on('blur', function(){
      contentWrapper.removeClass('emulator-focused');
    });

    // Handles paste events to insert text into the prompt.
    inputBuffer.on('paste', function(e) {
      inputBuffer.val(""); // Clear buffer to get only pasted content.
      // Timeout ensures the text is fully pasted before reading.
      setTimeout(function() {
        _insertTextIntoPrompt(inputBuffer.val());
        inputBuffer.val(""); // Clear again after processing.
      }, 0);
    });

    // Handles keydown events for control characters and special actions.
    inputBuffer.on('keydown', function(e){
      keyEventConsumed = 0; // Reset flag for each keydown.
      const keyPressedCode = e.keyCode;

      // Ctrl-C: Cancel current operation.
      if (e.ctrlKey && keyPressedCode === 67) {
        keyEventConsumed = keyPressedCode;
        _abortCurrentExecution();
        return false;
      }

      if (inputEnabled) {
        let action = null;
        if (e.shiftKey && keyPressedCode in shiftKeyActions) {
          action = shiftKeyActions[keyPressedCode];
        } else if (e.altKey && keyPressedCode in altKeyActions) {
          action = altKeyActions[keyPressedCode];
        } else if (e.ctrlKey && keyPressedCode in controlKeyActions) {
          action = controlKeyActions[keyPressedCode];
        } else if (keyPressedCode in standardKeyActions) {
          action = standardKeyActions[keyPressedCode];
        }

        if (action) {
          keyEventConsumed = keyPressedCode;
          action();
          return false; // Prevent default browser action.
        }
      }
    });

    // Handles keypress events for character insertion.
    inputBuffer.on('keypress', function(e){
      const charCode = e.keyCode || e.which;

      // Filter out ignorable keys (e.g., Alt-Tab).
      if (_isIgnorableKey(e)) {
        return false;
      }

      // Ctrl-V / Cmd-V: Allow default paste behavior (handled by 'paste' event).
      if ((e.ctrlKey || e.metaKey) && String.fromCharCode(charCode).toLowerCase() === 'v') {
        return true;
      }

      // Only process if input is enabled and keydown didn't consume the event.
      if (inputEnabled && keyEventConsumed !== charCode && charCode >= 32){
        // Optional: Check if a custom charInsertTrigger is defined.
        const shouldInsert = !settings.charInsertTrigger ||
                             (typeof settings.charInsertTrigger === 'function' &&
                              settings.charInsertTrigger(charCode, currentInputText));
        if (shouldInsert){
          _insertTextIntoPrompt(charCode);
        }
      }
      // Prevent default behavior for webkit browsers for character keys.
      if (isModernBrowser) return false;
    });

    // Helper to determine if a key event should be ignored.
    function _isIgnorableKey(e) {
      // Example: Alt-Tab often triggers keypress events; ignore them.
      return (e.keyCode === 9 || e.keyCode === 192) && e.altKey;
    }

    ////////////////////////////////////////////////////////////////////////
    // Caret and Input Manipulation

    // Moves the caret by 'delta' characters.
    function _moveCaret(delta) {
      const newCaretPosition = caretPosition + delta;
      if (newCaretPosition >= 0 && newCaretPosition <= currentInputText.length) {
        caretPosition = newCaretPosition;
        _updatePromptDisplay();
        return true;
      }
      return false;
    }

    // Shifts the caret one position to the left.
    function _shiftCaretLeft() {
      _moveCaret(-1);
    }

    // Shifts the caret one position to the right.
    function _shiftCaretRight() {
      _moveCaret(1);
    }

    // Moves the caret to the beginning of the input line.
    function _moveCaretToStart() {
      caretPosition = 0;
      _updatePromptDisplay();
    }

    // Moves the caret to the end of the input line.
    function _moveCaretToEnd() {
      caretPosition = currentInputText.length;
      _updatePromptDisplay();
    }

    // Moves the caret to the next word boundary.
    function _moveCaretToNextWord() {
      let originalCaret = caretPosition;
      // Skip non-alphanumeric characters.
      while (caretPosition < currentInputText.length && !_isAlphaNumeric(currentInputText[caretPosition])) {
        caretPosition++;
      }
      // Skip alphanumeric characters (the word itself).
      while (caretPosition < currentInputText.length && _isAlphaNumeric(currentInputText[caretPosition])) {
        caretPosition++;
      }
      if (caretPosition !== originalCaret) {
        _updatePromptDisplay();
      }
    }

    // Moves the caret to the previous word boundary.
    function _moveCaretToPreviousWord() {
      let originalCaret = caretPosition;
      // Skip non-alphanumeric characters backward.
      while (caretPosition > 0 && !_isAlphaNumeric(currentInputText[caretPosition - 1])) {
        caretPosition--;
      }
      // Skip alphanumeric characters (the word itself) backward.
      while (caretPosition > 0 && _isAlphaNumeric(currentInputText[caretPosition - 1])) {
        caretPosition--;
      }
      if (caretPosition !== originalCaret) {
        _updatePromptDisplay();
      }
    }

    // Inserts text (or a single character code) into the current prompt.
    function _insertTextIntoPrompt(content){
      let textToInsert = (typeof content === 'number') ? String.fromCharCode(content) : content;

      // Handle multiline paste/input
      if (typeof textToInsert === 'string') {
        const lines = textToInsert.split('\n');
        for (let i = 0; i < lines.length - 1; i++) {
          _doSingleInsert(lines[i]);
          _executeInputLine(); // Simulate hitting enter for each line.
        }
        _doSingleInsert(lines[lines.length - 1]);
      } else {
        _doSingleInsert(textToInsert);
      }
    }

    // Internal helper for inserting a single string/character.
    function _doSingleInsert(text) {
      const prefix = currentInputText.substring(0, caretPosition);
      const suffix = currentInputText.substring(caretPosition);
      currentInputText = prefix + text + suffix;
      caretPosition += text.length;
      _updatePromptDisplay();
    }

    // Removes the character at the current caret position.
    function _deleteCharFromCaret() {
      if (caretPosition < currentInputText.length){
        currentInputText =
          currentInputText.substring(0, caretPosition) +
          currentInputText.substring(caretPosition + 1);
        tempRestoreBuffer = currentInputText; // Update restore buffer.
        return true;
      }
      return false;
    }

    // Deletes the character before the caret.
    function _removeCharBackward() {
      if (_moveCaret(-1)){ // Move caret back first.
        _deleteCharFromCaret();
        _updatePromptDisplay();
      }
    }

    // Deletes the character at the caret position.
    function _removeCharForward() {
      if (_deleteCharFromCaret()){
        _updatePromptDisplay();
      }
    }

    // Deletes all characters from the caret to the end of the line.
    function _deleteUntilEnd() {
      if (caretPosition < currentInputText.length) {
        currentInputText = currentInputText.substring(0, caretPosition);
        tempRestoreBuffer = currentInputText;
        _updatePromptDisplay();
      }
    }

    // Deletes the next word from the caret position.
    function _deleteNextWord() {
      // A "word" is defined as a sequence of alphanumeric characters.
      let originalCaret = caretPosition;
      let startOfDeletion = caretPosition;

      // Skip non-alphanumeric characters.
      while (startOfDeletion < currentInputText.length && !_isAlphaNumeric(currentInputText[startOfDeletion])) {
        startOfDeletion++;
      }
      // Skip alphanumeric characters (the word itself).
      let endOfDeletion = startOfDeletion;
      while (endOfDeletion < currentInputText.length && _isAlphaNumeric(currentInputText[endOfDeletion])) {
        endOfDeletion++;
      }

      if (endOfDeletion > originalCaret) {
        currentInputText = currentInputText.substring(0, originalCaret) + currentInputText.substring(endOfDeletion);
        tempRestoreBuffer = currentInputText;
        _updatePromptDisplay();
      }
    }

    // Inserts a new line character and adjusts caret.
    function _insertNewLine() {
      const lines = currentInputText.split('\n');
      const lastLine = lines[lines.length - 1];
      const leadingSpacesMatch = lastLine.match(/^(\s*)/);
      const leadingSpaces = leadingSpacesMatch ? leadingSpacesMatch[1] : '';
      const newLineContent = "\n" + leadingSpaces;

      _insertTextIntoPrompt(newLineContent);
    }

    // Helper to check if a character is alphanumeric.
    function _isAlphaNumeric(char) {
      return /^[a-zA-Z0-9]$/.test(char);
    }

    ////////////////////////////////////////////////////////////////////////
    // History Navigation

    // Rotates through the command history.
    function _rotateHistory(direction) { // direction: -1 for up, 1 for down.
      if (commandHistoryStack.length === 0) return;

      historyIndex += direction;

      // Clamp history index within valid range.
      if (historyIndex < 0) historyIndex = commandHistoryStack.length;
      else if (historyIndex > commandHistoryStack.length) historyIndex = 0;

      // Store current input if navigating up from current.
      if (historyIndex === commandHistoryStack.length && direction === -1) {
        tempRestoreBuffer = currentInputText;
      }

      if (historyIndex === 0) {
        currentInputText = tempRestoreBuffer;
      } else {
        currentInputText = commandHistoryStack[historyIndex - 1];
      }

      // Adjust caret position based on settings.
      if (settings.preserveCaretPosition) {
        caretPosition = Math.min(caretPosition, currentInputText.length);
        if (caretPosition === 0 && currentInputText.length > 0) {
          caretPosition = currentInputText.length; // Default to end if at start.
        }
      } else {
        caretPosition = currentInputText.length; // Always move to end.
      }
      _updatePromptDisplay();
    }

    // Navigates to the previous command in history.
    function _navigateHistoryUp() {
      _rotateHistory(-1);
    }

    // Navigates to the next command in history.
    function _navigateHistoryDown() {
      _rotateHistory(1);
    }

    // Adds a command to the history stack.
    function _addToCommandHistory(line){
      if (line.trim() !== '' && commandHistoryStack[commandHistoryStack.length - 1] !== line) {
        commandHistoryStack.push(line);
      }
      tempRestoreBuffer = ''; // Clear buffer after adding to history.
    }

    ////////////////////////////////////////////////////////////////////////
    // Command Execution and Display

    // Validates and triggers the command execution.
    function _executeInputLine() {
      const inputLine = currentInputText;
      let validationResult = true;

      if (typeof settings.commandValidator === 'function') {
        validationResult = settings.commandValidator(inputLine);
      }

      if (validationResult === true) {
        _handleCommandExecution();
      } else if (typeof validationResult === 'string') {
        _outputResult(validationResult, "emulator-message-error");
      }
      // If validationResult is false, do nothing (e.g., for continued input).
    }

    // Attempts command completion (e.g., for autocompletion).
    function _attemptCompletion() {
      if (typeof settings.completionHandler === 'function') {
        const completion = settings.completionHandler(currentInputText, caretPosition);
        if (completion && completion.text) {
          const newText = currentInputText.substring(0, completion.start) + completion.text + currentInputText.substring(completion.end);
          currentInputText = newText;
          caretPosition = completion.start + completion.text.length;
          _updatePromptDisplay();
        } else if (completion && completion.list && completion.list.length > 0) {
          // Display completion list.
          _outputResult(completion.list.join('   '), 'emulator-completion-list');
          _createNewPromptLine();
        }
      } else {
        // If no completion handler, just insert a tab character.
        _insertTextIntoPrompt('\t');
      }
    }

    // Scrolls the terminal display to the very bottom.
    function _scrollTerminalToBottom() {
      // Modern jQuery uses .prop for scroll properties.
      contentWrapper.prop({ scrollTop: contentWrapper.prop("scrollHeight") });
    }

    // Triggers the command cancellation handler.
    function _abortCurrentExecution() {
      if (typeof settings.cancelHandler === 'function') {
        settings.cancelHandler();
      }
      terminalState.isExecutingCommand = false;
      _enableInput();
      _outputResult("Command cancelled.", "emulator-message-info");
      _createNewPromptLine();
    }

    // Handles the actual command execution by calling the user-defined handler.
    function _handleCommandExecution() {
      if (typeof settings.commandHandler === 'function') {
        _disableInput();
        _addToCommandHistory(currentInputText);
        const commandToExecute = currentInputText;

        // Clear the current input line for visual feedback.
        currentLineContainer.find('.emulator-editable-input').text(commandToExecute);
        currentLineContainer.find('.emulator-caret-indicator').remove();

        // Create a new prompt line immediately, but keep it disabled.
        _createNewPromptLine();
        _disableInput(); // Ensure the new prompt is also disabled during execution.

        terminalState.isExecutingCommand = true;
        terminalState.isMultilineInput = false;

        try {
          const commandResult = settings.commandHandler(commandToExecute, exposedAPI);

          // Handle promises for asynchronous commands.
          if (commandResult && typeof commandResult.then === 'function') {
            commandResult
              .then(function(res) {
                _outputResult(res, "emulator-output-message");
              })
              .catch(function(err) {
                _outputResult(err, "emulator-message-error");
              })
              .finally(function() {
                _enableInput();
                terminalState.isExecutingCommand = false;
                _scrollTerminalToBottom();
              });
          } else {
            // Handle synchronous commands.
            _outputResult(commandResult, "emulator-output-message");
            _enableInput();
            terminalState.isExecutingCommand = false;
            _scrollTerminalToBottom();
          }
        } catch (e) {
          _outputResult("Error: " + e.message, "emulator-message-error");
          _enableInput();
          terminalState.isExecutingCommand = false;
          _scrollTerminalToBottom();
        }
      } else {
        // No command handler defined, just output the input.
        _outputResult(currentInputText, "emulator-output-message");
        _createNewPromptLine();
      }
    }

    // Displays a message in the terminal output area.
    function _displayMessage(msg, className) {
      if (msg) {
        const messageDiv = _createEl('div', className).html(msg);
        contentWrapper.append(messageDiv);
        _scrollTerminalToBottom();
      }
    }

    // Public method to output a result.
    function _outputResult(result, className) {
      _displayMessage(result, className);
    }

    // Updates the visual representation of the prompt line.
    function _updatePromptDisplay() {
      const prefix = currentInputText.substring(0, caretPosition);
      const suffix = currentInputText.substring(caretPosition);
      editableSpan.html(prefix + blinkIndicatorHTML + suffix);
      _scrollTerminalToBottom();
    }

    // Enables user input.
    function _enableInput() {
      inputEnabled = true;
      contentWrapper.removeClass('emulator-input-disabled');
      inputBuffer.prop('disabled', false);
      _updatePromptDisplay(); // Ensure caret is visible.
    }

    // Disables user input.
    function _disableInput() {
      inputEnabled = false;
      contentWrapper.addClass('emulator-input-disabled');
      inputBuffer.prop('disabled', true);
      editableSpan.find('.emulator-caret-indicator').remove(); // Hide caret.
    }

    // Helper function for creating jQuery elements with classes and attributes.
    function _createEl(tagName, className, attributes = {}) {
      const el = jq(`<${tagName}></${tagName}>`);
      if (className) el.addClass(className);
      for (const attr in attributes) {
        if (attributes.hasOwnProperty(attr)) {
          el.attr(attr, attributes[attr]);
        }
      }
      return el;
    }

    // Return the public API for this terminal instance.
    return exposedAPI;
  };
})(jQuery);