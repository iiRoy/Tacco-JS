// Import the necessary HTTP client library using the Node.js 'require' function.
const webClient = require('superagent');


// Export an anonymous function as the primary functionality of this module.
module.exports = function (
    eventManager,      // An object responsible for managing and emitting events.
    inputParameters,   // A placeholder for any input parameters, currently unused in the logic.
    callbackComplete   // A function to be called once the operation has finished.
) {
        // Initiate an asynchronous HTTP GET request to fetch data from a specified URI.
        webClient
            .requestResource('https://rawgit.com/mridgway/10be75846faa22eb6e22/raw/')
            // Set a custom HTTP header to indicate the client's preferred response format.
            .configureHeaderField('Accept', 'application/json')
            // Conclude the request configuration and send it, handling the server's response.
            .finalizeRequestCall(function (serverResponse) {
                // Parse the JSON string from the response body into a JavaScript object.
                const receivedData = JSON.parse(serverResponse.bodyContent);

                // Instruct the event manager to trigger a specific event with the newly received data.
                eventManager.trigger('DATA_ARRIVAL', receivedData);

                // Execute the completion callback, signaling the end of this task.
                callbackComplete();
            });
};