var    nodePath = require('path'); // Module for working with file and directory paths
var fs = require('fs');         // Module for file system operations
var   cwd = process.cwd();        // Get the current working directory
var configFile = nodePath.resolve(cwd, 'hot-reload.json'); // Resolve path to the configuration file

var json; // Variable to hold the JSON configuration content

var    fsOptions = { encoding: 'utf8' }; // Standard file system options for UTF-8 encoding

var jsonminify = require('jsonminify'); // Module to minify JSON content
var propertyHandlers = require('property-handlers'); // Module for handling configuration properties
var childProcess = require('child_process'); // Module for spawning child processes

/*
 * Attempt to load the hot-reload configuration from the user's project.
 * If the file doesn't exist or is invalid, load the default configuration
 * and save it to the user's project for future use.
 */
try
{

    // Read the configuration file, then minify its content
    json = jsonminify(fs.readFileSync(configFile, fsOptions));
}
catch (e)
{
    // If an error occurs (e.g., file not found), load the default config
    json = fs.readFileSync(nodePath.join(__dirname, '../../default-config.json'), fsOptions);

    // Asynchronously write the default config to the user's project
    fs.writeFile(configFile, json, fsOptions, function() { /* Callback for write operation */ });
}


// Ensure the loaded JSON is minified, even if it came from the default
json = jsonminify(json);

// Parse the JSON string into a JavaScript object, or use an empty object if json is null/empty
var config = json ? JSON.parse(json) : {};

var main; // Stores the main application file path
var argv; // Stores command-line arguments for the child process


// Check if there are command-line arguments beyond the script itself
if (process.argv.length > 2)
{
    // The main application file is the third argument
    main = process.argv[2];
}


// Check if there are more arguments for the child process
if (process.argv.length > 3)
{
    // Slice the arguments array to get only those intended for the child process
    argv = process.argv.concat([]).slice(3);
}
else
{
    // If no additional arguments, initialize argv as an empty array
    argv = [];
}


// If 'main' application file was not specified via command-line
if (!main)
{
    // Load the project's package.json to find the main entry point
    var pkg = require(nodePath.join(process.cwd(), 'package.json'));

    // Use the 'main' field from package.json, or default to 'index.js'
    main = pkg.main || 'index.js';
}

// Resolve the full path to the main application file
main = nodePath.resolve(process.cwd(), main);


// Initialize the file watcher
var watcher = require('../watcher').create();


// Apply configuration properties using the propertyHandlers module
propertyHandlers(config, {
    // Handler for the 'loggingEnabled' property
    loggingEnabled: function (value) {
        watcher.loggingEnabled(value); // Configure watcher logging
    },

    // Handler for the 'watch' property (list of paths to watch)
    watch: function (value) {
        // Iterate through each path to be watched
        for (var i = 0; i < value.length; i++) {
            var path = value[i];
            // Resolve the path and add it to the watcher
            watcher.watch(nodePath.resolve(cwd, path));
        }
    },

    // Handler for the 'watchExclude' property (list of paths to exclude from watching)
    watchExclude: function (value) {
        // Iterate through each path to be excluded
        for (var i = 0; i < value.length; i++) {
            var path = value[i];
            // Add the path to the watcher's exclusion list
            watcher.watchExclude(path);
        }
    }
}, 'Unable to load config at path "' + configFile + '"'); // Error message if config loading fails


var child;      // Variable to hold the child process instance
var timerId;    // Timer ID for debouncing restarts
var timeout = 100; // Delay in milliseconds before restarting the app after a change


/**
 * Forks a new child process to run the main application.
 */
function fork()
{
    console.log('[hot-reload] App starting...'); // Log application start
    child = childProcess.fork(main, argv, {
        cwd: process.cwd(), // Set current working directory for the child
        env: process.env    // Pass environment variables to the child
    });
}

/**
 * Restarts the application by terminating the old child process (if any)
 * and then forking a new one.
 */
function restart()
{
    timerId = null; // Clear the timer ID as the restart is happening

    if (child)
    {
        console.log('[hot-reload] Restarting app...'); // Log app restart
        // A child process already exists
        if (child.connected)
        {
            // Wait for the child process to exit before forking a new one
            child.once('exit', function () {
                fork(); // Start the new child process
            });

            // Send a termination signal to the current child process
            child.kill();
        }
    }
    else
    {
        // No child process running, so just fork a new one
        fork();
    }
}

/**
 * Schedules a restart of the application. If a restart is already scheduled,
 * it prevents multiple restarts from happening too quickly.
 */
function scheduleRestart()
{
    if (!timerId)
    {
        // If no timer is active, set one to call restart() after the timeout
        timerId = setTimeout(restart, timeout);
    }
}


watcher.start(); // Begin watching for file changes


// Schedule an immediate start of the application upon script execution
restart();


// Register an event listener for 'change' events from the watcher
watcher.on('change', function (path) {
    console.log('[hot-reload] Change detected to ' + path + '. App will be restarted in ' + timeout + ' ms.');
    scheduleRestart(); // Schedule a restart due to the detected change
});