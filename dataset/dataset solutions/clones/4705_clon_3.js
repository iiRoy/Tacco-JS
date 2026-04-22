// This module provides a function to solve a specific cyclic animal type puzzle.
// The puzzle involves determining if a valid arrangement of Sheep ('S') and Wolves ('W')
// exists in a circle, given statements made by each animal. Each animal states something
// about the relationship between its successor and its predecessor.
function determineAnimalArrangement(puzzleInputString) {
  // Parse the raw input string. The problem specifies the animal statements are on the second line.
  const inputLines = puzzleInputString.trim().split('\n');

  // Basic input validation: ensure there's at least a second line for animal statements.
  // If input is malformed or contains empty statements, no solution can be found.
  if (inputLines.length < 2 || inputLines[1].length === 0) {
    console.log(-1);
    return;
  }

  const animalStatements = inputLines[1];
  const numberOfAnimals = animalStatements.length;

  // Edge case handling: If there are too few animals (less than 2),
  // the cyclic conditions and propagation logic based on neighbors won't apply correctly.
  // For N=0 or N=1, the problem definition's boundary conditions (N-1, N-2, 1, 0) are problematic.
  // For simplicity, and aligning with common competitive programming practices where N >= 2 is implicitly assumed,
  // we'll assume valid N for the core logic. Printing -1 is a safe fallback for invalid N.
  if (numberOfAnimals < 2) {
      console.log(-1);
      return;
  }

  // A utility function to swap an animal's type between 'S' (Sheep) and 'W' (Wolf).
  const toggleAnimalType = (currentType) => (currentType === "S" ? "W" : "S");

  // This variable will store the first valid animal configuration discovered.
  let finalArrangement = null;
  // A boolean flag to indicate if a complete, valid arrangement has been found.
  let solutionDiscovered = false;

  // Define the two possible types for an animal.
  const initialTypeOptions = ["S", "W"];

  // The algorithm explores all 2x2 = 4 possible starting configurations for the first two animals.
  // Outer loop: Iterates through 'S' or 'W' for the animal at index 0.
  for (const typeForAnimalZero of initialTypeOptions) {
    // If a solution has already been found, we can break out of all loops early.
    if (solutionDiscovered) break;

    // Inner loop: Iterates through 'S' or 'W' for the animal at index 1.
    for (const typeForAnimalOne of initialTypeOptions) {
      // If a solution has already been found, no need to continue exploring other combinations.
      if (solutionDiscovered) break;

      // `currentAnimalConfiguration` will store the determined types ('S' or 'W') for all animals.
      // It's initialized with `null` values, then the first two types are set based on the current loop iteration.
      const currentAnimalConfiguration = Array(numberOfAnimals).fill(null);
      currentAnimalConfiguration[0] = typeForAnimalZero;
      currentAnimalConfiguration[1] = typeForAnimalOne;

      // Propagate the animal types around the circle from index 2 up to `numberOfAnimals - 1`.
      // The type of animal `k` is determined by the type and statement of animal `k-1`,
      // and the type of animal `k-2`.
      for (let k = 2; k < numberOfAnimals; ++k) {
        // Check if the preceding animal (at `k-1`) is a Sheep (truth-teller) or a Wolf (liar).
        const prevAnimalIsSheep = (currentAnimalConfiguration[k - 1] === "S");
        // Check what the preceding animal (at `k-1`) claims about the relationship between
        // animal `k` and animal `k-2`. 'o' means it claims they are the same type;
        // 'x' means it claims they are different types.
        const prevAnimalClaimsSameAsTwoBefore = (animalStatements[k - 1] === "o");

        // Determine the actual relationship between animal `k` and `k-2`.
        // If `k-1` is a Sheep, its claim is true.
        // If `k-1` is a Wolf, its claim is false (i.e., the opposite of truth).
        // This effectively translates the logic: (Sheep && claims_true) || (Wolf && claims_false)
        const actualKIsSameAsKMinusTwo = (prevAnimalIsSheep === prevAnimalClaimsSameAsTwoBefore);

        // Assign the type for animal `k` based on animal `k-2`'s type and the deduced relationship.
        // The original logic `if(array[i-1]==="W"^S[i-1]==="o")` corresponds to `!actualKIsSameAsKMinusTwo`.
        // If `!actualKIsSameAsKMinusTwo` is true, then `array[i]=array[i-2]`.
        // Otherwise, `array[i]=opposite(array[i-2])`.
        if (!actualKIsSameAsKMinusTwo) {
          currentAnimalConfiguration[k] = currentAnimalConfiguration[k - 2];
        } else {
          currentAnimalConfiguration[k] = toggleAnimalType(currentAnimalConfiguration[k - 2]);
        }
      }

      // After populating all animal types in the `currentAnimalConfiguration` array,
      // we must verify the cyclic boundary conditions involving the first and last animals.
      // These conditions check consistency at the "seams" of the circle.

      // Helper function to evaluate a three-part XOR condition (P1 XOR P2 XOR P3).
      // This is true if an odd number of its boolean arguments are true.
      const evaluateTernaryXOR = (bool1, bool2, bool3) => (bool1 !== bool2) !== bool3;

      // First cyclic constraint check: for the animal at index 0.
      // The condition is: (Animal 0 is Sheep XOR Animal 0 states 'o' XOR Animal N-1 is same type as Animal 1)
      const isAnimalZeroSheep = (currentAnimalConfiguration[0] === "S");
      const zeroStatesO = (animalStatements[0] === "o");
      const lastAnimalMatchesFirstNeighbor = (currentAnimalConfiguration[numberOfAnimals - 1] === currentAnimalConfiguration[1]);
      const zeroConstraintMet = evaluateTernaryXOR(isAnimalZeroSheep, zeroStatesO, lastAnimalMatchesFirstNeighbor);

      // Second cyclic constraint check: for the animal at index `numberOfAnimals - 1`.
      // The condition is: (Animal N-1 is Sheep XOR Animal N-1 states 'o' XOR Animal N-2 is same type as Animal 0)
      const isLastAnimalSheep = (currentAnimalConfiguration[numberOfAnimals - 1] === "S");
      const lastAnimalStatesO = (animalStatements[numberOfAnimals - 1] === "o");
      const secondToLastAnimalMatchesFirstAnimal = (currentAnimalConfiguration[numberOfAnimals - 2] === currentAnimalConfiguration[0]);
      const lastConstraintMet = evaluateTernaryXOR(isLastAnimalSheep, lastAnimalStatesO, secondToLastAnimalMatchesFirstAnimal);

      // If both cyclic constraints are satisfied, we've found a valid arrangement.
      if (zeroConstraintMet && lastConstraintMet) {
        finalArrangement = currentAnimalConfiguration.join("");
        solutionDiscovered = true; // Set flag to break from outer loops.
      }
    }
  }

  // Output the determined result.
  if (solutionDiscovered) {
    console.log(finalArrangement);
  } else {
    // If no valid arrangement was found after trying all initial combinations.
    console.log(-1);
  }
}

// Standard boilerplate for competitive programming environments: reading input from stdin.
// This part handles the I/O operations and calls the main solver function.
const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const utf8Encoding = "utf8";

// Read all data from standard input synchronously and pass it to the solver function.
determineAnimalArrangement(fileSystemModule.readFileSync(standardInputPath, utf8Encoding));