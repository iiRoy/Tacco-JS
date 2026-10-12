function ProcessInput(rawData) {
  // Split the raw input string into an array of lines.
  rawData = rawData.split("\n");

  // Parse the first line to get the number of books, skills, and required skill level.
  const firstLineParts = rawData[0].split(' ');
  const numBooks = parseInt(firstLineParts[0], 10); // N
  const numSkills = parseInt(firstLineParts[1], 10); // M
  const requiredSkillLevel = parseInt(firstLineParts[2], 10); // X

  // Initialize arrays to store book costs and skill levels.
  let bookCosts = []; // c
  let bookSkillLevels = []; // a

  // Temporary variable to hold parsed values from each line.
  let currentLineValues;

  // Loop through the remaining lines to populate book costs and skill levels.
  for (let bookIdx = 1; bookIdx < rawData.length; bookIdx++) {
    // Split the line by space and convert elements to numbers.
    currentLineValues = rawData[bookIdx].split(' ').map(element => Number(element));

    // The first element is the cost of the book.
    bookCosts.push(currentLineValues[0]);

    // Remove the cost, remaining elements are skill levels.
    currentLineValues.shift();

    // Add a copy of the skill levels array for the current book.
    bookSkillLevels.push([...currentLineValues]);
  }

  // Initialize an array to track which books are selected for a combination.
  let selectedBooks = new Array(numBooks); // isBought
  selectedBooks.fill(false);

  // Initialize the minimum cost found so far to a very large value.
  let minimumCost = Infinity; // min

  // This loop iterates through all possible combinations of buying books.
  // It simulates a binary counter from 0 to 2^numBooks - 1.
  combinationLoop: // loop1
  do {
    // Increment the binary counter (selectedBooks array).
    for (let bookIndex = 0; bookIndex < numBooks; bookIndex++) {
      if (selectedBooks[bookIndex]) {
        selectedBooks[bookIndex] = false;
      } else {
        selectedBooks[bookIndex] = true;
        break; // Move to the next combination check
      }
    }

    // Check if the current combination of selected books meets all skill requirements.
    for (let skillIndex = 0; skillIndex < numSkills; skillIndex++) {
      let currentSkillSum = 0; // temp

      // Calculate the total skill level for the current skill across selected books.
      for (let bookCheckIndex = 0; bookCheckIndex < numBooks; bookCheckIndex++) {
        if (selectedBooks[bookCheckIndex]) {
          currentSkillSum += bookSkillLevels[bookCheckIndex][skillIndex];
        }
      }

      // If any skill requirement is not met, this combination is invalid.
      if (currentSkillSum < requiredSkillLevel) {
        continue combinationLoop; // Skip to the next book combination
      }
    }

    // If all skill requirements are met, calculate the total cost for this combination.
    let currentCombinationCost = 0; // temp
    for (let bookCostIndex = 0; bookCostIndex < numBooks; bookCostIndex++) {
      if (selectedBooks[bookCostIndex]) {
        currentCombinationCost += bookCosts[bookCostIndex];
      }
    }

    // Update the minimum cost if the current combination is cheaper.
    if (minimumCost > currentCombinationCost) {
      minimumCost = currentCombinationCost;
    }

  // The loop continues as long as there is at least one book selected (true in selectedBooks).
  // When all selectedBooks are false, it means all combinations have been processed.
  } while (!selectedBooks.every(element => !element));

  // Output the result. If no combination met the criteria, output -1.
  console.log(minimumCost === Infinity ? -1 : minimumCost);
}

// The following lines handle standard input/output and should not be modified.
// This part ensures the script can be run in an environment like AtCoder.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
