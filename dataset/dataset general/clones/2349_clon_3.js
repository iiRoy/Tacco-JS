(function(applicationHost) {
  'use strict'; // Enforce strict JavaScript parsing and execution rules.

  // Basic validation: Ensure the core AngularJS framework is available.
  // If not, log a critical error and prevent further application boot-up.
  if (!applicationHost.angular) {
    console.error('CRITICAL: AngularJS framework not found. Application cannot initialize.');
    return;
  }

  // Assign a local constant for the AngularJS global object for cleaner access.
  const ngCoreFramework = applicationHost.angular;

  // Define the primary module dependencies as a separate array for better readability.
  const coreModuleDependencies = [
    'ionic',          // Essential mobile UI components and gesture support.
    'avoscloud',      // Backend-as-a-Service (BaaS) integration for data and cloud functions.
    'ngResource',     // Facilitates interaction with RESTful services.
    'ngCordova'       // Provides AngularJS wrappers for Cordova device APIs.
  ];

  // Configure the main application module: 'image-digest-app'.
  ngCoreFramework
    .module('image-digest-app', coreModuleDependencies)
    // Application-wide configuration constants.
    .constant('APP_AUTH_KEY', appConfigs.API_TOKEN) // Security token for authenticating API requests.
    .constant('BACKEND_SERVICE_URL', appConfigs.API_SERVER) // Base URL for the application's backend.
    .constant('AUTH_HEADER_FIELD', 'X-App-Auth-Token') // Custom HTTP header name for the authentication token.
    .constant('MEDIA_CONTENT_SERVER', 'https://tuchong.com/api/') // Base URL for serving image/media content.
    .constant('UI_LOADER_SETTINGS', {
      template: '<div class="loading-overlay"><ion-spinner icon="dots" class="spinner-light"></ion-spinner><p>加载数据中...</p></div>' // Custom HTML template for the loading spinner.
    })
    .constant('APP_RELEASE_VERSION', '1.0.5-release') // Application version string for tracking.
    // Configuration phase: Set up HTTP interceptors, routing, and cloud service.
    .config([
      '$httpProvider',       // Provider for global HTTP service configurations.
      '$stateProvider',      // UI Router service for defining application states (routes).
      '$urlRouterProvider',  // UI Router service for handling URL redirects and default routes.
      'avoscloudProvider',   // Provider for configuring the cloud service.
      'APP_AUTH_KEY',        // Injected constant: application's authentication key.
      'AUTH_HEADER_FIELD',   // Injected constant: HTTP header field name for authentication.
      setupApplicationModules // The function responsible for executing configuration tasks.
    ])
    // Run phase: Execute code after all modules are loaded and configured.
    .run([
      '$ionicPlatform',      // Ionic service to detect platform readiness.
      '$cordovaDevice',      // Cordova plugin wrapper for device information.
      '$cordovaNetwork',     // Cordova plugin wrapper for network status.
      '$cordovaPush',        // Cordova plugin wrapper for push notifications.
      '$timeout',            // AngularJS wrapper for `window.setTimeout`.
      'avoscloud',           // Instance of the cloud backend service.
      '$cordovaDialogs',     // Cordova plugin wrapper for native dialogs (alerts, confirms).
      '$state',              // UI Router service for programmatic state transitions.
      executeInitialAppSetup // The function that runs on application startup.
    ]);

  /**
   * Orchestrates the initial setup tasks once the device platform is ready.
   * This includes checking network status, displaying warnings, and registering for push notifications.
   * @param {object} platformSvc Ionic platform service.
   * @param {object} deviceSvc Cordova device information service.
   * @param {object} networkSvc Cordova network status service.
   * @param {object} pushSvc Cordova push notification service.
   * @param {function} timeoutSvc AngularJS timeout service.
   * @param {object} cloudBaaS Cloud backend service instance.
   * @param {object} dialogsSvc Cordova dialogs service.
   * @param {object} stateSvc UI Router state service.
   */
  function executeInitialAppSetup(
    platformSvc,
    deviceSvc,
    networkSvc,
    pushSvc,
    timeoutSvc,
    cloudBaaS,
    dialogsSvc,
    stateSvc
  ) {
    // Wait for the Ionic platform to be fully initialized and ready.
    platformSvc.ready(function() {
      const currentDeviceDetails = deviceSvc.getDevice();
      const activeNetworkType = networkSvc.getNetwork();

      console.info('APPLICATION STARTUP: Device details obtained:', currentDeviceDetails);
      console.info('APPLICATION STARTUP: Current network type:', activeNetworkType);

      // Validate network connection type. If not Wi-Fi, issue a warning.
      const isMobileData = activeNetworkType !== 'wifi' && !activeNetworkType.includes('WIFI') && activeNetworkType !== 'none';
      if (isMobileData) {
        const networkWarningMsg = '检测到您当前使用非 Wi-Fi 网络。为节约您的移动数据流量，本应用不建议在移动网络下浏览高清大图。';
        const warningDialogTitle = '蜂窝网络使用提示 (´･_･`)';
        const continueButton = '我已知晓';

        // Use a timeout to ensure the dialog appears after other UI elements settle.
        timeoutSvc(() => {
          dialogsSvc.alert(
            networkWarningMsg,
            warningDialogTitle,
            continueButton
          ).then(() => {
            console.log('User acknowledged the mobile data warning.');
          });
        }, 500); // Delay the dialog slightly
      }

      // Proceed to register the device for push notifications.
      enrollDeviceForPushNotifications(
        currentDeviceDetails,
        pushSvc,
        cloudBaaS,
        dialogsSvc,
        (installationPayload) => {
          console.log('Push notification enrollment successful. Data:', installationPayload);
          // Optional: Perform additional actions after successful push registration.
        }
      );
    });

    /**
     * Handles the registration process for push notifications and syncs device installation data
     * with the backend cloud service.
     * @param {object} deviceInformation Detailed information about the current device.
     * @param {object} pushNotificationAPI Cordova push notification service.
     * @param {object} cloudBackendService Cloud service for managing installations.
     * @param {object} uiNotificationDialogs Cordova dialogs service for user feedback.
     * @param {function} onEnrollmentSuccess Callback function executed upon successful registration.
     */
    function enrollDeviceForPushNotifications(deviceInformation, pushNotificationAPI, cloudBackendService, uiNotificationDialogs, onEnrollmentSuccess) {
      const pushRegistrationOptions = {
        "badge": true, // Allow badge count updates on the app icon.
        "sound": true, // Play a sound when a notification is received.
        "alert": true  // Display an alert message for notifications.
      };

      // Attempt to register the device with the push notification service.
      pushNotificationAPI
        .register(pushRegistrationOptions)
        .then(function(devicePushToken) {
          // Guard clause: If no token is received, log a warning and exit.
          if (!devicePushToken) {
            console.warn('Push registration failed: Received an empty or null token.');
            return; // Abort further processing.
          }

          // Construct the installation record payload for the backend.
          let installationRecord = {
            appIdentifier: ngCoreFramework.version.full || ngCoreFramework.version.major + '.' + ngCoreFramework.version.minor,
            clientPlatform: (deviceInformation.platform || 'ios').toLowerCase() // Default to iOS if platform is unknown.
          };

          // Assign the correct token field based on the detected platform.
          if (installationRecord.clientPlatform === 'ios') {
            installationRecord.deviceToken = devicePushToken;
          } else if (installationRecord.clientPlatform === 'android') {
            installationRecord.installationId = devicePushToken; // Android often uses an installation ID.
          } else {
            console.warn(`Unsupported device platform '${installationRecord.clientPlatform}' for push notifications.`);
            return; // Do not attempt to sync for unrecognized platforms.
          }

          // Copy specific device properties to the installation record for backend storage.
          const relevantDeviceProperties = ['model', 'uuid', 'version'];
          for (const propertyKey of relevantDeviceProperties) {
            if (deviceInformation[propertyKey]) {
              installationRecord[propertyKey] = deviceInformation[propertyKey];
            }
          }

          // Send the constructed installation record to the cloud backend.
          cloudBackendService
            .installations
            .post(installationRecord)
            .then(
              (backendResponse) => {
                console.log('Cloud installation record synced successfully:', backendResponse);
                onEnrollmentSuccess(installationRecord); // Invoke the success callback with the data.
              },
              (syncFailureError) => {
                console.error('Failed to sync device installation with backend:', syncFailureError);
                uiNotificationDialogs.alert(
                  '设备信息同步至云端失败，部分云服务功能可能无法正常使用。',
                  '云同步失败',
                  '好的'
                );
              }
            );
        })
        .catch(function(registrationFailure) {
          // Handle any errors that occur during the push notification registration itself.
          console.error('Error during push notification registration:', registrationFailure);
          uiNotificationDialogs.alert(
            '未能成功注册推送服务，请检查您的设备设置或网络连接。',
            '推送注册失败',
            '了解'
          );
        });
    }
  }

  /**
   * Configures various core application modules during the Angular config phase.
   * This includes HTTP defaults, UI Router states, and cloud service provider settings.
   * @param {object} httpConfigProvider HTTP provider for global settings.
   * @param {object} stateRouteProvider UI Router state provider.
   * @param {object} urlRouteProvider UI Router URL provider.
   * @param {object} cloudServiceProvider Cloud service provider.
   * @param {string} authKey Application-wide authentication key.
   * @param {string} authHeaderName HTTP header name for auth key.
   */
  function setupApplicationModules(
    httpConfigProvider,
    stateRouteProvider,
    urlRouteProvider,
    cloudServiceProvider,
    authKey,
    authHeaderName
  ) {
    // Configure the cloud backend service using application-specific settings.
    cloudServiceProvider.config(appConfigs.avoscloud);
    console.debug('Cloud backend service provider configured.');

    // Enable cross-domain requests for all HTTP calls.
    httpConfigProvider.defaults.useXDomain = true;
    // Explicitly remove the default 'X-Requested-With' header, which can interfere with CORS.
    httpConfigProvider.defaults.headers.common['X-Requested-With'] = null; // Setting to null or undefined effectively removes it.
    // Set a custom authentication header for all outgoing HTTP requests.
    const customAuthHeader = authHeaderName || 'X-Default-Auth'; // Use a fallback header name if constant is missing.
    httpConfigProvider.defaults.headers.common[customAuthHeader] = authKey;
    console.debug(`Global HTTP header '${customAuthHeader}' set with authentication token.`);

    // Define the application's routing states.
    stateRouteProvider
      .state('mainApplicationView', { // Primary view for the application.
        url: '/main', // Changed base URL from '/' to '/main'.
        templateUrl: 'app/views/main-app-content.html', // Updated template path and name.
        controller: 'MainContentController as vm' // Renamed controller and adopted 'controllerAs' syntax.
      })
      .state('imageGallery', { // Added a new state for an image gallery feature.
        url: '/gallery/:category',
        templateUrl: 'app/views/image-gallery.html',
        controller: 'GalleryViewController'
      })
      .state('settingsPanel', { // Added another new state for app settings.
        url: '/settings',
        templateUrl: 'app/views/settings-panel.html',
        controller: 'SettingsController'
      });

    // Configure the default route for any unmatched URLs.
    urlRouteProvider.otherwise('/main'); // Redirect to the main application view by default.
    console.info('Application routing states initialized.');
  }

})(window); // Pass the global 'window' object to the IIFE.