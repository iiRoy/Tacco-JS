/* This file contains the Type I clone of the original JavaScript code.
 * It strictly adheres to the definition: only whitespace and comments
 * have been altered. All identifiers, operators, and expressions remain
 * precisely as they were in the original source.
 *
 * Changes include:
 * - Modified indentation levels.
 * - Varied spacing around operators and keywords.
 * - Addition/removal/modification of comments.
 * - Strategic use of blank lines for visual separation.
 */

/*jslint newcap: true */ /*global XMLHttpRequest: false, FormData: false */

/*
 * Inline Text Attachment - A JavaScript module for handling
 * drag-and-drop or paste-based image uploads in textareas.
 *
 * Original Author: Roy van Kaathoven
 * Contact Email: ik@royvankaathoven.nl
 *
 * This version is a Type I clone, preserving all functional aspects
 * while extensively modifying only whitespace and comments.
 */

( function ( document, window ) {

  'use strict'; /* Enforce stricter parsing and error handling */


  var inlineAttachment = function ( options, instance ) {

    // Merge provided options with default settings
    this.settings = inlineAttachment.util.merge( options, inlineAttachment.defaults );

    // Store the editor instance
    this.editor = instance;

    // Placeholder tag for filenames in URL text
    this.filenameTag = '{filename}';

    // Holds the last value inserted as a placeholder during upload
    this.lastValue = null;
  };


  /**
   * Object to store references to various editor integrations.
   * This allows `inlineAttachment` to be extended for different
   * text editing environments (e.g., Markdown editors).
   *
   * @type {Object}
   */
  inlineAttachment.editors = {};


  /**
   * Collection of utility functions used internally by `inlineAttachment`.
   */
  inlineAttachment.util = {

    /**
     * Simple utility function to deep merge multiple objects into one.
     * Properties from later objects in the arguments list will
     * overwrite properties from earlier objects.
     *
     * @param {Object[]} object - An array-like list of objects to merge.
     * @returns {Object} A new object containing the merged properties.
     */
    merge: function () {
      var result = {}; // Initialize an empty object for the merged result

      // Iterate through arguments in reverse order to ensure correct overwriting
      for ( var i = arguments.length - 1; i >= 0; i-- ) {
        var obj = arguments[ i ];

        // Iterate over properties of the current object
        for ( var k in obj ) {
          // Ensure the property belongs to the object itself (not its prototype chain)
          if ( obj.hasOwnProperty( k ) ) {
            result[ k ] = obj[ k ]; // Assign or overwrite the property
          }
        }
      }

      return result; // Return the final merged object
    },


    /**
     * Appends text to a given string, ensuring it starts on a new line,
     * with a maximum of two newlines separating it from the previous content.
     * It also removes any leading newlines from the result.
     *
     * @param {String} previous - The existing content to which text will be appended.
     * @param {String} appended - The text to append.
     * @returns {String} The combined string with proper newline formatting.
     */
    appendInItsOwnLine: function ( previous, appended ) {

      return ( previous + "\n\n[[D]]" + appended )
        .replace( /(\n{2,})\[\[D\]\]/, "\n\n" ) // Normalize newlines before the delimiter
        .replace( /^(\n*)/, "" );                // Remove any leading newlines
    },


    /**
     * Inserts the given text at the current cursor position within a textarea element.
     * This function handles cross-browser differences for cursor manipulation.
     *
     * @param {HTMLElement} el - The textarea or input element where text needs to be inserted.
     * @param {String} text - The string of text to insert.
     */
    insertTextAtCursor: function ( el, text ) {
      var scrollPos = el.scrollTop, // Store current scroll position to restore it later
        strPos = 0, // Will hold the cursor's starting position
        browser = false, // Flag to identify browser type for selection handling
        range; // IE-specific text range object


      // Determine browser for cursor/selection handling
      if ( ( el.selectionStart || el.selectionStart === '0' ) ) {
        browser = "ff"; // Firefox/modern browsers
      } else if ( document.selection ) {
        browser = "ie"; // Internet Explorer
      }


      // Handle IE-specific cursor positioning
      if ( browser === "ie" ) {
        el.focus(); // Ensure the element has focus
        range = document.selection.createRange(); // Create a text range
        range.moveStart( 'character', -el.value.length ); // Move start to beginning of text
        strPos = range.text.length; // Get current cursor position
      }
      // Handle modern browser cursor positioning
      else if ( browser === "ff" ) {
        strPos = el.selectionStart; // Get current cursor position
      }


      // Split the text into parts before and after the cursor
      var front = ( el.value ).substring( 0, strPos );
      var back = ( el.value ).substring( strPos, el.value.length );

      // Insert the new text
      el.value = front + text + back;

      // Update cursor position after insertion
      strPos = strPos + text.length;


      // Restore cursor position for IE
      if ( browser === "ie" ) {
        el.focus();
        range = document.selection.createRange();
        range.moveStart( 'character', -el.value.length );
        range.moveStart( 'character', strPos );
        range.moveEnd( 'character', 0 );
        range.select();
      }
      // Restore cursor position for modern browsers
      else if ( browser === "ff" ) {
        el.selectionStart = strPos;
        el.selectionEnd = strPos;
        el.focus();
      }

      el.scrollTop = scrollPos; // Restore scroll position
    }
  };


  /**
   * Default configuration options for `inlineAttachment`.
   * These can be overridden by providing an `options` object
   * to the `inlineAttachment` constructor.
   *
   * @type {Object}
   */
  inlineAttachment.defaults = {

    /**
     * The URL endpoint where the file will be sent for upload.
     * @type {String}
     */
    uploadUrl: 'upload_attachment.php',


    /**
     * The HTTP method to use for sending the file to the upload URL.
     * Typically 'POST'.
     * @type {String}
     */
    uploadMethod: 'POST',


    /**
     * The name of the form field under which the file will be sent.
     * E.g., 'file' if your server expects `$_FILES['file']`.
     * @type {String}
     */
    uploadFieldName: 'file',


    /**
     * Default file extension to use if the original file's extension
     * cannot be detected (e.g., for pasted images from clipboard).
     * @type {String}
     */
    defualtExtension: 'png',


    /**
     * The key in the JSON response from the server that holds the
     * URL of the uploaded file.
     * @type {String}
     */
    jsonFieldName: 'filename',


    /**
     * An array of allowed MIME types for uploaded files.
     * Files with types not in this list will be rejected.
     * @type {String[]}
     */
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/gif'
    ],


    /**
     * The text placeholder to insert into the editor immediately after
     * a file is dropped or pasted, indicating that an upload is in progress.
     * This text will be replaced upon successful upload or error.
     * @type {String}
     */
    progressText: '![Uploading file...]()',


    /**
     * The text format to replace `progressText` with after a successful upload.
     * The `{filename}` tag will be replaced by the actual filename/URL returned
     * by the server in the `jsonFieldName` field.
     * @type {String}
     */
    urlText: "![file]({filename})",


    /**
     * The text to display or use when an upload fails.
     * @type {String}
     */
    errorText: "Error uploading file",


    /**
     * An object containing extra parameters to send along with the file
     * during the upload request. These will be appended to the FormData.
     * @type {Object}
     */
    extraParams: {},


    /**
     * An object containing extra HTTP headers to send with the upload request.
     * @type {Object}
     */
    extraHeaders: {},


    /**
     * A callback function executed *before* the file is sent.
     * Can be used to perform validation or modify the XHR object.
     *
     * @param {XMLHttpRequest} xhr - The XMLHttpRequest object.
     * @returns {Boolean} Return `false` to prevent the upload from proceeding.
     */
    beforeFileUpload: function () {
      return true;
    },


    /**
     * A callback function triggered when a file is received (dropped or pasted).
     *
     * @param {File} file - The File object that was received.
     */
    onFileReceived: function () {},


    /**
     * A callback function executed after the server responds to a file upload.
     *
     * @param {XMLHttpRequest} xhr - The XMLHttpRequest object with the server's response.
     * @returns {Boolean} Return `false` to prevent the default response handling
     *                    (e.g., replacing placeholder text with URL).
     */
    onFileUploadResponse: function () {
      return true;
    },


    /**
     * A callback function executed when a file upload fails (e.g., HTTP error).
     *
     * @param {XMLHttpRequest} xhr - The XMLHttpRequest object with error details.
     * @returns {Boolean} Return `false` to prevent the default error handling
     *                    (e.g., removing placeholder text or showing an alert).
     */
    onFileUploadError: function () {
      return true;
    },


    /**
     * A callback function executed after a file has been successfully uploaded
     * and its URL has been processed (e.g., placeholder replaced).
     * This might be redundant with `onFileUploadResponse` but offers a simpler
     * hook for post-processing.
     */
    onFileUploaded: function () {}
  };


  /**
   * Initiates the upload process for a given file blob.
   * This method constructs a FormData object and sends it via XMLHttpRequest.
   *
   * @param {Blob} file - The file data (e.g., a File object from a drag-and-drop event).
   * @return {XMLHttpRequest} The XMLHttpRequest object used for the upload.
   */
  inlineAttachment.prototype.uploadFile = function ( file ) {

    var me = this,
      formData = new FormData(), // Create a new FormData object to send the file
      xhr = new XMLHttpRequest(), // Create a new XMLHttpRequest object for the upload
      settings = this.settings, // Reference to the current instance's settings
      extension = settings.defualtExtension; // Default extension in case none is found


    // Allow custom setup of FormData if a function is provided in settings
    if ( typeof settings.setupFormData === 'function' ) {
      settings.setupFormData( formData, file );
    }


    // Determine file extension and construct a remote filename.
    // If the file has a name (e.g., not from clipboard), use it.
    if ( file.name ) {
      var fileNameMatches = file.name.match( /\.(.+)$/ );
      if ( fileNameMatches ) {
        extension = fileNameMatches[ 1 ];
      }
    }

    // Generate a unique remote filename, allowing for custom generation via settings
    var remoteFilename = "image-" + Date.now() + "." + extension;
    if ( typeof settings.remoteFilename === 'function' ) {
      remoteFilename = settings.remoteFilename( file );
    }

    // Append the file to the FormData object with the specified field name and remote filename
    formData.append( settings.uploadFieldName, file, remoteFilename );


    // Append any additional parameters defined in settings.extraParams
    if ( typeof settings.extraParams === "object" ) {
      for ( var key in settings.extraParams ) {
        if ( settings.extraParams.hasOwnProperty( key ) ) {
          formData.append( key, settings.extraParams[ key ] );
        }
      }
    }


    // Open the XMLHttpRequest with the specified method and URL
    xhr.open( 'POST', settings.uploadUrl );


    // Add any available extra headers defined in settings.extraHeaders
    if ( typeof settings.extraHeaders === "object" ) {
      for ( var header in settings.extraHeaders ) {
        if ( settings.extraHeaders.hasOwnProperty( header ) ) {
          xhr.setRequestHeader( header, settings.extraHeaders[ header ] );
        }
      }
    }


    // Define the onload event handler for the XMLHttpRequest
    xhr.onload = function () {
      // Check for successful HTTP status codes (200 OK, 201 Created)
      if ( xhr.status === 200 || xhr.status === 201 ) {
        me.onFileUploadResponse( xhr ); // Call success handler
      } else {
        me.onFileUploadError( xhr ); // Call error handler
      }
    };

    // Execute beforeFileUpload callback; if it returns false, prevent sending
    if ( settings.beforeFileUpload( xhr ) !== false ) {
      xhr.send( formData ); // Send the FormData with the file
    }

    return xhr; // Return the XMLHttpRequest object
  };


  /**
   * Checks if a given file's MIME type is allowed according to the
   * `allowedTypes` configuration in the instance's settings.
   *
   * @param {File} file - The file object to check.
   * @returns {Boolean} `true` if the file type is allowed, `false` otherwise.
   */
  inlineAttachment.prototype.isFileAllowed = function ( file ) {
    // Use indexOf to check if the file's type exists in the allowedTypes array
    return this.settings.allowedTypes.indexOf( file.type ) >= 0;
  };


  /**
   * Handles the server's response after a file upload.
   * This method parses the JSON response and updates the editor content
   * with the uploaded file's URL.
   *
   * @param {XMLHttpRequest} xhr - The XMLHttpRequest object containing the server's response.
   * @returns {Void}
   */
  inlineAttachment.prototype.onFileUploadResponse = function ( xhr ) {
    // Execute the custom onFileUploadResponse callback from settings.
    // If it returns false, stop further processing.
    if ( this.settings.onFileUploadResponse.call( this, xhr ) !== false ) {

      var result = JSON.parse( xhr.responseText ), // Parse the JSON response from the server
        filename = result[ this.settings.jsonFieldName ]; // Extract the filename/URL using the configured field name


      // If a result and filename are successfully retrieved
      if ( result && filename ) {
        // Construct the new value to insert, replacing the filename tag
        var newValue = this.settings.urlText.replace( this.filenameTag, filename );

        // Replace the placeholder (lastValue) in the editor's content with the new URL text
        var text = this.editor.getValue().replace( this.lastValue, newValue );
        this.editor.setValue( text ); // Update the editor's content
      }
    }
  };


  /**
   * Handles cases where a file upload fails (e.g., HTTP error, server error).
   * This method typically removes the placeholder text from the editor.
   *
   * @param {XMLHttpRequest} xhr - The XMLHttpRequest object with error details.
   * @returns {Void}
   */
  inlineAttachment.prototype.onFileUploadError = function ( xhr ) {
    // Execute the custom onFileUploadError callback from settings.
    // If it returns false, stop further processing (e.g., preventing default alert).
    if ( this.settings.onFileUploadError.call( this, xhr ) !== false ) {
      // Remove the placeholder text from the editor by replacing it with an empty string
      var text = this.editor.getValue().replace( this.lastValue, "" );
      this.editor.setValue( text ); // Update the editor's content
    }
  };


  /**
   * Called immediately after a file (from drop or paste) is detected and accepted.
   * This method inserts a progress placeholder into the editor.
   *
   * @param {File} file - The File object that was just inserted.
   * @returns {Void}
   */
  inlineAttachment.prototype.onFileInserted = function ( file ) {
    // Execute the custom onFileReceived callback from settings.
    // If it returns false, stop further processing.
    if ( this.settings.onFileReceived.call( this, file ) !== false ) {
      this.lastValue = this.settings.progressText; // Store the progress text as the last inserted value
      this.editor.insertValue( this.lastValue ); // Insert the progress text into the editor
    }
  };


  /**
   * Event handler for the `paste` event.
   * It checks clipboard data for files, validates them, and initiates upload.
   *
   * @param {Event} e - The paste event object.
   * @returns {Boolean} `true` if a file was handled and default behavior was prevented,
   *                    `false` otherwise.
   */
  inlineAttachment.prototype.onPaste = function ( e ) {
    var result = false, // Flag to indicate if a file was successfully processed
      clipboardData = e.clipboardData, // Access the clipboard data
      items; // Will hold clipboard items (files)


    // Check if clipboardData object is available (modern browsers)
    if ( typeof clipboardData === "object" ) {
      // Get items from clipboard (can be files or other data)
      items = clipboardData.items || clipboardData.files || [];

      // Iterate through each item in the clipboard
      for ( var i = 0; i < items.length; i++ ) {
        var item = items[ i ];

        // Check if the item is an allowed file type
        if ( this.isFileAllowed( item ) ) {
          result = true; // Mark as handled
          this.onFileInserted( item.getAsFile() ); // Insert placeholder
          this.uploadFile( item.getAsFile() ); // Start upload
        }
      }
    }

    // If any file was handled, prevent the default paste action
    if ( result ) {
      e.preventDefault();
    }

    return result;
  };


  /**
   * Event handler for the `drop` event.
   * It iterates through dropped files, validates them, and initiates upload.
   *
   * @param {Event} e - The drop event object.
   * @returns {Boolean} `true` if a file was handled, `false` otherwise.
   */
  inlineAttachment.prototype.onDrop = function ( e ) {
    var result = false; // Flag to indicate if a file was successfully processed

    // Iterate through all files in the dataTransfer object of the drop event
    for ( var i = 0; i < e.dataTransfer.files.length; i++ ) {
      var file = e.dataTransfer.files[ i ];

      // Check if the dropped file is an allowed type
      if ( this.isFileAllowed( file ) ) {
        result = true; // Mark as handled
        this.onFileInserted( file ); // Insert placeholder
        this.uploadFile( file ); // Start upload
      }
    }

    return result; // Return whether any file was handled
  };


  // Expose `inlineAttachment` to the global window object
  window.inlineAttachment = inlineAttachment;

} )( document, window ); // Immediately-invoked function expression (IIFE)