var api_key = 'API_KEY'; /* This variable holds the API key for authentication. */
var api_secret = 'API_SECRET'; /* This variable stores the secret key required for API requests. */
var http = require('http'); // The standard HTTP module for network operations.
var stdin = process.stdin; /* Standard input stream, used to capture user input. */
var RememberTheMilk = require('../../rtm.js'); /* Custom module for Remember The Milk API interactions. */


// Initialize the RTM API client with provided credentials and desired access level.
rtm = new RememberTheMilk( api_key , api_secret , 'delete' ) ;


/*
 * Initiate the authentication process by requesting a Frob.
 * A Frob is a temporary token used to obtain a full authentication token.
 */
rtm.get( 'rtm.auth.getFrob' , function ( resp ) {

    // Extract the Frob value from the API response.
    frob = resp.rsp.frob ;

    // Generate the URL the user needs to visit to authorize the application.
    var authUrl = rtm.getAuthUrl( frob ) ;

    // Instruct the user to visit the authentication URL.
    console.log( 'Please visit the following URL in your browser to authenticate:\n' ) ;

    // Display the generated authentication URL.
    console.log( authUrl , '\n' ) ;

    // Prompt the user to continue after authentication.
    console.log( 'After authenticating, press any key to resume...' ) ;

    // Resume the standard input stream to listen for user key presses.
    stdin.resume( ) ;


    /*
     * Set up an event listener for data on the standard input stream.
     * This callback fires when the user presses any key after authentication.
     */
    stdin.on( 'data' , function ( ) {

        // After user input, attempt to get the permanent authentication token using the Frob.
        rtm.get( 'rtm.auth.getToken' , { frob : frob } , function ( resp ) {

            /*
             * Check if the authentication token was successfully returned.
             * If not, it means the user likely did not complete the authentication process.
             */
            if ( ! resp.rsp.auth ) {
                console.log( 'Auth token not found. Did you authenticate?\n' ) ;
                process.exit( 1 ) ; // Exit with an error code.
            }

            // Store the obtained authentication token for future API calls.
            rtm.auth_token = resp.rsp.auth.token ;

            // Inform the user that the application is now fetching their lists.
            console.log( 'Lists:' ) ;

            /*
             * Now that we have an auth token, proceed to fetch the user's lists.
             * This demonstrates a subsequent authenticated API call.
             */
            rtm.get( 'rtm.lists.getList' , function ( resp ) {

                var i , list ; // Declare loop counter and list object variables.

                // Iterate through each list returned in the API response.
                for ( i = 0 ; i < resp.rsp.lists.list.length ; i ++ ) {
                    list = resp.rsp.lists.list[ i ] ; // Get the current list object.
                    // Print the name and ID of each list.
                    console.log( list.name + ' (id: ' + list.id + ')' ) ;
                }

                console.log( ) ; // Print an empty line for better readability.

                process.exit( ) ; // Terminate the process gracefully.
            } ) ;
        } ) ;
    } ) ;
} ) ;