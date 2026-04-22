// This module contains a primary function designed to compute a specific value
// based on two numerical inputs provided as a single string.

/*
 * The core function for processing the incoming data.
 * It expects a string containing two space-separated numbers.
 */
function processInput(  rawData  ) {

  // Split the entire input string into an array of substrings
  // using a space as the delimiter.
  const   tokens   = rawData.split (  " "  ) ;

  // Retrieve the very first parsed token, which represents the initial value, as a string.
  const   firstValStr   = tokens [  0  ] ;

  // Obtain the second parsed token, which serves as the comparison threshold, also as a string.
  const   secondValStr   = tokens [  1  ] ;

  // An early exit condition: if the second value is the string '1'.
  if (  secondValStr === '1'  ) {

    // In this specific edge case, the expected output is always zero.
    console.log("0");

    // Immediately cease execution of this function.
    return;
  }

  // Convert the string representation of the first value into its numeric equivalent.
  var   firstValueNum   = Number (  firstValStr  ) ;

  // Transform the string representation of the second value into a numerical type.
  var   secondValueNum   = Number (  secondValStr  ) ;

  // Initialize a mutable variable that will track the cumulative sum,
  // beginning with the numeric value of the first input.
  var   currentSum   = Number (  firstValStr  ) ;

  // Start an operation counter, typically at one, indicating the initial state.
  var   iterationCount   = 1 ;

  // Begin an iterative process that continues as long as the current cumulative sum
  // remains less than the established numeric threshold (the second value).
  while (  currentSum < secondValueNum  ) {

    // Increment the counter for each cycle of the loop.
    iterationCount++;

    // Adjust the cumulative sum: subtract one, then add the original first numeric value back.
    currentSum = currentSum - 1 + firstValueNum;
  }

  // Display the final computed iteration count to the standard output.
  console.log(iterationCount);

}

// Execute the primary processing function.
// It reads data from the standard input stream (/dev/stdin) using Node.js's file system module,
// interpreting the content as a UTF-8 encoded string before passing it on.
processInput( require ( "fs" ) . readFileSync (  "/dev/stdin" ,  "utf8"  ) ) ;