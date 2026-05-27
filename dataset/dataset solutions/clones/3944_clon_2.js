// This function processes the entire input data.
function ProcessInput(rawData) {
  // The input is split by newlines; rawData[0] is the first line, rawData[1] is the second, and so on.
  rawData = rawData.split("\n");

  // The second line (rawData[1]) is further split by spaces to get temporary parts.
  let tempParts = rawData[1].split(" ");

  // Convert the first line to an integer representing the number of people.
  const numPeople = parseInt(rawData[0], 10);

  // Convert the first part of the second line to an integer representing the total days.
  const totalDays = parseInt(tempParts[0], 10);

  // Convert the second part of the second line to an integer, initializing the final result.
  let finalResult = parseInt(tempParts[1], 10);

  // Iterate through each person, starting from the first (index 1).
  for (let idx = 1; idx <= numPeople; idx++) {
    // Check if the total days are perfectly divisible by the value associated with the current person.
    // The value for each person is found in rawData[idx + 1].
    if (totalDays % rawData[idx + 1] === 0) {
      // If perfectly divisible, add the exact division result to the final result.
      finalResult += totalDays / rawData[idx + 1];
    } else {
      // If not perfectly divisible, calculate the quotient.
      let quotientVal = totalDays / parseInt(rawData[idx + 1], 10);
      // Add the floor of the quotient plus one to the final result.
      // This effectively rounds up the division.
      finalResult += Math.floor(quotientVal) + 1;
    }
  }

  // Display the computed final result to the console.
  console.log(finalResult);
}

// Do not modify the code below this line. It handles reading input and calling the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
