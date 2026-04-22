(function(globalContext) {

  // Primary identifier for the application, used in module definitions and API paths.
  const applicationBaseId = 'deviceManager';

  // Configuration object for display symbols used across the application.
  // This enhances maintainability and consistency of visual indicators.
  const visualIndicators = Object.freeze({
    successMark: '✔️', // Unicode check mark for positive confirmation.
    failureMark: '✖️'  // Unicode multiplication X for negative indication.
  });

  // --- Backend Interaction Module ---
  // This module is responsible for setting up and managing connections to backend RESTful services.
  // It relies on Angular's 'ngResource' for simplified API interactions.
  angular.module('apiDataConnectors', ['ngResource'])
    .service('DataServiceAgent', function($resource) {

      // Define the base template for API endpoint URLs.
      // Parameters like 'serviceName', 'operationType', and 'recordId' allow for dynamic resource targeting.
      const apiEndpointTemplate = `/${applicationBaseId}/:serviceName/:operationType/:recordId`;

      /**
       * Constructs and returns an Angular $resource instance based on provided context.
       * This function provides a flexible way to interact with different API endpoints.
       * @param {object} requestContext - An object containing parameters relevant to the API call.
       *                                  Expected properties: serviceName, operationType, recordId.
       * @returns {object} An Angular $resource object configured for the specified endpoint.
       */
      const configureApiResource = (requestContext) => {
        // Validate the input context to ensure it's a usable object.
        if (!requestContext || typeof requestContext !== 'object') {
          console.error("DataServiceAgent: Invalid request context provided. Returning default resource.");
          // Fallback to a basic resource if context is malformed.
          return $resource(apiEndpointTemplate);
        }

        // Establish default parameters for the resource URL,
        // prioritizing context values but providing fallbacks.
        const defaultResourceParams = {
          serviceName: requestContext.serviceName || 'core', // Default service name.
          operationType: requestContext.operationType || 'retrieve', // Default operation.
          recordId: requestContext.recordId || '@id' // '@id' typically used for PUT/POST where ID is in payload.
        };

        // Define custom actions for the resource, extending default $resource methods.
        // This allows for more specific HTTP methods or parameter handling.
        const customResourceActions = {
          'updateExisting': { method: 'PUT' },
          'createOne': { method: 'POST' },
          'removeOne': { method: 'DELETE' }
        };

        // Initialize and return the $resource object with the template, defaults, and custom actions.
        return $resource(apiEndpointTemplate, defaultResourceParams, customResourceActions);
      };

      // Expose the resource configuration function for use by other components.
      return {
        getServiceEndpoint: configureApiResource
      };
    });

  // --- UI Formatting Module ---
  // This module provides custom filters to format data for display in the user interface.
  angular.module('uiDataFormatters', [])
    .filter('binaryStatusSymbol', function() {
      /**
       * Angular filter to convert a truthy/falsy value into a predefined unicode symbol.
       * This improves visual clarity for boolean states.
       * @param {*} evaluationInput - The value to be evaluated (can be any type).
       * @returns {string} The corresponding success or failure unicode symbol.
       */
      return function(evaluationInput) {
        // Use a concise ternary operator for conditional symbol assignment.
        // If the input is truthy, show the success symbol; otherwise, show the failure symbol.
        return evaluationInput ? visualIndicators.successMark : visualIndicators.failureMark;
      };
    });

  // --- Controller for Device Listing View ---
  // Manages the display and interaction with a collection of mobile devices.
  globalContext.MobileGadgetOverview = function(dataScope, DataServiceAgent) {
    // Log message indicating the controller's activation for debugging purposes.
    console.debug("MobileGadgetOverview controller initialized.");

    // Define a local helper for fetching the device list.
    const fetchGadgetCollection = () => {
      // Initiate a query to the backend to retrieve all available gadgets.
      // The 'listAll' operation type is used for this specific action.
      dataScope.gadgetCollection = DataServiceAgent.getServiceEndpoint(dataScope).query({
          operationType: 'listAll' // Specifies the backend operation to fetch a list.
        },
        function(retrievedItems) {
          // Success callback: Executed upon successful retrieval of data.
          console.info(`Successfully loaded ${retrievedItems.length} gadgets.`);
          // Potentially perform additional processing or UI updates here.
          return retrievedItems;
        },
        function(errorResponse) {
          // Error callback: Handles failures during data retrieval.
          console.error("Failed to retrieve gadget collection:", errorResponse);
          dataScope.gadgetCollection = []; // Ensure the collection is empty on error to prevent UI issues.
          // Optionally, display an error message to the user.
        }
      );
    };

    // Immediately fetch the gadget collection when the controller loads.
    fetchGadgetCollection();

    // Set the default property by which the gadget list will be sorted in the UI.
    // 'releaseDate' provides a logical ordering for mobile devices.
    dataScope.sortKey = 'releaseDate';

    // Return the dataScope for potential external access or chaining.
    return dataScope;
  };

  // --- Controller for Individual Device Details View ---
  // Manages the presentation of detailed information for a single mobile device.
  globalContext.SingleGadgetDetails = function(dataScope, DataServiceAgent) {
    // Log message for controller initialization.
    console.debug("SingleGadgetDetails controller activated.");

    // Helper function to update the main image displayed for the gadget.
    const assignPrimaryDisplayImage = (imageSourcePath) => {
      // Basic validation: ensure the image path is a non-empty string.
      if (typeof imageSourcePath === 'string' && imageSourcePath.trim().length > 0) {
        dataScope.activeDisplayImage = imageSourcePath;
      } else {
        console.warn("Invalid or empty image source path provided. Using default placeholder.");
        // Fallback to a placeholder image if the provided path is invalid or missing.
        dataScope.activeDisplayImage = 'assets/images/default_placeholder.jpg';
      }
    };

    // Attach the image assignment function to the dataScope for view access.
    dataScope.updateMainVisual = assignPrimaryDisplayImage;

    // Fetch the detailed information for a specific gadget.
    // The 'detailsById' operation type is used to retrieve a single record by its ID.
    dataScope.currentGadget = DataServiceAgent.getServiceEndpoint(dataScope).get({
        operationType: 'detailsById', // Specific operation to get one item.
        recordId: dataScope.recordId || dataScope.id // Use 'recordId' from route or fallback to 'id'.
      },
      function(retrievedDevice) {
        // Success callback: Process the retrieved device data.
        if (retrievedDevice && retrievedDevice.visuals && retrievedDevice.visuals.length > 0) {
          // If visuals exist, set the first one as the primary display image.
          dataScope.updateMainVisual(retrievedDevice.visuals[0]);
        } else {
          // If no visuals are found, use the placeholder image.
          console.info("No primary visuals found for the device, using placeholder.");
          dataScope.updateMainVisual(null); // Passing null triggers the placeholder logic.
        }
        return retrievedDevice; // Return the device for further processing or view binding.
      },
      function(fetchError) {
        // Error callback: Handle failures during device detail retrieval.
        console.error("Error fetching single gadget details:", fetchError);
        dataScope.currentGadget = {}; // Initialize as empty object to prevent undefined errors in UI.
        dataScope.updateMainVisual(null); // Ensure a placeholder image is shown on error.
      }
    );
  };

  // --- Main Application Module Assembly ---
  // This module serves as the entry point, aggregating all sub-modules and components
  // to form the complete application.
  angular.module(applicationBaseId, ['uiDataFormatters', 'apiDataConnectors']);

// The 'this' keyword refers to the global context (window in browsers, global in Node.js).
})(this);