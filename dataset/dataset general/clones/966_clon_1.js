/*
 * This file defines a Meteor package for Twitter's Bootstrap.
 * It integrates Bootstrap with themes and Less support for Meteor applications.
 * Version: 1.0.0
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

// Declare the 'path' variable, requiring Node's 'path' module.
  var path  =   Npm .  require ( 'path' ) ;


// Define the package metadata.
Package . describe (
  {
    // A concise summary of what this package provides.
    summary : "Twitter's Bootstrap Packaged for Meteor, with Themes, using Less"
  }
) ; /* End of Package.describe call */


// Configure the package's behavior when it's used by an application.
Package . on_use (
  function (  api  )
  {
    // Ensure the 'less' package is available on the client side.
    api . use (
      [ 'less' ] ,  'client'
    ) ;


    // Add Bootstrap's JavaScript file to the client.
    api . add_files (
      path . join (
        'lib' ,
        'js' ,
        'bootstrap.js'
      ) ,
      'client'
    ) ;


    // Add Bootstrap's Glyphicons halflings image to the client.
    api . add_files (
      path . join (
        'lib' ,
        'img' ,
        'glyphicons-halflings.png'
      ) ,
      'client'
    ) ;


    // Add Bootstrap's white Glyphicons halflings image to the client.
    api . add_files (
      path . join (
        'lib' ,
        'img' ,
        'glyphicons-halflings-white.png'
      ) ,
      'client'
    ) ;
  }
) ; // End of Package.on_use configuration.