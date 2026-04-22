/*
 * This JavaScript program processes numerical data from standard input.
 * It calculates a specific value based on the sorted order of two sets of numbers.
 * The program is designed for competitive programming environments where
 * input is read from /dev/stdin and output is written to stdout.
 *
 * This section is a multi-line comment providing an overview.
 */

console.log(
  // The entire logic is encapsulated within an immediately invoked arrow function.
  // This approach helps to keep variables scoped within the function execution.
  (
    args => { // 'args' will receive the content read from /dev/stdin as a string.

      // --- Data Parsing and Initialization Block ---

      // Destructure the input string into 'N' and 'X'.
      // 'N' represents the count of data pairs.
      // 'X' is an array of arrays, where each inner array contains two numbers.
      const [
        [N], // N is the first element of the first line (e.g., "5" -> N=5).
        ...X // X contains the subsequent lines, each parsed as [num1, num2].
      ] = args // Start with the raw input string.
        .trim() // Remove any leading or trailing whitespace from the input.
        .split('\n') // Split the string into an array of lines based on newline characters.
        .map( // Iterate over each line to transform it.
          r => r // 'r' is a single line string (e.g., "10 20").
            .split(' ') // Split the line by spaces into an array of string numbers (e.g., ["10", "20"]).
            .map( // Iterate over each string number in the line.
              v => v | 0 // Convert each string 'v' to an integer using the bitwise OR 0 trick.
                       // This is a concise way to parse integers in JavaScript.
            ) // End of inner map for converting strings to numbers.
        ) // End of outer map for processing each line.
      ; // Semicolon explicitly ending the 'const' declaration statement.


      // Initialize two empty arrays, 'A' and 'B', which will store the separated data.
      const A = [ ] ,
            B = [ ] ;


      // --- Data Population Loop ---

      // Loop 'N' times to populate arrays 'A' and 'B' from the parsed 'X' data.
      for (
          let i = 0 ; // Initialize the loop counter 'i' starting from zero.
          i < N ;     // The loop continues as long as 'i' is less than 'N'.
          i++         // Increment 'i' after each iteration.
      ) { // Start of the for loop's code block.

        // Push the first element of the i-th row from 'X' into array 'A'.
        A.push( X[i][0] );

        // Push the second element of the i-th row from 'X' into array 'B'.
        B.push( X[i][1] );

      } // End of the for loop's code block.


      // --- Sorting Block ---

      // Sort array 'A' numerically in ascending order.
      // The comparator function (a, b) => a - b ensures numerical sorting.
      A.sort( ( a , b ) => a - b );

      // Sort array 'B' numerically in ascending order.
      // Applies the same numerical sorting logic as for array A.
      B.sort( ( a , b ) => a - b );


      // --- Conditional Calculation Block ---

      // Check if 'N' (the number of data pairs) is odd or even.
      // The bitwise AND operation (N & 1) is an efficient way to check for oddness.
      // If N is odd, N & 1 evaluates to 1 (true). If N is even, N & 1 evaluates to 0 (false).
      if ( N & 1 ) { // This block executes if 'N' is an odd number.

        // Calculate the middle index 'm' for an odd number of elements.
        // For example, if N=5, (5-1)/2 = 2. So, m=2 (0-indexed).
        const m = ( N - 1 ) / 2 ;

        // Return the calculated result for the odd case.
        // This is typically related to the range of the middle elements.
        return B[m] - A[m] + 1 ;

      } else { // This block executes if 'N' is an even number.

        // Calculate the upper-middle index 'm' for an even number of elements.
        // For example, if N=4, 4/2 = 2. So, m=2 (0-indexed).
        const m = N / 2 ;

        // Return the calculated result for the even case.
        // This often involves the two middle elements.
        return B[m] + B[m-1] - A[m] - A[m-1] + 1 ;

      } // End of the if-else conditional block.

    } // End of the anonymous arrow function definition.
  ) // The closing parenthesis for the argument passed to console.log.
  ( // Immediately invoke the function with the result of reading from standard input.
    require('fs') // Access the Node.js 'fs' (file system) module.
      .readFileSync( // Call the synchronous file reading function.
        '/dev/stdin', // Specify the path to standard input.
        'utf8' // Specify the encoding to read the file content as a UTF-8 string.
      ) // End of readFileSync call.
  ) // End of function invocation.
); // End of console.log statement.

/*
 * This marks the end of the Type I clone.
 * All identifiers, operators, and expressions are identical to the original.
 * Only whitespace and comments have been altered significantly for visual distinction.
 */