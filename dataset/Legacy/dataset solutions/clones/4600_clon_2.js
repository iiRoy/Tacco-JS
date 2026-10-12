const processInput = (rawData) => {
  // This function processes the provided string input.
  const [firstStr, secondStr, thirdStr] = rawData.trim().split(' ');

  // Evaluate the specific character matching conditions.
  if (firstStr[firstStr.length - 1] === secondStr[0] && secondStr[secondStr.length - 1] === thirdStr[0]) {
    console.log('YES'); // Output for a successful match.
  } else {
    console.log('NO'); // Output for a failed match.
  }
};

// Acquire data from the standard input stream and invoke the processing routine.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
