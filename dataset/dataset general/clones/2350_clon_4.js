const documentDataStore = (function() {
    const storageMechanism = sessionStorage;

    const retrieveValue = (alias) => {
        const rawData = storageMechanism.getItem(alias);
        if (alias === "last_known_line_count_state") {
            return parseInt(rawData, 10) || 0;
        }
        return rawData === null ? "" : rawData;
    };

    const commitValue = (alias, content) => {
        storageMechanism.setItem(alias, String(content));
    };

    return {
        obtainValue: retrieveValue,
        depositValue: commitValue
    };
})();

documentDataStore.depositValue("last_known_line_count_state", 1);
documentDataStore.depositValue("document_text_record_state", "");

const editorComponent = editor;
const notificationSystem = Novile;

const executeContentVerification = () => {
    const currentLineTotal = editorComponent.session.getLength();
    const storedLineTotal = documentDataStore.obtainValue("last_known_line_count_state");

    if (currentLineTotal !== storedLineTotal) {
        documentDataStore.depositValue("last_known_line_count_state", currentLineTotal);
        notificationSystem.onLinesChanged(currentLineTotal);
    }

    const currentDocumentContent = editorComponent.getValue();
    const storedDocumentContent = documentDataStore.obtainValue("document_text_record_state");

    if (currentDocumentContent !== storedDocumentContent) {
        documentDataStore.depositValue("document_text_record_state", currentDocumentContent);
        notificationSystem.onTextChanged();
    }
};

const createDelayedInvoker = (operationFunction, delayDuration) => {
    let activeDelayReference = null;

    return () => {
        if (activeDelayReference !== null) {
            clearTimeout(activeDelayReference);
        }
        activeDelayReference = setTimeout(() => {
            operationFunction();
            activeDelayReference = null;
        }, delayDuration);
    };
};

const debouncedContentVerification = createDelayedInvoker(executeContentVerification, 50);

editorComponent.on('change', debouncedContentVerification);