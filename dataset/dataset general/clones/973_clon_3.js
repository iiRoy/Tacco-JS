/*
 * Global references for the code editing component state.
 * These variables track the primary editor instance, the handle of the previously active line,
 * and the numerical index of that line for efficient cursor activity management.
 */
var codeMirrorCore = null;             // The main CodeMirror editor instance.
var previousLineReference = null;      // Stores the line handle of the line that was active just before the current one.
var currentlyFocusedLineIndex = -1;    // Holds the zero-based index of the line that was active.

// Ensure the DOM is fully loaded before attempting to initialize the editor component.
document.addEventListener('DOMContentLoaded', function () {
    // Attempt to locate the target textarea element for editor attachment.
    const designatedCodeArea = document.getElementById("code");

    // Implement a preliminary check to prevent errors if the target element is missing.
    if (!designatedCodeArea) {
        console.warn("Critical: The designated code editing area (element with ID 'code') was not found in the DOM. Editor initialization aborted.");
        // Provide a user-friendly fallback message directly in the document body.
        const missingElementAlert = document.createElement('div');
        missingElementAlert.style.cssText = 'color: #a00; background-color: #fee; border: 1px solid #faa; padding: 10px; margin-top: 15px; font-family: sans-serif; font-size: 1.1em; text-align: center;';
        missingElementAlert.textContent = 'Error: The required code editor container is missing. Please ensure an HTML element with id="code" exists.';
        document.body.prepend(missingElementAlert); // Add a visible message at the top of the body.
        return; // Exit early if the target element is absent.
    }

    try {
        // Define a comprehensive configuration object for the CodeMirror instance.
        // This approach centralizes settings, improving clarity and modularity.
        const editorSettingsBundle = {
            lineNumbers: true,           // Enables the display of line numbers in the gutter.
            matchBrackets: true,         // Activates bracket matching functionality.
            mode: "text/x-javascript",   // Sets the syntax highlighting mode specifically for JavaScript.
            indentUnit: 2,               // Specifies the number of spaces per indentation level.
            indentWithTabs: false,       // Configures the editor to use spaces instead of tabs for indentation.
            enterMode: "indent",         // Determines how new lines are handled (maintains current indentation).
            tabMode: "spaces",           // Ensures that pressing Tab inserts spaces, not a tab character.
            // Custom event handler invoked whenever the cursor position or selection changes within the editor.
            onCursorActivity: function (editorInstance) {
                // Retrieve the current cursor's line and column position.
                const cursorPositionData = editorInstance.getCursor();
                const currentLineNumber = cursorPositionData.line;
                // Obtain the unique internal handle for the current line, essential for styling operations.
                const currentLineIdentifier = editorInstance.getLineHandle(currentLineNumber);

                // Guard condition: If the line number is invalid or if the cursor has not moved to a new line,
                // there's no need to update the active line styling, so we exit early.
                if (currentLineNumber < 0 || (currentLineIdentifier === previousLineReference && currentLineNumber === currentlyFocusedLineIndex)) {
                    return; // Optimize by returning if the active line hasn't changed.
                }

                // If a line was previously marked as active, clear its visual styling and any associated marker.
                if (previousLineReference) {
                    editorInstance.setLineClass(previousLineReference, null, null); // Remove custom class from old line.
                    editorInstance.clearMarker(previousLineReference);             // Remove any text marker from old line.
                }

                // Update the global state variables to reflect the new active line.
                previousLineReference = currentLineIdentifier;
                currentlyFocusedLineIndex = currentLineNumber;

                // Apply the 'active-editor-line' CSS class to the newly focused line for visual distinction.
                editorInstance.setLineClass(previousLineReference, null, "active-editor-line");
                // Add a custom marker in the gutter, displaying the 1-based line number.
                editorInstance.setMarker(previousLineReference, `&nbsp;${currentlyFocusedLineIndex + 1}`);
            }
        };

        // Initialize the CodeMirror editor by attaching it to the designated textarea.
        // The `codeMirrorCore` variable now holds the operational editor instance.
        codeMirrorCore = CodeMirror.fromTextArea(designatedCodeArea, editorSettingsBundle);

        // Optional: Programmatically set focus to the editor immediately after its creation.
        codeMirrorCore.focus();

    } catch (initializationFailure) {
        // Capture and report any errors encountered during the CodeMirror initialization process.
        console.error("Fatal Error: Code editor initialization failed.", initializationFailure);
        // Present a more informative and user-friendly error message within the UI.
        const runtimeErrorMessage = document.createElement('div');
        runtimeErrorMessage.style.cssText = 'color: #d00; background-color: #fee; border: 1px solid #fcc; padding: 15px; margin-top: 20px; font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; font-size: 1.1em; line-height: 1.5;';
        runtimeErrorMessage.innerHTML = `
            <h2>Editor Setup Problem</h2>
            <p>An unexpected issue prevented the code editor from loading correctly.</p>
            <p><strong>Please try refreshing your browser.</strong> If the problem persists, please contact support.</p>
            <details>
                <summary>Technical Details (for debugging)</summary>
                <pre style="white-space: pre-wrap; word-break: break-all;"><code>${initializationFailure.message || initializationFailure.stack || 'No specific error message available.'}</code></pre>
            </details>
        `;
        document.body.appendChild(runtimeErrorMessage); // Append the detailed error message to the body.
    }
});