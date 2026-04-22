function ProcessInput(rawText) {
  // Break the raw text input into an array of individual lines.
  let lineCollection = rawText.split("\n");
  // Remove the final, often empty, line from the collection.
  lineCollection.pop();

  // Extract system configuration parameters from the very first line.
  const configParts = lineCollection[0].split(" ");
  // Determine the total count of available toggles in the setup.
  const toggleCount = parseInt(configParts[0], 10);
  // Ascertain the total number of lamps managed by the system.
  const lampCount = parseInt(configParts[1], 10);

  // Fetch the array of desired parity outcomes from the last line.
  const desiredParities = lineCollection[lineCollection.length - 1].split(" ");

  // Remove the now-processed configuration lines (first and last) from the main data.
  lineCollection.shift();
  lineCollection.pop();
  
  // Initialize a counter to track valid toggle configurations.
  let validCombinations = 0;
  // Iterate through every possible on/off state combination for the toggles.
  // There are 2^toggleCount combinations, represented by a bitmask from 0 to (2^toggleCount - 1).
  for (let currentCombination = 0; currentCombination < (1 << toggleCount); currentCombination++) {
    // An array to store the calculated parity results for the current toggle combination.
    const combinationParities = [];
    // Process each defined lamp circuit to calculate its parity.
    for (let currentLampCircuitIndex = 0; currentLampCircuitIndex < lineCollection.length; currentLampCircuitIndex++) {
      // Calculate the parity for the specific circuit based on the current toggle configuration.
      combinationParities.push(calculateParity(lineCollection[currentLampCircuitIndex], currentCombination));
    }
    // Compare the calculated parities for all circuits against the desired parities.
    if (desiredParities.toString() === combinationParities.toString()) {
      // If they match, increment the counter for valid configurations.
      validCombinations++;
    }
  }
  // Display the final tally of configurations that meet all parity requirements.
  console.log(validCombinations);
  
  // Auxiliary function to compute the parity (odd/even) of active switches for a given circuit.
  function calculateParity(circuitDataLine, currentConfigBitmap) {
    // The first element of the circuit data specifies the number of switches in this circuit.
    const circuitLength = parseInt(circuitDataLine[0], 10);
    // Counter for how many of this circuit's switches are 'on' in the current configuration.
    let activeSwitches = 0;
    // Iterate through the switch indices relevant to this specific circuit.
    // The loop goes from index 1 up to (but not including) circuitLength.
    for (let switchIndex = 1; switchIndex < circuitLength; switchIndex++) {
      // Extract the switch ID from the circuit data line.
      const switchId = parseInt(circuitDataLine[switchIndex], 10);
      // Check if the bit corresponding to this switch ID is set in the current configuration bitmap.
      // (currentConfigBitmap >> switchId) shifts the bit to the rightmost position.
      // & 1 then checks if that bit is 1 (on) or 0 (off).
      if ((currentConfigBitmap >> switchId) & 1) {
        activeSwitches++; // Increment if the switch is active.
      }
    }
    // Return the parity: 0 for an even count of active switches, 1 for an odd count.
    return activeSwitches % 2;
  }
}

// This line handles reading the input from standard input and executing the main processing function.
// It should not be altered.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));