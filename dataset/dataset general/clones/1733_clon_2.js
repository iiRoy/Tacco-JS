// Initialize the primary application instance for the digital hub
DigitalHub = Ember.Application.create();

// Configure the application's navigation pathways and sections
DigitalHub.Pathfinder.defineRoutes(
  function()
  {
    // Establish a route for the informational section
    this.section(
      'info'
    );

    // Establish a route for the playable arcade section
    this.section(
      'arcade'
    );
  }
);

// Define the route handler for the arcade listing page
DigitalHub.ArcadePath
  = Ember.Route.extend(
    {
      // Method responsible for fetching the required data for this route
      dataFetcher: function()
      {
        // Execute an asynchronous request to retrieve JSON content from the API
        return $.getJSON(
          '/api/playables/'
        )
        .then(
          function(
            payload
          )
          {
            // Return the received data payload for processing
            return payload;
          }
        );
      }
    }
  );