/* This file ensures Modernizr is correctly loaded and configured. */
// Ensure the Modernizr global is recognized by linters.
/*global Modernizr:false*/


// Initiates the loading process based on feature detection.
Modernizr.load ( {

    // This is a configuration object for Modernizr.load
    test : Modernizr.mq ( 'only all' ) ,

    // 'yep' is intentionally left empty as no specific resource is needed if the test passes.
    yep  :  '' ,

    // 'nope' specifies the fallback script to load if media queries are not supported.
    nope : 'public/js/respond.js'

} ) ;