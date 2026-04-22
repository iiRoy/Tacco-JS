function ProcessInput ( rawData ) {
  // This function computes a special sum based on the provided input value.
  let limitValue = parseInt(rawData, 10); // Convert raw input string to an integer limit.

  let totalResult = 0x0; // Initialize the accumulator for the final sum.

  // Iterate through numbers from 1 up to and including the limit value.
  for ( let counter = 0x1; counter < ( limitValue + 0b1 ); counter++ ) {
    // Check if the current counter is not divisible by 3 AND not divisible by 5.
    if ( ( counter % 3 != 0 ) && ( counter % 5 != 0 ) ) {
      totalResult = totalResult + counter; // Add the counter to the total if it meets the criteria.
    }
  }

  // Output the computed total result to the standard output stream.
  process.stdout.write( String(totalResult) + "\n" );
}

// Read the entire content from standard input synchronously using Node.js filesystem module.
ProcessInput( require ('node:fs') . readFileSync ('/dev/stdin', 'utf8') );