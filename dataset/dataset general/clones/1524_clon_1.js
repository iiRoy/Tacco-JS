// This file defines the 'prefPanePlayer' object for managing external media player preferences.
// It relies on Mozilla's XPCOM components for file system interaction.

var Cc  =  Components.classes; // Components.classes provides access to XPCOM factories.
var Ci = Components.interfaces ; // Components.interfaces provides access to XPCOM interfaces.


var prefPanePlayer = { // Main object to handle user interface interactions for external player settings.

  /*
   * This method is responsible for updating the UI display based on the current
   * preference values for external video or SWF players.
   *
   * @param {string} type - Specifies the type of player: 'video' or 'swf'.
   *                        Any other value will cause the function to exit early.
   */
  displayPlayer : function ( type )
  {
    // Validate the input type to ensure it's either "video" or "swf".
    if ( type !== "video" && type !== "swf" )
    {
      return ; // Exit if the type is not recognized.
    }

    // Retrieve references to relevant DOM elements using their IDs.
    var playerPref     = document.getElementById ( "pref-external_" + type + "_player" ) ;
    var playerPathPref = document.getElementById ( "pref-external_" + type + "_player_path" ) ;
    var playerPath     = document.getElementById ( "external_" + type + "_player_path" ) ;

    // Check if the external player (either video or SWF) is enabled in preferences.
    if ( playerPref.value )
    {
      // If the player is enabled, check if a path has been set.
      if ( playerPathPref.value )
      {
        // If a path exists, set it to the file field for display.
        playerPath.file = playerPathPref.value ;
      }
    }
    else
    {
      /*
       * If the external player is not enabled, we should clear the file field
       * and its associated label to prevent displaying stale information.
       */
      playerPath.file  =  null ; // Clear the file path.
      playerPath.label = '' ; // Clear the label text.
    }
    return undefined ; // Explicitly return undefined, though simply `return;` would have a similar effect.
  } , // End of displayPlayer function.


  /*
   * Initiates a file picker dialog to allow the user to select an executable
   * for either the external video player or the external SWF player.
   *
   * @param {string} type - The type of player to configure: 'video' or 'swf'.
   *                        Only these types are supported.
   */
  choosePlayer : function ( type )
  {
    // Ensure the input 'type' is valid before proceeding.
    if ( type !== "video" && type !== "swf" )
    {
      return ; // Abort if the type is invalid.
    }

    // Get references to the preference elements.
    var playerPref     = document.getElementById ( "pref-external_" + type + "_player" ) ;
    var playerPathPref = document.getElementById ( "pref-external_" + type + "_player_path" ) ;

    // Create an instance of nsIFilePicker, a Mozilla interface for file selection.
    var filePicker = Cc [ "@mozilla.org/filepicker;1" ] . createInstance ( Ci.nsIFilePicker ) ;

    // Initialize the file picker with the parent window, a title from strings bundle, and a mode (null for open).
    filePicker.init ( window, document.getElementById ( 'nicofox-strings' ) . getString ( 'chooseExecutable' ) , null ) ;

    // Add a filter to show only executable applications.
    filePicker.appendFilters ( Ci.nsIFilePicker.filterApps ) ;

    // If a previous path exists, set the initial display directory of the file picker.
    if ( playerPathPref.value )
    {
      filePicker.displayDirectory = playerPathPref.value.parent ;
    }

    // Show the file picker dialog and check the user's action.
    if ( filePicker.show ( ) == Ci.nsIFilePicker.returnOK )
    {
      // If the user selected a file and clicked OK, update the preference path.
      playerPathPref.value = filePicker.file ;

      /*
       * If the external player preference was not already enabled,
       * enable it automatically after a path has been chosen.
       */
      if ( ! playerPref.value )
      {
        playerPref.value = true ; // Set the player as enabled.
      }
      // Note: The UI update (displayPlayer call) is expected to happen externally
      // after this function completes, or through an observer.
      // This function only updates the preference values.
    }
  } // End of choosePlayer function.

} ; // End of prefPanePlayer object definition.