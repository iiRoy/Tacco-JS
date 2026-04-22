// Function to determine if two entities, starting at different positions and moving at different speeds,
// will meet within a specified time limit.
function ProcessEncounterScenario (scenarioInputString) {
  /**
   * Helper function to robustly parse a string into a number.
   * Throws an error for non-numeric inputs, ensuring data integrity.
   * @param {string} str - The string to parse.
   * @returns {number} The parsed numeric value.
   */
  const parseNumericValue = (str) => {
    const numericForm = Number(str);
    if (Number.isNaN(numericForm)) {
      // In a real-world application, more sophisticated error handling or default values might be used.
      // For competitive programming contexts, input is typically guaranteed to be valid.
      console.error(`Error: Non-numeric input received: '${str}'`);
      throw new Error("Invalid input format detected. Expected a number.");
    }
    return numericForm;
  };

  // Divide the raw input string into individual lines for easier processing.
  const inputLines = scenarioInputString.split("\n");

  // Extract and convert the first entity's initial position and speed from the first line.
  const firstEntityDetails = inputLines[0].split(" ");
  const initialPositionA = parseNumericValue(firstEntityDetails[0]);
  const speedA = parseNumericValue(firstEntityDetails[1]);

  // Extract and convert the second entity's initial position and speed from the second line.
  const secondEntityDetails = inputLines[1].split(" ");
  const initialPositionB = parseNumericValue(secondEntityDetails[0]);
  const speedB = parseNumericValue(secondEntityDetails[1]);

  // Extract and convert the maximum time duration allowed for the encounter from the third line.
  const maxTimeUnits = parseNumericValue(inputLines[2]);

  // --- Core Calculation for Encounter Possibility ---

  // Calculate the absolute difference in their starting positions.
  // This effectively determines how far apart they are initially, regardless of which is 'ahead'.
  const initialSeparation = Math.abs(initialPositionA - initialPositionB);

  // Determine the relative speed at which entity A is approaching entity B.
  // A positive value means the distance between them is decreasing.
  // A zero or negative value means the distance is staying the same or increasing.
  const relativeApproachRate = speedA - speedB;

  // A boolean flag to store the final outcome: whether they can meet.
  let canTheyMeetWithinTime = false;

  // Scenario 1: They are already at the same position at time t=0.
  // In this case, they have already met.
  if (initialSeparation === 0) {
    canTheyMeetWithinTime = true;
  }
  // Scenario 2: They are not at the same position initially.
  else {
    // If their relative approach rate is zero or negative, the distance between them
    // will never decrease (it will either stay constant or increase).
    // Therefore, if they started apart, they can never meet.
    if (relativeApproachRate <= 0) {
      canTheyMeetWithinTime = false;
    }
    // Scenario 3: They are apart, but entity A is actively approaching B (relativeApproachRate > 0).
    else {
      // Calculate the maximum total distance that can be closed by their relative movement
      // within the given time limit.
      const totalDistanceClosurePossible = relativeApproachRate * maxTimeUnits;

      // If the initial separation is less than or equal to the total distance they can close,
      // they will meet at or before the time limit.
      if (initialSeparation <= totalDistanceClosurePossible) {
        canTheyMeetWithinTime = true;
      } else {
        // Otherwise, they won't close the initial distance within the time limit.
        canTheyMeetWithinTime = false;
      }
    }
  }

  // Output the final verdict to the console.
  if (canTheyMeetWithinTime) {
    console.log("YES");
  } else {
    console.log("NO");
  }
}

// The main entry point for executing the script.
// It reads the entire content of standard input, decodes it as UTF-8,
// and then passes it to our primary processing function.
ProcessEncounterScenario(require("fs").readFileSync("/dev/stdin", "utf8"));