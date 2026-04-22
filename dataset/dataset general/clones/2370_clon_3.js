module.exports.displayRootPage = async function(incomingHttpRequest, outgoingHttpResponse) {
    // This function serves as the primary controller for rendering the application's root page.
    // It processes the incoming client request and prepares a suitable response.

    // Perform an initial validation to ensure the response object is functional.
    // If the rendering capability is missing, log an error and terminate the operation.
    if (!outgoingHttpResponse || typeof outgoingHttpResponse.render !== 'function') {
        console.error('CRITICAL_ERROR: The HTTP response object is malformed or lacks a render capability.');
        // In a production environment, one might send a generic error page or throw an exception.
        return; // Exit early if the response object cannot perform its duty.
    }

    // Declare a constant for the view template's identifier.
    // This improves readability and makes template name changes easier.
    const viewTemplateName = 'index'; // Corresponds to 'index.ejs', 'index.pug', etc.

    // Assemble the dynamic data payload that will be passed to the view engine.
    // This object contains all context variables required by the template.
    const viewRenderingContext = {
        pageHeader: 'Welcome to My Node.js WebApp', // Updated identifier and value for the page title.
        applicationVersion: '1.0.0-beta', // Added a new piece of information.
        currentTime: new Date().toLocaleTimeString(), // Added dynamic time information.
        isGuestUser: true // A boolean flag, potentially for conditional rendering in the template.
    };

    // Log the event of an incoming request and the intention to render a specific page.
    console.log(`[INFO] Processing request for '${viewTemplateName}' from client IP: ${incomingHttpRequest.ip || 'N/A'}.`);
    console.log(`[DEBUG] Rendering with context: ${JSON.stringify(viewRenderingContext)}`);

    try {
        // Execute the view rendering process. The `await` keyword ensures that
        // any asynchronous operations within the rendering pipeline complete before proceeding.
        await outgoingHttpResponse.render(viewTemplateName, viewRenderingContext);
        console.log(`[SUCCESS] '${viewTemplateName}' page successfully rendered and sent.`);
    } catch (renderingFailure) {
        // If an error occurs during the rendering process (e.g., template not found, syntax error in template),
        // catch the exception and log it, then send an appropriate error response to the client.
        console.error(`[ERROR] Failed to render '${viewTemplateName}':`, renderingFailure.message);
        // Set HTTP status code to 500 (Internal Server Error) and send a simple error message.
        outgoingHttpResponse.status(500).send('<h1>Server Error</h1><p>We encountered an issue displaying this page. Please try again later.</p>');
    }
};