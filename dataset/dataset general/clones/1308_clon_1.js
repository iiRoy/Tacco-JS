// This is a self-executing anonymous function,
// often used to create a private scope for variables
// and prevent pollution of the global namespace.
( function () {

  // Declare a variable to hold the jQuery object.
  // It will be assigned once jQuery is loaded or identified.
  var jQuery;

  // Define the Fully Qualified Domain Name (FQDN) for the server.
  // This is where widget-related resources and API endpoints are located.
  var serverFQDN = 'http://localhost:8080' ;

  // Declare several variables that will be used across different functions
  // within this module. 'timeoutId' is declared but not used in this snippet.
  var timeoutId,
      options,    // Stores configuration settings for the widget instance.
      container;  // Holds the CSS selector for the widget's main DOM element.


  // Ensure the global 'window.BaltJS' object exists.
  // If it doesn't, initialize it as an empty object.
  // This is where our widget constructor will be attached.
  if ( ! window.BaltJS ) {
    window.BaltJS = {};
  }


  /**
   * The main constructor function for the BaltJS Widget.
   * It takes an options object and sets up initial configurations.
   * @param {object} opts - An object containing configuration parameters for the widget.
   */
  BaltJS.Widget = function ( opts ) {

    // Assign the incoming options object to the module-level 'options' variable.
    options = opts ;

    // Check if a custom button text has been provided in the options.
    if ( ! options.buttonText ) {
      // If not, set a default, configurable text for the button.
      options.buttonText = 'This text is configurable';
    }

    // Set the default CSS selector for the widget's main container element.
    container = '.widget-body' ;

  }; // End of BaltJS.Widget constructor definition.


  /**
   * The primary initialization function for the widget.
   * It handles the crucial step of ensuring jQuery is available
   * and correctly loaded before proceeding with widget setup.
   */
  function init () {

    // Check two conditions:
    // 1. Is 'window.jQuery' undefined? (jQuery not present)
    // 2. Is 'window.jQuery.fn.jquery' not equal to '1.6.4'? (Wrong version)
    if ( window.jQuery === undefined || window.jQuery.fn.jquery !== '1.6.4' ) {

      /*
       * jQuery is either not on the page or is an incompatible version.
       * We must dynamically load jQuery 1.6.4 from a CDN.
       */
      // console.log('we need to load jQuery'); // A debugging message, now commented out.

      // Create a new HTML <script> element.
      var script_tag = document.createElement( 'script' );
      // Set the 'type' attribute for the script.
      script_tag.setAttribute( "type" , "text/javascript" );
      // Set the 'src' attribute to the jQuery CDN URL.
      script_tag.setAttribute( "src" , "https://ajax.googleapis.com/ajax/libs/jquery/1.6.4/jquery.js" );

      // Append the newly created script tag to the document's <head> section.
      // Fallback to document.documentElement if head is not immediately available.
      ( document.getElementsByTagName( "head" )[ 0 ] || document.documentElement ).appendChild( script_tag );

      // Check if the browser supports 'attachEvent', which indicates Internet Explorer.
      if ( script_tag.attachEvent ) {
        // console.log('oh cool, this is IE'); // Another debugging message for IE.

        // For IE, use 'onreadystatechange' to monitor the script loading progress.
        script_tag.onreadystatechange = function () { // This function serves as the callback for IE.
          // Check if the script's readyState indicates it's fully loaded or complete.
          if ( this.readyState == 'complete' || this.readyState == 'loaded' ) {
            // Once loaded, clear the event handler to prevent potential memory leaks or double-execution.
            this.onreadystatechange = null ;
            // Call the handler function that proceeds after jQuery is loaded.
            scriptLoadHandler();
          }
        }; // End of IE-specific onreadystatechange handler.

      } else {
        // For modern browsers, use the standard 'onload' event listener.
        script_tag.onload = scriptLoadHandler ;
      }

    } else {
      // jQuery is already present on the page and is the correct version.
      // Assign the global jQuery object to our local 'jQuery' variable.
      jQuery = window.jQuery ;
      // console.log('jQuery already exists on page'); // Debugging message for existing jQuery.
      // Proceed directly to the main widget setup function.
      main();
    }

  } // End of the init function.


  /**
   * This function is called once the jQuery script has successfully loaded.
   * It takes control of the jQuery object and then initiates the main widget setup.
   */
  function scriptLoadHandler () {

    // Take ownership of the jQuery object using noConflict() to avoid conflicts
    // with other JavaScript libraries that might be using the '$' or 'jQuery' global.
    jQuery = window.jQuery.noConflict();
    // console.log('jQuery is now loaded'); // Debugging message confirming jQuery load.

    // Now that jQuery is ready and managed, proceed to the main setup process.
    main();

  } // End of scriptLoadHandler function.


  /**
   * The core function responsible for setting up the widget's environment.
   * This includes loading CSS, additional scripts, and preparing the DOM structure.
   */
  function main () {

    // Ensure that the entire DOM is loaded and ready before attempting to
    // manipulate elements or attach event handlers.
    jQuery( document ).ready( function () {

      // Dynamically append stylesheet links to the document's <head>.
      // First, include a 'cleanslate' CSS for style isolation within the widget.
      jQuery( 'head' ).append( '<link href="' + serverFQDN + '/vendor/cleanslate.css" rel="stylesheet" type="text/css">' );
      // Second, include the widget's specific stylesheet.
      jQuery( 'head' ).append( '<link href="' + serverFQDN + '/widget.css" rel="stylesheet" type="text/css">' );

      // Dynamically load the 'json2.js' script. This provides JSON parsing
      // capabilities for older browsers that might not have it natively.
      jQuery.getScript( serverFQDN + '/vendor/json2.js' );

      // Check if the designated widget container element already exists in the DOM.
      if ( jQuery( container ).size() === 0 ) {
        // If the container is not found, create a new div with the class 'widget-body'
        // and append it to the document's <body>.
        jQuery( 'body' ).append( '<div class="widget-body"></div>' );
      }

      // Add the 'cleanslate' class to the widget container. This helps in
      // resetting styles within the widget to prevent external CSS interference.
      jQuery( container ).addClass( 'cleanslate' );

      // Call the 'render' function to build and display the widget's UI elements.
      render();

    } ); // End of jQuery(document).ready callback function.

  } // End of main function.


  /**
   * Renders the interactive user interface elements of the widget.
   * This typically involves creating input fields and buttons.
   */
  function render () {

    // Initialize an empty string variable to build the HTML markup.
    var markup = '' ;

    // Append an input text field to the markup string.
    markup = markup + '<input type="text" id="user_text" placeholder="type something"></input>' ;
    // Append a button with its text configured via the 'options' object.
    markup = markup + '<button>' + options.buttonText + '</button>' ;

    // Insert the generated HTML markup into the widget's container element.
    jQuery( container ).append( markup );

    // Attach a click event handler to the button within the widget container.
    // The 'handleClick' function will be executed when the button is clicked.
    jQuery( container + ' button' ).click( handleClick );

  } // End of render function.


  /**
   * Event handler for the widget's button click.
   * It disables the button and sends a JSONP request to the server.
   */
  function handleClick () {

    // Disable the clicked button to prevent multiple submissions while a request is in progress.
    jQuery( this ).attr( 'disabled' , 'disabled' );

    // Make a JSONP (JSON with Padding) request to the server.
    // This technique allows making cross-domain AJAX-like requests.
    jQuery.getJSON( serverFQDN + '/widget_submit.php?callback=?' , {
      // Data payload to be sent with the request:
      install_url: window.location.href , // The URL of the page where the widget is embedded.
      text       : jQuery( container + ' #user_text' ).val() // The text entered by the user in the input field.
    } , serverResponse ); // Specify 'serverResponse' as the callback function to handle the server's reply.

  } // End of handleClick function.


  /**
   * Callback function that processes the response received from the server
   * after a JSONP submission. It re-enables the button and updates the status.
   * @param {object} data - The JSON object returned by the server.
   */
  function serverResponse ( data ) {

    // Re-enable the button in the widget container, allowing further interactions.
    jQuery( container + ' button' ).removeAttr( 'disabled' );

    // Update the widget's status display with information received from the server.
    // This includes a message, IP address, host site, and user agent.
    updateStatus( data.message + ' Your ip is ' + data.ip + '. Host site is ' + data.site + '. UA is ' + data.ua );

  } // End of serverResponse function.


  /**
   * Updates the textual status message displayed within the widget.
   * It dynamically creates a message paragraph if one doesn't already exist.
   * @param {string} msg - The message string to be displayed to the user.
   */
  function updateStatus ( msg ) {

    // Check if a paragraph element with the class 'message' exists within the widget container.
    if ( jQuery( container + ' p.message' ).length === 0 ) {
      // If no message paragraph is found, create and append one to the container.
      jQuery( container ).append( '<p class="message"></p>' );
    }

    // Set the HTML content of the message paragraph to the provided message string.
    jQuery( container + ' p.message' ).html( msg );

  } // End of updateStatus function.


  // Initiate the widget's lifecycle by calling the 'init' function.
  // This will begin the process of loading dependencies and rendering the UI.
  init();

} )(); // End of the self-executing anonymous function wrapper.