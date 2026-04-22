// Please refer to the included README.md file for details regarding license terms and conditions.

// JSLint directives and global variable declarations:
// browser:true, devel:true, white:true, vars:true
// Global objects: $, intel, app, dev
// Global functions/objects: myEventHandler, cordova, device

window.app = window.app || {}; // Ensure 'app' object exists on 'window', initializing if not present.

// Application initialization entry point.
// This function executes upon receiving the custom 'app.Ready' event,
// which is typically triggered from 'init-dev.js'.
// It runs after the underlying device's native code and the webview/browser environment
// have been fully prepared and are ready for interaction.
// This is the designated location to commence your application's operations
// by setting up event listeners, initializing components, and so forth.

// NOTE: Please customize this function to suit the specific initialization
// requirements of your application.

app.initEvents = function() {

  "use strict"; // Enforce strict mode for cleaner code and fewer errors.

  var fName = "app.initEvents():"; // Function name for logging/debugging purposes.

  // console.log(fName, "entry"); // Debug: Log function entry.

  // Initialize any third-party libraries and their associated event handlers here.

  // initThirdPartyLibraryNumberOne(); // Example: Initialize first third-party library.
  // initThirdPartyLibraryNumberTwo(); // Example: Initialize second third-party library.
  // initThirdPartyLibraryNumberEtc(); // Example: Initialize additional third-party libraries.

  // Proceed with initializing core application-specific code modules.

  // initMyAppCodeNumberOne(); // Example: Initialize first custom application module.
  // initMyAppCodeNumberTwo(); // Example: Initialize second custom application module.
  // initMyAppCodeNumberEtc(); // Example: Initialize additional custom application modules.

  // Initialize application-level event handlers.
  // A simple example can be found within 'app.js'.
  // TODO: Implement a robust solution to handle both touch and click events
  // consistently across various devices (e.g., mouse input and touch input).
  // Refer to the following resource for guidance:
  // http://msopentech.com/blog/2013/09/16/add-pinch-pointer-events-apache-cordova-phonegap-app/

  var el; // Declare 'el' for potential future use (e.g., element reference).
  var evt; // Variable to store the determined event type ('click' or 'touchend').

  // Determine the appropriate event type based on browser capabilities.
  // If Microsoft Pointer Events are enabled, or if 'ontouchend' is not supported (indicating no touch screen),
  // then we default to using "click" events.
  if (navigator.msPointerEnabled || !('ontouchend' in window)) {
    evt = "click"; // Assign "click" as the event type.
  }
  // Otherwise, assume touch events are available and preferable for touch-enabled devices.
  else {
    evt = "touchend"; // Assign "touchend" as the event type.
  }
  // Note: This approach is not universally optimal but serves its purpose in many scenarios.

  // Once all initializations are complete, it's an opportune moment
  // to dismiss any splash screen that may be displayed.

  app.hideSplashScreen(); // Call the function to hide the splash screen; its use is optional.

  // ...and any other actions you wish to perform now that the application has fully started.
  // The following section is primarily for debugging purposes and is not mandatory;
  // feel free to retain or remove it as needed.

  // ...other miscellaneous initialization tasks can be placed here...

  // Application initialization sequence has concluded.
  // All application event handlers are now set up and ready.
  // The application will now transition to an idle state,
  // awaiting user interactions or system events.

  // console.log(fName, "exit"); // Debug: Log function exit.

};
// Attach the 'app.initEvents' function as an event listener
// for the custom "app.Ready" event.
document.addEventListener("app.Ready", app.initEvents, false);


// This section contains various useful console.log() messages, primarily for debugging.
// These messages are generated after the underlying device's native code and
// the webview/browser environment are fully ready.
// This entire 'initDebug' function is optional and is provided for debugging purposes only;
// it can be kept or removed as per your project's requirements.

app.initDebug = function() {

  "use strict"; // Ensure strict mode is active.

  var fName = "app.initDebug():"; // Function name for logging.

  // console.log(fName, "entry"); // Debug: Log function entry.

  // Check for older Cordova 2.x version detection.
  if (window.device && device.cordova) {
    // console.log("device.version: " + device.cordova); // Log the Cordova version string.
    // console.log("device.model: " + device.model); // Log the device model.
    // console.log("device.platform: " + device.platform); // Log the device platform.
    // console.log("device.version: " + device.version); // Log the device OS version.
  }

  // This block specifically targets Cordova 3.x and newer versions.
  if (window.cordova && cordova.version) {
    // console.log("cordova.version: " + cordova.version); // Log the newer Cordova 3.x version string.

    // If 'cordova.require' is available, attempt to log included Cordova plugins.
    if (cordova.require) {
      // console.log(JSON.stringify(cordova.require('cordova/plugin_list').metadata, null, 1)); // Log plugin metadata.
    }
  }

  // console.log(fName, "exit"); // Debug: Log function exit.

};
// Register 'app.initDebug' to run when the "app.Ready" event is fired.
document.addEventListener("app.Ready", app.initDebug, false);


// The use of a splash screen is entirely optional for your application.
// This function is designed to handle its absence gracefully and will not
// cause errors if no splash screen is present or configured.
// This function also serves as a straightforward example of
// multi-platform device API detection techniques.

app.hideSplashScreen = function() {

  "use strict"; // Activate strict mode for this function.

  var fName = "app.hideSplashScreen():"; // Label for logging.

  // console.log(fName, "entry"); // Debug: Log function entry.

  // Reference: https://github.com/01org/appframework/blob/master/documentation/detail/%24.ui.launch.md
  // Execute the following line if you have explicitly disabled App Framework's autolaunch feature
  // (e.g., by configuration in your index.html file).
  // $.ui.launch();

  // Check if the Cordova API for splash screens is detected.
  if (navigator.splashscreen) {
    navigator.splashscreen.hide(); // Hide the splash screen using Cordova's API.
  }

  // Check if the Intel XDK device API is detected.
  if (window.intel && intel.xdk && intel.xdk.device) {
    intel.xdk.device.hideSplashScreen(); // Hide the splash screen using Intel XDK's API.
  }

  // console.log(fName, "exit"); // Debug: Log function exit.

};