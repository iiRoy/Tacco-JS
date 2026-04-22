module . exports = { /* This object holds all exported functions for the module. */

	initDataSift : function ( username , apikey , streamid ) {
		// This function initializes the DataSift connection and sets up event listeners.
		// It takes the DataSift username, API key, and stream ID as parameters.

		/* Check if the 'consumer' variable has been defined globally or in an outer scope. */
		if ( consumer === undefined )
		{
			var consumer = new DataSift ( ) ; // If not, create a new DataSift instance.
		}


		/* Determine if an active connection already exists. */
		if ( consumer . request != null )
		{
			console . log ( 'Connective active. Subscribing stream' ) ; // Log status message.
			consumer . subscribe ( streamid ) ; // Subscribe to the specified stream immediately.
		}

		else
		{
			/* No existing connection; establish a new one. */
			console . log ( 'DEBUG: Establishing connection' ) ; // Debug message indicating connection setup.
			consumer = new DataSift ( username , apikey ) ; // Instantiate DataSift with provided credentials.
			consumer . connect ( ) ; // Initiate the connection process.
		}


		/* Event handler for successful connection to the DataSift stream. */
		consumer . on ( "connect" , function ( ) {
			console . log ( "Connected!" ) ; // Connection confirmation.
			consumer . subscribe ( streamid ) ; // Ensure subscription to the stream.
		} ) ;


		/* Event handler for errors encountered during the DataSift operation. */
		consumer . on ( "error" , function ( error ) {
			console . log ( "Error: " + error . message ) ; // Output the specific error message.
		} ) ;


		/* Event handler for warning messages from the DataSift service. */
		consumer . on ( "warning" , function ( message ) {
			console . log ( "Warning: " + message ) ; // Display the warning information.
		} ) ;


		/* Event handler for disconnection from the DataSift stream. */
		consumer . on ( "disconnect" , function ( ) {
			console . log ( "Disconnected!" ) ; // Log disconnection status.
		} ) ;


		/* Event handler for receiving an interaction (data object) from the stream. */
		consumer . on ( "interaction" , function ( obj ) {

			/* Process interaction data if it exists. */
			if ( obj . data !== undefined )
			{
				/* Emit the received data to all connected sockets via 'io'. */
				io . sockets . emit ( 'data' , {
					source : obj . data /* The 'source' property holds the interaction data. */
				} ) ;
			}
		} ) ;
	} /* End of initDataSift function. */
} ; /* End of module.exports object. */