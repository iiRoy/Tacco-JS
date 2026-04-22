class MarkdownComposer {
    #inputElement;
    #parentElement;
    #activeConfiguration;
    #actionMapping;

    #adjustInputState(startPoint, endPoint, newSegment, newCursorStart, newCursorEnd) {
        const currentContent = this.#inputElement.value;
        this.#inputElement.value = currentContent.substring(0, startPoint) + newSegment + currentContent.substring(endPoint);
        this.#inputElement.selectionStart = newCursorStart;
        this.#inputElement.selectionEnd = newCursorEnd;
    }

    constructor(targetNode, configuration = {}) {
        if (!(targetNode instanceof HTMLTextAreaElement)) {
            throw new Error("Target node must be an HTMLTextAreaElement.");
        }

        this.#inputElement = targetNode;
        this.#parentElement = targetNode.parentNode;

        const defaultSettings = {
            indentationCharacters: '\t',
            lineDelimiter: '\n'
        };
        this.#activeConfiguration = { ...defaultSettings, ...configuration };

        this.#initializeActionMapping();
        this.#setupEventHandlers();
    }

    #initializeActionMapping() {
        this.#actionMapping = new Map([
            ['bold', () => this.surroundSelection('**', '**')],
            ['italic', () => this.surroundSelection('*', '*')],
            ['strike', () => this.surroundSelection('~~', '~~')],
            ['code', () => this.surroundSelection('`', '`')],
            ['link', () => this.applyLinkFormat()],
            ['img', () => this.applyImageFormat()],
            ['list', () => this.applyListFormat()],
            ['quote', () => this.applyQuoteFormat()],
            ['h1', () => this.surroundSelection('# ', '')],
            ['h2', () => this.surroundSelection('## ', '')],
            ['h3', () => this.surroundSelection('### ', '')],
            ['h4', () => this.surroundSelection('#### ', '')],
            ['h5', () => this.surroundSelection('##### ', '')],
            ['h6', () => this.surroundSelection('###### ', '')]
        ]);
    }

    #setupEventHandlers() {
        this.#inputElement.addEventListener('keydown', this.#handleKeyboardInput.bind(this));
        this.#parentElement.addEventListener('click', this.#handleControlClick.bind(this));
    }

    #handleKeyboardInput(eventObject) {
        if (eventObject.key === 'Tab') {
            eventObject.preventDefault();
            eventObject.stopPropagation();

            if (eventObject.shiftKey) {
                this.removeIndentation();
            } else {
                this.applyIndentation();
            }
        }
    }

    #handleControlClick(eventObject) {
        const triggeredLink = eventObject.target;
        if (triggeredLink.tagName === 'A' && triggeredLink.closest('nav')) {
            const actionKey = triggeredLink.getAttribute('href').split('#').pop();
            const actionFunction = this.#actionMapping.get(actionKey);

            if (actionFunction) {
                actionFunction();
                eventObject.preventDefault();
            }
        }
    }

    insertContentAtCursor(contentSegment) {
        const startOffset = this.#inputElement.selectionStart;
        const endOffset = this.#inputElement.selectionEnd;
        this.#adjustInputState(startOffset, endOffset, contentSegment, startOffset + contentSegment.length, startOffset + contentSegment.length);
    }

    surroundSelection(prefixString, suffixString) {
        const startOffset = this.#inputElement.selectionStart;
        const endOffset = this.#inputElement.selectionEnd;
        const textValue = this.#inputElement.value;
        const selectedFragment = textValue.substring(startOffset, endOffset);

        const generatedMarkup = prefixString + selectedFragment + suffixString;
        this.#adjustInputState(startOffset, endOffset, generatedMarkup, startOffset + generatedMarkup.length, startOffset + generatedMarkup.length);
    }

    applyIndentation() {
        const startOffset = this.#inputElement.selectionStart;
        const endOffset = this.#inputElement.selectionEnd;
        const textValue = this.#inputElement.value;
        const tabChar = this.#activeConfiguration.indentationCharacters;
        const lineDelimiter = this.#activeConfiguration.lineDelimiter;

        if (startOffset === endOffset) {
            this.insertContentAtCursor(tabChar);
        } else {
            const selectedFragment = textValue.substring(startOffset, endOffset);
            const lineSegments = selectedFragment.split(lineDelimiter);
            const indentedSegments = lineSegments.map(segment => tabChar + segment);
            const newSegment = indentedSegments.join(lineDelimiter);

            this.#adjustInputState(startOffset, endOffset, newSegment, startOffset, endOffset + (indentedSegments.length * tabChar.length));
        }
    }

    removeIndentation() {
        let startOffset = this.#inputElement.selectionStart;
        let endOffset = this.#inputElement.selectionEnd;
        const textValue = this.#inputElement.value;
        const tabChar = this.#activeConfiguration.indentationCharacters;
        const lineDelimiter = this.#activeConfiguration.lineDelimiter;
        const indentPattern = new RegExp(`^${tabChar}`);
        let modifiedLineCount = 0;

        if (startOffset === endOffset) {
            let lineStart = textValue.lastIndexOf(lineDelimiter, startOffset - 1) + 1;
            let lineEnd = textValue.indexOf(lineDelimiter, startOffset);
            if (lineEnd === -1) lineEnd = textValue.length;

            const lineContext = textValue.substring(lineStart, lineEnd);
            if (indentPattern.test(lineContext)) {
                const newLineContent = lineContext.replace(indentPattern, '');
                this.#adjustInputState(lineStart, lineEnd, newLineContent, startOffset - tabChar.length, startOffset - tabChar.length);
            }
        } else {
            const selectedFragment = textValue.substring(startOffset, endOffset);
            const lineSegments = selectedFragment.split(lineDelimiter);
            const dedentedSegments = lineSegments.map(segment => {
                if (indentPattern.test(segment)) {
                    modifiedLineCount++;
                    return segment.replace(indentPattern, '');
                }
                return segment;
            });
            const newSegment = dedentedSegments.join(lineDelimiter);

            this.#adjustInputState(startOffset, endOffset, newSegment, startOffset, endOffset - (modifiedLineCount * tabChar.length));
        }
    }

    applyLinkFormat() {
        const startOffset = this.#inputElement.selectionStart;
        const endOffset = this.#inputElement.selectionEnd;
        const textValue = this.#inputElement.value;
        const selectedFragment = textValue.substring(startOffset, endOffset);
        const generatedMarkup = '[' + selectedFragment + '](' + selectedFragment + ')';
        this.#adjustInputState(startOffset, endOffset, generatedMarkup, endOffset + generatedMarkup.length, endOffset + generatedMarkup.length);
    }

    applyImageFormat() {
        const startOffset = this.#inputElement.selectionStart;
        const endOffset = this.#inputElement.selectionEnd;
        const textValue = this.#inputElement.value;
        const selectedFragment = textValue.substring(startOffset, endOffset);
        const generatedMarkup = '![' + selectedFragment + '](' + selectedFragment + ')';
        this.#adjustInputState(startOffset, endOffset, generatedMarkup, endOffset + generatedMarkup.length, endOffset + generatedMarkup.length);
    }

    applyListFormat() {
        const startOffset = this.#inputElement.selectionStart;
        const endOffset = this.#inputElement.selectionEnd;
        const textValue = this.#inputElement.value;
        const lineDelimiter = this.#activeConfiguration.lineDelimiter;
        const lineSegments = textValue.substring(startOffset, endOffset).split(lineDelimiter);
        const bulletedSegments = lineSegments.map(segment => '* ' + segment);
        const newSegment = lineDelimiter + bulletedSegments.join(lineDelimiter) + lineDelimiter;
        this.#adjustInputState(startOffset, endOffset, newSegment, startOffset, startOffset + newSegment.length);
    }

    applyQuoteFormat() {
        const startOffset = this.#inputElement.selectionStart;
        const endOffset = this.#inputElement.selectionEnd;
        const textValue = this.#inputElement.value;
        const lineDelimiter = this.#activeConfiguration.lineDelimiter;
        const lineSegments = textValue.substring(startOffset, endOffset).split(lineDelimiter);
        const quotedSegments = lineSegments.map(segment => '> ' + segment);
        const newSegment = quotedSegments.join(lineDelimiter);
        this.#adjustInputState(startOffset, endOffset, newSegment, startOffset, startOffset + newSegment.length);
    }
}