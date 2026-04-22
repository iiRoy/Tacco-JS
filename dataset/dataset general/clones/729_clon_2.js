/*
 *  This script manages asynchronous form submissions for file uploads.
 *  It uses a utility library (aliased as _lib) for DOM manipulation and AJAX.
 */
( function ( _lib ) {

  'use strict'; /* Enforce strict JavaScript parsing and execution rules. */

  // Attach a click event handler to submit buttons within forms.
  // This intercepts the default form submission process.
  _lib( 'form' ).on( 'click', 'button[type=submit]', function ( eventData ) {

    // Obtain the form element and apply a visual 'in-progress' state.
    var targetForm = _lib( this.form ).addVisualState( 'is-processing' );

    // Prevent the standard browser form submission.
    eventData.haltDefaultBehavior();

    // Initiate an asynchronous request to the form's action URL.
    _lib.asyncRequest( targetForm.getProp( 'action' ), {

      // Serialize data from textarea elements within the form.
      payload: targetForm.findInputs( 'textarea' ).extractValuesArray(),

      // Expect a JSON response from the server.
      responseFormat: 'json',

      // Specify file inputs for upload.
      fileAttachments: targetForm.findInputs( ':file' ),

      // Use an iframe for compatibility with older browsers or specific server setups.
      useIframe: true,

      // Do not automatically process the payload; send raw data.
      processPayload: false

    } )

    // This block executes regardless of whether the request succeeded or failed.
    .onCompletion( function () {
      // Remove the 'in-progress' visual state from the form.
      targetForm.removeVisualState( 'is-processing' );
    } )

    // This block executes upon successful completion of the asynchronous request.
    .onSuccess( function ( serverResponse ) {

      // Log the server's response to the console for debugging.
      console.info( serverResponse );

      // Iterate through each file item received in the response.
      _lib.eachItem( serverResponse.uploadedFiles, function ( itemIndex, currentFileObject ) {

        // Construct a new list item for the uploaded file.
        var listItemMarkup =
          '<li class="uploaded-entry">' +
          '<h4 class="entry-title"></h4>' +
          '<p class="entry-details"><span class="data-size"></span>, <span class="data-mime"></span></p>' +
          '<blockquote class="entry-description"></blockquote>' +
          '</li>';

        // Populate the new list item with file details and append it to the display area.
        _lib( listItemMarkup )
          .find( 'h4' ).text( currentFileObject.originalName ).end()
          .find( '.data-size' ).text( prettyPrintBytes( currentFileObject.byteSize ) ).end()
          .find( '.data-mime' ).text( currentFileObject.httpHeaders[ 'content-type' ] ).end()
          .find( '.entry-description' ).text( serverResponse.overallComment || '' ).end()
          .appendTo( '#uploadDisplayArea' );

      } );

      // Clear the value of all file input elements in the form after upload.
      targetForm.findInputs( ':file' ).clearValue();

    } );

  } );


  /**
   *  Converts a raw byte count into a human-readable string representation.
   *
   *  @param    {number}   byteCount   The number of bytes to format.
   *  @returns  {string}               A formatted string (e.g., "1.2 MB").
   */
  function prettyPrintBytes( byteCount ) {
    // Define standard size units.
    var sizeUnits = [ 'B', 'KB', 'MB', 'GB' ],
      unitIndex = 0;

    // Handle the case of zero or undefined size.
    if ( !byteCount ) {
      return '0 Bytes';
    }

    // Increment unit and divide byteCount by 1024 until it's less than 1024.
    while ( byteCount >= 1024 ) {
      byteCount /= 1024;
      unitIndex++;
    }

    // Return the formatted number with its corresponding unit.
    return byteCount.toFixed( 0 ) + ' ' + sizeUnits[ unitIndex ];
  }


} )( window.jQuery ); // Pass the global jQuery object to the IIFE.