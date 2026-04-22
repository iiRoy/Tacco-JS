const defaultConfiguration = {
    omitHtmlTags: false,
    respectWordBoundaries: false,
    replaceLineBreaks: false,
    maximumCharCount: Infinity,
    terminationSymbol: '\u2026'
};

function computeEffectiveLength(sourceText, targetMax, enforceWordBoundary) {
    const initialOverflow = sourceText.length - targetMax;

    if (!enforceWordBoundary || initialOverflow <= 0) {
        return targetMax;
    }

    const segmentToExamine = sourceText.substring(0, targetMax);
    const trailingWordOrSpacePattern = /(\s*\S+|\s)$/;
    const segmentWithoutLastComponentLength = segmentToExamine.replace(trailingWordOrSpacePattern, '').length;

    const adjustedCharactersToRemove = sourceText.length - segmentWithoutLastComponentLength - 1;
    return sourceText.length - adjustedCharactersToRemove;
}

function buildTruncatedFragment(sourceElementNode, destinationParentNode, charLimit, endMark, processingStatus) {
    if (processingStatus.truncationComplete) {
        return;
    }

    Array.from(sourceElementNode.childNodes).forEach(childItem => {
        if (processingStatus.truncationComplete) {
            return;
        }

        if (childItem.nodeType === Node.TEXT_NODE) {
            const currentText = childItem.textContent;
            const remainingSpace = charLimit - processingStatus.currentAccumulatedLength;

            if (currentText.length <= remainingSpace) {
                destinationParentNode.appendChild(document.createTextNode(currentText));
                processingStatus.currentAccumulatedLength += currentText.length;
            } else {
                const truncatedSegment = currentText.substring(0, remainingSpace);
                destinationParentNode.appendChild(document.createTextNode(truncatedSegment + endMark));
                processingStatus.currentAccumulatedLength += remainingSpace;
                processingStatus.truncationComplete = true;
            }
        } else if (childItem.nodeType === Node.ELEMENT_NODE) {
            const newElementClone = childItem.cloneNode(false);
            destinationParentNode.appendChild(newElementClone);
            buildTruncatedFragment(childItem, newElementClone, charLimit, endMark, processingStatus);
        } else {
            destinationParentNode.appendChild(childItem.cloneNode(true));
        }
    });
}

function trimContent(inputHtmlString, userSettings) {
    const activeConfiguration = Object.assign({}, defaultConfiguration, userSettings);

    const temporaryDiv = document.createElement('div');
    temporaryDiv.innerHTML = inputHtmlString;

    if (activeConfiguration.replaceLineBreaks) {
        Array.from(temporaryDiv.querySelectorAll('br')).forEach(brTag => {
            brTag.replaceWith(document.createTextNode(' '));
        });
    }

    const totalPlainText = temporaryDiv.textContent;
    const finalCharacterTarget = computeEffectiveLength(totalPlainText, activeConfiguration.maximumCharCount, activeConfiguration.respectWordBoundaries);

    if (finalCharacterTarget >= totalPlainText.length) {
        return inputHtmlString;
    }

    if (activeConfiguration.omitHtmlTags) {
        let resultPlainText = totalPlainText.substring(0, finalCharacterTarget);
        resultPlainText += activeConfiguration.terminationSymbol;
        return resultPlainText;
    } else {
        const outputDocumentFragment = document.createDocumentFragment();
        const stateManager = { currentAccumulatedLength: 0, truncationComplete: false };

        buildTruncatedFragment(temporaryDiv, outputDocumentFragment, finalCharacterTarget, activeConfiguration.terminationSymbol, stateManager);
        
        return outputDocumentFragment.innerHTML;
    }
}