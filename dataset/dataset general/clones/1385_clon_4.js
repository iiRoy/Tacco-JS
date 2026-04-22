const activeElementProcessors = new WeakMap();

const visualCueImage = "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAQAAADZc7J/AAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAAAEgAAABIAEbJaz4AAAKZSURBVEjH7ZRfSFNRHMe/9+/+3G26tUn+ycywgURgUBAUJlIhWlEQEjN8yQcfolKJxJAefOjRCnT0IPYQ9iRa9FAYJiaUVP4twf7gzJzpnDbdzHt3z+3Fua3dO4Ne/f5ezjmc8+F7zvmeA2zrv0VFGlexAssFw1mG1pqqUL8npGY60Bw3ykYaOVjlrFXmEyw0AQj6g53UONQBO8DBzuiT2tUx+gR/mwACBQpIUoACBZoAZaOSiWwFIFs4oMMS9/boZVF8T8vtkbEofatiRKF9mXK6M7tTyyxRaPwWtJezIu9+9cNzxHk/n9938rz6IWpvgRdZd5/HcsvC9jadqk6Z0qkBiCaAF3UtX8cy6h1mwlnLhsuZuRvqABlyNJqb0q0ZWsb7uUVHlXAahWl1y3M2tVuQVR1Q0Pl0dwZ67KbZtGnX/ma++/FsCCY1ANlAxIuT2NZP3XB/GRKc9qKhKTYnd4auJbIqINEBDa5zoWWByoS1jocR+loKpKGJKqBLybN/OQN2Tmodv4jCtYIMYurnP5sLf+V5XK4DbFv4haaDCEABA/J88GdegD1I2+heY0Xj7M1itiMjP8srzutjXMbkIDZKCrAcfGOt8LwODimYnzzjLcHIx5VFwPekZrhVPYmxyVNAvZP8KV28SykClo6XF4/t9LpC2TTIteulJepJjD5nCjL8E56sMHt40NYYqE51ZnZIfmGXYBC68p/6v6UkApSI8Y2ejPVKhyE0PdLDPcg+Z003G0W7YUmmvo/WtjXgbiKAAQNGpjYRDOwWILx3dV16ZBsx3QsdYi4JNUw6uCvMbrUcWFAvPWznfH9/GQHR5xAbPuTumRFWvS+ZwDGyJFfidkxWk2oaIfTRk8RI0YqMAQBAL7YVrz/iUDx4QII4/QAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxMi0xMi0wMVQwMDowNjo0My0wNTowMLKpTWYAAAAldEVXdGRhdGU6bW9kaWZ5ADIwMTItMTItLTAxVDAwOjA2OjQzLTA1OjAwMP09doAAAAAZdHJmVHdhcmUHQWRvYyBJbWFnZViB5XkAAAAASUVORK5CYII=";

class EnhancedInputProcessor {
    constructor(elementReference, initialConfiguration = {}) {
        if (!(elementReference instanceof HTMLTextAreaElement)) {
            throw new Error("The provided element must be a textarea.");
        }
        this.targetElement = elementReference;
        this.processorConfiguration = {
            indentUnit: '\t',
            ...initialConfiguration
        };
        this.indentUnitLength = this.processorConfiguration.indentUnit.length;

        this.onKeyPress = this.onKeyPress.bind(this);
        this.prepareForActivation = this.prepareForActivation.bind(this);
        this.cancelActivationTimer = this.cancelActivationTimer.bind(this);
        this.onElementBlur = this.onElementBlur.bind(this);
        this.activationDelayTimeout = null;

        activeElementProcessors.set(elementReference, this);
    }

    isCurrentSelectionMultiLine() {
        const selectedSnippet = this.targetElement.value.slice(this.targetElement.selectionStart, this.targetElement.selectionEnd);
        return selectedSnippet.includes('\n');
    }

    retrieveLineStartingIndices() {
        const fullContent = this.targetElement.value;
        const startIndices = [0];
        let currentScanOffset = 0;
        let newlineMarker;

        while ((newlineMarker = fullContent.indexOf('\n', currentScanOffset)) !== -1) {
            startIndices.push(newlineMarker + 1);
            currentScanOffset = newlineMarker + 1;
        }
        return startIndices;
    }

