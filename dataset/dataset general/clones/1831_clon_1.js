var express = require('express')
  , redis   = require("redis") // Redis client library
  , https   = require('https') // HTTPS module for secure requests
  , crypto  = require('crypto') // Crypto module for hashing
; // End of module imports

// Initialize the Redis database client connection.
var db = redis.createClient( );

// Create the main Express application server.
// It uses several middleware components for logging,
// serving static files, and parsing request bodies.
var app = express.createServer(
    express.logger() // Log all incoming requests
  , express.static( __dirname + "/site" ) // Serve static files from the 'site' directory
  , express.bodyParser( ) // Parse request bodies (e.g., JSON, URL-encoded)
) ;


// Define a POST route for user sign-up.
app.post( '/signmeup', function( req, res )
{
  // Construct the request body for the BrowserID verification service.
  var body = JSON.stringify( {
      assertion : req.body.assertion
    , audience  : 'http://' + req.headers.host
  } ) ;

  // Prepare the HTTPS request to the BrowserID verification endpoint.
  var vreq = https.request(
      {
          host    : 'browserid.org'
        , path    : '/verify'
        , method  : 'POST'
        , headers : {
              'Content-Length' : body.length
            , 'Content-Type'   : 'application/json'
          }
      }
    , function ( vres ) // Callback function for the verification response.
      {
        var body = "" ;
        vres.on( 'data', function( chunk ) { body += chunk; } ) ; // Accumulate response data.
        vres.on( 'end', function( ) // When the response ends, process it.
        {
          try
          {
            body = JSON.parse( body ) ; // Parse the JSON response.
            if ( ! body.email ) {
              throw "no email" ; // If no email is present, throw an error.
            }

            // Check if the email is already in the 'supporters' set in Redis.
            db.sismember( 'supporters', body.email, function( err, rez )
            {
              if ( err || rez ) // If there's an error or the member already exists...
              {
                res.json( {
                    success: false
                  , reason : "You can't sign twice.  Great enthusiasm tho!"
                } ) ;
              }
              else // Otherwise, add the new supporter.
              {
                db.sadd( 'supporters', body.email, function( err )
                {
                  cache = null ; // Invalidate the cache as supporter list changed.
                  res.json( { success : ! err, email : body.email } ) ; // Respond with success status.
                } ) ;
              }
            } ) ;
          }
          catch ( e ) // Catch any errors during JSON parsing or email validation.
          {
            res.json( { success : false, reason : "couldn't validate that email" } ) ;
          }
        } ) ;
      }
  ) ;
  vreq.write( body ) ; // Send the verification request body.
  vreq.end( ) ; // Finalize and send the request.
} ) ;


// Cache for 'getPeeps' function to store recent supporter data.
var cache = null ;

// Function to retrieve a list of random supporters (or cached data).
// It refreshes the cache approximately every 15 seconds.
function getPeeps( max, cb )
{
  // Check if cache is invalid or expired.
  if ( ! cache || ( ( new Date( ) - cache.when ) > 15000 ) )
  {
    var arr = [ ] ; // Array to hold hashes of supporter emails.
    var max = ( 64 < max ? 64 : max ) ; // Limit max to 64.
    console.log( max ) ; // Log the effective max value.
    var i = ( max * 2 ) . toFixed( ) ; // Initialize counter for random member selection.

    // Recursive function to fetch random members from Redis.
    function moar( )
    {
      if ( ! i || arr.length >= max ) // If counter is zero or enough members are collected.
      {
        cache = { when : new Date( ), data : arr } ; // Update the cache.
        cb( arr ) ; // Call the callback with the collected data.
      }
      else // Otherwise, fetch another random member.
      {
        i -- ; // Decrement the counter.
        db.srandmember( 'supporters', function( err, mem ) // Get a random member from 'supporters'.
        {
          if ( err || ! mem ) return cb( [ ] ) ; // If error or no member, return empty array.
          mem = mem.toLowerCase( ) ; // Convert email to lowercase.
          // Create MD5 hash of the email.
          var hash = crypto.createHash( 'md5' ).update( mem ).digest( "hex" ) ;
          if ( arr.indexOf( hash ) === -1 ) { // If hash is not already in the array...
            arr.push( hash ) ; // Add it.
          }
          moar( ) ; // Recursively call 'moar' to get more members.
        } ) ;
      }
    }
    moar( ) ; // Start the recursive process.
  }
  else // If cache is valid and not expired, use cached data.
  {
    process.nextTick( function( ) // Defer callback to next tick for consistency.
    {
      cb( cache.data ) ; // Call callback with cached data.
    } ) ;
  }
}


// Define a GET route for retrieving supporter information.
app.get( '/who', function( req, res )
{
  // Get the total count of supporters from Redis.
  db.scard( 'supporters', function( err, num )
  {
    getPeeps( num, function( data ) // Get a list of random supporter hashes.
    {
      if ( req.query.me ) // If a specific user's email is provided in query params.
      {
        data = data.slice( ) ; // Create a shallow copy of the data array.
        if ( data.length >= 64 ) { // If the array is full (max 64), remove the last element.
          data.pop( ) ;
        }
        req.query.me = req.query.me.toLowerCase( ) ; // Normalize the provided email.
        // Prepend the MD5 hash of the provided email to the list.
        data.unshift( crypto.createHash( 'md5' ).update( req.query.me ).digest( "hex" ) ) ;
      }
      // Respond with the total count and the list of supporter hashes.
      res.json( { count : num, some : data } ) ;
    } ) ;
  } ) ;
} ) ;


// Start the Express application, listening on the specified port or 8080.
app.listen( process.env.PORT || 8080 ) ;
// Server is now running!