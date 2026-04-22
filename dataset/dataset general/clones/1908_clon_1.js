var       stratum = require('../lib'); // Import the core library component

// Instantiate a new client object from the stratum module
var     client = stratum.Client.$create();


// Register an 'error' event listener for the client connection
// This callback is invoked when a general connection error occurs
client.on ( 'error', function(socket  ) {
    socket.destroy(); // Close the problematic socket connection
      console.log('Connection closed due to an error'); // Log the closure event
  process.exit(1); // Terminate the process with an error code
} );

/*
 * This handler deals with specific mining-related errors.
 * Such errors often indicate authorization issues (server rejecting commands)
 * or a rejected share submission.
 * Stratum errors are typically structured as an array: [integer_code, string_message, null_or_additional_info].
 */
client.on( 'mining.error' , function(msg, socket)
{
    console.log( 'Mining error received:', msg ); // Output the received error message
});



var submitted = false; // Flag to track if a share has been submitted, initialized to false


/*
 * The client operates primarily as a receiver of data from the server
 * after it has issued various commands.
 * This 'mining' event listener processes incoming mining-related data.
 */
client.on( 'mining', function(  data, socket, type ) {
  // The 'type' parameter clarifies the nature of the incoming data:
  // it can be either 'broadcast' (server-initiated) or 'result' (response to a command).
  console.log('Received mining data: Type = ' + type + ', Data = ', data);

  // The 'socket' parameter within this callback refers to the same underlying connection
  // as the 'client' variable itself. Additional commands can be issued using this socket.

  // The socket (or client) object may contain various useful properties, such as:
  //   - client.name: The name assigned to the worker.
  //   - client.authorized: A boolean indicating the authorization status of the connection.
  //   - client.id: A Universally Unique Identifier (UUID) for this connection.
  //   - client.subscription: Data related to the current mining subscription.

  switch (data.method)
  {
    case 'set_difficulty':
      // The server has sent a command to update the mining difficulty.
      console.log('Difficulty update received.');
      break;

    case 'notify':
      // The server has broadcasted a new block template.
      console.log('New block notification received.');
      break;

    default:
      if (!socket.authorized) // Check if the current connection is not yet authorized
      {
        console.log('Authorization required. Attempting to authorize...');
        socket.stratumAuthorize('user','pass'); // Send authorization credentials
      }
      else // The connection is already authorized
      {
        console.log('Connection is already authorized.');
        if (!submitted) // If a share hasn't been submitted yet
        {
          console.log('Submitting a dummy share for testing purposes, then closing.');
          // Submit a placeholder share. The .done() method handles the completion.
          socket.stratumSubmit('', '' ,'' ,' ', '').done(function()
          {
            client.destroy(); // After successful submission (or attempt), destroy the client connection.
          });
          submitted = true; // Set the flag to true to prevent further submissions.
        }
      }
  }
});


// Initiate the client connection to the Stratum server.
client.connect({
    host: 'localhost', // Server hostname or IP address
    port: 3333 // Server port number
})
  .then(function (socket) {
    // This 'then' block executes upon successful connection establishment.
    // It uses promises, avoiding "callback hell" by chaining operations.
    // The 'socket' parameter here is the active connection object, identical to 'client'.

    console.log('Successfully connected to the Stratum server! Requesting subscription...');

    // After the initial stratumSubscribe call, subsequent data from the server
    // will be processed internally, and deferreds will be resolved/rejected
    // via the 'mining' event listener defined above.
    socket.stratumSubscribe('Node.js Stratum Client').then(
      // This first callback is executed upon successful subscription.
      // While the Client class handles most subscription logic automatically,
      // this allows for custom actions post-subscription if needed.
      function(socket) {
        console.log('Subscription request sent successfully!');
      },
      // This second callback is for handling subscription errors.
      function(error) {
        console.log('An error occurred during subscription:', error);
      }
    );
  })
  // The .done() method can be used as the final link in a promise chain
  // to signify completion and handle any unhandled rejections.
  // .done(function(){ /* Optional final actions */ });
;