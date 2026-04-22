/*
 * This is a JavaScript file.
 * It strictly enforces modern JavaScript rules.
 */
'use strict'



function main  (  input  )   {
  /*
   * Split the input string into an array of lines.
   * Each line represents a piece of data.
   */
  const   lines   =   input . split (  '\n'  )  ;

  // The first line contains the number of tasks, N.
  const   N   =   parseInt (  lines . shift ( )  )  ;

  // Initialize an empty array to store task data.
  const   tasks   =   [ ]

  /*
   * Loop N times to parse each task.
   * Each task line is split by space and its elements are converted to integers.
   */
  for  (  let   i   =   0  ;   i   <   N  ;   i ++   )   {
    tasks . push (  lines . shift ( ) . split (  ' '  ) . map (  x   =>   parseInt (  x  )  )  )  ;
  }

  // Sort the tasks based on their second element (deadline).
  tasks . sort (  (  a  ,  b  )   =>   a [ 1 ]   -   b [ 1 ]  )

  // console.log(tasks); // This line was commented out in the original, keeping it commented.

  // Initialize the result string to 'Yes' by default.
  let   result   =   'Yes'  ;
  // Initialize a variable to keep track of the cumulative sum of task durations.
  let   sum   =   0

  /*
   * Iterate through the sorted tasks to check if all can be completed
   * by their respective deadlines.
   */
  for  (  let   i   =   0  ;   i   <   N  ;   i ++   )   {
    // Add the current task's duration to the cumulative sum.
    sum   +=   tasks [ i ] [ 0 ]

    // Check if the current task's deadline is exceeded.
    if  (  tasks [ i ] [ 1 ]   <   sum   )   { /* If deadline is less than cumulative sum, it's impossible. */
      result   =   'No'  ; // Set result to 'No'.
      break  ; // Exit the loop as soon as an impossible task is found.
    }
  }

  // Output the final result to the console.
  console . log (  result  )  ;
}


// Call the main function with input read from stdin.
// This reads the entire file content as a UTF-8 string.
main (  require (  'fs'  ) . readFileSync (  '/dev/stdin'  ,  'utf8'  )  )  ;