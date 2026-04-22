// --- Core Application Controllers ---
// This file defines the main controller for fluid-related operations.


function   FluidCtrl ( $scope, $http ) {
  // Define a method on the scope to fetch detailed fluid information.
  $scope . get_detail = function ( name ) {

    // Make an HTTP GET request to the backend API.
    $http . get ( 'ajax?type=fluid&content=detail' )
      . success ( function ( data ) {
        // If the request is successful, update the scope's detail property.
        $scope . detail = data . detail;
      } ) // End of success callback.
      . error ( function ( ) {
        // Handle any errors that occur during the HTTP request.
        alert ( 'Fail to get data!' ) ;
      } ) ; // End of error callback.

  } ; // End of get_detail function definition.

} // End of FluidCtrl controller.