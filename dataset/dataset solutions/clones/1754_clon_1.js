/*
 * This JavaScript code processes input data to perform a specific bitwise operation.
 * It's structured as an Immediately Invoked Function Expression (IIFE) that reads
 * from standard input, performs calculations, and prints the result to standard output.
 */

console
  .log // Print the final result to the console.
    (

      function ( args ) // This is the main anonymous function that processes the input.
      {

        // Destructure the input arguments.
        // First, trim any leading/trailing whitespace from the entire input string.
        // Then, split the string into lines based on newline characters.
        // Each line is then mapped:
        //   - Split by spaces to get individual string values.
        //   - Each string value is converted to an integer using the bitwise OR 0 trick.
        // The result is an array where the first element is a single-element array containing N,
        // and the second element is the array 'a' of numbers.
        const [ [ N ] , a ] = args . trim ( ) . split ( '\n' ) . map ( r => r . split ( ' ' ) . map ( v => v | 0 ) ) ;

        // Initialize a variable 'A' with the first element of the array 'a'.
        let A = a [ 0 ] ;

        // Loop through the array 'a' starting from the second element (index 1) up to N-1.
        for (
          let i = 1 ; // Initialize loop counter 'i' to 1.
          i < N ;     // Continue as long as 'i' is less than 'N'.
          i ++        // Increment 'i' after each iteration.
        )
        {
          // Perform a bitwise XOR operation between 'A' and the current element 'a[i]'.
          // The result is stored back into 'A'.
          A ^= a [ i ] ;
        }

        // After the loop, 'A' holds the XOR sum of all elements in 'a'.
        // Now, map each element 'v' in the original array 'a'.
        // For each 'v', calculate 'v XOR A'.
        // Finally, join all the resulting numbers into a single string, separated by spaces.
        return a . map ( v => v ^ A ) . join ( ' ' ) ;

      }

      ( // The IIFE is immediately invoked with the following argument:
        require ( 'fs' ) // Load the Node.js 'fs' (file system) module.
          . readFileSync ( // Use the readFileSync method to synchronously read a file.
            '/dev/stdin' , // Specify the file path as standard input.
            'utf8'         // Specify the encoding as UTF-8.
          )
      )

    ) ; // End of console.log call.