/*
 * This module processes raw sensor data to identify dominant sensors.
 * A sensor is considered dominant if no other connected sensor has a
 * strength greater than or equal to its own, based on specific rules.
 */
const processSensorData = (rawDataString) => {
  // Initial data sanitization and splitting into lines for further parsing.
  const processedLines = rawDataString.trim().split('\n');

  // Validate minimum input lines. We expect at least one line for configuration
  // and one line for sensor strengths.
  if (processedLines.length < 2) {
    // In a production environment, this might throw an error or log a critical issue.
    // For this problem, we'll output an error message and return a default value.
    console.error("Error: Insufficient input data provided. Expected configuration and strength lines.");
    return 0;
  }

  // Extracting configuration parameters: total number of sensors (N) and number of connections (M).
  // Using parseInt with radix 10 for explicit base conversion.
  const configurationParameters = processedLines[0].split(' ').map(val => parseInt(val, 10));

  const numSensors = configurationParameters[0];
  const numConnections = configurationParameters[1];

  // Prepare sensor strength data. The problem often uses 1-based indexing for sensors,
  // so we prepend a dummy value at index 0 to make array access 1-to-1 with sensor IDs.
  const rawStrengthInput = processedLines[1].split(' ').map(val => parseInt(val, 10));
  const sensorStrengths = [0, ...rawStrengthInput];

  // Initialize a boolean array to track which sensors are currently considered dominant candidates.
  // By default, all sensors from index 1 up to 'numSensors' are initially candidates.
  // Index 0 is intentionally unused and set to false.
  const isStrongestCandidate = Array.from({ length: numSensors + 1 }, (_, index) => index > 0);

  // Extract connection pairs from the input, starting from the third line.
  // Each inner array [A, B] signifies a connection between sensor A and sensor B.
  const connectionPairs = processedLines.slice(2).map(line =>
    line.split(' ').map(val => parseInt(val, 10))
  );

  // Iterate through each connection to update the dominance status of sensors.
  // The logic determines which sensors are NOT dominant based on strength comparisons.
  for (let currentConnectionIdx = 0; currentConnectionIdx < connectionPairs.length; currentConnectionIdx++) {
    const currentPair = connectionPairs[currentConnectionIdx];
    const sensorIdentifierA = currentPair[0];
    const sensorIdentifierB = currentPair[1];

    // Fetch the actual strength values for the connected sensors.
    const strengthOfSensorA = sensorStrengths[sensorIdentifierA];
    const strengthOfSensorB = sensorStrengths[sensorIdentifierB];

    // Apply the specific dominance rules:
    // 1. If A's strength is greater than or equal to B's strength, then B cannot be dominant.
    if (strengthOfSensorA >= strengthOfSensorB) {
      isStrongestCandidate[sensorIdentifierB] = false;
    }
    // 2. Otherwise (if A's strength is strictly less than B's strength),
    //    and A's strength is less than or equal to B's strength (which is implied here),
    //    then A cannot be dominant.
    // This `else if` structure is crucial for handling equality: if strengths are equal,
    // only the first condition (A >= B) is met, marking B as non-dominant, and A remains a candidate.
    else if (strengthOfSensorA <= strengthOfSensorB) { // This implies strengthOfSensorA < strengthOfSensorB due to the 'else'
      isStrongestCandidate[sensorIdentifierA] = false;
    }
    // No additional 'else' block is required as the conditions cover all comparison outcomes
    // and correctly model the problem's specific rule for equal strengths.
  }

  // Count the total number of sensors that have maintained their dominant candidate status.
  let finalDominantSensorCount = 0;
  // Iterate from sensor ID 1 up to 'numSensors'.
  for (let sensorId = 1; sensorId <= numSensors; sensorId++) {
    if (isStrongestCandidate[sensorId]) {
      finalDominantSensorCount++;
    }
  }

  // Output the final computed count to the console.
  return console.log(finalDominantSensorCount);
};

// --- Environment-specific Execution Handling ---
// This block manages how the 'processSensorData' function is called,
// accommodating different execution environments (testing vs. live input).
const orchestrateExecution = () => {
  if (process.env.MYTEST) {
    if (process.env.MYTEST === 'test') {
      // In a test environment, a dummy function might be invoked
      // or mock data could be passed to the main processing logic.
      const runMockTests = () => {
        console.log("Executing in mock test mode. Providing sample data.");
        // Example mock input for testing purposes
        processSensorData("3 3\n10 20 30\n1 2\n2 3\n1 3");
        // Add more test cases here if needed for comprehensive testing
      };
      runMockTests();
    } else {
      // For other 'MYTEST' values, read input from a specified development path.
      const fileSystem = require('fs');
      const inputContent = fileSystem.readFileSync('dev/stdin', 'utf8');
      processSensorData(inputContent);
    }
  } else {
    // Default execution path: read input from the standard input stream.
    const fileSystem = require('fs');
    const inputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
    processSensorData(inputContent);
  }
};

// Initiate the execution flow.
orchestrateExecution();