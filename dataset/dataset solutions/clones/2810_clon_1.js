/*
 * This is a Type I clone of a JavaScript program.
 * It demonstrates extensive modifications to whitespace and comments only.
 * The core logic, identifiers, and structure remain absolutely identical.
 */


function   Main  (  input  )
{

    // Step 1: Process the raw input string.
    input   =   input . split ( "\n"  )   ;


    /*
     * Extract the value of N from the first line of input.
     * N typically represents the number of data entries or items.
     */
    var   N   =   parseInt (  input [  0  ]  )   ;

    // Remove the first element, which was N, from the input array.
    input . shift ( )   ;


    // Step 2: Parse the remaining input lines into a structured array X.
    // Each line is split by space, and elements are converted to integers.
    var   X   =   input . map (   i   =>   i . split ( " "  ) . map (   i   =>   parseInt (  i  )  )   )   ;


    /*
     * Ensure the array X contains exactly N elements.
     * This handles cases where input might have extra lines.
     */
    X . splice (  N  ,  X . length - N  )   ;


    // Step 3: Sort the array X based on the second element (index 1) of each sub-array.
    // This is a custom comparison function for sorting.
    X . sort (   function (  a  ,  b  )
    {

        // Compare the second elements.
        if   (  a [  1  ]   <   b [  1  ]  )   return   -1   ;
        if   (  a [  1  ]   >   b [  1  ]  )   return    1   ;

        // If the second elements are equal, their relative order doesn't change.
        return   0   ;

    }  )   ;


    // Step 4: Initialize variables for the core logic.
    var   ans   =   "Yes"   ; // Default answer.
    var   sum   =   0   ;     // Accumulator for the first elements.


    // Loop through the sorted array X.
    for   (  var   i   =   0   ;   i   <   N   ;   i ++   )
    {

        // Add the first element of the current sub-array to the sum.
        sum   +=   X [  i  ] [  0  ]   ;


        // Check the condition: if the accumulated sum exceeds the second element.
        if   (  sum   >   X [  i  ] [  1  ]  )
        {

            // If the condition is met, set the answer to "No".
            ans   =   "No"   ;

            // No need to continue checking, so break out of the loop.
            break   ;

        }

    }


    // Step 5: Output the final answer.
    console . log (  '%s'  ,   ans  )   ;

    // The function returns the answer string.
    return   ans   ;

}


// This debug function is typically used in a browser environment
// to test the Main function with specific inputs and display results.
function   debug (  n  )
{
  // Get the input value from a specific HTML element.
  var   input   =   document . getElementById (  "input"   +   n  ) . value   ;

  // Call the Main function with the obtained input.
  var   ans   =   Main (  input  )   ;

  // Initialize the result status.
  var   result   =   "WA"   ; // Wrong Answer

  // Compare the output from Main with the expected output from another HTML element.
  if   (  ans   ==   document . getElementById (  "output"   +   n  ) . value . split (  "\n"  ) [  0  ]  )
  {

    result   =   "AC"   ; // Accepted

  }

  // Display the result in a specified HTML element.
  document . getElementById (  "result"   +   n  ) . innerHTML   =   result   ;

}


// This line is for execution in a Node.js environment, typically for competitive programming.
// It reads the entire content of standard input and passes it to the Main function.
Main (  require (  "fs"  ) . readFileSync (  "/dev/stdin"  ,   "utf8"  )  )   ;