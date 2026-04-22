// This is the main entry point for the program execution.
function main () {
  // Declare and initialize variable 'n' by reading input.
  var n = scan();

  // Declare and initialize variable 'm' by reading input.
  var m = scan();

  // Create an array 'd' of size 'n'. This array will store the first set of values.
  var d = Array(n);

  // Populate array 'd' with scanned values using the 'rep' helper function.
  rep(n, function (i) {
    d[i] = scan(); // Assign the scanned value to the current index 'i' of array 'd'.
  }); // End of population loop for 'd'.


  // Create an array 'c' of size 'm'. This array will store the second set of values.
  var c = Array(m);

  // Populate array 'c' with scanned values.
  rep(m, function (i) {
    c[i] = scan(); // Store the input value at index 'i' in array 'c'.
  }); // End of population loop for 'c'.


  // Initialize a 2D array 'dp' for dynamic programming.
  // The dimensions are (n + 1) rows and (m + 1) columns.
  // This array will store minimum costs.
  dp = Array(n + 1);

  // Loop to initialize each row of the dp array.
  rep(n + 1, function (i) {
    dp[i] = Array(m + 1); // Each row is itself an array of size (m + 1).

    // Inner loop to initialize columns within each row.
    rep(m + 1, function (j) {
      // Base case: If 'i' (number of items considered from 'd') is 0.
      if (i == 0) {
        dp[i][j] = 0; // The cost is 0 if no items from 'd' are considered.
      }
      // Base case: If 'j' (number of items considered from 'c') is 0, but 'i' is not.
      else if (j == 0) {
        dp[i][j] = Infinity; // Infinite cost, as it's impossible to pair 'i' items from 'd' with 0 items from 'c'.
      }
      // General case: Apply the dynamic programming recurrence relation.
      else {
        // The cost at dp[i][j] is the minimum of two options:
        // 1. dp[i][j - 1]: Cost without considering the j-th item from 'c'.
        // 2. dp[i - 1][j - 1] + d[i - 1] * c[j - 1]: Cost considering the j-th item from 'c' paired with the i-th item from 'd'.
        dp[i][j] = Math.min(dp[i][j - 1], dp[i - 1][j - 1] + d[i - 1] * c[j - 1]);
      }
    }); // End of inner loop (j).
  }); // End of outer loop (i).

  // After filling the dp table, the final result is at dp[n][m].
  print(dp[n][m]);
} // End of the main function.


// A helper function for repetition, similar to a standard for loop.
// It iterates 'n' times, calling 'func' with the current index.
function rep (n, func) {
  // Loop from 0 up to (but not including) 'n'.
  for (var i = 0; i < n; ++i) {
    func(i); // Execute the provided function 'func', passing the current index 'i'.
  }
} // End of rep function.


// Set up standard input processing for Node.js environment.
process.stdin.resume(); // Ensures the standard input stream remains open to receive data.
process.stdin.setEncoding('utf8'); // Specifies that input data should be treated as UTF-8 encoded text.

// Global variables to store the accumulated input and track the current reading position.
var input = ''; // This string will accumulate all data received from stdin.
var input_index = 0; // This index keeps track of the current position when reading from the 'input' array.

// Function to scan and return values from the pre-processed input array.
function scan (type) {
  // Check if the caller explicitly requests a 'string' type.
  if (type === 'string') {
    return input[input_index++]; // Return the string at the current index and then increment the index.
  }
  else {
    // By default, convert the scanned input to a number using the unary plus operator.
    return +input[input_index++]; // Convert to number, return, and then increment the index.
  }
} // End of scan function.

// Function to print values to the console.
function print (val) {
  console.log(val); // Uses the standard console.log method for output.
} // End of print function.


// Event listener for incoming data chunks on standard input.
process.stdin.on('data', function (chunk) {
  input += chunk; // Append each new data chunk to the 'input' string.
});

// Event listener for the 'end' of standard input stream.
process.stdin.on('end', function () {
  // Once all input is received, split the 'input' string into an array of substrings.
  // The split is performed using one or more whitespace characters as delimiters.
  input = input.split(/\s+/);
  main(); // Call the main function to begin the primary program logic execution.
});