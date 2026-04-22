var applicationId = 'YOUR_APP_ID', // Identifier for the application
    secretKey = 'YOUR_SECRET_KEY',   // Secret key for API authentication
    webClient = require('http'),     // HTTP module, not directly used here
    inputReader = process.stdin,     // Standard input stream for user interaction
    TaskMaster = require('../../rtm.js'); // Custom module for RTM API interactions

// Initialize the task management client with credentials and a default permission level.
let taskMgr = new TaskMaster(applicationId, secretKey, 'remove');


// Initiate the authentication process by requesting a frob (request token).
// This is the first step in obtaining user authorization.
taskMgr.fetch('rtm.auth.getFrob', function(responseObj) {
    // Extract the frob value from the API response.
    let authTicket = responseObj.rsp.frob;

    // Generate the authentication URL that the user needs to visit.
    // This URL will direct the user to the RTM website to grant access.
    var authenticationLink = taskMgr.getAuthUrl(authTicket);


    // Inform the user about the next steps.
    console.log('Please visit the following URL in your browser to authorize this application:\n');
    console.log(authenticationLink, '\n');
    console.log('After successfully authorizing, please return here and press any key to continue...');


    // Pause the program execution, awaiting user input after authentication.
    inputReader.resume();

    // Set up an event listener to detect when the user presses a key.
    inputReader.on('data', function() {
        // Once a key is pressed, proceed to request the permanent authentication token.
        // This uses the frob obtained earlier.
        taskMgr.fetch('rtm.auth.getToken', {authTicket: authTicket}, function(responseObj) {
            // Check if the authentication token was successfully retrieved.
            if (!responseObj.rsp.auth) {
                console.log('Authentication token was not found. Did you complete the authorization process in your browser?\n');
                process.exit(1); // Exit with an error code if authorization failed.
            }

            // Store the newly acquired session token for subsequent API calls.
            taskMgr.sessionToken = responseObj.rsp.auth.token;

            console.log('Available Task Collections:');

            // Fetch the user's list of task collections (lists).
            taskMgr.fetch('rtm.lists.getList', function(responseObj) {
                var idx, taskCollection; // Loop counter and current list object.

                // Iterate through each task collection received in the response.
                for (idx = 0; idx < responseObj.rsp.lists.list.length; idx++) {
                    taskCollection = responseObj.rsp.lists.list[idx];
                    // Display the name and unique identifier of each task collection.
                    console.log(taskCollection.name + ' (identifier: ' + taskCollection.id + ')');
                }

                console.log(); // Print an empty line for better readability.

                // All operations complete; gracefully exit the application.
                process.exit();
            });
        });
    });
});