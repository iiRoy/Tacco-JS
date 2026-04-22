/*
 * This section is responsible for initializing the web server infrastructure
 * and setting up the real-time communication layer using Socket.IO.
 */
var twitter   =  require ( 'twitter' ) ;
var express   =  require ( 'express' ) ;
var app       =  express ( ) ;
var http      =  require ( 'http' ) ;
var server    =  http.createServer ( app ) ;
var io        =  require ( 'socket.io' ) .listen ( server ) ;


/*
 * Configure the Twitter API client with authentication credentials.
 * REPLACE THE PLACEHOLDER VALUES WITH YOUR ACTUAL API KEYS.
 */
var twit      =  new twitter ( {
    consumer_key        :  '<ENTER>' ,           // Your Twitter API consumer key.
    consumer_secret     :  '<ENTER>' ,           // Your Twitter API consumer secret.
    access_token_key    :  '<ENTER>' ,           // Your Twitter API access token key.
    access_token_secret :  '<ENTER>'              // Your Twitter API access token secret.
} ) ;


// This variable will hold the active Twitter streaming API connection.
var stream    =  null ;


/*
 * The server listens on the port specified by the environment variable `PORT`.
 * If `PORT` is not defined (e.g., in a local development environment),
 * it defaults to port 8081.
 */
server.listen ( process.env.PORT || 8081 ) ;


/*
 * Configure Express to serve static files from the 'public' directory.
 * This is where your client-side HTML, CSS, and JavaScript files are located.
 */
app.use ( express.static ( __dirname + '/public' ) ) ;


/*
 * Set up the Socket.IO connection handler.
 * This function is executed every time a new client establishes a WebSocket connection.
 */
io.sockets.on ( 'connection' , function ( socket ) {


    // Event listener for the "start tweets" message from a connected client.
    socket.on ( "start tweets" , function ( ) {


        // Only initiate a new Twitter stream if one is not already active.
        if ( stream === null ) {
            /*
             * Establish a connection to the Twitter streaming API.
             * The 'locations' filter specifies a bounding box covering the entire world,
             * ensuring that tweets from any geographical location are captured.
             */
            twit.stream ( 'statuses/filter' , { 'locations' : '-180,-90,180,90' } , function ( stream ) {

                // Register an event handler for incoming tweet data.
                stream.on ( 'data' , function ( data ) {

                    // Check if the tweet data contains geographical coordinates.
                    if ( data.coordinates ) {
                        if ( data.coordinates !== null ) {
                            /*
                             * If coordinates are present and not null, extract
                             * the latitude and longitude to form an output point.
                             */
                            var outputPoint = {
                                "lat" : data.coordinates.coordinates[0] ,
                                "lng" : data.coordinates.coordinates[1]
                            } ;


                            // Broadcast the tweet's location to all connected clients, excluding the sender.
                            socket.broadcast.emit ( "twitter-stream" , outputPoint ) ;


                            // Send the tweet's location specifically to the client that initiated the stream.
                            socket.emit ( 'twitter-stream' , outputPoint ) ;
                        }
                        else if ( data.place ) {
                            // If direct coordinates are null but 'place' information is available.
                            if ( data.place.bounding_box === 'Polygon' ) {
                                /*
                                 * Calculate the approximate center of the tweet's bounding box.
                                 * Note: The variable 'coords' here is not defined in the provided scope,
                                 * potentially indicating a bug in the original code. It would likely
                                 * refer to 'data.place.bounding_box.coordinates' if available.
                                 */
                                var coord , _i , _len ;
                                var centerLat = 0 ;
                                var centerLng = 0 ;

                                // Loop through the coordinates to sum them up.
                                for ( _i = 0 , _len = coords.length ; _i < _len ; _i ++ ) {
                                    coord = coords[ _i ] ;
                                    centerLat += coord[0] ;
                                    centerLng += coord[1] ;
                                }
                                centerLat = centerLat / coords.length ;
                                centerLng = centerLng / coords.length ;

                                // Construct the output object with the calculated center.
                                var outputPoint = { "lat" : centerLat , "lng" : centerLng } ;
                                // Broadcast this calculated point to other clients.
                                socket.broadcast.emit ( "twitter-stream" , outputPoint ) ;

                            }
                        }
                    }

                    // Handle 'limit' notices from the Twitter API, indicating a rate limit has been hit.
                    stream.on ( 'limit' , function ( limitMessage ) {
                        return console.log ( limitMessage ) ;
                    } ) ;

                    // Handle 'warning' messages from the Twitter API.
                    stream.on ( 'warning' , function ( warning ) {
                        return console.log ( warning ) ;
                    } ) ;

                    // Handle 'disconnect' events from the Twitter API.
                    stream.on ( 'disconnect' , function ( disconnectMessage ) {
                        return console.log ( disconnectMessage ) ;
                    } ) ;
                } ) ;
            } ) ;
        }
    } ) ;


    // Upon successful connection, emit a "connected" event to the client.
    socket.emit ( "connected" ) ;
} ) ;