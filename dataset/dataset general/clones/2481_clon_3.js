// This module serves as the primary entry point and configuration hub for the mobile application.

// The 'angular.module' method is fundamental for defining, retrieving, and registering Angular modules.
// 'applicationCore' represents the main application module.
// It explicitly declares dependencies on 'ionic' for core mobile UI components,
// 'applicationCore.dataServices' for backend communication and data management,
// 'applicationCore.componentControllers' for view logic, and
// 'applicationCore.utilities' for common helper functions.
angular.module('applicationCore', [
  'ionic',
  'applicationCore.dataServices',
  'applicationCore.componentControllers',
  'applicationCore.utilities'
])

// The '.config' block is executed during the module's configuration phase,
// before any services are instantiated. It's used to set up providers.
.config(function($routeConfigurator, $navigationFallback) {

  // Log a message to the console indicating the start of the routing setup process.
  console.log("Initiating application routing and state management configuration...");

  // Define a constant for the base directory of all HTML templates.
  // This promotes reusability and simplifies path management.
  const TEMPLATE_BASE_DIR = "views";

  // This application utilizes the Angular UI Router for state-based navigation.
  // UI Router enables the definition of application states, each with its own URL,
  // view templates, and associated controllers, supporting complex nested views.
  // Further details on UI Router can be found at: https://github.com/angular-ui/ui-router

  // An array is used to collect all state definitions before they are registered.
  // This allows for programmatic generation or manipulation of states.
  const applicationStates = [];

  // -------------------------------------------------------------------------
  // State Definition: Main Application Shell (Abstract Parent State)
  // -------------------------------------------------------------------------
  // This state defines the overarching layout for the application, typically a tab bar or side menu.
  // Being abstract, it cannot be activated directly but serves as a parent for child states.
  const mainLayoutState = {
    name: 'mainAppShell',
    url: "/appBase",
    abstract: true, // Prevents direct navigation to this state; it's a structural parent.
    templateUrl: `${TEMPLATE_BASE_DIR}/main-shell.html`
  };
  applicationStates.push(mainLayoutState);

  // -------------------------------------------------------------------------
  // State Definition: Image Capture Feature
  // -------------------------------------------------------------------------
  // A child state of 'mainAppShell', responsible for handling photo/image capture functionality.
  const photoCaptureFeatureState = {
    name: 'mainAppShell.imageCapture',
    url: '/capturePhoto',
    views: {
      // Targets the 'capturePanel' named view within the 'main-shell.html' template.
      'capturePanel': {
        templateUrl: `${TEMPLATE_BASE_DIR}/capture-view.html`,
        controller: 'PhotoCaptureController' // Controller managing the capture view logic.
      }
    }
  };
  applicationStates.push(photoCaptureFeatureState);

  // -------------------------------------------------------------------------
  // State Definition: Help and Information Page
  // -------------------------------------------------------------------------
  // Another child state of 'mainAppShell', providing users with application information or help.
  const informationPage = {
    name: 'mainAppShell.helpAndInfo',
    url: '/infoPage',
    views: {
      // Targets the 'infoPanel' named view within the 'main-shell.html' template.
      'infoPanel': {
        templateUrl: `${TEMPLATE_BASE_DIR}/info-page.html`,
        controller: 'InfoPageController' // Controller for the information display.
      }
    }
  };
  applicationStates.push(informationPage);

  // -------------------------------------------------------------------------
  // State Definition: Application Settings (New Fragment)
  // -------------------------------------------------------------------------
  // An additional state introduced to demonstrate extensibility, for managing app settings.
  const appSettingsState = {
    name: 'mainAppShell.appSettings',
    url: '/settings',
    views: {
      // Targets a 'settingsPanel' named view.
      'settingsPanel': {
        templateUrl: `${TEMPLATE_BASE_DIR}/settings-page.html`,
        controller: 'SettingsController' // Assumes a SettingsController is defined elsewhere.
      }
    }
  };
  applicationStates.push(appSettingsState);

  // Iterate over the collected state configurations and register each one
  // with the UI Router's state provider.
  applicationStates.forEach(function(stateConfiguration) {
    $routeConfigurator.state(stateConfiguration);
  });

  // Configure the URL router to redirect to a default path if no other state's URL matches.
  // This ensures the application always lands on a known view.
  $navigationFallback.otherwise('/appBase/infoPage');

  // Conclude the configuration with an informational message.
  console.info("Application routing setup completed successfully.");

}) // End of the .config block

// The '.run' block executes once the injector is created and all services are configured.
// It's ideal for application-wide startup logic, such as event listeners or initial data loads.
.run(function($rootScope) {
  // Attach a listener to the root scope for state change errors.
  // This provides a global mechanism for logging or handling navigation failures.
  $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, errorDetails) {
    console.error('An error occurred during state transition:', errorDetails, {
      from: fromState.name,
      to: toState.name
    });
    // Optionally, navigate to an error page or display a user-friendly message.
  });
});