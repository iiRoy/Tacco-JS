const fileSystem = require('fs'); // Import the core file system module.

// --- Main Program Execution Block ---

let rawInputPayload; // Variable to hold the raw content read from standard input.
try {
  // Attempt to read data from standard input (file descriptor 0) as UTF-8 text.
  rawInputPayload = fileSystem.readFileSync(0, 'utf8');
} catch (dataReadError) {
  // In case of an error during input reading, log it and terminate.
  process.stderr.write(`Input reading failed: ${dataReadError.message}\n`);
  process.exit(1); // Exit with a non-zero status code indicating an error.
}

// Prepare the input: remove leading/trailing whitespace and split into an array of lines.
const gameProblemSets = rawInputPayload.trim().split('\n');

let problemSetCursor = 0; // Index to track the current problem set being processed.

// Iterate through each problem set until a termination condition is met.
while (problemSetCursor < gameProblemSets.length) {
  const currentProblemString = gameProblemSets[problemSetCursor++];

  // The "0 0" string signals the end of all problem sets.
  if (currentProblemString === "0 0") {
    break; // Exit the main processing loop.
  }

  // Parse the current problem string into numerical values for players and initial resources.
  const parsedNumericalParameters = currentProblemString.split(' ').map(Number);

  // Perform basic validation on the parsed input.
  if (parsedNumericalParameters.length !== 2 || isNaN(parsedNumericalParameters[0]) || isNaN(parsedNumericalParameters[1])) {
    process.stderr.write(`Skipping invalid problem set line: ${currentProblemString}\n`);
    continue; // Move to the next problem set if the current one is malformed.
  }

  const totalParticipants = parsedNumericalParameters[0]; // Number of participants in this game.
  let currentResourcePool = parsedNumericalParameters[1]; // The current count of resources being passed around.

  // Store the initial resource count for checking the winning condition later.
  const initialResourceThreshold = currentResourcePool;

  // Initialize an array where each element represents a participant's accumulated resources.
  // All participants begin with zero resources.
  const participantInventory = new Array(totalParticipants).fill(0);

  let activeParticipantPointer = 0; // Index of the participant currently interacting with resources.
  let isGameConcluded = false; // Flag to indicate if a winner has been determined.

  // Define a generous upper limit for game rounds to prevent infinite loops in edge cases.
  const MAXIMUM_SIMULATION_CYCLES = 2_500_000; // Increased from original, using numeric separator.

  // Simulate the game round by round.
  for (let cycleCount = 0; cycleCount < MAXIMUM_SIMULATION_CYCLES; cycleCount++) {
    // Ensure the participant pointer wraps around to the first participant after the last one.
    if (activeParticipantPointer >= totalParticipants) {
      activeParticipantPointer = 0;
    }

    // Logic branch: either resources are available to distribute or they are not.
    if (currentResourcePool > 0) {
      // If resources are available, the current participant takes one.
      currentResourcePool -= 1; // Decrement the global resource pool.
      participantInventory[activeParticipantPointer] += 1; // Increment the participant's personal stash.

      // Check for the winning condition: the global pool is empty AND
      // the current participant's stash matches the initial total resources.
      if (currentResourcePool === 0 && participantInventory[activeParticipantPointer] === initialResourceThreshold) {
        // A winner is found! Output their index and mark the game as finished.
        process.stdout.write(activeParticipantPointer.toString() + '\n');
        isGameConcluded = true;
        break; // Exit the simulation loop.
      }
    } else {
      // If the global resource pool is empty, the current participant contributes their stash.
      currentResourcePool = participantInventory[activeParticipantPointer]; // Their stash becomes the new global pool.
      participantInventory[activeParticipantPointer] = 0; // Their personal stash is reset to zero.
    }

    // Advance to the next participant for the subsequent round.
    activeParticipantPointer++;
  }

  // Optional: Add a warning if a game doesn't conclude within the maximum cycles.
  if (!isGameConcluded) {
    // This section is added for robustness, indicating a potential issue or unexpected input.
    // process.stderr.write(`Warning: Game (N=${totalParticipants}, P=${initialResourceThreshold}) exceeded ${MAXIMUM_SIMULATION_CYCLES} cycles without conclusion.\n`);
  }
}

// --- Program Concluded ---