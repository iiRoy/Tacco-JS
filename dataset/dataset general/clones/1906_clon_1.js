// This file initializes a TTY.js application with PM2 module integration.
// It sets up a web-based terminal interface for SSH access.


var tty = require('tty.js'); // Import the tty.js library for terminal emulation.


// Initialize the PM2 module configuration.
// This configuration tells PM2 how to handle this module.
var conf = require('pmx')
               .initModule(
                   {
                       errors           : false, // Do not report errors via PM2 (handled internally or elsewhere).
                       latency          : false, // No latency monitoring for this module.
                       versioning       : false, // Versioning is not managed by PM2 here.
                       show_module_meta : false, // Do not display module metadata in PM2 dashboard.
                       comment          : 'Module to SSH to servers' // A descriptive comment for the PM2 module.
                   }
               );


// Define the SSH configuration for the TTY.js application.
// This object holds all the settings for the terminal server.
var ssh_conf = {
    shell           :   'bash', // The default shell to use for new terminal sessions.
    users           :   { }, // Object to store user credentials (populated later).
    port            :   conf.port   ||   8080, // Port to listen on, defaults to 8080 if not specified in PM2 conf.

    "limitGlobal"   :   10000, // Global connection limit for the server.
    "limitPerUser"  :   1000, // Connection limit per individual user.

    "term"          :   { // Terminal emulation settings.
        "termName"      :   "xterm", // The type of terminal to emulate.
        "geometry"      :   [180, 70], // Initial dimensions of the terminal (columns, rows).
        "scrollback"    :   1000, // Number of lines to keep in the scrollback buffer.
        "visualBell"    :   false, // Disable visual bell (screen flash).
        "popOnBell"     :   false, // Do not pop up terminal on bell.
        "cursorBlink"   :   false, // Disable blinking cursor.
        "screenKeys"    :   false, // Do not send screen keys (e.g., F1-F12) to the shell.

        // ANSI color palette definition.
        "colors"        :   [
            "#2e3436", // Black
            "#cc0000", // Red
            "#4e9a06", // Green
            "#c4a000", // Yellow
            "#3465a4", // Blue
            "#75507b", // Magenta
            "#06989a", // Cyan
            "#d3d7cf", // White
            "#555753", // Bright Black
            "#ef2929", // Bright Red
            "#8ae234", // Bright Green
            "#fce94f", // Bright Yellow
            "#729fcf", // Bright Blue
            "#ad7fa8", // Bright Magenta
            "#34e2e2", // Bright Cyan
            "#eeeeec"  // Bright White
        ]
    }
};


// Set up user authentication based on PM2 module configuration.
// If conf.username is not set, defaults to 'foo'.
// If conf.password is not set, defaults to 'bar'.
ssh_conf.users[ conf.username   ||   'foo' ]   =   conf.password   ||   'bar';


// Check if HTTPS is enabled in the PM2 configuration.
// If `conf.https` is true (parsed as boolean), configure HTTPS for the server.
if  (   conf.https   &&   JSON.parse(conf.https)   ==   true   )
{
    // HTTPS configuration object.
    ssh_conf['https']   =   {
        "key"   :   "./term-default.key", // Path to the SSL key file.
        "cert"  :   "./term-default.crt"  // Path to the SSL certificate file.
    };
}


// Create the TTY.js server instance with the defined configuration.
var app   =   tty.createServer(ssh_conf);


// Start the TTY.js server.
// It will listen on the port specified in ssh_conf.port.
app.listen();