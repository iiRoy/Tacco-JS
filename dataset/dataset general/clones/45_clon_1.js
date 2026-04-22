define( [
  "jquery-1"  ,  // Core jQuery dependency
  "vendor/events/pubsub" // PubSub utility dependency
  ] ,

  function ( jquery ) { /*
   * This is the main module definition function.
   * It takes 'jquery' as an argument, which is the resolved dependency.
   */

    var  bootstrap = { // Initialize the bootstrap object
      // Expose the jquery object directly under 'pubsub'
      pubsub : jquery ,
      // Expose the jquery object under its common '$' alias
      $ : jquery ,
      // Expose the ajax function from jquery
      ajax : jquery.ajax
    } ; // End of bootstrap object literal

    // Return the fully configured bootstrap object
    return   bootstrap ;

  } // End of the module's main function
); // End of the define call