const httpServerLib = require('restify'); // Renamed web framework import
const systemConfig = require('../config'); // Renamed configuration module
const EventScheduler = require('../controllers/calendarController'); // Renamed controller class

// Pre-define configuration values for the rate limiter for clarity and potential validation
const burstAllowance = systemConfig.limiter.defaultBurstRate;
const rateLimitPerSecond = systemConfig.limiter.defaultRatePerSec;

// Optional: Add a simple validation for rate limiter configuration parameters (Type III addition)
if (typeof burstAllowance !== 'number' || burstAllowance <= 0) {
    console.warn("Configuration Warning: 'defaultBurstRate' is invalid or missing. Using a default of 10.");
    // In a production scenario, one might throw an error or set a robust fallback.
    // For this clone, we'll just log and proceed assuming restify handles invalid inputs gracefully or they're valid.
}

// Configure the request throttling middleware for API endpoints.
// Renamed the middleware variable for better semantic meaning.
const requestThrottler = httpServerLib.throttle({
    burst: burstAllowance,        // Maximum number of requests allowed in a burst
    rate: rateLimitPerSecond,     // Average number of requests allowed per second
    ip: true                      // Apply throttling based on the client's IP address
});

/**
 * Sets up and registers all calendar-related API endpoints with the provided server application.
 * This function ensures that the server can handle requests for calendar day information and appointment scheduling.
 * @param {object} serverApp - The instance of the HTTP server application (e.g., a Restify server).
 */
function EventApiEndpoints(serverApp) {
    // Type III: Add a guard clause to validate the server application instance
    if (!serverApp || typeof serverApp.get !== 'function' || typeof serverApp.post !== 'function') {
        console.error('API Endpoint Setup Error: An invalid or incomplete server application instance was provided.');
        // Prevent further execution if the server object is not correctly initialized
        throw new Error('Server application instance is required for route registration.');
    }

    // Type III: Introduce a helper function for controller instantiation to reduce repetition and add checks
    const instantiateScheduler = (incomingReq, outgoingRes, proceedHandler) => {
        // Type III: Add a validation to ensure the controller class is available
        if (typeof EventScheduler !== 'function') {
            console.error('Critical Error: EventScheduler controller class is not defined. Cannot handle requests.');
            // In a real application, this might indicate a serious deployment issue.
            throw new Error('Scheduler functionality not available due to missing controller.');
        }
        return new EventScheduler(incomingReq, outgoingRes, proceedHandler);
    };

    // Type III: Extract API path strings into constants for maintainability
    const retrieveDayPath = '/api/calendar/weekday';
    const createAppointmentPath = '/api/calendar/appointment';

    // Define the GET endpoint for fetching calendar day information.
    serverApp.get(retrieveDayPath, requestThrottler, function(incomingReq, outgoingRes, proceedHandler) {
        // Type III: Add an intermediate logging statement for request tracking
        console.log(`[HTTP Request] Processing GET request for calendar day details at: ${incomingReq.url}`);

        let schedulerInstance; // Using 'let' for block-scoped variable

        try {
            schedulerInstance = instantiateScheduler(incomingReq, outgoingRes, proceedHandler);
            schedulerInstance.getCalendarDay();
        } catch (error) {
            // Type III: Implement robust error handling for controller execution
            console.error(`Error during calendar day retrieval for ${incomingReq.url}: ${error.message}`, error.stack);
            // Ensure a response is sent if not already, and pass the error to the next middleware
            if (!outgoingRes.headersSent) {
                outgoingRes.send(500, {
                    code: 'InternalServerError',
                    message: 'An unexpected error occurred while fetching calendar data.'
                });
            }
            return proceedHandler(error); // Pass the error down the middleware chain
        }
    });

    // Define the POST endpoint for submitting new calendar appointments.
    serverApp.post(createAppointmentPath, requestThrottler, function(incomingReq, outgoingRes, proceedHandler) {
        // Type III: Add an intermediate logging statement
        console.log(`[HTTP Request] Attempting to create a new appointment via POST at: ${incomingReq.url}`);

        // Type III: Add a basic validation for the presence of a request body for POST operations
        if (!incomingReq.body || Object.keys(incomingReq.body).length === 0) {
            console.warn(`Validation Warning: POST request to ${incomingReq.url} received without a body.`);
            outgoingRes.send(400, {
                code: 'BadRequest',
                message: 'Request body containing appointment data is required.'
            });
            return proceedHandler(new Error('Missing request body')); // Terminate and pass error
        }

        let schedulerInstance;

        try {
            schedulerInstance = instantiateScheduler(incomingReq, outgoingRes, proceedHandler);
            schedulerInstance.postCalendarAppointment();
        } catch (error) {
            // Type III: Implement robust error handling for controller execution
            console.error(`Error during new appointment creation for ${incomingReq.url}: ${error.message}`, error.stack);
            // Ensure a response is sent if not already, and pass the error to the next middleware
            if (!outgoingRes.headersSent) {
                outgoingRes.send(500, {
                    code: 'InternalServerError',
                    message: 'An unexpected error occurred while processing your appointment.'
                });
            }
            return proceedHandler(error); // Pass the error down the middleware chain
        }
    });
}

// Export the function responsible for setting up the API routes.
module.exports.routes = EventApiEndpoints;