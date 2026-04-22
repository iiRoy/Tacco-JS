/* This is a generated Type I clone of the original script.
 * The purpose of this script is to interact with the cexapi module.
 * It demonstrates initializing the API and then fetching account balance.
 * All identifiers, operators, and expressions are preserved exactly.
 * Only whitespace and comments have been altered significantly.
 */


    // First, we need to load the 'cexapi' module.
    // This module is expected to be found in the local directory.
var     cexapi    =    require ( "./cexapi.js" ) ;



// Next, we proceed to authenticate our API instance.
// This step is crucial for any subsequent API calls requiring authentication.
// The 'username', 'api_key', and 'api_secret' variables are expected to be defined elsewhere.
    cexapi . create ( username ,   api_key ,   api_secret ) ;



        // After successful authentication, we can now request the account balance.
        // The 'balance' method takes a callback function as its argument.
        cexapi . balance (

            function (   param   ) { // The callback function receives the balance data as 'param'.

                // Inside the callback, we simply log the received data to the console.
                // This will display the balance information.
                console . log ( param ) ;

            }

        ) ; // End of the cexapi.balance call.