    updateElementContent(newContent, newCursorStart, newCursorEnd) {
        this.targetElement.value = newContent;
        this.targetElement.selectionStart = newCursorStart;
        this.targetElement.selectionEnd = newCursorEnd;
    }

    performSingleLineIndent(currentSelectionStart, currentSelectionEnd) {
        const { value: existingContent } = this.targetElement;
        const indentToken = this.processorConfiguration.indentUnit;
        const indentLength = this.indentUnitLength;

        const updatedContent = existingContent.slice(0, currentSelectionStart) + indentToken + existingContent.slice(currentSelectionStart);
        this.updateElementContent(updatedContent, currentSelectionStart + indentLength, currentSelectionEnd + indentLength);
    }

    performMultiLineIndent(currentSelectionStart, currentSelectionEnd) {
        const { value: existingContent } = this.targetElement;
        const lineStartIndices = this.retrieveLineStartingIndices();
        const indentToken = this.processorConfiguration.indentUnit;
        const indentLength = this.indentUnitLength;

        let contentLines = [];
        let firstAffectedLineOriginalStart = -1;
        let originalFirstAffectedLineEnd = -1;
        let totalIndentCharactersAdded = 0;

        for (let i = 0; i < lineStartIndices.length; i++) {
            const lineAbsoluteStart = lineStartIndices[i];
            const lineAbsoluteEnd = (i + 1 < lineStartIndices.length ? lineStartIndices[i + 1] - 1 : existingContent.length);

            const isLineAffected = (lineAbsoluteStart < currentSelectionEnd && lineAbsoluteEnd >= currentSelectionStart);

            if (isLineAffected) {
                if (firstAffectedLineOriginalStart === -1) {
                    firstAffectedLineOriginalStart = lineAbsoluteStart;
                    originalFirstAffectedLineEnd = lineAbsoluteEnd;
                }
                contentLines.push(indentToken + existingContent.slice(lineAbsoluteStart, lineAbsoluteEnd));
                totalIndentCharactersAdded += indentLength;
            } else {
                contentLines.push(existingContent.slice(lineAbsoluteStart, lineAbsoluteEnd));
            }
        }

        const newContent = contentLines.join('\n');

        let finalSelectionStart = currentSelectionStart;
        let finalSelectionEnd = currentSelectionEnd;

        if (firstAffectedLineOriginalStart !== -1) {
            finalSelectionStart = firstAffectedLineOriginalStart;
            finalSelectionEnd = originalFirstAffectedLineEnd + totalIndentCharactersAdded;
        }

        this.updateElementContent(newContent, finalSelectionStart, finalSelectionEnd);
    }

    performSingleLineDedent(currentSelectionStart, currentSelectionEnd) {
        const { value: existingContent } = this.targetElement;
        const indentToken = this.processorConfiguration.indentUnit;
        const indentLength = this.indentUnitLength;

        let newContent = existingContent;
        let newStart = currentSelectionStart;
        let newEnd = currentSelectionEnd;

        if (existingContent.substring(currentSelectionStart - indentLength, currentSelectionStart) === indentToken) {
            newContent = existingContent.substring(0, currentSelectionStart - indentLength) + existingContent.substring(currentSelectionStart);
            newStart = currentSelectionStart - indentLength;
            newEnd = currentSelectionEnd - indentLength;
        } else {
            const currentLineStart = existingContent.lastIndexOf('\n', currentSelectionStart - 1) + 1;
            if (existingContent.substring(currentLineStart, currentLineStart + indentLength) === indentToken) {
                newContent = existingContent.substring(0, currentLineStart) + existingContent.substring(currentLineStart + indentLength);
                newStart = currentSelectionStart - indentLength;
                newEnd = currentSelectionEnd - indentLength;
            }
        }
        this.updateElementContent(newContent, newStart, newEnd);
    }

