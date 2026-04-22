'use strict'; // Enforce strict mode for cleaner code practices.

// Import the necessary file system module for input operations.
const fileSystemModule = require('fs');
// Define a large prime number for modulo operations, particularly useful in combinatorics.
const calculationModulus = BigInt(1e9 + 7);

/**
 * A utility class encapsulating solutions for problems from AtCoder Beginner Contest 041.
 */
class CompetitionSolverA {

  /**
   * Solves problem A: Given a string and an index, print the character at that index.
   * @param {string} rawInputString The raw input, expected to be two lines: the string and the 1-based index.
   */
  static getCharAtIndex(rawInputString) {
    // Trim whitespace and split the input into individual lines.
    const processedLines = rawInputString.trim().split('\n');

    // Basic validation: ensure we have exactly two lines of input.
    if (processedLines.length < 2) {
      console.error("Error: Insufficient input for problem A. Expected a string and an index.");
      return; // Exit if input is malformed.
    }

    // Extract the source string and the 1-based index.
    const sourceString = processedLines[0];
    const targetIndexOneBased = Number(processedLines[1]); // Convert index string to number.

    // Validate the index to prevent out-of-bounds access.
    if (isNaN(targetIndexOneBased) || targetIndexOneBased < 1 || targetIndexOneBased > sourceString.length) {
      console.error(`Error: Invalid index '${targetIndexOneBased}' provided for string of length ${sourceString.length}.`);
      return;
    }

    // Calculate the 0-based index.
    const zeroBasedIndex = targetIndexOneBased - 1;
    // Retrieve the character at the calculated index.
    const desiredCharacter = sourceString.charAt(zeroBasedIndex);

    // Output the result using a template literal.
    console.log(`The character at index ${targetIndexOneBased} is: ${desiredCharacter}`);
  }

  /**
   * Solves problem B: Calculate (A * B * C) % MOD using BigInt for large numbers.
   * @param {string} valueString The raw input string containing three space-separated numbers.
   */
  static calculateProductModulo(valueString) {
    // Parse the input string into an array of BigInt numbers.
    const numericValues = valueString
      .trim()
      .split(' ')
      .map(str => BigInt(str));

    // Destructure the array into individual BigInt variables.
    const [operandA, operandB, operandC] = numericValues;

    // Perform the calculation step-by-step to ensure modulo is applied at each multiplication,
    // preventing overflow with standard numbers and keeping intermediate results manageable for BigInt.
    const firstProductModulo = (operandA * operandB) % calculationModulus;
    const finalResultBigInt = (firstProductModulo * operandC) % calculationModulus;

    // Convert the BigInt result back to a standard JavaScript Number for console output.
    const finalResultNumber = Number(finalResultBigInt);

    // Display the computed value.
    console.log(finalResultNumber);
  }

  /**
   * Solves problem C: Sort students by height in descending order and print their original 1-based indices.
   * @param {string} studentDataInput The raw input string, first line is N, second line is space-separated heights.
   */
  static sortAndDisplayHeights(studentDataInput) {
    // Split the input into lines and trim whitespace from each.
    const dataLines = studentDataInput.trim().split('\n');

    // Extract the number of students (N) from the first line.
    const studentCount = Number(dataLines[0]);

    // Parse the second line into an array of integer heights.
    const individualHeights = dataLines[1].split(' ').map(Number);

    // If studentCount doesn't match the actual number of heights, log a warning.
    if (individualHeights.length !== studentCount) {
      console.warn("Warning: Declared student count (N) does not match the number of provided heights.");
      // For this problem, we'll proceed using the actual number of heights from the data.
    }

    // Create an array of objects, where each object stores a student's original 1-based index and their height.
    // This preserves the original index during sorting.
    const indexedStudents = individualHeights.map((currentHeight, zeroBasedIndex) => ({
      originalIdx: zeroBasedIndex + 1, // Convert 0-based index to 1-based.
      studentHeight: currentHeight
    }));

    // Sort the students based on their heights in descending order.
    // If heights are equal, their relative order is maintained (stable sort is not strictly required here).
    indexedStudents.sort((studentA, studentB) => studentB.studentHeight - studentA.studentHeight);

    // Iterate through the sorted list and print the original 1-based index of each student.
    for (const {
        originalIdx: studentIdentifier
      } of indexedStudents) {
      console.log(studentIdentifier);
    }
  }

