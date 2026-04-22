const applyTextInsertionCapability = (targetNode) => {
    if (targetNode.createTextRange) {
        // Legacy Internet Explorer insertion routine
        targetNode.appendPayload = (inputFragment) => {
            document.selection.createRange().text = inputFragment;
        };
    } else {
        // Modern browser insertion routine
        targetNode.appendPayload = (inputFragment) => {
            const initialPoint = targetNode.selectionStart;
            const finalPoint = targetNode.selectionEnd;
            const existingContent = targetNode.value;

            const modifiedContent = existingContent.slice(0, initialPoint) + inputFragment + existingContent.slice(finalPoint);
            targetNode.value = modifiedContent;

            const newCaretPosition = initialPoint + inputFragment.length;
            targetNode.setSelectionRange(newCaretPosition, newCaretPosition);
        };
    }
};