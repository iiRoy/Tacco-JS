// This file defines the main module for Static Preview settings.
// It manages the display and saving of user preferences for the extension.
define ( function ( require , exports )
{

    // --- Module Dependencies ---
    // Load necessary modules using brackets.getModule or direct require.

    var _                 =   brackets . getModule ( "thirdparty/lodash" ) ; /* Lodash utility library */
    var DefaultDialogs    =   brackets . getModule ( "widgets/DefaultDialogs" ) ; // Standard dialog definitions.
    var Dialogs           =   brackets . getModule ( "widgets/Dialogs" ) ; /* The core dialog manager */
    var DialogTemplate    =   require ( "text!settings/dialog-settings.html" ) ; // HTML template for the settings dialog.
    var ExtensionStrings  =   require ( "i18n!nls/strings" ) ; /* Localized strings for the extension */
    var ProjectManager    =   brackets . getModule ( "project/ProjectManager" ) ; // Manages project-related information.
    var ServerManager     =   require ( "server/ServerManager" ) ; // Manages the static preview server instance.
    var Settings          =   brackets . getModule ( "settings/Settings" ) ; /* User settings data model */
    var SettingsManager   =   brackets . getModule ( "settings/SettingsManager" ) ; // Handles persistence of settings.
    var Strings           =   brackets . getModule ( "strings" ) ; // Brackets core localized strings.


    // --- Internal Variables and Utilities ---

    /**
     * @private
     * Compiled template function for rendering the settings dialog HTML.
     * Utilizes Lodash's templating engine.
     *
     * @type { Function } A function that takes a context object and returns HTML.
     * @param { Object } locals - Data context for the template.
     * @returns { String } Rendered HTML string.
     */
    var _renderDialogTemplate = _ . template ( DialogTemplate ) ;



    /**
     * @private
     * Prefix used for generating unique HTML element IDs within the settings dialog.
     * This helps in identifying and retrieving specific setting input fields.
     *
     * @type { String } The ID prefix.
     */
    var _selectorPrefix = "#staticpreview-setting-" ;



    /**
     * @private
     * Handles actions triggered by the settings dialog.
     * This function is called when a dialog button is clicked.
     *
     * @param { JQuery } $dlg    - The jQuery object representing the dialog's DOM element.
     * @param { String } action  - The ID of the button that was clicked, indicating the action to perform.
     */
    function _handleDialogAction ( $dlg , action )
    {

        // If the user cancelled the dialog, just exit.
        if ( action === "cancel" )
        {
            return ;
        }


        /*
         * Handle the "save-settings" action.
         * This involves iterating through all known settings and updating their values.
         */
        if ( action === "save-settings" )
        {
            Settings . each ( function ( id )
            {
                // Retrieve the value from the corresponding input field in the dialog.
                SettingsManager . set ( id ,
                                      $dlg . find ( _selectorPrefix + id ) . val ()
                                    ) ;
            } ) ;


            // If the server is currently running, prompt the user to restart it
            // for the new settings to take effect.
            if ( ServerManager . isRunning () )
            {
                _showRestartDialog () ;
            }

        } // End of "save-settings" action handling.


        // Handle the "restart-server" action.
        // This is typically triggered by a secondary dialog after saving settings.
        if ( action === "restart-server" )
        {
            ServerManager . restart () ; // Initiate server restart.
        }

    } /* End of _handleDialogAction function */



    /**
     * Displays the main settings dialog for the Static Preview extension.
     * This function constructs and shows a modal dialog allowing users to
     * configure various extension parameters.
     *
     * @public
     * @function show
     */
    function show ()
    {
        var $dlg      =   null ; /* Reference to the dialog's jQuery element */

        var dialog    =   Dialogs . showModalDialog (
              DefaultDialogs . DIALOG_ID_INFO
            , ExtensionStrings . DIALOG_SETTINGS_TITLE
            , _renderDialogTemplate ( { eachSetting : Settings . each } )
            , [
                  {
                      className : Dialogs . DIALOG_BTN_CLASS_NORMAL
                    , id        : Dialogs . DIALOG_BTN_CANCEL
                    , text      : Strings . CANCEL
                  }
                , {
                      className : Dialogs . DIALOG_BTN_CLASS_PRIMARY
                    , id        : "save-settings"
                    , text      : Strings . DONE
                  }
              ]
        ) ;

        // Get the actual DOM element of the dialog once it's rendered.
        $dlg = dialog . getElement () ;

        /*
         * Populate the settings dialog fields with current values.
         * Iterate over each defined setting.
         */
        Settings . each ( function _iterate ( id )
        {
            /**
             * @NOTE Quick hack for #26 - Special handling for the "basepath" setting.
             * The basepath might default to the project root if not explicitly set.
             */
            if ( id !== "basepath" )
            {
                // For most settings, simply get the value from SettingsManager.
                $dlg . find ( _selectorPrefix + id ) . val ( SettingsManager . get ( id ) ) ;
            }
            else
            {
                // For "basepath", use project root if no custom value is set.
                $dlg . find ( _selectorPrefix + id ) . val (
                      SettingsManager . get ( id )
                   || ProjectManager . getProjectRoot () . fullPath
                ) ;
            }
        } ) ;

        // Attach a handler to process the dialog's outcome when it closes.
        dialog . getPromise () . then ( _handleDialogAction . bind ( null , $dlg ) ) ;

    } /* End of show function */



    /**
     * @private
     * Displays a modal dialog prompting the user to restart the server.
     * This is typically shown after settings have been saved and require a server restart.
     */
    function _showRestartDialog ()
    {
        Dialogs . showModalDialog (
              DefaultDialogs . DIALOG_ID_INFO // Use a generic info dialog type.
            , ExtensionStrings . DIALOG_RESTART_TITLE // Dialog title from localized strings.
            , ExtensionStrings . DIALOG_RESTART_TEXT // Dialog message from localized strings.
            , [
                  {
                      className : Dialogs . DIALOG_BTN_CLASS_NORMAL // Standard button style.
                    , id        : Dialogs . DIALOG_BTN_CANCEL // ID for the cancel button.
                    , text      : Strings . CANCEL // Text for the cancel button.
                  }
                , {
                      className : Dialogs . DIALOG_BTN_CLASS_PRIMARY // Primary action button style.
                    , id        : "restart-server" // Custom ID for the restart action.
                    , text      : ExtensionStrings . RESTART // Text for the restart button.
                  }
              ]
        )
        . getPromise () // Get the promise associated with the dialog's closure.
        . then ( _handleDialogAction . bind ( null , null ) ) ; // Bind the action handler, passing null for $dlg as it's not needed here.

    } /* End of _showRestartDialog function */



    // --- Public API Export ---
    // Expose the `show` function as part of the module's public interface.
    exports . show = show ;

} ) ; // End of define block