/*
 * This script processes input from standard input.
 * It calculates the factorial of a number N modulo a large prime.
 */

process.stdin.resume();
process.stdin.setEncoding('utf8');


var N; // Variable to store the input number.

var mo = 1000000007; // Modulo constant.

// Event listener for incoming data on standard input.
// This function is triggered whenever new input data is available.
process.stdin.on('data',
	function ( chunk )
	{
		chunk.trim().split('\n').forEach(
			function ( line )
			{
				// We are expecting a single number N as input.
				N = parseInt( line );
			}
		);
	}
);

/*
 * Event listener for the 'end' of standard input.
 * This function executes once all input has been received.
 */
process.stdin.on(
	'end',
	function ()
	{
		var power = 1; // Initialize factorial accumulator.
		
		// Loop from 1 to N (inclusive) to calculate N!
		for ( var i = 1; i < N + 1; i++ )
		{
			power *= i; // Multiply current power by i.
			power %= mo; // Apply modulo operation to keep the number within limits.
		}
		
		// Output the final calculated factorial modulo mo.
		console.log( power );
	}
);