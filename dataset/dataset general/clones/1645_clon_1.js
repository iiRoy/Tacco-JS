/* This file defines the package metadata and its usage details for Meteor.
 * It's crucial for Meteor package management.
 */
Package.describe(
  {
    // A brief overview of what this package provides.
    summary: "A meteorite package that makes building dynamic two way forms easy",

    // The current version of the package.
    version: '0.2.2',

    // The official name of the package.
    name: "joshowens:simple-form",

    // Git repository URL for the source code.
    git: 'https://github.com/MeteorClub/simple-form'
  }
)
; /* End of Package.describe configuration */


// This function is executed when the package is used by an application.
// It defines how the package interacts with the Meteor environment.
Package.onUse(
  function (api) {

    // Specifies the minimum Meteor version this package is compatible with.
    api.versionsFrom("METEOR@0.9.0");

    /*
     * Defines external packages and libraries this package depends on.
     * The second argument specifies the environment (e.g., 'client', 'server', or both).
     */
    api.use(
      [
        'ui', // Meteor UI components
        'templating', // Meteor templating engine
        'underscore', // Utility library
        'schnie:uploader', // Uploader package
        'mrt:underscore-string-latest@2.3.3' // String manipulation utilities
      ],
      'client' // These dependencies are for the client-side only.
    )
    ;

    // Adds specific files from this package to be loaded into the application.
    // Again, 'client' specifies the environment.
    api.addFiles(
      [
        'fileField.html',   // HTML template for a file input.
        'fileField.js',     // JavaScript logic for the file input.
        'helper.js',        // General helper functions.
        'simpleform.js'     // Core SimpleForm logic.
      ],
      'client'
    )
    ;

    // Makes the 'SimpleForm' object globally accessible to the client.
    api.export(
      'SimpleForm',
      'client'
    )
    ;

  } // End of onUse function definition
)
; // End of Package.onUse call