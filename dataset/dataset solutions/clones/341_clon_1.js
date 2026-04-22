/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * remain exactly as they were in the original source.
 * Only whitespace (spaces, tabs, newlines) and comments have been altered
 * to create a visually distinct but functionally identical program.
 */

// Initialize an empty object to store calculated weights and minimum money values.
var   obj   =   { }   ;

// Outer loop for the 'i' variable, ranging from 0 to 25.
for   (  var   i   =   0  ;
        i   <=   25  ;
        i   ++    )
{
  // Middle loop for the 'j' variable, ranging from 0 to 16.
  for   (  var   j   =   0  ;
          j   <=   16  ;
          j   ++    )
  {
    // Inner loop for the 'k' variable, ranging from 0 to 10.
    for   (  var   k   =   0  ;
            k   <=   10  ;
            k   ++    )
    {

      // Calculate the 'weight' based on current i, j, and k values.
      // The coefficients are 200 for i, 300 for j, and 500 for k.
      var   weight   =   200   *   i   +   300   *   j   +   500   *   k   ;

      // If the calculated weight exceeds 5000, skip to the next iteration
      // of the innermost loop as per problem constraints.
      if   (  weight   >   5000  )
      {
        continue   ;
      }

      // Initialize 'money' for the current combination of i, j, k.
      var   money   =   0   ;

      // Add money based on multiples of 5 for 'i'.
      // This represents a bulk discount or specific pricing tier.
      money   +=   380   *   5   *   0.8   *   Math.floor   (  i   /   5  )   ;

      // Add money based on multiples of 4 for 'j'.
      // Another pricing tier calculation.
      money   +=   550   *   4   *   0.85   *   Math.floor   (  j   /   4  )   ;

      // Add money based on multiples of 3 for 'k'.
      // Yet another pricing tier.
      money   +=   850   *   3   *   0.88   *   Math.floor   (  k   /   3  )   ;

      // Add money for the remainder of 'i' not covered by the multiples of 5.
      money   +=   380   *   (  i   %   5  )   ;

      // Add money for the remainder of 'j' not covered by the multiples of 4.
      money   +=   550   *   (  j   %   4  )   ;

      // Add money for the remainder of 'k' not covered by the multiples of 3.
      money   +=   850   *   (  k   %   3  )   ;


      // Check if the current 'weight' already exists as a key in the 'obj' object.
      if   (  obj.hasOwnProperty   (  weight  )  )
      {
        // If it exists, update its value with the minimum of the current 'money'
        // and the previously stored 'money' for that 'weight'.
        obj   [  weight  ]   =   Math.min   (  obj   [  weight  ]  ,
                                             money  )   ;
      }
      else
      {
        // If the 'weight' is new, store the current 'money' value.
        obj   [  weight  ]   =   money   ;
      }
    }
  }
}

/*
 * --- Input Processing Section ---
 * This part reads input from stdin, processes it, and outputs results.
 */

// Use Node.js 'fs' module to read the entire content of standard input.
// The input is expected to be UTF-8 encoded.
var   input   =   require   (  'fs'  )  .readFileSync   (  '/dev/stdin'  ,
                                                       'utf8'  )   ;

// Trim leading/trailing whitespace from the input and split it into an array
// of strings, using newline characters as delimiters.
var   Arr   =   (  input.trim   (  )  )  .split   (  "\n"  )   ;

// Enter an infinite loop to process queries until a specific condition is met.
while   (  true  )
{
  // Extract the first element from the 'Arr' array, convert it to a number,
  // and store it in 'n'. The '-0' is a common JavaScript trick to convert to number.
  var   n   =   Arr.shift   (  )   -   0   ;

  // If the value of 'n' is 0, it signifies the end of input, so break the loop.
  if   (  n   ==   0  )
  {
    break   ;
  }

  // Look up the value associated with 'n' (which represents a weight) in the 'obj' object
  // and print it to the console.
  console.log   (  obj   [  n  ]  )   ;
}