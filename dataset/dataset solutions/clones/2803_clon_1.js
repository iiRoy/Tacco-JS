/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact structural and logical equivalence.
 * Only whitespace and comments have been altered significantly.
 * The core functionality remains absolutely identical.
 */

// Define the primary function that processes the input data.
function   main   (   input   )
{

  // Split the raw input string by spaces to obtain individual arguments.
  const   args   =   input.split(" ");

  // Parse the first argument as an integer to get the value of N.
  const   N   =   parseInt(args[0],   10);

  // Parse the second argument as an integer to get the value of L.
  const   L   =   parseInt(args[1],   10);


  // Declare an empty array that will store calculated values.
  var   arr   =   [   ]   ;


  // Iterate N times to populate the 'arr' array.
  // The loop variable 'i' is declared implicitly in this scope.
  for   (   i   =   0  ;   i   <   N  ;   i++   )
  {
    // Add the sum of L and the current iteration index 'i' to the array.
    arr.push(L   +   i)
  }


  // Determine the final output based on the contents of the 'arr' array.
  // Condition 1: Check if the number 0 exists within the array.
  if   (   arr.indexOf(0)   >=   0   )
  {
    // If 0 is found, calculate the sum of an arithmetic progression and print it.
    // The sum is (first_term + last_term) * number_of_terms / 2.
    console.log(   (   arr[0]   +   arr[N-1]   )   *   N   /   2   )  ;
  }
  // Condition 2: If 0 is not in the array, check if the last element is negative.
  else   if   (   arr[N-1]   <   0   )
  {
    // If the last element is negative, calculate the sum excluding the last element.
    console.log(   (   arr[0]   +   arr[N-1]   )   *   N   /   2   -   arr[N-1]   )  ;
  }
  // Condition 3: If neither of the above conditions is met (i.e., first element is positive).
  else
  {
    // Calculate the sum excluding the first element.
    console.log(   (   arr[0]   +   arr[N-1]   )   *   N   /   2   -   arr[0]   )  ;
  }

} // End of the main function definition.


// This line reads the input from standard input, converts it to a UTF-8 string,
// and then invokes the 'main' function with this input.
main(require('fs').readFileSync('/dev/stdin', 'utf8'))
// Program execution terminates after this call.