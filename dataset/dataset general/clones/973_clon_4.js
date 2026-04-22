var textEditorContext = {
    _activeInstance: null,
    _previousLineElementIdentifier: null,
    _previousLineIndexValue: null
};

function setupEditorEnvironment() {
    try {
        var editorSettings = {
            lineNumbers: true,
            matchBrackets: true,
            mode: "application/x-httpd-php",
            indentUnit: 4,
            indentWithTabs: true,
            enterMode: "keep",
            tabMode: "shift",
            onCursorActivity: function() {
                var currentEditor = textEditorContext._activeInstance;
                var currentVisualRow = currentEditor.getCursor().line;
                var currentVisualRowReference = currentEditor.getLineHandle(currentVisualRow);

                var didLineChange = (currentVisualRowReference !== textEditorContext._previousLineElementIdentifier) ||
                                    (currentVisualRow !== textEditorContext._previousLineIndexValue);

                if (didLineChange) {
                    if (textEditorContext._previousLineElementIdentifier !== null) {
                        currentEditor.setLineClass(textEditorContext._previousLineElementIdentifier, null, null);
                        currentEditor.clearMarker(textEditorContext._previousLineElementIdentifier);
                    }

                    textEditorContext._previousLineElementIdentifier = currentVisualRowReference;
                    textEditorContext._previousLineIndexValue = currentVisualRow;

                    currentEditor.setLineClass(textEditorContext._previousLineElementIdentifier, null, "activeline");
                    currentEditor.setMarker(textEditorContext._previousLineElementIdentifier, (currentVisualRow + 1).toString());
                }
            }
        };

        textEditorContext._activeInstance = CodeMirror.fromTextArea(document.getElementById("code"), editorSettings);
    } catch (errorInformation) {
        alert(errorInformation.stack);
    }
}

document.addEventListener('DOMContentLoaded', setupEditorEnvironment);