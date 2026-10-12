function ProcessInput (rawData) {
  // Split the raw input string by space to get individual values.
  // The first part represents the maximum allowed value.
  let limitValue = rawData.split(" ")[0];

  // The second part represents the current observed value.
  let currentWeight = rawData.split(" ")[1];

  // Compare the two values. JavaScript's '>' operator will perform
  // an implicit type conversion from string to number for this comparison.
  if (currentWeight > limitValue) {
    // If the current weight exceeds the limit, it's considered safe.
    console.log("safe");
  } else {
    // Otherwise, if it's within or equal to the limit, it's unsafe.
    console.log("unsafe");
  }
}

// Read the entire content from standard input, decode it as UTF-8,
// and then pass it to our main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
