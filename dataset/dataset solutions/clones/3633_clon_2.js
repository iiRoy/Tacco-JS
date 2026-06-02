function ProcessInput(val) {
  // The incoming string value is first cleaned of any surrounding whitespace.
  // After trimming, it's converted into an integer for numerical evaluation.
  val = parseInt(val.trim());

  // We now proceed to categorize the integer based on predefined thresholds.
  if (val < 1200) {
    // If the numerical value is strictly less than 1200, output "ABC".
    console.log("ABC");
  } else if (val >= 1200 && val < 2800) {
    // If the value is 1200 or greater, but less than 2800, output "ARC".
    console.log("ARC");
  } else {
    // For all other cases, meaning the value is 2800 or higher, output "AGC".
    console.log("AGC");
  }
}

// The application initiates by reading the complete content from standard input.
// This content is expected to be a UTF-8 encoded string, which is then
// passed as an argument to our main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
