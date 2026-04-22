/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions remain strictly identical.
 * Only whitespace and comments have been altered significantly
 * to create a visually distinct, yet functionally equivalent, version.
 */

function   main(  lines )
{
  // Declare a constant variable 'input' and assign the 'lines' argument to it.
  const    input    =    lines;


  // Initialize a mutable counter variable 'count' to zero.
  let    count    =    0;


  // Outer loop: iterates from the beginning of the input array.
  for (    let    i    =    0;    i    <    input.length;    i++    )
  {
    // Inner loop: iterates from the current 'i' position up to the end of the input array.
    for (    let    j    =    i;    j    <=    input.length;    j++    )
    {
      // Check if the slice of the input from 'i' to 'j' is divisible by 2019
      // and ensure that 'i' and 'j' are not the same (meaning a non-empty slice).
      if (    input.slice(    i,    j    )    %    2019    ===    0    &&    i    !=    j    )
      {
        // If the condition is met, increment the counter.
        count    +=    1;
      }
    }
  }

  // Output the final count to the console.
  console.log(    count    );

} // End of the main function definition.


// Immediately invoke the main function with input read from standard input.
main(    require(    'fs'    )    .    readFileSync(    '/dev/stdin',    'utf8'    )    );