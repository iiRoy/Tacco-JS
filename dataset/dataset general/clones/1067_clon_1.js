setup_filecollector   =    function ( $ , wrapperElementId , uploadedWidgetHtmlName , sendbutton_selector , doSubmitLock )
{

  /*
   *******************************************************************************
   * This function sets up a file collection mechanism within a web page.
   * It relies on jQuery for DOM manipulation and event handling.
   *
   * Parameters:
   * $                       : The jQuery object, often aliased as '$'.
   * wrapperElementId        : The ID of the HTML element that wraps the file links.
   * uploadedWidgetHtmlName  : The name attribute for the hidden input fields that will
   *                           store the IDs of the uploaded files. This is typically
   *                           used for server-side processing (e.g., Django forms).
   * sendbutton_selector     : A CSS selector for the button that triggers the form
   *                           submission. This button's click event is intercepted.
   * doSubmitLock            : A boolean flag. If true, the submit button will be
   *                           locked (submission prevented) if an upload is in progress.
   *******************************************************************************
  */


    // Ensure the DOM is fully loaded before executing the script.
    $( document ) . ready ( function ( )
    {


        // Helper function to gather file IDs from the DOM.
        function collectfiles ( )
        {
            // Initialize an empty string to build up hidden input HTML.
            var files_inputs    =    '' ;


            // Iterate over each element with class 'filelink' inside the wrapper.
            // For each file link, create a hidden input field.
            $( '#' + wrapperElementId + ' .filelink' ) . each ( function ( i , el )
            {
                // The value of the hidden input is the ID of the file link element.
                // The name attribute is constructed using the provided widget name.
                files_inputs += '<input type="hidden" value="' + $( el ) . attr ( 'id' ) + '" name="' + uploadedWidgetHtmlName + '[]"/>' ;
            } ) ;


            // Append all generated hidden input fields to a designated container.
            $( '#' + wrapperElementId + " #hidden_container" ) . append ( files_inputs ) ;
        } ; // End of collectfiles function.



        // Attach a click event handler to the specified send button.
        $( sendbutton_selector ) . click ( function ( e )
        {

            // Check if the submit lock mechanism is enabled.
            if ( doSubmitLock )
            {
                    // Determine if any file upload is currently active/visible.
                    var isUploading    =    $( '#' + wrapperElementId + " .fileupload-progressbar" ) . is ( ":visible" ) ;

                    // If an upload is in progress, prevent the form submission.
                    if ( isUploading )
                    {
                        e . preventDefault ( ) ; // Stop the default submit action.
                    }
                    // Otherwise, if no upload is active, proceed to collect file IDs.
                    else
                    {
                        collectfiles ( ) ; // Gather the file IDs.
                    }
            }
            // If the submit lock is not enabled, always collect files before submission.
            else
            {
                collectfiles ( ) ; // Just collect files, no upload check needed.
            }

        } ) ; // End of click event handler.

    } ) ; // End of document.ready.

} // End of setup_filecollector function definition.