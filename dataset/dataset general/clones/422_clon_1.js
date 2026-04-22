/*
 * This file defines the session service for the application.
 * It manages session storage operations and interacts with the backend.
 */
// Ensure strict mode is enabled for safer JavaScript.
'use strict'
;


// Define the 'sessionService' factory within the 'app' module.
// It depends on the '$http' service for backend communication.
app
  .factory (
    'sessionService',
    [
      '$http', // Dependency injection: HTTP service
      function (
        $http // The injected $http service instance
      )
      {
        // The service returns an object containing methods for session management.
        return {
          // Method to store a key-value pair in the session storage.
          set : function (
            key,   // The key to store
            value  // The value to associate with the key
          )
          {
            // Delegates to the browser's sessionStorage API.
            return sessionStorage . setItem ( key , value ) ;
          },


          // Method to retrieve a value from the session storage by its key.
          get : function (
            key // The key of the item to retrieve
          )
          {
            // Delegates to the browser's sessionStorage API.
            return sessionStorage . getItem ( key ) ;
          },


          // Method to destroy a session item, potentially notifying the backend.
          destroy : function (
            key // The key of the item to remove
          )
          {
            // Send a POST request to the backend to destroy the session on the server side.
            // Note: This operation is asynchronous and does not block the client-side removal.
            $http . post ( 'data/destroy_session.php' ) ;

            // Remove the item from the client-side session storage.
            return sessionStorage . removeItem ( key ) ;
          }
        }
        ; // End of return object
      }
    ]
  )
; // End of app.factory call