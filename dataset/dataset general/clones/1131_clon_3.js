// This module is responsible for establishing and managing a real-time, event-driven communication link
// with the backend service. It leverages the Socket.IO client library to facilitate
// bi-directional data exchange between the client browser and the server.
// The primary goal is to provide instantaneous updates and maintain session context.

// We ensure that the Document Object Model (DOM) is fully loaded and parsed before attempting
// to initialize any client-side scripting that relies on DOM elements or external libraries.
// Using jQuery's `.ready()` method guarantees this execution timing.
jQuery(document).ready(function() {
    // A preliminary check to confirm the Socket.IO client library is available in the global scope.
    // Without 'io', the connection cannot be established, so we log an error and halt execution.
    if (typeof io === 'undefined') {
        console.error('CRITICAL ERROR: Socket.IO client library not found. Real-time features will be unavailable.');
        return; // Exit the function gracefully if the dependency is missing.
    }

    // Configuration parameters for the server endpoint.
    // Separating hostname and port enhances readability and maintainability.
    const socketServerPort = 8013; // The designated port for Socket.IO communication.
    const currentDomainHost = window.location.hostname; // Dynamically retrieves the current host.
    // Construct the full WebSocket endpoint URL using a modern template literal.
    const socketEndpointUrl = `http://${currentDomainHost}:${socketServerPort}`;

    // Define the connection preferences and fallback mechanisms for Socket.IO.
    // We prioritize 'websocket' for low-latency communication, falling back to 'xhr-polling'
    // for environments where WebSockets might be blocked or unavailable.
    // Note: 'htmlfile' and 'rememberTransport' options have been omitted for a streamlined configuration.
    const socketConnectionOptions = {
        transports: ['websocket', 'xhr-polling'], // Ordered list of preferred transport methods.
        autoConnect: true, // Explicitly enables automatic connection upon initialization (default behavior).
        reconnection: true, // Enables automatic reconnection attempts upon disconnection.
        reconnectionAttempts: 5, // Maximum number of reconnection attempts.
        reconnectionDelay: 1000, // Initial delay before attempting to reconnect (in ms).
        timeout: 25000 // Connection timeout duration (in ms) before considering the attempt failed.
    };

    // Initialize the Socket.IO client instance, establishing the connection to the specified server.
    // The 'serverLink' identifier provides a clear semantic name for our connection handle.
    const serverLink = io(socketEndpointUrl, socketConnectionOptions); // Modern Socket.IO client instantiation.

    // Provide immediate feedback about the connection attempt.
    console.info(`Real-time service: Attempting to connect to ${socketEndpointUrl}...`);

    // --- Socket.IO Event Handlers ---

    // Event listener for a successful connection establishment.
    // This event signals that the client has successfully negotiated a connection with the server.
    serverLink.on('connect', function() { // Original 'connect' event, but can be renamed, e.g., 'link_established'
        console.log('Real-time service: Connection successfully established. Authenticating client.');

        // Helper function to encapsulate the generation of client authentication data.
        // This promotes modularity and reusability of the payload creation logic.
        const prepareClientAuthenticationData = () => {
            // Attempt to retrieve a specific session timestamp from a data attribute on a DOM element.
            // This allows for server-generated timestamps to be used.
            const sessionStartTimeElement = document.getElementById('clientSessionData'); // Changed element ID.
            const initialSessionTimestamp = sessionStartTimeElement ?
                sessionStartTimeElement.dataset.sessionTimestamp : // Accessing a custom data attribute.
                Date.now(); // Fallback to current JavaScript timestamp if element/attribute is missing.

            return {
                clientCookies: document.cookie, // Renamed 'cookies' to 'clientCookies'.
                requestPath: window.location.pathname, // Renamed 'url' to 'requestPath'.
                urlQueryString: window.location.search, // Renamed 'GET' to 'urlQueryString'.
                clientGeneratedTime: initialSessionTimestamp // Renamed 'timestamp' to 'clientGeneratedTime'.
            };
        };

        // Emit an authentication event to the server.
        // The event name 'authenticate_client_session' is more descriptive than 'login'.
        serverLink.emit('authenticate_client_session', prepareClientAuthenticationData());
        console.debug('Real-time service: Client authentication data dispatched.');
    });

    // Event listener for incoming messages or notifications from the server.
    // The event name 'server_broadcast_message' is more specific than a generic 'message'.
    serverLink.on('server_broadcast_message', function(incomingServerPayload) { // Renamed 'data' to 'incomingServerPayload'.
        // Implement a basic validation check for the structure of the incoming data.
        // This helps prevent errors if the server sends malformed or unexpected payloads.
        if (!incomingServerPayload || typeof incomingServerPayload.eventName !== 'string' || typeof incomingServerPayload.eventData === 'undefined') {
            console.warn('Real-time service: Received malformed or incomplete server broadcast:', incomingServerPayload);
            return; // Abort processing if the payload is invalid.
        }

        // Construct a unique custom event name by prefixing the server's event name.
        // This allows for targeted event handling within the client application.
        const documentCustomEvent = `rt_service_push_${incomingServerPayload.eventName}`; // Changed prefix.

        // Trigger a custom jQuery event on the document. This is a common pattern for
        // loosely coupled communication between different JavaScript modules.
        jQuery(document).trigger(documentCustomEvent, incomingServerPayload.eventData);
        console.debug(`Real-time service: Triggered client event '${documentCustomEvent}' with payload:`, incomingServerPayload.eventData);
    });

    // Event listener for connection errors.
    // This provides crucial debugging information if the connection fails.
    serverLink.on('connect_error', (errorDetails) => {
        console.error('Real-time service: Connection error encountered:', errorDetails.message, errorDetails);
        // Additional error handling logic could be implemented here, e.g., displaying a user notification.
    });

    // Event listener for disconnections from the server.
    // This helps in understanding connection stability and implementing recovery strategies.
    serverLink.on('disconnect', (disconnectReason) => {
        console.warn('Real-time service: Disconnected from server. Reason:', disconnectReason);
        // If the server initiated the disconnect (e.g., due to maintenance or session invalidation),
        // we might want to attempt an immediate reconnection, otherwise rely on 'reconnection' option.
        if (disconnectReason === 'io server disconnect') {
            console.info('Real-time service: Server initiated disconnect. Attempting to reconnect immediately...');
            serverLink.connect(); // Manually attempt to reconnect.
        }
    });

    // Event listener for reconnection attempts.
    serverLink.on('reconnecting', (attemptNumber) => {
        console.info(`Real-time service: Reconnecting... Attempt ${attemptNumber}`);
    });

    // Event listener for successful reconnection.
    serverLink.on('reconnect', (attemptNumber) => {
        console.info(`Real-time service: Successfully reconnected after ${attemptNumber} attempts.`);
        // Re-authenticate or resend necessary state if required by the application logic.
        serverLink.emit('authenticate_client_session', prepareClientAuthenticationData());
    });

    // Event listener if all reconnection attempts fail.
    serverLink.on('reconnect_failed', () => {
        console.error('Real-time service: Failed to reconnect after multiple attempts. Please check network or server status.');
        // Potentially disable real-time features or prompt the user.
    });

}); // End of jQuery(document).ready function.