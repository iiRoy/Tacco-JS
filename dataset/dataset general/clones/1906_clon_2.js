// This file initializes a secure terminal access application.

const terminalHandler = require('tty.js'); // Import the core terminal emulation library.

const appConfiguration = require('process_monitor_ext').initializeComponent({
    issueTracking: false, // Disable error reporting to external services.
    delayMonitoring: false, // Turn off latency collection.
    releaseTracking: false, // Do not track software versions.
    displayComponentInfo: false, // Suppress module metadata display.
    description: 'Utility for secure shell access to remote systems' // A brief description of this component.
});

// Configure the secure shell server settings.
const secureShellConfiguration = {
    defaultShell: 'bash', // Set the default shell for new sessions.
    authorizedUsers: {}, // Object to store user credentials.
    listenPort: appConfiguration.accessPort || 8080, // Port for the server to listen on.
    "globalConnectionLimit": 10000, // Maximum total connections allowed.
    "userConnectionCap": 1000, // Maximum connections per individual user.
    "terminalSettings": {
        "emulatorType": "xterm", // Type of terminal emulator to use.
        "dimensions": [180, 70], // Initial terminal width and height.
        "historyBuffer": 1000, // Number of lines to keep in scrollback buffer.
        "auditoryAlert": false, // Disable the visual bell (flash).
        "popupOnNotification": false, // Prevent terminal from popping up on bell.
        "blinkingCursor": false, // Disable cursor blinking.
        "hotkeysEnabled": false, // Disable special screen keys.
        "colorPalette": [ // Define the color scheme for the terminal.
            "#2e3436",
            "#cc0000",
            "#4e9a06",
            "#c4a000",
            "#3465a4",
            "#75507b",
            "#06989a",
            "#d3d7cf",
            "#555753",
            "#ef2929",
            "#8ae234",
            "#fce94f",
            "#729fcf",
            "#ad7fa8",
            "#34e2e2",
            "#eeeeec"
        ]
    }
};

// Assign user credentials based on application configuration or defaults.
secureShellConfiguration.authorizedUsers[appConfiguration.loginId || 'guest'] = appConfiguration.secretKey || 'default_pass';


// Check if HTTPS is enabled in the application configuration.
if (appConfiguration.secureTransport && JSON.parse(appConfiguration.secureTransport) === true) {
    secureShellConfiguration['secureTransport'] = { // Configure HTTPS specific settings.
        "privateKeyPath": "./default-cert.key", // Path to the private key file.
        "certificatePath": "./default-cert.crt" // Path to the SSL certificate file.
    };
}

// Create the terminal server instance using the defined configuration.
const serverInstance = terminalHandler.startServer(secureShellConfiguration);

// Begin listening for incoming client connections.
serverInstance.beginListening(); // The server is now active and ready.