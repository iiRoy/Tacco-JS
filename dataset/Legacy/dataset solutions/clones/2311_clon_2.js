const cmdArgs = process.argv.slice(2); // Retrieve command-line arguments, skipping node executable and script path

/**
 * Calculates the minimum number of moves required for two players
 * on a line of tables to meet, considering specific rules.
 * @param {Array<number>} tableData - An array containing [totalTables, playerOneTable, playerTwoTable].
 * @returns {number} The minimum number of moves.
 */
const pingPongMatch = ([totalTables, playerOneTable, playerTwoTable]) => {
  // Scenario 1: Players are on adjacent tables with one table exactly between them.
  // This means their table numbers differ by 2.
  if (playerTwoTable - playerOneTable === 2) {
    return 1; // Only one move needed for them to meet.
  }

  // Scenario 2: There's an odd number of tables between the players.
  // This implies they can meet exactly in the middle.
  if ((playerTwoTable - playerOneTable - 1) % 2 !== 0) {
    // The number of moves is half the absolute difference in their table numbers.
    return Math.abs(playerOneTable - playerTwoTable) / 2;
  }

  // Scenario 3: Even number of tables between players, and player A is closer to the start.
  // (Or equally close to start/end compared to player B's distance to end).
  if (playerOneTable - 1 <= totalTables - playerTwoTable) {
    // Sub-scenario 3.1: Four or more tables between players (excluding their own).
    if (playerTwoTable - playerOneTable - 1 >= 4) {
      // Moves = distance from A to start + (tables between - 2 for meeting point).
      return playerOneTable - 1 + (playerTwoTable - playerOneTable - 2);
    }

    // Sub-scenario 3.2: Exactly two tables between players.
    if (playerTwoTable - playerOneTable - 1 === 2) {
      // Moves = distance from A to start + 2 (for meeting).
      return playerOneTable - 1 + 2;
    }

    // Sub-scenario 3.3: Less than two tables between players (this case should be covered by previous ifs,
    // but if it falls through, it implies a specific meeting point).
    return playerTwoTable - 1; // Moves for B to reach table 1.
  }

  // Scenario 4: Even number of tables between players, and player B is closer to the end.
  // (Player A's distance to start is greater than player B's distance to end).
  if (playerOneTable - 1 > totalTables - playerTwoTable) {
    // Sub-scenario 4.1: Four or more tables between players.
    if (playerTwoTable - playerOneTable - 1 >= 4) {
      // Moves = distance from B to end + (tables between - 2 for meeting point).
      return totalTables - playerTwoTable + (playerTwoTable - playerOneTable - 2);
    }

    // Sub-scenario 4.2: Exactly two tables between players.
    if (playerTwoTable - playerOneTable - 1 === 2) {
      // Moves = distance from B to end + 2 (for meeting).
      return totalTables - playerTwoTable + 2;
    }

    // Sub-scenario 4.3: Less than two tables between players.
    return totalTables - playerOneTable; // Moves for A to reach table N.
  }
};

// Output the result of the calculation to the console.
console.log(pingPongMatch(cmdArgs));
