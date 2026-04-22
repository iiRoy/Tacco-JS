/*
 * This JavaScript code defines utility functions
 * and a main logic for processing numerical input.
 * It primarily deals with finding multiples within a range
 * and then calculating a final result based on unique multiples.
 */

// Function to eliminate duplicate elements from an array.
// This function efficiently removes any repeated values
// by leveraging the Set data structure.
function   uniq(  array )
{

  // A Set automatically stores only unique values.
  // Converting the input array to a Set, then back to an Array,
  // effectively removes all duplicates.
  return   Array . from(  new   Set(  array )  );

} /* End of uniq function */


// The primary function that orchestrates the main logic
// of the program. It takes an array of strings as input,
// parses them into numbers, performs calculations related to multiples,
// and then prints the final result to the console.
function   Main(  input  )
{
  // Parse the input strings into integer variables.
  // The base-10 radix is explicitly specified for safety.
  var   A   =   parseInt(  input[0],   10  );
  var   B   =   parseInt(  input[1],   10  );
  var   C   =   parseInt(  input[2],   10  );
  var   D   =   parseInt(  input[3],   10  );


  // Calculate the starting multiple index for C.
  // If A is not a multiple of C, we start from the next multiple.
  var   cNum   =   A   %   C   !==   0
                   ?   Math.floor(  A   /   C  )   +   1
                   :   Math.floor(  A   /   C  ) ;

  // Calculate the starting multiple index for D.
  // Similar logic as for C, ensuring we start at or after A.
  var   dNum   =   A   %   D   !==   0
                   ?   Math.floor(  A   /   D  )   +   1
                   :   Math.floor(  A   /   D  ) ;


  // Initialize an empty array to store all calculated multiples.
  var   baisuu   =   [  ] ;


  // Find all multiples of C within the range [A, B].
  // Iterate and add each multiple to the 'baisuu' array.
  while   (  C   *   cNum   <=   B  )
  {
    baisuu.push(  C   *   cNum  ) ;
    cNum++ ; // Increment the multiplier for the next iteration.
  }


  // Find all multiples of D within the range [A, B].
  // These are also added to the same 'baisuu' array.
  while   (  D   *   dNum   <=   B  )
  {
    baisuu.push(  D   *   dNum  ) ;
    dNum++ ; // Move to the next multiple of D.
  }

  // Debugging line (commented out):
  // console.log(  JSON.stringify(  baisuu  )  ) ;


  // Remove any duplicate multiples that might have been added
  // (e.g., numbers that are multiples of both C and D).
  var   uniqArray   =   uniq(  baisuu  ) ;

  // Another debugging line (commented out):
  // console.log(  JSON.stringify(  uniqArray  )  ) ;


  // Calculate the final result:
  // Total numbers in range [A, B] = B - A + 1.
  // Subtract the count of unique multiples of C or D found within this range.
  console.log(  B   -   A   +   1   -   uniqArray.length  ) ;

} /* End of Main function */


// This section handles reading input from standard input,
// processing it, and then invoking the Main function with the prepared data.
Main(
  require(  "fs"  )
    .readFileSync(  "/dev/stdin",   "utf8"  ) // Read input from stdin as UTF-8 string.
    .trim()                                   // Remove leading/trailing whitespace.
    .split(  /\n|\s/  )                       // Split the string by newlines or spaces into an array.
) ; // Call the Main function with the processed input array.