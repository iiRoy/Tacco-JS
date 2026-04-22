goog.require ( 'goog.dom' ); // Core DOM utilities required for element manipulation
goog.require ( 'goog.editor.Command' ); // Defines various editor commands
goog.require ( 'goog.editor.Field' ); // The main editable field component
goog.require ( 'goog.editor.plugins.BasicTextFormatter' ); // Plugin for basic text formatting (bold, italic, underline)
goog.require ( 'goog.editor.plugins.EnterHandler' ); // Handles the behavior of the Enter key
goog.require ( 'goog.editor.plugins.HeaderFormatter' ); // Plugin for applying header styles
goog.require ( 'goog.editor.plugins.ListTabHandler' ); // Handles tab key behavior in lists
goog.require ( 'goog.editor.plugins.LoremIpsum' ); // Placeholder text plugin
goog.require ( 'goog.editor.plugins.RemoveFormatting' ); // Plugin to remove formatting
goog.require ( 'goog.editor.plugins.SpacesTabHandler' ); // Handles tab key behavior for spaces
goog.require ( 'goog.editor.plugins.UndoRedo' ); // Undo/Redo functionality
goog.require ( 'goog.ui.editor.DefaultToolbar' ); // Standard toolbar creation utility
goog.require ( 'goog.ui.editor.ToolbarController' ); // Controller to link toolbar and editor field


/*
 * Global application namespace initialization.
 * Ensures 'myapp' object exists on the window object.
 */
window [ "myapp" ] = {};


/**
 * Initializes a new rich text editor instance.
 * @param {string} textbox The ID of the textarea element to be replaced by the editor.
 * @param {string} toolbar The ID of the div element where the toolbar should be rendered.
 * @param {string} editor_value_field The ID of an input/textarea to display the editor's content.
 */
window [ "myapp" ] [ "addEditor" ] = function ( textbox, toolbar, editor_value_field )
{

    // Step 1: Create an instance of the editable field.
    // This transforms the target textbox into a rich text editor.
    var myField = new goog.editor.Field ( textbox );


    // Step 2: Register all desired editing plugins with the field.
    // These plugins provide the core functionality of the editor.

    myField . registerPlugin ( new goog.editor.plugins.BasicTextFormatter () );
    myField . registerPlugin ( new goog.editor.plugins.RemoveFormatting () ); // For clearing styles
    myField . registerPlugin ( new goog.editor.plugins.UndoRedo () ); // Standard undo/redo actions

    myField . registerPlugin ( new goog.editor.plugins.ListTabHandler () );
    myField . registerPlugin ( new goog.editor.plugins.SpacesTabHandler () );
    myField . registerPlugin ( new goog.editor.plugins.EnterHandler () ); // Manages new line behavior

    myField . registerPlugin ( new goog.editor.plugins.HeaderFormatter () ); // For H1, H2, etc.

    // A placeholder text plugin, useful for initial editor state.
    myField . registerPlugin ( new goog.editor.plugins.LoremIpsum (
        'Click here to edit'
    ) );


    // Step 3: Define the set of buttons to be included in the toolbar.
    // Using predefined commands from goog.editor.Command for standard actions.
    var buttons = [

        goog.editor.Command.BOLD,
        goog.editor.Command.ITALIC,
        goog.editor.Command.UNDERLINE,

        goog.editor.Command.FONT_COLOR,
        goog.editor.Command.BACKGROUND_COLOR,

        goog.editor.Command.FONT_FACE,
        goog.editor.Command.FONT_SIZE,

        goog.editor.Command.UNDO, // Undo last action
        goog.editor.Command.REDO, // Redo last undone action

        goog.editor.Command.UNORDERED_LIST, // Bullet points
        goog.editor.Command.ORDERED_LIST, // Numbered lists

        goog.editor.Command.INDENT,
        goog.editor.Command.OUTDENT,

        goog.editor.Command.JUSTIFY_LEFT,
        goog.editor.Command.JUSTIFY_CENTER,
        goog.editor.Command.JUSTIFY_RIGHT,

        goog.editor.Command.SUBSCRIPT,
        goog.editor.Command.SUPERSCRIPT,

        goog.editor.Command.STRIKE_THROUGH,
        goog.editor.Command.REMOVE_FORMAT // Remove all applied formatting
    ];


    // Step 4: Create the toolbar using the specified buttons and target element.
    var myToolbar = goog.ui.editor.DefaultToolbar.makeToolbar ( buttons, goog.dom.$ ( toolbar ) );


    // Step 5: Instantiate a ToolbarController to link the editor field and the toolbar.
    // This controller manages the interaction between the two components.
    var myToolbarController = new goog.ui.editor.ToolbarController ( myField, myToolbar );


    // Step 6: Attach an event listener to the editor field.
    // This example listens for delayed changes to update an external display field.
    goog.events.listen ( myField, goog.editor.Field.EventType.DELAYEDCHANGE, function ()
    {
        // Update the value of the target display field with the editor's clean content.
        goog.dom.$ ( editor_value_field ) . value = myField . getCleanContents ();
    } );


    // Step 7: Make the editor field editable, rendering it on the page.
    myField . makeEditable ();

};