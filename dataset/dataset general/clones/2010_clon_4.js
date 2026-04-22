var AppSettings = {
    styling: {
        externalSheets: []
    }
};

var MarkdownForge = (function() {
    let sourceInputElReference;
    let outputFrameContainerReference;
    let outputFrameReference;
    let frameContentDocumentReference;
    let codeEditorInstanceReference;
    let sizeControlReference;

    const retrieveElement = (selectionString) => {
        const domElement = document.querySelector(selectionString);
        if (!domElement) {
            console.warn(`DOM element not found for selector: ${selectionString}`);
        }
        return domElement;
    };

    const displayFacility = {
        initialize: function() {
            outputFrameContainerReference = retrieveElement('#rme-preview');

            outputFrameReference = document.createElement('iframe');
            outputFrameReference.id = 'rme-preview-content';
            outputFrameReference.src = 'about:blank';
            outputFrameContainerReference.innerHTML = '';
            outputFrameContainerReference.appendChild(outputFrameReference);

            frameContentDocumentReference = outputFrameReference.contentWindow.document;

            const styleLinkDeclarations = AppSettings.styling.externalSheets.map(resourceURL =>
                `<link href="${resourceURL}" rel="stylesheet" type="text/css" />`
            ).join('');

            frameContentDocumentReference.open();
            frameContentDocumentReference.write(`<html><head>${styleLinkDeclarations}</head><body class="mceContentBody"></body></html>`);
            frameContentDocumentReference.close();

            const relayIframeEvent = (eventObject) => {
                const recreatedEvent = new eventObject.constructor(eventObject.type, eventObject);
                document.dispatchEvent(recreatedEvent);
            };
            frameContentDocumentReference.addEventListener('mousemove', relayIframeEvent);
            frameContentDocumentReference.addEventListener('mouseup', relayIframeEvent);

            sourceInputElReference = retrieveElement('textarea#content');
            sourceInputElReference.addEventListener('input', displayFacility.renderOutput);
            sourceInputElReference.addEventListener('propertychange', displayFacility.renderOutput);

            displayFacility.renderOutput();
        },

        renderOutput: function() {
            const rawSourceText = sourceInputElReference.value;
            const processedMarkup = marked(rawSourceText);

            const contentBodyInFrame = frameContentDocumentReference.querySelector('.mceContentBody');
            if (contentBodyInFrame) {
                contentBodyInFrame.innerHTML = processedMarkup;
            }

            const customWordCountEvent = new CustomEvent('wordCountUpdate', { bubbles: true, detail: { content: rawSourceText } });
            document.dispatchEvent(customWordCountEvent);
        }
    };

    const dimensionControl = {
        activate: function() {
            sizeControlReference = retrieveElement('#content-resize-handle');
            sizeControlReference.addEventListener('mousedown', dimensionControl.beginDragOperation);
            dimensionControl.adjustPanelSizes();
        },

        adjustPanelSizes: function() {
            const currentSourceHeight = sourceInputElReference.offsetHeight;
            const heightValuePx = `${currentSourceHeight}px`;

            if (outputFrameContainerReference) {
                outputFrameContainerReference.style.height = heightValuePx;
            }

            const editorWrapperElement = retrieveElement('#wp-content-editor-container .CodeMirror');
            if (editorWrapperElement) {
                editorWrapperElement.style.height = heightValuePx;
            }
            return false;
        },

        beginDragOperation: function(mouseEvent) {
            mouseEvent.preventDefault();
            document.addEventListener('mousemove', dimensionControl.duringDragOperation);
            document.addEventListener('mouseup', dimensionControl.endDragOperation);
            return false;
        },

        duringDragOperation: function(mouseEvent) {
            dimensionControl.adjustPanelSizes();
            return false;
        },

        endDragOperation: function(mouseEvent) {
            document.removeEventListener('mousemove', dimensionControl.duringDragOperation);
            document.removeEventListener('mouseup', dimensionControl.endDragOperation);
            return false;
        }
    };

    const applicationEntry = function() {
        sourceInputElReference = retrieveElement('textarea#content');

        const editorConfiguration = {
            onChange: function (currentEditorInstance) {
                sourceInputElReference.value = currentEditorInstance.getValue();
                displayFacility.renderOutput();
            },
            mode: 'markdown',
            matchBrackets: true,
            lineWrapping: true,
            indentWithTabs: true
        };
        codeEditorInstanceReference = CodeMirror.fromTextArea(sourceInputElReference, editorConfiguration);

        displayFacility.initialize();
        dimensionControl.activate();
    };

    return {
        start: applicationEntry
    };
})();

document.addEventListener('DOMContentLoaded', function() {
    AppSettings.styling.externalSheets = rotormdLocalize.customCSS;
    MarkdownForge.start();
});