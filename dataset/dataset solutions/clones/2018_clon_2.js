function ProcessInput(rawData) {
  // Split the incoming raw data by newline characters to get an array of lines.
  let lineData = rawData.split("\n");

  // Extract the first line and then split it into an array of individual characters.
  const charSequence = lineData[0].split("");

  // Evaluate the first condition: check if the character at index 2 matches the character at index 3.
  if (charSequence[2] === charSequence[3]) {
    // If the first condition is true, proceed to evaluate the second condition.
    // Check if the character at index 4 matches the character at index 5.
    if (charSequence[4] === charSequence[5]) {
      // If both conditions are met, output "Yes" to the console.
      console.log("Yes");
    } else {
      // If the first condition is met but the second is not, output "No" to the console.
      console.log("No");
    }
  }
  // If the initial condition (charSequence[2] === charSequence[3]) is false,
  // no output is produced, mirroring the original logic.
}

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
