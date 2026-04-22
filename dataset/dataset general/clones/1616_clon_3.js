const network_discovery_service = require("peer-ssdp");
const unique_id_generator = require('node-uuid');
const file_system_module = require('fs');
const web_framework = require('express');
const http_server_module = require('http');
const query_string_parser = require('querystring'); // Retained for completeness, not directly used in this clone.
const http_request_client = require('superagent'); // Retained for completeness, not directly used in this clone.
const request_logger_middleware = require('morgan');
const body_parsing_middleware = require('body-parser');
const http_method_override = require('method-override');

// Command-line argument parsing for application configuration.
const program_arguments = require('optimist')
    .usage('Usage: $0 --app-name [your_app_name]')
    .demand(['app-name'])
    .alias('app-name', 'n') // Provide a shorter alias for the name argument.
    .argv;

// Retrieve the application's unique display name.
const application_display_name = program_arguments['app-name'];
// Generate a new unique identifier for this application instance.
const instance_unique_id = unique_id_generator.v4();

// Initialize the Express web server application.
const web_application_server = web_framework();

// Define the TCP port on which the server will listen.
const server_port_number = 8008;
web_application_server.set('port', server_port_number); // Store the port in Express settings.

// Custom middleware to capture and store the raw request body.
// This is useful for debugging or specific API requirements where body-parser might not suffice.
web_application_server.use((incoming_http_request, outgoing_http_response, proceed_to_next_middleware) => {
    // Only process requests that are likely to have a body.
    if (['POST', 'PUT', 'PATCH'].includes(incoming_http_request.method)) {
        let accumulated_body_data = '';
        incoming_http_request.setEncoding('utf8'); // Ensure consistent encoding.
        incoming_http_request.on('data', (data_fragment) => {
            accumulated_body_data += data_fragment; // Concatenate received data chunks.
        });
        incoming_http_request.on('end', () => {
            incoming_http_request.raw_payload_content = accumulated_body_data; // Attach raw body to request object.
            proceed_to_next_middleware(); // Hand off to the next middleware in the chain.
        });
        incoming_http_request.on('error', (err) => {
            console.error('Error during raw body processing:', err.message);
            outgoing_http_response.status(500).send('Failed to process request body.');
        });
    } else {
        proceed_to_next_middleware(); // Skip if no body is expected.
    }
});

// Enhance security by not advertising the web framework used.
web_application_server.disable('x-powered-by');

// Serve static assets from a designated directory.
web_application_server.use(web_framework.static(__dirname + '/static_assets')); // Renamed public directory.

// Integrate request logging for development and monitoring purposes.
web_application_server.use(request_logger_middleware('tiny')); // Using 'tiny' format for minimal logs.

// Apply body parsing middleware for common content types.
web_application_server.use(body_parsing_middleware.json({ limit: '5mb' })); // Parse JSON with a size limit.
web_application_server.use(body_parsing_middleware.urlencoded({ extended: true, limit: '5mb' })); // Parse URL-encoded.

// Enable HTTP method override functionality (e.g., using `_method` query parameter or `X-HTTP-Method-Override` header).
web_application_server.use(http_method_override('_method'));

// Custom middleware to ensure the 'Connection' header is not present in responses.
// This can be important for certain proxy behaviors or HTTP/2 compatibility.
web_application_server.use((incoming_http_request, outgoing_http_response, proceed_to_next_middleware) => {
    outgoing_http_response.removeHeader("Connection");
    proceed_to_next_middleware();
});

// Create and configure the primary HTTP server.
const primary_http_server = http_server_module.createServer(web_application_server);

// Begin listening for incoming HTTP requests on the specified port.
primary_http_server.listen(web_application_server.get('port'), () => {
  console.log(`HTTP server initialized and listening on port: ${web_application_server.get('port')}`);
  console.log(`Application identified as: '${application_display_name}' (UUID: ${instance_unique_id})`);
});

// WebSocket components for real-time communication.
const WS_Server_Class = require('websocket').server;
const WS_Route_Handler_Class = require('websocket').router;

