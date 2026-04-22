/*
 * This file contains example JavaScript code for a client-side application.
 * It demonstrates integration with the Coinkite API for fetching exchange rates.
 *
 * IMPORTANT: This specific project version is designed *without* any authentication
 * mechanism for simplicity and demonstration purposes. Do NOT use this as a
 * template for applications requiring secure access to sensitive data.
 */

var CK_API_HOST= 'https://api.coinkite.com' ; // Define the base URL for the Coinkite API.

var  app = angular . module ( 'cc-example-module' , ['mgcrea.ngStrap',  'ngResource'  ] ) ;


/*
 * Main controller for the application.
 * Manages fetching and displaying cryptocurrency exchange rates.
 */
app. controller ( 'mainController' , function ( $scope ,  $resource )
{

	// NOTE: This particular API endpoint is publicly accessible.
	// It does not require any form of API key or authentication to retrieve data.
    $scope. busy  =  true ; // Initialize a flag to indicate ongoing operations.

    $scope. rates  =  { } ; // Object to store fetched exchange rates.


    /**
     * Function to initiate the fetching and reloading of exchange rates.
     * Clears existing data before making a new request.
     */
    $scope. reload_rates  =  function ( )
    {
      // First, clear out any previously loaded values from the scope.
      $scope.rates  =  { } ;
      // Set the busy flag to true, indicating data is being loaded.
      $scope.busy  =  true ;

      // Use the ngResource service to make a GET request to the Coinkite API.
      // The endpoint is for public rates.
      $resource ( CK_API_HOST + '/public/rates' ) . get ( function ( d )
      {
          // Upon successful data retrieval:

          // Assign the fetched rates data to the scope.
          $scope. rates  =  d . rates ;

          // Store information about currencies.
          $scope. info  =  d . currencies ;

          // Extract all currency codes (both crypto and fiat).
          $scope. all_codes  =  _ . keys ( d . currencies ) ;

          // Sort and store cryptocurrency codes based on their rank.
          $scope. crypto_codes  =  _ . sortBy ( _ . keys ( d . rates ) ,
                                    function ( k ) { return d . currencies [ k ] . rank ; } ) ;

          // Sort and store fiat currency codes, excluding crypto and a specific test currency 'XTN'.
          $scope. fiat_codes  =  _ . sortBy ( _ . difference ( $scope . all_codes ,  $scope . crypto_codes ,  [ 'XTN' ] ) ,
                                    function ( k ) { return d . currencies [ k ] . rank ; } ) ;

          // Once data processing is complete, set the busy flag back to false.
          $scope. busy  =  false ;
      } ) ;
    }

    // Immediately call the reload_rates function upon controller initialization
    // to load data when the application starts.
    $scope . reload_rates ( ) ;
} ) ;


/*
 * Factory for an HTTP interceptor.
 * This interceptor is used for logging HTTP requests and responses.
 * It's primarily for debugging purposes and not strictly required for functionality.
 */
app. factory ( 'myInterceptor' , [ '$log' ,  function ( $log )
{
    // This interceptor serves primarily for enhanced debugging output in the console.
    // It's not essential for the core logic of the application.

    var myInterceptor =
    {
       'request' :  function ( config )
       {
            // Log details of outgoing HTTP requests.
            $log . debug ( "HTTP Request "  +  config . url ,  config ) ;

            return config ; // Always return the config object.
        } ,

       'response' :  function ( response )
       {
            // Log details of incoming HTTP responses.
            $log . debug ( "HTTP Response: " ,  response ) ;

            return response ; // Always return the response object.
        } ,

       'responseError' :  function ( response )
       {
            // Handle HTTP response errors.
            // This ensures that custom JSON error messages from the server are preserved.
            $log . debug ( "HTTP Response (Error): " ,  response ) ;

			// If the response data is missing, inject a generic error message.
			if ( ! response . data )
			{
				response . data  =  '{"error":"HTTP Error '  +  response . status  +  '"}' ;
			}
            return response ; // Return the (potentially modified) error response.
        }
    } ;

    return myInterceptor ; // Return the interceptor object.
} ] ) ;


/*
 * Configuration block for the Angular application.
 * Here, we register our custom HTTP interceptor.
 */
app . config ( [ '$httpProvider' ,  function ( $httpProvider )
{
    // Push our 'myInterceptor' into the list of HTTP interceptors.
    // This ensures it processes all outgoing requests and incoming responses/errors.
    $httpProvider . interceptors . push ( 'myInterceptor' ) ;
} ] ) ;

// End-of-File marker.
// This indicates the logical conclusion of the JavaScript source code.