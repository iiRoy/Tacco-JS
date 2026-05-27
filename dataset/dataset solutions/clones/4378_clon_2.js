var fileSystemModule = require("fs"); // Import the Node.js file system module.

// Read data from standard input, decode it as UTF-8, and pass it to the primary processing function.
ProcessInputData(fileSystemModule.readFileSync("/dev/stdin", "utf-8"));

/**
 * Processes the raw input string to extract characters at even indices.
 * @param {string} rawData The complete string read from the input source.
 */
function ProcessInputData(rawData) {
  // Split the input by newline, take the first line, and then split it into an array of individual characters.
  let charArray = rawData.split("\n")[0].split("");

  // Initialize an empty string to accumulate the selected characters.
  let resultString = "";

  // Iterate through the character array, incrementing the index by 2 in each step.
  for (let idx = 0; idx < charArray.length; idx += 2) {
    // Append the character at the current even index to the result string.
    resultString += charArray[idx];
  }

  // Output the final constructed string to the console.
  console.log(resultString);
}
