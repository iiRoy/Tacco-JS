/*
 * This file contains client-side JavaScript logic for form submission and file display.
 * It uses jQuery for DOM manipulation and AJAX operations.
 */
( function ( $ ) {
  // Enforce strict mode for better error handling and cleaner code.
  'use strict'
  ;
  // Attach a click event listener to all submit buttons within forms.
  // This approach uses event delegation for efficiency.
  $( 'form' )
    . on(
      'click'
      , 'button[type=submit]'
      , function ( evt ) {

        /*
         * Capture the form element associated with the clicked button,
         * then add a 'loading' class to it.
         */
        var form = $( this.form ) . addClass( 'loading' ) ;

        // Prevent the default form submission behavior.
        evt . preventDefault( ) ;

        // Initiate an AJAX request to handle the form submission.
        $ . ajax(
          form . prop( 'action' )
          , {
            // Data to be sent with the request; serializes textarea content.
            data : form . find( 'textarea' ) . serializeArray( )
            ,
            // Expect a JSON response from the server.
            dataType : 'json'
            ,
            // Include file inputs in the submission.
            files : form . find( ':file' )
            ,
            // Use an iframe for file uploads to prevent full page reloads.
            iframe : true
            ,
            // Prevent jQuery from processing the data, as it's handled by the iframe plugin.
            processData : false
          }
        )
          // This callback executes regardless of whether the AJAX request succeeded or failed.
          . always( function ( ) {
            // Remove the 'loading' class from the form.
            form . removeClass( 'loading' )
            ;
          } )
          // This callback executes if the AJAX request is successful.
          . done( function ( data ) {
            // Log the received data to the console for debugging purposes.
            console . log( data ) ;

            // Iterate over each file in the response data.
            $ . each( data . files , function ( idx , file ) {

              // Construct a new list item (<li>) HTML string for each file.
              $( '<li class="list-group-item">'
                + '<h4 class="list-group-item-heading"></h4>'
                + '<p class="list-group-item-text"><span class="size"></span>, <span class="mime"></span></p>'
                + '<blockquote class="list-group-item-text comment"></blockquote></li>'
              )
                // Find the h4 element and set its text to the original filename.
                . find( 'h4' ) . text( file . originalFilename ) . end( )
                // Find the span with class 'size' and set its text to the formatted file size.
                . find( '.size' ) . text( formatSize( file . size ) ) . end( )
                // Find the span with class 'mime' and set its text to the file's content type.
                . find( '.mime' ) . text( file . headers[ 'content-type' ] ) . end( )
                // Find the blockquote with class 'comment' and set its text to the data comment (or empty string if none).
                . find( '.comment' ) . text( data . comment || '' ) . end( )
                // Append the newly created list item to the element with id 'filelist'.
                . appendTo( '#filelist' )
              ;
            } ) ;

            // Clear the value of all file input fields within the form.
            form . find( ':file' ) . val( '' )
            ;
          } )
      }
    )
  ;

  /**
   * Formats a given size in bytes into a human-readable string (e.g., "10 KB", "2 MB").
   * @param {number} size - The size in bytes.
   * @returns {string} The formatted size string.
   */
  function formatSize( size ) {
    // Array of units for size conversion.
    var units = [ 'B' , 'KB' , 'MB' , 'GB' ]
      , // Initialize index for units array.
      idx = 0
    ;

    // If the size is zero or falsy, return '0 bytes' immediately.
    if ( ! size ) {
      return '0 bytes'
      ;
    }

    // Loop to convert size to the appropriate unit.
    while ( size >= 1024 ) {
      size /= 1024
      ; // Divide size by 1024.
      idx ++
      ; // Increment unit index.
    }

    // Return the formatted size, rounded to 0 decimal places, followed by the unit.
    return size . toFixed( 0 ) + ' ' + units[ idx ]
    ;
  }

} ) ( jQuery )
; // Pass jQuery object to the immediately invoked function expression (IIFE).