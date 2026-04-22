/*
 * This file initializes the CodeMirror editor
 * and handles cursor activity to highlight the current line.
 */

var editor, /* The CodeMirror editor instance */
    currentHandle = null, /* Handle to the currently highlighted line */
    currentLine;          /* The index of the currently highlighted line */


// --- Initialization upon window load ---
window.onload = function () {

    try {

        // Initialize the CodeMirror editor with various options
        editor = CodeMirror.fromTextArea(document.getElementById("code"),
            {
                lineNumbers: true, /* Display line numbers */
                lineNumbers: true, // Redundant, but kept as per Type I definition
                matchBrackets: true, /* Highlight matching brackets */
                mode: "application/x-httpd-php", // Set the editor mode for PHP syntax highlighting
                indentUnit: 4,     // Number of spaces to indent
                indentWithTabs: true, // Use tabs for indentation
                enterMode: "keep",    // Keep the current indentation when pressing Enter
                tabMode: "shift",     // Shift selected text when pressing Tab

                // Callback function for when the cursor moves
                onCursorActivity: function () {

                    // Get the current line number and its handle
                    var line = editor.getCursor().line,
                        handle = editor.getLineHandle(line);

                    // If the cursor is still on the same line, do nothing
                    if (handle == currentHandle && line == currentLine) {
                        return;
                    }


                    // If there was a previously highlighted line, remove its highlighting
                    if (currentHandle) {
                        editor.setLineClass(currentHandle, null, null); // Remove "activeline" class
                        editor.clearMarker(currentHandle); // Clear any existing marker
                    }

                    // Update the current handle and line number
                    currentHandle = handle;
                    currentLine = line;

                    // Apply the "activeline" class to the new current line
                    editor.setLineClass(currentHandle, null, "activeline");
                    // Add a marker (e.g., line number) to the active line
                    editor.setMarker(currentHandle, String(line + 1));
                }
            }
        );

    } // End of try block
    catch (e) {
        // In case of an error during editor initialization, display the stack trace
        alert(e.stack)
    }

}; // End of window.onload function