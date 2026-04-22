function Main(  input   ) {
  // This function processes the input according to the problem specification.
  // It handles multiple test cases embedded within a single input string.

  // Split the entire input string into an array of lines.
  // Each element in 'input' array now corresponds to a single line from the original input.
  input = input.split(  "\n"  );

  // Initialize loop counter for iterating through test cases.
  // Each test case consists of two lines: N and the array elements.
  for (  i = 0;   i < input.length;   i = i + 2   ) {
    /*
     * For the current test case:
     *   - input[i] contains the integer N.
     *   - input[i+1] contains the string of digits for the array 'a'.
     */

    // Parse the integer N from the current line of input.
    var N = parseInt(  input[i]  );

    // Take the next line, which is a string of digits, and split it into an array of individual characters.
    var a = input[i+1].split(  ""  ); // Example: "123" becomes ["1", "2", "3"]

    // Convert the array of character digits into an array of actual numbers.
    // The 'Number' constructor is used as the mapping function.
    var aa = a.map(  Number  ); // Example: ["1", "2", "3"] becomes [1, 2, 3]

    // This is the main simulation loop, which performs the sequence of operations N-1 times.
    // The loop variable 'j' starts from N and decrements until it is no longer greater than 1.
    for (  j = N;   j > 1;   j--   ) {
      // The inner loop iterates 'j' times for each value of 'j' in the outer loop.
      for (  k = 0;   k < j;   k++   ) {
        // Calculate the absolute difference between the first two elements of the 'aa' array.
        var e = Math.abs(  aa[0]  -  aa[1]  ); // e.g., if aa=[5, 2, 8], e = |5-2| = 3

        // Add the calculated difference 'e' to the end of the 'aa' array.
        aa.push(  e  );

        // Remove the first element from the 'aa' array.
        aa.shift(  ); // This effectively moves the window of consideration.
      }
      // After the inner loop completes, remove the last element from the 'aa' array.
      // This step is crucial for reducing the array size for the next iteration of the outer loop.
      aa.pop(  );
    }

    // After all iterations, only one element should remain in the 'aa' array.
    // Print this final remaining element to standard output.
    console.log(  aa[0]  ); // This is the result for the current test case.
  }
}

// Read the entire content of standard input synchronously.
// "/dev/stdin" is the standard input file path on Unix-like systems.
// "utf8" specifies the character encoding.
// The read content is then passed as the 'input' argument to the Main function.
Main(  require("fs").readFileSync(  "/dev/stdin",   "utf8"  )  ); // Execute the primary function.