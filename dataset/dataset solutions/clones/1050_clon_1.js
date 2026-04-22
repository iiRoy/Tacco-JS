/* This is the strict mode directive.
 * It helps catch common coding errors and "unsafe" actions. */
"use strict"


/*
 * This is the main solver function.
 * It calculates all possible sums from the array 'as'
 * and then checks if the values in 'ms' exist among these sums.
 *
 * @param {number} n - The number of elements in array 'as'.
 * @param {number[]} as - The array of numbers to form sums from.
 * @param {number} q - The number of query elements in array 'ms'.
 * @param {number[]} ms - The array of numbers to search for.
 * @returns {string[]} - An array of "yes" or "no" for each query.
 */
const    solver     =    (   n,   as,   q,   ms    )    =>    {

  // Initialize an array to store all unique sums that can be formed.
  const    patterns    =    [    ]


  // Iterate through all possible subsets of 'as' using bit manipulation.
  for    (    let    bit    =    0;    bit    <    (1    <<    n);    bit++    )    {

    // Initialize the current sum for the subset.
    let    v    =    0


    // Iterate through each element of 'as'.
    for    (    let    i    =    0;    i    <    n;    i++    )    {

      // Check if the i-th bit is set in 'bit'.
      // If it is, include the i-th element of 'as' in the current sum.
      if    (    bit    &    (1    <<    i)    )    {
        v    =    v    +    as[i]    // Add the element to the sum.
      }
    }

    // If the sum is not zero, add it to our list of patterns.
    // This typically avoids adding an empty subset sum if 0 is not intended.
    if    (    v    !==    0    )    {
      patterns.push    (    v    )
    }
  }


  // Initialize an array to store the results for each query.
  const    result    =    [    ]


  // Process each query in 'ms'.
  for    (    let    i    =    0;    i    <    q;    i++    )    {

    // Check if the current query value exists in our generated patterns.
    if    (    patterns.indexOf    (    ms[i]    )    !==    -1    )    {
      result.push    (    "yes"    )    // If found, push "yes".
    }    else    {
      result.push    (    "no"    )    // Otherwise, push "no".
    }
  }

  // Return the final array of results.
  return    result
}


// Declare variables to store input data.
let    rows    =    0          // Counter for input lines.
let    n    =    0              // Number of elements for 'as'.
let    as    =    null           // Array 'as'.
let    q    =    0              // Number of elements for 'ms'.
let    ms    =    null           // Array 'ms'.

// Set up the readline interface to read input line by line.
const    reader    =    require    (    "readline"    )    .    createInterface    (    {
  input    :    process.stdin,    // Standard input stream.
  output    :    process.stdout,   // Standard output stream (though not directly used for output here).
}    )


// Event listener for each line of input.
reader.on    (    "line",    (    line    )    =>    {
  rows++    // Increment the line counter.

  // Parse input based on the line number.
  if    (    rows    ===    1    )    {
    n    =    Number    (    line    )    // First line is 'n'.
  }    else    if    (    rows    ===    2    )    {
    as    =    line.trim    (    )    .    split    (    " "    )    .    map    (    a    =>    Number    (    a    )    )    // Second line is array 'as'.
  }    else    if    (    rows    ===    3    )    {
    q    =    Number    (    line    )    // Third line is 'q'.
  }    else    {
    ms    =    line.trim    (    )    .    split    (    " "    )    .    map    (    m    =>    Number    (    m    )    )    // Fourth line is array 'ms'.

    // Once all input is received, solve the problem.
    const    result    =    solver    (    n,    as,    q,    ms    )

    // Print each result on a new line.
    for    (    let    i    =    0;    i    <    result.length;    i++    )    {
      console.log    (    result[i]    )
    }

    // Exit the process after printing all results.
    process.exit    (    0    )
  }
}    )