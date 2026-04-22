// A dedicated module for handling command-line argument parsing and validation.
const processCommandLineArguments = (rawInputParameters) => {
  // The first two elements in process.argv are 'node' and the script path,
  // so we discard them to get only the actual arguments.
  const processedArguments = rawInputParameters.slice(2).map(item => {
    const numericValue = parseInt(item, 10);
    // Enforce positive integer values for all inputs.
    if (isNaN(numericValue) || numericValue < 1) {
      console.error("Input Error: All provided parameters must be positive integer numbers.");
      process.exit(1); // Terminate execution on critical input failure.
    }
    return numericValue;
  });

  // Ensure precisely three arguments (total tables, player one, player two) are supplied.
  if (processedArguments.length !== 3) {
    console.error("Input Error: Expected exactly three numeric parameters: total_tables, player_one_position, player_two_position.");
    process.exit(1);
  }

  return processedArguments;
};

// The primary function to compute the minimum number of tournament phases (rounds)
// required for two players to potentially face each other.
const determineTournamentPhases = (matchConfiguration) => {
  // Deconstruct the input array for clarity and readability.
  const [totalGameTables, primaryPlayerPosition, secondaryPlayerPosition] = matchConfiguration;

  // --- Initial Configuration Validation ---
  // Verify that player positions are within the bounds of the total tables available.
  const isValidPosition = (pos) => pos >= 1 && pos <= totalGameTables;
  if (!isValidPosition(primaryPlayerPosition) || !isValidPosition(secondaryPlayerPosition)) {
    console.error("Configuration Error: Player positions must be within the valid range of game tables (1 to total_tables).");
    return -1; // Signify an invalid state or error condition.
  }

  // Normalize player positions so that the first player's position is always less than the second's.
  // This simplifies subsequent distance calculations, as the original logic implicitly assumed A < B.
  const lowerPosition = Math.min(primaryPlayerPosition, secondaryPlayerPosition);
  const higherPosition = Math.max(primaryPlayerPosition, secondaryPlayerPosition);

  // --- Calculate Key Geometries ---
  // The absolute span of tables between the two players.
  const absoluteTableSpan = higherPosition - lowerPosition;
  // The count of tables strictly located between the two players.
  const intermediateTableCount = absoluteTableSpan - 1;

  // A variable to store the final computed number of rounds.
  let minimumRequiredRounds;

  // --- Core Logic: Phase Calculation ---

  // Condition A: If the absolute span between players is an even number.
  // This implies they can meet directly in the middle without any player having to "skip" a table,
  // or one player moving an extra step to align for an odd-numbered distance.
  // Example: P1=1, P2=3 (span 2) -> 1 round. P1=1, P2=5 (span 4) -> 2 rounds.
  // This consolidates the original checks for `B - A == 2` and `(B - A - 1) % 2 != 0`
  // (where `(B - A - 1)` being odd means `B - A` is even).
  if (absoluteTableSpan % 2 === 0) {
    minimumRequiredRounds = absoluteTableSpan / 2;
  }
  // Condition B: If the absolute span between players is an odd number.
  // In this scenario, one player must make an additional move to adjust their position,
  // making the effective distance between them even, before they can meet.
  else {
    // Calculate distances to the nearest "end" of the table row.
    const distanceToLowerEnd = lowerPosition - 1; // Distance from lower-positioned player to table 1.
    const distanceToHigherEnd = totalGameTables - higherPosition; // Distance from higher-positioned player to table 'totalGameTables'.

    // Determine which "end" is more accessible (closer) for strategic movement.
    if (distanceToLowerEnd <= distanceToHigherEnd) {
      // It's more efficient for the lower-positioned player (or both) to move towards table 1.
      // This branch corresponds to `A - 1 <= N - B` in the original code.

      if (intermediateTableCount >= 4) { // Corresponds to `B - A - 1 >= 4` (i.e., absoluteTableSpan >= 5, and odd).
        // Original logic: `A - 1 + (B - A - 2)` which simplifies to `B - 3`.
        minimumRequiredRounds = higherPosition - 3;
      } else if (intermediateTableCount === 2) { // Corresponds to `B - A - 1 == 2` (i.e., absoluteTableSpan == 3, and odd).
        // Original logic: `A - 1 + 2` which simplifies to `A + 1`.
        minimumRequiredRounds = lowerPosition + 1;
      } else { // This covers `intermediateTableCount < 2` and `absoluteTableSpan` is odd, meaning `absoluteTableSpan` must be 1.
               // Corresponds to `B - A == 1` (odd).
        // Original logic: `B - 1`.
        minimumRequiredRounds = higherPosition - 1;
      }
    } else {
      // It's more efficient for the higher-positioned player (or both) to move towards 'totalGameTables'.
      // This branch corresponds to `A - 1 > N - B` in the original code.

      if (intermediateTableCount >= 4) { // Corresponds to `B - A - 1 >= 4` (i.e., absoluteTableSpan >= 5, and odd).
        // Original logic: `N - B + (B - A - 2)` which simplifies to `N - A - 2`.
        minimumRequiredRounds = totalGameTables - lowerPosition - 2;
      } else if (intermediateTableCount === 2) { // Corresponds to `B - A - 1 == 2` (i.e., absoluteTableSpan == 3, and odd).
        // Original logic: `N - B + 2`.
        minimumRequiredRounds = distanceToHigherEnd + 2; // Equivalent to totalGameTables - higherPosition + 2.
      } else { // This covers `intermediateTableCount < 2` and `absoluteTableSpan` is odd, meaning `absoluteTableSpan` must be 1.
               // Corresponds to `B - A == 1` (odd).
        // Original logic: `N - A`.
        minimumRequiredRounds = totalGameTables - lowerPosition;
      }
    }
  }

  return minimumRequiredRounds;
};

// Execute the argument parsing and then the main calculation.
const parsedCommandLineArguments = processCommandLineArguments(process.argv);

// Print the final computed result to the console.
console.log(determineTournamentPhases(parsedCommandLineArguments));