/*
 * This file defines the Meteor package for integrating the Ace editor.
 * It handles the package metadata, client-side file inclusion,
 * and testing configuration.
 *
 * This package was originally created by '0a-' and is maintained under 'arch' namespace.
 * It aims to provide a robust Ace editor integration for Meteor applications.
 */


//  Import the Node.js 'fs' (file system) module via Npm.require for file operations.
var   fs   =   Npm.require("fs")  ;



// Define the package metadata.
// This block describes the package's name, summary, version, and Git repository.
Package.describe(
  {

    // The unique name of the package.
    name:     'arch:ace-editor'
    ,
    // A brief summary describing the package's purpose.
    summary: 'Integrating Ace editor with Meteor since 2015'
    ,
    // The current version of the package.
    version: '1.1.1'
    ,
    // The Git repository URL for the package source code.
    git: 'https://github.com/0a-/meteor-ace-editor'


  }
)
;



//  Define actions to be performed when the package is used in an application.
Package.onUse(  function  (  api  )   {


  // Specify the Meteor release version from which this package is compatible.
  api.versionsFrom(  '1.0.2.1'  )  ;


  // Declare a dependency on the 'tracker' package, which is used on the client-side.
  api.use(  'tracker'  ,  'client'  )  ;


  // Read all files from the 'ace-builds/src-noconflict' directory.
  // This directory contains the core Ace editor files.
  var   files   =   fs.readdirSync(  'ace-builds/src-noconflict'  )  ;


  // Iterate over each file found in the Ace build directory.
  files.forEach(  function  (  file  )  {

        // Check if the file has a '.js' extension.
        if  (  file.substr(  -3  )    ===    ".js"  )
        {

            // Add the JavaScript file to the client-side bundle.
            // Mark it as an asset to ensure it's loaded correctly by Ace.
            api.add_files(  "ace-builds/src-noconflict/"  +  file  ,  "client"  ,  {  isAsset:   true  }  )  ;

        }

  }  )  ;


  // Add the custom 'core.js' file to the client-side bundle.
  // This file likely contains Meteor-specific Ace editor integrations.
  api.addFiles(  'core.js'  ,  'client'  )  ;


  // Export the 'AceEditor' variable to client-side code,
  // making it globally accessible within the application's client environment.
  api.export(  'AceEditor'  ,  'client'  )  ;


}  )  ;



//  Define actions to be performed when the package is used in testing.
Package.onTest(  function  (  api  )   {


  // Declare a dependency on the 'tinytest' package for testing utilities.
  api.use(  'tinytest'  )  ;


  // Declare a dependency on this package itself, so its features can be tested.
  api.use(  'arch:ace-editor'  )  ;


  // Add the 'tests.js' file to the client-side test bundle.
  // This file contains the actual test cases for the package.
  api.addFiles(  'tests.js'  ,  'client'  )  ;


}  )  ;