    performMultiLineDedent(currentSelectionStart, currentSelectionEnd) {
        const { value: existingContent } = this.targetElement;
        const lineStartIndices = this.retrieveLineStartingIndices();
        const indentToken = this.processorConfiguration.indentUnit;
        const indentLength = this.indentUnitLength;

        let contentLines = [];
        let firstAffectedLineOriginalStart = -1;
        let originalFirstAffectedLineEnd = -1;
        let totalIndentCharactersRemoved = 0;

        for (let i = 0; i < lineStartIndices.length; i++) {
            const lineAbsoluteStart = lineStartIndices[i];
            const lineAbsoluteEnd = (i + 1 < lineStartIndices.length ? lineStartIndices[i + 1] - 1 : existingContent.length);

            const isLineAffected = (lineAbsoluteStart < currentSelectionEnd && lineAbsoluteEnd >= currentSelectionStart);
            const lineContent = existingContent.slice(lineAbsoluteStart, lineAbsoluteEnd);

            if (isLineAffected) {
                if (firstAffectedLineOriginalStart === -1) {
                    firstAffectedLineOriginalStart = lineAbsoluteStart;
                    originalFirstAffectedLineEnd = lineAbsoluteEnd;
                }
                if (lineContent.substring(0, indentLength) === indentToken) {
                    contentLines.push(lineContent.substring(indentLength));
                    totalIndentCharactersRemoved += indentLength;
                } else {
                    contentLines.push(lineContent);
                }
            } else {
                contentLines.push(lineContent);
            }
        }

        const newContent = contentLines.join('\n');

        let finalSelectionStart = currentSelectionStart;
        let finalSelectionEnd = currentSelectionEnd;

        if (firstAffectedLineOriginalStart !== -1) {
            finalSelectionStart = firstAffectedLineOriginalStart;
            finalSelectionEnd = originalFirstAffectedLineEnd - totalIndentCharactersRemoved;
        }

        this.updateElementContent(newContent, finalSelectionStart, finalSelectionEnd);
    }

    handleAutomaticLineBreak(cursorPosition) {
        const { value: existingContent } = this.targetElement;
        const lineStartIndices = this.retrieveLineStartingIndices();
        const indentToken = this.processorConfiguration.indentUnit;

        let currentLineStart = 0;
        let currentLineEnd = existingContent.length;

        for (let i = 0; i < lineStartIndices.length; i++) {
            const start = lineStartIndices[i];
            const end = (i + 1 < lineStartIndices.length ? lineStartIndices[i + 1] - 1 : existingContent.length);

            if (cursorPosition >= start && cursorPosition <= end) {
                currentLineStart = start;
                currentLineEnd = end;
                break;
            }
        }

        const lineText = existingContent.substring(currentLineStart, currentLineEnd);
        const leadingWhitespaceMatch = lineText.match(new RegExp("^" + indentToken.replace('\t', '\\t').replace(/ /g, '\\s') + "+"));
        
        if (leadingWhitespaceMatch) {
            const extractedIndent = leadingWhitespaceMatch[0];
            let actualIndentToInsert = extractedIndent;
            let insertedIndentLength = extractedIndent.length;
            
            const cursorRelativePositionInLine = cursorPosition - currentLineStart;
            if (insertedIndentLength > cursorRelativePositionInLine) {
                insertedIndentLength = cursorRelativePositionInLine;
                actualIndentToInsert = extractedIndent.slice(0, cursorRelativePositionInLine);
            }

            const newContent = existingContent.slice(0, cursorPosition) + '\n' + actualIndentToInsert + existingContent.slice(cursorPosition);
            const newCursorPosition = cursorPosition + insertedIndentLength + 1;

            this.updateElementContent(newContent, newCursorPosition, newCursorPosition);
            return true;
        }
        return false;
    }

    onKeyPress(eventDetails) {
        const { keyCode, shiftKey } = eventDetails;
        const { selectionStart, selectionEnd } = this.targetElement;

        if (keyCode === 9) {
            eventDetails.preventDefault();
            const isMulti = this.isCurrentSelectionMultiLine();
            if (!shiftKey) {
                if (!isMulti && selectionStart === selectionEnd) {
                    this.performSingleLineIndent(selectionStart, selectionEnd);
                } else if (!isMulti) {
                     this.performSingleLineIndent(selectionStart, selectionEnd);
                } else {
                    this.performMultiLineIndent(selectionStart, selectionEnd);
                }
            } else {
                if (!isMulti && selectionStart === selectionEnd) {
                    this.performSingleLineDedent(selectionStart, selectionEnd);
                } else if (!isMulti) {
                    this.performSingleLineDedent(selectionStart, selectionEnd);
                } else {
                    this.performMultiLineDedent(selectionStart, selectionEnd);
                }
            }
        } else if (keyCode === 13 && !shiftKey) {
            if (this.handleAutomaticLineBreak(selectionStart)) {
                eventDetails.preventDefault();
            }
        } else if (keyCode === 27) {
            this.removeEnhancementFromElement();
        }
    }

