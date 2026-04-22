/*
 * jQuery DND Uploader Plugin - Type I Clone Example
 * This file demonstrates a Type I code clone, preserving all
 * functionality and identifiers, while extensively modifying
 * whitespace and comments.
 */
( function( $ )
{
    // Define the core methods for the dndUploader plugin.
    // These methods handle different aspects of the drag-and-drop functionality.
    var methods = {
        // Initialization method: Sets up data and event handlers.
        init : function( options )
        {
            // Iterate over each selected element to apply the plugin.
            return this.each( function ()
            {
                // Cache the current jQuery object for efficiency.
                var $this = $( this );

                // Store options as data attributes on the element.
                $.each( options, function( label, setting )
                {
                    $this.data( label, setting );
                } );

                // Bind drag-and-drop event handlers to the element.
                // The '.dndUploader' namespace prevents conflicts.
                $this.bind( 'dragenter.dndUploader', methods.dragEnter );
                $this.bind( 'dragover.dndUploader',  methods.dragOver  );
                $this.bind( 'drop.dndUploader',      methods.drop      );
            } );
        },


        // Handler for the 'dragenter' event.
        // Prevents default browser behavior and stops event propagation.
        dragEnter : function ( event )
        {
            event.stopPropagation(); // Stop the event from bubbling up.
            event.preventDefault();  // Prevent default browser action (e.g., opening file).

            return false;            // Ensure no further action is taken.
        },


        // Handler for the 'dragover' event.
        // Similar to dragEnter, it prevents default behavior to allow a drop.
        dragOver : function ( event )
        {
            event.stopPropagation(); // Stop event propagation.
            event.preventDefault();  // Prevent default behavior.

            return false;            // Indicate success or prevent further handling.
        },


        // Handler for the 'drop' event.
        // This is where the file upload logic resides.
        drop : function( event )
        {
            event.stopPropagation(); // Stop event propagation.
            event.preventDefault();  // Prevent default behavior (e.g., navigating to file).

            // Get the jQuery object for the current element.
            var $this        = $( this );
            // Access the original DataTransfer object from the native event.
            var dataTransfer = event.originalEvent.dataTransfer;

            // Check if files were dropped.
            if ( dataTransfer.files.length > 0 )
            {
                // Iterate through each dropped file.
                $.each( dataTransfer.files, function ( i, file )
                {
                    // Create a new XMLHttpRequest for each file.
                    var xhr    = new XMLHttpRequest();
                    // Get the upload object for progress tracking (though not used here).
                    var upload = xhr.upload;

                    // Open the XHR request.
                    // Method and URL are retrieved from the element's data attributes.
                    xhr.open( $this.data( 'method' ) || 'POST', $this.data( 'url' ), true );
                    // Set a custom header for the filename.
                    xhr.setRequestHeader( 'X-Filename', file.fileName );

                    // Send the file data.
                    xhr.send( file );
                } );
            }
            ; // Semicolon for consistency, technically optional here.

            return false; // Prevent default browser handling of the drop.
        }
    };


    // jQuery plugin definition.
    // This makes the 'dndUploader' method available on jQuery objects.
    $.fn.dndUploader = function( method )
    {
        // Check if the requested method exists in our 'methods' object.
        if ( methods[method] )
        {
            // If it exists, call it with the current jQuery object as context,
            // and pass arguments (excluding the method name itself).
            return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ) );
        }
        // If 'method' is an object (options) or undefined, call the 'init' method.
        else if ( typeof method === 'object' || ! method )
        {
            return methods.init.apply( this, arguments );
        }
        // If an unknown method is called, throw an error.
        else
        {
            $.error( 'Method ' + method + ' does not exist on jQuery.dndUploader' );
        }
    };

} )( jQuery ); // Pass jQuery into the IIFE.