/*
 * This JavaScript module provides a function to retrieve the application
 * version number, specifically tailored for BlackBerry environments.
 * It integrates with Cordova's execution proxy.
 */
module.exports    =
{

  /**
   * Retrieves the version number of the application.
   * This function attempts to access `blackberry.app.version`.
   *
   * @param {Function} success - The success callback function.
   *                             It will be called with the version string if available.
   * @param {Function} fail    - The failure callback function.
   *                             It will be called if the BlackBerry environment
   *                             or app version is not accessible.
   * @returns {string|void} The version string if no success callback is provided,
   *                        or the result of the success/fail callback.
   */
  getVersionNumber:   function (   success ,   fail   )
  {
    // Check if the necessary BlackBerry objects and version property exist.
    // If any part of the path (blackberry, blackberry.app, blackberry.app.version)
    // is undefined or null, we consider it a failure to get the version.
    if   (   !blackberry   ||   !blackberry.app   ||   !blackberry.app.version   )
    {
      // If a failure callback function was provided, invoke it.
      if   (   fail   )
      {
        return   fail(   )   ; // Call the failure callback without arguments.
      }
      else // If no failure callback, return an empty string as a default.
      {
        return   ""   ;
      }
    }

    // If we reach this point, the BlackBerry app version is available.
    // Check if a success callback function was provided.
    if   (   success   )
    {
      // If yes, invoke the success callback with the retrieved version number.
      return   success(   blackberry.app.version   )   ;
    }

    // If no success callback was provided, simply return the version number directly.
    return   blackberry.app.version   ;
  }
}   ;


// This line registers the module's functionality with the Cordova execution proxy.
// It maps the "AppVersion" service name to the functions exported by this module.
require   (   "cordova/exec/proxy"   )   .   add   (   "AppVersion"   ,   module.exports   )   ;