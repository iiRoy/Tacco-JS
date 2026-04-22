'use strict' // Enforces strict parsing and error handling for cleaner code.

// Function designed to process input data for a study plan optimization problem.
// It aims to find the minimum cost to acquire a set of skills by purchasing various study materials.
const evaluateStudyPlan = (rawDataBlob) => {
  // --- Input Validation and Initial Parsing ---
  // A preliminary check to ensure the input data is not empty or malformed.
  if (!rawDataBlob || typeof rawDataBlob !== 'string' || rawDataBlob.trim() === '') {
    console.error("Error: The provided input data is null, not a string, or completely empty.");
    return -1; // Indicates an unresolvable issue with the input.
  }

  // Normalize and split the raw text into individual lines for easier processing.
  // Using a regex for newlines handles both Unix (`\n`) and Windows (`\r\n`) line endings.
  const dataLines = rawDataBlob.trim().split(/\r?\n/);

  // Validate that there's at least one line of data after trimming.
  if (dataLines.length === 0) {
    console.error("Error: No valid lines of text were found in the input data after processing.");
    return -1;
  }

  // Parse the core parameters from the very first line of the input.
  // These parameters define the scope of the problem:
  // totalBooksAvailable: The count of distinct study materials.
  // numSkillCategories: The number of different skill types to be learned.
  // minimumSkillRequirement: The target level for each skill category.
  const firstLineElements = dataLines[0].split(' ').map(Number);

  const totalBooksAvailable = firstLineElements[0];
  const numSkillCategories = firstLineElements[1];
  const minimumSkillRequirement = firstLineElements[2];

  // Comprehensive validation for the primary numerical parameters.
  // Ensures they are valid numbers and meet logical constraints (e.g., positive counts).
  if (firstLineElements.some(isNaN) || firstLineElements.length !== 3 ||
      totalBooksAvailable <= 0 || numSkillCategories <= 0 || minimumSkillRequirement < 0) {
    console.error("Error: Initial parameters (N, M, X) are invalid or out of expected range.");
    return -1;
  }

  // --- Data Structure for Study Materials ---
  // An array to hold structured information about each available study material.
  // Each material will be an object containing its cost and the expertise it provides.
  const availableStudyMaterials = [];

  // Iterate through the remaining lines of the input to populate the study materials catalog.
  // The loop starts from the second line (index 1) up to `totalBooksAvailable`.
  for (let materialIndex = 1; materialIndex <= totalBooksAvailable; materialIndex++) {
    const currentMaterialLine = dataLines[materialIndex];

    // Validate the presence of data for the current material.
    if (!currentMaterialLine) {
      console.error(`Error: Data line for material at index ${materialIndex} is missing or empty.`);
      return -1;
    }

    // Parse the numerical values for the current material: its price followed by skill levels.
    const materialValueArray = currentMaterialLine.split(' ').map(Number);

    // Validate the parsed values for the current material.
    // Checks if all values are numbers and if the array length matches expectations (price + M skills).
    if (materialValueArray.some(isNaN) || materialValueArray.length !== numSkillCategories + 1) {
      console.error(`Error: Malformed data for material ${materialIndex}. Expected ${numSkillCategories + 1} numbers.`);
      return -1;
    }

    // Extract the acquisition cost and the array of skill gains.
    const acquisitionCost = materialValueArray[0];
    const expertiseGains = materialValueArray.slice(1); // All elements from index 1 onwards are skill gains.

    // Add the structured material data to our catalog.
    availableStudyMaterials.push({
      purchasePrice: acquisitionCost,
      acquiredSkills: expertiseGains,
      uniqueId: materialIndex // An added identifier for debugging or future extensions.
    });
  }

  // --- Combination Generation and Evaluation ---
  // This array will store the total costs of all combinations of materials
  // that successfully meet the minimum skill requirements.
  const feasibleSolutionCosts = [];

  // The total number of possible combinations is 2^N (where N is totalBooksAvailable).
  // Each 'bit' in the combination mask represents the inclusion (1) or exclusion (0) of a book.
  const totalPossibleCombinations = 1 << totalBooksAvailable;

  // Iterate through every possible combination of study materials.
  for (let combinationMask = 0; combinationMask < totalPossibleCombinations; combinationMask++) {
    let currentCombinationTotalCost = 0;
    // Initialize an array to track the accumulated skill levels for the current combination.
    // All skill categories start at 0 for each new combination.
    const accumulatedSkillLevels = Array.from({ length: numSkillCategories }, () => 0);

    // Helper function: Determines if all skill levels in an array meet a specified minimum.
    // This extracts the logic for readability and potential reuse.
    const verifySkillSufficiency = (skillsAccumulator, targetLevel) => {
        for (let k = 0; k < skillsAccumulator.length; k++) {
            if (skillsAccumulator[k] < targetLevel) {
                return false; // If any skill is below the target, the combination is insufficient.
            }
        }
        return true; // All skills meet or exceed the target.
    };

    // Examine each book to see if it's part of the current combination.
    for (let bookItemIdx = 0; bookItemIdx < totalBooksAvailable; bookItemIdx++) {
      // Use bitwise shift and AND to check if the 'bookItemIdx'-th bit is set in the combinationMask.
      // If the bit is 1, the book is selected for this combination.
      const isBookIncludedInCombination = (combinationMask >> bookItemIdx) & 1;

      if (isBookIncludedInCombination) {
        const selectedMaterial = availableStudyMaterials[bookItemIdx];
        currentCombinationTotalCost += selectedMaterial.purchasePrice;

        // Add the skill contributions from the selected material to the accumulated levels.
        for (let skillCategoryIdx = 0; skillCategoryIdx < numSkillCategories; skillCategoryIdx++) {
          accumulatedSkillLevels[skillCategoryIdx] += selectedMaterial.acquiredSkills[skillCategoryIdx];
        }
      }
    }

    // After summing up costs and skills for the current combination, check if it's a valid solution.
    if (verifySkillSufficiency(accumulatedSkillLevels, minimumSkillRequirement)) {
      feasibleSolutionCosts.push(currentCombinationTotalCost); // Store the cost of this valid solution.
    }
  }

  // --- Determine Final Result ---
  let lowestAchievableCost = -1; // Default to -1, indicating no valid solution was found.

  // If there are any feasible solutions, find the minimum cost among them.
  if (feasibleSolutionCosts.length > 0) {
    // Using Math.min with the spread operator is an efficient way to find the minimum
    // value in an array of numbers.
    lowestAchievableCost = Math.min(...feasibleSolutionCosts);
  }

  // Output the final result to the console as per typical competitive programming requirements.
  console.log(lowestAchievableCost);
  // Also return the value, allowing the function to be used in other contexts.
  return lowestAchievableCost;
};

// --- Execution Entry Point ---
// This block handles reading input from standard input (typically a file in competitive programming).
// It includes error handling for file operations.
const fileSystemModule = require('fs'); // Renamed module variable for clarity.
const standardInputPath = '/dev/stdin'; // Standard input file path on Unix-like systems.

try {
  // Synchronously read the entire content of the standard input file as a UTF-8 string.
  const inputFileContents = fileSystemModule.readFileSync(standardInputPath, 'utf8');
  // Pass the read contents to our main processing function.
  evaluateStudyPlan(inputFileContents);
} catch (fileReadError) {
  // If an error occurs during file reading (e.g., file not found, permission issues),
  // log the error and exit the process with a non-zero status code.
  console.error(`An error occurred while attempting to read from ${standardInputPath}: ${fileReadError.message}`);
  process.exit(1);
}