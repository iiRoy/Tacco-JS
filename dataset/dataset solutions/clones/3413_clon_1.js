/*
 * This script processes numerical input to find a specific minimum difference.
 * It is designed for competitive programming contexts or similar data analysis tasks.
 * The 'use strict' directive ensures cleaner and safer code execution.
 */

 'use strict' ; // Activating strict mode for the entire script to catch common coding errors.


   // Define the main function that encapsulates the core logic.
   // It accepts the raw input string as its sole argument.
const    main    =    (    INPUT    )    =>    {


  // Step 1: Parse the initial input.
  // The raw input string is split by newline characters to get an array of lines.
  let    input    =    INPUT    .    split    (    '\n'    )    ;

  // Step 2: Extract the value of K.
  // K is located in the first line of input, after a space.
  const    K    =    Number    (    input    [    0    ]    .    split    (    ' '    )    [    1    ]    )    ;

  // Step 3: Remove the first line from the input array
  // as it has been processed to extract K.
  input    .    shift    (    )    ;


  // Step 4: Process the remaining input lines.
  // First, sort the array numerically in ascending order.
  // Then, convert each string element to a proper number.
  input    =    input    .    sort    (    (    a    ,    b    )    =>    a    -    b    )    .    map    (    n    =>    Number    (    n    )    )    ;

  // Step 5: Initialize the answer variable.
  // 'ans' will store the minimum difference found, starting with a large arbitrary value.
  let    ans    =    9999    ;

  // Step 6: Iterate through the sorted array to find the minimum difference.
  // The loop considers all possible windows of size K.
  for    (    let    i    =    0    ;    i    <=    input    .    length    -    K    ;    i    ++    )    {

    // Get the minimum value within the current window.
    // This is the element at the starting index 'i'.
    let    min    =    Number    (    input    [    i    ]    )    ;

    // Get the maximum value within the current window.
    // This is the element at the ending index 'i + K - 1'.
    let    max    =    Number    (    input    [    i    +    K    -    1    ]    )    ;

    // Calculate the difference between the maximum and minimum values in the current window.
    let    tmp    =    max    -    min    ;

    // Compare the current difference with the stored minimum difference.
    // If the current difference is smaller, update 'ans'.
    if    (    ans    >    tmp    )    {
      ans    =    tmp    ;    // Update 'ans' with the new minimum difference.
    }
  }

  // Step 7: Output the final result.
  // Print the calculated minimum difference to the console.
  console    .    log    (    ans    )    ;

}    ;    // End of the main function definition.


// --- Script Execution Entry Point ---
// Reads input from standard input (typically '/dev/stdin' in Unix-like environments)
// and passes it to the 'main' function for processing.
main    (    require    (    'fs'    )    .    readFileSync    (    '/dev/stdin'    ,    'utf8'    )    )    ;

// End of script.