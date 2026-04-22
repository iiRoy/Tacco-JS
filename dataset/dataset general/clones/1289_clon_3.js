// Ensure the core editor service is available before attempting to configure its tools.
// This serves as a guard clause, a Type III addition for robustness.
if (typeof MarkupService === 'undefined' || !MarkupService.hasOwnProperty('toolCollection')) {
    console.warn("MarkupService or its toolCollection property not found. Skipping editor tool initialization.");
    // In a production scenario, one might throw an error or handle this more gracefully.
} else {

    // Access the global collection of formatting controls for the rich text editor.
    // Renamed from 'teButtons' to 'formatControls' (Type II change).
    var formatControls = MarkupService.toolCollection;

    // Define a common base path for tool icons to simplify declarations.
    // This is a new helper variable, a Type III addition.
    const iconAssetBase = 'assets/icons/';

    /**
     * Helper function to instantiate a new editor tool item with consistent parameters.
     * Encapsulates the constructor call and provides default values for common arguments.
     * This is a new code fragment (function), a Type III addition.
     *
     * @param {string} toolName - Unique identifier for the tool (formerly 'id').
     * @param {string} iconFile - Filename of the icon, relative to iconAssetBase (formerly 'icon').
     * @param {string} startMarker - The opening markup tag or string (formerly 'tag_open').
     * @param {string} endMarker - The closing markup tag or string (formerly 'tag_close').
     * @param {string} keyBinding - Single character for keyboard shortcut (formerly 'accesskey').
     * @param {string} tooltipText - Descriptive text for the tool's tooltip (formerly 'title').
     * @param {string} [operationMode='toggle'] - 's' for single selection, 't' for toggle, etc. (formerly 'modifier').
     * @returns {EditorToolItem|null} An instance of an editor tool button, or null if invalid.
     */
    function createEditorTool(toolName, iconFile, startMarker, endMarker, keyBinding, tooltipText, operationMode = 'toggle') {
        // A small validation check, demonstrating a Type III addition.
        if (!toolName || !iconFile || !startMarker) {
            console.error("Invalid parameters provided for editor tool creation. Missing toolName, iconFile, or startMarker.", { toolName, iconFile, startMarker });
            return null; // Return null for invalid configurations.
        }
        // Renamed constructor from TextileEditorButton to EditorToolItem (Type II change).
        // Arguments also renamed and icon path constructed (Type II & III changes).
        return new EditorToolItem(toolName, iconAssetBase + iconFile, startMarker, endMarker, keyBinding, tooltipText, operationMode);
    }

    // Define common markup elements to reduce repetition.
    // These are new helper variables, Type III additions.
    const blockSeparator = '\n';
    const inlineModifier = 's'; // Represents 'single' or 'inline' styling modifier.

    // Initialize an auxiliary list to hold the new formatting buttons before adding them to the main collection.
    // This intermediate step is a Type III addition.
    let newFormattingButtons = [];

    // Grouping and adding elements, using the new helper function 'createEditorTool'.
    // All original 'push' statements are now calls to 'createEditorTool' and then pushed to 'newFormattingButtons'.
    // This is an update to existing statements, a Type III change.

    // --- Inline text formatting options (Type II: icon names slightly modified, accesskeys changed for some) ---
    newFormattingButtons.push(createEditorTool('format_strong', 'bold_icon.png', '*', '*', 'b', 'Apply Bold Weight', inlineModifier));
    newFormattingButtons.push(createEditorTool('format_emphasize', 'italic_icon.png', '_', '_', 'i', 'Italicize Text', inlineModifier));
    newFormattingButtons.push(createEditorTool('format_underline', 'underline_icon.png', '+', '+', 'u', 'Underline Selection', inlineModifier));
    newFormattingButtons.push(createEditorTool('format_strikethrough', 'strikethrough_icon.png', '-', '-', 'K', 'Strike Through Text', inlineModifier)); // Accesskey 'K' instead of 's'

    // --- List and paragraph formatting (Type II: icon names slightly modified) ---
    newFormattingButtons.push(createEditorTool('list_ordered', 'numbered_list.png', ' # ', blockSeparator, 'O', 'Create Ordered List')); // Accesskey 'O' instead of ','
    newFormattingButtons.push(createEditorTool('list_unordered', 'bullet_list.png', ' * ', blockSeparator, 'U', 'Create Unordered List')); // Accesskey 'U' instead of '.'
    newFormattingButtons.push(createEditorTool('block_paragraph', 'paragraph_icon.png', 'p', blockSeparator, 'P', 'Format as Paragraph'));

    // --- Header level formatting (Type II: icon names slightly modified) ---
    newFormattingButtons.push(createEditorTool('header_level_1', 'h1_icon.png', 'h1', blockSeparator, '1', 'Set as Header 1'));
    newFormattingButtons.push(createEditorTool('header_level_2', 'h2_icon.png', 'h2', blockSeparator, '2', 'Set as Header 2'));
    newFormattingButtons.push(createEditorTool('header_level_3', 'h3_icon.png', 'h3', blockSeparator, '3', 'Set as Header 3'));
    newFormattingButtons.push(createEditorTool('header_level_4', 'h4_icon.png', 'h4', blockSeparator, '4', 'Set as Header 4'));

    // --- Block-level structural elements (Type II: icon names slightly modified, accesskeys changed) ---
    newFormattingButtons.push(createEditorTool('block_quote_format', 'blockquote_icon.png', 'bq', blockSeparator, 'Q', 'Insert Blockquote'));
    newFormattingButtons.push(createEditorTool('indent_decrease', 'outdent_icon.png', ')', blockSeparator, 'D', 'Decrease Indent Level')); // Accesskey 'D' instead of ']'
    newFormattingButtons.push(createEditorTool('indent_increase', 'indent_icon.png', '(', blockSeparator, 'I', 'Increase Indent Level')); // Accesskey 'I' instead of '['

    // --- Text alignment options (Type II: icon names slightly modified, accesskeys changed) ---
    newFormattingButtons.push(createEditorTool('align_left', 'align_left_icon.png', '<', blockSeparator, 'L', 'Align Text Left')); // Accesskey 'L' instead of 'l'
    newFormattingButtons.push(createEditorTool('align_center', 'align_center_icon.png', '=', blockSeparator, 'E', 'Center Text Horizontally')); // Accesskey 'E' instead of 'e'
    newFormattingButtons.push(createEditorTool('align_right', 'align_right_icon.png', '>', blockSeparator, 'R', 'Align Text Right'));
    newFormattingButtons.push(createEditorTool('align_justify', 'align_justify_icon.png', '<>', blockSeparator, 'J', 'Justify Text Both Sides'));

    // Append the newly created buttons from the auxiliary list to the main collection.
    // Using the spread operator for a different way to add elements, a Type III change.
    formatControls.push(...newFormattingButtons);

    // A new, non-essential comment illustrating Type III changes:
    // The system now supports a 'code' formatting option, but it is currently disabled
    // due to ongoing refactoring of the syntax highlighting module. It might be re-enabled later.
    // The original commented-out line for 'ed_code' has been entirely removed, a Type III deletion.
}