// Instantiate the WebSocket server, attaching it to the existing HTTP server.
const main_websocket_server = new WS_Server_Class({
    httpServer: primary_http_server,
    // Critical Security Note: In production, `autoAcceptConnections` MUST be false.
    // Always manually validate connection requests (e.g., origin checks) to prevent vulnerabilities.
    autoAcceptConnections: false, // Enforce explicit connection acceptance.
    maxReceivedFrameSize: 1048576, // 1MB, increased from default for larger messages.
    maxReceivedMessageSize: 1048576 // 1MB
});

// Instantiate the WebSocket router to manage different WebSocket endpoints.
const websocket_router_instance = new WS_Route_Handler_Class();
websocket_router_instance.attachServer(main_websocket_server); // Link the router to the WebSocket server.

// Global variable to hold a reference to the active 'stage' connection.
// In a production setup, this might be managed more robustly (e.g., a Map or Set).
let active_stage_controller_connection = null;

// Handler for all incoming WebSocket connection requests.
main_websocket_server.on('request', (ws_connection_request) => {
    console.log(`[WS Request] Origin: ${ws_connection_request.origin}, Path: ${ws_connection_request.resource}`);
    // The router will handle actual acceptance based on mounted paths.
    // If no route matches, the connection implicitly remains unaccepted and will eventually time out.
});

// Mount point for the '/stage_control' WebSocket endpoint.
websocket_router_instance.mount('/stage_control', '', (ws_connection_request) => { // Renamed path
    const accepted_stage_connection = ws_connection_request.accept(ws_connection_request.origin);
    active_stage_controller_connection = accepted_stage_connection; // Store the connection.
    console.log('[WS] Stage control connection established.');

    // Function to safely send JSON messages over a WebSocket.
    const transmit_json_payload = (socket_connection, data_object) => {
        if (socket_connection && socket_connection.connected) {
            try {
                socket_connection.sendUTF(JSON.stringify(data_object));
            } catch (json_error) {
                console.error('Failed to serialize JSON for WebSocket transmission:', json_error.message);
            }
        } else {
            console.warn('Attempted to send data to a disconnected or invalid WebSocket socket.');
        }
    };

    // Send an initial 'idle' status to the connected stage.
    transmit_json_payload(active_stage_controller_connection, {
        command_key: "idle_mode" // Renamed 'cmd' to 'command_key' and value.
    });

    accepted_stage_connection.on('close', (close_code, close_description) => {
        console.log(`[WS] Stage control connection closed: ${close_description} (${close_code})`);
        if (active_stage_controller_connection === accepted_stage_connection) {
            active_stage_controller_connection = null; // Clear reference on disconnect.
        }
    });
    accepted_stage_connection.on('error', (err) => console.error('[WS] Stage control connection error:', err.message));
});

// Mount point for '/system_status' WebSocket endpoint.
websocket_router_instance.mount('/system_status', '', (ws_connection_request) => { // Renamed path
    const system_status_socket = ws_connection_request.accept(ws_connection_request.origin);
    console.log("[WS] System status monitoring connection active.");
    // In a real application, this would stream system metrics.
    system_status_socket.on('close', () => console.log('[WS] System status connection terminated.'));
    system_status_socket.on('error', (err) => console.error('[WS] System status connection error:', err.message));
});

// Enum-like object for WebSocket command types for better readability and maintainability.
const WebSocket_Commands = Object.freeze({
    CLIENT_REGISTRATION: "CLIENT_REG_REQ",
    CHANNEL_ALLOCATION_REQUEST: "CHANNEL_ALLOC_REQ",
    CHANNEL_ALLOCATION_RESPONSE: "CHANNEL_ALLOC_RES",
    NEW_CHANNEL_NOTIFICATION: "NEW_CHANNEL_NOTIF"
});

