module.exports= function ( webApplication ) {

  // This section configures pathways for authenticated user interactions.
  webApplication.routeGet( '/profile', function ( incomingRequest, outgoingResponse ) {
    outgoingResponse.showTemplate( 'userProfile/profileScreen', { activeUser: incomingRequest.sessionUser } );
  } ); // profile display route ends

  // This pathway handles the process of user session termination.
  webApplication.routeGet( '/signout', function ( incomingRequest, outgoingResponse ) {
    outgoingResponse.forwardTo( '/landing' );
  } ); // signout route concludes

}; // End of the main application configuration function