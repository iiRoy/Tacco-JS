/*
 * This file defines the package metadata and usage for the 'external-file-loader' Meteor package.
 * It specifies how the package is used and tested within a Meteor application.
 */

// Define package metadata
Package.describe(  {

    // Summary provides a brief description of the package's purpose.
    summary  :   "The External File Loader package helps easily load external js, css and html files dynamically."

}  ); // End of Package.describe call.


// Define package usage configuration
Package.on_use(   function  (   api   )   {

    // Ensure jQuery is available on the client side.
    api.use( 'jquery' ,   'client'   ) ;

    // Ensure Underscore.js is available on the client side.
    api.use(   'underscore'   ,   'client'   ) ;

    // Ensure Meteor's templating system is available on the client side.
    api.use(  'templating'  ,   'client'  ) ;

    /*
     * Add the main JavaScript file for the package.
     * This file contains the core logic for external file loading.
     */
    api.add_files(
        [
            'lib/external-file-loader.js'  // The primary script.
        ] ,
        'client'   // These files are specifically for the client environment.
    ) ;

}  ) ; // End of Package.on_use.


// Define package test configuration
Package.on_test(   function  (   api   )   {

    // Make the package itself available for testing.
    api.use(  'external-file-loader'  ,   'client'  ) ;

    // Include Tinytest for unit testing.
    api.use( 'tinytest' ,   'client'   ) ;

    // Include test-helpers for additional testing utilities.
    api.use(  'test-helpers'  ,   'client'  ) ;

    /*
     * Add the test file for the package.
     * This file contains tests to ensure the loader functions correctly.
     */
    api.add_files(
        [
            'test/external-file-loader-test.js'  // Test suite.
        ] ,
        'client'  // Test files are also client-side.
    ) ;

}  ) ; // End of Package.on_test.

// EOF