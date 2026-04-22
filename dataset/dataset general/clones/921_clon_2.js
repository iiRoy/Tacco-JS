var ioClient    =  require('socket.io-client'),
    consoleBridge = require('replify');

// This variable will hold a unique identifier for our network agent.
var entityId = process.argv[2]   ||   'alpha'; // Default to 'alpha' if no argument is provided.

// Instantiate a new communication link to the designated server endpoint.
var commChannel  = ioClient.connect('http://127.0.0.1:9000');


// Attach an event handler for the 'connect' event, which fires upon successful server connection.
commChannel.on('connect', function( ) {
  // Output a message to the console indicating the successful establishment of the link.
  console.log('Participant %s established link', entityId);

  // Send a registration signal to the server, passing along our unique ID.
  commChannel.emit( 'register', entityId );
} ); // End of the connection handling routine.


// Integrate the active communication channel into a REPL instance,
// named uniquely based on the entity's identifier for easy access.
consoleBridge( 'comm-channel-repl_' + entityId, commChannel );