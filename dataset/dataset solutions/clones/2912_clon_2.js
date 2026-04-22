function ProcessData(rawData) {
  // Normalize input data: trim, split by lines, then split each line by spaces.
  rawData = rawData.trim().split('\n').map(
    /**
     * Splits a single line string into an array of strings by space.
     * @param {string} lineStr - The input line string.
     * @returns {string[]} An array of string tokens.
     */
    function(lineStr) {
      return lineStr.split(' ');
    }
  );

  // Declare variables to hold parsed configuration and calculation results.
  var configVals = []; // Stores N and M values.
  var expectedOutcomes = []; // Stores expected parities for each group.
  var connectionSets = []; // This variable is declared but not used in the original logic.
  var groupDetails = []; // Stores details for each group (number of switches and their indices).
  var solutionCount = 0; // Accumulator for the number of valid configurations.

  // Temporary variables for iterative calculations.
  var binaryRepresentation; // Represents the current switch configuration as a binary string.
  var unusedLoopVar; // Corresponds to 'j' in original, unused.
  var currentBit; // Value of a specific bit (switch state).
  var groupParitySum; // Sum of switch states for a given group.

  // Parse the first line for N and M.
  configVals = rawData[0].map(
    /**
     * Converts a string element to an integer.
     * @param {string} elementStr - The string to convert.
     * @returns {number} The parsed integer.
     */
    e => parseInt(e, 10)
  );

  // Parse the line containing expected parities.
  expectedOutcomes = rawData[configVals[1] + 1].map(
    /**
     * Converts a parity string to an integer.
     * @param {string} outcomeStr - The parity string.
     * @returns {number} The parsed integer parity.
     */
    e => parseInt(e, 10)
  );

  // Populate the array with group specifications.
  // Each group's specification starts from the second line up to M-th line.
  for (var groupIndex = 1; groupIndex <= configVals[1]; groupIndex++) {
    groupDetails.push(rawData[groupIndex].map(
      /**
       * Converts a specification string to an integer.
       * @param {string} specStr - The specification string.
       * @returns {number} The parsed integer specification.
       */
      e => parseInt(e, 10)
    ));
  }

  // Iterate through all possible switch configurations.
  // The loop runs from 2^N to 2^(N+1)-1.
  // This cleverly generates N-bit binary numbers by taking substr(1) of numbers from 2^N to 2^(N+1)-1.
  for (var comboNum = Math.pow(2, configVals[0]); comboNum < Math.pow(2, configVals[0]) * 2; comboNum++) {

    // Convert the current combination number to its binary string representation.
    // .substr(1) effectively removes the leading '1' to get N bits.
    binaryRepresentation = comboNum.toString(2).substr(1);

    // Reset the sum for the current configuration.
    groupParitySum = 0;

    // Labeled loop for checking each group's parity.
    groupVerificationLoop:
      for (var currGroupIdx = 1; currGroupIdx <= configVals[1]; currGroupIdx++) {

        // Reset the sum for the current group.
        groupParitySum = 0;

        // Iterate through each switch connected to the current group.
        // The first element of groupDetails[currGroupIdx-1] is the number of switches for this group.
        for (var switchIdxInGroup = 1; switchIdxInGroup <= groupDetails[currGroupIdx - 1][0]; switchIdxInGroup++) {

          // Get the state (0 or 1) of the current switch based on the binary representation.
          // groupDetails[currGroupIdx-1][switchIdxInGroup] gives the 1-based index of the switch.
          // We subtract 1 for 0-based array access.
          currentBit = parseInt(binaryRepresentation[groupDetails[currGroupIdx - 1][switchIdxInGroup] - 1], 10);

          // Add the switch state to the current group's sum.
          groupParitySum += currentBit;
        }

        // Check if the calculated parity (sum % 2) matches the expected outcome for this group.
        if (groupParitySum % 2 != expectedOutcomes[currGroupIdx - 1]) {
          // If parities don't match, this configuration is invalid; move to the next combination.
          break groupVerificationLoop;
        }

        // If all groups have been checked and passed for this configuration.
        if (currGroupIdx === configVals[1]) {
          // Increment the count of valid configurations.
          solutionCount++;
        }
      }
  }

  // Output the final count of valid configurations.
  console.log(solutionCount);
}

// Entry point: Read input from stdin and pass it to the main processing function.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));