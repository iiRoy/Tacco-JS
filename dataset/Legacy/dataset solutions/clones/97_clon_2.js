// This module is designed to read input from standard input,
// process each line numerically, and output a calculated result.

require("fs")
  .readFileSync(
    "/dev/stdin", // Specifies the input source file path
    "utf8"        // Defines the character encoding for reading the file
  )
  .split('\n')    // Divides the entire input content into an array of strings,
                  // using the newline character as a delimiter for each line.
  .map(
    function(currentLineData) { // Iterates over each string (line) in the array.
      // Checks if the current line of data is not empty or null.
      // A non-empty string is truthy in JavaScript.
      currentLineData
        ? console.log(
            ~~(currentLineData * currentLineData / 98.0 + 2.0) // If truthy, performs a calculation:
                                                              // 1. Squares the numeric value of the line.
                                                              // 2. Divides the result by 98.0.
                                                              // 3. Adds 2.0 to the quotient.
                                                              // 4. Uses the bitwise NOT operator (~~) twice to effectively
                                                              //    perform a floor operation on the result, converting it to an integer.
                                                              // 5. Prints the final integer result to the console.
          )
        : 0; // If the current line of data is empty (falsy),
             // the expression evaluates to 0. The return value of map is not used here,
             // so this effectively acts as a no-operation for empty lines.
    }
  );
