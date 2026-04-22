/*
 * This file defines the main Ember application and its routing.
 * It's a foundational setup for a single-page application.
 */

// Initialize the main Ember application instance.
// The 'App' global variable will hold our application object.
App  =  Ember.Application.create( ) ;


// Define the application's routing map.
// This function sets up which URLs correspond to which resources.
App.Router.map(
  function(
  )
  {
    // Define a resource route for the 'about' page.
    // This will typically render an 'about' template.
    this.resource( 'about' ) ;

    // Define another resource route for the 'games' section.
    // This will likely display a list of games.
    this.resource( 'games' ) ;
  }
) ; // End of App.Router.map definition.


// Define the route handler for the 'Games' resource.
// This route is responsible for fetching and providing data for the games view.
App.GamesRoute = Ember.Route.extend(
  {
    // The 'model' hook is a primary method for fetching data.
    // It is called when entering this route.
    model: function(
      // This function can accept parameters from the URL, but none are used here.
    )
    {
      // Use jQuery's getJSON method to make an AJAX request
      // to our backend API to retrieve game data.
      return $.getJSON( '/api/games/' )
        .then(
          function(
            data // 'data' is the JSON response received from the API.
          )
          {
            // Return the fetched data. This data will then be available
            // to the 'games' template and controller.
            return data ;
          } // End of success callback for .then()
        ) ; // End of .then() chain
    } // End of model function definition
  }
) ; // End of App.GamesRoute definition.