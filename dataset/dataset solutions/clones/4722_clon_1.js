process.stdin.resume(); // Initialize standard input stream.
process.stdin.setEncoding('ascii'); // Set character encoding for input data.

var input_stdin = ""; // Buffer to accumulate all incoming standard input data.
var input_stdin_array = ""; // Array to store individual lines of input once fully received.
var input_currentline = 0; // Pointer to the current line being read from input_stdin_array.

process.stdin.on('data', function (data) { // Event listener for 'data' chunks from stdin.
  input_stdin += data; // Append the received data chunk to the input_stdin buffer.
});

process.on('SIGINT', function(){ // Event handler for SIGINT signal (e.g., Ctrl+C).
    input_stdin_array = input_stdin.split("\n"); // Split the accumulated input into an array of lines.
    main(); // Invoke the core logic function.
    process.exit(); // Terminate the process after main() completes.
});

process.stdin.on('end', function () { // Event listener for the 'end' of the standard input stream.
    input_stdin_array = input_stdin.split("\n"); // Split the entire input string into an array of lines.
    main(); // Call the primary function to execute the program's logic.
});

function readLine() { // Utility function to retrieve the next line from the input array.
    return input_stdin_array[input_currentline++]; // Return the current line and then increment the line pointer.
}

////////////////////////////////////////////////////////////////////////////////
// Everything above this line is boilerplate for input handling.
// The actual problem solution begins below.
////////////////////////////////////////////////////////////////////////////////

function main() {
  // Define a large constant to represent infinity for dynamic programming.
	var INF = 1000000000;

	/* Solution approach: This problem can be modeled as a 2D knapsack-like dynamic programming problem. */

	var s = readLine().split(" "); // Read the first line of input, which contains N, Ma, Mb.
	var N = parseInt(s[0]), Ma = parseInt(s[1]), Mb = parseInt(s[2]); // Parse the values N, Ma, and Mb.

	var a = [0], b = [0], c = [0]; /* These arrays will store properties 'a', 'b', and 'cost' for each ingredient. */
  // The arrays are 1-indexed to match problem description, hence the initial [0].
	for (var i = 1; i <= N; i++) { // Loop N times to read data for each of the N ingredients.
		s = readLine().split(" "); // Read the properties for the current ingredient.
		a.push(parseInt(s[0])); // Add the 'a' property to array 'a'.
		b.push(parseInt(s[1])); // Add the 'b' property to array 'b'.
		c.push(parseInt(s[2])); // Add the 'cost' property to array 'c'.
	}


	/* Dynamic Programming Table Creation and Initialization */
	var dp = []; // Initialize the DP table as a 1D array to simulate a 2D table.
  // The dimensions of the DP table are carefully chosen based on problem constraints.
	for (var i = 0; i <= 11 * N; i++) { // Iterate for the first dimension.
		for (var j = 0; j <= 11 * N; j++) { // Iterate for the second dimension.
			dp.push(INF); // Initialize each cell with INF, representing an unreachable state or infinite cost.
		}
	}
	dp[0] = 0; // Base case: a state with 0 'a' and 0 'b' has a cost of 0.

	function getPos(i, j) { // Helper function to convert 2D coordinates (i, j) into a 1D array index.
		return i * 11 * N + j; // Linearization formula for a 2D array.
	}

	for (var i = 1; i <= N; i++) { // Outer loop: Iterate through each ingredient from 1 to N.
		for (var j = 10 * N; j >= 0; j--) { // Second loop: Iterate 'a' values (target sum for 'a') downwards.
			for (var k = 10 * N; k >= 0; k--) { // Innermost loop: Iterate 'b' values (target sum for 'b') downwards.
                // This condition checks if the current state (j,k) can potentially be reached by including ingredient 'i'.
				if (j - a[i] >= 0 || k - b[i] >= 0) { // Note: The original logic uses OR.
                    // Calculate the 1D index for the current state (j, k).
					var posActual = getPos(j, k);
                    // Calculate the 1D index for the previous state before adding ingredient 'i'.
					var posAnter = getPos(j - a[i], k - b[i]);

                    // If adding the current ingredient 'i' results in a lower cost for state (j, k), update it.
					if (dp[posActual] > dp[posAnter] + c[i]) {
						dp[posActual] = dp[posAnter] + c[i];
					}
				}
			}
		}
	}


	var ans = INF; // Initialize the minimum answer with infinity.
    // Search for the minimum cost among all valid Ma:Mb ratios.
	for (var i = 1; i <= 10; i++) { // Iterate through possible multipliers for Ma and Mb (from 1 to 10).
		var pos = getPos(Ma * i, Mb * i); // Get the 1D index for the target (Ma*i, Mb*i).
        // If the cost for the current ratio (Ma*i, Mb*i) is less than the current minimum answer, update 'ans'.
		if (ans > dp[pos]) {
			ans = dp[pos];
		}
	}

  // Output the final result.
	if (ans == INF) { // If 'ans' is still INF, it means no valid combination was found.
		console.log("-1\n"); // Print -1 to indicate no solution.
	} else { // Otherwise, a solution was found.
		console.log(ans.toString()); // Print the minimum cost found.
	}
}