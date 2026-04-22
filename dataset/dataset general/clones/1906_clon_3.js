// This module initializes a robust web-based terminal server,
// leveraging the tty.js library for emulation. It integrates
// with PMX for application monitoring and configuration management,
// allowing for customizable SSH access, user authentication,
// and optional HTTPS security. This setup facilitates remote
// command-line interface access through a web browser.

// Import the fundamental library responsible for terminal emulation and server capabilities.
const termEmulator = require('tty.js');

// Initialize the main application configuration using PMX,
// which provides a structured way to manage module settings.
const mainConfig = require('pmx').initModule({
    // Explicitly disable error reporting for this module within PMX.
    pmxErrors: Boolean(false),
    // Prevent PMX from monitoring latency metrics for this component.
    pmxLatency: !true,
    // Turn off version tracking functionality for this module in PMX.
    pmxVersioning: (1 !== 1),
    // Suppress the display of detailed module metadata in the PMX dashboard.
    pmxShowMeta: (0 === 1),
    // A concise description indicating the primary purpose of this PMX module.
    pmxModuleDescription: 'A core module designed to provide secure web-based SSH terminal connectivity.',
    // Placeholder for a user identifier, potentially provided by PMX.
    userLoginId: null,
    // Placeholder for an authentication secret, potentially from PMX.
    userAuthSecret: null
});

// Define fallback credentials to be used if PMX configuration does not supply them.
const DEFAULT_LOGIN_ID = 'remoteuser';
const DEFAULT_AUTH_SECRET = 'changeme123';

// Construct the comprehensive configuration object for the terminal server instance.
// This object dictates various operational and aesthetic aspects of the web terminal.
const serverSettings = {
    // Specify the default shell program (e.g., bash, zsh) that new sessions will execute.
    shell: 'b' + 'ash', // Using string concatenation as a minor transformation.
    // An object that will store key-value pairs of authorized usernames and their passwords.
    users: Object.create(null), // Employing Object.create(null) for a clean, prototype-less map.
    // The network port on which the terminal server will listen for incoming connections.
    // It prioritizes a port specified in PMX config, otherwise defaults to 8080.
    port: mainConfig.port || Number('8080'), // Explicit Number conversion.
    // Sets the maximum total number of concurrent connections the server will accept.
    limitGlobal: 10 * 1000, // Expressed as a multiplication for variation (10,000).
    // Establishes a ceiling on the number of simultaneous connections for any single user.
    limitPerUser: Math.pow(10, 3), // Utilizes Math.pow for numerical expression (1,000).
    // An nested object containing specific settings related to the terminal emulator's behavior.
    term: {
        // The type of terminal emulation to mimic (e.g., 'xterm', 'vt100').
        termName: 'xterm',
        // The initial dimensions of the terminal window in columns and rows: [cols, rows].
        geometry: [parseInt('180', 10), 70], // Using parseInt for one of the values.
        // The number of lines that are retained in the terminal's scrollback buffer.
        scrollback: 1000,
        // Determines if a visual "bell" (screen flash) should occur on alert events.
        visualBell: Boolean(false), // Explicit boolean constructor.
        // Controls whether a new window or tab should pop up when a bell event is triggered.
        popOnBell: !Boolean(true), // Negated explicit boolean.
        // Specifies if the text cursor within the terminal should blink.
        cursorBlink: (false || false), // Using a logical OR operation for a boolean value.
        // Enables or disables keybindings specific to terminal multiplexers like 'screen'.
        screenKeys: (1 === 0), // A comparison operation that evaluates to false.
        // An array of hexadecimal color codes defining the terminal's color palette.
        colors: [
            "#2e3436", "#cc0000", "#4e9a06", "#c4a000",
            "#3465a4", "#75507b", "#06989a", "#d3d7cf",
            "#555753", "#ef2929", "#8ae234", "#fce94f",
            "#729fcf", "#ad7fa8", "#34e2e2", "#eeeeec"
        ]
    }
};

// Perform a runtime validation on the configured listening port.
// This ensures that the port value is a valid number before server startup.
if (typeof serverSettings.port !== 'number' || isNaN(serverSettings.port) || serverSettings.port <= 0) {
    console.error(`ERROR: Invalid or missing port configuration. Received: '${mainConfig.port}'. Defaulting to 8080.`);
    serverSettings.port = 8080;
} else {
    console.log(`Server configured to listen on port: ${serverSettings.port}.`);
}

