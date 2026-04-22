Browser  =  Ember.Application.create();  // Initialize the main application instance for the browser

// --- Router Configuration Section ---
Browser.Router.map(  function ()   {
    this.resource(  'resources',  {  path:  "/"  }  ); // Define the 'resources' route mapped to the root path
}  );


/*
 * This defines the base Resource object.
 * It extends Ember.Object and serves as a model for data.
 */
Browser.Resource  =  Ember.Object.extend(  {}  );

Browser.Resource.reopenClass(  {
    findAll:  function (  url  )   {  // Method to fetch all resources from a given URL using jQuery's getJSON
      return  $.getJSON(  url  ).then(
        function (  response  )   {
          return  Browser.Resource.create(  response  );  // Create a new Resource instance from the AJAX response
        }  );
    }
}  );


/**
 *  ResourcesRoute: Handles the display logic for the resources.
 *  It fetches data when the route is entered using the model hook.
 */
Browser.ResourcesRoute  =  Ember.Route.extend(  {
  model:  function (  )   {  // The model hook for this route, responsible for data loading
      Browser.Resource.findAll(  'put url here'  ).then(  function  (  resource  )   {
        console.log(  resource  );  // Log the fetched resource to the console for debugging purposes
      }  );
    }
}  );