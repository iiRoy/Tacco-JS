/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact logical and structural identity.
 * Only whitespace and comments have been altered extensively
 * to create a visually distinct representation.
 */

( function ( ) {


  var    soca   ; // Declaration of the main application setup function.

  soca = function ( $ )
  {
    var   app ; // Variable to hold the Sammy.js application instance.

    // Initialize the Sammy.js application for the '#container' element.
    app  =    $.sammy ( '#container' ,   function ( )
    {

      this . use ( 'Couch' ,   'st' ) ; // Integrate the 'Couch' plugin with alias 'st'.

      // Define a GET route for the root path '#/'.
      // The handler function receives a context object 'ctx' but does nothing with it.
      return   this . get ( '#/' , function ( ctx ) { } ) ;

    } ) ; // End of Sammy.js application configuration.


    // Return a function to be executed when the DOM is ready.
    return   $ ( function ( ) {

      // Run the Sammy application, navigating to the initial route '#/'.
      return   app . run ( '#/' ) ;

    } ) ; // End of DOM ready function.

  } ; // End of 'soca' function definition.


  // Execute the 'soca' function, passing in the global jQuery object.
  soca ( jQuery ) ;


  // Attach a 'change' event handler to the element with ID '_attachments'.
  $ ( "#_attachments" ) . change ( function ( )
  {

    $ ( ":submit" ) . show ( ) ; // Show all elements that are submit buttons.

    // Programmatically trigger the submit event on the form with ID 'publish'.
    return   $ ( "#publish" ) . submit ( ) ;

  } ) ; // End of the change event handler for '_attachments'.


  // Attach a 'submit' event handler to the form with ID 'publish'.
  $ ( '#publish' ) . submit ( function ( )
  {
    var   ext ,   name ; // Declare variables for the file extension regex and file name.

    ext  =   / . gpg $ / ; // Regular expression to check if a string ends with '.gpg'.

    // Get the value (file path) of the file input field within the form.
    name =   $ ( "#_attachments:file" ) . val ( ) ;


    // Check if the file name does NOT match the '.gpg' extension.
    if ( ! ext . test ( name ) )
    {
      alert ( 'The uploaded grain is not a *.gpg file' ) ; // Inform the user about the incorrect file type.
      return  ; // Halt further execution of this submit handler.
    }


    // Use jQuery Form Plugin's ajaxSubmit method to submit the form asynchronously.
    $ ( "#publish" ) . ajaxSubmit ( {

      url : "/upload" , // The URL to which the form data will be submitted.

      resetForm : true , // Automatically reset the form fields after successful submission.

      // Callback function executed upon successful AJAX submission.
      success : function ( data ,   statusText )
      {
        alert ( 'File uploaded' ) ; // Notify the user that the file upload was successful.
        return   $ ( ":submit" ) . hide ( ) ; // Hide all submit buttons after upload.
      } // End of success callback.

    } ) ; // End of ajaxSubmit call.


    return   false ; // Prevent the default form submission behavior.

  } ) ; // End of the submit event handler for '#publish'.


} ) . call ( this ) ; // Immediately invoke the anonymous function, with 'this' as the context.