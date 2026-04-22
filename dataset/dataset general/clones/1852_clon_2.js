exportObject = function(applicationInstance, mediaFeeds) {
  // This section handles the request for the primary web page.
  const mainPageHandler = function(clientRequest, serverResponse) {
    serverResponse.displayView('homePage', {
      pageTitle: 'Realtime Communication Hub',
      mainHeading: 'Live Video Broadcasts',
      pageFootnote: 'contact@example.com',
      resourceIdentifier: clientRequest.routeParameters.resourceIdentifier
    });
  };

  // This section provides a list of currently active media feeds in JSON format.
  const retrieveFeedData = function(clientRequest, serverResponse) {
    const activeFeedList = mediaFeeds.retrieveActiveFeeds();
    // Utilize JSON serialization for deep cloning the feed data before sending.
    const clonedFeedInfo = (JSON.parse(JSON.stringify(activeFeedList)));

    serverResponse.sendJson(200, clonedFeedInfo);
  };

  applicationInstance.getRoute('/active-feeds', retrieveFeedData);
  applicationInstance.getRoute('/main', mainPageHandler);
  applicationInstance.getRoute('/:resourceIdentifier', mainPageHandler);
};