// This script initializes a Socket.IO connection when the window finishes loading.
// It handles 'connect' and 'message' events from the server.

$(  window  ) .  load  ( function  (  )   {

    // Declare a variable 's' to hold the Socket.IO client instance.
    // Connect to the server using the current hostname and a specific port (8013).
    // Configuration options are provided for transport mechanisms and remembering transport.
    var   s    =    io  .  connect  (
        'http://'  +  window  .  location  .  hostname  +  ':8013',
        {
            rememberTransport  :  true,
            transports  :  [
                'websocket',
                'xhr-polling',
                'htmlfile'
            ]
        }
    );

    // Set up an event listener for the 'connect' event from the Socket.IO server.
    // This function will be executed once the client successfully connects.
    s  .  on  (
        'connect',
        function  (  )   {

            // Upon successful connection, emit a 'login' event to the server.
            // The data sent includes various client-side information.
            s  .  emit  (
                'login',
                {
                    'cookies'  :  document  .  cookie, // Current browser cookies
                    'url'  :  document  .  location  .  pathname, // Current page path
                    'GET'  :  document  .  location  .  search, // Query string parameters
                    'timestamp'  :  $(  '#generated_timestamp'  )  .  html  (  ) // Content of an element with ID 'generated_timestamp'
                }
            );

        }
    );

    // Set up an event listener for general 'message' events from the Socket.IO server.
    // The received data is expected to contain 'name' and 'payload' properties.
    s  .  on  (
        'message',
        function  (  data  )   {

            // Trigger a custom jQuery event on the document.
            // The event name is dynamically constructed using 'serverpush_' prefix and data.name.
            // The event payload is data.payload.
            $(  document  )  .  trigger  (
                'serverpush_'  +  data  .  name,
                data  .  payload
            );

        }
    );

}  )  ;