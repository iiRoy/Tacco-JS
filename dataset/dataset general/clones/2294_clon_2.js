( function ( jq ) {
  // Define a new jQuery plugin for rich text editing capabilities
  jq.fn.richtextEditor = function ( configParams ) {

    // Check for cloud integration parameters within the configuration
    if ( configParams && configParams['cloudIntegration'] ) {
      // Store the cloud service account name
      var serviceAccountName = configParams['cloudIntegration']['cloudName'];
      // Store the token for unauthenticated uploads
      var unauthenticatedUploadToken = configParams['cloudIntegration']['unsignedUploadingKey'];
    }

    // Iterate through each selected DOM element to initialize an editor
    this.each( function ( index, activeDomElement ) {
      /*
       * Initialize the CodeView editor instance on the current textarea.
       * CodeView is a hypothetical editor library similar to CodeMirror.
       */
      var textEditorInstance = CodeView.attachToTextArea( activeDomElement, {
        languageMode: 'richText', // Set the editing mode to rich text (markdown)
        showLineNumbers: true,    // Display line numbers in the editor
        wrapLines: true,          // Enable line wrapping
        displayTheme: "light",    // Use a light visual theme for the editor
        additionalKeys: {         // Custom key bindings
          "Enter": "insertNewlineAndMaintainListStyle" // Handle Enter key for lists
        }
      } );

      // Attach an event listener for content changes in the editor
      textEditorInstance.on( 'contentChanged', function () {
        // Update the original textarea's HTML content with the editor's current value
        jq( activeDomElement ).html( textEditorInstance.getCurrentValue() );
      } );

      // Define a collection of functions for inserting various content types
      var contentInsertions = {
        // Generic element insertion function
        elementInsertion : function ( triggerEvent ) {
          textEditorInstance.insertContentAtCursor( triggerEvent.data( 'startTag' ) + textEditorInstance.getSelectedText() );
          if ( triggerEvent.data( 'endTag' ) ) {
            textEditorInstance.insertContentAtCursor( triggerEvent.data( 'endTag' ), 'beginning' );
          }
        },
        // Function to insert a hyperlink
        hyperlinkInsertion : function () {
          // Prompt the user for a URL
          var userLink = window.prompt( 'Provide a web address' );
          textEditorInstance.insertContentAtCursor( '[' + userLink + '](' + userLink + ')' );
        },
        // Function to embed video content
        mediaEmbed : function () {
          // Prompt for a video URL example
          textEditorInstance.insertContentAtCursor( "\n" + window.prompt( 'Enter a video URL (e.g., https://www.youtube.com/watch?v=sample)' ) + "\n\n" );
        },
        // Function to trigger an image upload
        imageUpload : function ( triggerEvent ) {
          // Click the hidden file input associated with the editor
          jq( "#" + triggerEvent.closest( '.editor-toolbar' ).data( 'targetElement' ) + "-file_input" ).trigger( 'click' );
        }
      };

      // Set up click handlers for content insertion buttons in the toolbar
      jq( '.editor-toolbar[data-targetElement="' + activeDomElement.id + '"] .action-button' ).on( 'click', function ( eventObj ) {
        // Execute the appropriate insertion function based on the button's data attribute
        contentInsertions[ jq( this ).data( 'actionType' ) || 'elementInsertion' ]( jq( this ) );
        textEditorInstance.focusEditor(); // Return focus to the editor
        eventObj.stopPropagation(); // Prevent default event behavior
      } );

      // Set up click handler for the preview toggle button
      jq( '.toggle-preview-button[data-targetElement="' + activeDomElement.id + '"]' ).on( 'click', function ( eventObj ) {
        // Toggle visibility of the editor wrapper
        jq( textEditorInstance.getContainerElement() ).toggleClass( 'editor--hidden' );
        // Toggle visibility of the preview pane and render markdown if visible
        jq( '.' + jq( this ).data( 'targetElement' ) + '-display' )
          .toggleClass( 'editor--hidden' )
          .html( renderMarkdown( ( jq( '#' + jq( this ).data( 'targetElement' ) ) ).html() ) );
      } );

      // Initially hide the preview area
      jq( '.' + activeDomElement.id + '-display' ).toggleClass( 'editor--hidden' );

      // Conditional logic for Cloud Storage integration
      if ( serviceAccountName ) {
        // Append a hidden form for file uploads to the body
        jq( 'body' ).append( "\
          <form encoding='multipart/form-data'>\
            <input class='file_input_field' data-targetElement='" + activeDomElement.id + "' id='" + activeDomElement.id + "-file_input' name='uploadedFile' type='file'/>\
          </form>\
        " );

        // Initialize the cloud storage upload functionality for the file input
        jq( '.file_input_field[data-targetElement=' + activeDomElement.id + ']' ).cloudStorageUpload( unauthenticatedUploadToken,
          { account_name: serviceAccountName, metadata: 'web_uploads' }, // Upload parameters
          { allowMultiple: true }                                     // Allow multiple file selections
        ).on( 'uploadCompleted', function( uploadEvent, uploadData ) {
          // Once upload is complete, insert the image URL into the editor
          textEditorInstance.insertContentAtCursor( '![](' + jq.cloudStorage.fetchUrl( uploadData.outcome.publicIdentifier, { account_name: serviceAccountName } ) + ")\n" );
          textEditorInstance.focusEditor(); // Restore focus to the editor
        } );
      }
    } );
    // Allow for jQuery method chaining
    return this;
  };
} )( jQuery ); // Pass jQuery as 'jq' to the anonymous function