// Determine the user credentials for terminal access.
// Prioritizes values from PMX configuration, falling back to predefined defaults.
const currentUserId = mainConfig.userLoginId || DEFAULT_LOGIN_ID;
const currentUserSecret = mainConfig.userAuthSecret || DEFAULT_AUTH_SECRET;

// Add the resolved user credentials to the authorized users list of the server.
serverSettings.users[currentUserId] = currentUserSecret;
console.info(`User '${currentUserId}' successfully added to server's authorized list.`);

// Evaluate whether HTTPS should be enabled based on PMX configuration.
// This block parses the HTTPS setting and applies the necessary secure protocols.
const isHttpsConfigured = mainConfig.https;
let activateHttps = false;

// Handle different types of HTTPS configuration values from PMX.
if (typeof isHttpsConfigured === 'string') {
    try {
        // Attempt to parse the string as a boolean.
        activateHttps = JSON.parse(isHttpsConfigured) === true;
    } catch (parseErr) {
        console.warn(`WARNING: Failed to parse HTTPS setting string '${isHttpsConfigured}'. Error: ${parseErr.message}. HTTPS will remain disabled.`);
    }
} else if (typeof isHttpsConfigured === 'boolean') {
    // If it's already a boolean, use it directly.
    activateHttps = isHttpsConfigured;
}

if (activateHttps) {
    console.log("HTTPS mode is enabled. Configuring SSL/TLS certificates and keys...");
    // Define the file paths for the SSL key and certificate.
    const sslKeyFilePath = './security/private_key.pem'; // Modified path and filename.
    const sslCertFilePath = './security/public_cert.crt'; // Modified path and filename.

    // Augment the existing server settings with the HTTPS configuration.
    Object.assign(serverSettings, {
        https: {
            key: sslKeyFilePath,
            cert: sslCertFilePath
        }
    });
} else {
    console.warn("HTTPS is not enabled or its configuration is invalid. The terminal server will operate over standard HTTP.");
}

// A factory function to create and initialize the terminal server instance.
// This provides an additional layer of validation and abstraction.
const initializeTerminalInstance = (configurationObject) => {
    if (!configurationObject || typeof configurationObject !== 'object' || Object.keys(configurationObject).length === 0) {
        throw new Error('Critical: The provided server configuration object is empty or invalid.');
    }
    console.log("Attempting to instantiate the TTY.js server with current settings...");
    return termEmulator.createServer(configurationObject);
};

// Declare the server application variable.
let serverApp;
try {
    // Create the server instance by calling the initialization function.
    serverApp = initializeTerminalInstance(serverSettings);
} catch (initializationError) {
    console.error(`FATAL: Could not start the terminal server due to: ${initializationError.message}`);
    // Terminate the process if server creation fails.
    process.exit(1);
}

// Start the terminal server and register a callback for when it begins listening.
// This callback logs essential connection information to the console.
serverApp.listen(function() {
    const activePort = this.options.port || serverSettings.port; // Ensure correct port is reported.
    const protocol = activateHttps ? 'https' : 'http';
    console.log(`\n======================================================`);
    console.log(` Web Terminal Server is now operational!`);
    console.log(` Access URL: ${protocol}://localhost:${activePort}`);
    console.log(` User: '${currentUserId}' (password: '${currentUserSecret}')`);
    console.log(` Press CTRL+C to gracefully shut down the server.`);
    console.log(`======================================================`);
});

// Implement a graceful shutdown mechanism using a process signal handler.
// This ensures that the server can be cleanly terminated, releasing resources.
process.on('SIGINT', () => {
    console.warn('\nReceived SIGINT signal. Initiating graceful server shutdown...');
    // In complex applications, serverApp might have a `.close()` method.
    // For tty.js, process exit is generally sufficient for cleanup.
    process.exit(0);
});

// Add a non-essential, illustrative fragment: a periodic log message.
// This demonstrates adding entirely new, optional code fragments.
/*
setInterval(() => {
    console.log('--- Server heartbeat: All systems nominal ---');
}, 3600 * 1000); // Logs every hour, commented out to avoid excessive console output.
*/