  /**
   * Solves problem D: Counts the number of ways to arrange nodes in a directed acyclic graph (DAG)
   * such that all edges point from left to right (topological sort variant).
   * Uses dynamic programming with bitmasking.
   *
   * The problem is to count topological orderings. A common DP approach for this is:
   * `dp[mask]` = number of ways to order nodes in `mask`.
   * A node `i` can be picked as the *last* node in `mask` if it has no outgoing edges to any other node in `mask`.
   *
   * @param {string} problemInput The raw input string containing graph definition.
   */
  static countValidTopologicalOrderings(problemInput) {
    const inputSegments = problemInput.trim().split('\n');
    const [numNodes, numEdges] = inputSegments[0].split(' ').map(Number);

    // `outgoingEdgesAdjacency[u]` stores a bitmask where the `v`-th bit is set if there's an edge `u -> v`.
    const outgoingEdgesAdjacency = Array.from({
      length: numNodes
    }, () => 0);

    // Process edge definitions. Node indices are 1-based in input, convert to 0-based.
    for (let currentEdgeIndex = 0; currentEdgeIndex < numEdges; currentEdgeIndex++) {
      const [sourceNode, targetNode] = inputSegments[1 + currentEdgeIndex].split(' ').map(Number);
      // Set the bit for `targetNode - 1` in the adjacency mask of `sourceNode - 1`.
      outgoingEdgesAdjacency[sourceNode - 1] |= (1 << (targetNode - 1));
    }

    // `memoizationTable[bitmask]` will store the number of valid orderings for the set of nodes represented by `bitmask`.
    // The size of the table is 2^numNodes, as each bit represents a node's presence.
    const memoizationTable = Array.from({
      length: 1 << numNodes
    }).fill(null);
    memoizationTable[0] = 1; // Base case: an empty set of nodes has one way to order (do nothing).

    /**
     * Recursive function to count valid topological orderings for a given set of nodes.
     * It finds a "sink" node in the current subgraph (a node with no outgoing edges to other nodes in the subgraph),
     * places it as the last element, and recursively counts for the remaining subgraph.
     * @param {number[]} currentOutgoingEdges The current state of outgoing adjacency masks for the subgraph.
     * @param {number} currentNodesMask The bitmask representing the set of nodes currently being considered.
     * @returns {number} The number of valid orderings for `currentNodesMask`.
     */
    function countOrderingsRecursive(currentOutgoingEdges, currentNodesMask) {
      // If this subproblem has already been solved, return the memoized result.
      if (memoizationTable[currentNodesMask] !== null) {
        return memoizationTable[currentNodesMask];
      }

      let totalWaysToOrder = 0; // Initialize count for current nodes mask.

      // Iterate through all possible nodes (0 to numNodes-1).
      for (let nodeIdx = 0; nodeIdx < numNodes; nodeIdx++) {
        // Check if the current node `nodeIdx` is part of the `currentNodesMask`
        // AND if `nodeIdx` has no outgoing edges to any other node still present in `currentNodesMask`.
        // This means `nodeIdx` is a sink node in the current subgraph.
        if (((currentNodesMask >>> nodeIdx) & 1) && (currentOutgoingEdges[nodeIdx] === 0)) {
          // If `nodeIdx` is a sink, it can be chosen as the LAST node in the topological ordering of `currentNodesMask`.

          // Create a new bitmask representing the set of nodes remaining after `nodeIdx` is chosen.
          const nextNodesMask = currentNodesMask & ~(1 << nodeIdx);

          // Create a copy of the current outgoing edge masks.
          // In the next step, `nodeIdx` is considered "placed" (removed from the graph).
          // So, any node `otherNodeIdx` that pointed to `nodeIdx` no longer has `nodeIdx` as an active outgoing dependency.
          const nextOutgoingEdgesState = [...currentOutgoingEdges];

          // For all other nodes `otherNodeIdx`, remove `nodeIdx` from their outgoing adjacency list.
          // This simulates removing node `nodeIdx` from the graph.
          for (let otherNodeIdx = 0; otherNodeIdx < numNodes; otherNodeIdx++) {
            nextOutgoingEdgesState[otherNodeIdx] &= ~(1 << nodeIdx);
          }

          // Add the number of ways to order the remaining `nextNodesMask` subgraph.
          totalWaysToOrder += countOrderingsRecursive(nextOutgoingEdgesState, nextNodesMask);
        }
      }

      // Memoize the result for the current bitmask before returning.
      memoizationTable[currentNodesMask] = totalWaysToOrder;
      return totalWaysToOrder;
    }

    // Initial call to the recursive function with all nodes (represented by `(1 << numNodes) - 1`)
    // and the initial outgoing adjacency list.
    const totalValidOrderings = countOrderingsRecursive(outgoingEdgesAdjacency, (1 << numNodes) - 1);
    console.log(totalValidOrderings);
  }
}

