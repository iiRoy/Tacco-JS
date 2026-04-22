// External module dependencies required for live reloading operations
const SocketProvider = require('ws').Server; // Provides WebSocket server functionality
const FileMonitor = require('gaze');       // Monitors file system for changes
const PathUtilities = require('path');     // Utility for handling file paths and extensions
const UtilityToolkit = require('lodash');  // General utility functions, e.g., for throttling execution

/**
 * Initializes a live reload mechanism for web applications.
 * This module sets up a WebSocket server to notify connected clients of file changes
 * and serves a client-side JavaScript file to handle these notifications.
 *
 * @param {object} configParams - Configuration parameters for the live reloader.
 * @param {object} configParams.httpServerInst - The underlying HTTP server instance to attach the WebSocket server to.
 * @param {object} configParams.expressAppInst - The Express application instance to register a client-side script route with.
 * @param {string[]} configParams.watchTargets - An array of glob patterns specifying files/directories to monitor for changes.
 */
module.exports.initLiveReloader = function (configParams) {
    // --- Input Validation and Configuration Extraction ---
    if (!configParams || typeof configParams !== 'object') {
        console.error('Live reloader initialization failed: Configuration parameters are missing or invalid.');
        return; // Abort initialization if no valid config is provided
    }
    const httpServerInst = configParams.httpServerInst;
    const expressAppInst = configParams.expressAppInst;
    const watchTargets = configParams.watchTargets;

    // Ensure all critical configuration properties are present and valid.
    if (!httpServerInst || !expressAppInst || !watchTargets || !Array.isArray(watchTargets) || watchTargets.length === 0) {
        console.error('Live reloader initialization failed: Essential configuration properties (httpServerInst, expressAppInst, watchTargets) are missing, invalid, or watchTargets is empty.');
        return; // Abort if essential configs are missing
    }

    // --- WebSocket Server Setup ---
    // Create a new WebSocket server instance, linking it to the provided HTTP server.
    const socketServer = new SocketProvider({ server: httpServerInst });

    // A unique counter for assigning identifiers to new client connections.
    let connectionIdGen = 0;

    // A Map data structure to store active WebSocket connections, indexed by their unique IDs.
    const activeConnectionsMap = new Map();

    // Event listener for new client connections to the WebSocket server.
    socketServer.on('connection', function(clientSocket) {
        // Generate a unique identifier for the newly connected client.
        const connectionHandle = `client_${++connectionIdGen}`;
        activeConnectionsMap.set(connectionHandle, clientSocket); // Store the client socket in the map.
        console.debug(`[LiveReloader] Client connected: ${connectionHandle}. Total active connections: ${activeConnectionsMap.size}`);

        // Set up a handler for when this specific client socket disconnects.
        clientSocket.onclose = () => {
            activeConnectionsMap.delete(connectionHandle); // Remove the disconnected client from the map.
            console.debug(`[LiveReloader] Client disconnected: ${connectionHandle}. Remaining active connections: ${activeConnectionsMap.size}`);
        };

        // Optionally, handle errors that occur on individual client sockets.
        clientSocket.onerror = (errorEvent) => {
            console.warn(`[LiveReloader] WebSocket error for ${connectionHandle}:`, errorEvent.message);
            // The 'onclose' event will typically follow an 'onerror' if the connection is terminated.
        };
    });

    // --- Broadcast Mechanism ---
    // Define a throttle delay to prevent clients from being overwhelmed during rapid file changes.
    const broadcastDelayMs = 400; // Increased from 300ms for slightly less frequent updates.

    /**
     * Sends an update payload to all currently connected WebSocket clients.
     * This function is throttled to consolidate multiple rapid changes into a single notification.
     * @param {string} updatePayload - The message string to send to clients (e.g., a file extension or a command).
     */
    const notifyClientsOfUpdate = UtilityToolkit.throttle((updatePayload) => {
        // Guard clause: If no clients are connected, there's no one to notify.
        if (activeConnectionsMap.size === 0) {
            console.info('[LiveReloader] No active clients to notify. Skipping broadcast.');
            return;
        }

        console.info(`[LiveReloader] Broadcasting update payload: "${updatePayload}" to ${activeConnectionsMap.size} client(s).`);

        // Iterate over all active connections and attempt to send the update.
        for (const [handle, client] of activeConnectionsMap.entries()) {
            try {
                // Ensure the socket is in an OPEN state before attempting to send data.
                if (client.readyState === SocketProvider.OPEN) {
                    client.send(updatePayload);
                } else {
                    console.warn(`[LiveReloader] Skipping send to ${handle}: Socket not in OPEN state (readyState: ${client.readyState}).`);
                    // Consider removing this client from the map if it's consistently not open.
                }
            } catch (transmissionError) {
                console.error(`[LiveReloader] Error sending update to ${handle}:`, transmissionError.message);
                // Log the error but continue attempting to notify other clients.
            }
        }
    }, broadcastDelayMs);

    // --- Client-Side Script Serving ---
    // Register an Express route to serve the client-side JavaScript that establishes
    // a WebSocket connection and handles live reload logic in the browser.
    expressAppInst.get("/live-observer.js", function (requestObj, responseObj) {
        // Set appropriate HTTP headers for a JavaScript file.
        responseObj.set({ 'Content-Type': 'application/javascript; charset=utf-8', 'Cache-Control': 'no-cache, no-store, must-revalidate' });
        
        // The embedded client-side JavaScript code.
        const clientScriptContent = `
            // Client-side script for live reloading functionality.
            (function() {
                // Determine WebSocket protocol (ws: or wss:) based on the current page's protocol.
                const socketProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                // Establish a new WebSocket connection to the host server.
                const clientObserver = new WebSocket(socketProtocol + '//' + window.location.host + '/');

                // Handler for when the WebSocket connection is successfully opened.
                clientObserver.onopen = () => {
                    console.log('[LiveObserver] Connected to live reload server.');
                };

                // Handler for messages received from the WebSocket server.
                clientObserver.onmessage = function (incomingMsg) {
                    const receivedData = incomingMsg.data;
                    console.log('[LiveObserver] Received message:', receivedData);

                    // Helper function to efficiently reload CSS/LESS/SCSS stylesheets.
                    const refreshStylesheets = () => {
                        console.log('[LiveObserver] Attempting to refresh CSS/LESS/SCSS stylesheets.');
                        // Generate a unique cache-busting parameter using the current timestamp.
                        const cacheBusterParam = '?_reload_ts=' + new Date().getTime();
                        
                        // Select all <link> elements with rel="stylesheet" and iterate through them.
                        document.querySelectorAll('link[rel="stylesheet"]').forEach(styleLinkElem => {
                            // Skip external stylesheets that should not be reloaded (e.g., CDN-hosted fonts).
                            if (!styleLinkElem.href.includes("typekit.net") && !styleLinkElem.href.includes("fonts.googleapis.com")) {
                                try {
                                    // Remove any existing query string from the href and append the new cache buster.
                                    const currentHref = styleLinkElem.href;
                                    const newHref = currentHref.split('?')[0] + cacheBusterParam;
                                    styleLinkElem.href = newHref; // Assign the modified href to trigger a reload.
                                } catch (cssReloadError) {
                                    console.error('[LiveObserver] Error reloading stylesheet:', cssReloadError.message);
                                }
                            }
                        });
                    };

                    // Decide action based on the received data payload from the server.
                    if (['.css', '.less', '.scss'].includes(receivedData)) { // Check for common style file extensions.
                        refreshStylesheets(); // Trigger stylesheet-only reload.
                    } else if (receivedData === 'full_reload') { // Specific command for a full page refresh.
                        console.log('[LiveObserver] Full page reload requested by server.');
                        window.location.reload(true); // Force a reload from the server, bypassing browser cache.
                    } else {
                        // Default action: perform a full page reload for any other type of change.
                        console.log('[LiveObserver] Generic file change detected. Performing full page reload.');
                        window.location.reload();
                    }
                };

                // Handler for WebSocket errors.
                clientObserver.onerror = (err) => {
                    console.error('[LiveObserver] WebSocket error occurred:', err.message || err);
                };

                // Handler for WebSocket connection closure.
                clientObserver.onclose = (event) => {
                    console.warn('[LiveObserver] WebSocket connection closed. Code:', event.code, 'Reason:', event.reason || 'No specific reason.');
                    // Attempt to reconnect after a short delay if the connection was not closed cleanly.
                    if (!event.wasClean) {
                        setTimeout(() => {
                            console.log('[LiveObserver] Attempting to reconnect to live reload server...');
                            // In a production scenario, a more robust reconnection strategy (e.g., exponential backoff)
                            // would be implemented here, potentially re-instantiating the WebSocket.
                            // For this example, we just log the attempt.
                        }, 2500); // Wait 2.5 seconds before attempting a reconnect.
                    }
                };
            })();
        `;
        responseObj.send(clientScriptContent); // Send the generated client script.
    });

    // --- File System Monitoring ---
    console.info(`[LiveReloader] Initializing file system monitor for targets: ${watchTargets.join(', ')}`);
    const fileMonitor = new FileMonitor(watchTargets);

    // Register a handler for any file system event (added, changed, deleted).
    fileMonitor.on('anyChange', function(fileEvent, affectedPath) {
        const fileExtension = PathUtilities.extname(affectedPath).toLowerCase(); // Get file extension, normalized to lowercase.
        const fileName = PathUtilities.basename(affectedPath); // Get just the file name for more detailed logging.

        console.debug(`[LiveReloader] Detected file event: "${fileEvent}" on "${fileName}" (extension: "${fileExtension}")`);

        let payloadToBroadcast = 'full_reload'; // Default payload is a full page reload.

        // If the change is to a style-related file, send its extension for a targeted stylesheet reload.
        if (['.css', '.less', '.scss'].includes(fileExtension)) {
            payloadToBroadcast = fileExtension;
        }

        notifyClientsOfUpdate(payloadToBroadcast); // Broadcast the determined payload to clients.
    });

    // Register an error handler for the file system monitor.
    fileMonitor.on('error', (err) => {
        console.error('[LiveReloader] File monitor encountered an error:', err.message);
    });

    // Final log indicating successful service initialization.
    console.info('[LiveReloader] Service initialized successfully. Waiting for file changes and client connections.');
};