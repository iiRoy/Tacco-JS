/**
 * Route handling module for serving various application views and UI components.
 * This module encapsulates logic for rendering primary pages and dynamic fragments,
 * ensuring robust input handling and presentation.
 */

// Define a central object to hold all application view handlers.
const applicationViewHandlers = {};

/**
 * Manages the rendering of the primary application dashboard or home page.
 * It prepares the view context and delegates the rendering process.
 *
 * @param {object} clientRequest - The incoming HTTP request object.
 * @param {object} serverResponse - The outgoing HTTP response object.
 */
applicationViewHandlers.dashboardPresenter = function(clientRequest, serverResponse) {
    // Log the initiation of the dashboard rendering process.
    console.log(`[ROUTE_INFO] Displaying main application dashboard. Request from: ${clientRequest.ip || 'N/A'}`);

    // Validate the response object's capability to render.
    if (!serverResponse || typeof serverResponse.render !== 'function') {
        console.error("[ROUTE_ERROR] Invalid server response object for dashboard rendering.");
        // Attempt to send a basic error if rendering is impossible.
        return serverResponse && serverResponse.status ? serverResponse.status(500).send('Internal Server Error: Renderer unavailable.') : null;
    }

    // Define the target view template for the main dashboard.
    const primaryViewTemplate = 'index'; // The base template file name.

    // Construct the data context for the view.
    const viewRenderContext = {
        pageHeader: "Platform Insight Dashboard", // Updated and rephrased title.
        currentYear: new Date().getFullYear(), // Added a new data point for the template.
    };

    // Render the dashboard view with the prepared context.
    serverResponse.render(primaryViewTemplate, viewRenderContext, (renderErr, renderedOutput) => {
        if (renderErr) {
            console.error(`[ROUTE_ERROR] Failed to generate dashboard view for template '${primaryViewTemplate}': ${renderErr.message}`);
            // Send a more detailed error response if rendering fails.
            return serverResponse.status(500).send(`<h1>Error Loading Dashboard</h1><p>An issue occurred while preparing your view. Please try again.</p><p>Details: ${renderErr.message}</p>`);
        }
        // If successful, send the rendered HTML content to the client.
        serverResponse.send(renderedOutput);
    });
};

/**
 * Handles the display of the user authentication (login) page.
 *
 * @param {object} incomingRequest - The HTTP request object.
 * @param {object} outgoingResponse - The HTTP response object.
 */
applicationViewHandlers.userAuthenticationView = (incomingRequest, outgoingResponse) => {
    // Record the access to the authentication interface.
    console.log("[ROUTE_INFO] Presenting user authentication interface.");

    // Ensure the request object is present, though Express typically guarantees it.
    if (!incomingRequest) {
        console.warn("[ROUTE_WARN] Incoming request object is undefined for authentication view.");
        return outgoingResponse.status(400).send('Bad Request: Missing client request data.');
    }

    // Define the view template for the login page.
    const authenticationTemplateName = 'login'; // The view template identifier.

    // Render the authentication view without additional context for simplicity.
    // An empty object is explicitly passed for consistency or future extensions.
    outgoingResponse.render(authenticationTemplateName, {});
};

/**
 * Resolves and renders dynamic UI fragments (partials) based on a request parameter.
 * Includes validation to prevent unauthorized file access.
 *
 * @param {object} httpRequest - The client's HTTP request.
 * @param {object} httpResponse - The server's HTTP response.
 */
applicationViewHandlers.uiComponentResolver = function(httpRequest, httpResponse) {
    // Verify the presence of request parameters and the specific component identifier.
    if (!httpRequest || !httpRequest.params || !httpRequest.params.componentKey) { // Renamed param from 'name' to 'componentKey'
        console.warn("[ROUTE_WARN] Request for UI component is missing the 'componentKey' parameter.");
        // Respond with a 400 Bad Request if the required parameter is absent.
        return httpResponse.status(400).send('Invalid Request: Component identifier is required.');
    }

    // Extract and sanitize the requested component identifier.
    let componentIdentifier = httpRequest.params.componentKey;
    // Sanitize input to prevent directory traversal attacks or invalid file names.
    componentIdentifier = componentIdentifier.replace(/[^a-zA-Z0-9_-]/g, '');

    // --- Critical Security: Whitelist of allowed components ---
    // This array defines which partials are explicitly allowed to be rendered.
    const authorizedComponentsList = ['navigation-bar', 'side-menu', 'footer-info', 'user-profile-card', 'data-table-segment', 'modal-dialog'];

    // Check if the requested component is in the whitelist.
    if (!authorizedComponentsList.includes(componentIdentifier)) {
        console.error(`[ROUTE_SECURITY] Attempted to render unauthorized UI component: '${componentIdentifier}'`);
        // Return a 403 Forbidden status for unauthorized component requests.
        return httpResponse.status(403).send('Access Denied: Requested UI component is not permitted.');
    }

    // Construct the full path to the partial view using template literals.
    const componentViewPath = `partials/${componentIdentifier}`;

    console.log(`[ROUTE_INFO] Attempting to render dynamic UI component: '${componentViewPath}'.`);

    // Render the specified UI component.
    httpResponse.render(componentViewPath, {}, (renderFailure, componentHtml) => { // Added empty context object
        if (renderFailure) {
            console.error(`[ROUTE_ERROR] Rendering of UI component '${componentViewPath}' failed: ${renderFailure.message}`);
            // Return appropriate error status (e.g., 404 if view not found, 500 for other issues).
            return httpResponse.status(renderFailure.status || 500).send(`Error: Could not load UI component '${componentIdentifier}'.`);
        }
        // Successfully rendered, send the HTML fragment.
        httpResponse.send(componentHtml);
    });
};

// Export the collection of route handlers for use by the main application entry point.
module.exports = applicationViewHandlers;