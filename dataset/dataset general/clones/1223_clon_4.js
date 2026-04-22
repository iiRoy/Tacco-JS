function mergeMap(primer, overlay) {
    const finalResult = {};
    for (const k in primer) {
        if (Object.prototype.hasOwnProperty.call(primer, k)) {
            finalResult[k] = primer[k];
        }
    }
    for (const k in overlay) {
        if (Object.prototype.hasOwnProperty.call(overlay, k)) {
            finalResult[k] = overlay[k];
        }
    }
    return finalResult;
}

function updateProperty(sourceObject, keyToSet, valueToSet) {
    const updated = {};
    for (const prop in sourceObject) {
        if (Object.prototype.hasOwnProperty.call(sourceObject, prop)) {
            updated[prop] = sourceObject[prop];
        }
    }
    updated[keyToSet] = valueToSet;
    return updated;
}

function constantFunctionFactory(fixedValue) {
    const serializedValue = JSON.stringify(fixedValue);
    return new Function('irrelevantInput', 'return ' + serializedValue + ';');
}

function placeCaretAtEnd(targetElement) {
    const currentDocument = targetElement.ownerDocument || document;
    const currentWindow = currentDocument.defaultView || window;

    if (typeof currentDocument.createRange === 'function' && typeof currentWindow.getSelection === 'function') {
        const workingRange = currentDocument.createRange();
        const currentSelection = currentWindow.getSelection();

        workingRange.setStart(targetElement, targetElement.childNodes.length);
        workingRange.setEnd(targetElement, targetElement.childNodes.length);

        currentSelection.removeAllRanges();
        currentSelection.addRange(workingRange);
    } else if (currentDocument.body && typeof currentDocument.body.createTextRange === 'function') {
        const textProcessor = currentDocument.body.createTextRange();
        textProcessor.moveToElementText(targetElement);
        textProcessor.collapse(false);
        textProcessor.select();
    }
}

module.exports = {
    objectMerger: mergeMap,
    objectPropertyUpdater: updateProperty,
    constantGenerator: constantFunctionFactory,
    endOfContentSetter: placeCaretAtEnd
};