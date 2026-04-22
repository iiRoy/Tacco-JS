/*
 * This JavaScript file processes input to solve a specific problem.
 * It is a Type I clone, meaning its functionality is identical to the original,
 * with only whitespace and comments altered for visual differentiation.
 */

function   Main   ( input )
{

  // The main function starts here.
  // It takes the raw input string as its argument.


  input = input.split("\n")  ; // Split the entire input string by newline characters into an array.


  let   input1 = input[0].split(" ") ; // Take the first line and split it by spaces to get N and K.


  const   N = parseInt(input1[0]) ; // Parse the first element of input1 as an integer for N.

  const   K = parseInt(input1[1]) ; // Parse the second element of input1 as an integer for K.


  const   As = input[1].split(" ") ; // Take the second line and split it by spaces into an array of strings for As.


  var   ys = new Array(N) ; // Initialize an empty array 'ys' with a size of N.


  const   AA = As.concat(As) ; // Create a new array 'AA' by concatenating 'As' with itself.
                               // This effectively doubles the 'As' array.


  // Loop through the array 'As' from index 0 up to N-1.
  for ( i = 0 ; i < N ; i++ )
  {
    /*
     * Inside the loop, we are calculating values for the 'ys' array.
     * 's' is a slice of 'AA' starting from i+1.
     */
    var   s = AA.slice(i + 1) ;

    // 'y' finds the index of the current element As[i] within the sliced array 's',
    // and then adds 1 to it.
    var   y = s.indexOf(As[i]) + 1 ;

    // Store the calculated 'y' value into the 'ys' array at the current index 'i'.
    ys[i] = y ;
  }


  var   a = 0 ; // Initialize variable 'a' to 0. This will act as a counter for steps.

  var   b = 0 ; // Initialize variable 'b' to 0. This will store the previous value of 'a'.


  // This loop simulates a process until 'a' reaches or exceeds N*K.
  while ( a < N * K )
  {
    b = a ; // Store the current value of 'a' into 'b' before updating 'a'.

    a += ys[a % N] + 1 ; // Update 'a' by adding the value from 'ys' at index (a % N) plus 1.
  }


  var   id = b % N ; // Calculate 'id' as the remainder of 'b' divided by 'N'.


  var   p = As.slice(id) ; // Create a new array 'p' by slicing 'As' starting from index 'id'.


  var   result = [] ; // Initialize an empty array 'result' to store the final output.


  var   i = 0 ; // Initialize a counter 'i' for the following while loop.


  // This loop processes the 'p' array to find unique elements or skip duplicates based on a specific rule.
  while ( i < p.length )
  {
    /*
     * Check if the current element p[i] appears again in the rest of the array 'p'
     * (from index i+1 onwards).
     */
    if ( p.slice(i + 1).indexOf(p[i]) == -1 )
    {
      // If the element p[i] is not found in the remaining part of the array,
      // it means it's either unique or the last occurrence.
      result.push(p[i]) ; // Add this unique/last-occurrence element to the 'result' array.
      i++ ; // Move to the next element.
    }
    else
    {
      // If the element p[i] *is* found again in the remaining part of the array,
      // skip ahead in the array.
      // The jump distance is the index of the next occurrence plus 2.
      i += p.slice(i + 1).indexOf(p[i]) + 2 ;
    }
  }


  console.log(result.join(" ")) ; // Print the elements of the 'result' array, joined by spaces.
}

// Call the Main function with input read from standard input.
// This is typical for competitive programming environments.
Main( require("fs").readFileSync("/dev/stdin", "utf8") ) ;