// Mount point for '/client_connect' WebSocket endpoint (client registration and channel negotiation).
websocket_router_instance.mount('/client_connect', '', (ws_connection_request) => { // Renamed path
    const client_socket_connection = ws_connection_request.accept(ws_connection_request.origin);
    let registered_client_name = null; // Stores the name provided by the client.

    console.log('[WS] New client connection initiated.');

    // Helper to send JSON messages to a specific client socket.
    const send_json_to_client_socket = (target_socket, data_to_send) => {
        if (target_socket && target_socket.connected) {
            try {
                target_socket.sendUTF(JSON.stringify(data_to_send));
            } catch (serialization_error) {
                console.error('Error serializing JSON for client socket:', serialization_error.message);
            }
        } else {
            console.warn('Attempted to send data to a disconnected client socket.');
        }
    };

    client_socket_connection.on('message', (received_message) => {
        if (received_message.type === 'utf8') {
            try {
                const parsed_ws_command = JSON.parse(received_message.utf8Data);

                // Basic validation for command structure.
                if (!parsed_ws_command || typeof parsed_ws_command.type !== 'string') {
                    console.warn('[WS] Received malformed command from client:', received_message.utf8Data);
                    send_json_to_client_socket(client_socket_connection, { status: "ERROR", info: "Invalid command format." });
                    return;
                }

                switch (parsed_ws_command.type) {
                    case WebSocket_Commands.CLIENT_REGISTRATION:
                        registered_client_name = parsed_ws_command.clientIdentifier; // Renamed 'name' to 'clientIdentifier'
                        if (!registered_client_name) {
                            console.warn('[WS] Registration attempt with missing client identifier.');
                            send_json_to_client_socket(client_socket_connection, { status: "ERROR", info: "Client identifier required." });
                            client_socket_connection.close(4001, 'Missing client identifier');
                            return;
                        }
                        console.log(`[WS] Client '${registered_client_name}' is attempting registration.`);

                        // Dynamically create a WebSocket mount point for this client's receiver.
                        websocket_router_instance.mount(`/client_receiver/${registered_client_name}`, '', (receiver_ws_request) => {
                            const receiver_socket = receiver_ws_request.accept(receiver_ws_request.origin);
                            // Extract app name from path, e.g., /client_receiver/MyTestApp -> MyTestApp
                            const app_alias_from_url = receiver_ws_request.resourceURL.pathname.split('/').pop().replace(/Dev$/, ''); // More robust extraction.
                            console.log(`[WS] Receiver connected for application: ${app_alias_from_url}`);

                            const target_app_module = Application_Registry_Module.all_registered_apps[app_alias_from_url];
                            if (target_app_module) {
                                target_app_module.registerReceiver(receiver_socket);
                            } else {
                                console.warn(`[WS] No registered app found for alias '${app_alias_from_url}'.`);
                                receiver_socket.close(4004, `App '${app_alias_from_url}' not configured.`);
                            }

                            receiver_socket.on('close', () => console.log(`[WS] Receiver for ${app_alias_from_url} disconnected.`));
                            receiver_socket.on('error', (err) => console.error(`[WS] Receiver for ${app_alias_from_url} error:`, err.message));
                        });

                        // Respond to the client with a request for channel allocation.
                        send_json_to_client_socket(client_socket_connection, {
                            type: WebSocket_Commands.CHANNEL_ALLOCATION_REQUEST,
                            originatorId: 101, // Renamed 'senderId' to 'originatorId'
                            transactionId: 201 // Renamed 'requestId' to 'transactionId'
                        });
                        break;

                    case WebSocket_Commands.CHANNEL_ALLOCATION_RESPONSE:
                        // Client has responded, now provide the final WebSocket channel URL.
                        if (registered_client_name) {
                            const new_channel_ws_url = `ws://localhost:${server_port_number}/client_receiver/${registered_client_name}`;
                            send_json_to_client_socket(client_socket_connection, {
                                type: WebSocket_Commands.NEW_CHANNEL_NOTIFICATION,
                                originatorId: 101,
                                transactionId: 201,
                                channelEndpointURL: new_channel_ws_url // Renamed 'URL' to 'channelEndpointURL'
                            });
                            console.log(`[WS] New channel URL provided to '${registered_client_name}': ${new_channel_ws_url}`);
                        } else {
                            console.warn('[WS] Received channel response from an unregistered client.');
                            client_socket_connection.close(4003, 'Client not previously registered.');
                        }
                        break;

                    default:
                        console.warn(`[WS] Unrecognized WebSocket command type: ${parsed_ws_command.type}`);
                        send_json_to_client_socket(client_socket_connection, { status: "ERROR", info: `Unknown command: ${parsed_ws_command.type}` });
                        break;
                }
            } catch (json_parse_error) {
                console.error('[WS] Error parsing incoming WebSocket message:', json_parse_error.message, received_message.utf8Data);
                client_socket_connection.close(4000, 'Invalid JSON payload.');
            }
        }
    });

    client_socket_connection.on('close', (close_code, close_description) => {
        console.log(`[WS] Client connection closed (Client: ${registered_client_name || 'Anonymous'}): ${close_description} (${close_code})`);
        // If dynamic routes were created for this client, consider unmounting them here.
    });

    client_socket_connection.on('error', (err) => console.error('[WS] Client connection error:', err.message));
});

