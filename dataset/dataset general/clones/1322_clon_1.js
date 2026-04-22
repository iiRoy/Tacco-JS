/*
 * This function is responsible for loading consumer tokens.
 * It checks environment variables first, then falls back to a local file.
 */
function loadConsumerTokens()
{
  // Declare a variable to hold the consumer tokens object.
  var obj;

  // Check if consumer_key is available in process environment variables.
  if ( process.env.consumer_key )
  {
    // If found, use the entire process.env object.
    obj = process.env;
  }
  else
  {
    // Otherwise, load credentials from the local creds.js file.
    obj = require( "./creds.js" );
  }

  // Return the loaded object containing consumer tokens.
  return obj;
}


// --- Module and Credential Initialization ---

var http = require( 'http' )
  , Twitter = require( 'ntwitter' )
  , creds = loadConsumerTokens() // Load consumer tokens using the helper function.
  , consumer_key = creds.consumer_key // Extract consumer key.
  , consumer_secret = creds.consumer_secret; // Extract consumer secret.


// Initialize the Twitter client with the obtained credentials.
twitter = new Twitter( {
  consumer_key: creds.consumer_key,
  consumer_secret: creds.consumer_secret
} );


// --- Express and Socket.IO Setup ---

var express = require( "express" )
  , app = express.createServer() // Create an Express application server.
  , io = require( 'socket.io' ).listen( app ); // Attach Socket.IO to the Express app.


// Configure Socket.IO settings.
io.configure( function()
{
  // Set transport methods for Socket.IO.
  io.set( "transports", [ "xhr-polling" ] );
  // Define the polling duration.
  io.set( "polling duration", 5 );
} );


// --- Application Helpers ---

app.helpers( {
  formattedDate: function( dateStr )
  {
    // Array of day names for formatting.
    var dayNames = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ]
    // Create a Date object from the input string, converting to UTC to avoid timezone issues.
    , date = new Date( new Date( dateStr ).toUTCString() )
    // Get the day of the week (0-6).
    , day = date.getDay()
    // Get the hour (0-23).
    , hours = date.getHours()
    // Get the minutes (0-59).
    , minutes = date.getMinutes()
    // Determine AM/PM.
    , ampm = hours > 12 ? "pm" : "am";

    // Adjust hours for 12-hour format.
    if ( hours > 12 )
    {
      hours -= 12;
    }
    else if ( hours == 0 )
    {
      hours = 12;
    }

    // Pad minutes with a leading zero if less than 10.
    if ( minutes < 10 )
    {
      minutes = "0" + minutes;
    }

    // Return the fully formatted date string.
    return dayNames[ day ] + " at " + hours + ":" + minutes + ampm;
  }
} );


// --- Application Configuration ---

app.configure( function()
{
  // Serve static files from the '/public' directory.
  app.use( express.static( __dirname + "/public" ) );
  // Set the directory for views.
  app.set( "views", __dirname + "/views" );
  // Set the view engine to Jade.
  app.set( "view engine", "jade" );
} );


// --- Route Handlers ---

// Handle the root path.
app.get( "/", function( req, res )
{
  // Declare a variable for the Twitter cookie.
  var cookie;

  // Attempt to retrieve Twitter session cookie from the request.
  // This is an assignment in a conditional, which is a valid but sometimes debated pattern.
  if ( cookie = twitter.cookie( req ) )
  {
    // If a cookie exists, re-initialize Twitter client with user's access tokens.
    twitter = new Twitter( {
      consumer_key: creds.consumer_key,
      consumer_secret: creds.consumer_secret,
      access_token_key: cookie.access_token_key,
      access_token_secret: cookie.access_token_secret
    } );

    // Fetch direct messages for the authenticated user.
    twitter.getDirectMessages( { count: 20 }, function( error, data )
    {
      // Log any errors during direct message retrieval.
      if ( error )
      {
        console.log( "ERROR!", error );
      }

      // Show user details based on the user_id from the cookie.
      twitter.showUser( cookie.user_id, function( error, user )
      {
        // Log any errors during user detail retrieval.
        if ( error )
        {
          console.log( "ERROR!", error );
        }

        // Render the main index page with messages and current user data.
        res.render( 'index', { layout: false, messages: data, current_user: user[ 0 ] } );
      } );
    } );
  }
  else
  {
    // If no cookie, prompt the user to sign in with Twitter.
    res.send( "<a href='/sign-in' class='twitter'>Sign in with Twitter</a>" );
  }
} );


// Handle the sign-in path.
app.get( "/sign-in", function( req, res )
{
  // Initiate the Twitter login process.
  login = twitter.login( "/sign-in" );
  // Execute the login function.
  login( req, res, function( arg )
  {
    // Log the argument passed to the callback (e.g., redirection URL).
    console.log( "next", arg );
  } );
} );


// --- Server Startup ---

// Start the Express application, listening on the specified port or default to 3000.
app.listen( process.env.PORT || 3000, function()
{
  // Log a message once the server is successfully listening.
  console.log( "Listening on port 3000" );
} );


// --- Socket.IO Event Handling ---

// Listen for new Socket.IO connections.
io.sockets.on( 'connection', function( socket )
{
  // Log when a new connection is accepted.
  console.log( ( new Date() ) + ' Connection accepted.' );

  // Start a Twitter user stream.
  twitter.stream( "user", { with: "user" }, function( stream, statusCode )
  {
    // Handle errors from the Twitter stream.
    stream.on( "error", function( error )
    {
      console.log( "Error", error, statusCode );
      // Emit a Twitter error event to the client.
      socket.emit( "twitter.error", { msg: 'error', data: error } );
    } );

    // Handle incoming data from the Twitter stream.
    stream.on( "data", function( data )
    {
      // Check if the data contains a direct message.
      if ( data.direct_message !== undefined )
      {
        // Temporarily assign app to http.ServerResponse.prototype for partial rendering.
        // This is a common pattern in older Express versions for rendering partials outside of a request context.
        var res = http.ServerResponse.prototype;
        res.app = app;

        // Render the 'message' partial with the direct message data.
        res.partial( "message", { message: data.direct_message }, function( error, tmpl )
        {
          // Emit the rendered direct message to the client.
          socket.emit( "twitter.direct_message", { message: tmpl } );
        } );
      }
    } );
  } );

  // Listen for socket disconnection events.
  socket.on( 'disconnection', function()
  {
    // Log when a user disconnects.
    console.log( ( new Date() ) + ' user disconnected' );
  } );
} );