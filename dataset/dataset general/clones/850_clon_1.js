/*
 * This module is responsible for managing host configurations within the application.
 * It provides API endpoints for retrieving, adding, and deleting host entries.
 * The host data is persisted in a JSON file.
 */

// Require necessary external modules
var jf = require('jsonfile'); // jsonfile for easy JSON file operations
var util = require('util');   // util module, though not explicitly used in this snippet, it's part of the original

// Define the path to the configuration file
var file = __dirname + "/../config.json"; // Path relative to the current directory

// Read the initial host configurations synchronously from the file
var hosts = jf.readFileSync(file); // Load existing hosts data


/**
 * Main module export function. This function takes an Express application instance
 * and registers all host-related routes with it.
 *
 * @param {object} app - The Express application object.
 */
module.exports = function(app) {


    // GET endpoint to retrieve and display all hosts
    app.get("/hosts", function(req, res) {
        // Render the 'host' view, passing the loaded hosts data
        res.render('host', {
            hosts: hosts,   // Array of all configured hosts
            host: null      // Placeholder for a single host, not used in this view
        });
    });


    // POST endpoint to add a new host entry
    app.post("/hosts/add", function(req, res, next) {
        var host = {}; // Create a new empty host object

        try {
            // Extract host details from the request body
            host.host = req.body.host; // The actual host address/URL
            host.name = req.body.name; // A user-friendly name for the host
        } catch (err) {
            // If there's an error parsing or accessing request body properties,
            // pass it to the next middleware for error handling
            return next(err);
        }

        // Add the newly created host to the in-memory hosts array
        hosts.push(host);

        // Persist the updated hosts array back to the configuration file
        // This ensures changes are saved permanently
        jf.writeFileSync(file, hosts);

        // Respond with the updated list of hosts in JSON format
        res.json({
            hosts: hosts // Return the complete, updated hosts array
        });
    });


    // POST endpoint to delete an existing host entry
    app.post("/hosts/delete", function(req, res, next) {
        var index = -1; // Initialize index to -1, indicating host not found

        // Iterate through the hosts array to find the host to be deleted by its name
        for (var i = 0; i < hosts.length; i++) {
            if (hosts[i].name == req.body.name) {
                index = i; // Found the host, store its array index
                break;     // Exit the loop as soon as the host is found
            }
        }

        // If a host was found (index is not -1), remove it from the array
        if (index >= 0) {
            hosts.splice(index, 1); // Remove one element at the found index
        }

        // Save the modified hosts array (after deletion) back to the file
        jf.writeFileSync(file, hosts);

        // Respond with the current list of hosts in JSON format
        res.json({
            hosts: hosts // Return the hosts array after the deletion
        });
    });
}; // End of module.exports function


// Additionally, export the 'hosts' array directly for external access if needed
// This allows other modules to directly access the in-memory hosts data.
module.exports.hosts = hosts;