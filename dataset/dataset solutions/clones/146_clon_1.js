// This script processes input from standard input.
// It reads the entire content, then splits it into blocks.

require(
    "fs" // Import the 'fs' (file system) module.
)
  .readFileSync(
    "/dev/stdin", // Specify the input source as standard input.
    "utf8"       // Define the character encoding for reading the file.
  )
  .trim() // Remove leading and trailing whitespace from the entire input string.
  .split('\n\n') // Split the input string into an array of substrings, using two newline characters as the delimiter.
  .map(
    // Iterate over each block of input.
    function(i) {
      // Declare a variable 'c' to store the processed string for the current block.
      // This variable will hold a version of 'i' with all whitespace removed.
      c = i
        .replace(
          /\s/g, // Regular expression to match all whitespace characters globally.
          ''     // Replace matched whitespace with an empty string, effectively removing all whitespace.
        )
        .split('') // Split the string into an array of individual characters.
        .join(''); // Join the array of characters back into a single string, effectively creating a compact string.

      // Log the result based on a series of conditional checks (ternary operators).
      // This forms a decision tree to classify the processed string 'c' based on specific substrings.
      console.log(
        c.indexOf("1111")     != -1   // Check if "1111" exists within 'c'.
          ? "C"                       // If "1111" is found, output "C".
          : c.indexOf("111")   != -1   // Else, check if "111" exists within 'c'.
            ? "F"                       // If "111" is found, output "F".
            : c.indexOf("1101")  != -1   // Else, check if "1101" exists within 'c'.
              ? "D"                       // If "1101" is found, output "D".
              : c.indexOf("101")   != -1   // Else, check if "101" exists within 'c'.
                ? "B"                       // If "101" is found, output "B".
                : c.indexOf("1000001") != -1   // Else, check if "1000001" exists within 'c'.
                  ? "G"                       // If "1000001" is found, output "G".
                  : c.indexOf("10000001") != -1   // Else, check if "10000001" exists within 'c'.
                    ? "A"                       // If "10000001" is found, output "A".
                    : "E"                       // If none of the above substrings are found, default to outputting "E".
      ); // End of console.log statement.
    } // End of the anonymous function passed to .map().
  ); // End of the .map() method invocation.

// The script finishes execution after processing all input blocks.