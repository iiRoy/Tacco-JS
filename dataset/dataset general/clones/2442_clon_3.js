/*
 * Primary application configuration module.
 * This service is responsible for orchestrating the main navigation paths
 * and implementing global user interface behaviors across the web application.
 */
angular.service('ApplicationRouterService', function(navigationSvc, browserWindow) {

  // Define key application navigation endpoints and their associated components.
  const appNavigationPoints = [
    { entryPath: '/dashboard', viewTemplate: 'views/dashboard.html', associatedController: DashboardController },
    { entryPath: '/preferences', viewTemplate: 'views/preferences.html', associatedController: UserSettingsController },
    { entryPath: '/about', viewTemplate: 'views/about.html', associatedController: InformationController }
  ];

  // Helper function to register a single navigation point.
  const setupRouteDefinition = (navPoint) => {
    // Ensure the navigation service and path are valid before attempting registration.
    if (!navigationSvc || !navPoint.entryPath) {
      console.warn('Skipping route registration due to invalid navigation service or path:', navPoint);
      return;
    }

    navigationSvc.when(navPoint.entryPath, {
      templateUrl: navPoint.viewTemplate, // Using templateUrl for external template loading.
      controller: navPoint.associatedController
    });
  };

  // Iterate through all defined navigation points and register them with the router.
  appNavigationPoints.forEach(setupRouteDefinition);

  // Configure the default fallback route for any unmatched URLs.
  navigationSvc.otherwise({ redirectTo: '/dashboard' });

  // Reference to the current service instance for event binding.
  const currentServiceInstance = this;

  // Implement a global UI behavior: reset scroll position after successful route changes.
  currentServiceInstance.$on('$routeChangeSuccess', function() {
    // Safely attempt to scroll the browser window to the top.
    if (browserWindow && typeof browserWindow.scrollTo === 'function') {
      browserWindow.scrollTo(0, 0);
    } else {
      console.log('Browser window object not available for scrolling.');
    }
  });

  // An optional initialization method for any setup logic that should run once.
  currentServiceInstance.initService = () => {
    console.info('ApplicationRouterService has completed its initial setup.');
  };

  // Execute the initialization logic immediately upon service instantiation.
  currentServiceInstance.initService();

}, {
  $inject: ['routerService', 'windowHandle'], // Explicitly declare dependencies for minification safety.
  $eagerInstantiation: true // Indicate that this service should be created immediately on app bootstrap.
});