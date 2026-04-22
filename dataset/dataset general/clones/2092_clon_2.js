(function() {

  // Global flag to indicate if the hardware device is ready for operations.
  var gadget_prepared_flag = false;

  // Global flag to indicate if the user interface framework has completed its initialization.
  var framework_initialized_status = false;


  /**
   * Orchestrates the primary application launch sequence.
   * This function verifies that all necessary components (device and framework)
   * are operational before proceeding to the main program execution.
   */
  var initializeApplication = function() {
    if ((gadget_prepared_flag && framework_initialized_status) || (framework_initialized_status && !portable_environment)) {
      commenceExecution(); // Initiates the core logic of the program.
    }
  };


  /**
   * Event handler triggered when the underlying hardware platform reports readiness.
   * Updates the device status and attempts to proceed with application initialization.
   */
  var handleDeviceReadiness = function() {
    gadget_prepared_flag = true;
    // The physical device is now fully operational and ready to receive commands.
    initializeApplication();
  };


  /**
   * Event handler invoked upon the completion of the mobile UI framework's setup process.
   * Configures essential framework parameters, updates the framework status,
   * and then attempts to begin the application's main routine.
   */
  var handleFrameworkInitialization = function() {
    jQuery.support.crossOriginRequests = true; // Enables Cross-Origin Resource Sharing for AJAX calls.
    jQuery.mobile.permitExternalDomains = true; // Allows navigation to web pages hosted on different domains.
    framework_initialized_status = true;
    // The UI framework has finished its configuration and is ready for interaction.
    initializeApplication();
  };

  // Attaches an event listener to the document for the 'mobileinit' event,
  // which signals the completion of the jQuery Mobile framework's setup.
  jQuery(document).on('mobileinit', handleFrameworkInitialization);

  // Registers an event listener for the native 'deviceready' event,
  // indicating that the Cordova/PhoneGap device is fully loaded and APIs are accessible.
  document.addEventListener("deviceready", handleDeviceReadiness, false);

})();