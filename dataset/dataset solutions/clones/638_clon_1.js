/*
 * This JavaScript file processes input data to solve a dynamic programming problem.
 * It reads from standard input, parses numbers, and computes a minimum value.
 */

// Import the 'fs' module to handle file system operations, specifically reading input.
var input =    require('fs').readFileSync('/dev/stdin', 'utf8');

// Trim whitespace from the input and split it into an array of lines.
var arr = input.trim().split("\n");

// The first line contains two numbers, n and m, separated by a space.
// Parse them and convert to numbers.
var nm = arr.shift().split(" ").map(Number);

// Extract n (first dimension) and m (second dimension) from the parsed array.
var n=nm[0];
var m=nm[1];


// Initialize array 'd' to store the next 'n' numbers from the input.
var d = [];

// Loop 'n' times to populate array 'd'.
for (var i=0;i<n;i++) {
    // Convert each line to a number and add to 'd'.
    d.push(arr.shift() - 0);
}


// Initialize array 'c' to store the next 'm' numbers from the input.
var c = [];

// Loop 'm' times to populate array 'c'.
for (var i=0;i<m;i++)
    c.push(arr.shift()-0); // Using a single-line for loop for variety.


// Initialize the 2D dynamic programming table 'dp'.
var dp = [];

// Outer loop: iterate from 0 to m (inclusive) for the first dimension of dp.
for (var i=0;i<=m;i++){

   dp[i] = []; // Initialize the inner array for dp[i].

   // Inner loop: iterate from 0 to n (inclusive) for the second dimension.
   for (var j=0;j<=n;j++){
      // Initialize all dp table values to Infinity, representing an unreachable state.
      dp[i][j] = Infinity;
   }
}

// Set the base case: dp[0][0] is 0, meaning zero cost to achieve zero of both.
dp[0][0] = 0;


/*
 * Main dynamic programming calculation loop.
 * This section computes the minimum cost to reach various states.
 */
for (var i=0;i<m;i++){

   var C=c[i]; // Get the current value from array 'c'.

   for (var j=0;j<n;j++){

      var D=d[j]; // Get the current value from array 'd'.

      // Inner-most loop: iterate for 'k' from 1, ensuring i+k does not exceed m.
      for (var k=1;i+k<=m;k++){

         // Option 1: Do not use the current 'D' and 'C' pair.
         // Propagate the minimum cost from the previous state (dp[i][j]) to dp[i+k][j].
         dp[i+k][j] = Math.min(dp[i+k][j],dp[i][j]);

         // Option 2: Use the current 'D' and 'C' pair.
         // Calculate the cost of using this pair (C*D) and add it to the previous state's cost.
         // Update dp[i+k][j+1] if this new path is cheaper.
         dp[i+k][j+1] = Math.min(dp[i+k][j+1],dp[i][j]+C*D);

      } // End of k-loop
   } // End of j-loop
} // End of i-loop

// Output the final result, which is the minimum cost stored at dp[m][n].
console.log(dp[m][n]);