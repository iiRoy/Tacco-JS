// This file contains JavaScript logic for the WooFramework Media Library-driven AJAX File Uploader Module.
// It was developed on 2010-11-05 and is specifically designed for integration with the WooFramework.
// The primary purpose is to manage file uploads via the WordPress Media Library interface,
// offering a customized user experience for theme options or similar administrative panels.
// This module has been adapted with minor adjustments for use within the Options Framework project.

( function ( $ ) {

  // The main object encapsulating all related functionalities for the Media Library Uploader.
  // This object, optionsframeworkMLU, provides methods for file removal,
  // custom file field rendering, and integration with WordPress's media uploader.
  optionsframeworkMLU = {

    /*
     * Method: removeFile
     * Purpose: Handles the removal of an uploaded file when the corresponding "remove" button is clicked.
     * This function relies on event delegation for dynamically added elements.
     */
    removeFile: function ( ) {

      // Attach a live click event handler to all elements with the class 'mlu_remove'.
      // 'live' is used here to ensure that handlers are bound to elements that are added to the DOM dynamically.
      $('.mlu_remove').live( 'click', function ( event ) {
        // Hide the clicked "remove" button.
        $( this ).hide( );

        // Traverse up to the parent elements to find the associated upload input field
        // and clear its value, effectively "removing" the file path.
        $(this).parents( ).parents( ).children( '.upload' ).attr( 'value', '' );

        // Slide up and hide the screenshot/preview container.
        $( this ).parents( '.screenshot' ).slideUp( );

        // If background properties are associated, hide them as well.
        // This is typically for background image settings where the image is removed.
        $( this ).parents( '.screenshot' ).siblings( '.of-background-properties' ).hide( ); // Hide related background properties.

        // Prevent the default action of the anchor tag.
        return false;
      } );

      // A specific rule to hide the delete button on the first row of a certain option group.
      // This might be for a default or predefined option that cannot be removed.
      $( 'a.delete-inline', "#option-1" ).hide( );

    }, // --- End of removeFile function logic ---

    /*
     * Method: recreateFileField
     * Purpose: Replaces standard file input fields with a custom, styled version
     *          that includes a text input for displaying the file path and an "Upload" button.
     *          This improves the visual consistency and user experience.
     */

    recreateFileField: function( ) {

      // Iterate over each input element that has the class 'file'.
      $( 'input.file' ).each( function ( ) {

        // Define the HTML for the custom upload button.
        var uploadbutton = '<input class="upload_file_button" type="button" value="Upload" />';

        // Wrap the original file input in a new div for styling and structure.
        $( this ).wrap( '<div class="file_wrap" />' );

        // Add the 'file' class and make the original input invisible (opacity: 0).
        $( this ).addClass( 'file' ).css( 'opacity', 0 ); // Set original file input to invisible.

        // Append a fake file input structure: a text input to display the path and the upload button.
        $( this ).parent( ).append(
          $( '<div class="fake_file" />' )
            .append(
              $( '<input type="text" class="upload" />' )
                .attr( 'id', $( this ).attr( 'id' ) + '_file' ) // Assign a unique ID to the fake input.
            )
            .val( $( this ).val( ) ) // Initialize fake input with current value of real input.
            .append( uploadbutton ) // Add the custom upload button.
        );

        // Bind a 'change' event to the original file input.
        // When a file is selected, update the value of the fake text input.
        $( this ).bind( 'change', function ( ) {
          $( '#' + $( this ).attr( 'id' ) + '_file' ).val( $( this ).val( ) );
        } );

        // Bind a 'mouseout' event. This might be a fallback or additional trigger
        // to ensure the fake input's value is updated, especially if the 'change' event
        // doesn't fire consistently across browsers on specific interactions.
        $( this ).bind( 'mouseout', function ( ) {
          $( '#' + $( this ).attr( 'id' ) + '_file' ).val( $( this ).val( ) );
        } );

      } );

    }, // --- End of recreateFileField method ---

    /*
     * Method: mediaUpload
     * Purpose: Integrates with the WordPress Media Uploads popup (Thickbox)
     *          to allow users to select images or files from their media library.
     *          It customizes the behavior of the media uploader and handles the return value.
     * Dependencies: Requires jQuery, WordPress Media Upload JavaScripts, and Thickbox JavaScripts.
     */

    mediaUpload: function ( ) {

      // Revert jQuery to its original state (if another library uses $).
      // This is crucial for WordPress environments where other scripts might also use $.
      jQuery.noConflict( );

      // Remove any inline styles from upload buttons to ensure consistent styling.
      $( 'input.upload_button' ).removeAttr( 'style' );

      var formfield, // Stores the ID of the input field where the selected media URL will be placed.
          formID,    // Stores the post ID or context ID for the media uploader.
          btnContent = true, // Flag or content for the button, initialized to true.
          tbframe_interval; // Variable to hold the interval ID for Thickbox frame manipulation.

      // Attach a live click event handler to all upload buttons.
      // This ensures functionality for dynamically added buttons.
      $( 'input.upload_button' ).live( "click", function ( ) {

        // Get the ID of the input field that precedes the clicked upload button.
        formfield = $( this ).prev( 'input' ).attr( 'id' );

        // Get the 'rel' attribute of the button, which typically holds the form or post ID.
        formID = $( this ).attr( 'rel' );

        // Set an interval to continuously check for the Thickbox iframe content
        // and change the "Insert into Post" button text to "Use This Image".
        // This provides a more user-friendly label for the context of a theme options panel.
        tbframe_interval = setInterval( function ( ) {
          jQuery( '#TB_iframeContent' ).contents( ).find( '.savesend .button' ).val( 'Use This Image' );
        }, 2000 ); // Check every 2 seconds.

        // Initialize a variable to hold the custom title for the Thickbox popup.
        var woo_title = '';

        // Attempt to find a heading within the same section as the upload button
        // to use as the Thickbox title, making the context clear to the user.
        if ( $( this ).parents( '.section' ).find( '.heading' ) ) {
          woo_title = $( this ).parents( '.section' ).find( '.heading' ).text( );
        } // End of conditional check for heading.

        // Display the Thickbox media uploader.
        // The URL includes the post ID and specifies it's an iframe.
        tb_show( woo_title, 'media-upload.php?post_id=' + formID + '&TB_iframe=1' );

        // Prevent the default action of the button.
        return false;
      } );

      // Preserve the original send_to_editor function.
      // This is critical because WordPress's media uploader uses this function,
      // and we need to temporarily override it for our custom handling.
      window.original_send_to_editor = window.send_to_editor;

      // Override the send_to_editor function with our custom logic.
      window.send_to_editor = function ( html ) {

        // Proceed only if a formfield has been set (meaning our custom uploader initiated the Thickbox).
        if ( formfield ) {

          // Clear the interval that was changing the "Use this Button" text.
          // This prevents it from continuing to run after the media item is selected.
          clearInterval( tbframe_interval );

          // Determine the URL of the selected media item.
          // First, check if the HTML content contains an image.
          if ( $( html ).html( html ).find( 'img' ).length > 0 ) {

            // If an image is found, extract its 'src' attribute.
            // This captures the URL to the image at the size selected in the media library.
            itemurl = $( html ).html( html ).find( 'img' ).attr( 'src' );

          } else {

            // If it's not an image, it's likely another type of file (PDF, audio, video, etc.).
            // jQuery might strip XHTML, so parse the HTML string manually to get the URL.
            var htmlBits = html.split( "'" ); // Split the string by single quotes.
            itemurl = htmlBits[ 1 ]; // The URL is typically the second element in this split.

            var itemtitle = htmlBits[ 2 ]; // Attempt to get a title, if available.

            // Clean up the title string by removing HTML tags.
            itemtitle = itemtitle.replace( '>', '' );
            itemtitle = itemtitle.replace( '</a>', '' );

          } // End of image vs. file URL determination.

          // Define regular expressions to categorize the file type based on its extension.
          var image = /(^.*\.jpg|jpeg|png|gif|ico*)/gi; // Regex for common image file extensions.
          var document = /(^.*\.pdf|doc|docx|ppt|pptx|odt*)/gi; // Regex for common document file extensions.
          var audio = /(^.*\.mp3|m4a|ogg|wav*)/gi; // Regex for common audio file extensions.
          var video = /(^.*\.mp4|m4v|mov|wmv|avi|mpg|ogv|3gp|3g2*)/gi; // Regex for common video file extensions.

          // Based on the item's URL, determine the content to display in the preview area.
          if ( itemurl.match( image ) ) {
            // If it's an image, create an image tag preview and a "Remove Image" button.
            btnContent = '<img src="' + itemurl + '" alt="" /><a href="#" class="mlu_remove button">Remove Image</a>';
          } else {
            // If it's not an image, provide a generic "View File" link and a "Remove" button.
            // There's no visual preview for non-image files in this implementation.
            html = '<a href="' + itemurl + '" target="_blank" rel="external">View File</a>';
            btnContent = '<div class="no_image"><span class="file_link">' + html + '</span><a href="#" class="mlu_remove button">Remove</a></div>';
          }

          // Update the value of the target input field with the selected item's URL.
          $( '#' + formfield ).val( itemurl );

          // Display the preview content (image or file link) in the designated screenshot area.
          $( '#' + formfield ).siblings( '.screenshot' ).slideDown( ).html( btnContent );

          // Show any associated background properties, relevant if the item is a background image.
          $( '#' + formfield ).siblings( '.of-background-properties' ).show( ); // Show related background properties.

          // Close the Thickbox popup.
          tb_remove( );

        } else {
          // If formfield was not set, it means another part of WordPress initiated the media uploader.
          // In this case, call the original send_to_editor function to maintain default WordPress behavior.
          window.original_send_to_editor( html );
        }

        // IMPORTANT: Reset the formfield variable.
        // This ensures that subsequent calls to the media library from other contexts
        // (e.g., standard post editor) behave normally and don't get trapped by our custom logic.
        // This was a key fix identified on 2010-11-11.
        formfield = '';

      }; // End of custom window.send_to_editor function.

    } // --- End of mediaUpload function. This marks the end of media library integration. ---

  }; // --- End of optionsframeworkMLU Object definition. Do NOT remove this closing bracket or semicolon. ---

  // Section: Document Ready Initialization
  // This block ensures that the JavaScript functions are executed once the DOM is fully loaded.

  $( document ).ready( function ( ) {

    // Initialize the file removal functionality.
    optionsframeworkMLU.removeFile( );

    // Initialize the custom file field recreation.
    optionsframeworkMLU.recreateFileField( );

    // Initialize the media upload integration.
    optionsframeworkMLU.mediaUpload( );

  } ); // End of document.ready function.

} ) ( jQuery ); // Immediately Invoked Function Expression (IIFE) using jQuery as $ alias.