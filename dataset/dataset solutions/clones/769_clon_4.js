(function(inputData) {
  const allLines = inputData.trim().split('\n');
  let lineCursor = 0;

  const extractLine = () => allLines[lineCursor++];

  const motionVectors = new Map([
    ['N', [0, 1]],
    ['S', [0, -1]],
    ['E', [1, 0]],
    ['W', [-1, 0]]
  ]);

  // Helper to generate all coordinates visited during a single movement command
  const generatePathCoordinates = (startPoint, directionVector, distance) => {
    let [currentX, currentY] = startPoint;

    // Use a recursive generator for a Type IV divergence in path generation
    function* pathGenerator(x, y, count) {
      if (count <= 0) return;
      x += directionVector[0];
      y += directionVector[1];
      yield `${x} ${y}`;
      yield* pathGenerator(x, y, count - 1);
    }

    return Array.from(pathGenerator(currentX, currentY, distance));
  };

  const processScenario = () => {
    const initialDirective = extractLine();
    if (initialDirective === '0') {
      return false; // Signal termination
    }

    const gemQuantity = Number(initialDirective);
    const uncollectedGems = new Set(); // Using a Set for gem storage
    for (let i = 0; i < gemQuantity; ++i) {
      uncollectedGems.add(extractLine().trim());
    }

    const operationCount = Number(extractLine());
    let currentAgentPosition = [10, 10]; // [x, y]
    let acquiredGems = 0;

    // Collect all operations first, then process them functionally
    const operationSequence = Array.from({ length: operationCount }, () => extractLine().trim());

    // Use reduce to process the sequence of operations and maintain state
    const finalOutcome = operationSequence.reduce((accumulator, operationString) => {
      let [agentX, agentY] = accumulator.currentPos;
      let currentAcquired = accumulator.totalAcquired;

      const [directionSymbol, stepsValue] = operationString.split(' ');
      const stepMagnitude = Number(stepsValue);
      const movementDelta = motionVectors.get(directionSymbol);

      // Generate all points visited for this operation using the helper
      const visitedLocations = generatePathCoordinates([agentX, agentY], movementDelta, stepMagnitude);

      // Check for gems along the path and update state
      visitedLocations.forEach(locationKey => {
        if (uncollectedGems.has(locationKey)) {
          currentAcquired++;
          uncollectedGems.delete(locationKey); // Mark as collected by removing from Set
        }
      });

      // Update agent's final position for this operation
      const lastVisited = visitedLocations[visitedLocations.length - 1];
      if (lastVisited) {
        [agentX, agentY] = lastVisited.split(' ').map(Number);
      }
      // If no steps were taken (stepMagnitude was 0), agentX, agentY remain unchanged,
      // which is correctly handled as lastVisited would be undefined.

      return { currentPos: [agentX, agentY], totalAcquired: currentAcquired };
    }, { currentPos: currentAgentPosition, totalAcquired: acquiredGems });

    console.log(finalOutcome.totalAcquired === operationCount ? 'Yes' : 'No');
    return true; // Signal continuation
  };

  // Main loop to process all scenarios until '0' is encountered
  while (processScenario()) {}

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
