Bundle.blueprint(
  {
    overview:
      "Facilitates access to the X platform's interface, leveraging OAuth1 for authentication within the Stellar framework."
  }
); // End of bundle definition

Bundle.on_load( function ( toolkit, env )
{
  toolkit.import( 'authentication-x', 'backend' ); // Link necessary X authentication components.

  toolkit.import( 'auth-v1', 'backend' ); // Incorporate OAuth version 1 handling.

  if ( toolkit.expose ) { // Check if the exposure mechanism is available.
    toolkit.expose( 'XService', 'backend' ); // Make the primary X service accessible on the server.
  }

  toolkit.register_resources(
    [
      'src/x-connector.js' // Include the main connector script for X.
    ],
    'backend'
  );
} );

Bundle.on_verify( function ( toolkit ) {
  // No specific test files or configurations yet.
} );