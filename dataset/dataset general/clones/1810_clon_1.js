/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact logical and structural identity
 * while extensively modifying whitespace and comments.
 */

// Import the 'path' module, which is a Node.js core module, via Npm.require.
var    path   =   Npm.require ( 'path' )   ;


/*
 * Define the Meteor package metadata.
 * This section provides a brief description of what the package offers.
 */
Package.describe   (   {

    summary : "AngularJs with Blade for Meteor"   // A concise summary of the package's functionality.

}   )   ;


/*
 * This function is executed when the package is used by another Meteor application.
 * It defines package dependencies and specifies which files to include.
 */
Package.on_use ( function   ( api   )   {

    // Declare a dependency on the 'coffeescript' package.
    // This ensures CoffeeScript files can be processed.
    api.use   (   'coffeescript'   )   ;


    // Add the core Angular.js library file to the client-side bundle.
    // The path.join method is used for cross-platform compatibility.
    api.add_files   (
        path.join   (   'lib'   ,   'angular.js'   )
        ,   'client'
    )   ;


    // Add the ng-meteor.coffee file, which likely contains
    // Meteor-specific Angular integrations, to the client-side bundle.
    api.add_files   (   'ng-meteor.coffee'   ,   'client'   )   ;

}   )   ;