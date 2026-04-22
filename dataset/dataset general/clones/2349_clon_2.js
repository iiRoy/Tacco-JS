;(function(globalObj) {
  /* Enforce strict mode for better code quality */
  'use strict';

  /* Alias for the main Angular module object */
  var ngCore = globalObj.angular;

  /*
   * Main application module definition.
   * Defines dependencies, constants, and initial configuration/run blocks.
   */
  ngCore
    .module('daily-photo-feed', [ // Renamed module name
      'mobile-ui',      // Replaced 'ionic'
      'cloud-storage',  // Replaced 'avoscloud'
      'data-access',    // Replaced 'ngResource'
      'device-features' // Replaced 'ngCordova'
    ])
    .constant('ACCESS_KEY', appConfigs.API_TOKEN) // Renamed constant
    .constant('SERVICE_ENDPOINT', appConfigs.API_SERVER) // Renamed constant
    .constant('AUTH_HEADER_KEY', 'daily-photo-auth-token') // Renamed constant and value
    .constant('PHOTO_SERVICE_URL', 'https://photofeed.com/api/') // Renamed constant and URL
    .constant('LOAD_INDICATOR_OPTS', { /* Options for loading spinner */ template: '<ion-spinner icon="lines"></ion-spinner>' }) // Renamed constant
    .config([
      '$httpProvider',
      '$stateProvider',
      '$urlRouterProvider',
      'avoscloudProvider',
      'ACCESS_KEY',
      'AUTH_HEADER_KEY',
      setupModule // Renamed config function
    ])
    .run([
      '$ionicPlatform',
      '$cordovaDevice',
      '$cordovaNetwork',
      '$cordovaPush',
      '$timeout',
      'avoscloud',
      '$cordovaDialogs',
      '$state',
      startApp // Renamed run function
    ]);

  /**
   * Initializes the application upon device readiness.
   * Handles network checks and push notification registration.
   * @param {object} uiFramework - Ionic platform service.
   * @param {object} deviceInfoService - Cordova device information service.
   * @param {object} netMonitor - Cordova network monitoring service.
   * @param {object} pushNotifier - Cordova push notification service.
   * @param {function} delayExec - Angular timeout service.
   * @param {object} cloudPlatform - AvosCloud service.
   * @param {object} msgBoxes - Cordova dialogs service.
   * @param {object} appRouter - UI Router state service.
   */
  function startApp(uiFramework, deviceInfoService, netMonitor, pushNotifier, delayExec, cloudPlatform, msgBoxes, appRouter) {
    uiFramework.ready(function() {
      var devDetails = deviceInfoService.getDevice(); // Renamed variable
      var connStatus = netMonitor.getNetwork();       // Renamed variable

      console.debug('Device Information:', devDetails); // Changed console method and message
      console.debug('Network Status:', connStatus);     // Changed console method and message

      /* Check if the current network is not Wi-Fi and warn the user */
      if (connStatus !== 'wireless' && connStatus !== 'Connectivity.WLAN') { // Renamed network types
        msgBoxes.alert(
          'Detected that the current network is not Wi-Fi. Unless you are on 3G/4G, Photo Feed recommends loading large images only on Wi-Fi.', // Rephrased message
          'ヾ(´ρ｀)〃 Data Usage Warning', // Rephrased title
          'Continue Browsing' // Rephrased button text
        );
      }

      /* Authenticate and register for push notifications */
      registerPushNotifications(devDetails, function(devInstall) { // Renamed function and parameter
        console.debug('Device Installation Data:', devInstall); // Changed console method and message

        cloudPlatform
          .installations // Renamed property
          .sendData(devInstall, onInstallationSyncSuccess, onInstallationSyncFailure); // Renamed method and callbacks

        // Callback for successful installation data synchronization
        function onInstallationSyncSuccess(outcome) { // Renamed function and parameter
          console.debug('Installation sync successful:', outcome); // Changed console method and message
        }

        // Callback for installation data synchronization errors (ignored for now)
        function onInstallationSyncFailure(issue) { // Renamed function and parameter
          console.warn('Installation sync failed:', issue); // Changed console method and message
        }
      });
    });

    /**
     * Handles the registration process for push notifications.
     * @param {object} deviceData - Information about the current device.
     * @param {function} completionCallback - Callback to execute after registration.
     */
    function registerPushNotifications(deviceData, completionCallback) { // Renamed function and parameters
      var pushOptions = { // Renamed variable
        "badge": "true",
        "sound": "true",
        "alert": "true"
      };

      pushNotifier
        .enrollForNotifications(pushOptions) // Renamed method
        .then(function(pushIdentifier) { // Renamed parameter

          var deviceConfig = {}; // Renamed variable

          deviceConfig.platformType = deviceData.platform ? // Renamed property
            deviceData.platform.toLowerCase() :
            'ios';

          if (deviceConfig.platformType === 'ios')
            deviceConfig.deviceTokenId = pushIdentifier; // Renamed property

          if (deviceConfig.platformType === 'android')
            deviceConfig.installIdentifier = pushIdentifier; // Renamed property

          ngCore.forEach(['model', 'uuid', 'version'], function(itemProperty) { // Renamed angular.forEach and parameter
            if (deviceData[itemProperty])
              deviceConfig[itemProperty] = deviceData[itemProperty];
          });

          return completionCallback(deviceConfig); // Renamed parameter
        }, handlePushRegistrationError); // Renamed callback

      // Handles any errors during push notification registration
      function handlePushRegistrationError(regError) { // Renamed function and parameter
        msgBoxes.alert(
          regError,
          'Failed to obtain push permission...', // Rephrased title
          'Understood' // Rephrased button text
        );
      }
    }
  }

  /**
   * Configures HTTP providers, state routing, and cloud services.
   * @param {object} requestConfigurator - HTTP provider service.
   * @param {object} routeManager - State provider service.
   * @param {object} defaultRouteHandler - URL router provider service.
   * @param {object} cloudServiceConfig - AvosCloud provider service.
   * @param {string} AUTH_KEY_VAL - API token value.
   * @param {string} AUTH_HEADER_NAME - API token header key.
   */
  function setupModule(requestConfigurator, routeManager, defaultRouteHandler, cloudServiceConfig, AUTH_KEY_VAL, AUTH_HEADER_NAME) {
    // Configure the cloud service with application-specific settings
    cloudServiceConfig.configure(appConfigs.avoscloud);

    // Enable Cross-Origin Resource Sharing (CORS) for HTTP requests
    requestConfigurator.defaults.enableCors = true; // Renamed property
    // Remove default X-Requested-With header to avoid issues with some APIs
    delete requestConfigurator.defaults.headers.common['X-Client-Request']; // Renamed header
    // Set a custom authorization header for API requests
    requestConfigurator.defaults.headers.common[AUTH_HEADER_NAME || 'daily-photo-auth'] = AUTH_KEY_VAL; // Renamed header key and default value

    // Define application states (routes)
    routeManager
      .state('mainView', { // Renamed state
        url: '/dashboard', // Renamed URL
        templateUrl: 'views/main-dashboard.html', // Renamed template path
        controller: 'MainViewController' // Renamed controller
      })

    // Fallback route for undefined URLs
    defaultRouteHandler.otherwise('/dashboard'); // Renamed URL
  }

})(this);