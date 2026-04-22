function obtainTextareaBoundaries(inputElement) {
    if (typeof inputElement.selectionStart === 'number' && typeof inputElement.selectionEnd === 'number') {
        return {
            startOffset: inputElement.selectionStart,
            endOffset: inputElement.selectionEnd
        };
    } else if (document.selection && document.selection.createRange) {
        const currentRange = document.selection.createRange();
        const auxiliaryRange = inputElement.createTextRange();
        const startPoint = auxiliaryRange.duplicate();
        const endPoint = auxiliaryRange.duplicate();

        startPoint.moveToElementText(inputElement);
        endPoint.moveToElementText(inputElement);
        startPoint.setEndPoint('EndToStart', currentRange);
        endPoint.setEndPoint('EndToEnd', currentRange);

        return {
            startOffset: startPoint.text.length,
            endOffset: startPoint.text.length + currentRange.text.length
        };
    }
    return { startOffset: 0, endOffset: 0 };
}

function acquireHighlightedContent(inputElement) {
    if (document.selection && document.selection.createRange) {
        return document.selection.createRange().text;
    } else {
        const fullContent = inputElement.value;
        const { startOffset, endOffset } = obtainTextareaBoundaries(inputElement);
        return fullContent.substring(startOffset, endOffset);
    }
}

function modifyHighlightedContent(inputElement, replacementValue, finalAdjustment) {
    const originalScrollPosition = inputElement.scrollTop;
    inputElement.focus();

    if (document.selection && document.selection.createRange) {
        const activeRange = document.selection.createRange();
        activeRange.text = replacementValue;
        if (finalAdjustment) {
            activeRange.select();
            inputElement.scrollTop = originalScrollPosition;
        }
    } else {
        const initialContent = inputElement.value;
        const { startOffset, endOffset } = obtainTextareaBoundaries(inputElement);

        const updatedContent = initialContent.substring(0, startOffset) + replacementValue + initialContent.substring(endOffset);
        inputElement.value = updatedContent;

        if (!finalAdjustment) {
            inputElement.setSelectionRange(startOffset, startOffset + replacementValue.length);
        } else {
            inputElement.setSelectionRange(startOffset + replacementValue.length, startOffset + replacementValue.length);
            inputElement.scrollTop = originalScrollPosition;
        }
    }
}

class ContentProcessor {
    constructor(fieldIdentifier, toolbarIdentifier, configurationOptions) {
        this.inputField = document.getElementById(fieldIdentifier);
        if (!this.inputField || this.inputField.tagName !== 'TEXTAREA') {
            throw new Error('Input field must be a TEXTAREA element.');
        }

        this.operationalSettings = {
            trackContentModifications: false,
            modificationCheckInterval: 200,
            captureTabKey: true
        };
        Object.assign(this.operationalSettings, configurationOptions);

        this.toolbarContainer = null;
        if (toolbarIdentifier && typeof toolbarIdentifier === 'string') {
            this.toolbarContainer = document.getElementById(toolbarIdentifier);
        }
        if (!this.toolbarContainer) {
            this.toolbarContainer = document.createElement('ul');
            this.inputField.parentNode.insertBefore(this.toolbarContainer, this.inputField);
        }

        this.lastKnownContent = this.inputField.value;
        this.contentPollingHandle = null;

        this.establishInputListeners();
    }

    establishInputListeners() {
        if (this.operationalSettings.trackContentModifications) {
            this.inputField.addEventListener('focus', () => {
                this.contentPollingHandle = setInterval(() => this.monitorContentState(), this.operationalSettings.modificationCheckInterval);
            });

            this.inputField.addEventListener('blur', () => {
                clearInterval(this.contentPollingHandle);
                this.contentPollingHandle = null;
            });
        }

        if (this.operationalSettings.captureTabKey) {
            this.inputField.addEventListener('keydown', (keyboardEvent) => {
                if (keyboardEvent.key === 'Tab') {
                    keyboardEvent.preventDefault();
                    this.substituteSelection('\t');
                }
            });
        }
    }

    monitorContentState() {
        const currentText = this.inputField.value;
        if (this.lastKnownContent !== currentText) {
            this.lastKnownContent = currentText;
            this.inputField.dispatchEvent(new CustomEvent('contentAltered', { detail: { updatedValue: currentText } }));
        }
    }

    fetchSelectedSegment() {
        return acquireHighlightedContent(this.inputField);
    }

    encloseSegment(enclosingPattern, isFinalStep) {
        const isFinal = (isFinalStep === undefined || isFinalStep === null) ? true : isFinalStep;
        const currentSelection = this.fetchSelectedSegment();
        modifyHighlightedContent(this.inputField, enclosingPattern + currentSelection + enclosingPattern, isFinal);
    }

    placeContent(contentToAdd, positionOption, isFinalStep) {
        const isFinal = (isFinalStep === undefined || isFinalStep === null) ? true : isFinalStep;
        const effectivePosition = positionOption || 'after';
        const currentSelection = this.fetchSelectedSegment();
        let resultantText;
        if (effectivePosition === 'before') {
            resultantText = contentToAdd + currentSelection;
        } else {
            resultantText = currentSelection + contentToAdd;
        }
        modifyHighlightedContent(this.inputField, resultantText, isFinal);
    }

    substituteSelection(replacementContent, isFinalStep) {
        const isFinal = (isFinalStep === undefined || isFinalStep === null) ? true : isFinalStep;
        modifyHighlightedContent(this.inputField, replacementContent, isFinal);
    }

    processEachLineInSelection(lineTransformationFunction, isFinalStep) {
        const isFinal = (isFinalStep === undefined || isFinalStep === null) ? true : isFinalStep;
        const selectedText = this.fetchSelectedSegment();
        const allLines = selectedText.split("\n");
        const transformedLines = [];

        allLines.forEach(singleLine => {
            if (singleLine !== "") {
                transformedLines.push(lineTransformationFunction(singleLine));
            } else {
                transformedLines.push("");
            }
        });

        modifyHighlightedContent(this.inputField, transformedLines.join("\n"), isFinal);
    }

    retrieveFullContent() {
        return this.inputField.value;
    }

    assignFullContent(newContent) {
        this.inputField.value = newContent;
        this.inputField.focus();
    }

    attachToolbarAction(actionTitle, actionProcessor, buttonMetadata) {
        if (!this.toolbarContainer) {
            console.warn('No toolbar container available to attach action.');
            return;
        }

        const listItemElement = document.createElement('li');
        const actionButtonLink = document.createElement('a');

        actionButtonLink.href = '#';
        actionButtonLink.textContent = actionTitle;

        if (buttonMetadata) {
            for (const keyProperty in buttonMetadata) {
                if (Object.prototype.hasOwnProperty.call(buttonMetadata, keyProperty)) {
                    actionButtonLink.setAttribute(keyProperty, buttonMetadata[keyProperty]);
                }
            }
        }

        actionButtonLink.addEventListener('click', (eventObject) => {
            eventObject.preventDefault();
            actionProcessor.call(this);
        });

        listItemElement.appendChild(actionButtonLink);
        this.toolbarContainer.appendChild(listItemElement);
    }
}