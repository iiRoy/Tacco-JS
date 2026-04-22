/**
 * This module processes a series of resource management scenarios provided via standard input.
 * Each scenario defines an initial resource level and then a sequence of 12 monthly
 * inflow/outflow adjustments. The primary objective is to identify the first month
 * (1-indexed) in which the resource level drops to or below zero. If the resource
 * level never falls to or below zero throughout the 12 months, a specific 'NA' message
 * is outputted for that scenario. The processing continues until an initial resource
 * level of zero is encountered, signaling the end of the input stream.
 */
function processInputSequence() {
  // Define constants for clarity and easy modification
  const MONTHLY_CYCLE_DURATION = 12; // Number of months in each scenario
  const SEQUENCE_TERMINATION_VALUE = 0; // Value indicating the end of all scenarios
  const UNDETERMINED_RESULT_MESSAGE = 'NA'; // Message when the threshold is never met

  let inputLinePointer = 0; // Tracks the current line being read from the processed input array

  // The main loop iterates through each resource management scenario.
  // It continues indefinitely until a specific termination condition is met internally.
  while (true) {
    // Attempt to parse the initial resource capacity for the current scenario.
    // The `inputLinePointer` is incremented after fetching the line.
    const initialCapacityLine = parsedInputFragments[inputLinePointer++];
    const scenarioInitialCapacity = parseInt(initialCapacityLine, 10);

    // Guard clause: Check for the termination signal (0) or invalid input.
    // If either condition is true, the entire processing sequence concludes.
    if (isNaN(scenarioInitialCapacity) || scenarioInitialCapacity === SEQUENCE_TERMINATION_VALUE) {
      break; // Exit the primary scenario processing loop
    }

    let currentResourceState = scenarioInitialCapacity; // Initialize resource level for the current scenario
    let criticalThresholdMetAndReported = false; // Flag to prevent multiple outputs for a single scenario

    // Inner loop: Simulates the resource level changes over a 12-month period.
    for (let currentMonthIndex = 0; currentMonthIndex < MONTHLY_CYCLE_DURATION; currentMonthIndex++) {
      const monthlyAdjustmentLine = parsedInputFragments[inputLinePointer++]; // Fetch monthly inflow/outflow data

      // Validate the integrity of the monthly data line
      if (!monthlyAdjustmentLine || monthlyAdjustmentLine.trim() === '') {
        console.error(`Input Error: Empty or missing monthly data at line ${inputLinePointer - 1}. Skipping scenario.`);
        criticalThresholdMetAndReported = true; // Mark as reported to suppress 'NA'
        break; // Abort current scenario due to bad data
      }

      const flowComponents = monthlyAdjustmentLine.split(' '); // Split into inflow and outflow strings

      // Validate the format of the monthly flow components
      if (flowComponents.length < 2) {
        console.error(`Input Error: Invalid monthly data format (expected 2 numbers) at line ${inputLinePointer - 1}. Skipping scenario.`);
        criticalThresholdMetAndReported = true;
        break;
      }

      const incomingFlow = parseInt(flowComponents[0], 10);
      const outgoingFlow = parseInt(flowComponents[1], 10);

      // Validate that parsed flow components are indeed numbers
      if (isNaN(incomingFlow) || isNaN(outgoingFlow)) {
        console.error(`Input Error: Non-numeric flow values at line ${inputLinePointer - 1}. Inflow: '${flowComponents[0]}', Outflow: '${flowComponents[1]}'. Skipping scenario.`);
        criticalThresholdMetAndReported = true;
        break;
      }

      // Update the resource level. The calculation is:
      // new_level = old_level - (inflow - outflow)
      // which simplifies to:
      // new_level = old_level - inflow + outflow
      currentResourceState = currentResourceState - incomingFlow + outgoingFlow;

      // Check if the resource level has reached or fallen below the critical zero threshold.
      // This check only proceeds if a report hasn't already been issued for this scenario.
      if (!criticalThresholdMetAndReported && currentResourceState <= 0) {
        // Output the 1-based index of the month when the threshold was crossed.
        console.log(currentMonthIndex + 1);
        criticalThresholdMetAndReported = true; // Set flag to prevent further reporting for this scenario
      }
    }

    // After completing all 12 months (or an early exit due to bad data),
    // if the critical threshold was never met and reported, output the 'NA' message.
    if (!criticalThresholdMetAndReported) {
      console.log(UNDETERMINED_RESULT_MESSAGE);
    }
  }
}

// Global variable to accumulate raw chunks of input data received from stdin.
let accumulatedRawData = '';
// Global array to store individual lines after splitting the accumulated raw data.
let parsedInputFragments = [];

// Initialize standard input stream to start listening for data.
process.stdin.resume();
// Configure the input stream to interpret received bytes as UTF-8 characters.
process.stdin.setEncoding('utf8');

// Event listener for 'data' events: fired when new input chunks are available.
process.stdin.on('data', function(dataChunk) {
  accumulatedRawData += dataChunk; // Append the new chunk to the overall data buffer.
});

// Event listener for 'end' event: fired when the input stream has finished.
process.stdin.on('end', function() {
  // Once all input is received, split the raw data into an array of lines.
  parsedInputFragments = accumulatedRawData.split('\n');

  // Remove any potential empty string at the end of the array
  // that might result from a trailing newline character in the input.
  if (parsedInputFragments.length > 0 && parsedInputFragments[parsedInputFragments.length - 1] === '') {
    parsedInputFragments.pop();
  }

  // Initiate the core data processing logic.
  processInputSequence();
});