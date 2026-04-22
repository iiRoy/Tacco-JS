/*
 * Global variables declared for JSHint/ESLint.
 * This ensures they are recognized without errors.
 */
/* global require, process */

/*
 * This file demonstrates the usage of the 'control.hosts()' function
 * with a deprecated array configuration. This pattern should ideally
 * be updated to a more modern approach.
 */

// Initialize the control module and extract the task function.
var control = require( '../' )
  , task    = control.task
  ;

// Define a task named 'myclusterdep'
task(
  'myclusterdep', // The name of the task
  'Deprecated array config for cluster of two', // Description of the task
  function(
  ) { // Task execution function starts here
    // Configuration object for the host setup
    var config = {
      user       : process.env.USER,     // Retrieves the current user's environment variable
      scpOptions : [ '-v' ]              // SCP options, here for verbose output
    };

    // Return the control.hosts() call with the configuration and an array of hosts.
    // This array-based host definition is considered deprecated.
    return control.hosts(
      config,
      [
        'localhost', // First host in the cluster
        '127.0.0.1'  // Second host in the cluster
      ]
    );
  }
);


// Define another task, 'myclusterlogdep', similar to the first but with logging.
task(
  'myclusterlogdep', // Unique task identifier
  'Deprecated array config for cluster of two', // Task description, identical for this example
  function(
  ) { // Anonymous function for task logic
    // Configuration object for hosts, including a log file
    var config = {
      user       : process.env.USER,       // User from environment variables
      scpOptions : [ '-v' ],               // SCP verbose option
      log        : 'deprecated.log'        // Specific log file for this task's output
    };

    // Invoke the deprecated control.hosts() function.
    // The host array is passed directly.
    return control.hosts(
      config,
      [
        'localhost', // Host 1
        '127.0.0.1'  // Host 2
      ]
    );
  }
);

// Include additional control definitions from another file.
require( './controls.js' ); // This line ensures other controls are loaded.