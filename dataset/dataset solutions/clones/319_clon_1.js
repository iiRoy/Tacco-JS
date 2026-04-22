/*
 * This JavaScript code processes input from standard input.
 * It reads lines and performs calculations based on their content.
 */

var input = require('fs').readFileSync(
  '/dev/stdin',
  'utf8'
); /* Read the entire input file synchronously. */

// Split the input string into an array of lines.
// First, trim any leading/trailing whitespace from the input.
var line = (input.trim())
  .split(
    "\n"
  );


var i; // Declare loop counter variable 'i' for the main loop.


// Main loop to iterate through each line of the input.
for (
  i = 0;
  i < line.length;
  ++i
) {

  // Parse the current line as an integer, representing N.
  var N = parseInt(line[i]);

  /*
   * Check if N is zero. If it is, this signifies the end
   * of the input or a specific termination condition.
   */
  if (
    N === 0
  ) {
    break; // Exit the loop if N is 0.
  } else {
    // If N is not zero, proceed with the calculations.

    /*
     * Declare several local variables that will be used within this block.
     * These variables are used for various purposes, including flags,
     * lengths, and temporary storage during calculations.
     */
    var found, len, k;
    var m, n, mn, /*i,*/ j, carry, tmp; // Note: 'i' is already declared globally and reused here.


    // Initialize an array to store "qualified" items.
    var qualified = [];


    // Loop N times, processing N datasets.
    for (
      var j = 0;
      j < N;
      ++j
    ) {
      // Increment 'i' to get to the next line, which contains the dataset.
      // Split the dataset line by spaces.
      var dataset = line[++i]
        .split(
          ' '
        );

      var a1, a2; // Variables to hold parts of the numbers as arrays of characters.

      // Determine which number is "bigger" (has more digits) for multiplication.
      // This helps in setting up the multiplication loop efficiently.
      // Big number processing logic:
      if (dataset[1].length > dataset[2].length) {
        m = dataset[1].length; // Length of the longer number.
        n = dataset[2].length; // Length of the shorter number.
        a1 = dataset[1].split(''); // Convert longer number string to char array.
        a2 = dataset[2].split(''); // Convert shorter number string to char array.
      } else {
        m = dataset[2].length;
        n = dataset[1].length;
        a1 = dataset[2].split('');
        a2 = dataset[1].split('');
      }


      found = 0; // Reset 'found' flag for each dataset.
      mn = m + n; // Maximum possible length of the product.

      // Check if the product length is potentially 7 or more.
      // This is an optimization to avoid unnecessary big number multiplication.
      if (mn >= 7) {
        // Initialize a buffer array for storing the product digits.
        // It's sized mn+1 to accommodate potential carry-overs.
        var buf = new Array(mn + 1);

        // Fill the buffer with zeros initially.
        for (j = 0; j <= mn; ++j) {
          buf[j] = 0;
        }


        /*
         * Perform big number multiplication using a manual algorithm.
         * This is similar to long multiplication taught in elementary school.
         * The outer loop iterates through digits of the first number (a1).
         */
        for (j = m - 1; j >= 0; --j) {
          /*
           * Inner loop iterates through digits of the second number (a2).
           * 'carry' stores any carry-over from the current digit multiplication.
           */
          for (carry = 0, i = n - 1; i >= 0; --i) {
            // Calculate the product of current digits, add existing buffer value, and carry.
            tmp = parseInt(a1[j]) * parseInt(a2[i]) + buf[i + j + 1] + carry;
            buf[i + j + 1] = tmp % 10; // Store the last digit of tmp.
            carry = parseInt(tmp / 10); // Update carry for the next iteration.
          }
          buf[j] = carry; // Store the final carry for the current digit of a1.
        }


        // Find the first non-zero digit in the product buffer.
        // This helps determine the actual length of the product.
        for (j = 0; j <= mn; ++j) {
          if (buf[j] > 0) {
            break;
          }
        }


        // Check if the actual length of the product (mn - j) is 7 or more.
        if (mn - j >= 7) {
          found = 1; // Set 'found' flag if the product is a "big number".
        }
      }


      // If a "big number" was found for the current dataset,
      // check if its identifier (dataset[0]) is already in the 'qualified' list.
      if (
        found
      ) {
        found = 0; // Reset 'found' to use it for checking existence in 'qualified'.

        // Iterate through the 'qualified' array.
        for (k = 0, len = qualified.length; k < len; ++k) {
          if (qualified[k] == dataset[0]) {
            found = 1; // Mark as found if the identifier already exists.
            break; // No need to check further.
          }
        }

        // If the identifier was not found in 'qualified', add it.
        if (
          found === 0
        ) {
          qualified.push(dataset[0]); // Add the identifier to the qualified list.
        }
      }
    }

    // After processing all N datasets, determine the length of the qualified list.
    len = qualified.length;

    // Output results based on whether any qualified items were found.
    if (
      len === 0
    ) {
      console.log("NA"); // If no items are qualified, print "NA".
    } else {
      // If there are qualified items, print each one on a new line.
      for (k = 0; k < len; ++k) {
        console.log(qualified[k]);
      }
    }
  }
}

// End of script execution.