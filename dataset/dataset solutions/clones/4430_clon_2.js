// This function is designed to process a given text string,
// perform some basic parsing, and then execute a specific arithmetic operation.
function ComputeResult(initialStringData) {
  // First, we ensure the input string is free from leading or trailing blank spaces.
  let cleanedString = initialStringData.trim();

  // Next, the cleaned string is divided into components based on space delimiters,
  // and each resulting string part is converted into its numerical equivalent.
  const numericalSequence = cleanedString.split(" ").map(Number);

  // The final step involves computing the sum of the first two numbers
  // from the sequence, each decremented by one, and displaying the result.
  console.info((numericalSequence[0] - 1) + (numericalSequence[1] - 1));
}

// The program's execution begins here.
// It retrieves content from a specified file path using the file system module.
const fileHandlerModule = require("fs"); // Obtain the file system module.
const obtainFileContents = fileHandlerModule.readFileSync; // Alias the method for reading files.

const fileContent = obtainFileContents(
  "/var/data/input.txt", // A different file location for input.
  "utfEight" // Using an alternative string for encoding.
);

ComputeResult(fileContent); // Invoke the primary processing function with the file's content.