class TextMarkupAssistant {
    constructor(targetElement) {
        if (!(targetElement instanceof HTMLTextAreaElement)) {
            throw new Error("Provided element must be a textarea HTML element.");
        }
        this.inputArea = targetElement;
        this.resourceCounter = 0;
        this.controlPanel = null;

        this.markupDefinitions = new Map([
            ['strong', { prefix: '**', suffix: '**', defaultContent: 'Emphasized text' }],
            ['emphasis', { prefix: '*', suffix: '*', defaultContent: 'Italicized text' }],
            ['hyperlink', { prefix: '[', suffix: '][#]', defaultContent: 'Link description' }],
            ['picture', { prefix: '![', suffix: '][#]', defaultContent: 'Image description' }],
            ['blockQuote', { prefix: '', suffix: '', defaultContent: '\n> Quoted content\n' }],
            ['codeBlock', { prefix: '', suffix: '', defaultContent: '\n    Code goes here\n' }],
            ['inlineCode', { prefix: '`', suffix: '`', defaultContent: 'Inline code' }],
        ]);

        this.setupUserInterface();
        this.attachEventListeners();
    }

    static resolveNewlineAdjustedOffset(textContainer, nominalOffset) {
        const fullContent = textContainer.value;
        let finalPosition = nominalOffset;
        if (fullContent.includes('\r\n')) {
            const normalizedContent = fullContent.replace(/\r\n/g, '\n');
            const leadingSegment = normalizedContent.substring(0, nominalOffset);
            const newlineMatches = leadingSegment.match(/\n/g);
            if (newlineMatches) {
                finalPosition += newlineMatches.length;
            }
        }
        return finalPosition;
    }

    static setSelectionBounds(targetInput, startingPoint, endingPoint) {
        targetInput.focus();
        if (targetInput.setSelectionRange) {
            const adjustedStart = TextMarkupAssistant.resolveNewlineAdjustedOffset(targetInput, startingPoint);
            const adjustedEnd = TextMarkupAssistant.resolveNewlineAdjustedOffset(targetInput, endingPoint);
            targetInput.setSelectionRange(adjustedStart, adjustedEnd);
        } else if (targetInput.createTextRange) {
            const textRange = targetInput.createTextRange();
            textRange.collapse(true);
            textRange.moveEnd('character', endingPoint);
            textRange.moveStart('character', startingPoint);
            textRange.select();
        }
    }

    static applyLineIndentation(targetInput, linePrefix, repetitionCount) {
        const fullText = targetInput.value;
        let cursorStart = targetInput.selectionStart;
        let cursorEnd = targetInput.selectionEnd;

        let sectionBeginning = fullText.lastIndexOf('\n', cursorStart - 1) + 1;
        if (sectionBeginning === 0 && cursorStart > 0) {
            sectionBeginning = 0;
        }

        let sectionEnding = fullText.indexOf('\n', cursorEnd);
        if (sectionEnding === -1) {
            sectionEnding = fullText.length;
        }

        let targetSection = fullText.substring(sectionBeginning, sectionEnding);

        if (targetSection.endsWith('\n')) {
            targetSection = targetSection.slice(0, -1);
            sectionEnding--;
        }

        const individualLines = targetSection.split('\n');
        const indentationSequence = Array(repetitionCount + 1).join(linePrefix);
        const processedLines = individualLines.map(line => indentationSequence + line);
        const modifiedSection = processedLines.join('\n');

        targetInput.value = fullText.substring(0, sectionBeginning) + modifiedSection + fullText.substring(sectionEnding);
    }

    setupUserInterface() {
        this.controlPanel = document.createElement('div');
        this.controlPanel.className = 'markup-control-bar';

        const buttonConfigurations = [
            { caption: 'Bold', cssClass: 'btn-strong', keyboardKey: 'b', type: 'strong' },
            { caption: 'Italic', cssClass: 'btn-emphasis', keyboardKey: 'i', type: 'emphasis' },
            { caption: 'Link', cssClass: 'btn-hyperlink', keyboardKey: 'a', type: 'hyperlink' },
            { caption: 'Image', cssClass: 'btn-picture', keyboardKey: 'm', type: 'picture' },
            { caption: 'Quote', cssClass: 'btn-blockQuote', keyboardKey: 'q', type: 'blockQuote' },
            { caption: 'Code', cssClass: 'btn-inlineCode', keyboardKey: 'c', type: 'inlineCode' },
        ];

        buttonConfigurations.forEach(config => {
            const commandButton = document.createElement('button');
            commandButton.textContent = config.caption;
            commandButton.className = config.cssClass;
            commandButton.setAttribute('data-markup-action', config.type);
            commandButton.setAttribute('accesskey', config.keyboardKey);
            this.controlPanel.appendChild(commandButton);
        });

        this.inputArea.parentNode.insertBefore(this.controlPanel, this.inputArea);
    }

