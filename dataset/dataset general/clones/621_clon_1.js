'use strict' ; // Enforce strict parsing rules for this script.


/*
 * @ngdoc overview
 * @name brewtimerApp
 * @description
 * # brewtimerApp
 * This is the primary module of the entire application.
 * It defines the application's core dependencies and initial configuration.
 */
angular .
  module(
    'brewtimerApp' , // The main application module's identifier.
    [
      // List of module dependencies for brewtimerApp:
      'ngAnimate'           , // Provides animation capabilities.
      'ngCookies'           , // Enables cookie management.
      'ngResource'          , // Facilitates interaction with RESTful services.
      'ngRoute'             , // Manages application routing.
      'ngSanitize'          , // Protects against XSS attacks.
      'ngTouch'             , // Adds touch event support.
      'ngAudio'             , // A third-party module for audio playback.
      'timer'               , // A third-party module for timer functionality.
      'siyfion.sfTypeahead'   // A third-party module for typeahead input.
    ]
  )
  .
  config(
    function ( $routeProvider ) // The configuration block for the module.
    {

      // Define application routes using the $routeProvider service.
      $routeProvider

        .when(
          '/' , // Path for the default route.
          {
            templateUrl : 'views/main.html' , // HTML template for the main view.
            controller  : 'MainCtrl'          // Controller for the main view.
          }
        )

        .otherwise(
          {
            redirectTo: '/' // Redirects any undefined routes to the home page.
          }
        ) ; // End of $routeProvider configuration.
    }
  ) ; // End of the angular.module() definition.