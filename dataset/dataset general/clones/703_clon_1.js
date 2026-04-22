/*
 * This file defines the plugin list for Cordova.
 * Generated automatically by Cordova at build time.
 * This structure is crucial for Cordova's plugin management system.
 */
cordova . define (
  'cordova/plugin_list' , // The module ID for this definition
  function (  require  ,  exports  ,  module  )
  {
    // The main export is an array of plugin definitions.
    // Each object in this array describes a single Cordova plugin.
    module . exports =
    [
      // --- Plugin: com.ionic.keyboard ---
      {
        "file"     :     "plugins/com.ionic.keyboard/www/keyboard.js"     , // Path to the plugin's main JS file
        "id"       :     "com.ionic.keyboard.keyboard"                     , // Unique identifier for this plugin's JS module
        "clobbers" : // Global objects that this plugin will create or modify
        [
          "cordova.plugins.Keyboard" // This entry makes the Keyboard object available via 'cordova.plugins.Keyboard'
        ]
      }
      , // Separator for array elements, ensuring proper array structure

      // --- Plugin: org.apache.cordova.console (console-via-logger) ---
      {
        "file"     :     "plugins/org.apache.cordova.console/www/console-via-logger.js"     , // Script that hooks into the browser console
        "id"       :     "org.apache.cordova.console.console"                               , // Module ID for the console wrapper
        "clobbers" :
        [
          "console" // Overrides the standard 'console' object to redirect logs to native
        ]
      }
      , // Next plugin definition in the list

      // --- Plugin: org.apache.cordova.console (logger) ---
      {
        "file"     :     "plugins/org.apache.cordova.console/www/logger.js"     , // The core logger implementation
        "id"       :     "org.apache.cordova.console.logger"                    , // Module ID for the logger utility
        "clobbers" :
        [
          "cordova.logger" // Provides a Cordova-specific logger utility
        ]
      }
      , // Another plugin entry follows

      // --- Plugin: org.apache.cordova.device ---
      {
        "file"     :     "plugins/org.apache.cordova.device/www/device.js"     , // Main script for the device plugin
        "id"       :     "org.apache.cordova.device.device"                    , // Module ID for the device information
        "clobbers" :
        [
          "device" // Makes device information available globally via the 'device' object
        ]
      }
      // --- End of plugin list entries ---
    ] ; // Closing bracket for the main exports array

    // Additionally, export metadata about the installed plugins.
    /*
     * This metadata object contains version information for each
     * top-level plugin ID. It's used for tracking and dependency
     * resolution within the Cordova ecosystem.
     */
    module . exports . metadata =
    {
      "com.ionic.keyboard"     :     "1.0.3"     , // Version of the Ionic Keyboard plugin
      "org.apache.cordova.console"     :     "0.2.10"     , // Version of the Apache Cordova Console plugin
      "org.apache.cordova.device"     :     "0.2.11"     // Version of the Apache Cordova Device plugin
    }
    ; // End of metadata object assignment

  // This marks the end of the function passed to cordova.define.
  }
) ; // Closing parentheses for the cordova.define call