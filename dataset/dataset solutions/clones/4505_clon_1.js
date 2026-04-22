// This is the beginning of the script.
"use strict"; /* Enforce strict mode for cleaner code. */

/*
 * This is the main function definition.
 * It takes 'input' as its primary argument.
 */
var main = function main(  input  ) {

  // Split the input string by newline characters to get individual arguments.
  var args  =  input.split(  '\n'  ) ;

  // Parse the first argument as an integer, representing N.
  var N  =  parseInt(  args[0] ,  10  ) ;

  // Initialize an empty array 'a'.
  var a  =  [ ] ;

  /*
   * Loop through the arguments starting from the second one (index 1)
   * up to N, parsing each as an integer and pushing it into array 'a'.
   */
  for  (  var i  =  1 ;  i  <=  N ;  i++  )
  {
    a.push(  parseInt(  args[i] ,  10  )  ) ;
  } // End of the loop for populating array 'a'.


  // Initialize 'start' variable to 1. This represents the starting point.
  var start  =  1 ;
  // Initialize 'next' variable with the first element of array 'a'.
  var next  =  a[0] ;

  // Create an array 'checked' to keep track of visited numbers.
  var checked  =  [ ] ;
  // Add the starting point (1) to the 'checked' array.
  checked.push(  1  ) ;

  // Initialize a boolean flag to false.
  var flag  =  false ;
  // Initialize a counter to 0.
  var count  =  0 ;


  // Begin a while loop that continues as long as 'next' is not equal to 'start'.
  while  (  next  !=  start  )
  {
    // Increment the counter in each iteration.
    count++ ;

    // Update 'next' based on the value in array 'a' at index (next - 1).
    next  =  a[  next - 1  ] ;

    // Check if the 'next' value is 2.
    if  (  next  ==  2  )
    {
      // If it is 2, set the flag to true and break the loop.
      flag  =  true ;
      break ;
    }

    // Check if the 'next' value has already been visited (is in 'checked' array).
    if  (  checked.indexOf(  next  )  >=  0  )
    {
      // If it has been visited, it means a cycle is detected without reaching 2, so break.
      break ;
    }
    else  // If 'next' has not been visited yet.
    {
      // Add 'next' to the 'checked' array to mark it as visited.
      checked.push(  next  ) ;
    }
  } // End of the while loop.


  // After the loop, check the value of the 'flag'.
  if  (  flag  )
  {
    // If flag is true, it means 2 was reached. Log (count + 1).
    console.log(  count  +  1  ) ;
  }
  else  // If flag is false, it means 2 was not reached (either cycle or end).
  {
    // Log -1 to indicate that 2 was not found.
    console.log(  -1  ) ;
  }

} ; // End of the main function definition.

// Call the main function with input read from stdin.
main(  require(  'fs'  ).readFileSync(  '/dev/stdin' ,  'utf-8'  )  ) ; // Execute the program.