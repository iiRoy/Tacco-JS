// This function serves as the primary entry point for processing input data.
function ProcessInput(rawData) {
  // The raw input string is split into an array of individual lines.
  let lines = rawData.split("\n");

  // From the first line, extract two integer values.
  // The first number on the first line is assigned to numK.
  let numK = parseInt(lines[0].split(" ")[0]);
  // The second number on the first line is assigned to numT.
  let numT = parseInt(lines[0].split(" ")[1]);

  // The second line of input is processed to create an array of numbers.
  // It's split by spaces, and each part is converted to an integer.
  let dataArray = lines[1].split(" ").map((element, idx) => {
    // Convert the string element to its integer representation.
    return parseInt(element);
  });

  // Sort the array in descending order.
  // The largest element will be at index 0 after this operation.
  dataArray.sort((valA, valB) => {
    // If valA is less than valB, valA should come after valB (descending order).
    return valA < valB;
  });

  // Calculate the final result using a specific formula.
  // This involves the largest element (dataArray[0]), the sum of all elements,
  // and then taking the maximum of this calculated value and zero.
  console.log(Math.max.apply(null, [2 * dataArray[0] - 1 - dataArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0), 0]));
}

// The program reads its input from standard input using Node.js file system module.
// The content is read synchronously and encoded as UTF-8, then passed to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
