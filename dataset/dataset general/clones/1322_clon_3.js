function retrieveAuthenticationDetails() {
  // This helper function centralizes the retrieval of API credentials.
  // It prioritizes environment variables for security and flexibility.
  const environmentConfiguration = process.env;

  if (environmentConfiguration.MICROBLOG_API_KEY && environmentConfiguration.MICROBLOG_SECRET_KEY) {
    console.log("[INFO] Authentication details sourced from environment variables.");
    return {
      applicationKey: environmentConfiguration.MICROBLOG_API_KEY,
      applicationSecret: environmentConfiguration.MICROBLOG_SECRET_KEY
    };
  }

  // Fallback to a local secrets file if environment variables are not present.
  // WARNING: This file should be excluded from version control in production.
  try {
    const localSecrets = require("./auth_secrets.js"); // Renamed from 'creds.js'
    // Basic validation for critical keys within the local file.
    if (!localSecrets.applicationKey || !localSecrets.applicationSecret) {
      throw new Error("Required 'applicationKey' or 'applicationSecret' missing in auth_secrets.js.");
    }
    console.warn("[WARNING] Using local 'auth_secrets.js' for credentials. Ensure this is secure.");
    return localSecrets;
  } catch (credentialLoadError) {
    console.error(`[ERROR] Failed to load authentication details: ${credentialLoadError.message}`);
    // Terminate application if essential credentials cannot be loaded.
    process.exit(1);
  }
}

// --- Core Module Imports and Initial Setup ---
const systemHttp = require('http'); // Renamed 'http'
const MicroblogApiConnector = require('ntwitter'); // Renamed 'Twitter', 'ntwitter'
const applicationAuthData = retrieveAuthenticationDetails(); // Renamed 'creds', 'loadConsumerTokens()'

// Store application-wide API keys for consistent access.
const primaryApplicationKey = applicationAuthData.applicationKey; // Renamed 'consumer_key'
const primaryApplicationSecret = applicationAuthData.applicationSecret; // Renamed 'consumer_secret'

// Instantiate the microblog API client with global application credentials.
const microblogClientService = new MicroblogApiConnector({ // Renamed 'twitter'
  consumer_key: primaryApplicationKey,
  consumer_secret: primaryApplicationSecret
});

// Setup the web server framework and real-time communication layer.
const webApplicationFramework = require("express"); // Renamed 'express'
const webServerApp = webApplicationFramework(); // Renamed 'app', updated to modern Express
const httpCoreServer = systemHttp.createServer(webServerApp); // Explicitly create HTTP server
const realTimeMessagingHub = require('socket.io')(httpCoreServer); // Renamed 'io', updated Socket.IO setup

// --- Real-time Communication Hub Configuration ---
// Note: 'io.configure' is deprecated in modern Socket.IO.
// Transport settings are typically passed in the constructor or set on the engine.
realTimeMessagingHub.engine.on('initial_headers', (headers, request) => {
  // Example: Add custom security headers for Socket.IO connections.
  headers['X-Socket-Connection'] = 'Active';
});

realTimeMessagingHub.sockets.on('connection', connectedClientSocket => {
  const connectionTimestamp = new Date().toISOString();
  console.log(`[SOCKET] New client connection established: ID=${connectedClientSocket.id} at ${connectionTimestamp}`);

  // Initiate a user stream from the microblogging service for real-time updates.
  const streamConfiguration = { with: "user" };
  microblogClientService.stream("user", streamConfiguration, (eventDataStream, streamHttpStatus) => {
    eventDataStream.on("error", streamErrorDetail => {
      console.error(`[STREAM] Error on user activity stream (HTTP Status: ${streamHttpStatus}):`, streamErrorDetail.message);
      connectedClientSocket.emit("microblog.stream_failure", {
        code: streamHttpStatus,
        message: streamErrorDetail.message
      });
    });

    eventDataStream.on("data", receivedStreamData => {
      // Process incoming data, specifically looking for direct messages.
      if (receivedStreamData && receivedStreamData.direct_message) {
        const directMessagePayload = receivedStreamData.direct_message;

        // Custom partial rendering function to simulate deprecated 'res.partial'.
        // In a production environment, this would integrate with a full templating engine.
        const renderMessageSnippet = (templateIdentifier, messageContext, renderCallback) => {
          let generatedHtmlSnippet = `
            <div class="message-item">
              <span class="message-sender">${messageContext.message.sender_screen_name}</span>:
              <span class="message-content">${messageContext.message.text}</span>
              <time class="message-timestamp">${webServerApp.locals.helpers.formatDateTimeForDisplay(messageContext.message.created_at)}</time>
            </div>
          `;
          renderCallback(null, generatedHtmlSnippet); // Simulate success
        };

        renderMessageSnippet("message_display", { message: directMessagePayload }, (renderIssue, renderedContent) => {
          if (renderIssue) {
            console.error("[RENDER] Failed to render message snippet:", renderIssue);
            connectedClientSocket.emit("microblog.render_error", { details: "Could not display message." });
            return;
          }
          connectedClientSocket.emit("microblog.new_direct_message", { html: renderedContent });
        });
      }
    });
  });

  connectedClientSocket.on('disconnect', () => { // Corrected from 'disconnection' to 'disconnect'
    console.log(`[SOCKET] Client disconnected: ID=${connectedClientSocket.id} at ${new Date().toISOString()}`);
    // Potentially clean up stream resources associated with this client.
  });
});

