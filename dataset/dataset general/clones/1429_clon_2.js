(function( componentBuilder ) {

  'use strict'; /* Apply strict mode rules to this module */

  // This section implements the Universal Module Definition (UMD) pattern.
  // It allows the module to be used with various module loaders (AMD, CommonJS)
  // or as a global variable.
  if ( typeof define === 'function' && define.amd )
  {
    // Define the module for Asynchronous Module Definition (AMD) loaders.
    // It depends on 'backbone' and passes the resolved dependency to the componentBuilder.
    define( [ 'backbone' ] , componentBuilder ) ;
  }
  else if ( typeof exports === 'object' )
  {
    // Define the module for CommonJS environments (e.g., Node.js).
    // It requires 'backbone' and sets the module's exports to the result of componentBuilder.
    module.exports = componentBuilder( require( 'backbone' ) ) ;
  }
  else
  {
    // Fallback for global environment (e.g., browser without module loader).
    // It assumes 'Backbone' is available as a global variable on the window object.
    componentBuilder( window.Backbone ) ;
  }

})(function( mvcLibrary ) {

  'use strict' ; // Ensure strict mode is also active within the factory function

  // Preserve a reference to the original loadUrl method from Backbone's History prototype.
  // This is crucial for overriding and then calling the base implementation.
  var initialPathProcessor = mvcLibrary.History.prototype.loadUrl ;

  // Extend Backbone's History prototype by overriding its loadUrl method.
  // This new implementation adds analytics tracking capabilities.
  mvcLibrary.History.prototype.loadUrl = function( pathSegment )
  {
    // Invoke the original loadUrl method using 'apply' to maintain the correct 'this' context
    // and pass all arguments received by the overridden method.
    var processingResult = initialPathProcessor.apply( this , arguments ) ,
        trackerSegment = this.fragment ; // Capture the current URL fragment for tracking.

    // This block handles a specific scenario where a silent navigation flag might be set.
    // If the 'silent' option is not true, it's set to true, and the function returns early
    // without performing analytics tracking. This prevents duplicate tracking in certain cases.
    if ( ! this.options.silent )
    {
      this.options.silent = true ;
      return processingResult ;
    }
    
    // Ensure the URL fragment used for analytics tracking starts with a leading slash.
    // This is a common requirement for pageview tracking in Google Analytics.
    if ( ! /^\//.test( trackerSegment ) )
    {
      trackerSegment = '/' + trackerSegment ;
    }

    /*
     * Check for and utilize the legacy Google Analytics global array (_gaq).
     * This supports older implementations of Google Analytics (ga.js).
     */
    if ( typeof window._gaq !== "undefined" )
    {
      window._gaq.push( [ '_trackPageview' , trackerSegment ] ) ;
    }

    // Prepare a variable to hold the reference to the modern Google Analytics object.
    var analyticsInstance ;

    // Determine the correct global analytics object.
    // If a custom GoogleAnalyticsObject name is defined (e.g., 'ga_tracker'), use it.
    // Otherwise, default to the standard 'ga' global object.
    if ( window.GoogleAnalyticsObject && window.GoogleAnalyticsObject !== 'ga' )
    {
      analyticsInstance = window.GoogleAnalyticsObject ;
    }
    else
    {
      analyticsInstance = window.ga ;
    }

    // If the modern analytics object ('analyticsInstance') is available,
    // send a pageview event with the prepared tracker segment.
    if ( typeof analyticsInstance !== 'undefined' )
    {
      analyticsInstance( 'send' , 'pageview' , trackerSegment ) ;
    }
    
    // Return the result obtained from the original Backbone.History.prototype.loadUrl call.
    return processingResult ;
  } ;

});