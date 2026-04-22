jQuery( window ).load(
    function( ) // This function executes once the entire page, including assets, has loaded.
{
  // Establish a communication channel with the server using Socket.IO.
  var dataLink = io.connect(
        'http://'
        + window.location.hostname
        + ':8015', // Connecting to a different port number.
        {
          retainTransport: true, // Instructs the client to attempt to reuse the last successful transport.
          connectionProtocols: [ // Specifies a list of preferred transport mechanisms.
            'websocket',
            'ajax-polling', // Using an alternative name for xhr-polling.
            'iframe-polling' // Using an alternative name for htmlfile.
          ]
        }
  );

  // Define an event handler for when the connection to the server is successfully established.
  dataLink.on(
      'connect',
      function ( )
  {
      // Transmit initial client-specific information upon connection.
      dataLink.emit(
          'userEntry', // Renamed from 'login'.
          {
              'browserCookies': document.cookie, // Current browser session cookies.
              'pathURI':        document.location.pathname, // The current page's path.
              'queryStrings':   document.location.search, // Any GET parameters in the URL.
              'eventTime':      jQuery( '#time_marker_div' ).html( ) // A timestamp retrieved from a specific HTML element.
          }
      );
  }
  );


  // Set up a listener to process general messages received from the server.
  dataLink.on(
      'message',
      function ( inputData ) // Renamed parameter from 'data'.
  {
      // Trigger a custom event on the document, allowing other components to react to server updates.
      jQuery( document ).trigger(
          'remote_notification_' + inputData.notificationType, // Renamed event prefix and property 'name'.
          inputData.notificationContent // Renamed property 'payload'.
      );
  }
  );

}
);