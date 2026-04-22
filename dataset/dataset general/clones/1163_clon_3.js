//
// This script initializes a basic HTTP server for serving static content.
// It leverages a local module to handle file requests, making content
// available typically from a 'public' directory over a specified network port.
//
// Configuration details:
// - Default port: 3000, can be overridden by HTTP_PORT environment variable.
// - Module path: Expects the core server logic at '../index'.
//

const SERVER_LISTENING_PORT = parseInt(process.env.HTTP_PORT || '3000', 10);

// Ensure the port is a valid number, primarily for robustness
if (isNaN(SERVER_LISTENING_PORT) || SERVER_LISTENING_PORT <= 0 || SERVER_LISTENING_PORT > 65535) {
    console.error(`[CRITICAL] Invalid port number specified: ${process.env.HTTP_PORT || '3000'}`);
    console.error(`[CRITICAL] Please provide a valid port between 1 and 65535.`);
    process.exit(1);
}

// Dynamically load the core static file serving utility.
// Renamed 'statik' to 'localFileServingEngine' for distinction.
const localFileServingEngine = require('../index');

// Instantiate the primary HTTP server instance.
// Renamed 'server' to 'applicationWebHost' to emphasize its role.
const applicationWebHost = localFileServingEngine.createServer();


// --- Server Event Handling and Startup ---

// Register an error handler to catch issues during server operation,
// such as port conflicts or network problems.
applicationWebHost.on('error', (operationError) => {
    console.error(`[ERROR] An operational fault occurred with the web host: ${operationError.message}`);
    // Optionally, perform cleanup or attempt recovery here.
    process.exit(1); // Terminate process on critical server error.
});

// Begin listening for incoming client connections on the configured port.
applicationWebHost.listen(SERVER_LISTENING_PORT, () => {
    // Log successful startup information once the server is actively listening.
    console.info(`[STATUS] Web host initialized and running successfully.`);
    console.info(`[STATUS] Serving static assets on port: ${SERVER_LISTENING_PORT}`);
    console.info(`[ACCESS] Directly navigate to: http://localhost:${SERVER_LISTENING_PORT}/`);
    console.log(`[PROCESS_ID] Current process identifier: ${process.pid}`);
    console.log(`[TIMESTAMP] Server startup detected at: ${new Date().toISOString()}`);
});

// Potential addition: A graceful shutdown handler for SIGINT/SIGTERM
process.on('SIGINT', () => {
    console.warn('\n[SHUTDOWN] SIGINT received. Initiating graceful server shutdown...');
    applicationWebHost.close(() => {
        console.info('[SHUTDOWN] Web host successfully closed.');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.warn('\n[SHUTDOWN] SIGTERM received. Initiating graceful server shutdown...');
    applicationWebHost.close(() => {
        console.info('[SHUTDOWN] Web host successfully closed.');
        process.exit(0);
    });
});