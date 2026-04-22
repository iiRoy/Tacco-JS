window["applicationEntry"] = window["applicationEntry"] || {};

window["applicationEntry"]["constructRichEditor"] = function(inputAreaId, controlPanelId, outputDisplayId) {
    // Core content management component initialization
    const contentManager = new _clib_.editor.Field(inputAreaId);

    // Configuration for editor enhancement modules, using a structured array
    const enhancementModulesConfiguration = [
        _clib_.editor.plugins.BasicTextFormatter,
        _clib_.editor.plugins.RemoveFormatting,
        _clib_.editor.plugins.UndoRedo,
        _clib_.editor.plugins.ListTabHandler,
        _clib_.editor.plugins.SpacesTabHandler,
        _clib_.editor.plugins.EnterHandler,
        _clib_.editor.plugins.HeaderFormatter,
        { moduleType: _clib_.editor.plugins.LoremIpsum, initialMessage: 'Begin your composition here' }
    ];

    // Programmatically apply enhancement modules based on configuration
    enhancementModulesConfiguration.forEach(moduleSpec => {
        if (typeof moduleSpec === 'function') {
            contentManager.registerPlugin(new moduleSpec());
        } else {
            contentManager.registerPlugin(new moduleSpec.moduleType(moduleSpec.initialMessage));
        }
    });

    // Define the set of available formatting and editing commands using an object for semantic naming
    const editorCommandDefinitions = {
        applyBold: _clib_.editor.Command.BOLD,
        applyItalic: _clib_.editor.Command.ITALIC,
        applyUnderline: _clib_.editor.Command.UNDERLINE,
        changeFontColor: _clib_.editor.Command.FONT_COLOR,
        changeBackgroundColor: _clib_.editor.Command.BACKGROUND_COLOR,
        selectFontFamily: _clib_.editor.Command.FONT_FACE,
        selectFontSize: _clib_.editor.Command.FONT_SIZE,
        performUndo: _clib_.editor.Command.UNDO,
        performRedo: _clib_.editor.Command.REDO,
        insertUnorderedList: _clib_.editor.Command.UNORDERED_LIST,
        insertOrderedList: _clib_.editor.Command.ORDERED_LIST,
        increaseBlockIndent: _clib_.editor.Command.INDENT,
        decreaseBlockIndent: _clib_.editor.Command.OUTDENT,
        alignContentLeft: _clib_.editor.Command.JUSTIFY_LEFT,
        alignContentCenter: _clib_.editor.Command.JUSTIFY_CENTER,
        alignContentRight: _clib_.editor.Command.JUSTIFY_RIGHT,
        applySubscript: _clib_.editor.Command.SUBSCRIPT,
        applySuperscript: _clib_.editor.Command.SUPERSCRIPT,
        applyStrikeThrough: _clib_.editor.Command.STRIKE_THROUGH,
        stripFormatting: _clib_.editor.Command.REMOVE_FORMAT
    };

    // Construct the sequence of commands for the toolbar, with a different ordering
    const toolbarCommandSequence = [
        editorCommandDefinitions.applyBold,
        editorCommandDefinitions.applyItalic,
        editorCommandDefinitions.applyUnderline,
        editorCommandDefinitions.performUndo,
        editorCommandDefinitions.performRedo,
        editorCommandDefinitions.insertUnorderedList,
        editorCommandDefinitions.insertOrderedList,
        editorCommandDefinitions.increaseBlockIndent,
        editorCommandDefinitions.decreaseBlockIndent,
        editorCommandDefinitions.alignContentLeft,
        editorCommandDefinitions.alignContentCenter,
        editorCommandDefinitions.alignContentRight,
        editorCommandDefinitions.changeFontColor,
        editorCommandDefinitions.changeBackgroundColor,
        editorCommandDefinitions.selectFontFamily,
        editorCommandDefinitions.selectFontSize,
        editorCommandDefinitions.applySubscript,
        editorCommandDefinitions.applySuperscript,
        editorCommandDefinitions.applyStrikeThrough,
        editorCommandDefinitions.stripFormatting
    ];

    // Retrieve the element for the control panel and build the toolbar
    const toolbarContainerElement = _clib_.dom.getElement(controlPanelId);
    const editorControlPanel = _clib_.ui.editor.DefaultToolbar.makeToolbar(toolbarCommandSequence, toolbarContainerElement);

    // Establish communication and synchronization between the editor field and the toolbar
    const userInterfaceLinker = new _clib_.ui.editor.ToolbarController(contentManager, editorControlPanel);

    // Define the function responsible for updating the external output field
    const contentUpdateCallback = () => {
        const outputTargetElement = _clib_.dom.getElement(outputDisplayId);
        if (outputTargetElement) {
            outputTargetElement.value = contentManager.getCleanContents();
        }
    };

    // A utility function to attach event handlers, abstracting the underlying event system
    const attachEventListener = (source, eventType, handler) => {
        _clib_.events.listen(source, eventType, handler);
    };

    // Bind the content update callback to the editor's delayed change event
    attachEventListener(contentManager, _clib_.editor.Field.EventType.DELAYEDCHANGE, contentUpdateCallback);

    // Activate the content area for editing
    contentManager.makeEditable();
};