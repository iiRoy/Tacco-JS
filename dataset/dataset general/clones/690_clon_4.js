(function() {
  const isWebKitEngine = navigator.userAgent.includes('AppleWebKit/');

  // Helper for focusing without scrolling (mimics jQuery's focusWithoutScrolling)
  function setFocusWithoutScroll(element) {
    if (isWebKitEngine) {
      element.focus();
    } else {
      // Temporarily make it fixed to avoid scrolling
      const originalPosition = element.style.position;
      const originalTop = element.style.top;
      const originalLeft = element.style.left;

      element.style.position = 'fixed';
      element.style.top = '-9999px';
      element.style.left = '-9999px';

      element.focus();

      element.style.position = originalPosition;
      element.style.top = originalTop;
      element.style.left = originalLeft;
    }
  }

  class TerminalEmulator {
    constructor(elementNode, configuration) {
      // Internal Constants and Mappings
      this.normalKeyActions = new Map([
        // left arrow
        [37, this.shiftCaretLeft],
        // right arrow
        [39, this.shiftCaretRight],
        // up arrow
        [38, this.recallPreviousCommand],
        // down arrow
        [40, this.recallNextCommand],
        // backspace
        [8, this.deleteCharBeforeCaret],
        // delete key
        [46, this.deleteCharAtCaret],
        // end key
        [35, this.moveCaretToEnd],
        // home key
        [36, this.moveCaretToStart],
        // enter key
        [13, this.executeInput],
        // tab key
        [9, this.performCompletion]
      ]);
      this.controlKeyActions = new Map([
        // Ctrl-A
        [65, this.moveCaretToStart],
        // Ctrl-E
        [69, this.moveCaretToEnd],
        // Ctrl-D
        [68, this.deleteCharAtCaret],
        // Ctrl-N
        [78, this.recallNextCommand],
        // Ctrl-P
        [80, this.recallPreviousCommand],
        // Ctrl-B
        [66, this.shiftCaretLeft],
        // Ctrl-F
        [70, this.shiftCaretRight],
        // Ctrl-K
        [75, this.deleteFromCaretToEnd]
      ]);
      if (configuration.controlKeyBindings) {
        Object.entries(configuration.controlKeyBindings).forEach(([key, handler]) => {
          this.controlKeyActions.set(parseInt(key, 10), handler);
        });
      }
      this.metaKeyActions = new Map([
        // Alt-F
        [70, this.moveCaretToNextWord],
        // Alt-B
        [66, this.moveCaretToPreviousWord],
        // Alt-D
        [68, this.deleteNextWord]
      ]);
      this.capitalKeyActions = new Map([
        // Shift-Enter
        [13, this.insertNewline],
      ]);

      this.cursorElementHtml = '<span class="console-caret">&nbsp;</span>';

      // Global State Variables
      this.mainContainer = elementNode;
      this.displayArea = document.createElement('div');
      this.displayArea.classList.add('terminal-display');

      this.keyInterceptor = document.createElement('textarea');
      this.keyInterceptor.setAttribute('autocomplete', 'off');
      this.keyInterceptor.setAttribute('autocorrect', 'off');
      this.keyInterceptor.setAttribute('autocapitalize', 'off');
      this.keyInterceptor.setAttribute('spellcheck', 'false');
      this.keyInterceptor.classList.add('terminal-typer');
      this.keyInterceptor.style.position = 'absolute';
      this.keyInterceptor.style.top = '0';
      this.keyInterceptor.style.left = '-9999px';

      this.currentLineContainer = null;
      this.inputSegment = null;
      this.continuedPromptString = configuration && configuration.continuedPromptLabel ?
        configuration.continuedPromptLabel : "> ";
      this.caretPosition = 0;
      this.activeInputBuffer = '';
      this.savedInputBuffer = '';
      this.fadeOnResetOption = configuration.fadeOnReset !== undefined ? configuration.fadeOnReset : true;

      this.commandLog = [];
      this.logIndex = 0;

      this.ignoreNextKeyPress = 0;
      this.acceptingInput = true;
      this.commandAborted = false;

      // Configuration callbacks and labels
      this.initialPromptLabel = configuration && configuration.promptLabel ? configuration.promptLabel : "> ";
      this.currentPromptLabel = this.initialPromptLabel;

      this.inputValidator = configuration.commandValidate;
      this.inputProcessor = configuration.commandHandle;
      this.abortHandler = configuration.cancelHandle;
      this.characterInsertionTrigger = configuration.charInsertTrigger;
      this.completionHandler = configuration.completionHandle;

      // Initialization routine
      this.setupTerminal(configuration);
    }

    setupTerminal(config) {
      this.mainContainer.appendChild(this.displayArea);
      this.displayArea.appendChild(this.keyInterceptor);

      if (config.welcomeMessage) {
        this.outputMessage(config.welcomeMessage, 'terminal-welcome');
      }

      this.createPromptLine();

      if (config.autofocus) {
        this.displayArea.classList.add('terminal-focused');
        setFocusWithoutScroll(this.keyInterceptor);
      }

      this.mainContainer.addEventListener('click', this.handleDisplayClick.bind(this));
      this.keyInterceptor.addEventListener('blur', this.handleBlur.bind(this));
      this.keyInterceptor.addEventListener('keydown', this.handleKeyDown.bind(this));
      this.keyInterceptor.addEventListener('keypress', this.handleKeyPress.bind(this));
      this.keyInterceptor.addEventListener('paste', this.handlePaste.bind(this));
    }

    // Public API methods
    focusTerminal() {
      this.displayArea.classList.add('terminal-focused');
      setFocusWithoutScroll(this.keyInterceptor);
    }

    resetTerminal() {
      let hasWelcome = (typeof this.startupMessage !== 'undefined');

      const clearElements = () => {
        // Remove all children except possibly the welcome message
        const childrenToRemove = Array.from(this.displayArea.children).filter(child => {
          if (child === this.keyInterceptor) {
            return false;
          }
          if (hasWelcome && child.classList.contains('terminal-welcome')) {
            hasWelcome = false;
            return false;
          }
          return true;
        });
        childrenToRemove.forEach(child => child.remove());
        this.displayArea.appendChild(this.keyInterceptor);
      };

      if (this.fadeOnResetOption) {
        this.mainContainer.style.transition = 'opacity 0.3s ease-out';
        this.mainContainer.style.opacity = 0;
        this.mainContainer.addEventListener('transitionend', () => {
          clearElements();
          this.createPromptLine();
          this.mainContainer.style.opacity = 1;
          this.focusTerminal();
          this.mainContainer.style.transition = ''; // Remove transition after use
        }, {
          once: true
        });
      } else {
        clearElements();
        this.createPromptLine();
        this.focusTerminal();
      }
    }

    displayNotice(textMsg, styleType) {
      const notificationDiv = document.createElement('div');
      notificationDiv.classList.add('terminal-notification');
      const contentDiv = document.createElement('div');
      contentDiv.textContent = textMsg;
      notificationDiv.appendChild(contentDiv);
      notificationDiv.style.visibility = 'hidden';
      this.mainContainer.appendChild(notificationDiv);

      let shouldFocus = true;
      if (styleType === 'fadeout') {
        setTimeout(() => {
          notificationDiv.style.transition = 'opacity 0.5s ease-out';
          notificationDiv.style.opacity = 0;
          notificationDiv.addEventListener('transitionend', () => notificationDiv.remove(), {
            once: true
          });
        }, 4000);
      } else if (styleType === 'prompt') {
        const actionDiv = document.createElement('div');
        actionDiv.classList.add('terminal-action');
        const okLink = document.createElement('a');
        okLink.href = 'javascript:void(0);';
        okLink.textContent = 'OK';
        actionDiv.appendChild(document.createElement('br'));
        actionDiv.appendChild(okLink);
        const clearDiv = document.createElement('div');
        clearDiv.classList.add('clear-fix'); // Renamed to avoid potential conflicts
        actionDiv.appendChild(clearDiv);
        notificationDiv.appendChild(actionDiv);
        shouldFocus = false;
        okLink.addEventListener('click', () => {
          notificationDiv.style.transition = 'opacity 0.5s ease-out';
          notificationDiv.style.opacity = 0;
          notificationDiv.addEventListener('transitionend', () => {
            notificationDiv.remove();
            this.displayArea.style.opacity = 1;
          }, {
            once: true
          });
        });
      }

      const height = notificationDiv.offsetHeight;
      notificationDiv.style.height = '0px';
      notificationDiv.style.visibility = 'visible';
      notificationDiv.style.transition = 'height 0.3s ease-out, opacity 0.3s ease-out';
      notificationDiv.style.height = height + 'px';
      notificationDiv.addEventListener('transitionend', () => {
        if (!shouldFocus) this.displayArea.style.opacity = 0.5;
        notificationDiv.style.transition = ''; // Remove transition after use
      }, {
        once: true
      });
      notificationDiv.style.cursor = 'default';
      return notificationDiv;
    }

    outputResult(messageContent, cssClass = 'terminal-message') {
      const messageDiv = document.createElement('div');
      messageDiv.classList.add(cssClass);
      messageDiv.textContent = messageContent;
      this.displayArea.insertBefore(messageDiv, this.currentLineContainer);
      this.scrollViewportToBottom();
    }

    outputMessage(text, className) {
      const msgDiv = document.createElement('div');
      msgDiv.classList.add(className);
      msgDiv.textContent = text;
      this.displayArea.insertBefore(msgDiv, this.currentLineContainer);
      this.scrollViewportToBottom();
    }

    createPromptLine() {
      this.caretPosition = 0;
      this.activeInputBuffer = '';
      this.logIndex = 0;
      this.enableInput();

      if (this.currentLineContainer) {
        this.currentLineContainer.remove(); // Remove previous prompt line
      }

      this.currentLineContainer = document.createElement('div');
      this.currentLineContainer.classList.add('terminal-prompt-line');
      const labelSpan = document.createElement('span');
      labelSpan.classList.add('terminal-prompt-label');
      labelSpan.textContent = this.currentPromptLabel;
      this.currentLineContainer.appendChild(labelSpan);
      labelSpan.innerHTML = labelSpan.innerHTML.replace(/ /g, '&nbsp;');

      this.inputSegment = document.createElement('span');
      this.inputSegment.classList.add('terminal-input-segment');
      this.currentLineContainer.appendChild(this.inputSegment);
      this.displayArea.insertBefore(this.currentLineContainer, this.keyInterceptor);
      this.refreshInputDisplay();
      this.scrollViewportToBottom();
    }

    handleDisplayClick(event) {
      if (window.getSelection().toString()) {
        return;
      }
      this.displayArea.classList.add('terminal-focused');
      this.displayArea.classList.remove('terminal-unfocused');
      setFocusWithoutScroll(this.keyInterceptor);
      this.scrollViewportToBottom();
      event.preventDefault();
    }

    handleBlur() {
      this.displayArea.classList.remove('terminal-focused');
      this.displayArea.classList.add('terminal-unfocused');
    }

    handlePaste(event) {
      this.keyInterceptor.value = '';
      setTimeout(() => {
        this.insertTextAtCaret(this.keyInterceptor.value);
        this.keyInterceptor.value = '';
      }, 0);
    }

    handleKeyDown(event) {
      this.ignoreNextKeyPress = 0;
      const keyCode = event.keyCode;

      if (event.ctrlKey && keyCode === 67) {
        this.ignoreNextKeyPress = keyCode;
        this.terminateExecution();
        event.preventDefault();
        return;
      }

      if (this.acceptingInput) {
        let actionMap = null;
        if (event.shiftKey && this.capitalKeyActions.has(keyCode)) {
          actionMap = this.capitalKeyActions;
        } else if (event.altKey && this.metaKeyActions.has(keyCode)) {
          actionMap = this.metaKeyActions;
        } else if (event.ctrlKey && this.controlKeyActions.has(keyCode)) {
          actionMap = this.controlKeyActions;
        } else if (this.normalKeyActions.has(keyCode)) {
          actionMap = this.normalKeyActions;
        }

        if (actionMap) {
          this.ignoreNextKeyPress = keyCode;
          actionMap.get(keyCode).call(this);
          event.preventDefault();
          return;
        }
      }
    }

    handleKeyPress(event) {
      const charCode = event.charCode || event.which;

      if (this.isIgnorableKey(event)) {
        event.preventDefault();
        return;
      }

      if ((event.ctrlKey || event.metaKey) && String.fromCharCode(charCode).toLowerCase() === 'v') {
        return;
      }

      if (this.acceptingInput && this.ignoreNextKeyPress !== charCode && charCode >= 32) {
        if (this.ignoreNextKeyPress) {
          event.preventDefault();
          return;
        }

        if (!this.characterInsertionTrigger || this.characterInsertionTrigger(charCode, this.activeInputBuffer)) {
          this.insertTextAtCaret(String.fromCharCode(charCode));
        }
        event.preventDefault();
      }

      if (isWebKitEngine) {
        event.preventDefault();
      }
    }

    isIgnorableKey(event) {
      return ((event.keyCode === 9 || event.keyCode === 192) && event.altKey);
    }

    rotateHistory(direction) {
      if (this.commandLog.length === 0) return;

      this.logIndex += direction;
      if (this.logIndex < 0) this.logIndex = this.commandLog.length;
      else if (this.logIndex > this.commandLog.length) this.logIndex = 0;

      if (this.logIndex === 0) {
        this.activeInputBuffer = this.savedInputBuffer;
      } else {
        this.activeInputBuffer = this.commandLog[this.logIndex - 1];
      }

      this.caretPosition = this.activeInputBuffer.length;
      this.refreshInputDisplay();
    }

    recallPreviousCommand() {
      this.rotateHistory(-1);
    }

    recallNextCommand() {
      this.rotateHistory(1);
    }

    addCommandToLog(line) {
      this.commandLog.push(line);
      this.savedInputBuffer = '';
    }

    deleteCharFromBuffer(atCaret = false) {
      if (atCaret && this.caretPosition < this.activeInputBuffer.length) {
        this.activeInputBuffer =
          this.activeInputBuffer.substring(0, this.caretPosition) +
          this.activeInputBuffer.substring(this.caretPosition + 1);
        this.savedInputBuffer = this.activeInputBuffer;
        return true;
      } else if (!atCaret && this.caretPosition > 0) {
        this.activeInputBuffer =
          this.activeInputBuffer.substring(0, this.caretPosition - 1) +
          this.activeInputBuffer.substring(this.caretPosition);
        this.savedInputBuffer = this.activeInputBuffer;
        this.adjustCaretPosition(-1);
        return true;
      }
      return false;
    }

    deleteCharBeforeCaret() {
      if (this.deleteCharFromBuffer(false)) {
        this.refreshInputDisplay();
      }
    }

    deleteCharAtCaret() {
      if (this.deleteCharFromBuffer(true)) {
        this.refreshInputDisplay();
      }
    }

    deleteFromCaretToEnd() {
      while (this.deleteCharFromBuffer(true)) {
        // No need to refresh display in loop, only once at the end
      }
      this.refreshInputDisplay();
    }

    isAlphaNumeric(char) {
      return (char >= 'a' && char <= 'z') ||
        (char >= 'A' && char <= 'Z') ||
        (char >= '0' && char <= '9');
    }

    deleteNextWord() {
      let originalCaretPos = this.caretPosition;
      // Skip non-alphanumeric characters
      while (this.caretPosition < this.activeInputBuffer.length &&
        !this.isAlphaNumeric(this.activeInputBuffer[this.caretPosition])) {
        this.deleteCharFromBuffer(true);
      }
      // Then delete alphanumeric characters
      while (this.caretPosition < this.activeInputBuffer.length &&
        this.isAlphaNumeric(this.activeInputBuffer[this.caretPosition])) {
        this.deleteCharFromBuffer(true);
      }
      this.caretPosition = originalCaretPos; // Caret doesn't move when deleting forward
      this.refreshInputDisplay();
    }

    insertNewline() {
      const lines = this.activeInputBuffer.split("\n");
      const lastLine = lines[lines.length - 1];
      const leadingSpacesMatch = lastLine.match(/^(\s*)/);
      const leadingSpaces = leadingSpacesMatch ? leadingSpacesMatch[1] : '';
      const newSegment = "\n" + leadingSpaces;
      this.insertTextAtCaret(newSegment);
    }

    executeInput() {
      const commandLine = this.activeInputBuffer;
      if (typeof this.inputValidator === 'function') {
        const validationResult = this.inputValidator(commandLine);
        if (validationResult === true) {
          this.processCommand();
        } else if (validationResult === false) {
          // Command invalid, do nothing
        } else {
          this.outputResult(validationResult, "terminal-error-message");
          this.createPromptLine();
        }
      } else {
        this.processCommand();
      }
    }

    processCommand() {
      if (typeof this.inputProcessor === 'function') {
        this.disableInput();
        this.addCommandToLog(this.activeInputBuffer);
        this.outputMessage(this.currentPromptLabel + this.activeInputBuffer, 'terminal-command-echo');
        const commandResult = this.inputProcessor(this.activeInputBuffer, this.outputResult.bind(this));
        if (commandResult && typeof commandResult.then === 'function') {
          commandResult.then(() => {
            this.createPromptLine();
          }).catch(error => {
            this.outputResult('Error: ' + error, 'terminal-error-message');
            this.createPromptLine();
          });
        } else {
          this.createPromptLine();
        }
      } else {
        this.outputMessage(this.currentPromptLabel + this.activeInputBuffer, 'terminal-command-echo');
        this.createPromptLine();
      }
    }

    terminateExecution() {
      this.commandAborted = true;
      if (typeof this.abortHandler === 'function') {
        this.abortHandler();
      }
      this.outputResult('^C', 'terminal-aborted-message');
      this.createPromptLine();
    }

    performCompletion() {
      if (typeof this.completionHandler === 'function') {
        const completions = this.completionHandler(this.activeInputBuffer);
        if (completions && completions.length > 0) {
          if (completions.length === 1) {
            this.activeInputBuffer = completions[0];
            this.caretPosition = this.activeInputBuffer.length;
          } else {
            this.outputMessage(completions.join(' '), 'terminal-completion-list');
          }
          this.refreshInputDisplay();
        }
      }
    }

    adjustCaretPosition(delta) {
      const newPosition = this.caretPosition + delta;
      if (newPosition >= 0 && newPosition <= this.activeInputBuffer.length) {
        this.caretPosition = newPosition;
        return true;
      }
      return false;
    }

    shiftCaretLeft() {
      if (this.adjustCaretPosition(-1)) {
        this.refreshInputDisplay();
      }
    }

    shiftCaretRight() {
      if (this.adjustCaretPosition(1)) {
        this.refreshInputDisplay();
      }
    }

    moveCaretToEnd() {
      this.caretPosition = this.activeInputBuffer.length;
      this.refreshInputDisplay();
    }

    moveCaretToStart() {
      this.caretPosition = 0;
      this.refreshInputDisplay();
    }

    moveCaretToNextWord() {
      let tempPos = this.caretPosition;
      while (tempPos < this.activeInputBuffer.length && !this.isAlphaNumeric(this.activeInputBuffer[tempPos])) {
        tempPos++;
      }
      while (tempPos < this.activeInputBuffer.length && this.isAlphaNumeric(this.activeInputBuffer[tempPos])) {
        tempPos++;
      }
      this.caretPosition = tempPos;
      this.refreshInputDisplay();
    }

    moveCaretToPreviousWord() {
      let tempPos = this.caretPosition - 1;
      while (tempPos >= 0 && !this.isAlphaNumeric(this.activeInputBuffer[tempPos])) {
        tempPos--;
      }
      while (tempPos >= 0 && this.isAlphaNumeric(this.activeInputBuffer[tempPos])) {
        tempPos--;
      }
      this.caretPosition = tempPos + 1;
      this.refreshInputDisplay();
    }

    insertTextAtCaret(text) {
      this.activeInputBuffer =
        this.activeInputBuffer.substring(0, this.caretPosition) +
        text +
        this.activeInputBuffer.substring(this.caretPosition);
      this.adjustCaretPosition(text.length);
      this.savedInputBuffer = this.activeInputBuffer;
      this.refreshInputDisplay();
    }

    refreshInputDisplay() {
      if (!this.inputSegment) return;

      const beforeCaret = this.activeInputBuffer.substring(0, this.caretPosition);
      const atCaret = this.activeInputBuffer.substring(this.caretPosition, this.caretPosition + 1) || '&nbsp;';
      const afterCaret = this.activeInputBuffer.substring(this.caretPosition + 1);

      this.inputSegment.innerHTML =
        this.escapeHtml(beforeCaret) +
        this.cursorElementHtml.replace('&nbsp;', this.escapeHtml(atCaret)) +
        this.escapeHtml(afterCaret);

      this.scrollViewportToBottom();
    }

    escapeHtml(unsafe) {
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/ /g, "&nbsp;");
    }

    scrollViewportToBottom() {
      this.displayArea.scrollTop = this.displayArea.scrollHeight;
    }

    disableInput() {
      this.acceptingInput = false;
      this.keyInterceptor.disabled = true;
      if (this.currentLineContainer) {
        this.currentLineContainer.classList.add('terminal-disabled-prompt');
      }
    }

    enableInput() {
      this.acceptingInput = true;
      this.keyInterceptor.disabled = false;
      if (this.currentLineContainer) {
        this.currentLineContainer.classList.remove('terminal-disabled-prompt');
      }
    }

    get currentInput() {
      return this.activeInputBuffer;
    }

    set promptLabel(newLabel) {
      this.initialPromptLabel = newLabel;
      this.currentPromptLabel = newLabel;
      if (this.currentLineContainer) {
        const labelElem = this.currentLineContainer.querySelector('.terminal-prompt-label');
        if (labelElem) {
          labelElem.textContent = newLabel;
          labelElem.innerHTML = labelElem.innerHTML.replace(/ /g, '&nbsp;');
        }
      }
    }

    get promptLabel() {
      return this.initialPromptLabel;
    }

    set continuedPrompt(isContinued) {
      if (isContinued) {
        this.currentPromptLabel = this.continuedPromptString;
      } else {
        this.currentPromptLabel = this.initialPromptLabel;
      }
      if (this.currentLineContainer) {
        const labelElem = this.currentLineContainer.querySelector('.terminal-prompt-label');
        if (labelElem) {
          labelElem.textContent = this.currentPromptLabel;
          labelElem.innerHTML = labelElem.innerHTML.replace(/ /g, '&nbsp;');
        }
      }
    }
  }

  window.initTerminal = function(selector, config) {
    const element = document.querySelector(selector);
    if (!element) {
      console.error('TerminalEmulator: Element not found for selector:', selector);
      return null;
    }
    return new TerminalEmulator(element, config);
  };

})();