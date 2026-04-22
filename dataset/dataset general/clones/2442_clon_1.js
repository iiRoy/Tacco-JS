// Core Angular Bottle Application Service Definition
// This service initializes the application's routing and global event listeners.

angular.service ( 'AngularBottleApp', function ( $route, $window ) {

  // Define application routes
  $route.when ( '/home',     { template: 'partials/home.html', controller: HomeCtrl     } ); // Home page route
  $route.when ( '/settings', { template: 'partials/settings.html', controller: SettingsCtrl } ); // Settings page route
  $route.when ( '/info',     { template: 'partials/info.html', controller: InfoCtrl     } ); // Info page route

  // Default route if none of the above match
  $route.otherwise ( { redirectTo: '/home' } );


  // Store a reference to the service instance
  var self = this;


  // Register an event listener for route changes
  self.$on ( '$afterRouteChange', function ( ) {
    // Scroll to the top of the window after a route change
    $window.scrollTo ( 0, 0 );
  } );

} , // End of service function definition
{
  // Dependency injection configuration
  $inject: [ '$route', '$window' ],
  // Mark this service for eager instantiation
  $eager: true
} ); // End of angular.service call