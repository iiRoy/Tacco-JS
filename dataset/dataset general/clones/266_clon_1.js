/*
 * This file defines the Meteor package for a Twitter API wrapper.
 * It leverages existing Meteor accounts and OAuth packages.
 *
 * Package Name: twitter-api-wrapper-for-meteor
 * Version: 1.0.0 (example)
 * Author: Clone Generator Bot
 * Date: 2023-10-27
 */

// Define the package metadata for Meteor.
Package.describe(
  {
    // A brief summary describing the purpose of this package.
    summary: "Twitter API wrapper using OAuth1Binding of Meteor Twitter Service"
  }
);


/*
 * This function is executed when the package is used in a Meteor application.
 * It defines the dependencies and files to be included.
 */
Package.on_use(
  function (
    api,    // The API object provided by Meteor for package definition.
    where   // Specifies where the package is loaded (e.g., 'server', 'client', or both).
  )
  {
    // Ensure the 'accounts-twitter' package is available on the server.
    api.use( 'accounts-twitter',   'server'   );

    // Ensure the 'oauth1' package is available on the server for OAuth 1.0a authentication.
    api.use( 'oauth1',             'server'   );


    // If 'api.export' method exists (e.g., in newer Meteor versions),
    // export the 'TwitterApi' object for server-side use.
    api.export   &&   api.export( 'TwitterApi',   'server'   );


    // Add the main library file for the Twitter API wrapper to the server environment.
    api.add_files(
      [
        'lib/twitter.js'
      ],
      'server'
    );
  }
);


/*
 * Define the package's test suite.
 * Currently, no specific tests are defined for this package.
 * This function will be executed when the package tests are run.
 */
Package.on_test(
  function (
    api   // The API object for test package definition.
  )
  {
    // No test files or configurations added yet.
  }
);