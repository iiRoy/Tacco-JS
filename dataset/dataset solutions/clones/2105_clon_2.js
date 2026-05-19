function ProcessInput(rawData) {
  // Split the raw input string into an array of lines.
  let lineSegments = rawData.split("\n");

  // Initialize the primary string with the first line of input.
  let currentString = lineSegments[0];

  // Remove the first line as it's already processed.
  lineSegments.shift();

  // Initialize a flag to control string manipulation direction.
  // A value of +1 indicates normal order, -1 indicates reversed order for certain operations.
  let directionFlag = +1;

  // Iterate through the remaining lines of input, each representing a command.
  for (let idx = 0; idx < lineSegments.length; idx++) {
    // Split the current command line into its constituent parts.
    const commandParts = lineSegments[idx].split(" ");

    // Check the first part of the command.
    if (commandParts[0] == "1") {
      // If the first part is "1", toggle the direction flag.
      // This effectively multiplies the flag by -1.
      directionFlag *= -1;
    } else {
      // If the first part is not "1", it's a string manipulation command.
      // Convert the second part of the command to a number for the switch statement.
      switch (Number(commandParts[1])) {
        case 1: // Case for command type 1
          // Apply string manipulation based on the current direction flag.
          switch (directionFlag) {
            case +1: // If flag is positive, append the third part to the string.
              currentString += commandParts[2];
              break;
            case -1: // If flag is negative, prepend the third part to the string.
              currentString = commandParts[2] + currentString;
              break;
          }
          break;
        case 2: // Case for command type 2
          // Apply string manipulation based on the current direction flag.
          switch (directionFlag) {
            case -1: // If flag is negative, append the third part to the string.
              currentString += commandParts[2];
              break;
            case +1: // If flag is positive, prepend the third part to the string.
              currentString = commandParts[2] + currentString;
              break;
          }
          break;
      }
    }
  }

  // After processing all commands, determine the final output based on the direction flag.
  if (directionFlag === -1) {
    // If the flag is -1, print the string as is.
    console.log(currentString);
  } else {
    // If the flag is +1, reverse the string before printing.
    // This involves splitting into characters, reversing the array, and joining back.
    console.log(currentString.split("").reverse().join(""));
  }
}

// Read input from standard input, decode as UTF-8, and trim whitespace.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