// Regular expression for dynamic session paths.
const session_websocket_regex = new RegExp('^/app_session/.*$'); // Renamed regex variable.

// Mount point for application-specific WebSocket sessions.
websocket_router_instance.mount(session_websocket_regex, '', (ws_connection_request) => {
    const app_session_socket = ws_connection_request.accept(ws_connection_request.origin);
    console.log("[WS] New application session connection initiated.");

    // Extract app name and session ID from the URL path and query string.
    const path_segments = ws_connection_request.resourceURL.pathname.split('/');
    const session_target_app_name = path_segments[path_segments.length - 1]; // Get the last segment.
    const session_unique_identifier = ws_connection_request.resourceURL.search.substring(1) || `session-${Date.now()}`; // Default if no ID provided.

    console.log(`[WS] Session for application: ${session_target_app_name}, Session ID: ${session_unique_identifier}`);

    const associated_application_handler = Application_Registry_Module.all_registered_apps[session_target_app_name];

    if (associated_application_handler) {
        associated_application_handler.registerSession(app_session_socket, session_unique_identifier); // Pass session ID.
    } else {
        console.warn(`[WS] No application handler found for session target: ${session_target_app_name}`);
        app_session_socket.close(4004, `Application '${session_target_app_name}' not available.`);
    }

    app_session_socket.on('close', () => console.log(`[WS] Session for ${session_target_app_name} (${session_unique_identifier}) disconnected.`));
    app_session_socket.on('error', (err) => console.error(`[WS] Session for ${session_target_app_name} error:`, err.message));
});


/**
 * Determines and returns the non-internal IPv4 address of the host machine.
 * @returns {string} The detected IPv4 address, or '127.0.0.1' as a fallback.
 */
function discover_local_ipv4_address() {
    const os_network_interfaces = require('os').networkInterfaces();
    for (const interface_name in os_network_interfaces) {
        // Ensure property belongs to the object itself, not prototype chain.
        if (Object.prototype.hasOwnProperty.call(os_network_interfaces, interface_name)) {
            const interface_details = os_network_interfaces[interface_name];
            for (let i = 0; i < interface_details.length; i++) {
                const address_record = interface_details[i];
                // Look for IPv4 addresses that are not loopback.
                if (address_record.family === 'IPv4' && !address_record.internal) {
                    return address_record.address; // Return the first suitable address.
                }
            }
        }
    }
    console.warn("Unable to find an external IPv4 address. Falling back to localhost (127.0.0.1).");
    return '127.0.0.1'; // Default to loopback if no suitable address is found.
}

// Global variable to store the loaded application registry module.
let Application_Registry_Module;

// Main application startup sequence (using an async IIFE for better structure).
(async () => {
    const detected_host_ip = discover_local_ipv4_address();
    console.log(`System host IP address identified: ${detected_host_ip}`);

    try {
        await initialize_application_components(detected_host_ip);
        configure_web_api_endpoints(detected_host_ip);
        setup_service_discovery_protocol(detected_host_ip);
        console.log("All core application components initialized successfully.");
    } catch (startup_error) {
        console.error("Critical error during application startup:", startup_error.message);
        process.exit(1); // Exit with a failure code if initialization fails.
    }
})();


