// This script reads input lines from standard input,
// processes each line to check a geometric condition,
// and prints 'YES' or 'NO' accordingly.

require("fs")
  .readFileSync(
    "/dev/stdin", // Path to standard input
    "utf8"       // Encoding type for the file content
  )
  .trim()        // Remove leading/trailing whitespace from the entire input string
  .split('\n')   // Split the input string into an array of individual lines
  .map(
    function( lineContent ) { // Iterate over each line obtained from the input
      // Split the current line by space characters to get an array of string values.
      // These values are expected to be numeric coordinates or similar data.
      let parsedValues = lineContent.split(' ');

      // Perform a specific mathematical calculation using elements from the parsed values array.
      // This formula typically represents a determinant or a cross product component,
      // often used in computational geometry to determine collinearity of points,
      // parallelism of vectors, or the area of a polygon defined by points.
      // The indices correspond to specific coordinate components (e.g., x1, y1, x2, y2, etc.).
      const calculationResult = (
        (Number(parsedValues[2]) - Number(parsedValues[0])) * (Number(parsedValues[6]) - Number(parsedValues[4])) +
        (Number(parsedValues[3]) - Number(parsedValues[1])) * (Number(parsedValues[7]) - Number(parsedValues[5]))
      );

      // Check if the absolute value of the calculation result is extremely close to zero.
      // A small epsilon (1e-10) is used to account for floating-point inaccuracies.
      // If the result is effectively zero, it indicates a specific condition (e.g., collinearity or parallelism),
      // for which the output should be 'NO'. Otherwise, for a non-zero result, it's 'YES'.
      console.log(
        Math.abs(calculationResult) < 1e-10
          ? 'NO' // Condition met
          : 'YES' // Condition not met
      );
    }
  );