var sys    = require( 'sys' ),
    http   = require( 'http' ),
    ws     = require( "./vendor/ws" ),
    base64 = require( './vendor/base64' ),
    arrays = require( './vendor/arrays' ) ;

// This section handles command line arguments for authentication and keyword filtering.
var USERNAME = process.ARGV[ 2 ] ; // Twitter username provided as the second argument.
var PASSWORD = process.ARGV[ 3 ] ; // Twitter password provided as the third argument.
var KEYWORD  = process.ARGV[ 4 ] || "iphone" ; // Keyword to track, defaults to "iphone" if not provided.

// Validate that both username and password have been supplied.
if ( ! USERNAME || ! PASSWORD ) {
    return sys.puts( "Usage: node server.js <twitter_username> <twitter_password> <keyword>" ) ;
}

// Prepare authentication headers for the Twitter Streaming API.
var auth = base64.encode( USERNAME + ':' + PASSWORD ) ; // Encode credentials for Basic Authentication.
var headers = {
    'Authorization' : "Basic " + auth, // The 'Authorization' header with the encoded credentials.
    'Host'          : "stream.twitter.com" // Specifies the host for the request.
} ;

// An array to keep track of all currently connected WebSocket clients.
var clients = [ ] ;

// Establish a connection to Twitter's streaming API.
var twitter = http.createClient( 80, "stream.twitter.com" ) ; // Create an HTTP client for stream.twitter.com on port 80.
var request = twitter.request( "GET", "/1/statuses/filter.json?track=" + KEYWORD, headers ) ; // Construct the GET request.

// A buffer to accumulate incoming data chunks from the Twitter stream.
var message = "" ;

request.addListener( 'response', function ( response ) {
    // Set the character encoding for the incoming data stream to UTF-8.
    response.setEncoding( "utf8" ) ;
    
    response.addListener( "data", function ( chunk ) {
        // Append the received data chunk to our message buffer.
        message += chunk ;

        // Tweets are delimited by a newline character ('\r').
        var newlineIndex = message.indexOf( '\r' ) ;

        // As per Twitter's API documentation, a response should only be considered
        // complete and parsed once a newline character is encountered.
        if ( newlineIndex !== -1 ) {
            var tweet = message.slice( 0, newlineIndex ) ; // Extract the complete tweet.
            
            // Iterate over each connected WebSocket client.
            clients.forEach( function ( client ) {
                // Send the received tweet to the current client.
                client.write( tweet ) ;
            } ) ;
        }
        // Remove the processed tweet (and its delimiter) from the buffer for the next incoming data.
        message = message.slice( newlineIndex + 1 ) ;
    } ) ;

} ) ;
request.end( ) ; // Send the HTTP request to Twitter.

// Initialize and start the WebSocket TCP server.
ws.createServer( function ( websocket ) {
    // Add the newly connected WebSocket client to our collection.
    clients.push( websocket ) ;

    websocket.addListener( "connect", function ( resource ) {
        // This event is triggered after a successful WebSocket handshake.
        sys.debug( "WebSocket client connected: " + resource ) ;
    } ).addListener( "close", function ( ) {
        // This event fires when the WebSocket connection is closed by either party.
        clients.remove( websocket ) ; // Remove the disconnected client from the array.
        sys.debug( "WebSocket client disconnected." ) ;
    } ) ;
} ).listen( 8080 ) ; // The WebSocket server will listen for incoming connections on port 8080.