// This module provides web app installation capabilities via the root scope service.
define(['app'], function(mainAngularApp) {
  mainAngularApp.run(['$rootScope', '$window', function($scopeContext, $browserWindow) {

    // Determine if the client environment supports the Web Apps API.
    // This is a prerequisite for any installation or status checks.
    $scopeContext.webAppApiSupported = Boolean($browserWindow.navigator && $browserWindow.navigator.mozApps);

    // If the Web Apps API is available, query the installation status of the current application.
    if ($scopeContext.webAppApiSupported) {
      // Create a reference to the navigator's mozApps interface for cleaner access.
      const appManager = $browserWindow.navigator.mozApps;

      // Request self-installation status.
      const selfInstallQuery = appManager.getSelf();

      // Handle successful retrieval of installation status.
      selfInstallQuery.onsuccess = function() {
        // Update the root scope with the installation status.
        $scopeContext.isCurrentAppInstalled = Boolean(selfInstallQuery.result);
        // Manually trigger Angular's digest cycle to update the view.
        $scopeContext.$apply();
      };

      // Handle any errors during the status query (e.g., permission issues).
      selfInstallQuery.onerror = function(statusError) {
        console.error('Failed to retrieve app installation status:', statusError.name, statusError.message);
        // Optionally, set a flag indicating an error occurred.
        $scopeContext.isAppStatusCheckFailed = true;
        $scopeContext.$apply();
      };
    } else {
      // If API is not supported, explicitly mark app as not installed (as it can't be).
      $scopeContext.isCurrentAppInstalled = false;
    }

    // Define the core function for initiating the web app installation process.
    // This function will be callable from any part of the application via the root scope.
    $scopeContext.initiateWebAppInstall = function() {
      // Guard clause: Ensure the Web Apps API is supported before proceeding.
      if (!$scopeContext.webAppApiSupported) {
        console.warn('Installation aborted: Web Apps API not supported by this browser.');
        // Provide user feedback.
        $browserWindow.alert('Installation is not supported on this device.');
        return;
      }

      // Check if installation is already in progress or if the app is already installed.
      if ($scopeContext.installationInProgress) {
        console.log('Installation already in progress, ignoring duplicate request.');
        return;
      }
      if ($scopeContext.isCurrentAppInstalled) {
        console.log('Application is already installed, no need to reinstall.');
        return;
      }

      // Indicate that an installation process has started.
      $scopeContext.installationInProgress = true;

      // Construct the manifest URL dynamically.
      // Use URL API for safer parsing and manipulation.
      let currentUrl = new URL($browserWindow.location.href);
      // Remove hash fragment if present to get the base path.
      currentUrl.hash = '';
      // Get the directory path for the manifest.
      // e.g., "http://example.com/app/index.html" -> "http://example.com/app/"
      let basePath = currentUrl.pathname.substring(0, currentUrl.pathname.lastIndexOf('/') + 1);
      // Combine origin with base path and manifest filename.
      const webManifestUrl = currentUrl.origin + basePath + 'manifest.webapp';

      // Log the manifest URL for debugging.
      console.log('Attempting to install app from manifest:', webManifestUrl);

      // Perform the installation using the mozApps API.
      const appInstallRequest = $browserWindow.navigator.mozApps.install(webManifestUrl);

      // Handle successful installation.
      appInstallRequest.onsuccess = function() {
        // Update the installation status on the root scope.
        $scopeContext.isCurrentAppInstalled = true;
        $scopeContext.installationInProgress = false;
        // Trigger digest cycle.
        $scopeContext.$apply();
        console.info('Web app installed successfully!');
      };

      // Handle installation errors.
      appInstallRequest.onerror = function() {
        $scopeContext.installationInProgress = false;
        // Construct a more informative error message.
        const errorDetails = appInstallRequest.error ? `Error: ${appInstallRequest.error.name} - ${appInstallRequest.error.message || 'Unknown error'}` : 'An unknown installation error occurred.';
        $browserWindow.alert(`Application installation failed.\n\n${errorDetails}`);
        console.error('Web app installation failed:', errorDetails, appInstallRequest.error);
        // Optionally update an error state on the scope.
        $scopeContext.lastInstallError = errorDetails;
        $scopeContext.$apply();
      };
    };

    // Initialize installation status flag.
    $scopeContext.installationInProgress = false;

  }]);
});