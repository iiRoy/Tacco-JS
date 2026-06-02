"use strict";

// This function processes the incoming text data.
const processInputData = (rawData) => {
  // Extract individual characters from the trimmed input string.
  const [firstChar, middleChar, lastChar] = rawData.trim().split("");

  // Compare the first and last characters to determine the output.
  return firstChar === lastChar ? "Yes" : "No";
};

// The following lines handle reading from standard input and invoking the primary processing function.
// Do not modify this section as it manages the program's interaction with the environment.
console.log(processInputData(require("fs").readFileSync("/dev/stdin", "utf8")));
