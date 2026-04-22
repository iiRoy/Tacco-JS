/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions remain strictly identical.
 * Only whitespace and comments have been altered significantly
 * to create a visually distinct, yet functionally equivalent, version.
 */

function   main  ( input )
{

  // Initialize N by converting the first input element to a number
  var   N    =    input[0]  -  0;

  var   map   =   {};  // A frequency map to store counts of numbers
  var   max   =   0;   // Variable to track the maximum number encountered

  input[1]
    .split(" ") // Split the second input line by spaces
    .forEach(v => {
      // Convert the current value to a number
      v = v - 0;

      // Increment count in map, or initialize to 1 if not present
      map[v] = map[v] ? map[v] + 1 : 1;

      // Update maximum value if current 'v' is greater
      max = Math.max(max, v);
    });

  // Initialize the answer variable
  var   ans   =   1;

  // This variable is declared but not used in the final calculation.
  // It is kept as per Type I cloning rules.
  var   ansmap   =   {};

  // Assigning a value to ansmap at index -1.
  // This line is also kept as is.
  ansmap[-1]   =   1;

  /*
   * Loop from 1 up to the maximum value found.
   * This loop calculates the final answer based on the frequency map.
   */
  for   ( var   i   =   1;   i   <=   max;   i++ )
  {
    // Multiply ans by Math.pow(map[i-1], map[i])
    ans   *=   Math.pow(map[i-1],   map[i]);

    // Apply modulo operation to keep the number within bounds
    ans   %=   998244353;
  }

  // Output the final calculated answer to the console.
  console.log(ans);

}

// Global object for memoization in factorial function
var   kaijomap   =   {};

/*
 * Function to calculate factorial (kaijo in Japanese).
 * Uses memoization to store previously computed factorials.
 */
function   kaijo   ( N )
{
  // Base case: factorial of 1 is 1
  if   ( N   ==   1 )
    return   1;

  // Check if factorial of N is already computed and stored
  if   ( kaijomap[N] )
    return   kaijomap[N];

  // Compute factorial and store it in kaijomap before returning
  return   kaijomap[N]   =   N   *   kaijo(N-1);
}


// Read input from stdin, split by newlines, and pass to the main function.
main(require('fs').readFileSync('/dev/stdin', 'utf8').split("\n"))