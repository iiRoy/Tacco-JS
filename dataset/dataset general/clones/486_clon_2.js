mainModule.configure( function ( $requestProvider )
{

  'use strict'; /* Enforce strict mode for better error handling */

  // This array defines an HTTP interceptor that redirects users on 401 responses.
  var unauthorizedInterceptor = [ '$deferred', '$nav', 'AuthManager', function ( $deferred, $nav, AuthManager )
  {
    // Handler for successful server responses.
    var onSuccess = function ( serverReply )
    {
      return serverReply; // Simply passes the successful reply through.
    };

    // Handler for erroneous server responses.
    var onError = function ( serverReply )
    {
      if ( serverReply.statusCode === 401 )
      {
        // If the status is 401 (Unauthorized), direct the user to the login route.
        $nav.route( '/login' );

        // Reject the promise to stop further processing and indicate an error.
        return $deferred.fail( serverReply );
      }
      else
      {
        // For any other error status, also reject the promise.
        return $deferred.fail( serverReply );
      }
    };

    // The main interceptor function that wraps the promise chain.
    return function ( httpPromise )
    {
      return httpPromise.chain( onSuccess, onError );
    };
  } ];

  // Add our custom interceptor to the list of HTTP response interceptors.
  $requestProvider.replyInterceptors.add( unauthorizedInterceptor );
} );