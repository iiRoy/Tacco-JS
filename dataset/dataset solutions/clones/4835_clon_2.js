const rawData = require("fs").readFileSync("/dev/stdin", "utf8"); // Read all input data

const tokenizedStrings = rawData.split(' '); // Split the raw data into individual strings based on space delimiter

tokenizedStrings.forEach(currentString => {
  // For each string obtained from the split operation,
  // print its very first character to the console.
  console.log(currentString[0]);
});
