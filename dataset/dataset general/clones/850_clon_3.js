const dataHandler = require('jsonfile'); // Renamed 'jf' to 'dataHandler'
// const systemUtility = require('util'); // Removed unused 'util' dependency

// Define the path to our configuration data storage
const configurationDataPath = __dirname + "/../config.json"; // Renamed 'file'

// Helper function to safely read application configuration from disk
const fetchConfigurationData = (dataPath) => {
    try {
        return dataHandler.readFileSync(dataPath);
    } catch (readError) {
        console.error(`Error reading configuration from ${dataPath}:`, readError.message);
        // If file doesn't exist or is empty/corrupt, return an empty array
        return [];
    }
};

// Helper function to persist application configuration to disk
const storeConfigurationData = (dataPath, dataPayload) => {
    try {
        dataHandler.writeFileSync(dataPath, dataPayload, { spaces: 2 }); // Added formatting for readability
        return true;
    } catch (writeError) {
        console.error(`Error writing configuration to ${dataPath}:`, writeError.message);
        return false;
    }
};

// Initialize our mutable collection of registered resources from the config file
let applicationResources = fetchConfigurationData(configurationDataPath); // Renamed 'hosts' to 'applicationResources', changed 'var' to 'let'

/**
 * Main module export function to set up API endpoints for resource management.
 * @param {object} applicationInstance The Express application instance.
 */
module.exports = function initializeApplicationEndpoints(applicationInstance) {

    // Define a route to display all registered resources
    applicationInstance.get("/api/resources", function handleResourceDisplay(requestContext, responseContext) {
        // Render a view with the current list of resources
        responseContext.render('resource_overview', {
            resourceCollection: applicationResources, // Renamed 'hosts' to 'resourceCollection'
            selectedResource: null // Changed 'host : null' to 'selectedResource : null'
        });
    });

    // Define a route to add a new resource
    applicationInstance.post("/api/resources/register", function handleResourceAddition(requestContext, responseContext, nextMiddleware) {
        const incomingResourcePayload = requestContext.body; // Using a single variable for body
        const newResourceEntry = {}; // Renamed 'host' to 'newResourceEntry', changed 'var' to 'const'

        // Validate incoming data
        if (!incomingResourcePayload || !incomingResourcePayload.address || !incomingResourcePayload.name) {
            return responseContext.status(400).json({
                message: "Missing essential resource details (address or name) in the request body.",
                receivedPayload: incomingResourcePayload
            });
        }

        // Check for duplicate resource name (identifier)
        const isDuplicate = applicationResources.some(
            (existingResource) => existingResource.name === incomingResourcePayload.name
        );
        if (isDuplicate) {
            return responseContext.status(409).json({
                message: `A resource with the name '${incomingResourcePayload.name}' already exists.`,
                existingResources: applicationResources
            });
        }

        // Assign properties to the new resource object
        newResourceEntry.address = incomingResourcePayload.address; // Renamed 'host.host' to 'newResourceEntry.address'
        newResourceEntry.name = incomingResourcePayload.name;     // Renamed 'host.name' to 'newResourceEntry.name'

        // Add the new resource to our collection
        applicationResources.push(newResourceEntry);

        // Persist the updated collection to the configuration file
        if (!storeConfigurationData(configurationDataPath, applicationResources)) {
            // If persistence fails, we might want to revert or notify
            applicationResources.pop(); // Revert the push
            return nextMiddleware(new Error("Failed to persist new resource data to storage."));
        }

        // Respond with the updated list of resources
        responseContext.status(201).json({ // Changed status to 201 Created
            status: "success",
            message: "Resource successfully registered.",
            currentResources: applicationResources // Renamed 'hosts' to 'currentResources'
        });
    });

    // Define a route to delete an existing resource
    applicationInstance.post("/api/resources/remove", function handleResourceDeletion(requestContext, responseContext, nextMiddleware) {
        const resourceIdentifierToDelete = requestContext.body.name; // Renamed 'req.body.name'

        // Guard clause: Ensure a name is provided for deletion
        if (!resourceIdentifierToDelete) {
            return responseContext.status(400).json({
                message: "Resource name to delete is missing from the request body."
            });
        }

        // Find the index of the resource to be removed using Array.prototype.findIndex
        const targetResourceIndex = applicationResources.findIndex(
            (resourceEntry) => resourceEntry.name === resourceIdentifierToDelete
        ); // Replaced 'for' loop with 'findIndex'

        // Check if the resource was found
        if (targetResourceIndex === -1) {
            return responseContext.status(404).json({ // Changed status to 404 Not Found
                message: `Resource with identifier '${resourceIdentifierToDelete}' not found.`,
                availableResources: applicationResources
            });
        }

        // Remove the resource from the collection
        applicationResources.splice(targetResourceIndex, 1); // Renamed 'index' to 'targetResourceIndex'

        // Persist the updated collection to the configuration file
        if (!storeConfigurationData(configurationDataPath, applicationResources)) {
            return nextMiddleware(new Error("Failed to persist resource deletion to storage."));
        }

        // Respond with the updated list of resources
        responseContext.status(200).json({
            status: "success",
            message: `Resource '${resourceIdentifierToDelete}' successfully removed.`,
            remainingResources: applicationResources // Renamed 'hosts' to 'remainingResources'
        });
    });
};

// Additionally export the applicationResources array for direct access if needed
module.exports.activeResources = applicationResources; // Renamed 'hosts' to 'activeResources'