/**
 * Loads and initializes the application registry, then registers predefined applications.
 * @param {string} current_host_ip The IP address of the host machine.
 */
async function initialize_application_components(current_host_ip) {
    // Dynamically import the module responsible for managing applications.
    Application_Registry_Module = require('./apps/apps.js');
    Application_Registry_Module.init(file_system_module, web_application_server); // Pass necessary dependencies.

    console.log("Loading and registering default receiver applications...");

    // Configuration for various applications.
    const predefined_app_configurations = [
        { appId: "ChromecastBuiltIn", urlTemplate: "https://www.gstatic.com/cv/receiver.html?$query", description: "Built-in Chromecast Receiver" },
        { appId: "YouTubeTV", urlTemplate: "https://www.youtube.com/tv?$query", description: "YouTube for Smart TVs" },
        { appId: "GooglePlayMovies", urlTemplate: "https://play.google.com/video/avi/eureka?$query", description: "Google Play Movies & TV" },
        { appId: "GoogleMusicPlayer", urlTemplate: "https://jmt17.google.com/sjdev/cast/player", description: "Google Play Music Receiver" },
        { appId: "SampleReceiver", urlTemplate: "http://anzymrcvr.appspot.com/receiver/anzymrcvr.html", description: "Anzym Sample Receiver App" },
        { appId: "CastVideoPlayer", urlTemplate: "https://www.gstatic.com/eureka/html/gcp.html", description: "Generic Cast Video Player" },
        { appId: "FlingApp", urlTemplate: "$query", description: "Basic Fling Protocol App" },
        { appId: "TicTacToeGame", urlTemplate: "http://www.gstatic.com/eureka/sample/tictactoe/tictactoe.html", description: "Classic Tic Tac Toe Game" },
        { appId: "DeveloperTestApp", urlTemplate: `http://${current_host_ip}:${server_port_number}/dev-receiver.html`, description: "Local Development Test App" } // Added a new local app.
    ];

    // Register each application in the registry.
    for (const app_settings of predefined_app_configurations) {
        Application_Registry_Module.registerApp(web_application_server, current_host_ip, app_settings.appId, app_settings.urlTemplate, app_settings.description);
        console.log(`  -> Registered application: ${app_settings.appId}`);
    }
}

/**
 * Configures the various HTTP routes (REST API endpoints) for the Express application.
 * @param {string} current_host_ip The IP address of the host.
 */
