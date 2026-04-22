/*
 * This section initializes the CKEditor instance for the main editor textarea.
 * It sets up custom behavior for the 'save' command.
 */
$ ( 'div#editor textarea' ) . ckeditor ( function ( textarea )
{
    // Retrieve the CKEditor instance from the textarea element.
    var e = $ ( textarea ) . ckeditorGet ( ) ;

    // Override the default 'save' command execution.
    e . getCommand ( 'save' ) . exec = function ( editor )
    {
        // Perform an AJAX request to save the editor content.
        $ . ajax ( {
            url      : 'data/ajax/' + $ ( 'div#editor input#editor-target' ) . val ( ) ,
            cache    : false , // Disable caching for this request.
            dataType : 'json' ,
            data     : {
                content : $ ( 'div#editor textarea' ) . val ( ) , // Get current content from the textarea.
                type    : 'edit'                                   // Specify the operation type.
            } ,
            type     : 'POST' ,                                    // Use POST method for sending data.

            success : function ( result )
            {
                // Display a message based on the AJAX call result.
                add_msg ( result . msg , 'PHP' , result . status ? 'alert-success' : 'alert-danger' ) ;
            } ,

            error : function ( jqXHR , status )
            {
                // Handle AJAX errors by displaying an error message.
                add_msg ( status , 'AJAX' , 'alert-danger' ) ;
            }
        } ) ;
    } ;

    // Enable the custom 'save' command.
    e . getCommand ( 'save' ) . enable ( )
} ) ;

/*
 * This block handles event listeners for toolbox buttons.
 * Specifically, it manages the editor's close button functionality.
 */
$ ( 'a#editor-close-button' ) . click ( function ( e )
{
    // Hide the editor container when the close button is clicked.
    $ ( 'div#editor' ) . hide ( ) ;
} ) ;