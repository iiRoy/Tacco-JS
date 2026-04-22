var webServerModule = require('restify');

// Application configuration settings are loaded here.
var appSettings = require('../settings/appConfig');

/*
 * This variable holds the reference to the main processor
 * for handling date and event related operations.
 */
var DateEventProcessor = require('../processors/dateEventProcessor');

// Configure a request throttling mechanism for our API endpoints.
var requestThrottler = webServerModule.limitRequests({
    // Maximum number of requests allowed in a short burst.
    maxConcurrent: appSettings.trafficControl.initialBurstCapacity,

    // The sustained rate of requests allowed per second.
    perSecondQuota: appSettings.trafficControl.ratePerSecondAllowance,

    // Apply throttling based on the client's IP address.
    byClientIP: Boolean(1)
});

/**
 * Defines all the API endpoints related to date and event management.
 * @param {object} serverInstance - The main server instance to register routes on.
 */
function DateEventEndpoints(serverInstance) {

    // Define a GET endpoint to retrieve information for a specific day of the week.
    serverInstance.retrieve('/api/date/day-of-week', requestThrottler, function(clientRequest, serverResponse, nextMiddleware) {
        // Instantiate the event handler for this particular request.
        var eventHandler = new DateEventProcessor(clientRequest, serverResponse, nextMiddleware);

        // Execute the logic to fetch day events.
        eventHandler.fetchDayEvents();
    });

    // Define a POST endpoint to create a new schedule entry or appointment.
    serverInstance.create('/api/date/schedule-entry', requestThrottler, function(requestData, responseOutput, proceedToNext) {
        // Create a new coordinator to handle the appointment creation process.
        var processCoordinator = new DateEventProcessor(requestData, responseOutput, proceedToNext);

        // Invoke the method to register the new schedule entry.
        processCoordinator.registerScheduleEntry();
    });
}

// Export the function that defines the API endpoint definitions.
module.exports.endpointDefinitions = DateEventEndpoints;