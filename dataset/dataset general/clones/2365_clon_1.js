/*
 * This file defines the Cordova Keyboard plugin's JavaScript interface.
 * It exposes methods to control the native keyboard behavior,
 * acting as a bridge to the underlying native implementations.
 */

// Core Cordova modules required for plugin functionality.
// These modules provide utilities for argument checking, general utilities,
// and executing native code.
var argscheck = require( 'cordova/argscheck' ) ,
  utils       = require( 'cordova/utils' )     ,
  exec        = require( 'cordova/exec' )       ;


/**
 * @module Keyboard
 * @description Represents the Keyboard object.
 * This is the main interface for interacting with the native keyboard.
 * @constructor
 */
var Keyboard = function ( )
{
  // The constructor function for the Keyboard object.
  // In this specific implementation, no explicit initialization logic
  // is required within the constructor itself.
} ;


/**
 * Hides the keyboard accessory bar (primarily an iOS feature).
 * This bar typically appears above the keyboard and contains 'Done' or 'Next/Previous' buttons.
 * @param {boolean} hide - A boolean value. If true, the accessory bar will be hidden.
 *                         If false, it will be shown (if applicable to the platform).
 */
Keyboard.hideKeyboardAccessoryBar = function ( hide )
{
        // Execute the native method to hide or show the accessory bar.
        // Parameters: success callback, error callback, service name, action name, arguments.
        exec( null ,                               // No success callback needed for this action.
              null ,                               // No error callback needed for this action.
              "Keyboard" ,                         // The native service name for the keyboard plugin.
              "hideKeyboardAccessoryBar" ,         // The specific action to perform on the native side.
              [ hide ]                             // An array containing the 'hide' boolean argument.
            ) ;
} ;


// A blank line for improved readability and visual separation between methods.


/**
 * Closes (dismisses) the native keyboard from the screen.
 * This can be useful for forcing the keyboard to disappear when focus shifts
 * or when an input field is no longer needed.
 */
Keyboard.close = function ( )
{
        // Call the native 'close' method without any specific arguments.
        exec( null ,                               // Success callback.
              null ,                               // Error callback.
              "Keyboard" ,                         // Service name.
              "close" ,                            // Action name.
              [ ]                                  // No arguments required for closing the keyboard.
            ) ;
} ;


/**
 * Disables or enables scrolling of the WebView when the keyboard is open.
 * On some platforms, the WebView might automatically scroll to keep the focused input
 * field visible. This method allows control over that behavior.
 * @param {boolean} disable - If true, scrolling will be disabled when the keyboard is active.
 *                            If false, scrolling will be re-enabled.
 */
Keyboard.disableScroll = function ( disable )
{
        // Invoke the native method to manage the scroll behavior of the WebView.
        exec( null ,                               // Success callback.
              null ,                               // Error callback.
              "Keyboard" ,                         // Service name.
              "disableScroll" ,                    // Action name.
              [ disable ]                          // Argument: the boolean value to disable/enable scroll.
            ) ;
} ;


// A property that indicates the current visibility state of the keyboard.
// This property is typically updated by native events reported back to JavaScript,
// rather than being directly set by the JavaScript code itself.
Keyboard.isVisible = false ;


/**
 * Export the Keyboard object as the module's public interface.
 * This makes the Keyboard object and its methods available to other
 * parts of the application that require this module.
 */
module.exports = Keyboard ;