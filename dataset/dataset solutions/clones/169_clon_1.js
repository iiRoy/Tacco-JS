// This section of the script is dedicated to handling standard input from the console.
// It imports the 'fs' module to interact with the file system, specifically stdin.
var fs        = require('fs')
  , // Determine the size of the standard input stream.
    length    = fs.fstatSync(process.stdin.fd).size
  , // Allocate a buffer of the determined size to hold the input data.
    buffer    = new Buffer(length)
  , // Read the data from standard input into the buffer.
    bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0)
  , // Convert the buffer content to a UTF-8 string and split it into an array of lines.
    input     = buffer.toString('utf8', 0, bytesRead).split('\n');

// Initiate the main execution flow of the program by calling the 'main' function.
main();


/**
 * @function main
 * @description
 * This is the principal function where the entire logic of the program is executed.
 * It processes multiple test cases, each involving a knapsack problem calculation.
 */
function main()
{
  // 'read' serves as an index to traverse the 'input' array,
  // pointing to the current line being processed.
  var read       = 0;

  // 'resultCase' is a counter for the current test case number,
  // used for formatted output. It starts at 1.
  var resultCase = 1;

  // This loop is designed to process test cases consecutively.
  // It will continue indefinitely until a specific break condition is met.
  while (true)
  {
    // Read the maximum weight capacity for the current knapsack problem.
    // The unary plus operator '+' converts the string input to a numerical value.
    var maxWeight = +input[read++];

    // Check if the 'maxWeight' read is a falsy value (e.g., 0, undefined, null, NaN).
    // A '0' typically signals the end of the input data for test cases.
    if (!maxWeight)
    {
      break; // Terminate the infinite loop if no more valid test cases are found.
    }

    // Read the total number of treasures available for selection in this case.
    var treasures = +input[read++];

    // Initialize 'pdp' (previous dynamic programming array)
    // This array will store the maximum value achievable for each weight,
    // considering treasures processed up to the previous step.
    // It's sized (maxWeight + 1) to accommodate weights from 0 to maxWeight.
    var pdp       = new Int32Array(maxWeight + 1);

    // This loop iterates through each treasure, processing them one by one.
    // The loop condition 'i--' means it runs 'treasures' times,
    // with 'i' decrementing from 'treasures - 1' down to 0.
    for (var i = treasures; i--;)
    {
      // Read the current treasure's data line from input and split it by a comma.
      // This line contains the treasure's value and its weight.
      var c  = input[read++].split(",");

      // Extract the treasure's value (tv) and convert it to a number.
      var tv = +c[0];

      // Extract the treasure's weight (tw) and convert it to a number.
      var tw = +c[1];

      // Initialize 'dp' (current dynamic programming array) for the current treasure.
      // This array will store the maximum value for each weight after considering
      // the current treasure. It is also sized (maxWeight + 1).
      var dp = new Int32Array(maxWeight + 1);

      // Iterate through all possible weights from 1 up to 'maxWeight'.
      // For each weight 'w', calculate the maximum value that can be achieved.
      for (var w = 1; w <= maxWeight; w++)
      {
        // Check if the current weight 'w' is less than the treasure's weight 'tw'.
        // If it is, the current treasure cannot be included without exceeding 'w'.
        if (w - tw < 0)
        {
          // In this case, the maximum value for weight 'w' remains the same
          // as it was before considering the current treasure (from 'pdp').
          dp[w] = pdp[w];
        }
        else
        {
          // If the current treasure can potentially be included:
          // Compare two scenarios:
          // 1. Including the current treasure: value from 'pdp' for (w - tw) + current treasure's value (tv).
          // 2. Excluding the current treasure: value from 'pdp' for 'w' (without the current treasure).
          // Choose the maximum of these two options.
          dp[w] = max(pdp[w - tw] + tv, pdp[w]);
        }
      }
      // After processing the current treasure and updating 'dp' for all weights,
      // 'dp' becomes the 'pdp' for the next iteration (when considering the next treasure).
      pdp = dp;
    }


    // Once all treasures have been processed, find the overall maximum value (cost)
    // and the corresponding minimum weight at which that maximum value is achieved.
    var resultWeight = 1001; // Initialize with a value guaranteed to be higher than any possible result weight.
    var resultCost   = 0;    // Initialize the maximum cost found so far to zero.

    // Iterate through the final 'pdp' array (which now contains results for all treasures).
    // This loop checks each weight from 0 to 'maxWeight'.
    for (var i = 0; i <= maxWeight; i++)
    {
      // If the value (cost) at the current weight 'i' is greater than the 'resultCost' found so far.
      if (pdp[i] > resultCost)
      {
        // Update 'resultCost' to this new higher value.
        resultCost   = pdp[i];
        // Update 'resultWeight' to the current weight 'i' that achieved this cost.
        resultWeight = i;
      }
    }

    // Output the results for the current test case in the specified format:
    // "Case X:\n[Max Cost]\n[Corresponding Weight]"
    // 'resultCase++' increments the case number for the next output.
    console.log("Case " + resultCase++ + ":\n" + resultCost + "\n" + resultWeight);
  }
}

// A utility function intended to return the maximum of two input numbers.
// Note: The body of this function is provided exactly as in the original snippet.
function max(a, b) {