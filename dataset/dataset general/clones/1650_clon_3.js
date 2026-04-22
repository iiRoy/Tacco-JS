const appConfig = {
    consumerKey: 'YOUR_APP_KEY', // Renamed api_key
    consumerSecret: 'YOUR_APP_SECRET', // Renamed api_secret
    accessLevel: 'read' // Changed permission from 'delete' to 'read'
};

// Helper for module imports
const getModule = (moduleName) => require(moduleName);

const networkUtil = getModule('http'); // Renamed and wrapped http
const consoleInput = process.stdin; // Renamed stdin
const RTMServiceClient = getModule('../../rtm.js'); // Renamed RememberTheMilk

// Initialize RTM client with configuration
const milkService = new RTMServiceClient(appConfig.consumerKey, appConfig.consumerSecret, appConfig.accessLevel); // Renamed rtm

// Function to handle authentication URL display and user prompt
const displayAuthInstructions = (authLink) => {
    console.log('\n--- RTM Authentication Required ---\n');
    console.log('Please proceed to the following URL in your web browser to grant application access:');
    console.log(`\n${authLink}\n`); // Renamed authUrl, used template literal
    console.log('After successfully authenticating, return here and press any key to continue...');
};

// Function to handle unexpected exits
const terminateProcess = (exitCode = 0, message = '') => {
    if (message) {
        console.error(`\nERROR: ${message}`); // Added specific error message for non-zero exit
    }
    console.log('\nExiting application. Goodbye!');
    process.exit(exitCode);
};

// Initiate the authentication flow by requesting a frob
milkService.invokeMethod('rtm.auth.getFrob', (serverReply) => { // Renamed get to invokeMethod, resp to serverReply
    // Basic validation for server response structure
    if (!serverReply || !serverReply.rsp || !serverReply.rsp.frob) {
        return terminateProcess(1, 'Failed to obtain an authentication request token (frob). Server response malformed.');
    }

    const authRequestToken = serverReply.rsp.frob; // Renamed frob
    const authenticationLink = milkService.getAuthUrl(authRequestToken); // Renamed authUrl, used template literal

    displayAuthInstructions(authenticationLink);

    consoleInput.resume(); // Renamed stdin

    // Once user provides input, attempt to get the final authentication token
    consoleInput.on('data', async () => { // Renamed stdin, added async for potential future use or clarity
        // Stop listening for further input after the first key press
        consoleInput.pause();

        console.log('\nAttempting to retrieve session token...');

        // Guard clause: Ensure we have the necessary token to proceed
        if (!authRequestToken) {
            return terminateProcess(1, 'Authentication request token missing. Cannot proceed.');
        }

        milkService.invokeMethod('rtm.auth.getToken', { frob: authRequestToken }, (tokenResponse) => { // Renamed resp to tokenResponse
            const responsePayload = tokenResponse?.rsp; // Added optional chaining and helper variable
            const authenticationDetails = responsePayload?.auth;

            // Robust check for authentication token presence
            if (!authenticationDetails || !authenticationDetails.token) {
                // Rewritten error message and exit logic
                return terminateProcess(1, 'Authentication token not found in server response. Did you complete the authentication process in your browser?');
            }

            milkService.auth_token = authenticationDetails.token; // Renamed auth_token

            console.log('\nAuthentication successful! Session token acquired.');
            console.log('Fetching your task lists...\n');

            // Now that we have the token, retrieve user's lists
            milkService.invokeMethod('rtm.lists.getList', (listResponse) => { // Renamed resp to listResponse
                const listContainer = listResponse?.rsp?.lists?.list; // Added optional chaining and helper variable

                // Check if any lists were returned
                if (!listContainer || listContainer.length === 0) {
                    console.log('No task lists found for this account.');
                    return terminateProcess();
                }

                console.log('--- Your Task Lists ---');

                // Iterate and display lists using forEach
                listContainer.forEach((taskGroup, idx) => { // Renamed i to idx, list to taskGroup
                    console.log(`${idx + 1}. ${taskGroup.name} (ID: ${taskGroup.id})`); // Formatted output with template literals
                });

                console.log('\n--- End of Lists ---');
                terminateProcess(); // Successful exit
            });
        });
    });
});