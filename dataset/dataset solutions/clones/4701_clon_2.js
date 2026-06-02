function ProcessInput(rawData) {
  // The incoming raw data string is first split into an array of individual lines.
  let processedLines = rawData.split("\n");

  // From the very first line, we extract the initial numeric component.
  // The `- 0` idiom ensures the string is converted into a numerical type.
  const firstVal = processedLines[0].split(" ")[0] - 0;

  // Subsequently, we extract the second numeric component from the same initial line.
  const secondVal = processedLines[0].split(" ")[1] - 0;

  // A conditional check is performed to determine the appropriate calculation path.
  if (firstVal * 2 >= secondVal) {
    // If the condition holds true, a specific calculation is executed, and its result is displayed.
    console.log(Math.floor(secondVal / 2));
    // The function then terminates its execution.
    return;
  }

  // Should the initial condition not be met, an alternative calculation is performed.
  // The outcome of this calculation is then outputted to the console.
  console.log(firstVal + Math.floor((secondVal - firstVal * 2) / 4));
}

// This segment of the code is responsible for handling standard input and invoking the primary processing function.
// It is crucial that this part remains unaltered to maintain compatibility with the execution environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
