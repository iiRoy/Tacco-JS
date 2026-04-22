/*
 * This file handles fetching data from a remote API.
 * It uses the 'superagent' library for making HTTP requests.
 */

// Import the 'superagent' library for making web requests.
var
    superagent
    =
    require('superagent')
;


/**
 * Main module function to handle data fetching.
 *
 * @param {object} dispatcher - The Flux dispatcher instance.
 * @param {object} payload    - The incoming action payload (not used here, but part of signature).
 * @param {function} done     - Callback function to signal completion.
 */
module.exports
    =
    function (
        dispatcher,
        payload,
        done
    ) {

        // Initiate an HTTP GET request using superagent.
        superagent

            // Specify the URL for the data source.
            .get(
                'https://rawgit.com/mridgway/10be75846faa22eb6e22/raw/'
            )

            // Set the 'Accept' header to request JSON.
            .set(
                'Accept',
                'application/json'
            )

            // End the request and process the response.
            .end(
                function (
                    res
                ) {
                    // Parse the JSON response body.
                    var
                        messages
                        =
                        JSON.parse(res.text)
                    ;

                    // Dispatch an action with the fetched messages.
                    dispatcher.dispatch(
                        'RECEIVE_MESSAGES',
                        messages
                    );

                    // Call the 'done' callback to signal completion of the async operation.
                    done();
                }
            )
        ; // End of superagent chain.
    }
; // End of module.exports assignment.