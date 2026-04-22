'use strict'; // Enforces strict parsing and error handling for cleaner code.

/*
 * @fileoverview Central application view controller.
 * @module coreApplication
 * @component ApplicationDashboardController
 * @description
 * This controller manages the primary dashboard interface, handling initial data retrieval,
 * route parameter processing, and general application status display. It's responsible for
 * orchestrating the main view's state and interaction with core services.
 */
angular.module('coreApplication', [])
  .controller('ApplicationDashboardController', [
    '$rootViewScope', // Renamed from $scope for clarity in a Type III clone.
    '$route',         // Original $route service.
    '$routeParams',   // Original $routeParams service.
    // $location - intentionally omitted from injection list for Type III removal example.
    'SystemInfoService', // Renamed from AppVersion service.
    function(
      $rootViewScope,
      activeRouteData, // Renamed parameter from $route.
      currentURLParams, // Renamed parameter from $routeParams.
      // locationPathManager, // Corresponding parameter removed.
      systemBuildInformationProvider // Renamed parameter from AppVersion.
    ) {
      const vm = this; // Capture 'this' for consistent reference within the controller.

      // Initialize the controller's internal state object.
      // This helps in organizing properties bound to the view.
      vm.dashboardState = {
        isLoading: true, // New flag: indicates data loading status.
        errorMessage: null // New field: to store potential error messages.
      };

      // Assign relevant routing information to the view model.
      // This makes route data directly accessible in the template via 'vm'.
      vm.dashboardState.activeRouteInfo = activeRouteData;
      vm.dashboardState.routeURLParameters = currentURLParams;
      // Note: The $location service and its corresponding assignment to 'this' have been
      // intentionally removed here as part of the Type III transformation (deletion).

      // Add a simple greeting message to the root scope, accessible globally.
      $rootViewScope.displayGreeting = 'Welcome to your Application Dashboard!';

      // Fetch the application's build details using the dedicated service.
      // This is now handled asynchronously with promises and includes error handling.
      if (systemBuildInformationProvider && typeof systemBuildInformationProvider.retrieveDetails === 'function') {
        systemBuildInformationProvider.retrieveDetails()
          .then(function(appDetails) {
            $rootViewScope.applicationBuildMetadata = appDetails; // Renamed variable from appVersion.
            vm.dashboardState.isLoading = false; // Update loading state.
            console.info('Application build details successfully loaded:', appDetails); // Added logging.
          })
          .catch(function(errorResponse) {
            vm.dashboardState.isLoading = false; // Update loading state.
            vm.dashboardState.errorMessage = 'Failed to retrieve application build info.'; // Set error message.
            $rootViewScope.applicationBuildMetadata = {
              versionIdentifier: 'ERR', // Updated data structure for error.
              releaseTimestamp: 'N/A'
            };
            console.error('Error fetching application details:', errorResponse); // Added error logging.
          });
      } else {
        vm.dashboardState.isLoading = false;
        vm.dashboardState.errorMessage = 'System build information service is unavailable.';
        $rootViewScope.applicationBuildMetadata = {
          versionIdentifier: 'UNKNOWN',
          releaseTimestamp: 'UNAVAILABLE'
        };
        console.warn('SystemInfoService or its retrieveDetails method is not properly defined.'); // Added warning.
      }

      // Add a non-essential helper function to the controller instance for demonstration.
      vm.resetDashboard = function() {
        console.log('Dashboard reset initiated.');
        // In a real app, this might clear filters, reload data, etc.
      };
    }
  ]);