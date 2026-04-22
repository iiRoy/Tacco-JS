/*
 * This file defines the jQuery 'dropfile' plugin.
 * It enables drag-and-drop file upload functionality for selected elements.
 */
( function ( $ ) {

    // Default configuration options for the dropfile plugin.
    // These can be overridden by passing an options object to the plugin.
    var d_o = {

        // The URL endpoint for handling file uploads and retrieving file information.
        // It uses the global 'ajaxurl' variable, common in WordPress environments.
        "url" : ajaxurl + "?action=get_file_info",

        // Message displayed upon successful file selection/upload.
        "success_label" : "File which is going to be uploaded : <br/>"

    }; // End of default options object.


    /**
     *  Initializes the dropfile plugin on a set of jQuery elements.
     *
     *  @param {object} o - Optional configuration object to extend default options.
     *  @returns {jQuery} The jQuery object to maintain chainability.
     */
    $.fn.dropfile = function ( o ) {

        // Merge user-provided options with default options, if any are provided.
        if ( o ) {
            $.extend( d_o, o );
        }

        // Iterate over each selected element to apply the dropfile functionality.
        return this.each( function ( ) {

            // Object to hold references to dynamically created DOM elements.
            var elements = { };

            // Create a hidden input field to store the file path after upload.
            elements.path_input = $( '<input/>' )
                                    .attr( {
                                        type :  'hidden',
                                        class : 'dropfile_path',
                                        name :  'dropfile[path]'
                                    } )
                                    .appendTo( this );

            // Create another hidden input field to store the file type.
            elements.type_input = $( '<input/>' )
                                    .attr( {
                                        type :  'hidden',
                                        class : 'dropfile_type',
                                        name :  'dropfile[type]'
                                    } )
                                    .appendTo( this );

            // Create a paragraph element for displaying alerts (success/error messages).
            elements.alert = $( '<p/>' )
                                .hide( )
                                .appendTo( this );


            // Bind various drag-and-drop events to the current element using jQuery's .bind().
            $( this ).bind( {

                // Prevent default browser behavior when an item is dragged into the element.
                "dragenter" : function ( e ) {
                    e.preventDefault( );
                },

                // Prevent default browser behavior and add a 'hover' class when an item is dragged over the element.
                "dragover"  : function ( e ) {
                    e.preventDefault( );
                    $( this ).addClass( "hover" );
                },

                // Prevent default browser behavior and remove the 'hover' class when an item leaves the element.
                "dragleave" : function ( e ) {
                    e.preventDefault( );
                    $( this ).removeClass( "hover" );
                }

            } ); // End of jQuery event bindings.


            // Attach a native 'drop' event listener to the element.
            // This is where the actual file handling and upload process begins.
            this.addEventListener( 'drop', function ( e ) {

                e.preventDefault( ); // Prevent the browser from opening the dropped file.

                // Retrieve the list of files dropped onto the element.
                var files = e.dataTransfer.files;

                // Initiate the upload process for the first file (index 0).
                upload( files, 0, $( this ), elements );

            } ); // End of drop event listener.

        } ); // End of this.each() iteration.


        /**
         *  Handles the asynchronous file upload using XMLHttpRequest.
         *
         *  @param {FileList} files    - A FileList object containing the files to upload.
         *  @param {number}   index    - The index of the current file to be uploaded from the FileList.
         *  @param {jQuery}   area     - The jQuery object representing the drop area.
         *  @param {object}   elements - An object containing references to the plugin's DOM elements.
         */
        function upload ( files, index, area, elements ) {

            var file = files[ index ]; // Get the current file from the FileList.
            var xhr  = new XMLHttpRequest( ); // Create a new XMLHttpRequest object for AJAX.

            area.removeClass( "hover" ); // Remove the 'hover' class from the drop area.

            // Define the callback function to be executed when the ready state of the XHR changes.
            xhr.onreadystatechange = function ( ) {

                // Check if the request is complete (readyState 4) and successful (status 200).
                if ( xhr.readyState === 4 && xhr.status === 200 )
                {
                    // Parse the JSON response from the server.
                    var o = JSON.parse( xhr.responseText );

                    // Check if the server response indicates an error.
                    if ( o.error ) {
                        elements.alert
                                .text( o.error )
                                .removeClass( "success" )
                                .addClass( "error" )
                                .show( );
                        return false; // Stop further processing if an error occurred.
                    }

                    // Update the hidden input fields with the file path and type.
                    elements.path_input.val( o.file_path );
                    elements.type_input.val( file.type );

                    // Display a success message in the alert area.
                    elements.alert
                            .html( d_o.success_label + file.name )
                            .removeClass( "error" )
                            .addClass( "success" )
                            .show( );
                }

            }; // End of onreadystatechange handler.

            // Configure and send the XMLHttpRequest.
            xhr.open( "post", d_o.url, true ); // Open a POST request to the configured URL asynchronously.

            // Set request headers for file upload.
            xhr.setRequestHeader( "content-type", "multipart/form-data" );
            xhr.setRequestHeader( "x-file-type",  file.type             );
            xhr.setRequestHeader( "x-file-size",  file.size             );
            xhr.setRequestHeader( "x-file-name",  file.name             );

            xhr.send( file ); // Send the file data as the request body.

        } // End of upload function.

    }; // End of $.fn.dropfile plugin definition.

} ) ( jQuery ); // IIFE closure and jQuery argument passing.
/*
 * End of the jQuery dropfile plugin file.
 */