    cancelActivationTimer() {
        clearTimeout(this.activationDelayTimeout);
        this.targetElement.removeEventListener('blur', this.cancelActivationTimer);
    }

    prepareForActivation() {
        const currentElement = this.targetElement;
        const currentClasses = (currentElement.getAttribute('class') || '').split(' ');
        
        currentElement.addEventListener('blur', this.cancelActivationTimer);

        this.activationDelayTimeout = setTimeout(() => {
            currentElement.addEventListener('keydown', this.onKeyPress);
            currentElement.style.backgroundImage = visualCueImage;
            currentElement.style.backgroundPosition = 'top right';
            currentElement.style.backgroundRepeat = 'no-repeat';

            const updatedClasses = currentClasses.filter(cls => cls !== 'processor-inactive');
            if (!updatedClasses.includes('processor-active')) {
                updatedClasses.push('processor-active');
            }
            currentElement.setAttribute('class', updatedClasses.join(' '));
            
            currentElement.removeEventListener('blur', this.cancelActivationTimer);
            this.activationDelayTimeout = null;

        }, 500);
    }

    onElementBlur() {
        this.removeEnhancementFromElement();
    }

    applyEnhancementToElement() {
        const currentElement = this.targetElement;
        if (currentElement.nodeName === 'TEXTAREA') {
            currentElement.addEventListener('focus', this.prepareForActivation);
            currentElement.addEventListener('blur', this.onElementBlur);
            
            const currentClasses = (currentElement.getAttribute('class') || '').split(' ');
            if (!currentClasses.includes('processor-inactive')) {
                currentClasses.push('processor-inactive');
                currentElement.setAttribute('class', currentClasses.join(' '));
            }
        }
    }

    removeEnhancementFromElement() {
        const currentElement = this.targetElement;
        if (currentElement.nodeName === 'TEXTAREA') {
            currentElement.removeEventListener('focus', this.prepareForActivation);
            currentElement.removeEventListener('blur', this.onElementBlur);
            currentElement.removeEventListener('keydown', this.onKeyPress);

            currentElement.style.backgroundImage = '';
            currentElement.style.backgroundPosition = '';
            currentElement.style.backgroundRepeat = '';

            const currentClasses = (currentElement.getAttribute('class') || '').split(' ');
            const cleanedClasses = currentClasses.filter(cls => cls !== 'processor-active' && cls !== 'processor-inactive');
            
            if (currentClasses.includes('processor-active')) {
                cleanedClasses.push('processor-trigger');
            }
            currentElement.setAttribute('class', cleanedClasses.join(' '));
            
            if (this.activationDelayTimeout) {
                clearTimeout(this.activationDelayTimeout);
                this.activationDelayTimeout = null;
            }
            activeElementProcessors.delete(currentElement);
        }
    }
}

const globalEnhancedInputManager = {
    currentVersion: '1.0.0',
    defaultConfiguration: {
        indentUnit: '\t'
    },
    
    activateForMatchingElements: function(cssSelector = 'textarea.processor-trigger') {
        const elementsToProcess = document.querySelectorAll(cssSelector);
        elementsToProcess.forEach(element => {
            if (!activeElementProcessors.has(element)) {
                const processorInstance = new EnhancedInputProcessor(element, this.defaultConfiguration);
                processorInstance.applyEnhancementToElement();
            }
        });
    },

    activateForSingleElement: function(element) {
        if (!activeElementProcessors.has(element)) {
            const processorInstance = new EnhancedInputProcessor(element, this.defaultConfiguration);
            processorInstance.applyEnhancementToElement();
        }
    },

    deactivateAllEnhancedElements: function(cssSelector = 'textarea.processor-trigger, textarea.processor-active, textarea.processor-inactive') {
        const elementsToDeactivate = document.querySelectorAll(cssSelector);
        elementsToDeactivate.forEach(element => {
            const processorInstance = activeElementProcessors.get(element);
            if (processorInstance) {
                processorInstance.removeEnhancementFromElement();
            }
        });
    },

    deactivateSingleEnhancedElement: function(element) {
        const processorInstance = activeElementProcessors.get(element);
        if (processorInstance) {
            processorInstance.removeEnhancementFromElement();
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    globalEnhancedInputManager.activateForMatchingElements();
});