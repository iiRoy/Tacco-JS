/*
 * This is a JavaScript module for Web-based tailing functionality.
 * It establishes a WebSocket connection to a specified port
 * and displays incoming messages in the browser.
 */
var Webtail = {

  // The main function to start the WebSocket connection
  run: function(   port   ) {
    // Store a reference to 'this' for use within nested functions.
    var   self   =   this;

    // Execute this function when the DOM is fully loaded using jQuery.
    jQuery(  function( $ ) {

      // Establish a new WebSocket connection.
      // It tries WebSocket first, then falls back to MozWebSocket for older browsers.
      var socket = new (  WebSocket  ||  MozWebSocket  )(  'ws://localhost:' + port  );

      // Initialize an empty context object, which can be used to maintain state
      // across different message handlers.
      var   context = { };

      // Define the callback function to handle incoming messages from the WebSocket.
      socket.onmessage = function(  message  ) {
          // Iterate over all registered message handlers and execute each one.
          // The 'this' context within the $.each loop refers to the current handler function.
          $.each(  self.onmessages,  function( ) {
            // Call the message handler, passing the message and the shared context.
            this(   message,   context   );
          }  );
      };

    }  ); // End of jQuery document ready function
  }, // End of 'run' method

  // Array of functions that will be called when a new message arrives from the WebSocket.
  // Each function receives the message object and a shared context object.
  onmessages: [

    // Default message handler function.
    function(  message,  context  ) {

      // Primary logic for handling an incoming WebSocket message.

      // Check to ignore consecutive empty lines to prevent excessive scrolling.
      // An empty line is represented by '\n'.
      if (  message.data  ==  '\n'  &&  $('pre:last').text()  ==  '\n'  ) {
        // If it's a serial empty line, just exit.
        return;
      }

      // Create a new <pre> HTML element, set its text content to the message data,
      // and append it to the 'body' of the document.
      // <pre> preserves whitespace and line breaks.
      $('<pre>')
        .text(  message.data  )
        .appendTo(  'body'  );

      // Scroll the browser window to the very bottom to show the latest message.
      // This provides a "tail -f" like experience.
      $('html, body').scrollTop(  $(document).height()  );
    } // End of the default message handler function
  ] // End of 'onmessages' array
}; // End of Webtail object definition