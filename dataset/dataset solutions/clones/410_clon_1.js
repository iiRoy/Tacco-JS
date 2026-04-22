/*
 * This is a Type I clone of the original JavaScript code.
 * It implements a permutation generation algorithm and then uses it
 * to solve a scheduling-related problem based on input data.
 *
 * Changes are limited to whitespace (indentation, spacing, blank lines)
 * and comments (addition, modification).
 * All identifiers, operators, and expressions remain precisely as they were.
 */


function permute( permutation )
{
  // Initialize variables for the permutation generation using Heap's algorithm.
  var length = permutation.length,
      result = [ permutation.slice() ], // Store the initial permutation.
      c      = new Array( length ).fill( 0 ), // Control array for the algorithm.
      i      = 1,
      k,
      p;

  // Loop until all permutations are generated.
  while (i < length)
  {
    // Check if the current element needs to be swapped.
    if (c[i] < i)
    {
      // Determine the swap index based on parity of 'i'.
      k = i % 2 && c[i];

      // Perform the swap operation.
      p = permutation[i];
      permutation[i] = permutation[k];
      permutation[k] = p;

      // Increment the control array and reset 'i'.
      ++c[i];
      i = 1;

      // Add the new permutation to the result set.
      result.push( permutation.slice() );
    }
    else
    {
      // Reset control array element and move to the next 'i'.
      c[i] = 0;
      ++i;
    }
  }

  // Return the array of all generated permutations.
  return result;
}


// Pre-calculate permutations for array lengths up to 10 for efficiency.
var allArr = [ 0 ]; // Placeholder for length 0, indices correspond to array length.

// Loop to generate permutations for different array sizes.
for ( var i = 0; i < 10; i++ )
{
   var arr = []; // Temporary array to be permuted.

   // Populate the array with sequential numbers.
   for ( var j = 0; j < i + 1; j++ )
   {
      arr.push( j );
   }

   // Store the permutations for the current array length.
   allArr[ i + 1 ] = permute( arr );
}


// Read input from standard input.
var input = require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' );

// Process input: trim whitespace and split by newlines.
var arr = input.trim().split( "\n" );

// Main processing loop.
while ( true )
{
   // Read the number of items for the current test case.
   var n = arr.shift() - 0; // Convert to number.

   // If n is 0, it signifies the end of input.
   if ( n == 0 )
   {
     break;
   }

   // Array to store the parsed items for the current test case.
   var nww = [];

   // Read 'n' lines of item data.
   for ( var i = 0; i < n; i++ )
   {
     nww[ i ] = arr.shift().split( " " );
   }

   // Map the raw string data to a structured format: [name, value1, value2].
   // Convert value1 and value2 to numbers.
   nww = nww.map( v => [ v[ 0 ], v[ 1 ] - 0, v[ 2 ] - 0 ] );

   // Retrieve all permutations for 'n' items from the pre-calculated array.
   var all = allArr[ n ];

   // Initialize max ratio and best permutation.
   var max = 0;
   var ans = "";

   // Iterate through all possible permutations.
   for ( var k = 0; k < all.length; k++ )
   {
      var v = all[ k ]; // Current permutation.

      var flag = true; // Flag to check if the permutation is valid.
      var sum  = 0;     // Accumulator for value1.
      var g    = 0;     // Accumulator for weighted value1.

      // Iterate through items in the current permutation.
      for ( var j = 0; j < v.length; j++ )
      {
         var i = v[ j ]; // Index of the original item.

         // Check if the accumulated sum exceeds the item's limit (value2).
         if ( sum > nww[ i ][ 2 ] )
         {
            flag = false; // Invalid permutation.
            break;        // Exit inner loop.
         }

         // Update sums.
         sum += nww[ i ][ 1 ];
         g   += nww[ i ][ 1 ] * ( j + 1 );
      }

      // If the permutation is valid and yields a better ratio, update max and ans.
      if ( flag && g / sum > max )
      {
         max = g / sum;
         ans = v;
      }
   }

   // Output the names of the items in the best permutation, reversed and joined by newlines.
   console.log( ans.map( v => nww[ v ][ 0 ] ).reverse().join( "\n" ) );
}
// End of the main processing loop.
/*
 * This marks the end of the cloned JavaScript code.
 * The program successfully found the optimal permutation based on the problem's criteria.
 */