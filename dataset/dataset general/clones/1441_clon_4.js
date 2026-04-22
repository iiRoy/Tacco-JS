class TerminalEmulator {
    #outputContainer;
    #hiddenInput;
    #currentLineElement;
    #labelSpan;
    #textSpan;
    #inputCache = '';
    #cursorIndex = 0;
    #commandTrail = [];
    #trailPointer = 0;
    #allowInput = true;
    #ignoreKeyPress = 0;
    #config;
    #continuedCommand = '';
    #lastKnownInput = '';

    static #primaryKeyActions = {
        37: 'traverseLeft',
        39: 'traverseRight',
        38: 'recallUp',
        40: 'recallDown',
        8:  'eraseBack',
        46: 'eraseForward',
        35: 'shiftToEnd',
        36: 'shiftToStart',
        13: 'executeEntry',
        18: 'skipAction',
        9:  'attemptCompletion'
    };

    static #ctrlKeyActions = {
        65: 'shiftToStart',
        69: 'shiftToEnd',
        68: 'eraseForward',
        78: 'recallDown',
        80: 'recallUp',
        66: 'traverseLeft',
        70: 'traverseRight',
        75: 'eraseToEnd'
    };

    static #altKeyActions = {
        70: 'shiftToNextWord',
        66: 'shiftToPrevWord',
        68: 'eraseNextWord'
    };

    constructor(targetElement, settings = {}) {
        if (!(targetElement instanceof HTMLElement)) {
            throw new Error('Target element must be a valid DOM element.');
        }
        this.#config = {
            initialMessage: null,
            inputLabel: '> ',
            multiLineLabel: '> ',
            autoFocus: false,
            historyPreservesCaret: false,
            onCommandValidate: null,
            onCommandExecute: null,
            onCancelRequest: null,
            onCharacterInsert: null,
            ...settings
        };

        this.#outputContainer = document.createElement('div');
        this.#outputContainer.className = 'console-output-area';

        this.#hiddenInput = document.createElement('textarea');
        this.#hiddenInput.className = 'console-input-capture';
        this.#hiddenInput.style.position = 'absolute';
        this.#hiddenInput.style.top = '0';
        this.#hiddenInput.style.left = '-9999px';
        this.#hiddenInput.setAttribute('aria-hidden', 'true');

        this.#outputContainer.appendChild(this.#hiddenInput);
        targetElement.appendChild(this.#outputContainer);

        this.#bindEvents();
        this.#setupInitialState();
    }

    #bindEvents() {
        this.#hiddenInput.addEventListener('keydown', this.#handleKeyDown.bind(this));
        this.#hiddenInput.addEventListener('keypress', this.#handleKeyPress.bind(this));
        this.#hiddenInput.addEventListener('paste', this.#handlePaste.bind(this));
        this.#outputContainer.addEventListener('click', this.#focusInput.bind(this));
        this.#hiddenInput.addEventListener('blur', this.#releaseFocus.bind(this));
    }

    #setupInitialState() {
        if (this.#config.initialMessage) {
            this.#displayOutput(this.#config.initialMessage, 'console-welcome-message');
        }
        this.#generatePromptLine();
        if (this.#config.autoFocus) {
            this.#focusInput();
            setTimeout(() => this.#focusInput(), 100);
        }
        this.#scrollOutputToEnd();
    }

    resetState() {
        this.#outputContainer.querySelectorAll('.console-output-line, .console-prompt-container').forEach(node => {
            if (!node.classList.contains('console-welcome-message')) {
                node.remove();
            }
        });
        this.#inputCache = '';
        this.#cursorIndex = 0;
        this.#commandTrail = [];
        this.#trailPointer = 0;
        this.#allowInput = true;
        this.#ignoreKeyPress = 0;
        this.#continuedCommand = '';
        this.#lastKnownInput = '';
        this.#generatePromptLine();
        this.#focusInput();
        this.#scrollOutputToEnd();
    }

    displayNotification(message, type = 'fadeout') {
        const notificationDiv = document.createElement('div');
        notificationDiv.className = 'console-notification';
        const contentDiv = document.createElement('div');
        contentDiv.textContent = message;
        notificationDiv.appendChild(contentDiv);
        notificationDiv.style.visibility = 'hidden';
        this.#outputContainer.appendChild(notificationDiv);

        const initialHeight = notificationDiv.offsetHeight;
        notificationDiv.style.height = '0px';
        notificationDiv.style.visibility = 'visible';
        notificationDiv.style.transition = 'height 0.3s ease-out';
        notificationDiv.style.height = `${initialHeight}px`;

        if (type === 'fadeout') {
            setTimeout(() => {
                notificationDiv.style.transition = 'opacity 0.5s ease-out';
                notificationDiv.style.opacity = '0';
                notificationDiv.addEventListener('transitionend', () => notificationDiv.remove());
            }, 4000);
        } else if (type === 'prompt') {
            const actionDiv = document.createElement('div');
            actionDiv.className = 'console-notification-action';
            const okButton = document.createElement('a');
            okButton.href = 'javascript:void(0)';
            okButton.textContent = 'OK';
            actionDiv.appendChild(okButton);
            notificationDiv.appendChild(actionDiv);

            this.#releaseFocus(true);
            this.#outputContainer.style.opacity = '0.5';

            okButton.addEventListener('click', () => {
                notificationDiv.style.transition = 'opacity 0.5s ease-out';
                notificationDiv.style.opacity = '0';
                notificationDiv.addEventListener('transitionend', () => notificationDiv.remove());
                this.#outputContainer.style.opacity = '1';
                this.#focusInput();
            });
        }
        notificationDiv.style.cursor = 'default';
        return notificationDiv;
    }

    getOutputElement() {
        return this.#outputContainer;
    }

    getInputElement() {
        return this.#hiddenInput;
    }

    scrollOutput() {
        this.#scrollOutputToEnd();
    }

    #generatePromptLine() {
        this.#cursorIndex = 0;
        this.#inputCache = '';
        this.#trailPointer = 0;
        this.#enableInput();

        this.#currentLineElement = document.createElement('div');
        this.#currentLineElement.className = 'console-prompt-container';

        this.#labelSpan = document.createElement('span');
        this.#labelSpan.className = 'console-prompt-prefix';
        const currentLabel = this.#continuedCommand ? this.#config.multiLineLabel : this.#config.inputLabel;
        this.#labelSpan.textContent = currentLabel;
        this.#labelSpan.innerHTML = this.#labelSpan.innerHTML.replace(' ', '&nbsp;');

        this.#textSpan = document.createElement('span');
        this.#textSpan.className = 'console-current-input';

        this.#currentLineElement.appendChild(this.#labelSpan);
        this.#currentLineElement.appendChild(this.#textSpan);
        this.#outputContainer.appendChild(this.#currentLineElement);
        this.#updateInputDisplay();
    }

    #updateInputDisplay() {
        let displayContent = this.#inputCache;
        if (this.#cursorIndex < this.#inputCache.length) {
            displayContent =
                this.#inputCache.substring(0, this.#cursorIndex) +
                '<span class="console-cursor">&nbsp;</span>' +
                this.#inputCache.substring(this.#cursorIndex);
        } else {
            displayContent += '<span class="console-cursor">&nbsp;</span>';
        }
        this.#textSpan.innerHTML = displayContent;
        this.#scrollOutputToEnd();
    }

    #scrollOutputToEnd() {
        this.#outputContainer.scrollTop = this.#outputContainer.scrollHeight;
    }

    #focusInput() {
        this.#outputContainer.classList.add('console-focused');
        this.#outputContainer.classList.remove('console-unfocused');
        this.#hiddenInput.focus();
        this.#scrollOutputToEnd();
    }

    #releaseFocus(suppressClass = false) {
        if (!suppressClass) {
            this.#outputContainer.classList.remove('console-focused');
            this.#outputContainer.classList.add('console-unfocused');
        }
    }

    #displayOutput(content, extraClass = '') {
        const outputLine = document.createElement('div');
        outputLine.className = 'console-output-line';
        if (extraClass) {
            outputLine.classList.add(extraClass);
        }
        if (typeof content === 'string') {
            outputLine.textContent = content;
            this.#outputContainer.insertBefore(outputLine, this.#currentLineElement);
        } else if (Array.isArray(content)) {
            content.forEach(item => {
                const itemLine = document.createElement('div');
                itemLine.className = 'console-output-line';
                if (extraClass) {
                    itemLine.classList.add(extraClass);
                }
                itemLine.textContent = item;
                this.#outputContainer.insertBefore(itemLine, this.#currentLineElement);
            });
        }
        this.#scrollOutputToEnd();
    }

    #handleKeyDown(event) {
        this.#ignoreKeyPress = 0;
        const key = event.keyCode;

        if (event.ctrlKey && key === 67) {
            this.#ignoreKeyPress = key;
            this.#cancelCurrentAction();
            event.preventDefault();
            return;
        }

        if (this.#allowInput) {
            let actionName;
            if (key in TerminalEmulator.#primaryKeyActions) {
                actionName = TerminalEmulator.#primaryKeyActions[key];
            } else if (event.ctrlKey && key in TerminalEmulator.#ctrlKeyActions) {
                actionName = TerminalEmulator.#ctrlKeyActions[key];
            } else if (event.altKey && key in TerminalEmulator.#altKeyActions) {
                actionName = TerminalEmulator.#altKeyActions[key];
            }

            if (actionName) {
                this[actionName]();
                this.#ignoreKeyPress = key;
                event.preventDefault();
            }
        }
    }

    #handleKeyPress(event) {
        const key = event.keyCode || event.which;

        if (this.#isKeyIgnorable(event)) {
            event.preventDefault();
            return;
        }

        if ((event.ctrlKey || event.metaKey) && String.fromCharCode(key).toLowerCase() === 'v') {
            return;
        }

        if (this.#allowInput && this.#ignoreKeyPress !== key && key >= 32) {
            if (this.#ignoreKeyPress) {
                event.preventDefault();
                return;
            }

            let proceedWithInsert = true;
            if (typeof this.#config.onCharacterInsert === 'function') {
                proceedWithInsert = this.#config.onCharacterInsert(key, this.#inputCache);
            }

            if (proceedWithInsert) {
                this.#insertCharacter(String.fromCharCode(key));
                event.preventDefault();
            }
        }
    }

    #handlePaste(event) {
        this.#hiddenInput.value = "";
        setTimeout(() => {
            const pastedText = this.#hiddenInput.value;
            this.#insertText(pastedText);
            this.#hiddenInput.value = "";
        }, 0);
    }

    #isKeyIgnorable(event) {
        return ((event.keyCode === 9 || event.keyCode === 192) && event.altKey);
    }

    executeEntry() {
        const finalInput = this.#inputCache;
        if (typeof this.#config.onCommandValidate === 'function') {
            const validationResult = this.#config.onCommandValidate(finalInput);
            if (validationResult === true) {
                this.#initiateCommandExecution();
            } else if (validationResult === false) {
                // Do nothing
            } else {
                this.#applyCommandResult(validationResult, 'console-message-error');
            }
        } else {
            this.#initiateCommandExecution();
        }
    }

    #initiateCommandExecution() {
        if (typeof this.#config.onCommandExecute === 'function') {
            this.#disableInput();
            this.#addToHistory(this.#inputCache);

            let effectiveCommand = this.#inputCache;
            let wasContinuationActive = !!this.#continuedCommand;

            if (this.#continuedCommand) {
                this.#continuedCommand += '\n' + this.#inputCache;
                effectiveCommand = this.#continuedCommand;
            }

            const commandCallback = (messages) => {
                this.#applyCommandResult(messages);
            };

            const executionResult = this.#config.onCommandExecute(effectiveCommand, commandCallback);

            if (typeof executionResult === 'boolean') {
                if (executionResult) {
                    this.#applyCommandResult();
                } else {
                    this.#applyCommandResult('Command failed.', 'console-message-error');
                }
            } else if (typeof executionResult === 'string') {
                this.#applyCommandResult(executionResult, 'console-message-success');
            } else if (Array.isArray(executionResult)) {
                this.#applyCommandResult(executionResult);
            } else if (wasContinuationActive) {
                // If handler returned nothing, but continuation was active, keep it active.
                this.#applyCommandResult();
            } else {
                // If handler returned nothing and no continuation was active, clear continuation.
                this.#continuedCommand = '';
                this.#applyCommandResult();
            }
        }
    }

    #applyCommandResult(messageContent, styleClass) {
        this.#cursorIndex = -1;
        this.#updateInputDisplay();
        this.#currentLineElement.classList.add('console-previous-prompt');

        if (messageContent) {
            this.#displayOutput(messageContent, styleClass);
        }
        
        this.#generatePromptLine();
        this.#scrollOutputToEnd();
    }

    #cancelCurrentAction() {
        if (typeof this.#config.onCancelRequest === 'function') {
            this.#config.onCancelRequest();
        }
        this.#inputCache = '';
        this.#cursorIndex = 0;
        this.#updateInputDisplay();
        this.#scrollOutputToEnd();
    }

    #disableInput() {
        this.#allowInput = false;
    }

    #enableInput() {
        this.#allowInput = true;
    }

    #insertCharacter(char) {
        this.#inputCache =
            this.#inputCache.substring(0, this.#cursorIndex) +
            char +
            this.#inputCache.substring(this.#cursorIndex);
        this.#cursorIndex++;
        this.#lastKnownInput = this.#inputCache;
        this.#updateInputDisplay();
    }

    #insertText(text) {
        this.#inputCache =
            this.#inputCache.substring(0, this.#cursorIndex) +
            text +
            this.#inputCache.substring(this.#cursorIndex);
        this.#cursorIndex += text.length;
        this.#lastKnownInput = this.#inputCache;
        this.#updateInputDisplay();
    }

    traverseLeft() {
        if (this.#cursorIndex > 0) {
            this.#cursorIndex--;
            this.#updateInputDisplay();
            return true;
        }
        return false;
    }

    traverseRight() {
        if (this.#cursorIndex < this.#inputCache.length) {
            this.#cursorIndex++;
            this.#updateInputDisplay();
            return true;
        }
        return false;
    }

    #removeChar() {
        if (this.#cursorIndex < this.#inputCache.length) {
            this.#inputCache =
                this.#inputCache.substring(0, this.#cursorIndex) +
                this.#inputCache.substring(this.#cursorIndex + 1);
            this.#lastKnownInput = this.#inputCache;
            return true;
        }
        return false;
    }

    eraseBack() {
        if (this.traverseLeft()) {
            this.#removeChar();
            this.#updateInputDisplay();
        }
    }

    eraseForward() {
        if (this.#removeChar()) {
            this.#updateInputDisplay();
        }
    }

    eraseToEnd() {
        while (this.#removeChar()) {
            // Loop until no more chars can be removed
        }
        this.#updateInputDisplay();
    }

    shiftToEnd() {
        this.#cursorIndex = this.#inputCache.length;
        this.#updateInputDisplay();
    }

    shiftToStart() {
        this.#cursorIndex = 0;
        this.#updateInputDisplay();
    }

    #isAlphanumeric(char) {
        return /[a-zA-Z0-9]/.test(char);
    }

    shiftToNextWord() {
        let originalCursor = this.#cursorIndex;
        while (this.#cursorIndex < this.#inputCache.length && !this.#isAlphanumeric(this.#inputCache[this.#cursorIndex])) {
            this.#cursorIndex++;
        }
        while (this.#cursorIndex < this.#inputCache.length && this.#isAlphanumeric(this.#inputCache[this.#cursorIndex])) {
            this.#cursorIndex++;
        }
        if (this.#cursorIndex !== originalCursor) {
            this.#updateInputDisplay();
        }
    }

    shiftToPrevWord() {
        let originalCursor = this.#cursorIndex;
        while (this.#cursorIndex > 0 && !this.#isAlphanumeric(this.#inputCache[this.#cursorIndex - 1])) {
            this.#cursorIndex--;
        }
        while (this.#cursorIndex > 0 && this.#isAlphanumeric(this.#inputCache[this.#cursorIndex - 1])) {
            this.#cursorIndex--;
        }
        if (this.#cursorIndex !== originalCursor) {
            this.#updateInputDisplay();
        }
    }

    eraseNextWord() {
        while (this.#cursorIndex < this.#inputCache.length && !this.#isAlphanumeric(this.#inputCache[this.#cursorIndex])) {
            this.#removeChar();
        }
        while (this.#cursorIndex < this.#inputCache.length && this.#isAlphanumeric(this.#inputCache[this.#cursorIndex])) {
            this.#removeChar();
        }
        this.#updateInputDisplay();
    }

    #adjustHistory(delta) {
        if (this.#commandTrail.length === 0) return;

        this.#trailPointer += delta;
        if (this.#trailPointer < 0) {
            this.#trailPointer = this.#commandTrail.length;
        } else if (this.#trailPointer > this.#commandTrail.length) {
            this.#trailPointer = 0;
        }

        const previousInput = this.#inputCache;
        if (this.#trailPointer === 0) {
            this.#inputCache = this.#lastKnownInput;
        } else {
            this.#inputCache = this.#commandTrail[this.#trailPointer - 1];
        }

        if (this.#config.historyPreservesCaret) {
            if (this.#inputCache.length < this.#cursorIndex + 1) {
                this.#cursorIndex = this.#inputCache.length;
            } else if (this.#cursorIndex === 0 && previousInput.length > 0) {
                this.#cursorIndex = this.#inputCache.length;
            }
        } else {
            this.#cursorIndex = this.#inputCache.length;
        }
        this.#updateInputDisplay();
    }

    recallPreviousCommand() {
        this.#adjustHistory(-1);
    }

    recallDown() {
        this.#adjustHistory(1);
    }

    #addToHistory(commandLine) {
        if (commandLine.trim().length > 0) {
            this.#commandTrail.push(commandLine);
            this.#lastKnownInput = '';
        }
    }

    skipAction() {
        // Does nothing, as in original.
    }

    attemptCompletion() {
        // Original's `doComplete` not provided, so this remains a no-op.
    }
}