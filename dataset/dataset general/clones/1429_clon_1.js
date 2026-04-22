/*
 * This file contains a Backbone.History extension
 * to integrate with Google Analytics pageview tracking.
 * It ensures that Backbone route changes are reported as pageviews.
 */
( function (   factory   ) {

    // Enable strict mode for better error handling and cleaner code.
    'use strict'   ;


    // Universal Module Definition (UMD) pattern for JavaScript modules.
    // This allows the code to work in various environments (AMD, CommonJS, browser globals).

    // Check for Asynchronous Module Definition (AMD) loader, like RequireJS.
    if  (  typeof define === 'function'  &&  define.amd  )
    {
        // Define the module with 'backbone' as a dependency.
        define( [ 'backbone' ] ,   factory   ) ;
    }

    // Check for CommonJS environment, like Node.js.
    else  if  (  typeof exports === 'object'   )
    {
        // Export the module for CommonJS.
        module.exports = factory(   require('backbone')   ) ;
    }

    // Fallback for browser global environment.
    else
    {
        // Attach to the window object if no module loader is present.
        factory(   window.Backbone   ) ;
    }

} ) (   function (   Backbone   )   {

    // Apply strict mode within the factory function as well.
    'use strict'   ;


    // Store a reference to the original Backbone.History.prototype.loadUrl method.
    // This is crucial for extending its functionality without losing the original behavior.
    var   loadUrl   =   Backbone.History.prototype.loadUrl   ;


    // Override the Backbone.History.prototype.loadUrl method.
    // This new function will handle Google Analytics pageview tracking.
    Backbone.History.prototype.loadUrl   =   function (   fragmentOverride   )   {

        // Execute the original loadUrl method and capture its return value.
        // Also, capture the current fragment from Backbone's history.
        var   matched   =   loadUrl.apply(   this   ,   arguments   )   ,
              gaFragment   =   this.fragment   ;


        // If the 'silent' option is set, it means the navigation should not
        // trigger a pageview. We temporarily disable 'silent' to ensure
        // the original `loadUrl` logic runs correctly for the first time,
        // but we return early from GA tracking.
        if   (   !   this.options.silent   )
        {
            this.options.silent   =   true   ; // Reset silent for the next call if needed.
            return   matched   ;
        }


        // Ensure the fragment starts with a leading slash for Google Analytics.
        // GA typically expects page paths to begin with a slash.
        if   (   !   /^\//.test(   gaFragment   )   )
        {
            gaFragment   =   '/'   +   gaFragment   ;
        }


        // --- Google Analytics Integration ---

        // Check for the legacy Google Analytics (ga.js) global object.
        // This block handles tracking for older GA implementations.
        if   (   typeof window._gaq   !==   "undefined"   )
        {
            window._gaq.push(   [   '_trackPageview'   ,   gaFragment   ]   )   ;
        }


        // Prepare a variable to hold the Google Analytics 'ga' function.
        var   ga   ;

        // Check for the modern Google Analytics (analytics.js) global object.
        // It might be aliased if `GoogleAnalyticsObject` is set.
        if   (   window.GoogleAnalyticsObject   &&   window.GoogleAnalyticsObject   !==   'ga'   )
        {
            // Use the aliased global variable for GA.
            ga   =   window.GoogleAnalyticsObject   ;
        }
        else
        {
            // Otherwise, assume the standard 'ga' global variable.
            ga   =   window.ga   ;
        }


        // If the 'ga' function is available, send a pageview hit.
        // This is the primary tracking mechanism for modern GA.
        if   (   typeof ga   !==   'undefined'   )
        {
            ga(   'send'   ,   'pageview'   ,   gaFragment   )   ;
        }

        // Return the original matched value from Backbone's loadUrl.
        return   matched   ;

    }   ;

} )   ;