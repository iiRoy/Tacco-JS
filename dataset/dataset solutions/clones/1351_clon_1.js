// This JavaScript file demonstrates a simple input processing mechanism.
// It listens for data on the standard input stream and performs a calculation.

// Ensure the standard input stream continues to be active.
// Without this, the process might exit before any input is received.
process.stdin.resume();

// Attach an event listener to the 'data' event of the standard input stream.
// This function will be executed whenever data is available from stdin.
process.stdin.on (  "data"  ,  function  (  input  )
{
    // The 'input' variable contains the data received from stdin.
    // In this specific case, it's expected to be a numeric value.

    // Calculate the cube of the received input.
    // Math.pow(base, exponent) raises 'base' to the power of 'exponent'.
    // Here, 'input' is the base and '3' is the exponent.

    console.log (  (  Math.pow  (  input  ,  3  )  )  ) ; // Output the calculated cube to the console (standard output).

}
) ; // End of the event listener callback function.