/**
 * A class dedicated to solving problems from AtCoder Beginner Contest 173.
 */
class ContestProblemsB {

  /**
   * Solves problem A: Calculate the amount of change needed to reach the next multiple of 1000.
   * @param {string} inputAmount The raw input string representing the current amount.
   */
  static calculateChangeAmount(inputAmount) {
    // Parse the input string into a number, ensuring no leading/trailing whitespace.
    const currentAmount = Number(inputAmount.trim());

    // Calculate the next multiple of 1000.
    // The formula `Math.floor((N + 999) / 1000) * 1000` effectively rounds N up to the nearest multiple of 1000.
    // If N is already a multiple of 1000, it returns N itself.
    const nextMultipleOfThousand = Math.floor((currentAmount + 999) / 1000) * 1000;
    const changeNeeded = nextMultipleOfThousand - currentAmount;

    // Output the calculated change.
    console.log(changeNeeded);
  }

  /**
   * Solves problem B: Tally and display counts of different submission verdicts.
   * @param {string} submissionLogData The raw input string containing the number of submissions
   *                                   followed by submission verdicts on separate lines.
   */
  static tallySubmissionResults(submissionLogData) {
    const logEntries = submissionLogData.trim().split('\n');
    const totalSubmissions = Number(logEntries[0]); // First line is the count N.

    // Initialize an object to store counts for each verdict type.
    const verdictTallies = {
      'AC': 0, // Accepted
      'WA': 0, // Wrong Answer
      'TLE': 0, // Time Limit Exceeded
      'RE': 0 // Runtime Error
    };

    // Iterate through the submission verdicts (starting from the second line)
    // and update their counts.
    // We slice the array to get only the verdict lines, then use forEach.
    logEntries.slice(1, 1 + totalSubmissions).forEach(singleVerdict => {
      // Increment the count for the current verdict type.
      // Using nullish coalescing `?? 0` ensures that if a verdict type
      // somehow isn't pre-initialized, it defaults to 0 before incrementing.
      verdictTallies[singleVerdict] = (verdictTallies[singleVerdict] ?? 0) + 1;
    });

    // Iterate through the collected tallies and print them in the specified format.
    // Using Object.keys() and forEach for a different iteration style compared to original's for...of.
    Object.keys(verdictTallies).forEach(verdictType => {
      const countValue = verdictTallies[verdictType];
      console.log(`${verdictType} x ${countValue}`);
    });
  }

