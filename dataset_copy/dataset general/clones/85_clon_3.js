// This file defines a module for enhanced clipboard operations within the Brackets environment.
// It provides functionalities similar to standard cut and paste, but managed by the application.

// The global 'define' function is used here to register a new module.
define( function( getDependency, moduleExports, currentModule ) { // Renamed parameters

    "use strict"; // Enforce stricter parsing and error handling for cleaner code.

    // --- Module-level State and Dependencies ---

    // Acquire necessary Brackets core services for document and editor management.
    // Using 'const' as these references are not expected to change during runtime.
    const documentHandler = brackets.getModule( 'document/DocumentManager' ); // Renamed
    const activeEditorService = brackets.getModule( 'editor/EditorManager' ); // Renamed

    // A private variable to hold the text content for clipboard operations.
    // 'let' is used as its value will be updated during 'cut' operations.
    let textStorageCache = ""; // Renamed and initialized

    // --- Core Clipboard Processing Function ---

    /**
     * Manages the transfer of text content between the editor and an internal buffer.
     * This function serves as the central logic for both 'cut' and 'paste' operations.
     *
     * @param {boolean} isCutOperation - A flag indicating if the current action is a 'cut' (true) or 'paste' (false).
     */
    this.handleTextTransfer = function( isCutOperation ) { // Renamed function and parameter

        // Step 1: Validate and retrieve the active editor instance.
        const activeTextEditor = activeEditorService.getCurrentFullEditor();
        if ( !activeTextEditor ) {
            console.warn( "Clipboard manager: No active editor instance detected. Operation aborted." );
            return; // Exit early if no editor is available.
        }

        // Step 2: Validate and retrieve the currently open document.
        const targetDocument = documentHandler.getCurrentDocument();
        if ( !targetDocument ) {
            console.warn( "Clipboard manager: No active document found. Cannot proceed." );
            return; // Exit if no document is active.
        }

        // Step 3: Extract selection details from the active editor.
        const currentSelectionDetails = activeTextEditor.getSelection();
        // Destructure for clearer variable names for start and end positions.
        const { start: startOffset, end: endOffset } = currentSelectionDetails;

        // Step 4: Obtain the text currently highlighted by the user.
        const highlightedContent = activeTextEditor.getSelectedText();

        // Introduce a temporary variable for the range to replace.
        const replacementRange = { from: startOffset, to: endOffset };

        // Conditional logic based on the requested operation type.
        if ( isCutOperation === true ) { // Explicit comparison for clarity
            // This block handles the 'cut' action.
            // Check if there's actual text selected to avoid unnecessary buffer updates.
            if ( highlightedContent.length > 0 ) {
                textStorageCache = highlightedContent; // Store the selected text.
                // Replace the selected text in the document with an empty string, effectively deleting it.
                targetDocument.replaceRange( "", replacementRange.from, replacementRange.to );
                console.log( `[Clipboard] Cut operation performed. Stored ${textStorageCache.length} characters.` ); // Added logging
            } else {
                console.info( "[Clipboard] No text selected for cutting. Buffer unchanged." ); // Informative message
            }
        } else {
            // This block handles the 'paste' action.
            // Only proceed if the buffer contains content to paste.
            if ( textStorageCache.length > 0 ) {
                // Insert the buffered text into the document at the current selection/cursor position.
                targetDocument.replaceRange( textStorageCache, replacementRange.from, replacementRange.to );
                console.log( `[Clipboard] Paste operation executed. Inserted ${textStorageCache.length} characters.` ); // Added logging
            } else {
                console.info( "[Clipboard] Paste requested, but buffer is empty. Nothing to insert." ); // Informative message
            }
        }
    }; // End of handleTextTransfer function

    // --- Public API Exposure ---

    // Define the public function for cutting text.
    this.performCutAction = function() {
        this.handleTextTransfer( true ); // Delegate to the core function, indicating a cut.
    };

    // Define the public function for pasting text.
    this.performPasteAction = function() {
        this.handleTextTransfer( false ); // Delegate to the core function, indicating a paste.
    };

    // Export the public methods so other modules can access them.
    // This is crucial for the module's functionality to be exposed.
    moduleExports.cut = this.performCutAction; // Map internal function to external API name 'cut'.
    moduleExports.paste = this.performPasteAction; // Map internal function to external API name 'paste'.

} ); // End of module definition