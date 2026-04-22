goog.require('goog.dom');
goog.require('goog.editor.Command');
goog.require('goog.editor.Field');
goog.require('goog.editor.plugins.BasicTextFormatter');
goog.require('goog.editor.plugins.EnterHandler');
goog.require('goog.editor.plugins.HeaderFormatter');
goog.require('goog.editor.plugins.ListTabHandler');
goog.require('goog.editor.plugins.LoremIpsum');
goog.require('goog.editor.plugins.RemoveFormatting');
goog.require('goog.editor.plugins.SpacesTabHandler');
goog.require('goog.editor.plugins.UndoRedo');
goog.require('goog.ui.editor.DefaultToolbar');
goog.require('goog.ui.editor.ToolbarController');
goog.require('goog.events'); // Explicitly requiring goog.events for listening

// Establish a global namespace for application-specific editor utilities.
// This ensures we don't accidentally overwrite existing global objects.
if (typeof window['richTextAppTools'] === 'undefined') {
    window['richTextAppTools'] = {};
}

/**
 * Configures and initializes a Closure Library rich text editor on a target HTML element.
 * This function handles the setup of the editable field, plugin registration,
 * toolbar creation, and content synchronization with an output element.
 *
 * @param {string} targetElementId The DOM ID of the element (e.g., a DIV or TEXTAREA)
 *   that will be transformed into the rich text editing area.
 * @param {string} toolbarContainerId The DOM ID of the container element (e.g., a DIV)
 *   where the editor's control buttons will be rendered.
 * @param {string} contentOutputFieldId The DOM ID of an input or hidden field
 *   where the clean HTML content from the editor will be continuously updated.
 * @param {string=} opt_placeholderText Optional initial text to display in the editor
 *   when it's empty, serving as a hint to the user.
 * @return {goog.editor.Field|null} The initialized editor field instance, or null if setup failed.
 */
window['richTextAppTools']['setupRichTextComponent'] = function(
    targetElementId,
    toolbarContainerId,
    contentOutputFieldId,
    opt_placeholderText
) {
    // --- Input Validation and Element Retrieval ---
    if (!targetElementId || !toolbarContainerId || !contentOutputFieldId) {
        console.error('RichTextComponent Setup Error: All element IDs (target, toolbar, output) must be provided.');
        return null;
    }

    const editorTargetNode = goog.dom.$(targetElementId);
    if (!editorTargetNode) {
        console.error('RichTextComponent Setup Error: Editor target element not found with ID:', targetElementId);
        return null;
    }

    const toolbarTargetNode = goog.dom.$(toolbarContainerId);
    if (!toolbarTargetNode) {
        console.error('RichTextComponent Setup Error: Toolbar container element not found with ID:', toolbarContainerId);
        return null;
    }

    // --- Core Editor Field Instantiation ---
    // The main editable area where content will be manipulated.
    const contentEditorInstance = new goog.editor.Field(editorTargetNode);

    // --- Plugin Registration ---
    // A collection of functionality enhancements for the editor.
    const activePlugins = [
        new goog.editor.plugins.BasicTextFormatter(),
        new goog.editor.plugins.RemoveFormatting(),
        new goog.editor.plugins.UndoRedo(),
        new goog.editor.plugins.ListTabHandler(),
        new goog.editor.plugins.SpacesTabHandler(),
        new goog.editor.plugins.EnterHandler(),
        new goog.editor.plugins.HeaderFormatter(),
        // The LoremIpsum plugin provides placeholder text, useful for initial user guidance.
        new goog.editor.plugins.LoremIpsum(opt_placeholderText || 'Enter your document content here...')
    ];

    // Register each defined plugin with the editor instance.
    activePlugins.forEach(plugin => {
        contentEditorInstance.registerPlugin(plugin);
    });

    // --- Toolbar Command Definition ---
    // Grouping editor commands logically for better organization and maintainability.
    const cmd = goog.editor.Command; // Shorter alias for command constants.

    const standardFormattingCommands = [
        cmd.BOLD,
        cmd.ITALIC,
        cmd.UNDERLINE
    ];

    const advancedFormattingCommands = [
        cmd.FONT_COLOR,
        cmd.BACKGROUND_COLOR,
        cmd.FONT_FACE,
        cmd.FONT_SIZE
    ];

    const listAndIndentationCommands = [
        cmd.UNORDERED_LIST,
        cmd.ORDERED_LIST,
        cmd.INDENT,
        cmd.OUTDENT
    ];

    const textAlignmentCommands = [
        cmd.JUSTIFY_LEFT,
        cmd.JUSTIFY_CENTER,
        cmd.JUSTIFY_RIGHT
    ];

    const historyNavigationCommands = [
        cmd.UNDO,
        cmd.REDO
    ];

    // Assemble the complete list of commands for the toolbar.
    // Note: Some less common commands (e.g., SUBSCRIPT, SUPERSCRIPT) have been omitted.
    const toolbarCommandSet = [
        ...standardFormattingCommands,
        ...advancedFormattingCommands,
        ...listAndIndentationCommands,
        ...textAlignmentCommands,
        ...historyNavigationCommands,
        cmd.REMOVE_FORMAT // Essential for clearing styles.
    ];

    // --- Toolbar Instantiation ---
    // Create the actual toolbar UI component using the defined commands.
    const visualControlPanel = goog.ui.editor.DefaultToolbar.makeToolbar(
        toolbarCommandSet,
        toolbarTargetNode
    );

    // --- Link Editor and Toolbar ---
    // The controller bridges the editor field and the toolbar, enabling interaction.
    const editorUiBridge = new goog.ui.editor.ToolbarController(
        contentEditorInstance,
        visualControlPanel
    );

    // --- Content Synchronization ---
    // Listen for changes in the editor to update an external input field.
    const delayedChangeEvent = goog.editor.Field.EventType.DELAYEDCHANGE;

    goog.events.listen(contentEditorInstance, delayedChangeEvent, function() {
        const outputElement = goog.dom.$(contentOutputFieldId);
        if (outputElement) {
            try {
                // Retrieve the clean HTML content and set it as the value of the output field.
                outputElement.value = contentEditorInstance.getCleanContents();
            } catch (error) {
                console.warn('RichTextComponent Warning: Failed to retrieve clean editor content.', error);
                outputElement.value = '[Content retrieval error]';
            }
        } else {
            console.warn('RichTextComponent Warning: Output field not found with ID:', contentOutputFieldId, 'Content will not be synced.');
        }
    });

    // --- Final Step: Make Editor Editable ---
    // Activate the editor, allowing user interaction. This should generally be the last setup step.
    contentEditorInstance.makeEditable();

    // Return the editor instance for potential external access or further customization.
    return contentEditorInstance;
};