// --- Web Application (Express) Configuration ---
// Expose helper functions via 'app.locals' for use in templates.
webServerApp.locals.helpers = { // Changed from 'app.helpers' to 'app.locals.helpers'
  // Formats a date string into a user-friendly display format.
  formatDateTimeForDisplay: function(rawDateString) { // Renamed 'formattedDate'
    // Input validation for robustness.
    if (!rawDateString || typeof rawDateString !== 'string') {
      console.warn("[HELPER] Invalid input for date formatting:", rawDateString);
      return "N/A Date";
    }

    const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]; // Renamed 'dayNames'
    const initialDateObj = new Date(rawDateString);

    // Validate if the date string was successfully parsed.
    if (isNaN(initialDateObj.getTime())) {
      console.warn("[HELPER] Unparseable date string provided:", rawDateString);
      return "Invalid Date Format";
    }

    // Convert to UTC then back to local to ensure consistent timezone handling, then new object.
    const displayDate = new Date(initialDateObj.toUTCString()); // Renamed 'date'
    const dayOfWeekIndex = displayDate.getDay(); // Renamed 'day'
    let currentHourValue = displayDate.getHours(); // Renamed 'hours'
    const currentMinuteValue = displayDate.getMinutes(); // Renamed 'minutes'
    const timePeriodMarker = currentHourValue >= 12 ? "pm" : "am"; // Renamed 'ampm'

    // Convert to 12-hour format.
    currentHourValue = (currentHourValue % 12 === 0) ? 12 : currentHourValue % 12;

    // Pad minutes with a leading zero if necessary.
    const formattedMinutes = currentMinuteValue < 10 ? `0${currentMinuteValue}` : String(currentMinuteValue);

    // Construct the final output string using template literals.
    return `${weekdayNames[dayOfWeekIndex]} at ${currentHourValue}:${formattedMinutes}${timePeriodMarker}`;
  }
};

webServerApp.set("views", `${__dirname}/views`); // Configures template directory.
webServerApp.set("view engine", "jade"); // Sets the templating engine.
webServerApp.use(webApplicationFramework.static(`${__dirname}/public`)); // Serves static assets.

// --- Route Handlers ---

// Main dashboard route: Fetches user data if authenticated, otherwise prompts for login.
webServerApp.get("/", (requestPayload, responseHandler) => { // Renamed 'req', 'res'
  const userAuthenticationCookie = microblogClientService.cookie(requestPayload); // Renamed 'cookie', 'twitter.cookie'

  if (userAuthenticationCookie) {
    // Re-instantiate client with user's specific access tokens for personalized API calls.
    const personalizedMicroblogClient = new MicroblogApiConnector({
      consumer_key: primaryApplicationKey,
      consumer_secret: primaryApplicationSecret,
      access_token_key: userAuthenticationCookie.access_token_key,
      access_token_secret: userAuthenticationCookie.access_token_secret
    });

    // Fetch user's direct messages. Increased count for more messages.
    personalizedMicroblogClient.getDirectMessages({ count: 25 }, (dmFetchError, messageCollection) => {
      if (dmFetchError) {
        console.error("[ROUTE:/] Error retrieving direct messages:", dmFetchError);
        return responseHandler.status(500).render('error_view', { layout: false, message: 'Failed to load messages.' });
      }

      // Fetch the current user's profile information.
      personalizedMicroblogClient.showUser(userAuthenticationCookie.user_id, (profileFetchError, userProfileDataArray) => {
        if (profileFetchError) {
          console.error("[ROUTE:/] Error retrieving user profile:", profileFetchError);
          return responseHandler.status(500).render('error_view', { layout: false, message: 'Failed to load user profile.' });
        }

        // Ensure user profile data is valid before rendering.
        const currentAuthenticatedUser = (userProfileDataArray && userProfileDataArray.length > 0) ? userProfileDataArray[0] : null;
        if (!currentAuthenticatedUser) {
          console.warn("[ROUTE:/] User profile data was unexpectedly empty for ID:", userAuthenticationCookie.user_id);
          return responseHandler.status(404).render('error_view', { layout: false, message: 'User profile not found.' });
        }

        // Render the main application view with all fetched data.
        responseHandler.render('index', {
          layout: false,
          messages: messageCollection,
          activeUser: currentAuthenticatedUser // Renamed 'current_user'
        });
      });
    });
  } else {
    // If no session cookie, prompt the user to sign in.
    responseHandler.status(401).send("<section><p>Authentication required. Please <a href='/initiate-auth' class='auth-link'>Sign in via Microblog Service</a>.</p></section>"); // Modified link and added section tags
  }
});

// Authentication initiation route: Redirects to the microblog service for user login.
webServerApp.get("/initiate-auth", (incomingRequest, outgoingResponse) => { // Renamed '/sign-in', 'req', 'res'
  console.log("[ROUTE:/initiate-auth] Triggering external authentication process...");
  const authProcessInitiator = microblogClientService.login("/initiate-auth"); // Renamed 'login'
  authProcessInitiator(incomingRequest, outgoingResponse, (authenticationResult) => { // Renamed 'arg'
    console.log("[AUTH] Callback received from authentication flow:", authenticationResult);
    // In case of an authentication failure, redirect with an error indicator.
    if (authenticationResult && authenticationResult.error) {
        console.error("[AUTH] Authentication process reported an error:", authenticationResult.error);
        outgoingResponse.redirect('/?auth_status=failed'); // Redirect on error
    }
  });
});

// --- Server Activation ---
const defaultHttpPort = 3000; // Renamed '3000'
const serverListenPort = process.env.PORT || defaultHttpPort; // Renamed 'PORT'

httpCoreServer.listen(serverListenPort, () => { // Changed 'app.listen' to 'httpCoreServer.listen'
  console.log(`[SERVER] Web application listener active on port ${serverListenPort}.`);
  console.log(`[SERVER] Access point: http://localhost:${serverListenPort}`);
});