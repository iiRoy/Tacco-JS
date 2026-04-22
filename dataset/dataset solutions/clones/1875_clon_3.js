const accumulateAttributes = (itemCollection = []) => {
  // Guard clause: If no items are provided or the collection is empty, there's nothing to accumulate.
  if (itemCollection.length === 0) {
    return null; // Return null to indicate no valid aggregation.
  }

  // Initialize the combined statistics with a deep copy of the first item's attributes.
  // This prevents unintended modification of the original item data during the summation process.
  let cumulativeVector = [...itemCollection[0]];

  // Iterate through the remaining items in the collection, starting from the second item.
  for (let itemIndex = 1; itemIndex < itemCollection.length; itemIndex++) {
    const currentItemAttributes = itemCollection[itemIndex];

    // Added robustness check: Ensure the current item has attributes and its structure
    // matches the cumulative vector before attempting to merge. If not, log a warning
    // and skip this item to prevent errors.
    if (!currentItemAttributes || currentItemAttributes.length !== cumulativeVector.length) {
      console.warn("Inconsistent item attribute length detected. Skipping item at index", itemIndex, currentItemAttributes);
      continue; // Move to the next item in the collection.
    }

    // Add each attribute from the current item to its corresponding attribute in the cumulative vector.
    // This assumes a fixed order and meaning for attributes (e.g., cost, skill1, skill2...).
    for (let attributeIndex = 0; attributeIndex < cumulativeVector.length; attributeIndex++) {
      cumulativeVector[attributeIndex] += currentItemAttributes[attributeIndex];
    }
  }

  return cumulativeVector; // Return the array representing the combined attributes (total cost, total skills).
};

const processBookSelection = (rawProblemData) => {
  // Parse the raw input string: trim whitespace and split into individual lines.
  const problemLines = rawProblemData.trim().split("\n");

  // Extract configuration parameters from the first line of input.
  // These parameters define the problem's scope:
  // totalBooks: The total number of available books.
  // skillCategories: The number of distinct skill types. (M in original, not directly used in logic beyond array sizing).
  // requiredProficiency: The minimum score needed for each skill category.
  const [numBooksStr, numSkillsStr, minProficiencyStr] = problemLines[0].split(" ");
  const totalBooks = parseInt(numBooksStr, 10);
  const skillCategories = parseInt(numSkillsStr, 10);
  const requiredProficiency = parseInt(minProficiencyStr, 10);

  // Populate the book catalogue. Each entry typically contains [cost, skill1_level, skill2_level, ...].
  const bookCatalogue = [];
  for (let bookIdx = 1; bookIdx <= totalBooks; bookIdx++) {
    // Convert each numeric string in the line to an actual number using the concise `Number` constructor.
    bookCatalogue.push(problemLines[bookIdx].split(" ").map(Number));
  }

  // Initialize the minimum cost found so far to the largest possible safe integer.
  // This acts as a clear sentinel value, indicating that no valid solution has been found yet.
  let minimumOverallCost = Number.MAX_SAFE_INTEGER;

  // Define a helper function to verify if all skill levels in a given vector meet a target threshold.
  const areSkillLevelsSufficient = (proficiencyVector, targetLevel) => {
    // If the proficiency data is invalid or empty, it cannot meet requirements.
    if (!proficiencyVector || proficiencyVector.length === 0) {
      return false;
    }
    // Use `every` to check if all elements in the vector are greater than or equal to the target.
    return proficiencyVector.every((skillLevel) => skillLevel >= targetLevel);
  };

  // Main loop: Iterate through all possible combinations (subsets) of books.
  // A bitmask `combinationMask` is used, where each bit represents the inclusion
  // or exclusion of a book from the current subset. `1 << totalBooks` generates 2^N combinations.
  for (let combinationMask = 0; combinationMask < (1 << totalBooks); combinationMask++) {
    const selectedBookDetails = []; // This array will store the details of books chosen for the current combination.

    // Inner loop: Determine which books are included in the current combination based on the bitmask.
    for (let bookIndex = 0; bookIndex < totalBooks; bookIndex++) {
      // Check if the `bookIndex`-th bit is set in the `combinationMask`.
      // `(combinationMask >> bookIndex) & 1` is an efficient way to do this.
      if ((combinationMask >> bookIndex) & 1) {
        selectedBookDetails.push(bookCatalogue[bookIndex]);
      }
    }

    // Guard clause: If no books were selected in this combination (e.g., empty subset), skip further processing.
    if (selectedBookDetails.length === 0) {
      continue;
    }

    // Aggregate the cost and skill levels for the currently selected books using the helper function.
    // The result is an array where the first element is the total cost, and subsequent elements are skill totals.
    const aggregatedStats = accumulateAttributes(selectedBookDetails);

    // Ensure the aggregation was successful and returned a non-empty result.
    if (aggregatedStats && aggregatedStats.length > 0) {
      const totalCombinedCost = aggregatedStats[0]; // The first element of the aggregated data is always the cost.
      // Extract the skill levels from the aggregated data (all elements after the cost).
      const combinedSkillLevels = aggregatedStats.slice(1);

      // Check if these combined skill levels meet the minimum required proficiency for all categories.
      if (areSkillLevelsSufficient(combinedSkillLevels, requiredProficiency)) {
        // If requirements are met, update the minimum overall cost if this combination is cheaper than previous ones.
        minimumOverallCost = Math.min(minimumOverallCost, totalCombinedCost);
      }
    }

    // NOTE: The original code contained a redundant block here that re-initialized `bookCatalogue`
    // within every iteration of the main loop. This block was dead code as `bookCatalogue`
    // was only used as a constant reference initialized before this loop. It has been removed.
  }

  // Output the final result.
  if (minimumOverallCost === Number.MAX_SAFE_INTEGER) {
    // If `minimumOverallCost` is still the sentinel value, it means no valid combination was found.
    console.log("-1");
  } else {
    // Otherwise, print the lowest cost found that satisfies all skill requirements.
    console.log(minimumOverallCost);
  }
};

// Read input from standard input (e.g., from a file or piped data) and execute the solution.
processBookSelection(require("fs").readFileSync("/dev/stdin", "utf8"));