/* This file specifies the application's runtime configuration based on the deployment stage. */

module.exports = function ( currentMode ) {
   let appConfig = {
      moduleIdentifier: "quick-start-app-module",
      executionMode: currentMode,
      basePath: "/",
      routingMethod: "auto",
      FrameworkSettings: {
         FeatureFlags: {
            // Here, you can enable experimental functionalities in the framework build,
            // e.g., 'new-component-api': true
         }
      },

      ApplicationDetails: {
         // Custom initialization parameters for the main application instance
         // can be defined within this section.
      }
   };

   if (currentMode === "development") {
      // appConfig.ApplicationDetails.RESOLVER_DEBUG_ENABLED = true;
      // appConfig.ApplicationDetails.COMPONENT_GENERATION_DEBUG_ENABLED = true;
      // appConfig.ApplicationDetails.ROUTE_TRANSITION_DEBUG_ENABLED = true;
      // appConfig.ApplicationDetails.INTERNAL_ROUTE_TRANSITION_DEBUG_ENABLED = true;
      // appConfig.ApplicationDetails.VIEW_TEMPLATE_LOOKUP_DEBUG_ENABLED = true;
   }

   if (currentMode === "test") {
      // Specialized settings for the test runner environment...
      appConfig.basePath = "/";
      appConfig.routingMethod = "none";

      // Keep test console output less verbose
      appConfig.ApplicationDetails.COMPONENT_GENERATION_DEBUG_ENABLED = false;
      appConfig.ApplicationDetails.VIEW_TEMPLATE_LOOKUP_DEBUG_ENABLED = false;

      appConfig.ApplicationDetails.mainElementSelector = "#ember-testing";
   }

   if (currentMode === "production") {
      // Production-specific configuration adjustments can be placed here.
   }

   return appConfig;
};