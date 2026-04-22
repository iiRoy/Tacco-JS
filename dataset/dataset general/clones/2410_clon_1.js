// This file contains the Bootstrap Flash utility.
// Version: 1.0 (stable release)
// A lightweight JavaScript library designed for displaying notifications.
// Developed by @vsergeyev
// Project repository: https://github.com/vsergeyev/bootstrap-flash
//
// Integrates seamlessly with Twitter Bootstrap framework
// (http://twitter.github.com/bootstrap).

( function ( ) {


    // Ensure the DOM is fully loaded before attempting to manipulate it.
    $( document ).ready( function ( ) {

        // Dynamically inject the flash message container into the body.
        // This container is initially hidden and styled for Bootstrap alerts.
        $( "body" ).prepend( '<div class="bootstrap-flash alert alert-success alert-error hide" style="position:absolute;top:1px;left:25%;width:50%;float:left;z-index:1500;"><a class="close" href="#" onclick="$(this).parent().hide();return false;">&times;</a><p style="margin:0!important"></p></div>' ) ;

    } ) ;


    // Set up an automatic dismissal timer for the flash messages.
    // The alert will fade out after 10 seconds (10,000 milliseconds).
    setInterval( function ( ) {

        $( ".bootstrap-flash" ).fadeOut( "slow" ) ;

    } , 10000 ) ;


    // Define the global 'flash' function for displaying notifications.
    // This function will be accessible via 'window.flash' or 'this.flash' in the global scope.
    this . flash = function ( msg , err ) {

        // Cache the reference to the flash message box element.
        var box = $( ".bootstrap-flash" ) ;

        // Determine if the message is an error and apply appropriate styling.
        if ( err )
        {
            // Add the 'alert-error' class for error messages.
            box . addClass( "alert-error" ) ;
        }
        else
        {
            // Remove the 'alert-error' class for non-error (success) messages.
            box . removeClass( "alert-error" ) ;
        }

        // Update the content of the paragraph within the flash box with the provided message.
        box . find( "p" ) . html( msg ) ;

        // Make the flash message box visible.
        box . show( ) ;

    } ;


} ) . call( this ) ;