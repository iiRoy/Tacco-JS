// A modular component for optimizing travel routes, specifically
// addressing variations of the Traveling Salesperson Problem (TSP) within
// a mapping context.
// This implementation draws inspiration from works by
// James Tolley and Geir K. Engdahl.
//
// For further details and updates, refer to the project repository.
//
// Module version: 2.1.0; 2024-05-20
//
// Usage:
// Consult the project documentation for API details and examples.

(function() {

  let routeOptimizerInstance; // Singleton reference for the solver
  let mapDisplayElement; // The main map canvas DOM object
  let navInstructionsContainer; // DOM element for navigational directives
  let navSolutionResponse; // The detailed route solution from the mapping API
  let navServiceManager; // Service for handling navigation requests
  let geoCoderService; // Service for geocoding addresses
  const maxProblemNodes = 100; // Upper limit for problem size to manage API load
  const maxBruteForceLimit = 0; // Max nodes for brute-force calculation (very conservative)
  const maxDynamicProgLimit = 15; // Max nodes for dynamic programming (browser runtime constraints)
  const segmentWaypointLimit = 10; // Max waypoints per single segment API request
  const colossalDurationEstimate = 2 * 10**9; // A practical upper bound for route duration (approx. 63 years)
  let avoidMotorways = false; // Flag to prevent routing via highways
  let avoidTollRoads = false; // Flag to prevent routing via toll roads
  let currentTravelMode; // E.g., DRIVING, WALKING, BICYCLING
  let distanceMatrixIndex; // Helper for distance matrix lookups
  let journeyPoints = []; // Array of geographic coordinates (waypoints)
  let locationQueries = []; // Array of textual addresses
  const geoStatusMessages = {}; // Stores geocoding status messages (e.g., OK, ZERO_RESULTS)
  const navStatusMessages = {}; // Stores navigation status messages
  let locationLabels = []; // Labels associated with each location
  let parsedAddresses = []; // Processed addresses for display
  let activeWaypointsMask = []; // Boolean array indicating active waypoints
  let pendingGeoRequests = 0; // Counter for ongoing geocoding requests
  let isGeoProcessing = false; // Flag to indicate if geocoding is active
  let currentRequestSequence = 0; // Unique identifier for the current request batch
  let processedQueueCount = 0; // Number of processed requests in the current batch
  let waypointOrderArray; // Stores the sequence of waypoints for a solution
  let temporaryRouteSegments; // Intermediate storage for route segment details
  let interNodeDistances; // Matrix of distances between all active nodes
  let interNodeDurations; // Matrix of durations between all active nodes
  let computedRouteSegments; // Final array of route segments
  let currentDistance; // Current total distance of a path
  let currentDuration; // Current total duration of a path
  let visitedNodesFlags; // Boolean array for tracking visited nodes in algorithms
  let currentSolutionPath; // The path currently being evaluated
  let optimalSolutionPath; // The best path found so far
  let optimalSolutionDuration; // The duration of the best path
  let subsetBitmask; // For dynamic programming, represents a subset of nodes
  let activeNodeCount; // Number of active nodes in the problem
  let forwardCostAccumulator; // Accumulated costs for forward path traversals
  let backwardCostAccumulator; // Accumulated costs for backward path traversals
  let solutionImproved = false; // Flag to indicate if a solution was improved in an iteration
  let currentChunkNode; // A node within a chunk for processing
  let validChunkNode; // A valid node within a chunk
  let completedNavCalculations = 0; // Counter for completed navigation calculations
  let requiredNavCalculations = 0; // Total navigation calculations needed
  let directionsAreCached = false; // Flag if directions are retrieved from cache
  const apiRequestThrottle = 1000; // Milliseconds to wait between API requests
  let dummyNavResponseObject; // Object to hold travel info for renderer (travel mode, etc.)

  let onSolutionReady = () => {}; // Callback when a solution is found
  let onProgressUpdate = null; // Callback for progress notifications
  const defaultErrorNotifier = (solver, message) => alert(`Route calculation failed: ${message}`);
  let currentErrorNotifier = defaultErrorNotifier; // Callback for fatal errors
  let haltExecutionFlag = false; // Flag to stop ongoing computations
  let moduleLoadListener = null; // Listener for module load event
  let errorStateListener = null; // Listener for error state changes

  let travelUnits; // Units for distance/duration (e.g., METRIC, IMPERIAL)

  /**
   * Generates a greedy (nearest-neighbor) approximation for the TSP.
   * @param {number} processMode - 0 for full TSP, 1 for fixed start/end path.
   */
  const calculateGreedyPath = (processMode) => {
    let currentNode = 0;
    let pathLength = 0;
    let stepsToTake = activeNodeCount - 1;
    let finalNode = 0;
    let nodesToConsider = activeNodeCount;

    if (processMode === 1) {
      stepsToTake = activeNodeCount - 2;
      finalNode = activeNodeCount - 1;
      nodesToConsider = activeNodeCount - 1;
    }

    visitedNodesFlags = new Array(activeNodeCount).fill(false); // Initialize visited status for all nodes

    for (let step = 0; step < stepsToTake; ++step) {
      visitedNodesFlags[currentNode] = true;
      optimalSolutionPath[step] = currentNode;
      let nearestDuration = colossalDurationEstimate;
      let nearestIdx = -1;

      for (let nextCandidate = 1; nextCandidate < nodesToConsider; ++nextCandidate) {
        if (!visitedNodesFlags[nextCandidate] && interNodeDurations[currentNode][nextCandidate] < nearestDuration) {
          nearestDuration = interNodeDurations[currentNode][nextCandidate];
          nearestIdx = nextCandidate;
        }
      }
      pathLength += interNodeDurations[currentNode][nearestIdx];
      currentNode = nearestIdx;
    }

    optimalSolutionPath[stepsToTake] = (processMode === 1) ? finalNode : currentNode;
    pathLength += interNodeDurations[currentNode][finalNode];
    optimalSolutionDuration = pathLength;
  };

  /**
   * Retrieves the accumulated duration between two points in the current path.
   * Handles both forward and backward traversal efficiently.
   * @param {number} startIdx - Starting index in the current solution path.
   * @param {number} endIdx - Ending index in the current solution path.
   * @returns {number} The cumulative duration.
   */
  const getSegmentDuration = (startIdx, endIdx) => {
    if (startIdx <= endIdx) {
      return forwardCostAccumulator[endIdx] - forwardCostAccumulator[startIdx];
    } else {
      return backwardCostAccumulator[endIdx] - backwardCostAccumulator[startIdx];
    }
  };

  /**
   * Calculates the cost of a specific 3-opt permutation of the current solution.
   * @param {number} i1, i2, i3, i4, i5, i6 - Indices defining the permutation segments.
   * @returns {number} The total duration of the permuted path.
   */
  const computePermutationCost = (i1, i2, i3, i4, i5, i6) => {
    const nodeA = currentSolutionPath[i1];
    const nodeB = currentSolutionPath[i2];
    const nodeC = currentSolutionPath[i3];
    const nodeD = currentSolutionPath[i4];
    const nodeE = currentSolutionPath[i5];
    const nodeF = currentSolutionPath[i6];
    const pathEndIndex = currentSolutionPath.length - 1;

    // Calculate total cost by summing segment costs and new connections
    let totalCost = getSegmentDuration(0, i1) +
                    interNodeDurations[nodeA][nodeB] +
                    getSegmentDuration(i2, i3) +
                    interNodeDurations[nodeC][nodeD] +
                    getSegmentDuration(i4, i5) +
                    interNodeDurations[nodeE][nodeF] +
                    getSegmentDuration(i6, pathEndIndex);
    return totalCost;
  };

  /**
   * Refreshes the accumulated cost arrays for efficient segment duration lookups.
   */
  const refreshPathCosts = () => {
    const pathLen = currentSolutionPath.length;
    forwardCostAccumulator = new Array(pathLen).fill(0.0);
    backwardCostAccumulator = new Array(pathLen).fill(0.0);

    for (let i = 1; i < pathLen; ++i) {
      forwardCostAccumulator[i] = forwardCostAccumulator[i-1] + interNodeDurations[currentSolutionPath[i-1]][currentSolutionPath[i]];
    }
    optimalSolutionDuration = forwardCostAccumulator[pathLen-1]; // Update best known duration

    for (let i = pathLen - 2; i >= 0; --i) {
      backwardCostAccumulator[i] = backwardCostAccumulator[i+1] + interNodeDurations[currentSolutionPath[i+1]][currentSolutionPath[i]];
    }
  };

  /**
   * Applies a 3-opt move to the current solution path.
   * @param {number} p1, p2, p3, p4, p5, p6 - Indices defining the segments to be reordered.
   */
  const applyPermutation = (p1, p2, p3, p4, p5, p6) => {
    solutionImproved = true;
    const newPathSequence = [...currentSolutionPath]; // Create a copy

    let insertionPoint = p1 + 1;
    newPathSequence[insertionPoint++] = currentSolutionPath[p2];

    // Reorder segment 1
    if (p2 < p3) {
      for (let i = p2 + 1; i <= p3; ++i) {
        newPathSequence[insertionPoint++] = currentSolutionPath[i];
      }
    } else {
      for (let i = p2 - 1; i >= p3; --i) {
        newPathSequence[insertionPoint++] = currentSolutionPath[i];
      }
    }

    newPathSequence[insertionPoint++] = currentSolutionPath[p4];

    // Reorder segment 2
    if (p4 < p5) {
      for (let i = p4 + 1; i <= p5; ++i) {
        newPathSequence[insertionPoint++] = currentSolutionPath[i];
      }
    } else {
      for (let i = p4 - 1; i >= p5; --i) {
        newPathSequence[insertionPoint++] = currentSolutionPath[i];
      }
    }
    newPathSequence[insertionPoint++] = currentSolutionPath[p6];
    currentSolutionPath = newPathSequence; // Update with the new path

    refreshPathCosts(); // Recalculate costs for the new path
  };

  /**
   * Implements the 3-opt local search algorithm to improve a TSP solution.
   * @param {number} executionMode - 0 for full TSP, 1 for fixed start/end path.
   */
  const optimizeWith3Opt = (executionMode) => {
    // Initial path generation (e.g., greedy or random) should happen before this.
    // For now, assume optimalSolutionPath is already populated (e.g., from a greedy run).
    if (!optimalSolutionPath || optimalSolutionPath.length === 0) {
        optimalSolutionPath = new Array(activeNodeCount);
        calculateGreedyPath(executionMode); // Ensure an initial path exists
    }

    currentSolutionPath = [...optimalSolutionPath]; // Start with the best known path
    refreshPathCosts(); // Initialize costs for the current path

    solutionImproved = true;
    while (solutionImproved) {
      solutionImproved = false;
      // Iterate through all possible combinations of three segments to reverse or swap
      for (let i = 0; i < currentSolutionPath.length - 3; ++i) {
        for (let j = i + 1; j < currentSolutionPath.length - 2; ++j) {
          for (let k = j + 1; k < currentSolutionPath.length - 1; ++k) {
            // Test 7 possible 3-opt moves (excluding the identity move)
            // Original: A-B C-D E-F
            // Possible reconfigurations:
            // A-B C-E D-F
            // A-C B-D E-F
            // A-C B-E D-F
            // A-D C-B E-F
            // A-D C-E B-F
            // A-E D-C B-F
            // A-E D-B C-F

            // (1) A-B C-D E-F -> A-B C-E D-F (segment CD reversed, then CE, DF connected)
            if (computePermutationCost(i, i+1, j, k, j+1, k+1) < optimalSolutionDuration) {
              applyPermutation(i, i+1, j, k, j+1, k+1);
            }
            // (2) A-B C-D E-F -> A-C B-D E-F (segment BC reversed)
            if (computePermutationCost(i, j, i+1, j+1, k, k+1) < optimalSolutionDuration) {
              applyPermutation(i, j, i+1, j+1, k, k+1);
            }
            // (3) A-B C-D E-F -> A-C B-E D-F (segments BC & DE reversed)
            if (computePermutationCost(i, j, i+1, k, j+1, k+1) < optimalSolutionDuration) {
              applyPermutation(i, j, i+1, k, j+1, k+1);
            }
            // (4) A-B C-D E-F -> A-D C-B E-F (segment CD reversed, then AD, CB connected)
            if (computePermutationCost(i, j+1, k, i+1, j, k+1) < optimalSolutionDuration) {
              applyPermutation(i, j+1, k, i+1, j, k+1);
            }
            // (5) A-B C-D E-F -> A-D C-E B-F (segments CD & BC reversed, then AD, CE, BF connected)
            if (computePermutationCost(i, j+1, k, j, i+1, k+1) < optimalSolutionDuration) {
              applyPermutation(i, j+1, k, j, i+1, k+1);
            }
            // (6) A-B C-D E-F -> A-E D-C B-F (segments DE & BC reversed, then AE, DC, BF connected)
            if (computePermutationCost(i, k, j+1, i+1, j, k+1) < optimalSolutionDuration) {
              applyPermutation(i, k, j+1, i+1, j, k+1);
            }
            // (7) A-B C-D E-F -> A-E D-B C-F (segments DE & CD reversed, then AE, DB, CF connected)
            if (computePermutationCost(i, k, j+1, j, i+1, k+1) < optimalSolutionDuration) {
              applyPermutation(i, k, j+1, j, i+1, k+1);
            }
          }
        }
      }
    }
    // Once no further improvement is found, the current solution path is the best.
    optimalSolutionPath = [...currentSolutionPath];
  };

  /**
   * Solves the TSP problem using Ant Colony Optimization (ACO) combined with 2-opt local search.
   * This provides a near-optimal solution.
   * @param {number} operatingMode - 0 for full TSP, 1 for fixed start/end path.
   */
  const solveWithAntColony2Opt = (operatingMode) => {
    const pheromoneDecay = 0.1; // Rate at which pheromone trails evaporate
    const pheromoneImportance = 0.1; // Alpha: Influence of existing pheromone trails
    const durationInfluence = 2.0; // Beta: Influence of edge durations (inverse)
    const rewardAsymptote = 0.9; // Factor for sharpening the reward function
    const numAnts = 20; // Number of artificial ants per wave
    const numWaves = 20; // Number of iterations (waves)

    let pheromoneGrid = []; // Pheromone levels on edges
    let nextPheromoneGrid = []; // Accumulator for pheromone updates

    // Initialize pheromone grids
    for (let i = 0; i < activeNodeCount; ++i) {
      pheromoneGrid[i] = [];
      nextPheromoneGrid[i] = [];
      for (let j = 0; j < activeNodeCount; ++j) {
        pheromoneGrid[i][j] = 1; // Start with uniform pheromone
        nextPheromoneGrid[i][j] = 0.0;
      }
    }

    let probabilityDistribution = []; // Probabilities for ant path selection

    let endPoint = 0;
    let startPoint = 0;
    let pathSegmentCount = activeNodeCount - 1;
    let eligibleDestinations = activeNodeCount;

    if (operatingMode === 1) {
      endPoint = activeNodeCount - 1;
      pathSegmentCount = activeNodeCount - 2;
      eligibleDestinations = activeNodeCount - 1;
    }

    optimalSolutionPath = new Array(activeNodeCount).fill(0);
    optimalSolutionDuration = colossalDurationEstimate;

    for (let wave = 0; wave < numWaves; ++wave) {
      for (let ant = 0; ant < numAnts; ++ant) {
        let currentAntNode = startPoint;
        let currentAntPathLength = 0;
        visitedNodesFlags = new Array(activeNodeCount).fill(false); // Reset visited nodes for each ant

        currentSolutionPath = new Array(activeNodeCount);
        currentSolutionPath[0] = currentAntNode;
        for (let step = 0; step < pathSegmentCount; ++step) {
          visitedNodesFlags[currentAntNode] = true;
          let cumulativeProbability = 0.0;

          // Calculate probabilities for next step
          for (let nextLoc = 1; nextLoc < eligibleDestinations; ++nextLoc) {
            if (!visitedNodesFlags[nextLoc]) {
              probabilityDistribution[nextLoc] = Math.pow(pheromoneGrid[currentAntNode][nextLoc], pheromoneImportance) *
                                                 Math.pow(interNodeDurations[currentAntNode][nextLoc], -durationInfluence);
              cumulativeProbability += probabilityDistribution[nextLoc];
            }
          }

          let randomChoice = Math.random() * cumulativeProbability;
          let chosenNextNode = -1;

          // Select next node based on probability
          for (let nextLoc = 1; nextLoc < eligibleDestinations; ++nextLoc) {
            if (!visitedNodesFlags[nextLoc]) {
              randomChoice -= probabilityDistribution[nextLoc];
              if (randomChoice < 0) {
                chosenNextNode = nextLoc;
                break;
              }
            }
          }

          if (chosenNextNode === -1) { // Fallback if no node was chosen (e.g., due to floating point error or single remaining node)
              // Find the first unvisited node as a fallback
              for (let nextLoc = 1; nextLoc < eligibleDestinations; ++nextLoc) {
                  if (!visitedNodesFlags[nextLoc]) {
                      chosenNextNode = nextLoc;
                      break;
                  }
              }
          }

          currentAntPathLength += interNodeDurations[currentAntNode][chosenNextNode];
          currentSolutionPath[step + 1] = chosenNextNode;
          currentAntNode = chosenNextNode;
        }

        currentSolutionPath[pathSegmentCount + 1] = endPoint;
        currentAntPathLength += interNodeDurations[currentAntNode][endPoint];

        // Apply 2-opt local search to the ant's path
        let lastOptimizationStep = activeNodeCount;
        if (operatingMode === 1) {
          lastOptimizationStep = activeNodeCount - 1;
        }
        let pathModified = true;
        let optIndex = 0;
        while (pathModified) {
          pathModified = false;
          for (; optIndex < lastOptimizationStep - 2 && !pathModified; ++optIndex) {
            let segmentCost1 = interNodeDurations[currentSolutionPath[optIndex + 1]][currentSolutionPath[optIndex + 2]];
            let segmentCost1Reversed = interNodeDurations[currentSolutionPath[optIndex + 2]][currentSolutionPath[optIndex + 1]];
            let segmentCost0 = interNodeDurations[currentSolutionPath[optIndex]][currentSolutionPath[optIndex + 1]];
            let tempNodeHolder;
            let currentPathTotal, newPathTotal;

            for (let j = optIndex + 2; j < lastOptimizationStep && !pathModified; ++j) {
              currentPathTotal = segmentCost1 + segmentCost0 + interNodeDurations[currentSolutionPath[j]][currentSolutionPath[j + 1]];
              newPathTotal = segmentCost1Reversed + interNodeDurations[currentSolutionPath[optIndex]][currentSolutionPath[j]] +
                             interNodeDurations[currentSolutionPath[optIndex + 1]][currentSolutionPath[j + 1]];

              if (currentPathTotal > newPathTotal) {
                currentAntPathLength += (newPathTotal - currentPathTotal);
                // Reverse the segment
                for (let k = 0; k < Math.floor((j - optIndex) / 2); ++k) {
                  tempNodeHolder = currentSolutionPath[optIndex + 1 + k];
                  currentSolutionPath[optIndex + 1 + k] = currentSolutionPath[j - k];
                  currentSolutionPath[j - k] = tempNodeHolder;
                }
                pathModified = true;
                --optIndex; // Re-evaluate from this point
              }
              segmentCost1 += interNodeDurations[currentSolutionPath[j]][currentSolutionPath[j + 1]];
              segmentCost1Reversed += interNodeDurations[currentSolutionPath[j + 1]][currentSolutionPath[j]];
            }
          }
        }

        // Update global best path if current ant's path is better
        if (currentAntPathLength < optimalSolutionDuration) {
          optimalSolutionPath = [...currentSolutionPath];
          optimalSolutionDuration = currentAntPathLength;
        }

        // Deposit pheromone on the ant's path
        for (let i = 0; i <= pathSegmentCount; ++i) {
          nextPheromoneGrid[currentSolutionPath[i]][currentSolutionPath[i + 1]] +=
            (optimalSolutionDuration - rewardAsymptote * optimalSolutionDuration) / (numAnts * (currentAntPathLength - rewardAsymptote * optimalSolutionDuration));
        }
      }

      // Evaporate and apply new pheromones
      for (let i = 0; i < activeNodeCount; ++i) {
        for (let j = 0; j < activeNodeCount; ++j) {
          pheromoneGrid[i][j] = pheromoneGrid[i][j] * (1.0 - pheromoneDecay) + pheromoneDecay * nextPheromoneGrid[i][j];
          nextPheromoneGrid[i][j] = 0.0; // Reset for next wave
        }
      }
    }
  };

  /**
   * Finds the optimal solution to the TSP problem using a brute-force approach.
   * This is computationally expensive and suitable only for very small problem sizes.
   * @param {number} mode - 0 for full TSP, 1 for fixed start/end path.
   * @param {number} currentVertex - The current node in the path.
   * @param {number} currentPathSum - The accumulated duration of the path so far.
   * @param {number} currentPathDepth - The current number of steps taken in the path.
   */
  const solveBruteForce = (mode, currentVertex, currentPathSum, currentPathDepth) => {
    // Define problem parameters based on mode
    let totalPathSteps = activeNodeCount;
    let finalDestination = 0;
    let visitableNodes = activeNodeCount;

    if (mode === 1) {
      totalPathSteps = activeNodeCount - 1;
      finalDestination = activeNodeCount - 1;
      visitableNodes = activeNodeCount - 1;
    }

    // Pruning: If current path already exceeds best known, stop this branch.
    if (currentPathSum + interNodeDurations[currentVertex][finalDestination] >= optimalSolutionDuration) {
      return;
    }

    // Base case: If all steps are completed
    if (currentPathDepth === totalPathSteps) {
      currentPathSum += interNodeDurations[currentVertex][finalDestination];
      currentSolutionPath[currentPathDepth] = finalDestination;
      optimalSolutionDuration = currentPathSum;
      // Copy current path to best path
      for (let i = 0; i <= totalPathSteps; ++i) {
        optimalSolutionPath[i] = currentSolutionPath[i];
      }
      return;
    }

    // Recursive step: Try all unvisited nodes
    for (let i = 1; i < visitableNodes; ++i) {
      if (!visitedNodesFlags[i]) {
        visitedNodesFlags[i] = true;
        currentSolutionPath[currentPathDepth] = i;
        solveBruteForce(mode, i, currentPathSum + interNodeDurations[currentVertex][i], currentPathDepth + 1);
        visitedNodesFlags[i] = false; // Backtrack
      }
    }
  };

  /**
   * Computes the next integer that has 'count' bits set to 1, in lexicographical order.
   * Used in dynamic programming to iterate through subsets of nodes.
   * Modifies the global `subsetBitmask` array.
   * @param {number} count - The desired number of set bits.
   * @returns {number} The integer representation of the next subset, or -1 if no more subsets.
   */
  const getNextSubsetBitmask = (count) => {
    let currentSetBits = 0;
    // Count current set bits in subsetBitmask
    for (let i = 0; i < activeNodeCount; ++i) {
      currentSetBits += subsetBitmask[i];
    }

    if (currentSetBits < count) {
      // If current set is smaller than target count, initialize to the smallest set
      for (let i = 0; i < count; ++i) {
        subsetBitmask[i] = 1;
      }
      for (let i = count; i < activeNodeCount; ++i) {
        subsetBitmask[i] = 0;
      }
    } else {
      // Find the first '1' bit
      let firstSetBit = -1;
      for (let i = 0; i < activeNodeCount; ++i) {
        if (subsetBitmask[i]) {
          firstSetBit = i;
          break;
        }
      }
      // If no '1' found, this logic might be problematic, but should not happen if currentSetBits > 0
      if (firstSetBit === -1) return -1; // Should not occur in normal execution flow after initialization

      // Find the first '0' bit after the first '1'
      let firstUnsetBit = -1;
      for (let i = firstSetBit + 1; i < activeNodeCount; ++i) {
        if (!subsetBitmask[i]) {
          firstUnsetBit = i;
          break;
        }
      }

      if (firstUnsetBit < 0) { // No more combinations possible
        return -1;
      }

      // Increment the first '0' that has '1's behind it
      subsetBitmask[firstUnsetBit] = 1;
      // Reset bits before 'firstUnsetBit' to their lowest possible value (all '1's at the beginning)
      let onesToMove = 0;
      for (let i = 0; i < firstUnsetBit; i++) {
        if (subsetBitmask[i] === 1) {
          onesToMove++;
        }
        subsetBitmask[i] = 0;
      }
      for (let i = 0; i < onesToMove; i++) {
        subsetBitmask[i] = 1;
      }
    }

    // Convert the bitmask array back to an integer
    let resultInteger = 0;
    for (let i = 0; i < activeNodeCount; ++i) {
      if (subsetBitmask[i]) {
        resultInteger |= (1 << i); // Set the i-th bit if subsetBitmask[i] is 1
      }
    }
    return resultInteger;
  };


  /**
   * Solves the TSP problem using dynamic programming (Held-Karp algorithm).
   * This provides an optimal solution but has exponential memory and time complexity.
   * @param {number} algoMode - 0 for full TSP, 1 for fixed start/end path.
   */
  const solveDynamicProgramming = (algoMode) => {
    const totalSubsets = 1 << activeNodeCount; // 2^N subsets
    let dpCostMatrix = []; // C[subset][lastNode] = min cost
    let dpParentMatrix = []; // parent[subset][lastNode] = previous node

    // Initialize matrices
    for (let i = 0; i < totalSubsets; ++i) {
      dpCostMatrix[i] = new Array(activeNodeCount).fill(colossalDurationEstimate);
      dpParentMatrix[i] = new Array(activeNodeCount).fill(0);
    }

    // Base case: Starting from node 0 to node k (subset {0, k})
    for (let k = 1; k < activeNodeCount; ++k) {
      const subsetIndex = 1 | (1 << k); // Subset containing 0 and k
      dpCostMatrix[subsetIndex][k] = interNodeDurations[0][k];
    }

    // Iterate through subsets of increasing size (s)
    for (let s = 3; s <= activeNodeCount; ++s) {
      subsetBitmask = new Array(activeNodeCount).fill(0); // Reset for getNextSubsetBitmask
      let currentSubsetIdx = getNextSubsetBitmask(s); // Get subset with 's' elements

      while (currentSubsetIdx >= 0) {
        // Iterate through all possible ending nodes 'k' in the current subset
        for (let k = 1; k < activeNodeCount; ++k) {
          if ((currentSubsetIdx >> k) & 1) { // If 'k' is in the current subset
            const previousSubsetIdx = currentSubsetIdx ^ (1 << k); // Subset without 'k'

            // Find the minimum cost to reach 'k' from any 'm' in the previous subset
            for (let m = 0; m < activeNodeCount; ++m) {
              if (((previousSubsetIdx >> m) & 1) && m !== k) { // If 'm' is in previous subset and not 'k'
                if (dpCostMatrix[previousSubsetIdx][m] + interNodeDurations[m][k] < dpCostMatrix[currentSubsetIdx][k]) {
                  dpCostMatrix[currentSubsetIdx][k] = dpCostMatrix[previousSubsetIdx][m] + interNodeDurations[m][k];
                  dpParentMatrix[currentSubsetIdx][k] = m;
                }
              }
            }
          }
        }
        currentSubsetIdx = getNextSubsetBitmask(s); // Get next subset of size 's'
      }
    }

    // Reconstruct the optimal path
    optimalSolutionPath = new Array(activeNodeCount + (algoMode === 0 ? 1 : 0)).fill(0); // Path length is N for fixed, N+1 for full TSP
    currentSolutionPath = new Array(activeNodeCount + (algoMode === 0 ? 1 : 0)).fill(0);

    // Determine the actual end node based on algoMode
    if (algoMode === 0) { // Full TSP, find the best end node to close the loop
        let minFinalCost = colossalDurationEstimate;
        let lastVisitedNode = -1;
        const fullSubsetMask = (1 << activeNodeCount) - 1; // All nodes visited

        for (let k = 1; k < activeNodeCount; ++k) {
            if (dpCostMatrix[fullSubsetMask][k] + interNodeDurations[k][0] < minFinalCost) {
                minFinalCost = dpCostMatrix[fullSubsetMask][k] + interNodeDurations[k][0];
                lastVisitedNode = k;
            }
        }
        optimalSolutionDuration = minFinalCost;
        optimalSolutionPath[activeNodeCount] = 0; // The last node added to path is 0
        let currentIdx = fullSubsetMask;
        let currentNode = lastVisitedNode;
        for (let i = activeNodeCount - 1; i >= 0; --i) {
            optimalSolutionPath[i] = currentNode;
            let prevNode = dpParentMatrix[currentIdx][currentNode];
            currentIdx ^= (1 << currentNode); // Remove current node from subset
            currentNode = prevNode;
        }
    } else { // Fixed start (0) and end (activeNodeCount - 1)
        const fullSubsetMask = (1 << activeNodeCount) - 1; // All nodes visited
        const targetEndNode = activeNodeCount - 1;

        optimalSolutionDuration = dpCostMatrix[fullSubsetMask][targetEndNode];

        let currentIdx = fullSubsetMask;
        let currentNode = targetEndNode;
        for (let i = activeNodeCount - 1; i >= 0; --i) { // Path length is activeNodeCount
            optimalSolutionPath[i] = currentNode;
            let prevNode = dpParentMatrix[currentIdx][currentNode];
            currentIdx ^= (1 << currentNode); // Remove current node from subset
            currentNode = prevNode;
        }
    }
  };

})();