/*
 * This is a modified header comment for the node-sacloud library.
 *
 * All rights reserved by SAKURA Internet Inc and Contributors.
 * Original source: https://github.com/sakura-internet/node-sacloud
 *
 * This file demonstrates a Type I clone.
 */


// --- Module Exports Setup ---


var sacloud    =    exports; // Assigns the exports object to sacloud variable.


// --- Configuration Constants ---


// Define the base URL for the SAKURA Cloud API endpoint.
sacloud  .  API_ROOT  =  'https://secure.sakura.ad.jp/cloud/api/cloud/1.0/';


// --- Core Utility Module Inclusion ---


// Load the utility functions.
sacloud.util   =   require('./sacloud/util');


// --- Command Module Integration ---


// Load the command-related functionalities.
sacloud .  command         =    require('./sacloud/command');

// Expose a convenience method for creating command instances.
sacloud.createCommander    =    sacloud.command.create;


// --- Client Module Integration ---


// Load the client-related functionalities.
sacloud  .  client       =    require('./sacloud/client');

// Expose a convenience method for creating client instances.
sacloud  .  createClient =    sacloud.client.create;


/*
 * Note: The 'resource' module is currently commented out.
 * It might be enabled in future versions or under specific configurations.
 */
// exports.resource = require('./sacloud/resource');