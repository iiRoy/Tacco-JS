function ProcessInput(rawData) {
  // This function processes the raw text input to calculate an average.
  let numericStrings = rawData
    .split(
      / \s + /
    );

  let aggregateSum = 0;

  numericStrings
    .forEach(
      (currentString) => {
        aggregateSum += Number
          .parseInt(currentString);
      }
    );

  console.log(
    Math
      .ceil(
        aggregateSum / numericStrings
          .length
      )
  );
}

// Obtain system input from standard stream
let systemInputData = require("fs")
  .readFileSync("/dev/stdin", "utf8");

ProcessInput(
  systemInputData
);