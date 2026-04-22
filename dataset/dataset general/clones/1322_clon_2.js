// Function to retrieve application authentication tokens
function retrieveAuthDetails()
{
    let configObject; // Placeholder for configuration data

    // Check if client key is provided via environment variables
    if (runtimeEnv.environment.clientKey)
    {
        configObject = runtimeEnv.environment; // Use environment variables if present
    }
    else
    {
        configObject = obtainModule("./credentials_config.js"); // Otherwise, load from a local configuration file
    }

    return configObject; // Return the gathered configuration
}



// Load necessary modules and initialize API credentials
const webServer = obtainModule('http'),                           // HTTP module for server functionalities
      SocialAPI = obtainModule('social-api-wrapper'),             // Wrapper for social media API interactions
      credentials = retrieveAuthDetails(),                        // Fetch application-level authentication details
      clientKey = credentials.clientKey;                          // Extract the public API key
let   clientSecret = credentials.clientSecret;                    // Extract the private API secret

// Instantiate the social client with initial application credentials
let socialClient = new SocialAPI({
        clientKey: credentials.clientKey,       // Set the application's client key
        clientSecret: credentials.clientSecret  // Set the application's client secret
    });


// Set up the web application framework and real-time communication layer
const webFramework = obtainModule("web-framework-lib"),          // Load the web framework library
      application = webFramework.createServer();                  // Create a new web application instance

let   socketManager = obtainModule('socket-comm').attach(application); // Attach the socket communication library to the application

// Configure real-time socket communication settings
socketManager.setupSettings(function()
{
    socketManager.configureOption("communicationChannels", ["long-polling"]); // Specify allowed communication protocols
    socketManager.configureOption("pollInterval", 5);                         // Set the polling interval to 5 seconds
});


// Define helper functions available across the application
application.utilityFunctions({
    /**
     * Formats a given date string into a user-friendly display format.
     * @param {string} inputDateString - The date string to format.
     * @returns {string} The formatted date and time string.
     */
    formatDateTime: function(inputDateString)
    {
        const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]; // Array of abbreviated weekday names
        let parsedDate = new Date(new Date(inputDateString).toUTCString());     // Parse the input date, converting to UTC
        let dayIndex = parsedDate.getDay();                                      // Get the numerical day of the week (0-6)
        let currentHours = parsedDate.getHours();                                // Get the hour of the day (0-23)
        let currentMinutes = parsedDate.getMinutes();                            // Get the minute of the hour (0-59)
        let meridiemIndicator = currentHours > 11 ? "PM" : "AM";                 // Determine if it's AM or PM

        // Adjust hours for 12-hour clock format
        if (currentHours > 12)
        {
            currentHours -= 12; // Subtract 12 for PM hours
        }
        else if (currentHours === 0)
        {
            currentHours = 12; // Change 0 (midnight) to 12 AM
        }

        // Add a leading zero to minutes if less than 10
        if (currentMinutes < 10)
        {
            currentMinutes = "0" + currentMinutes; // Prepend "0" to single-digit minutes
        }

        // Construct and return the final formatted string
        return weekdayLabels[dayIndex] + " on " + currentHours + ":" + currentMinutes + " " + meridiemIndicator;
    }
});


// General application configuration settings
application.setupSettings(function()
{
    application.use(webFramework.staticContent(__dirname + "/public_assets")); // Serve static files from the '/public_assets' directory
    application.configureOption("templates", __dirname + "/template_files");   // Specify the directory where template files are located
    application.configureOption("templateEngine", "pug");                      // Set the templating engine to Pug (similar to Jade)
});


// Define the route handler for the application's root URL
application.handleRoute("/", function(requestObject, responseObject)
{
    let sessionToken; // Variable to store the user's session token

    // Attempt to retrieve a session token from the incoming request
    if (sessionToken = socialClient.getSession(requestObject))
    {
        // Re-initialize the social client with user-specific access tokens for authenticated requests
        socialClient = new SocialAPI({
            clientKey: credentials.clientKey,           // Application's public client key
            clientSecret: credentials.clientSecret,     // Application's private client secret
            sessionKey: sessionToken.sessionKey,        // User's access token key
            sessionSecret: sessionToken.sessionSecret   // User's access token secret
        });

        // Fetch private messages for the currently authenticated user
        socialClient.fetchPrivateMessages({ itemCount: 25 }, function(err, messageData)
        {
            if (err) { console.error("MESSAGE RETRIEVAL ERROR:", err); } // Log any errors during message fetching

            // Display the user's profile information
            socialClient.displayUserProfile(sessionToken.userID, function(err, profileData)
            {
                if (err) { console.error("PROFILE FETCHING ERROR:", err); } // Log any errors during profile fetching

                // Render the main page template with the fetched data
                responseObject.displayTemplate('main_page', {
                    hasLayout: false,           // Indicate that no overarching layout template should be used
                    privateMessages: messageData, // Pass the retrieved direct messages
                    activeUser: profileData[0]    // Pass the current user's profile data
                });
            });
        });
    }
    else
    {
        // If no session token is found, prompt the user to log in
        responseObject.transmitContent("<a href='/authenticate' class='social-platform-login'>Log in with Social Platform</a>");
    }
});


// Define the route handler for initiating the user authentication process
application.handleRoute("/authenticate", function(requestObject, responseObject)
{
    // Start the authentication flow using the social client
    let initiateLogin = socialClient.startAuthFlow("/authenticate");

    // Execute the login process with a callback for post-authentication actions
    initiateLogin(requestObject, responseObject, function(callbackArgument)
    {
        console.info("Authentication callback triggered with argument:", callbackArgument); // Log the result of the authentication callback
    });
});


// Start the application server, listening on the specified port
application.startServer(runtimeEnv.environment.SERVER_PORT || 3000, function()
{
    console.log("Server running on port 3000 now."); // Confirm that the server has started successfully
});


// Handle new client connections to the socket manager
socketManager.connections.addEventListener('clientConnected', function(clientSocket)
{
    console.log((new Date()).toISOString() + ' - New client connection established.'); // Log the time of the new connection

    // Begin streaming data from the social platform for the connected user
    socialClient.startStream("user_feed", { including: "user_details" }, function(dataStream, httpStatus)
    {
        // Define an event listener for stream errors
        dataStream.addEventListener("stream_error", function(err)
        {
            console.warn("Streaming error detected:", err, httpStatus); // Log details of the stream error
            clientSocket.emit("social.stream_issue", { statusMsg: 'stream_error', content: err }); // Emit an error event to the client
        });

        // Define an event listener for incoming stream data
        dataStream.addEventListener("stream_data", function(messageData)
        {
            // Check if the received data contains a private message
            if (messageData.privateMessage !== undefined)
            {
                // Create a temporary response object prototype for rendering partials
                let tempResponse = webServer.HttpResponse.basePrototype;
                tempResponse.applicationInstance = application; // Attach the main application instance for rendering

                // Render a partial template for the private message
                tempResponse.renderPartial("message_snippet", { msgObject: messageData.privateMessage }, function(err, templateOutput)
                {
                    clientSocket.emit("social.private_message_received", { content: templateOutput }); // Emit the formatted message to the client
                });
            }
        });
    });

    // Define an event listener for client disconnections
    clientSocket.addEventListener('clientDisconnected', function()
    {
        console.log((new Date()).toISOString() + ' - Client has disconnected.'); // Log the time of client disconnection
    });
});