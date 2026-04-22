/*
 * This is a self-invoking anonymous function,
 * a common pattern in JavaScript to create a private scope
 * and avoid polluting the global namespace.
 */
( function ( ) {


  // Declare all variables at the top of this scope.
  // This helps in understanding variable visibility and prevents hoisting surprises.
  var blinky      , // Represents the Blinky ghost object.
      counter     , // A general-purpose counter, currently unused.
      ghosts      , // An array holding the names of available ghosts.
      http        , // The Node.js HTTP module.
      io          , // The Socket.IO library for real-time communication.
      pacman      , // Represents the Pac-Man character's state.
      pinky       , // Represents the Pinky ghost object.
      redis       , // The Redis client library.
      redisClient , // An instance of the Redis client.
      server      , // The HTTP server instance.
      socket      ; // The Socket.IO server instance.


  // Load the built-in Node.js HTTP module.
  http = require ( 'http' ) ;


  // Load the Socket.IO library.
  io = require ( 'socket.io' ) ;


  // Load the Redis client library.
  redis = require ( 'redis' ) ;


  // Create a new Redis client. This client will connect to the default Redis server
  // running on localhost:6379, unless configured otherwise.
  redisClient = redis . createClient ( ) ;


  // Attach an error handler to the Redis client.
  // If any error occurs with the Redis connection or operations, it will be logged here.
  redisClient . on ( 'error' , function ( err ) {

    // Log the error message to the console.
    return console . log ( 'Error' + err ) ;

  } ) ;


  // Create a basic HTTP server using the http module.
  server = http . createServer ( ) ;


  // Make the HTTP server listen for incoming connections on port 8080.
  // This is the port clients will connect to.
  server . listen ( 8080 ) ;


  // Integrate Socket.IO with the HTTP server.
  // This enables WebSocket communication on the same port.
  socket = io . listen ( server ) ;


  // Initialize the Pac-Man object with its initial properties.
  // This includes its type, starting coordinates, and sprite identifier.
  pacman = {
    type:   'location'  , // Indicates this object defines a location.
    x:      450         , // Initial X-coordinate.
    y:      150         , // Initial Y-coordinate.
    sprite: 'pacman'      // The name of the sprite to use for Pac-Man.
  } ;


  // Initialize the Blinky ghost object.
  // This object could potentially hold more properties, but currently only has coordinates.
  blinky = {
    x: 10 , // Blinky's initial X-coordinate.
    y: 60   // Blinky's initial Y-coordinate.
  } ;


  // Initialize the Pinky ghost object.
  // Similar to Blinky, currently holds only coordinates.
  pinky = {
    x: 10 , // Pinky's initial X-coordinate.
    y: 30   // Pinky's initial Y-coordinate.
  } ;


  // An array containing the names of the ghosts available to be assigned to players.
  ghosts = [ 'clyde' , 'inky' , 'blinky' , 'pinky' ] ;


  // A simple counter variable, initialized to zero. Its purpose is not clear from this snippet.
  counter = 0 ;


  // Set up an event listener for when a new client connects to the Socket.IO server.
  socket . on ( 'connection' , function ( client ) {

    // Declare variables local to this client connection's scope.
    var getSprite , // A function to retrieve sprite data from Redis.
        ghost     ; // The name of the ghost assigned to this client.


    // Define a helper function to get sprite data from Redis.
    // This function takes a sprite name and retrieves its stored location.
    getSprite = function ( name ) {

      // Use the Redis client to get the data associated with the given name.
      return redisClient . get ( name , function ( error , data ) {

        // If no data is found for the sprite, exit the function.
        if ( ! data ) {
          return ;
        }

        // Log any error that might have occurred during the Redis GET operation.
        // Note: If data is not null, error might still be null or an empty string.
        console . log ( error ) ;

        // Parse the JSON string data retrieved from Redis into a JavaScript object.
        console . log ( JSON . parse ( data ) ) ;
        data = JSON . parse ( data ) ;

        // Send the retrieved location data back to the connected client.
        // This updates the client's view of the sprite's position.
        return client . send ( {
          type:   'location'  , // Message type indicating a location update.
          sprite: name        , // The name of the sprite being updated.
          x:      data . x    , // The sprite's X-coordinate.
          y:      data . y      // The sprite's Y-coordinate.
        } ) ;

      } ) ;

    } ;


    // Assign a ghost to the newly connected client.
    // The `pop()` method removes the last element from the 'ghosts' array and returns it.
    ghost = ghosts . pop ( ) ;


    // Log the name of the ghost assigned to the current client to the server console.
    console . log ( ghost ) ;


    // Send a message to the client, informing it which ghost it has been assigned.
    client . send ( {
      type: 'ghost' , // Message type indicating ghost assignment.
      name: ghost     // The name of the assigned ghost.
    } ) ;


    // Broadcast a message to all other connected clients (excluding the sender)
    // to notify them that a new ghost has joined the game.
    client . broadcast ( {
      type: 'newghost' // Message type for new ghost notification.
    } ) ;


    // Set up an event listener for incoming messages from this client.
    client . on ( 'message' , function ( message ) {

      // Log the received message to the server console for debugging.
      console . log ( message ) ;

      // Use a switch statement to handle different types of messages from the client.
      switch ( message . type ) {

        // Case for 'location' messages, indicating a ghost's new position.
        case 'location' :
          // Store the ghost's new location in Redis.
          // The location (x, y) is stringified into JSON before storage.
          redisClient . set ( message . ghost , JSON . stringify ( {
            x: message . x , // The ghost's new X-coordinate.
            y: message . y   // The ghost's new Y-coordinate.
          } ) ) ;

          // Broadcast the ghost's new location to all other clients.
          // This updates their view of the ghost's position in real-time.
          return client . broadcast ( {
            type:   'location'      , // Message type for location update.
            sprite: message . ghost , // The name of the ghost whose location is updated.
            x:      message . x     , // The updated X-coordinate.
            y:      message . y       // The updated Y-coordinate.
          } ) ;

        // Case for 'win' messages, indicating a ghost has won the game.
        case 'win' :
          // Broadcast the 'win' message to all other clients.
          client . broadcast ( {
            type: 'win'   , // Message type for win event.
            ghost: ghost    // The ghost that won.
          } ) ;
          // Also send the 'win' message back to the client that sent it.
          return client . send ( {
            type: 'win'   , // Message type for win event.
            ghost: ghost    // The ghost that won.
          } ) ;

      }

    } ) ;


    // Set up an event listener for when this client disconnects from the server.
    return client . on ( 'disconnect' , function ( ) {

      // Log the disconnection event to the server console.
      console . log ( 'disconnected' ) ;

      // Add the ghost name back to the 'ghosts' array, making it available for new players.
      ghosts . push ( ghost ) ;

      // Log that the ghost is being reset (returned to the pool).
      console . log ( 'resetting' + ghost ) ;

      // Broadcast a message to all other clients to effectively "remove" the disconnected ghost
      // from their view by moving its sprite off-screen.
      return client . broadcast ( {
        type:   'location'  , // Message type for location update.
        sprite: ghost       , // The disconnected ghost's sprite.
        x:      -100        , // Move off-screen (X-coordinate).
        y:      -100          // Move off-screen (Y-coordinate).
      } ) ;

    } ) ;

  } ) ;


// The `call(this)` at the end executes the anonymous function,
// setting its `this` context to the global object (window in browsers, global in Node.js).
} ) . call ( this ) ;