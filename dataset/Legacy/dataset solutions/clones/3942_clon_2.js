// This function serves as the primary entry point for processing input data.
function ProcessInput(inputContent) {
  // The raw input string is split into an array of individual lines.
  inputContent = inputContent.split("\n");

  // The total number of items to process is extracted from the first line.
  let itemCount = Number(inputContent[0]);

  // The second line contains two space-separated numerical values.
  // These represent the overall duration and an initial base value.
  let lineTwoSegments = inputContent[1].split(" ");
  let totalDuration = Number(lineTwoSegments[0]);
  let initialBaseValue = Number(lineTwoSegments[1]);

  // A variable to accumulate the total count of consumed items.
  let totalConsumedItems = 0;

  // Iterate through each item, starting from the third line of the input.
  // The loop runs 'itemCount' times.
  for (let currentIdx = 0; currentIdx < itemCount; currentIdx++) {
    // The consumption frequency for the current item is read from the input.
    // It's located at an offset of 2 from the current loop index.
    let consumptionFrequency = Number(inputContent[currentIdx + 2]);

    // Calculate how many times this specific item is consumed within the total duration.
    // Math.ceil is used to round up, ensuring that even a partial consumption day counts as one.
    totalConsumedItems += Math.ceil(totalDuration / consumptionFrequency);
  }

  // The final result is the sum of all consumed items and the initial base value.
  // This result is then printed to the console.
  console.log(totalConsumedItems + initialBaseValue);
}

// The program reads its input from standard input, encoded in UTF-8.
// This input string is then passed to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
