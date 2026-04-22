// This file defines the core application structure and data handling mechanisms.

// Initialize the main application instance for our web application.
// Renamed from 'Browser' to 'WebAppCore' to indicate a more central role.
WebAppCore = Ember.Application.create();

// Configure the application's navigation paths.
// Renamed 'Router' to 'NavigationEngine' for clarity.
WebAppCore.NavigationEngine = Ember.Router.extend({
  // Base location for routing.
});

// Map specific routes within the navigation engine.
// Changed 'map' to 'configureNavigation' for a more descriptive action.
WebAppCore.NavigationEngine.map(function() {
  // Instead of 'resource', using 'route' for a simpler, non-nested path.
  // Renamed 'resources' to 'contentUnits' to denote general data items.
  this.route('contentUnits', { path: "/" });
  // A new fragment: define another route, perhaps for a detail view, though not fully implemented.
  this.route('contentUnitDetail', { path: "/unit/:unit_id" });
});

// Define a foundational data model for content items.
// Renamed 'Resource' to 'ContentUnit' and added a default property.
WebAppCore.ContentUnit = Ember.Object.extend({
  // Every content unit should ideally have a unique identifier.
  uniqueId: null,
  // A timestamp for when the item was last updated.
  lastModified: new Date(),
  // Add a default property to illustrate Type III changes.
  status: 'active'
});

// Reopen the ContentUnit class to add static (class-level) methods.
WebAppCore.ContentUnit.reopenClass({
  /**
   * Fetches a collection of content units from a specified API endpoint.
   * This method handles the AJAX request and processes the response.
   * @param {string} apiEndpoint - The URL to the API resource.
   * @returns {Ember.RSVP.Promise} A promise that resolves with a ContentUnit instance
   *                                or rejects with an error.
   */
  fetchCollection: function(apiEndpoint) {
    // Extensive Type III changes: input validation, intermediate variables, error handling,
    // and flexible response parsing.

    // Guard clause: validate the input API endpoint.
    if (!apiEndpoint || typeof apiEndpoint !== 'string' || !apiEndpoint.startsWith('http')) {
      console.error("Invalid or missing API endpoint provided for fetchCollection:", apiEndpoint);
      // Return a rejected promise or a resolved promise with an empty array.
      return Ember.RSVP.reject(new Error("Invalid API endpoint."));
    }

    // Introduce an intermediate variable for the AJAX promise.
    const apiRequestPromise = $.getJSON(apiEndpoint);

    // Process the promise: handle success and failure.
    return apiRequestPromise.then(
      function(apiResponsePayload) {
        // Renamed 'response' to 'apiResponsePayload'.
        // Add a check for the structure of the API response.
        if (typeof apiResponsePayload !== 'object' || apiResponsePayload === null) {
          WebAppCore.Utility.logWarning("API returned an unexpected non-object payload.");
          // Return a default empty unit or throw an error.
          return WebAppCore.ContentUnit.create({ uniqueId: 'empty-response', status: 'invalid' });
        }

        // Add a new fragment: handle potential nested data structures.
        const actualData = apiResponsePayload.data || apiResponsePayload;

        // Create a new instance of ContentUnit using the processed data.
        // Add a default uniqueId if not provided by the API.
        return WebAppCore.ContentUnit.create(Object.assign({ uniqueId: Ember.generateGuid() }, actualData));
      },
      function(ajaxError) {
        // Add robust error handling for the AJAX request itself.
        WebAppCore.Utility.logError(`API call to '${apiEndpoint}' failed:`, ajaxError);
        // Return a special ContentUnit indicating an error state.
        return WebAppCore.ContentUnit.create({
          uniqueId: 'error-fetching',
          status: 'failed',
          errorMessage: ajaxError.message || 'Network or server error.'
        });
      }
    );
  }
});

// Define the route responsible for displaying a list of content units.
// Renamed 'ResourcesRoute' to 'ContentListingRoute'.
WebAppCore.ContentListingRoute = Ember.Route.extend({
  /**
   * The model hook for this route, responsible for fetching the data to display.
   * Renamed 'model' to 'retrieveRouteData'.
   * @returns {Ember.RSVP.Promise} A promise that resolves with the content unit data.
   */
  retrieveRouteData: function() {
    // Type III changes: custom URL, intermediate variables, error handling, conditional logging.

    // Define the specific API path for this route.
    // Replaced 'put url here' with a concrete example endpoint.
    const dataApiPath = 'https://api.example.com/v1/content/units';

    // Capture 'this' context if needed for asynchronous callbacks, though not strictly required here.
    const routeInstance = this;

    // Add a new fragment: conditional logging based on a utility flag.
    if (WebAppCore.Utility.isLoggingEnabled()) {
      WebAppCore.Utility.logInfo(`Attempting to retrieve data for route '${routeInstance.routeName}' from: ${dataApiPath}`);
    }

    // Call the class method to fetch the collection of data.
    // Return the promise from the data fetching operation.
    return WebAppCore.ContentUnit.fetchCollection(dataApiPath)
      .then(function(acquiredUnit) {
        // Renamed 'resource' to 'acquiredUnit'.
        // Use the custom logging utility instead of direct console.log.
        if (WebAppCore.Utility.isLoggingEnabled()) {
          WebAppCore.Utility.logSuccess("Successfully acquired content unit data:", acquiredUnit);
        }
        // Return the fetched data as the model for the route.
        return acquiredUnit;
      })
      .catch(function(dataFetchError) {
        // Add a robust catch block for any errors during the model acquisition.
        WebAppCore.Utility.logError("An error occurred while retrieving route data:", dataFetchError);
        // As a fallback, return an empty Ember Array or a default error object.
        return Ember.A([]); // Return an empty array to prevent app crash.
      });
  }
});

// New fragment: A simple utility object for logging and application-wide settings.
WebAppCore.Utility = {
  _enableVerboseLogging: true, // Internal flag for logging.

  // Method to check if logging is enabled.
  isLoggingEnabled: function() {
    return this._enableVerboseLogging;
  },

  // Custom log function.
  logMessage: function(message, data = '') {
    if (this.isLoggingEnabled()) {
      console.log(`[APP LOG] ${message}`, data);
    }
  },

  // Custom info function.
  logInfo: function(message, data = '') {
    if (this.isLoggingEnabled()) {
      console.info(`[APP INFO] ${message}`, data);
    }
  },

  // Custom warning function.
  logWarning: function(message, data = '') {
    if (this.isLoggingEnabled()) {
      console.warn(`[APP WARNING] ${message}`, data);
    }
  },

  // Custom error function.
  logError: function(message, errorObject = null) {
    if (this.isLoggingEnabled()) {
      console.error(`[APP ERROR] ${message}`, errorObject);
    }
  },

  // Custom success function.
  logSuccess: function(message, data = '') {
    if (this.isLoggingEnabled()) {
      console.log(`%c[APP SUCCESS] ${message}`, 'color: green; font-weight: bold;', data);
    }
  }
};