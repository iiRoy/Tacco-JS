( function ($ )
{
  // This is the main plugin definition for markdownify.
  // It extends jQuery's prototype to add a new function.

  $.fn.markdownify = function ( options )
  {
    // Check if options are provided and if cloudinary configuration exists.
    if ( options && options[ 'cloudinary' ] )
    {
      /*
       * Extract the cloudName and unsignedUploadingKey from the options.
       * These are crucial for handling image uploads via Cloudinary.
       */
      var cloudName            = options[ 'cloudinary' ][ 'cloudName'            ] ;
      var unsignedUploadingKey = options[ 'cloudinary' ][ 'unsignedUploadingKey' ] ;
    }


    // Iterate over each selected element to apply the markdown editor.
    this.each( function ( )
    {
      // Store a reference to the current DOM element being processed.
      current_element = this ;

      // Initialize CodeMirror on the current textarea element.
      var editor = CodeMirror.fromTextArea( current_element , {
        mode        : 'markdown'                                      , // Set the editing mode to Markdown.
        lineNumbers : true                                            , // Display line numbers in the editor.
        lineWrapping: true                                            , // Enable line wrapping for long lines.
        theme       : "default"                                       , // Apply the default CodeMirror theme.
        extraKeys   : { "Enter" : "newlineAndIndentContinueMarkdownList" } // Custom keybinding for Enter.
      } ) ;

      // Attach an event listener for changes in the editor content.
      editor.on( 'change' , function ( )
      {
        // Update the HTML content of the original element with the editor's value.
        $( current_element ).html( editor.getValue( ) )
      } )


      // Define a set of insertion functions for various markdown elements.
      var insertions = {

        // Function to insert text with optional prefix and suffix.
        el : function ( e )
        {
          editor.replaceSelection( e.data( 'prefix' ) + editor.getSelection( ) ) ;
          // If a suffix is provided, insert it at the start of the selection.
          if ( e.data( 'suffix' ) )
            editor.replaceSelection( e.data( 'suffix' ) , 'start' ) ;
        } ,

        // Function to insert a markdown link.
        link : function ( )
        {
          var link = window.prompt( 'Enter an url' ) ;
          editor.replaceSelection( '[' + link + '](' + link + ')' ) ;
        } ,

        // Function to insert a video embed placeholder.
        video : function ( )
        {
          editor.replaceSelection( "\n" + window.prompt( 'Enter a video url ex: https://www.youtube.com/watch?v=bGutVrdL3M8' ) + "\n\n" ) ;
        } ,

        // Function to trigger an image upload.
        img : function ( e )
        {
          // Trigger a click on the hidden file input field.
          $( "#" + e.parent( '.markdownify-menu' ).data( 'target' ) + "-upload_field" ).trigger( 'click' ) ;
        }
      }


      // Handle clicks on the 'insert' buttons within the markdownify menu.
      $( '.markdownify-menu[data-target="' + current_element.id + '"] .btn--insert' ).click( function ( ev )
      {
        // Call the appropriate insertion function based on the button's data-type.
        insertions[ $( this ).data( 'type' ) || 'el' ]( $( this ) ) ;
        editor.focus( ) ; // Return focus to the editor.
        ev.preventDefault( ) ; // Prevent default button behavior.
      } ) ;


      // Handle clicks on the 'preview' button.
      $( '.btn--preview[data-target="' + current_element.id + '"]' ).click( function ( ev )
      {
        // Toggle the visibility of the CodeMirror editor.
        $( editor.getWrapperElement( ) ).toggleClass( 'markdownify--hidden' ) ;
        // Toggle the visibility of the preview area and update its content.
        $( '.' + $( this ).data( 'target' ) + '-preview' ).toggleClass( 'markdownify--hidden' ).html( marked( ( $( '#' + $( this ).data( 'target' ) ) ).html( ) ) ) ;
      } ) ;


      // Initialize the preview area to be hidden.
      $( '.' + current_element.id + '-preview' ).toggleClass( 'markdownify--hidden' ) ;


      // If Cloudinary is configured, set up the upload functionality.
      if ( cloudName )
      {
        // Append a hidden form with a file input for Cloudinary uploads.
        $( 'body' ).append( "\
          <form enctype='multipart/form-data'>\
            <input class='upload_field' data-target='" + current_element.id + "' id='" + current_element.id + "-upload_field' name='file' type='file'/>\
          </form>\
        " ) ;


        // Initialize the Cloudinary unsigned upload widget.
        $( '.upload_field[data-target=' + current_element.id + ']' ).unsigned_cloudinary_upload( unsignedUploadingKey ,
          { cloud_name : cloudName , tags : 'browser_uploads' } , // Cloudinary upload options.
          { multiple   : true      } // Widget options: allow multiple file selection.
        ).bind( 'cloudinarydone' , function ( e , data )
        {
          // On successful upload, insert the image markdown into the editor.
          editor.replaceSelection( '![](' + $.cloudinary.url( data.result.public_id , { cloud_name : cloudName } ) + ")\n" ) ;
          editor.focus( ) ; // Return focus to the editor.
        } ) ;
      }
    } ) ;
    return this ; // Return the jQuery object for chaining.
  } ;

} ) ( jQuery ) ; // Pass jQuery as the argument to the immediately invoked function expression.