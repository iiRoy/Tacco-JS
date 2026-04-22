// This is a Type I clone of the original JavaScript code.
// The purpose is to demonstrate variations in whitespace and comments only,
// while maintaining logical and structural identity.

'use strict' // Enforce strict mode for better error handling and cleaner code.


// The main function that processes the input string.
function main(   input    )
{
  // Step 1: Parse the input.
  // Split the entire input string by newline characters into an array of strings.
  const   tmp   =   input.split(  "\n"  )   ;

  // The first element of the 'tmp' array (tmp[0]) contains the number of tasks, N.
  // Convert this string to an integer using parseInt with radix 10.
  const   N   =   parseInt(  tmp[0],  10  )   ;

  // Initialize two empty arrays: 'A' for task durations and 'B' for task deadlines.
  let   A   =   []   ; // Will store the duration of each task.
  let   B   =   []   ; // Will store the deadline for each task.


  // Loop from 1 to N (inclusive) to read task data from the input array.
  for    (   let   i   =   1   ;   i   <=   N   ;   i++    )
  {
    // Each line (tmp[i]) contains two numbers separated by a space.
    // Split this line into another temporary array 'tmp2'.
    let   tmp2   =   tmp[i].split(  " "  )   ;

    // The first element of 'tmp2' is the duration, parse it to an integer and push to 'A'.
    A.push(   parseInt(   tmp2[0],   10    )   )   ;

    // The second element of 'tmp2' is the deadline, parse it to an integer and push to 'B'.
    B.push(   parseInt(   tmp2[1],   10    )   )   ;
  }

  // Step 2: Initialize variables for task processing.
  let   now   =   0   ; // 'now' represents the current accumulated time spent on tasks.
  let   keepingDeadline   =   true   ; // A flag to track if all deadlines are met. Initially true.


  // Step 3: Process tasks in a greedy manner (earliest deadline first).
  // Continue as long as there are tasks remaining in array 'A'.
  while    (   A.length   !==   0    )
  {
    // Find the minimum deadline among the remaining tasks in array 'B'.
    let   mostUrgentTaskB   =   B.reduce(   (   a,   b   )   =>   Math.min(   a,   b   )   )   ;
    // Get the index of this most urgent task in array 'B'.
    let   mostUrgentTaskInd   =   B.indexOf(   mostUrgentTaskB   )   ;

    // Add the duration of the most urgent task (from 'A') to the current time 'now'.
    now   +=   A[mostUrgentTaskInd]   ;


    // Check if the current time 'now' exceeds the deadline of the task just processed.
    if    (   now   >   B[mostUrgentTaskInd]    )
    {
      keepingDeadline   =   false   ; // If yes, a deadline has been missed.
      break   ; // No need to check further, we already know it's impossible.
    }

    // Remove the completed task from both duration (A) and deadline (B) arrays.
    // The 'splice' method removes elements by index.
    A.splice(   mostUrgentTaskInd,   1    )   ;
    B.splice(   mostUrgentTaskInd,   1    )   ;

  } // End of the while loop for task processing.


  // Step 4: Output the final result.
  // Based on the 'keepingDeadline' flag, print 'Yes' or 'No'.
  if    (   keepingDeadline    )
  {
    console.log(   'Yes'   )   ; // All tasks were completed within their deadlines.
  }
  else
  {
    console.log(   'No'   )   ; // At least one task missed its deadline.
  }
}

// This line reads input from standard input and passes it to the main function.
/*
  The 'require' function is used to import the 'fs' (file system) module.
  'readFileSync' reads the content of '/dev/stdin' (standard input) synchronously.
  'utf8' specifies the encoding for the input.
*/
main(   require(   'fs'   ).readFileSync(   '/dev/stdin',   'utf8'    )   )   ;