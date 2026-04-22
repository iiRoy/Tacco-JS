function navigateCityNetwork(travelInstructionString) {
  // This function simulates a series of jumps through a network of cities,
  // optimizing the process by detecting and utilizing cycles in the path.
  // The input string contains configuration for the city network and jump count.

  // First, parse the raw input string into individual lines.
  // The input is expected to have two lines:
  // Line 1: [number_of_cities] [total_jumps_requested]
  // Line 2: [city_1_connection] [city_2_connection] ... [city_N_connection]
  const inputRows = travelInstructionString.trim().split("\n");

  // A basic check for input validity, though competitive programming often assumes perfect input.
  if (inputRows.length < 2) {
    // In a real application, one might throw an error or handle a default case.
    // For this context, we proceed assuming valid structure.
  }

  // Extract the initial parameters from the first line.
  const journeyParameters = inputRows[0].split(' ');
  // The total number of cities (N) is parsed but not strictly used in this specific pathfinding logic.
  const totalNetworkNodes = Number(journeyParameters[0]);
  // The total number of jumps (K) is crucial and can be very large, hence BigInt is used.
  let remainingJumps = BigInt(journeyParameters[1]);

  // Parse the city connection map from the second line.
  // The input provides 1-indexed city identifiers, so we convert them to 0-indexed
  // immediately for easier array access in JavaScript.
  // For example, if '1 3' means city 1 connects to city 3, and city 3 is at index 2,
  // then 'zeroIndexedConnections[0]' would store '2'.
  const oneIndexedCityLinks = inputRows[1].split(' ').map(Number);
  const zeroIndexedConnections = oneIndexedCityLinks.map(cityId => cityId - 1);

  // Initialize tracking variables for the journey simulation.
  // 'currentCityIndex' tracks our present location in the 0-indexed city network.
  let currentCityIndex = 0; // We always start at the first city (index 0).
  // 'stepsTakenCounter' keeps a running count of how many jumps have occurred so far.
  let stepsTakenCounter = 0;

  // To efficiently detect cycles and determine their properties, we use two data structures:
  // 1. 'pathSequence': An array to store the 0-indexed city IDs in the exact order they were visited.
  // 2. 'firstVisitStepMap': A Map to quickly look up the 'stepsTakenCounter' value
  //    when a particular city was first encountered.
  const pathSequence = [];
  const firstVisitStepMap = new Map(); // Maps city ID -> step number of its first visit.

  // Main simulation loop: continues until all 'remainingJumps' have been processed.
  while (remainingJumps > 0) {
    // Before making the next jump, check if the 'currentCityIndex' has been visited before.
    // If it has, we've successfully detected a cycle in our journey path.
    if (firstVisitStepMap.has(currentCityIndex)) {
      // Retrieve the 'stepsTakenCounter' value when this city was initially entered.
      const cycleEntryStep = firstVisitStepMap.get(currentCityIndex);
      // Calculate the length of the detected cycle.
      const cycleDuration = BigInt(stepsTakenCounter - cycleEntryStep);

      // If the cycle has a positive duration and we have enough 'remainingJumps' to
      // complete at least one full cycle, we can use the modulo operator to skip
      // many full cycles at once, significantly optimizing for large 'remainingJumps'.
      if (cycleDuration > 0 && remainingJumps >= cycleDuration) {
        remainingJumps %= cycleDuration;
      }

      // After skipping full cycles, if there are still jumps left,
      // we need to find the exact city within the cycle where we will land.
      if (remainingJumps > 0) {
        // The final city will be located at 'cycleEntryStep' + 'remainingJumps' steps
        // into the 'pathSequence' array. We convert BigInt 'remainingJumps' to Number
        // for array indexing.
        const finalPositionOffsetWithinCycle = Number(remainingJumps);
        currentCityIndex = pathSequence[cycleEntryStep + finalPositionOffsetWithinCycle];
      }
      
      // All remaining jumps (either by skipping cycles or by precise positioning within one)
      // have now been accounted for. We can exit the simulation loop.
      remainingJumps = 0; // Mark jumps as complete.
      break; // Exit the main simulation loop.
    }

    // If the 'currentCityIndex' has not been visited before, record its first visit.
    firstVisitStepMap.set(currentCityIndex, stepsTakenCounter);
    pathSequence.push(currentCityIndex);

    // Now, perform the actual jump to the next city.
    // The 'zeroIndexedConnections' array directly provides the next city's 0-indexed ID.
    currentCityIndex = zeroIndexedConnections[currentCityIndex];

    // Decrement the total jumps remaining and increment our step counter.
    remainingJumps--;
    stepsTakenCounter++;
  }
  
  // After the loop concludes, 'currentCityIndex' holds the final 0-indexed city position.
  // Convert it back to 1-indexed for the final output as per problem requirements.
  console.log(currentCityIndex + 1);
}

// The standard entry point for competitive programming environments:
// Reads all input from standard input (e.g., '/dev/stdin') as a UTF-8 string
// and passes it to our main processing function.
navigateCityNetwork(require("fs").readFileSync("/dev/stdin", "utf8"));