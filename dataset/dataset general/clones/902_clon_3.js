/*
 * Core application module configuration.
 * This file sets up routing, integrates various Angular modules,
 * and configures the Pusher real-time service for client-side events.
 * It follows a strict mode for JavaScript execution.
 */
'use strict';

// Determine the base path for static resources based on the deployment environment.
const isGitHubPagesDeployment = window.location.host.includes('doowb.github');
const resourceBase = isGitHubPagesDeployment ? '/angular-pusher/' : '/';

// Define the main application module and its dependencies.
// This module orchestrates various functionalities like routing,
// content sanitation, touch event handling, UI animations,
// and real-time communication via Pusher.
angular.module('coreApplicationModule', [
  'appRoutingSupport',          // Manages navigation and view rendering
  'contentSanitization',        // Protects against XSS attacks
  'touchInteraction',           // Enhances touch device compatibility
  'viewAnimations',             // Provides smooth UI transitions
  'realtimePusherIntegration'   // Integrates Pusher for live data updates
])
.config([
  '$routeProvider',         // Service for configuring routes
  '$locationProvider',      // Service for configuring location handling
  '$compileProvider',       // Service for configuring DOM compilation
  'PusherServiceProvider',  // Service for configuring Pusher client
  function (
    routeConfigurator,
    urlHandler,
    domCompiler,
    pusherClientConfig
  ) {

    // Set HTML5 mode for URLs. Setting to false uses hash-based routing.
    // This is explicitly set for broader compatibility.
    urlHandler.html5Mode(false);

    // Define the base path for application routes and template assets.
    const applicationRootPath = '/';
    const templateAssetsDirectory = resourceBase + 'pages/';

    // Define the application's main routes.
    // Each route maps a URL path to a specific HTML template.
    routeConfigurator
      .when(applicationRootPath + 'home', {
        templateUrl: templateAssetsDirectory + 'home/home.html'
      })
      .when(applicationRootPath + 'items', {
        templateUrl: templateAssetsDirectory + 'items/items.html'
      })
      // If no other route matches, redirect to the 'items' view by default.
      .otherwise({
        redirectTo: applicationRootPath + 'items'
      });

    // Configuration for the Pusher real-time service.
    // This includes setting the authentication key and any additional options.
    const pusherAuthKey = 'd420162e600c57b0e60f';
    const pusherConnectionOptions = {}; // No custom options are currently required.

    // Apply the Pusher service configuration.
    pusherClientConfig.configureAuthKey(pusherAuthKey);
    pusherClientConfig.establishSettings(pusherConnectionOptions);

    // Optional: Log a message to indicate Pusher setup completion.
    if (console && console.info) {
      console.info('Pusher service configured with key:', pusherAuthKey);
    }
  }
]);