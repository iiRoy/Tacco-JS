/*
 * This JavaScript code reads input from /dev/stdin, processes it,
 * and prints a calculated minimum value to the console.
 * It's structured to handle multiple test cases in a loop.
 */

// Import the 'fs' (file system) module to read input.
var input =
  require('fs')
    .readFileSync(
      '/dev/stdin', // Path to the standard input file
      'utf8'        // Encoding for reading the file
    );

// Process the raw input: trim whitespace and split into an array of lines.
var arr =
  input
    .trim()           // Remove leading/trailing whitespace from the input string
    .split("\n");     // Split the string by newline characters into an array

// Main loop to process multiple test cases.
// It continues indefinitely until a specific break condition is met.
while
  (
    true
  )
{
  // Read the first line of the current test case, which contains 'n' and 'm'.
  // 'shift()' removes the first element from 'arr' and returns it.
  var nm =
    arr
      .shift()        // Get the first line (e.g., "5 3")
      .split(" ");    // Split by space to get individual numbers (e.g., ["5", "3"])

  // Check for the termination condition: "0 0".
  // If 'nm' contains ["0", "0"], the loop breaks.
  if
    (
      nm
        .join(" ")    // Join the array elements back into a string (e.g., "0 0")
      ==
      "0 0"           // Compare with the termination string
    )
  {
    break;            // Exit the while loop
  }

  // Parse 'n' and 'm' from the 'nm' array.
  var n = nm[0];      // n represents the number of elements in N
  var m = nm[1];      // m represents the number of elements in M

  // Initialize array M (modifiers).
  // These are read from subsequent lines of input.
  var M =
    [];

  // Populate M by shifting 'm' elements from 'arr' and converting them to numbers.
  for
    (
      var i = 0;      // Loop counter initialization
      i < m;          // Loop condition: iterate 'm' times
      i++             // Increment loop counter
    )
  {
    M
      .push(
        arr
          .shift()    // Get the next line from input
        -
        0             // Convert to number (shorthand for Number(arr.shift()))
      );
  }

  // Initialize array N (target values).
  // These are read from subsequent lines of input.
  var N =
    [];

  // Populate N by shifting 'n' elements from 'arr' and converting them to numbers.
  for
    (
      var i = 0;      // Loop counter initialization
      i < n;          // Loop condition: iterate 'n' times
      i++             // Increment loop counter
    )
  {
    N
      .push(
        arr
          .shift()    // Get the next line from input
        -
        0             // Convert to number
      );
  }

  // Initialize the 2D dynamic programming (DP) table.
  // dp[i][j] will store the minimum cost to reach state 'j' at step 'i'.
  // The state 'j' represents a value between 0 and 255.
  var dp =
    [];

  // Initialize DP table dimensions and default values.
  // The outer loop iterates up to 'n' (number of target values).
  for
    (
      var i = 0;      // Outer loop for rows (steps/target values)
      i <= n;         // Loop condition: includes dp[n]
      i++             // Increment outer loop counter
    )
  {
    dp[i] =
      [];             // Initialize the inner array for the current row

    // The inner loop iterates for all possible states (0 to 255).
    for
      (
        var j = 0;    // Inner loop for columns (states/values)
        j <= 255;     // Loop condition: includes state 255
        j++           // Increment inner loop counter
      )
    {
      dp[i][j] =
        -1;           // Initialize with -1 to indicate an unreachable state
    }
  }

  // Set the base case for DP:
  // At step 0 (before processing any target values),
  // the cost to be at state 128 is 0.
  // This is a common starting point for problems involving a range like 0-255.
  dp[0][128] =
    0;

  // Main DP calculation loop.
  // This loop iterates through each target value in N.
  for
    (
      var i = 1;      // Outer loop: current step (from 1 to n)
      i <= n;         // Loop condition: up to the last target value
      i++             // Increment step counter
    )
  {
    // Inner loop: iterates through all possible previous states.
    for
      (
        var j = 0;    // Middle loop: previous state (value from 0 to 255)
        j <= 255;     // Loop condition: includes state 255
        j++           // Increment previous state counter
      )
    {
      // Check if the previous state 'j' at step 'i-1' was reachable.
      if
        (
          dp[i - 1][j]
          !=
          -1
        )
      {
        // Innermost loop: iterates through all possible modifiers in M.
        for
          (
            var k = 0;  // Inner loop: modifier index
            k < m;      // Loop condition: iterate through all 'm' modifiers
            k++         // Increment modifier index
          )
        {
          // Calculate the new state 'jm' by applying the current modifier M[k]
          // to the previous state 'j'.
          var jm =
            j
            +
            M[k];

          // Clamp 'jm' to be within the valid range [0, 255].
          if
            (
              jm
              <
              0
            )
          {
            jm =
              0;
          }
          if
            (
              jm
              >
              255
            )
          {
            jm =
              255;
          }

          // Calculate the cost to reach this new state 'jm' at step 'i'.
          // The cost is the previous cost plus the squared difference
          // between the current target value N[i-1] and the new state 'jm'.
          var currentCost =
            dp[i - 1][j]
            +
            Math
              .pow(
                N[i - 1]
                -
                jm,
                2
              );

          // Update dp[i][jm] if this path offers a lower cost.
          if
            (
              dp[i][jm]
              !=
              -1
            )
          {
            // If dp[i][jm] was already reachable, take the minimum cost.
            dp[i][jm] =
              Math
                .min(
                  dp[i][jm],
                  currentCost
                );
          }
          else
          {
            // If dp[i][jm] was not reachable before, set its cost.
            dp[i][jm] =
              currentCost;
          }
        }
      }
    }
  }

  // After filling the DP table, find the minimum cost in the last row (dp[n]).
  var min =
    Infinity;       // Initialize 'min' with a very large value

  // Iterate through all possible final states in the last step (dp[n]).
  dp[n]
    .forEach(
      function(v)   // 'v' represents the cost to reach a specific state at step 'n'
      {
        // Only consider reachable states (cost not -1).
        if
          (
            v
            !=
            -1
          )
        {
          min =
            Math
              .min(
                min,
                v
              );      // Update 'min' if a smaller cost is found
        }
      }
    );

  // Print the overall minimum cost for the current test case.
  console
    .log(
      min           // Output the calculated minimum value
    );
}