function configure_web_api_endpoints(current_host_ip) {
    console.log("Setting up web API endpoints...");

    // GET endpoint for the SSDP device description XML file.
    web_application_server.get("/device_info.xml", (request_object, response_object) => { // Renamed endpoint.
        const description_xml_path = './device-desc.xml'; // Original file name.
        file_system_module.readFile(description_xml_path, 'utf8', (read_err, xml_file_content) => {
            if (read_err) {
                console.error(`Error reading device description XML: ${read_err.message}`);
                return response_object.status(500).send('Could not retrieve device information.');
            }

            // Replace placeholders in the XML content with dynamic values.
            const processed_xml_output = xml_file_content
                .replace(/#uuid#/g, instance_unique_id) // Use the generated instance UUID.
                .replace(/#base#/g, `http://${request_object.headers.host}`) // Use the request's host header.
                .replace(/#name#/g, application_display_name); // Use the configured app name.

            response_object.type('application/xml'); // Set content type explicitly to application/xml.
            response_object.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS"); // Allow specific methods.
            response_object.setHeader("Access-Control-Expose-Headers", "Location, X-Application-URL"); // Expose custom header.
            response_object.setHeader("X-Application-URL", `http://${request_object.headers.host}/registered_applications`); // Custom header.
            response_object.send(processed_xml_output);
        });
    });

    // POST endpoint for initiating a connection to a specific application.
    web_application_server.post('/application_connect/:appIdentifier', (request_object, response_object) => { // Renamed path and parameter.
        const requested_app_id = request_object.params.appIdentifier;
        console.log(`Attempting to establish connection for application: ${requested_app_id}`);

        response_object.setHeader("Access-Control-Allow-Method", "POST, OPTIONS");
        response_object.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Requested-With, Accept"); // Add more allowed headers.

        // Construct the WebSocket URL for the new session.
        const session_ws_url = `ws://${current_host_ip}:${server_port_number}/app_session/${requested_app_id}?session_token=${Date.now()}`; // Use a timestamp as a simple session token.

        response_object.type("application/json");
        response_object.status(200).json({ // Use .json() for automatic stringification and header setting.
            sessionWsUrl: session_ws_url, // Renamed key.
            keepAliveIntervalMs: 5000 // Renamed and changed value to milliseconds.
        });
        console.log(`Connection details sent for ${requested_app_id}.`);
    });

    // GET endpoint to query available applications or redirect to an active one.
    web_application_server.get('/registered_applications', (request_object, response_object) => { // Renamed endpoint.
        const app_keys_list = Object.keys(Application_Registry_Module.all_registered_apps);

        // Iterate through registered apps to find if any are currently running.
        for (const app_key of app_keys_list) {
            const app_current_state = Application_Registry_Module.all_registered_apps[app_key].config.state;
            if (app_current_state === "running") {
                console.log(`Redirecting client to currently active application: ${app_key}`);
                return response_object.redirect(302, `/app_view/${app_key}`); // Use 302 Found redirect, new path.
            }
        }

        // If no running applications are found, respond with 204 No Content.
        response_object.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        response_object.setHeader("Access-Control-Expose-Headers", "Location, Content-Length, X-No-Active-App"); // Expose custom header.
        response_object.setHeader("Content-Length", "0");
        response_object.setHeader("Content-Type", "text/html; charset=UTF-8");
        response_object.setHeader("X-No-Active-App", "true"); // Custom header indicating no active app.
        response_object.status(204).send(); // Send 204 status with no body.
        console.log("No active applications detected; responded with 204 No Content.");
    });
}

/**
 * Configures and starts the SSDP (Simple Service Discovery Protocol) for device discoverability.
 * @param {string} current_host_ip The IP address of the host machine.
 */
function setup_service_discovery_protocol(current_host_ip) {
    const ssdp_device_peer = network_discovery_service.createPeer(); // Renamed peer variable.

    ssdp_device_peer.on("ready", () => {
        console.log("SSDP discovery peer is now operational.");
        // Could perform initial SSDP advertisement here if required.
    });

    ssdp_device_peer.on("notify", (notification_headers, remote_host_address) => {
        // Log incoming SSDP NOTIFY messages for debugging.
        console.debug(`[SSDP] NOTIFY received from ${remote_host_address.address}`);
    });

    ssdp_device_peer.on("search", (search_request_headers, remote_host_address) => {
        const searched_service_type = search_request_headers.ST;
        const required_service_urn = "urn:dial-multiscreen-org:service:dial:1";

        // Check if the search request matches our service type.
        if (searched_service_type && searched_service_type.includes(required_service_urn)) {
            console.log(`[SSDP] Responding to search for '${required_service_urn}' from ${remote_host_address.address}`);

            // Construct the SSDP M-SEARCH response payload.
            const ssdp_response_data = {
                LOCATION: `http://${current_host_ip}:${server_port_number}/device_info.xml`, // Updated endpoint.
                ST: required_service_urn,
                "CONFIGID.UPNP.ORG": 12345, // Changed UPNP config ID.
                "BOOTID.UPNP.ORG": 12346,   // Changed UPNP boot ID.
                USN: `uuid:${instance_unique_id}` // Use the global instance UUID.
            };
            ssdp_device_peer.reply(ssdp_response_data, remote_host_address);
        } else {
            console.debug(`[SSDP] Ignoring search for unmatched service type: ${searched_service_type}`);
        }
    });

    ssdp_device_peer.start(); // Initiate the SSDP listening and advertising.
    console.log("SSDP service discovery protocol started.");
}