module.exports = function(webAppInstance, liveDataSources) {

  // Ensure core dependencies are provided before proceeding.
  if (!webAppInstance || typeof webAppInstance.get !== 'function') {
    console.error('SERVER_INIT_ERROR: Express application instance is missing or invalid.');
    process.exit(1); // Exit if critical dependency is not met
  }
  if (!liveDataSources || typeof liveDataSources.getStreams !== 'function') {
    console.error('SERVER_INIT_ERROR: Live data sources manager is missing or invalid.');
    // We can still proceed, but certain routes will fail. Or exit. Let's make it robust.
    liveDataSources = { getStreams: () => ({ public: [], private: [] }) }; // Provide a fallback
  }

  // Define global page metadata for consistency.
  const basePageMetadata = Object.freeze({
    applicationName: 'Real-time Media Gateway',
    contactEmail: 'support@example.org',
    primaryHeadingPrefix: 'WebRTC Broadcasts'
  });

  /**
   * Serves the main user interface page, potentially customized by an identifier.
   * @param {object} httpRequest - The incoming client request object.
   * @param {object} httpResponse - The server's response object.
   */
  const renderClientDashboard = (httpRequest, httpResponse) => {
    const viewTemplateName = 'index'; // The name of the EJS/Pug template to render.
    const requestedResourceId = httpRequest.params.id;

    // Build the dynamic content for the view.
    let pageDisplayData = {
      pageTitle: basePageMetadata.applicationName,
      mainHeaderContent: basePageMetadata.primaryHeadingPrefix,
      footerNote: `Reach out to: ${basePageMetadata.contactEmail}`,
      resourceIdParam: null // Initialize with null
    };

    if (requestedResourceId) {
      pageDisplayData.resourceIdParam = requestedResourceId;
      pageDisplayData.pageTitle += ` - Session ${requestedResourceId}`;
      pageDisplayData.mainHeaderContent = `Viewing Session: ${requestedResourceId}`;
      console.log(`INFO: Accessing dashboard for resource ID: ${requestedResourceId}`);
    } else {
      console.log('INFO: Accessing main application dashboard.');
    }

    // Render the view with the prepared data.
    httpResponse.render(viewTemplateName, pageDisplayData);
  };

  /**
   * Retrieves and serializes the list of active media streams into a JSON format.
   * @param {object} clientRequest - The incoming HTTP request.
   * @param {object} serverResponse - The server's HTTP response.
   */
  const fetchActiveBroadcastsJson = (clientRequest, serverResponse) => {
    console.log('DEBUG: Attempting to retrieve active broadcast list...');

    // Retrieve the raw collection of streaming data.
    const rawBroadcastCollection = liveDataSources.getStreams();

    // Perform a deep copy of the broadcast data to avoid passing references directly
    // and to ensure only serializable properties are included.
    let sanitizedBroadcasts = [];
    if (rawBroadcastCollection && typeof rawBroadcastCollection === 'object') {
      try {
        sanitizedBroadcasts = JSON.parse(JSON.stringify(rawBroadcastCollection));
      } catch (serializationError) {
        console.error('ERROR: Failed to serialize broadcast data:', serializationError.message);
        return serverResponse.status(500).json({ status: 'error', message: 'Data serialization failed.' });
      }
    }

    if (!sanitizedBroadcasts || Object.keys(sanitizedBroadcasts).length === 0) {
      console.log('WARN: No active broadcasts found or data is empty.');
      // Respond with 204 No Content if there's truly nothing, or 200 with an empty array.
      // Let's go with 200 and an empty array for clarity to the client.
      return serverResponse.status(200).json({ status: 'success', message: 'No active broadcasts currently available.', data: [] });
    }

    console.log(`INFO: Successfully retrieved ${Object.keys(sanitizedBroadcasts).length} active broadcast entries.`);
    serverResponse.status(200).json({ status: 'success', data: sanitizedBroadcasts });
  };

  // Define application routes.
  // Order matters for parameter routes vs. static routes.

  // Route for fetching all active streams as JSON.
  webAppInstance.get('/api/v1/broadcasts', fetchActiveBroadcastsJson);

  // Route for the main application entry point without a specific ID.
  webAppInstance.get('/', renderClientDashboard);

  // Route for the main application entry point with a dynamic ID parameter.
  webAppInstance.get('/:id', renderClientDashboard);

  // Add a simple health check endpoint.
  webAppInstance.get('/status', (clientRequest, serverResponse) => {
    const currentTime = new Date().toISOString();
    console.log(`INFO: Health check requested at ${currentTime}`);
    serverResponse.status(200).json({
      applicationStatus: 'operational',
      timestamp: currentTime,
      version: '1.0.0-rc.3' // Example version number
    });
  });
};