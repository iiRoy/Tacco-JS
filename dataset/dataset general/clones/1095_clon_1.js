( function( $ ) {

  /*
   * This variable will hold the plugin's settings.
   * It is initialized later within the droparea function.
   */
  var s;

  /*
   * Core Methods Object
   * Contains all the internal logic for the droparea plugin.
   */
  var m = {

    init: function() {
      // Initialization logic, currently empty.
    },

    start: function() {
      // Start of upload process, currently empty.
    },

    complete: function() {
      // Upload complete callback, currently empty.
    },

    progress: function(loaded_percent, progress_bar, area) {
      // Update the visual progress bar based on loaded percentage.
      progress_bar.css( {
        'height': loaded_percent + "%",
        'line-height': ( area.height() * loaded_percent / 100 ) + 'px',
        'vertical-align': 'middle'
      } );

      // Display the percentage inside the bar.
      progress_bar.find( '.bar' ).html( loaded_percent + "%" );
    },

    before: function(file, input, area) {
      // This function can be overridden by user settings to perform pre-upload checks.
      return true; // By default, allow the upload to proceed.
    },

    error: function(response, input, area) {
      // Log any errors to the console for debugging purposes.
      console.error( 'Error:', response );

      return 0; // Return a falsy value to indicate an error.
    },

    traverse: function(files, input, area) {
      /*
       * Handles the processing of files, either from a drag-and-drop event
       * or from a file input selection.
       */
      if ( typeof files !== "undefined" ) {
        m.fileCnt = files.length; // Store the count of files being processed.

        for ( var i = 0, l = files.length; i < l; i++ ) {
          // Process each file individually.
          m.control( files[i], input, area );
        }
      } else {
        // If files are undefined, display a "no support" message.
        area.html( nosupport );
      }
    },

    control: function( file, input, area ) {
      var tld = file.name.toLowerCase().split( /\./ ); // Get file extension.
      tld = tld[ tld.length - 1 ];

      // Retrieve allowed file types from the area's data attribute.
      var types = ( $( area ).data( 'type' ) && $( area ).data( 'type' ).split( /,/ ) ) || [];

      /*
       * File type control:
       * Checks if the file type is allowed based on input data attributes.
       */
      if ( input.data( 'type' ) && ! types.indexOf( file.type ) ) {
        s.error( {
          'error': 'only image files: ' + input.data( 'type' )
        }, input, area );
        return false; // Prevent upload if file type is not allowed.
      }

      /*
       * File size control:
       * Ensures the file size does not exceed the configured maximum.
       */
      if ( file.size > ( s.maxsize * 1048576 ) ) { // 1048576 bytes = 1 MB
        s.error( {
          'error': 'max upload size: ' + s.maxsize + 'Mb'
        }, input, area );
        return false; // Prevent upload if file is too large.
      }

      // Execute the user-defined 'before' callback.
      if ( s.before( file, input, area ) === false ) {
        console.warn( 'doparea upload cancelled by `before` filter' );
        return; // Stop processing if 'before' hook returns false.
      }

      /*
       * If the file is an image and data-canvas parameter is true,
       * resize the image on the client-side before uploading.
       * Otherwise, proceed directly to upload.
       */
      if ( ( /image/i ).test( file.type ) && input.data( 'canvas' ) ) {
        m.resize( file, input, area );
      } else {
        m.upload( file, input, area );
      }
    },

    resize: function( file, input, area ) {
      // Store the original file name for later use after resizing.
      var name = file.name;

      // Create new DOM elements for canvas and image manipulation.
      var canvas = document.createElement( "canvas" );
      // $(canvas).appendTo(area); // This line is commented out in original code.
      var img = document.createElement( "img" );

      // Get target dimensions for resizing, defaulting to 0 if not set.
      var WIDTH = 0 | input.data( 'width' );
      var HEIGHT = 0 | input.data( 'height' );

      // Use FileReader to read the file content as a Data URL.
      var reader = new FileReader();
      reader.onloadend = function( e ) {
        img.src = e.target.result; // Set the image source to the Data URL.

        // Calculate new sizes based on constraints.
        var width = img.width;
        var height = img.height;
        var crop = input.data( 'crop' ); // Check if cropping is enabled.

        if ( ( WIDTH && width > WIDTH ) || ( HEIGHT && height > HEIGHT ) ) {
          var ratio = width / height;
          if ( ( ratio >= 1 || HEIGHT == 0 ) && WIDTH && ! crop ) {
            width = WIDTH;
            height = WIDTH / ratio;
          } else if ( crop && ratio <= ( WIDTH / HEIGHT ) ) {
            width = WIDTH;
            height = WIDTH / ratio;
          } else {
            width = HEIGHT * ratio;
            height = HEIGHT;
          }
        }

        // Draw the resized image onto the canvas.
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext( "2d" );
        ctx.drawImage( img, 0, 0, width, height );

        // Get the image data as a JPEG Data URL.
        var data = canvas.toDataURL( "image/jpeg" );

        // Data integrity checking.
        if ( data.length <= 6 ) { // Very small data URL usually indicates an error.
          s.error( {
            'error': 'Image did not created. Please, try again.'
          }, input, area );
          return 0;
        } else {

          // Convert the Data URL to a Blob object for uploading.
          file = m.dataURItoBlob( data );
          file.name = name; // Restore original file name.

          if ( input.data( 'post' ) ) {
            // If a post URL is provided, upload the new file.
            m.upload( file, input, area );
          } else {
            // Otherwise, append the canvas image to the area and disable input.
            $( canvas ).appendTo( area );
            input.attr( 'disabled', 'disabled' );
            $( '<input>' ).attr( 'name', input.attr( 'name' ) )
              .val( data ).insertAfter( input );
          }
        }
      };
      reader.readAsDataURL( file ); // Start reading the file.
    },

    upload: function( file, input, area ) {
      // Clear the display area based on whether multiple files are being uploaded.
      if ( this.fileCnt > 1 ) {
        area.empty();
      } else {
        area.children( 'div' ).empty();
      }

      // Create and append a progress bar element.
      var progress = $( '<div class="progress"><div class="bar"></div></div>' );
      area.append( progress );

      /*
       * Initialize XMLHttpRequest for asynchronous file uploading.
       * This is compatible with modern browsers like Firefox, Chrome, and Safari.
       */
      var xhr = new XMLHttpRequest();
      xhr.open( "post", input.data( 'post' ), true ); // Open a POST request.

      // DEVISE FIX: Add CSRF token for Ruby on Rails applications using Devise.
      var token = $( 'meta[name="csrf-token"]' ).attr( 'content' );
      if ( token ) {
        xhr.setRequestHeader( 'X-CSRF-Token', token );
      }

      xhr.setRequestHeader( "X-Requested-With", "XMLHttpRequest" );

      // Event listener for monitoring upload progress.
      xhr.upload.addEventListener( "progress", function( e ) {
        if ( e.lengthComputable ) {
          var loaded = Math.ceil( ( e.loaded / e.total ) * 100 );

          if ( s.progress ) {
            s.progress( loaded, progress, area ); // Use custom progress handler if available.
          } else {
            progress.html( loaded + "%" ); // Default progress display.
          }
        }
      }, false );

      // Event listener for when the file upload is complete.
      xhr.addEventListener( "load", function( e ) {
        // Check for HTTP errors (status other than 200 OK).
        if ( e.target.status != '200' ) {
          s.error( {
            'error': e.target.statusText
          }, input, area );

          return;
        }

        // Parse the JSON response from the server.
        var result = jQuery.parseJSON( e.target.responseText );

        // Call the user-defined 'complete' function.
        s.complete( result, file, input, area );

        // Update progress bar status and fade out.
        progress.addClass( 'uploaded' );
        progress.html( s.uploaded ).fadeOut( 'slow' );
      }, false );

      // Create a new FormData object to send file and other data.
      var fd = new FormData();

      // Add optional form data from the input's data attributes.
      for ( var i in input.data() ) {
        if ( typeof input.data( i ) !== "object" ) {
          fd.append( i, input.data( i ) );
        }
      }

      // Append the actual file data.
      fd.append( input.attr( 'name' ), file );

      // Send the FormData object.
      xhr.send( fd );
    },

    dataURItoBlob: function( dataURI ) {
      /*
       * Converts a Data URI string to a Blob object.
       * Reference: http://stackoverflow.com/questions/4998908/
       */

      // Convert base64 to raw binary data held in a string.
      // This doesn't handle URL-encoded DataURIs.
      var byteString = atob( dataURI.split( ',' )[ 1 ] );

      // Separate out the MIME component from the Data URI.
      var mimeString = dataURI.split( ',' )[ 0 ].split( ':' )[ 1 ].split( ';' )[ 0 ];

      // Write the bytes of the string to an ArrayBuffer.
      var ab = new ArrayBuffer( byteString.length );
      var ia = new Uint8Array( ab );
      for ( var i = 0; i < byteString.length; i++ ) {
        ia[ i ] = byteString.charCodeAt( i );
      }

      // Write the ArrayBuffer to a Blob object using available BlobBuilder implementations.
      var bb = new ( window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder )();
      bb.append( ab );
      return bb.getBlob( mimeString );
    }
  };

  // Define the jQuery plugin function for droparea.
  $.fn.droparea = function( o ) {
    // Default settings for the plugin.
    s = {
      'init': m.init,
      'start': m.start,
      'complete': m.complete,
      'error': m.error,
      'before': m.before,
      'instructions': 'drop a file to here',
      'over': 'drop file here!',
      'nosupport': 'No support for the File API in this web browser',
      'noimage': 'Unsupported file type!',
      'uploaded': 'Uploaded',
      'maxsize': '10', // Max upload size in Megabytes.
      'wrap_container': false, // Wrap the input in a new container.
      'handle_click': false // Allow clicking the drop area to open file browser.
    };

    // Extend default settings with user-provided options.
    if ( o ) {
      $.extend( s, o );
    }

    // Iterate over each selected element to apply the droparea functionality.
    this.each( function() {
      var area = $( this ),
        input = $( this ).children( 'input' ) || $( this ), // Find the input or use the element itself.
        instructions = $( '<div class="instructions"></div>' ); // Create instructions element.

      area.prepend( instructions ); // Add instructions to the beginning of the area.

      // If wrap_container is true, create a new wrapper div.
      if ( s.wrap_container == true ) {
        area = $( '<div' + ( ( $( this ).attr( 'class' ) ) ? ' class="' + $( this ).attr( 'class' ) + '"' : '' ) + '>' ).insertAfter( $( this ) );
        instructions = $( '<div>' ).appendTo( area );
        input = $( this ).appendTo( area );
      }

      s.init( $( this ) ); // Call the custom init function.

      // Display existing image or instructions.
      if ( input.data( 'value' ) && input.data( 'value' ).length ) {
        $( '<img src="' + input.data( 'value' ) + '">' ).appendTo( area );
      } else {
        instructions.addClass( 'instructions' ).html( s.instructions );
      }

      // If handle_click is true, hide the input visually.
      if ( s.handle_click === true ) {
        input.css( {
          position: 'absolute',
          top: '-1000px'
        } );
      }

      /*
       * Bind drag and drop events to the document.
       * These prevent default browser behavior and provide visual feedback.
       */
      $( document ).bind( {
        dragleave: function( e ) {
          e.preventDefault();
          if ( input.data( 'value' ) || area.find( 'img' ).length ) {
            instructions.removeClass( 'over' ).empty();
          } else {
            instructions.removeClass( 'over' ).html( s.instructions );
          }
        },
        drop: function( e ) {
          e.preventDefault();
          if ( input.data( 'value' ) || area.find( 'img' ).length ) {
            instructions.removeClass( 'over' ).empty();
          } else {
            instructions.removeClass( 'over' ).html( s.instructions );
          }
        },
        dragenter: function( e ) {
          e.preventDefault();
          instructions.addClass( 'instructions over' ).html( s.over );
        },
        dragover: function( e ) {
          e.preventDefault();
          instructions.addClass( 'instructions over' ).html( s.over );
        }
      } );

      // Add a native DOM event listener for the 'drop' event on the drop area.
      this.addEventListener( "drop", function( e ) {
        e.preventDefault(); // Prevent default browser drop behavior.
        s.start( $( this ) ); // Call the custom start function.
        m.traverse( e.dataTransfer.files, input, area ); // Process dropped files.
        instructions.removeClass( 'over' ).empty(); // Clear drag-over instructions.
        input.val( '' ); // Clear the input value to allow re-selection of same file.
      }, false );

      // Add a native DOM event listener for 'click' to trigger input click.
      this.addEventListener( 'click', function( e ) {
        input.click(); // Programmatically click the hidden file input.
      } );

      // Event listener for when a file is selected via the browse dialog.
      input.change( function( e ) {
        m.traverse( e.target.files, input, area ); // Process selected files.
        input.val( '' ); // Clear the input value.
      } );
    } );

    return this; // Return the jQuery object for chaining.
  };

} )( jQuery );