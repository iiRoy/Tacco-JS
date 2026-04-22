/*
 * This is a Type I clone of the original JavaScript code.
 * Only whitespace and comments have been altered.
 * All identifiers, operators, and expressions remain identical.
 */

( function ( ) {
  // Enforce strict mode for better error handling and cleaner code.
  "use strict" ;

  // Declare variables to hold required modules and configuration values.

  // Module for handling GitHub webhooks and events.
  var github = require ( 'git-at-me' ) ;

  // MongoDB client for database operations and connectivity.
  var mongoClient = require ( 'mongodb' ) . MongoClient ;

  // Determine MongoDB connection URL from environment variables,
  // or fall back to a local default if not specified.
  var mongoDBURL = ( process . env . MONGOHQ_URL || process . env . MONGO_URL || "mongodb://127.0.0.1:27017/aygabtu" ) ;

  // Parse the list of GitHub webhook events from an environment variable,
  // which is expected to be a JSON string.
  var events = JSON . parse ( process . env . GITHUB_HOOK_EVENTS ) ;


  /**
   * Function to persist GitHub event information into the MongoDB database.
   *
   * @param {string} event_name - The specific name of the GitHub event (e.g., 'push', 'issues').
   * @param {object} info       - The detailed payload received from the GitHub webhook.
   */
  var addToMongo = function ( event_name , info )
  {
    // Log the attempt to connect to the MongoDB database, including the URL.
    console . log ( "Connecting to MongoDB database: " + mongoDBURL ) ;

    // Establish a connection to the MongoDB instance using the determined URL.
    mongoClient . connect ( mongoDBURL , function ( err , db )
    {
      // Check for any errors during the database connection process.
      if ( err )
      {
        // If an error occurred, re-throw it to halt execution.
        throw err ;
      }

      // Access the MongoDB collection whose name matches the event_name.
      db . collection ( event_name , function ( err , collection )
      {
        // Check for any errors when trying to retrieve the collection.
        if ( err )
        {
          // If an error occurred, re-throw it.
          throw err ;
        }

        // Insert the event payload (info) into the specified collection.
        // The {w:1} option ensures that the write operation is acknowledged
        // by the primary replica set member before returning.
        collection . insert ( info , { w : 1 } , function ( )
        {
          // Log a success message indicating that the event has been handled.
          console . log ( 'Handled a ' + event_name + ' event.' ) ;
        } ) ;
      } ) ;
    } ) ;
  } ; // End of the 'addToMongo' function definition.


  // Initialize the 'git-at-me' webhook handler with the necessary configuration
  // pulled from environment variables.
  var gitAtMe = github ( {
    // GitHub personal access token used for API authentication.
    token : process . env . GITHUB_TOKEN ,

    // The GitHub username associated with the provided token.
    user : process . env . GITHUB_USERNAME ,

    // The specific GitHub repository to which the webhook should be attached.
    repo : process . env . GITHUB_REPOSITORY ,

    // A boolean flag to determine whether to skip the creation of a new webhook hook.
    // Defaults to true if the environment variable is not set.
    skipHook : ( process . env . AYGABTU_SKIP_HOOK || true ) ,

    /*
     * This comment provides context for the event types configured.
     * It refers to GitHub's internal service definition for webhooks.
     * Original reference: https://github.com/github/github-services/blob/3adc8da1485341316700b288c1dabc566e85fb96/lib/service.rb#L79
     */
    // The array of event types (e.g., 'push', 'issues') that this webhook should listen for.
    events : events ,

    // The public URL where GitHub will send webhook payloads.
    // This should point to the '/git-at-me/events' endpoint of this application.
    url : process . env . AYGABTU_URL + '/git-at-me/events' ,

    // The port on which the application's server will listen for incoming HTTP requests.
    // Typically provided by the hosting environment.
    port : process . env . PORT
  } ) ; // End of 'gitAtMe' object initialization.


  // Iterate over each event name defined in the 'events' array.
  events . forEach ( function ( event_name )
  {
    // For each event name, set up a listener using the 'gitAtMe' instance.
    // This callback function will execute whenever a webhook for 'event_name' is received.
    gitAtMe . on ( event_name , function ( info )
    {
      // Log the full payload of the incoming event for inspection and debugging.
      console . log ( info ) ;

      // Call the 'addToMongo' function to persist the event data to the database.
      addToMongo ( event_name , info ) ;
    } ) ;
  } ) ; // End of the 'events.forEach' loop.

} ) ( ) ; // The Immediately Invoked Function Expression (IIFE) concludes here.