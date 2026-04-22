var main  =  standardInput  =>  {
  // This function processes the input string.

  var ary  =  standardInput
    .split(
      " "  // Splitting the input by spaces.
    )
  ;

  /*
   * The 'map' method is used here to transform each
   * element of the array from a string to an integer.
   * 'parseInt' with radix 10 ensures correct number parsing.
   */
  ary  =  ary
    .map(
      ( v )  =>  {

        return  parseInt(
          v,  // The current string element.
          10  // The radix (base) for parsing.
        );

      }
    )
  ;

  // Now, we evaluate the conditions based on the parsed numbers.

  if  (
      ary[0]  <  ary[2]
      &&
      ary[2]  <  ary[1]
  )
  {
    // If the numbers are in ascending order: a < c < b
    console.log(
      "Yes"
    );
  }
  else  if  (
      ary[0]  >  ary[2]
      &&
      ary[2]  >  ary[1]
  )
  {
    // If the numbers are in descending order: a > c > b
    console.log(
      "Yes"
    );
  }
  else
  {
    // For all other cases, the condition is not met.
    console.log(
      "No"
    );
  }

};  // End of the main function definition.

/*
 * This line reads the input from standard input,
 * typically used in competitive programming environments.
 * The 'fs' module is used for file system operations.
 */
main(
  require( "fs" )
    .readFileSync(
      "/dev/stdin",  // Path to the standard input stream.
      "UTF-8"        // Specifies the character encoding.
    )
);

// The program execution concludes here.