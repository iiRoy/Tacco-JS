// This script handles RPC connections and performs a series of operations.
var rpc = require( './index.js' ) ;


// The 'step' module is used for flow control.
var Step  = require( 'step' ) ;


// Initialize a counter for total operations.
var total = 0 ;
// Variable to hold the ID of the interval timer.
var intervalId = undefined ;


// Counters for tracking RPC call progress.
var started  =  0 ;
var finished =  0 ;


/**
 * @function next
 * @description This function orchestrates the RPC calls in a loop.
 *              It stops when `total` exceeds 100.
 */
function next ( )
{
	// Check if the total number of operations has exceeded the limit.
	if ( total  >  100 )
	{
		// If so, clear the interval timer to stop further calls.
		clearInterval( intervalId ) ;
		// Log the termination message.
		console.log( 'end' ) ;
		// Log the final status of started vs. finished calls.
		console.log( 'res' , started , '->' , finished ) ;
		// Exit the function.
		return ;
	}


	// Log the current operation number.
	console.log( 'next' , total ) ;
	// Increment the total counter for the next iteration.
	total ++ ;


	// Use the 'Step' module to manage asynchronous operations.
	Step
	(
		function ( )
		{
			// Loop 100 times to initiate multiple RPC connections.
			for ( var p = 0 ; p < 100 ; ++p )
			{
				// Establish an RPC connection to localhost on port 5556.
				rpc.connect ( 5556 , 'localhost' , function ( remote , conn )
				{
					// Increment the counter for started RPC calls.
					started ++ ;
					// Call the 'combine' method on the remote object.
					// This is an RPC call with arguments 1 and 2.
					remote.combine ( 1 , 2 , function ( res )
					{
						// Check if the result of 'combine' is not as expected.
						if ( res  !=  3 )
						{
							// Log an alert if the result is incorrect.
							console.log( 'Achtung!!! ---------' , res ) ;
						}

						// After combining, request a file from the remote server.
						remote.getFile ( function ( res )
						{
							// Calculate the length of the stringified file content.
							var l = JSON.stringify( res ) . length ;

							// Check if the file length is not the expected value.
							if ( 97143  !=  l )
							{
								// Log an alert if the file length is incorrect.
								console.log( l , 'TT_TT, Achtung' ) ;
							}
							// Increment the counter for finished RPC calls.
							finished ++ ;

							// If all started calls have finished, log the status.
							if ( finished  ==  started )
							{
								// Log the current status of started vs. finished calls.
								console.log( 'res' , started , '->' , finished ) ;
							}

							// Destroy the connection to free up resources.
							conn.destroy ( ) ;
							// End the connection.
							conn.end ( ) ;
						} ) ; // End of getFile callback
					} ) ; // End of combine callback
				} ) ; // End of rpc.connect callback
			} // End of for loop
		} // End of Step function
	) ; // End of Step call
} // End of next function


// Set up an interval to call the 'next' function every 1000 milliseconds (1 second).
intervalId = setInterval ( next , 1000 ) ;