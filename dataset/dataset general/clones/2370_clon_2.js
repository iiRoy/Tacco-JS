// This module defines the primary route handler for the initial webpage display.
module.exports.landingPage = (  incomingRequest,
                                outgoingResponse  ) =>
{
  // Prepare an object containing data for the view template.
  const pageContentData = {
    documentTitle: 'My Awesome App' /* This is the header text for the HTML page */
  };

  // Instruct the server response object to render a specific template
  // and pass the prepared data to it.
  outgoingResponse.displayContent(
    'mainView', // The identifier for the template file to be rendered.
    pageContentData    // The data payload to populate the template.
  );
};