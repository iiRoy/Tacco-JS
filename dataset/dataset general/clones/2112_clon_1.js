/*
 * jQuery Plugin: rememberState
 * Version: 1.4.1
 * Description: This plugin utilizes localStorage to retain form input values
 *              across sessions, ensuring data persistence until explicitly
 *              cleared or submitted. It provides mechanisms for restoring
 *              previously entered information and handling various form elements.
 *
 * Usage Example: $("form").rememberState("my_unique_form_id");
 *
 * Notes:
 *   - To remove stored data for a form, trigger the 'reset_state' event:
 *     $("form").trigger("reset_state");
 *   - To manually restore state, call: $("form").rememberState("restoreState");
 */
( function ( $ )
{
  // Early exit if the browser lacks localStorage or JSON support.
  // These are fundamental requirements for the plugin's operation.
  if ( ! window . localStorage || ! window . JSON )
  {
    // If console logging is available, inform the developer about missing features.
    if ( console && console . log )
    {
      // Provide guidance for localStorage polyfill if it's absent.
      ! window . localStorage && console . log ( "ERROR: you browser does not support" +
                                                 " localStorage (use this polyfill https://gist.github.com/350433)" ) ;
      // Provide guidance for JSON polyfill if it's absent.
      ! window . JSON && console . log ( "ERROR: you browser does not support" +
                                         " JSON (use this polyfill http://bestiejs.github.com/json3/)" ) ;
    }
    // Return a no-op function to prevent subsequent errors from plugin calls.
    return $ . fn . rememberState = function ( ) { return this ; } ;
  }


  // Main configuration and methods for the rememberState plugin.
  var remember_state =
  {
    name : "rememberState" , // The identifier for this plugin.

    clearOnSubmit : true , // Determines if stored data should be cleared on form submission.

    // Private method to generate the default HTML structure for the restore notice.
    _defaultNoticeDialog : function ( )
    {
      return $ ( "<p />" , { "class" : "remember_state" } )
               . html ( 'Do you want to <a href="#">restore your previously entered info</a>?' ) ;
    } ,

    noticeDialog : null , // Reference to the jQuery object representing the notice dialog.
    noticeConfirmSelector : "a" , // Selector for the element that triggers state restoration.
    noticeCancelSelector : "" , // Selector for the element that cancels the notice (currently unused).
    ignore : null , // An array of input 'name' attributes to exclude from saving.
    noticeSelector : ".remember_state" , // The class selector for the notice dialog.
    use_ids : false , // Flag to indicate a preference for using form IDs as storage keys.
    objName : false , // The unique key used to store data in localStorage for the current form.

    // Method to restore form field values from stored data.
    restoreState : function ( e )
    {
      var data = JSON . parse ( localStorage . getItem ( this . objName ) ) , // Retrieve and parse stored data.
          $f = this . $el , // The jQuery object representing the form.
          $e ; // Temporary variable for the current form element.

      // Iterate over each stored data entry.
      for ( var i in data )
      {
        $e = $f . find ( "[name=\"" + data [ i ] . name + "\"]" ) ; // Find the corresponding form element.

        // Handle radio buttons: check the one with the matching value.
        if ( $e . is ( ":radio" ) )
        {
          $e . filter ( "[value=\"" + data [ i ] . value + "\"]" ) . prop ( "checked" , true ) ;
        }
        // Handle checkboxes: check if the stored value is truthy.
        else if ( $e . is ( ":checkbox" ) && data [ i ] . value )
        {
          $e . prop ( "checked" , true ) ;
        }
        // Handle select elements: select the option with the matching value.
        else if ( $e . is ( "select" ) )
        {
          $e . find ( "[value=\"" + data [ i ] . value + "\"]" ) . prop ( "selected" , true ) ;
        }
        // Handle other input types (text, textarea, number, etc.): set their value.
        else
        {
          $e . val ( data [ i ] . value ) ;
        }
        $e . change ( ) ; // Trigger the change event on the element.
      }
      this . noticeDialog . remove ( ) ; // Remove the notice dialog from the DOM.
      // Prevent the default action if an event object is provided and has preventDefault.
      e && e . preventDefault && e . preventDefault ( ) ;
    } ,

    // Method to cancel and dismiss the restore notice.
    cancelNotice : function ( e )
    {
      e . preventDefault ( ) ; // Stop any default event behavior (e.g., following a link).
      this . noticeDialog . remove ( ) ; // Remove the notice dialog.
    } ,

    // Determines the storage key (objName) if multiple forms are present.
    chooseStorageProp : function ( )
    {
      // If the selector matched more than one form, attempt to use the form's ID.
      if ( this . $el . length > 1 )
      {
        if ( console && console . warn )
        {
          console . warn ( "WARNING: Cannot process more than one form with the same" +
                           " object. Attempting to use form IDs instead." ) ;
        }
        this . objName = this . $el . attr ( "id" ) ; // Assign the form's ID as the objName.
      }
    } ,

    // Logs an error if a suitable ID or object name for storage cannot be determined.
    errorNoID : function ( )
    {
      if ( console && console . log )
      {
        console . log ( "ERROR: No form ID or object name. Add an ID or pass" +
                        " in an object name" ) ;
      }
    } ,

    // Saves the current state of the form fields to localStorage.
    saveState : function ( e )
    {
      var instance = e . data . instance ; // Retrieve the plugin instance from the event data.
      var values = instance . $el . serializeArray ( ) ; // Get an array of form input name/value pairs.

      // Manually handle 'datetime-local' inputs as jQuery's serializeArray might not support them fully.
      instance . $el . find ( "input[type='datetime-local']" ) . each ( function ( )
      {
        var $i = $ ( this ) ;
        values . push ( { name : $i . attr ( "name" ) , value : $i . val ( ) } ) ; // Add to the values array.
      } ) ;

      values = instance . removeIgnored ( values ) ; // Filter out any fields marked to be ignored.
      // Store the values in localStorage only if there are values to save.
      values . length && internals . setObject ( instance . objName , values ) ;
    } ,

    // Public method to trigger the saving of the form's current state.
    save : function ( )
    {
      var instance = this ;
      // If 'this' is not the plugin instance (e.g., called directly on a jQuery object), retrieve it.
      if ( ! this . saveState )
      {
        instance = this . data ( remember_state . name ) ;
      }
      instance . saveState ( { data : { instance : instance } } ) ; // Call the saveState method.
    } ,

    // Filters out form fields that are explicitly configured to be ignored.
    removeIgnored : function ( values )
    {
      var ignore = this . ignore ;
      if ( ! ignore ) { return values ; } // If no ignore list, return all values.

      $ . each ( values , function ( i , input )
      {
        // If an input's name is in the ignore list, mark it for removal.
        if ( $ . inArray ( input . name , ignore ) !== -1 )
        {
          values [ i ] = false ;
        }
      } ) ;
      // Use jQuery.grep to create a new array without the marked (false) entries.
      values = $ . grep ( values , function ( val ) { return val ; } ) ;
      return values ; // Return the filtered array of values.
    } ,

    // Binds event handlers to the notice dialog for restoration or cancellation.
    bindNoticeDialog : function ( )
    {
      // If the noticeDialog is not a valid jQuery object or doesn't exist, create the default one.
      if ( ! this . noticeDialog || ! this . noticeDialog . length || ! this . noticeDialog . jquery )
      {
        this . noticeDialog = this . _defaultNoticeDialog ( ) ;
      }
      // Bind a click event to the confirm selector within the notice dialog to restore state.
      this . noticeDialog . on ( "click." + this . name , this . noticeConfirmSelector , $ . proxy ( this . restoreState , this ) ) ;
      // Bind a click event to the cancel selector within the notice dialog to dismiss it.
      this . noticeDialog . on ( "click." + this . name , this . noticeCancelSelector , $ . proxy ( this . cancelNotice , this ) ) ;
    } ,

    // Sets the unique name (objName) used for localStorage.
    setName : function ( )
    {
      // Prioritize an existing objName, otherwise try to use the form's ID attribute.
      this . objName = this . objName || this . $el . attr ( "id" ) ;
      // If still no objName, log an error.
      if ( ! this . objName ) { this . errorNoID ( ) ; }
    } ,

    // Binds events related to form submission and resetting to manage stored state.
    bindResetEvents : function ( )
    {
      var instance = this ; // Cache 'this' for use in event handlers.

      // If clearOnSubmit is enabled, bind to the form's submit event.
      if ( this . clearOnSubmit )
      {
        this . $el . bind ( "submit." + this . name , function ( )
        {
          $ ( this ) . trigger ( "reset_state" ) ; // Trigger custom reset event to clear storage.
          $ ( window ) . unbind ( "unload." + instance . name ) ; // Prevent saving on unload after submit.
        } ) ;
      }

      // Bind a custom 'reset_state' event to remove the item from localStorage.
      this . $el . bind ( "reset_state." + this . name , function ( )
      {
        localStorage . removeItem ( instance . objName ) ;
      } ) ;
      // Bind click events for any reset buttons within the form.
      this . $el . find ( ":reset" ) . bind ( "click." + this . name , function ( )
      {
        $ ( this ) . closest ( "form" ) . trigger ( "reset_state" ) ; // Trigger custom reset on the parent form.
      } ) ;
    } ,

    // Creates or shows the notice dialog if there's stored data available for restoration.
    createNoticeDialog : function ( )
    {
      // Check if there is data stored in localStorage for this form.
      if ( localStorage [ this . objName ] )
      {
        // If the noticeDialog is a valid jQuery object, prepend it to the form and show it.
        if ( this . noticeDialog . length && this . noticeDialog . jquery )
        {
          this . noticeDialog . prependTo ( this . $el ) . show ( ) ;
        }
        // Otherwise, assume the notice is already in the DOM and simply show it.
        else
        {
          this . $el . find ( this . noticeSelector ) . show ( ) ;
        }
      }
    } ,

    // Destroys the plugin instance and optionally clears its data from localStorage.
    destroy : function ( destroy_local_storage )
    {
      var namespace = "." + this . name ; // Define the event namespace for easy unbinding.
      this . $el . unbind ( namespace ) . find ( ":reset" ) . unbind ( namespace ) ; // Unbind all namespaced events from the form and its reset buttons.
      $ ( window ) . unbind ( namespace ) ; // Unbind the namespaced unload event from the window.
      // If 'destroy_local_storage' is true, remove the data from localStorage.
      destroy_local_storage && localStorage . removeItem ( this . objName ) ;
    } ,

    // Initializes the plugin instance for a given form element.
    init : function ( )
    {
      this . bindNoticeDialog ( ) ; // Set up the restore/cancel notice.
      this . setName ( ) ; // Determine the unique key for localStorage.

      // If a valid object name could not be determined, abort initialization.
      if ( ! this . objName ) { return ; }

      this . bindResetEvents ( ) ; // Attach form submission and reset event handlers.
      this . createNoticeDialog ( ) ; // Display the restore notice if data exists.

      // Bind to the window's 'unload' event to save form state before the page closes or navigates.
      $ ( window ) . bind ( "unload." + this . name , { instance : this } , this . saveState ) ;
    }
  } ;

  // Internal utility functions for localStorage interaction and plugin integration with jQuery.
  var internals =
  {
    // Helper to store an object in localStorage, stringifying it first.
    setObject : function ( key , value ) { localStorage [ key ] = JSON . stringify ( value ) ; } ,
    // Helper to retrieve and parse an object from localStorage.
    getObject : function ( key ) { return JSON . parse ( localStorage [ key ] ) ; } ,

    // Factory method to integrate the plugin's functionality into jQuery's prototype.
    createPlugin : function ( plugin )
    {
      $ . fn [ plugin . name ] = function ( opts )
      {
        var $els = this , // The jQuery collection of elements the plugin was called on.
            method = $ . isPlainObject ( opts ) || ! opts ? "" : opts , // Determine if 'opts' is a method name or configuration object.
            args = arguments ; // All arguments passed to the plugin call.

        // If a method name is provided and that method exists in the plugin object.
        if ( method && plugin [ method ] )
        {
          $els . each ( function ( i )
          {
            // Apply the method to each element's stored plugin instance.
            plugin [ method ] . apply ( $els . eq ( i ) . data ( plugin . name ) ,
                                       Array . prototype . slice . call ( args , 1 ) ) ;
          } ) ;
        }
        // If no method name is provided (indicating an initialization call).
        else if ( ! method )
        {
          $els . each ( function ( i )
          {
            // Create a new plugin instance, extending default settings with provided options.
            var plugin_instance = $ . extend ( true , {
              $el : $els . eq ( i ) // Assign the current element.
            } , plugin , opts ) ;
            $els . eq ( i ) . data ( plugin . name , plugin_instance ) ; // Store the instance on the element's data.
            plugin_instance . init ( ) ; // Initialize the new plugin instance.
          } ) ;
        }
        // If an unknown method name was provided, throw an error.
        else
        {
          $ . error ( 'Method ' + method + ' does not exist on jQuery.' + plugin . name ) ;
        }
        return $els ; // Return the jQuery collection for chaining.
      } ;
    }
  } ;

  // Execute the plugin creation process, making 'rememberState' available as a jQuery method.
  internals . createPlugin ( remember_state ) ;

} ) ( jQuery ) ; // Pass jQuery into the immediately invoked function expression.