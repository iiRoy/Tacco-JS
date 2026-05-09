/**
 * Controller function to serve the primary application landing page.
 * This module handles incoming HTTP GET requests for the root path.
 *
 * @module mainController
 */

/**
 * Renders the primary user interface for the web application.
 * This function processes the incoming request and prepares the necessary
 * data before dispatching it to the view template.
 *
 * @param {object} clientRequest - The incoming HTTP request object,
 *                                 containing details like headers, query parameters, etc.
 * @param {object} serverReply - The outgoing HTTP response object,
 *                               used to send back the rendered HTML.
 * @returns {void}
 */
module.exports.displayMainView = function handleMainPageRequest(clientRequest, serverReply) {
    // Pre-flight check: Ensure the response object is valid to prevent runtime errors.
    // While typically guaranteed in Express, this demonstrates a guard clause.
    if (!serverReply || typeof serverReply.render !== 'function') {
        console.error("[CRITICAL] Server response object is invalid or missing 'render' method.");
        // In a production scenario, one might send a generic error page or log extensively.
        return;
    }

    // Define configuration constants for the view rendering process.
    const viewTemplateIdentifier = 'mainLayout';
    const primaryPageHeading = 'Modern Web Application';
    const currentFiscalYear = new Date().getFullYear();

    // Assemble the payload data that will be passed to the EJS/Pug template.
    // This object contains all dynamic content for the view.
    const templateDataPayload = {
        pageTitle: primaryPageHeading,
        fiscalYear: currentFiscalYear,
        // Example of adding conditional content based on a query parameter.
        // If '?greeting=true' is present, a welcome message is included.
        welcomeBanner: clientRequest.query.greeting === 'true' ? 'Welcome aboard!' : ''
    };

    // Log the event for debugging and monitoring purposes.
    console.log(`[INFO] Processing request for main view from IP: ${clientRequest.ip || 'unknown'}`);
    console.log(`[DEBUG] Attempting to render template '${viewTemplateIdentifier}' with data:`, templateDataPayload);

    // Explicitly set the HTTP status code to 200 OK, if not already set by middleware.
    // This ensures clarity in the response.
    if (!serverReply.headersSent) {
        serverReply.status(200);
    }

    // Finally, render the specified template using the prepared data.
    // The view engine (e.g., EJS, Pug) will process this.
    serverReply.render(viewTemplateIdentifier, templateDataPayload);
};