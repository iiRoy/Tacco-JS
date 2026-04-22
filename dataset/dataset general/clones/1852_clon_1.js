module.exports= function  ( app,  streams )   {

    /*
     * This module exports a function that sets up various routes for the
     * web application. It handles both the main page views and API endpoints
     * for stream data.
     */


    // Defines the route handler for the main home page and individual
    // stream detail pages identified by an 'id' parameter.
    var  index  =   function ( req,  res )
    {
      // Renders the 'index' template, passing in dynamic data.
      res.render( 'index',
        {
          title:    'Project RTC',                  // The main title for the browser tab/window.
          header:   'WebRTC live streaming',        // A prominent header displayed on the page.
          footer:   'pierre@chabardes.net',         // Contact information in the page footer.
          id:       req.params.id                   // The ID extracted from the URL, if present.
        }
      ) ;
    }; // End of the 'index' route handler definition.


    /*
     * This function serves as an API endpoint to retrieve and display
     * a list of all active streams in JSON format.
     */
    // Handler for the '/streams' API endpoint.
    var displayStreams = function ( req,  res )
    {
      // Fetches the current list of available streams from the 'streams' service.
      var streamList = streams.getStreams() ;

      // Creates a deep copy of the 'streamList' object using JSON serialization
      // and deserialization to ensure the returned data is not a reference to
      // the internal stream management object.
      var data =  (  JSON.parse (  JSON.stringify ( streamList )  )  ) ;


      // Sends the processed stream data back to the client as a JSON response.
      // The HTTP status code 200 indicates success.
      res.json( 200,  data ) ;
    }; // End of the 'displayStreams' route handler.


    // --- Application Route Definitions ---

    // Sets up the GET route for retrieving all available streams as JSON.
    app.get( '/streams',  displayStreams ) ;

    // Configures the GET route for the application's root URL.
    // This will render the main 'index' page.
    app.get( '/',  index ) ;

    // Establishes a GET route for URLs that include an ID parameter.
    // This is also handled by the 'index' function, allowing for dynamic content based on ID.
    app.get( '/:id',  index ) ;

}; // End of the module.exports function.