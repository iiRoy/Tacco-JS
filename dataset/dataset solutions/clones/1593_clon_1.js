const Main = ( input ) => {
  // This is the primary function responsible for processing the given input.
  // It takes a single string 'input' as its argument.

  const line = input . split ( '\n' ) ; // Divide the input string into an array of lines based on newline characters.
                                     // The first element of this array typically contains the relevant data.

  /*
   * The 'weathers' constant will store an array of individual
   * characters, each representing a weather condition.
   * We take the first line of the input, ensure it's a string,
   * and then split it into its constituent characters.
   */
  const weathers = line [ 0 ] . toString () . split ( '' ) ;

  let count = 0 ; // Initialize a counter variable to keep track of a specific pattern.
                   // The counter starts at zero and will be incremented under certain conditions.

  // The 'reduce' method is used here to iterate over the 'weathers' array.
  // It accumulates a single value (though in this case, it's used for side effects on 'count').
  weathers . reduce (
    ( prev , wether ) => { // This is the callback function executed for each element in 'weathers'.
                          // 'prev' is the accumulator (the value returned from the previous iteration).
                          // 'wether' is the current element being processed.

      // Check for a specific sequence of weather conditions.
      // If the previous weather character was 'R' AND the current weather character is also 'R',
      // then we increment our counter. This identifies consecutive 'R's.
      if (
        prev === 'R'
        &&
        wether === 'R'
      ) {
        count ++ ; // Increment the counter if the condition is met.
      }

      // This condition checks for the very first 'R' in the sequence.
      // If 'prev' is an empty string (meaning this is the first iteration) AND
      // the current weather character 'wether' is 'R', we increment the counter.
      if ( prev === '' && wether === 'R' ) {
        count ++ ; // Increment the counter for the initial 'R'.
      }

      // The current weather character ('wether') becomes the 'prev' (accumulator)
      // for the next iteration of the reduce function.
      return wether ;
    } ,
    '' // This is the initial value for the 'prev' accumulator when reduce starts.
       // An empty string is used to correctly identify the first character.
  ) ; // End of the reduce method call.

  // After the entire 'weathers' array has been processed,
  // the final value of 'count' is printed to the console.
  console . log ( count ) ;
} ; // End of the Main function definition.

// This part of the code handles reading the input from standard input.
// It uses Node.js's 'fs' module to read the file synchronously.
Main (
  require ( 'fs' ) // Access the Node.js file system module.
    . readFileSync ( // Use the synchronous file reading function.
      '/dev/stdin' , // Specify the path to standard input (common on Unix-like systems).
      'utf8' // Define the character encoding for the input file.
    )
) ; // Call the 'Main' function with the content read from standard input.