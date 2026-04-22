(function() {
  // Application initialization state management.
  // These flags track the readiness of different components.
  const coreHardwareReady = false;
  const mobileFrameworkInitialized = false;
  const applicationConfiguration = {
    enableCorsSupport: true,
    allowCrossDomainPages: true,
    debugMode: true // New flag for conditional logging
  };

  /**
   * Helper function for logging debug messages if debugMode is enabled.
   * @param {string} message - The message to log.
   */
  const logDebugMessage = function(message) {
    if (applicationConfiguration.debugMode && typeof console !== 'undefined' && console.log) {
      console.log(`[APP_LIFECYCLE] ${message}`);
    }
  };

  /**
   * Orchestrates the application startup process.
   * Checks if all necessary conditions are met before launching the main application.
   */
  const beginApplicationStartup = function() {
    // Check if the mobile framework is ready.
    const frameworkIsReady = mobileFrameworkInitialized;

    // Determine if we are in a mobile environment or not.
    // Assuming 'isMobilePlatform' is a globally defined variable from an external script.
    const isMobilePlatformDetected = (typeof isMobilePlatform !== 'undefined' && isMobilePlatform === true);

    // Evaluate the conditions for launching.
    // The application can start if:
    // 1. The mobile framework is ready AND (the device is ready OR it's not a mobile platform).
    // This logic handles both mobile-specific and general web scenarios.
    const canProceedToLaunch = frameworkIsReady && (coreHardwareReady || !isMobilePlatformDetected);

    if (canProceedToLaunch) {
      logDebugMessage("All prerequisites met. Attempting to launch main core functionality.");
      // The 'launchPrimaryApplication' function is expected to be defined elsewhere,
      // representing the actual startup of the application's core logic.
      if (typeof launchPrimaryApplication === 'function') {
        launchPrimaryApplication();
      } else {
        console.error("Critical error: 'launchPrimaryApplication' function is undefined.");
      }
    } else {
      logDebugMessage("Prerequisites not yet met. Waiting for further readiness signals.");
    }
  };

  /**
   * Event handler for when the native device is ready (e.g., Cordova's deviceready event).
   * Sets the coreHardwareReady flag and attempts to start the application.
   */
  const onNativeDeviceReady = function() {
    // Update the state to reflect that the device hardware is now ready.
    coreHardwareReady = true;
    logDebugMessage("Native device hardware is now operational.");
    // After device is ready, re-evaluate if the application can start.
    beginApplicationStartup();
  };

  /**
   * Event handler for when the jQuery Mobile framework has initialized.
   * Configures jQuery Mobile settings and attempts to start the application.
   */
  const onJQueryMobileInitialized = function() {
    // Validate jQuery existence before proceeding with configurations.
    if (typeof jQuery === 'undefined' || !jQuery.mobile) {
      console.error("jQuery Mobile framework is not available. Skipping configuration.");
      return; // Exit early if jQuery Mobile isn't present.
    }

    // Apply cross-domain settings from the application configuration.
    if (applicationConfiguration.enableCorsSupport) {
      jQuery.support.cors = true;
      logDebugMessage("CORS support enabled for jQuery.");
    }
    if (applicationConfiguration.allowCrossDomainPages) {
      jQuery.mobile.allowCrossDomainPages = true;
      logDebugMessage("jQuery Mobile configured to allow cross-domain pages.");
    }

    // Update the state to reflect that the mobile framework is initialized.
    mobileFrameworkInitialized = true;
    logDebugMessage("jQuery Mobile framework has successfully initialized.");
    // After JQM is ready, re-evaluate if the application can start.
    beginApplicationStartup();
  };

  // --- Event Binding ---

  // Use jQuery for binding the 'mobileinit' event to the document.
  // This event fires as jQuery Mobile starts its initialization process.
  // We use the modern 'on' method for event delegation.
  if (typeof jQuery !== 'undefined') {
    jQuery(document).on('mobileinit', onJQueryMobileInitialized);
    logDebugMessage("Bound 'mobileinit' event listener using jQuery.");
  } else {
    console.warn("jQuery is not loaded. Cannot bind 'mobileinit' event.");
    // In a scenario without jQuery, we might need to manually trigger
    // or simulate mobile framework readiness if it's not strictly JQM.
    // For this clone, we'll assume JQM is expected.
  }


  // Attach an event listener for the 'deviceready' event.
  // This is a standard Cordova/PhoneGap event indicating the native device is ready.
  // The 'false' argument indicates that the event will be handled in the bubbling phase.
  document.addEventListener("deviceready", onNativeDeviceReady, false);
  logDebugMessage("Bound 'deviceready' event listener to the document.");

  // Initial check: if no mobile environment is detected, we can sometimes
  // simulate 'deviceready' or bypass it if the app doesn't strictly need it.
  // For this clone, we stick to the original logic flow.

})(); // End of the Immediately Invoked Function Expression (IIFE)