  /**
   * Solves problem C: Counts the number of ways to select rows and columns
   * to paint such that exactly K black cells remain visible.
   * @param {string} gridConfigurationData The raw input string defining the grid and target K.
   */
  static countBlackCellsCombinations(gridConfigurationData) {
    const configLines = gridConfigurationData.trim().split('\n');

    // Parse grid dimensions (H, W) and target black cells (K) from the first line.
    const [gridHeight, gridWidth, targetBlackCells] = configLines[0].split(' ').map(Number);

    // Extract the grid itself (rows of characters) from the remaining lines.
    const gridLayout = configLines.slice(1);

    let validCombinationsCount = 0; // Accumulator for valid combinations.

    // Iterate through all possible combinations of painting rows.
    // A bitmask `rowSelectionMask` represents which rows are selected to be painted (bit is 1).
    // The loop runs from 0 up to (2^H - 1), covering all 2^H possibilities.
    for (let rowSelectionMask = 0; rowSelectionMask < (1 << gridHeight); rowSelectionMask++) {
      // Iterate through all possible combinations of painting columns.
      // A bitmask `colSelectionMask` represents which columns are selected to be painted (bit is 1).
      // The loop runs from 0 up to (2^W - 1), covering all 2^W possibilities.
      for (let colSelectionMask = 0; colSelectionMask < (1 << gridWidth); colSelectionMask++) {

        let currentBlackCellsVisible = 0; // Count black cells for the current row/column selection.

        // Iterate through each cell of the grid.
        for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
          // Check if the current row `rowIdx` is selected to be painted.
          // If the `rowIdx`-th bit in `rowSelectionMask` is 1, the row is painted.
          if (((rowSelectionMask >>> rowIdx) & 1) === 1) { // Using unsigned right shift for bitwise check.
            continue; // If this row is painted, all cells in it become non-black, so skip to next row.
          }

          for (let colIdx = 0; colIdx < gridWidth; colIdx++) {
            // Check if the current column `colIdx` is selected to be painted.
            // If the `colIdx`-th bit in `colSelectionMask` is 1, the column is painted.
            if (((colSelectionMask >>> colIdx) & 1) === 1) {
              continue; // If this column is painted, all cells in it become non-black, so skip to next column.
            }

            // If neither the row nor the column is painted, check if the cell is originally black ('#').
            if (gridLayout[rowIdx][colIdx] === '#') {
              currentBlackCellsVisible++; // Increment count if it's a visible black cell.
            }
          }
        }

        // After checking all cells for the current row/column painting combination,
        // if the count of visible black cells matches the target K, increment the total valid combinations.
        if (currentBlackCellsVisible === targetBlackCells) {
          validCombinationsCount++;
        }
      }
    }

    // Output the final count of valid combinations.
    console.log(validCombinationsCount);
  }

  /**
   * Solves problem D: Placeholder for future implementation.
   * @param {string} data Input data for problem D.
   * @returns {string} A simple message indicating the method was called.
   */
  static solveProblemD(data) {
    console.log("Problem D solution not yet implemented for ContestProblemsB. Received data length:", data.length);
    // As a placeholder, we might return a specific string or a default value.
    return `Placeholder for D with input: ${data.substring(0, 10)}...`;
  }

  /**
   * Solves problem E: Placeholder for future implementation.
   * @param {string} data Input data for problem E.
   * @returns {number} A dummy calculated value.
   */
  static handleProblemE(data) {
    console.log("Problem E solution not yet implemented for ContestProblemsB.");
    // Example: Process data in a dummy way, like counting characters.
    const dummyResult = data.split('').filter(char => char === 'a').length;
    return dummyResult;
  }

  /**
   * Solves problem F: Placeholder for future implementation.
   * @param {string} data Input data for problem F.
   */
  static processProblemF(data) {
    console.log("Problem F solution not yet implemented for ContestProblemsB.");
    // Example: Log the data length.
    console.log(`Received data of length for F: ${data.length}`);
    // This method might perform some side effect or simply return nothing.
  }
}


// --- Main Execution Block ---
// Read the entire standard input as a UTF-8 string.
// In a typical competitive programming environment, `/dev/stdin` is the standard input file.
const challengeInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Call the specific problem solver for ABC173 C with the read input data.
// This is the entry point for the program based on the original structure.
ContestProblemsB.countBlackCellsCombinations(challengeInputData);