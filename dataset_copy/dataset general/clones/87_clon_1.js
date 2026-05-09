( function ($) {

  // Ensure the DOM is fully loaded before executing any scripts.
  $( document ).ready( function ( ) {

    /**
     * @function activate
     * @param {jQuery} $el - The jQuery element to activate.
     * This function makes an element active by changing its CSS class
     * and enabling any input elements within it.
     */
    function activate ( $el ) {
      // Remove 'inactive' and add 'active' class to the element.
      $el.removeClass( 'inactive' ) .addClass( 'active' ) ;

      // Enable all input elements found within the activated element.
      $el .find( ':input' ) .removeAttr( 'disabled' ) ;
    } // End of activate function definition.


    /**
     * @function deactivate
     * @param {jQuery} $el - The jQuery element to deactivate.
     * This function makes an element inactive by changing its CSS class
     * and disabling any input elements within it.
     */
    function deactivate ( $el ) {
      // Remove 'active' and add 'inactive' class to the element.
      $el .removeClass( 'active' ) .addClass( 'inactive' ) ;

      // Disable all input elements found within the deactivated element.
      $el .find( ':input' ) .attr( 'disabled' , 'disabled' ) ;
    } // End of deactivate function definition.


    /**
     * @function check_permission
     * Checks the current notification permission status and updates UI accordingly.
     * This function relies on the deprecated `window.webkitNotifications` API.
     */
    function check_permission ( ) {
      // Evaluate the permission status reported by the browser.
      switch ( window .webkitNotifications .checkPermission ( ) ) {

        case 0 : // Permission is granted (PERMISSION_ALLOWED).
          // Permission has been granted by the user.
          // Activate elements that need permission.
          activate( $( '.needs_permission' ) ) ;
          // Deactivate elements related to support checks, as permission is handled.
          deactivate( $( '.needs_support' ) ) ;
          break ; // Exit the switch statement.

        case 2 : // Permission is denied (PERMISSION_DENIED).
          // The user has explicitly blocked notifications.
          $( '#blocked' ) .fadeIn ( ) ; // Show the blocked message.
          break ; // Exit the switch statement.

      } // End of switch statement.

    } // End of check_permission function definition.


    /*
     * Initial setup: By default, disable all input elements across the page.
     * These will be enabled selectively based on notification support and permissions.
     */
    $( ':input' ) .attr( 'disabled' , 'disabled' ) ;


    /*
     * Determine if desktop notifications are supported by the current browser.
     * The `window.webkitNotifications` object is primarily found in older versions of Chrome.
     */
    if ( window .webkitNotifications ) {

      // Notifications are supported.
      activate( $( '.needs_support' ) ) ; // Enable support-dependent elements.

      // Proceed to check the user's permission status.
      check_permission ( ) ;

    } else {

      // Notifications are not supported by the browser.
      $( "#not_supported" ) .fadeIn ( ) ; // Display a message indicating lack of support.

    } // End of notification support check.


    /*
     * Event handler for the 'Ask for Permission' button.
     * When clicked, it requests notification permission from the user.
     */
    $( '#ask_permission' ) .click ( function ( e ) {
      // Prevent the default action (e.g., form submission or navigation).
      e .preventDefault ( ) ;

      // Request permission from the user.
      // The `check_permission` function will be called as a callback
      // once the user responds to the permission prompt.
      window .webkitNotifications .requestPermission ( check_permission ) ;
    } ) ; // End of click handler for #ask_permission.


    /*
     * Event handler for the 'Plain Text Notification' form submission.
     * This section demonstrates how to create and display a basic text notification.
     */
    $( '#plain_form' ) .submit ( function ( e ) {
      e .preventDefault ( ) ; // Stop the form from submitting normally.

      // Retrieve values from form fields.
      var icon = $( '#plain_icon' ) .val ( ) ,
          title = $( '#plain_title' ) .val ( ) ,
          message = $( '#plain_message' ) .val ( ) ,
          notification ; // Declare a variable to hold the notification object.

      // Create a new plain text notification instance.
      notification = window .webkitNotifications .createNotification ( icon , title , message ) ;

      // Define the `ondisplay` event handler for the notification.
      // This function executes when the notification is shown to the user.
      notification .ondisplay = function ( ) {
        $( '#plain_debug' ) .html ( 'Fired the <b>ondisplay</b> event<br>' + $( '#plain_debug' ) .html ( ) ) ;
      } ;

      // Define the `onclose` event handler for the notification.
      // This function executes when the notification is dismissed by the user or system.
      notification .onclose = function ( ) {
        $( '#plain_debug' ) .html ( 'Fired the <b>onclose</b> event<br>' + $( '#plain_debug' ) .html ( ) ) ;
      } ;

      // Display the notification to the user.
      // Calling `notification.close()` programmatically would dismiss it.
      notification .show ( ) ;
    } ) ; // End of submit handler for #plain_form.


    /*
     * Event handler for the 'HTML Notification' form submission.
     * This section illustrates how to create and display an HTML-based notification.
     */
    $( '#html_form' ) .submit ( function ( e ) {
      e .preventDefault ( ) ; // Prevent the default form submission behavior.

      // Get the URL of the HTML file to be used for the notification content.
      var file = $( '#html_file' ) .val ( ) ,
          notification ; // Variable to store the HTML notification object.

      // Create a new HTML notification instance using the specified file.
      notification = window .webkitNotifications .createHTMLNotification ( file ) ;

      // Set up the `ondisplay` event handler for the HTML notification.
      // This runs when the notification becomes visible.
      notification .ondisplay = function ( ) {
        $( '#html_debug' ) .html ( 'Fired the <b>ondisplay</b> event<br>' + $( '#html_debug' ) .html ( ) ) ;
      } ;

      // Set up the `onclose` event handler for the HTML notification.
      // This runs when the notification is closed.
      notification .onclose = function ( ) {
        $( '#html_debug' ) .html ( 'Fired the <b>onclose</b> event<br>' + $( '#html_debug' ) .html ( ) ) ;
      } ;

      // Show the HTML notification.
      notification .show ( ) ;
    } ) ; // End of submit handler for #html_form.

  } ) ; // End of document.ready function.

} ) ( jQuery ) ; // End of immediately invoked function expression (IIFE) with jQuery alias.