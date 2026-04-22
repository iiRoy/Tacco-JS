/*
 * This is the primary function definition for the program.
 * Its purpose is to process the given input string.
 */
function   main (   input   )
{
  // A variable to store the individual lines obtained by splitting the input.
  var   lines   =   input.split (   "\n"   )   ;

  /*
   * The first element of the 'lines' array represents the length.
   * It needs to be converted from a string to an integer.
   */
  var   length   =   parseInt (   lines[0]   )   ;

  // The second line contains space-separated numbers.
  // We split them and then map each string element to an integer.
  var   nums   =   lines[1].split (   " "   ).map (   x   =>   parseInt (   x   )   )   ;


  // Initialize a counter variable. This will store the total number of divisions by 2.
  var   answer   =   0   ;

  // Begin a loop that iterates through each number in the 'nums' array.
  // The loop runs 'length' times, from index 0 up to (but not including) 'length'.
  for (   var   i   =   0   ;   i   <   length   ;   i++   )
  {
    // Inner loop: while the current number is even, keep dividing it by 2.
    while (   nums[i]   %   2   ===   0   )
    {
      // Perform the integer division of the current number by 2.
      nums[i]   =   nums[i]   /   2   ;
      // Increment the 'answer' counter for each successful division.
      answer++   ;
    }
  }

  // Finally, print the accumulated 'answer' to the console.
  console.log (   answer   )   ;
}

// This section handles reading input from standard input and calling the main function.
// It uses Node.js 'fs' module to read the file synchronously.
main (   require (   "fs"   ).readFileSync (   "/dev/stdin"   ,   "utf-8"   )   )   ;