    attachEventListeners() {
        this.inputArea.addEventListener('keydown', this.handleKeyInteraction.bind(this));
        this.controlPanel.addEventListener('click', this.handleButtonActivation.bind(this));
    }

    handleKeyInteraction(event) {
        if (event.altKey) {
            const pressedCharacter = String.fromCharCode(event.keyCode || event.which).toLowerCase();
            const matchingButton = this.controlPanel.querySelector(`[accesskey="${pressedCharacter}"]`);
            if (matchingButton) {
                event.preventDefault();
                matchingButton.click();
            }
        }
    }

    handleButtonActivation(event) {
        const clickedButton = event.target.closest('button[data-markup-action]');
        if (!clickedButton) return;

        event.preventDefault();
        this.inputArea.focus();

        const markupInstruction = clickedButton.getAttribute('data-markup-action');
        this.performMarkupOperation(markupInstruction);
    }

    performMarkupOperation(markupKey) {
        let activeMarkup = markupKey;
        const currentSelectionStart = this.inputArea.selectionStart;
        const currentSelectionEnd = this.inputArea.selectionEnd;
        const textContent = this.inputArea.value;
        const selectedSegment = textContent.substring(currentSelectionStart, currentSelectionEnd);

        if (activeMarkup === 'inlineCode') {
            const containsNewline = selectedSegment.includes('\n');
            const documentIsEmpty = textContent.length === 0;
            const adjacentCharacters = textContent.charAt(currentSelectionStart - 1) + textContent.charAt(currentSelectionEnd);
            const noSurroundingContent = adjacentCharacters.trim().length === 0;

            if (containsNewline || documentIsEmpty || noSurroundingContent) {
                activeMarkup = 'codeBlock';
            }
        }

        const markup = this.markupDefinitions.get(activeMarkup);
        if (!markup) return;

        let { prefix, suffix, defaultContent } = markup;
        const trimmedDefault = defaultContent.trim();
        const leadingWhitespace = defaultContent.indexOf(trimmedDefault);

        let effectiveTrimmedDefault = trimmedDefault;
        let effectiveLeadingWhitespace = leadingWhitespace;
        if (activeMarkup === 'blockQuote') {
            effectiveTrimmedDefault = trimmedDefault.substring(2);
            effectiveLeadingWhitespace += 2;
        }

        if (selectedSegment === effectiveTrimmedDefault) {
            return;
        }

        if (activeMarkup === 'hyperlink' || activeMarkup === 'picture') {
            const promptMessage = (activeMarkup === 'hyperlink') ? 'Please enter the URL:' : 'Please enter the image URL:';
            const userProvidedUrl = window.prompt(promptMessage, 'http://');

            if (userProvidedUrl) {
                this.resourceCounter++;
                suffix = suffix.replace('#', this.resourceCounter);
                this.inputArea.value += `\n\n  [${this.resourceCounter}]: ${userProvidedUrl}`;
            } else {
                return;
            }
        }

        if (currentSelectionStart === currentSelectionEnd) {
            const newContent = textContent.substring(0, currentSelectionEnd) +
                               prefix + defaultContent + suffix +
                               textContent.substring(currentSelectionEnd);
            this.inputArea.value = newContent;

            const caretPosition = currentSelectionEnd + prefix.length + effectiveLeadingWhitespace;
            TextMarkupAssistant.setSelectionBounds(this.inputArea, caretPosition, caretPosition + effectiveTrimmedDefault.length);

        } else {
            switch (activeMarkup) {
                case 'codeBlock':
                    TextMarkupAssistant.applyLineIndentation(this.inputArea, ' ', 4);
                    break;
                case 'blockQuote':
                    TextMarkupAssistant.applyLineIndentation(this.inputArea, '> ', 1);
                    break;
                default:
                    const updatedContent = textContent.substring(0, currentSelectionStart) +
                                           prefix + selectedSegment + suffix +
                                           textContent.substring(currentSelectionEnd);
                    this.inputArea.value = updatedContent;
                    TextMarkupAssistant.setSelectionBounds(this.inputArea, currentSelectionStart + prefix.length, currentSelectionEnd + prefix.length);
                    break;
            }
        }
    }
}

function initializeTextareaEnhancer(targetItems) {
    let elementsToConfigure = [];

    if (typeof targetItems === 'string') {
        elementsToConfigure = Array.from(document.querySelectorAll(targetItems));
    } else if (targetItems instanceof HTMLTextAreaElement) {
        elementsToConfigure = [targetItems];
    } else if (Array.isArray(targetItems) || (typeof NodeList !== 'undefined' && targetItems instanceof NodeList)) {
        elementsToConfigure = Array.from(targetItems);
    } else {
        console.warn('Invalid input provided for initializeTextareaEnhancer. Expected a CSS selector string, a single textarea element, or a collection of elements.');
        return;
    }

    elementsToConfigure.forEach(element => {
        if (element instanceof HTMLTextAreaElement) {
            new TextMarkupAssistant(element);
        } else {
            console.warn('Skipping non-textarea element:', element);
        }
    });
}