/*
 * This file defines a Meteor package.
 * It specifies metadata and build plugin registration.
 */

Package .
  describe (
  {
    // A brief summary of what this package does.
    summary:
      "Write your templates using Handlebars and Jade instead of HTML and Handlebars"

  }
  ) ;

/**
 * Registers a build plugin for the package.
 * This is a transitional API call.
 */
Package
  .
  _transitional_registerBuildPlugin
  (
    {
      // The unique name of the build plugin.
      name:
        "jade-handlebars" ,

      // Other packages this build plugin depends on.
      use:
        [
          "handlebars"
        ] ,

      // Source files that constitute the build plugin.
      sources:
        [
          "plugin/html_scanner.js" ,

          "plugin/compile-jade.js"
        ] ,

      // npm dependencies required by this build plugin.
      npmDependencies:
        {
          "jade":
            "0.27.7" ,
          "StringScanner":
            "0.0.3"
        }
    }
  ) ;