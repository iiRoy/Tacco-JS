//
// This JavaScript file defines the 'osxbuttons' plugin for CKEditor.
// It provides integration with native macOS color and font panels
// via a Cocoa bridge.
//
// All original identifiers, variable names, function names, and expressions
// have been strictly preserved.
// This clone primarily differs in whitespace (indentation, spacing, blank lines)
// and comments, aiming for a visually distinct, yet logically identical, representation.
//
// Version: 1.0.1
// Date:    [Current Date - e.g., 2023-10-27]
//

CKEDITOR . plugins . add ( 'osxbuttons', {

    // The main initialization function for the plugin.
    // This function is executed when the plugin is loaded by CKEditor.
    init : function ( editor )
    {


        // First, define a command to open the native macOS color panel.
        // This command will be triggered by a UI button later.
        editor . addCommand ( 'openColorPanel',
        {
            // The 'exec' function contains the logic to be performed when the command is called.
            exec : function ( editor )
            {
                // Call the `openColorPanel` method on the global `Cocoa` object.
                // `Cocoa` is assumed to be a bridge object provided by the host application.
                Cocoa . openColorPanel ( );
            }
        }
        ); // End of 'openColorPanel' command definition


        // Next, add a button to the CKEditor UI to trigger the 'openColorPanel' command.
        editor . ui . addButton ( 'OSXTextColor',
        {
            label     : 'Text Color',         // The text displayed on the button.
            command   : 'openColorPanel',     // The command associated with this button.
            className : 'cke_button_osxTextColor' // A CSS class for custom styling of the button.
        }
        ); // End of 'OSXTextColor' button definition


        // Define another command, this one for opening the native macOS font panel.
        editor . addCommand ( 'openFontPanel',
        {
            // The execution function for the 'openFontPanel' command.
            exec : function ( editor )
            {
                // Call the `openFontPanel` method on the `Cocoa` bridge object.
                Cocoa . openFontPanel ( );
            }
        }
        ); // End of 'openFontPanel' command definition


        // Finally, add a button to the CKEditor UI that will execute the 'openFontPanel' command.
        editor . ui . addButton ( 'OSXFont',
        {
            label     : 'Font',               // Label for the font selection button.
            command   : 'openFontPanel',      // Command linked to this button.
            className : 'cke_button_osxFont'  // CSS class for the button.
        }
        ); // End of 'OSXFont' button definition


    } // End of the 'init' function for the 'osxbuttons' plugin.

} ); // End of the CKEDITOR.plugins.add call for 'osxbuttons'.