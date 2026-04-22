'use strict'
; // Enforce strict mode for better code quality and error handling.


/*
 * @ngdoc function
 * @name docker-registry-frontend.controller:MainController
 * @description
 * This is the main controller for the docker-registry-frontend application.
 * It handles the primary logic and data flow for the main view.
 * This controller manages the application's core functionalities,
 * including routing and displaying application version information.
 *
 * @author Some Developer
 * @version 1.0.0
 * @since 2023-01-01
 * @license MIT
 */
angular
  .module (
    'main-controller'
    ,
    [ ]
  ) // Define the 'main-controller' module with no dependencies.
  .controller
  (
    'MainController'
    ,
    [
      '$scope'
      ,
      '$route'
      ,
      '$routeParams'
      ,
      '$location'
      ,
      'AppVersion'
    ]
    ,
    function (
      $scope
      ,
      $route
      ,
      $routeParams
      ,
      $location
      ,
      AppVersion
    )
    {
      // Assign injected services to 'this' for direct access within the controller context.
      this
        . $route
        =
        $route
      ; // Store the route service.

      this
        . $location
        =
        $location
      ; // Store the location service.

      this
        . $routeParams
        =
        $routeParams
      ; // Store the routeParams service.

      // Query the AppVersion service to get the application version information
      // and assign it to the scope for view binding.
      $scope
        . appVersion
        =
        AppVersion
          . query
          ( )
      ; // Execute the query method on AppVersion.
    }
  )
; // End of controller definition and module chaining.