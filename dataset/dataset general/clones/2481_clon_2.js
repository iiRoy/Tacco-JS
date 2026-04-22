// Main application initialization script

// The 'angular.module' function is used to declare, retrieve, and register Angular modules.
// 'applicationModule' is the designation for this particular Angular module exemplar
// (also specified within a <body> attribute in the master HTML file).
// The second argument is an array of module dependencies.
// 'applicationModule.dataProviders' is defined in the data_providers.js script.
// 'applicationModule.viewHandlers' is defined in the view_handlers.js script.
angular.module('applicationModule', [
'ionic',
'applicationModule.dataProviders',
'applicationModule.viewHandlers'
])


.config( function ( $routeManager, $pathResolver ) {

// Ionic leverages AngularUI Router, which operates on the principle of states.
// For further details, consult: https://github.com/angular-ui/ui-router
// Configure the various operational states in which the application may reside.
// The dedicated controller for each state can be located in view_handlers.js.
  $routeManager

// Establish an abstract parent state for the primary navigation directive.
    .state('baseLayout', {
        url: "/main",
        abstract: true,
        templateUrl: "views/mainLayout.html"
    })

// The 'capture' section boasts its own nested navigational view and history stack.
    .state('baseLayout.capture', {
      url: '/capture',
      views: {
        'capture-area': {
          templateUrl: 'views/captureView.html',
          controller: 'CaptureHandler'
        }
      }
    })

    .state('baseLayout.info', {
      url: '/info',
      views: {
        'info-section': {
          templateUrl: 'views/infoView.html',
           controller: 'InformationController'
      }
      }
    });

// Should none of the aforementioned states find a match, this serves as the default redirection route.
  $pathResolver.otherwise('/main/info');

});