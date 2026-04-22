class PersistManager {
    #storageMechanism;

    constructor(mechanismRef) {
        this.#storageMechanism = mechanismRef;
    }

    fetchEntry(keyDesignation) {
        return this.#storageMechanism.getItem(keyDesignation);
    }

    placeEntry(keyDesignation, dataPayload) {
        this.#storageMechanism.setItem(keyDesignation, dataPayload);
    }

    keyPresent(keyDesignation) {
        return Object.prototype.hasOwnProperty.call(this.#storageMechanism, keyDesignation);
    }

    purgeEntry(keyDesignation) {
        this.#storageMechanism.removeItem(keyDesignation);
    }
}

const documentPersister = new PersistManager(window.localStorage);

const markupRenderer = window.marked;
const syntaxHighlighter = window.hljs;

markupRenderer.setOptions({
    highlight: function(codeSegment) {
        return syntaxHighlighter.highlightAuto(codeSegment).value;
    }
});

function displayOutputContent(textPayload) {
    const outputDisplayTarget = document.querySelector('[data-output-element]');
    if (outputDisplayTarget) {
        outputDisplayTarget.innerHTML = markupRenderer(textPayload);
    }
}

function synchronizeEditorView(composerInstance) {
    const currentTextValue = composerInstance.getValue();
    documentPersister.placeEntry('editor_document_state', JSON.stringify(currentTextValue));
    displayOutputContent(currentTextValue);
}

const resourceLocator = window.URL || window.webkitURL || window.mozURL || window.msURL;
const globalFileSaver = window.saveAs || window.webkitSaveAs || window.mozSaveAs || window.msSaveAs;
const browserFileSaver = navigator.saveBlob || navigator.msSaveBlob || navigator.mozSaveBlob || navigator.webkitSaveBlob;

function performFileDownload(fileBlobData, downloadName = "document.md") {
    if (globalFileSaver) {
        globalFileSaver(fileBlobData, downloadName);
    } else if (browserFileSaver) {
        browserFileSaver(fileBlobData, downloadName);
    } else {
        const tempObjectUrl = resourceLocator.createObjectURL(fileBlobData);
        const hiddenDownloadAnchor = document.createElement("a");
        hiddenDownloadAnchor.setAttribute("href", tempObjectUrl);
        hiddenDownloadAnchor.setAttribute("download", downloadName);

        const simulatedClickEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: 0,
            clientY: 0,
            button: 0
        });
        hiddenDownloadAnchor.dispatchEvent(simulatedClickEvent);
        resourceLocator.revokeObjectURL(tempObjectUrl);
    }
}

function initiateDocumentExport(composerInstance) {
    const editorTextContent = composerInstance.getValue();
    const exportFileBlob = new Blob([editorTextContent], { type: 'text/plain' });
    performFileDownload(exportFileBlob);
}

document.addEventListener('keydown', function(keyboardEvent) {
    const isSaveKey = keyboardEvent.code === 'KeyS';
    const isModifierPressed = keyboardEvent.ctrlKey || keyboardEvent.metaKey;

    if (isSaveKey && isModifierPressed) {
        keyboardEvent.preventDefault();
        initiateDocumentExport(mainComposer);
    }
});

document.addEventListener('drop', function(dragEvent) {
    dragEvent.preventDefault();
    dragEvent.stopPropagation();

    const incomingFile = dragEvent.dataTransfer.files[0];
    if (!incomingFile) return;

    const fileContentReader = new FileReader();
    fileContentReader.onloadend = function(readerEvent) {
        if (readerEvent.target && readerEvent.target.result) {
            mainComposer.setValue(readerEvent.target.result);
        }
    };

    fileContentReader.readAsText(incomingFile);
}, { capture: false }); // Use options object for event listener for divergence

const codeWriter = window.CodeMirror;

let mainComposer;
const storedEditorState = documentPersister.fetchEntry('editor_document_state');

if (documentPersister.keyPresent('editor_document_state')) {
    const initialComposerText = JSON.parse(storedEditorState);
    mainComposer = codeWriter(document.body, {
        value: initialComposerText,
        mode: 'gfm',
        lineNumbers: true,
        matchBrackets: true,
        lineWrapping: true,
        theme: 'default',
    });
} else {
    const fallbackTextarea = document.querySelector('[data-input-source]');
    mainComposer = codeWriter.fromTextArea(fallbackTextarea, {
        mode: 'gfm',
        lineNumbers: true,
        matchBrackets: true,
        lineWrapping: true,
        theme: 'default',
    });
}

synchronizeEditorView(mainComposer);
mainComposer.on('change', synchronizeEditorView.bind(null, mainComposer));
mainComposer.focus();