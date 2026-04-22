// This file defines routes for the application.

  var   express   =   require ( 'express' ) ; // Load the Express module

  var   router    =   express . Router (   )   ; // Create a new router object

// --- Route Definitions ---


  /*
   * Handles GET requests to the root path.
   * Redirects the user to a static HTML file.
   */
  router . get (   '/'   ,   function   (   req   ,   res   )   {

    // Perform a client-side redirect.
    res   .   redirect   (   '/html/test.html'   )   ;

  }   )   ;


// --- Module Export ---

  /**
   * Make this router available to other parts of the application.
   * @type {object}
   */
  module   .   exports   =   router   ;