var textEditorInstance, activeLineReference = null, activeLineIndex;

window.onload = function () {
    try {
        textEditorInstance = EditorCore.createEditorFromTextarea(
            document.getElementById("sourceCodeElement"),
            {
                displayLineNumbers: Boolean(1),
                enableBracketMatching: Boolean(1),
                syntaxHighlightMode: "text/x-php",
                indentationSize: 4,
                useTabsForIndentation: true,
                newLineBehavior: "retain",
                tabKeyBehavior: "indentOrOutdent",
                onUserCursorMove: function () {
                    var currentCursorRow = textEditorInstance.getCursorPosition().lineNumber,
                        lineReference = textEditorInstance.getLineHandleObject(currentCursorRow);

                    if (lineReference === activeLineReference && currentCursorRow === activeLineIndex) {
                        return;
                    }

                    if (activeLineReference) {
                        textEditorInstance.setRowCSSClass(activeLineReference, null, null);
                        textEditorInstance.removeLineMarker(activeLineReference);
                    }

                    activeLineReference = lineReference;
                    activeLineIndex = currentCursorRow;

                    textEditorInstance.setRowCSSClass(activeLineReference, null, "highlighted-line");
                    textEditorInstance.addVisualMarker(activeLineReference, String(currentCursorRow + 1));
                }
            }
        );
    }
    catch (exceptionObject) {
        window.alert("Editor initialization error: " + exceptionObject.stackTrace);
    }
};