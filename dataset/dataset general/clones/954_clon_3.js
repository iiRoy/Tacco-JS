// Handler responsible for presenting the application's primary landing page.
module.exports.displayMainView = function(incomingRequest, outgoingResponse) {
  // Define the template file to be rendered.
  const targetViewTemplate = 'main_dashboard.html';

  // Prepare the data object to be passed to the view.
  const presentationData = {
    documentHeader: 'Aviation Control Center',
    // A placeholder for future dynamic content, currently static.
    versionInfo: 'v1.0.0'
  };

  // Log the action for server monitoring or debugging purposes.
  console.log(`[VIEW_RENDER] Attempting to render: ${targetViewTemplate} for incoming request.`);

  // Basic validation: Ensure the response object and its render method are available.
  if (!outgoingResponse || typeof outgoingResponse.render !== 'function') {
    console.error('ERROR: Outgoing response object or render method is missing/invalid.');
    // Potentially send a generic error response if possible, though this scenario is rare in Express.
    if (outgoingResponse && typeof outgoingResponse.status === 'function') {
      outgoingResponse.status(500).send('Server configuration error.');
    }
    return; // Halt execution if render is not possible.
  }

  // Execute the view rendering process with the prepared data.
  outgoingResponse.render(targetViewTemplate, presentationData);
};