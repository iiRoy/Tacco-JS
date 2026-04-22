/*
  This module offers reusable functionality for solving routing optimization
  problems for mapping services.
  The original creators of this code are Jane Smith <jane.smith [at] example.com>
  and John Doe <john.doe (at) example.org>

  For the latest iteration of this script, please refer to
  http://example.com/route-optimization-library/

  To receive notifications about updates, subscribe to route-optimization-announce@googlegroups.com

  version 1.0.1; 2023-10-27

  // Documentation:
  Consult http://example.com/route-optimization-library/ for usage instructions.
*/

(function() {

  var routeSolver;             // Singleton instance of the solver
  var webMap;                  // The map display element
  var routeDisplayArea;        // The UI element for displaying driving directions
  var webRouteResult;          // The routing data returned from the mapping API
  var webRouteService;         // The service for requesting routes
  var webAddressConverter;     // The service for converting addresses to coordinates
  var maxProblemNodes = 100;   // A hard limit on the number of locations to process, primarily to protect API quotas.
  var maxBruteForceNodes = 0;  // Maximum size for exhaustive search, may seem low, but it's computationally intensive.
  var maxDynamicProgNodes = 15; // Max size for dynamic programming, often limited by browser memory and runtime.
  var maxSegmentWaypoints = 10; // Maximum number of intermediate stops in a single route segment request.
  var longestJourneyGuard = 2000000000; // Approximately 63 years. Routes this long are highly unlikely and indicate an error.
  var shunMotorways = false;   // Flag to indicate if major highways should be avoided. Default is false.
  var shunTollRoads = false;   // Flag to indicate if roads with tolls should be avoided. Default is false.
  var journeyMethod;           // The chosen mode of travel (e.g., driving, walking)
  var distanceMapIdx;          // Index for distance calculations
  var pathPoints = [];         // Array to store geographic coordinates of points
  var locationStrings = [];    // Array to store textual addresses or location names
  var GEO_STATUS_INFO = {};    // Object to hold messages related to geocoding statuses
  var ROUTE_STATUS_INFO = {};  // Object to hold messages related to routing statuses
  var pointLabels = [];        // Array for labels associated with each point
  var inputLocations = [];     // Array for initial raw address inputs
  var activePathPoints = [];   // Array indicating which path points are currently active for the calculation
  var locationQueriesCount = 0; // Counter for ongoing geocoding requests
  var isLocationQuerying = false; // Flag indicating if geocoding requests are actively being processed
  var queryIndex = 0;          // Identifier for the current request batch
  var currentQueueIndex = 0;   // Identifier for the current item being processed in a queue
  var pathPointArray;          // Temporary array for reordering path points
  var segmentDurationsTemp;    // Temporary storage for segment duration data
  var travelDistances;         // Matrix storing distances between all pairs of nodes
  var travelTimes;             // Matrix storing travel times (durations) between all pairs of nodes
  var routeSegments;           // Processed route segments from the mapping API
  var nodeDistances;           // Distances between nodes in the current problem
  var nodeTravelTimes;         // Travel times between nodes in the current problem
  var visitedNodes;            // Boolean array to track visited nodes during pathfinding
  var currentRouteOrder;       // The current sequence of nodes being evaluated
  var optimalRouteOrder;       // The best sequence of nodes found so far
  var minimumTotalTime;        // The shortest total travel time found so far
  var nextCombinationSet;      // Helper array for dynamic programming subset generation
  var numActiveNodes;          // The count of nodes currently involved in the TSP calculation
  var cumulativeCostForward;   // Costs accumulated traversing the path in forward direction
  var cumulativeCostBackward;  // Costs accumulated traversing the path in backward direction
  var hasImprovedSolution = false; // Flag indicating if the solution was improved in the last iteration
  var segmentNode;             // A temporary node for chunk processing
  var validSegmentNode;        // A valid temporary node for chunk processing
  var numRoutesCalculated = 0; // Count of completed route calculations
  var numRoutesRequired = 0;   // Total number of route calculations needed
  var areRoutesCached = false; // Flag indicating if route data is available from cache
  var apiCooldownPeriod = 1000; // Time in milliseconds to wait between API requests to respect limits
  var mockRouteData;           // Object to store travel information (e.g., travel mode) for rendering purposes.

  var onCompletionHandler = function(){};
  var onProgressUpdateHandler = null;
  var defaultErrorHandler = function(solverInstance, errorMessage) { alert("Routing request encountered an issue: " + errorMessage); }
  var currentErrorHandler = defaultErrorHandler;
  var haltProcessingFlag = false; // Flag to stop ongoing computations
  var loadCompletionListener = null;
  var errorNotificationListener = null;

  var routeMeasurementUnits;   // Units for displaying route distance/duration

  /** Calculates a greedy (nearest-neighbor) solution for the travel problem.
   *  @param {number} optimizationMode - 0 for full TSP, 1 for fixed start/end path.
   */
  function solveGreedyPath(optimizationMode) {
    var currentNode = 0;
    var currentTotalDistance = 0;
    var totalSteps = numActiveNodes - 1;
    var finalNode = 0;
    var nodesToExplore = numActiveNodes;
    if (optimizationMode == 1) {
      totalSteps = numActiveNodes - 2;
      finalNode = numActiveNodes - 1;
      nodesToExplore = numActiveNodes - 1;
    }
    for (var currentStep = 0; currentStep < totalSteps; ++currentStep) {
      visitedNodes[currentNode] = true;
      optimalRouteOrder[currentStep] = currentNode;
      var closestDistance = longestJourneyGuard;
      var closestNodeIndex = -1;
      for (var nextNode = 1; nextNode < nodesToExplore; ++nextNode) {
	if (!visitedNodes[nextNode] && nodeTravelTimes[currentNode][nextNode] < closestDistance) {
	  closestDistance = nodeTravelTimes[currentNode][nextNode];
	  closestNodeIndex = nextNode;
	}
      }
      currentTotalDistance += nodeTravelTimes[currentNode][closestNodeIndex];
      currentNode = closestNodeIndex;
    }
    if (optimizationMode == 1) optimalRouteOrder[totalSteps] = finalNode;
    else optimalRouteOrder[totalSteps] = currentNode;
    currentTotalDistance += nodeTravelTimes[currentNode][finalNode];
    minimumTotalTime = currentTotalDistance;
  }

  /** Retrieves the travel duration for a segment of the current solution path
   *  between two given offsets, idxA and idxB.
   *  Supports both forward and reverse segment traversal.
   *  @param {number} idxA - Starting index of the path segment.
   *  @param {number} idxB - Ending index of the path segment.
   *  @returns {number} The cumulative travel cost for the segment.
   */
  function calculateSegmentCost(idxA, idxB) {
    if (idxA <= idxB) {
      return cumulativeCostForward[idxB] - cumulativeCostForward[idxA];
    } else {
      return cumulativeCostBackward[idxB] - cumulativeCostBackward[idxA];
    }
  }

  /** Determines the total travel cost for a specific 3-opt path rearrangement.
   *  @param {number} idxA, idxB, idxC, idxD, idxE, idxF - Indices defining the 3-opt segment breaks.
   *  @returns {number} The calculated cost for the proposed permutation.
   */
  function calculatePermutationCost(idxA, idxB, idxC, idxD, idxE, idxF) {
    var nodeA = currentRouteOrder[idxA];
    var nodeB = currentRouteOrder[idxB];
    var nodeC = currentRouteOrder[idxC];
    var nodeD = currentRouteOrder[idxD];
    var nodeE = currentRouteOrder[idxE];
    var nodeF = currentRouteOrder[idxF];
    var lastIdx = currentRouteOrder.length - 1;

    var computedCost = calculateSegmentCost(0, idxA) + nodeTravelTimes[nodeA][nodeB] + calculateSegmentCost(idxB, idxC) + nodeTravelTimes[nodeC][nodeD] + calculateSegmentCost(idxD, idxE) + nodeTravelTimes[nodeE][nodeF] + calculateSegmentCost(idxF, lastIdx);
    return computedCost;
  }

  /** Refreshes the internal data structures required for efficient
   *  cost calculation (`calculateSegmentCost` and `calculatePermutationCost`).
   */
  function refreshCumulativeCosts() {
    cumulativeCostForward = new Array(currentRouteOrder.length);
    cumulativeCostBackward = new Array(currentRouteOrder.length);

    cumulativeCostForward[0] = 0.0;
    for (var loopVarI = 1; loopVarI < currentRouteOrder.length; ++loopVarI) {
      cumulativeCostForward[loopVarI] = cumulativeCostForward[loopVarI-1] + nodeTravelTimes[currentRouteOrder[loopVarI-1]][currentRouteOrder[loopVarI]];
    }
    minimumTotalTime = cumulativeCostForward[currentRouteOrder.length-1];

    cumulativeCostBackward[currentRouteOrder.length-1] = 0.0;
    for (var loopVarI = currentRouteOrder.length - 2; loopVarI >= 0; --loopVarI) {
      cumulativeCostBackward[loopVarI] = cumulativeCostBackward[loopVarI+1] + nodeTravelTimes[currentRouteOrder[loopVarI+1]][currentRouteOrder[loopVarI]];
    }
  }

  /** Applies a specified 3-opt move to the current route solution.
   *  @param {number} idxA, idxB, idxC, idxD, idxE, idxF - Indices defining the segments for the 3-opt swap.
   */
  function applyPermutationUpdate(idxA, idxB, idxC, idxD, idxE, idxF) {
    hasImprovedSolution = true;
    var tempRouteOrder = new Array(currentRouteOrder.length);
    for (var loopVarI = 0; loopVarI < currentRouteOrder.length; ++loopVarI) tempRouteOrder[loopVarI] = currentRouteOrder[loopVarI];
    var insertOffset = idxA + 1;
    tempRouteOrder[insertOffset++] = currentRouteOrder[idxB];
    if (idxB < idxC) {
      for (var loopVarI = idxB + 1; loopVarI <= idxC; ++loopVarI) {
	tempRouteOrder[insertOffset++] = currentRouteOrder[loopVarI];
      }
    } else {
      for (var loopVarI = idxB - 1; loopVarI >= idxC; --loopVarI) {
	tempRouteOrder[insertOffset++] = currentRouteOrder[loopVarI];
      }
    }
    tempRouteOrder[insertOffset++] = currentRouteOrder[idxD];
    if (idxD < idxE) {
      for (var loopVarI = idxD + 1; loopVarI <= idxE; ++loopVarI) {
	tempRouteOrder[insertOffset++] = currentRouteOrder[loopVarI];
      }
    } else {
      for (var loopVarI = idxD - 1; loopVarI >= idxE; --loopVarI) {
	tempRouteOrder[insertOffset++] = currentRouteOrder[loopVarI];
      }
    }
    tempRouteOrder[insertOffset++] = currentRouteOrder[idxF];
    currentRouteOrder = tempRouteOrder;

    refreshCumulativeCosts();
  }

  /** Employs the 3-opt algorithm to discover an improved solution for the TSP.
   *  @param {number} optimizationMode - 0 for full TSP, 1 for fixed start/end path.
   */
  function optimizeK3Path(optimizationMode) {
    // A greedy initial solution can be used here, but is commented out for now.
    // solveGreedyPath(optimizationMode);
    currentRouteOrder = new Array(optimalRouteOrder.length);
    for (var loopVarI = 0; loopVarI < optimalRouteOrder.length; ++loopVarI) currentRouteOrder[loopVarI] = optimalRouteOrder[loopVarI];

    refreshCumulativeCosts();
    hasImprovedSolution = true;
    while (hasImprovedSolution) {
      hasImprovedSolution = false;
      for (var loopVarI = 0; loopVarI < currentRouteOrder.length - 3; ++loopVarI) {
	for (var loopVarJ = loopVarI+1; loopVarJ < currentRouteOrder.length - 2; ++loopVarJ) {
	  for (var loopVarK = loopVarJ+1; loopVarK < currentRouteOrder.length - 1; ++loopVarK) {
	    if (calculatePermutationCost(loopVarI, loopVarI+1, loopVarJ, loopVarK, loopVarJ+1, loopVarK+1) < minimumTotalTime)
	      applyPermutationUpdate(loopVarI, loopVarI+1, loopVarJ, loopVarK, loopVarJ+1, loopVarK+1);
	    if (calculatePermutationCost(loopVarI, loopVarJ, loopVarI+1, loopVarJ+1, loopVarK, loopVarK+1) < minimumTotalTime)
	      applyPermutationUpdate(loopVarI, loopVarJ, loopVarI+1, loopVarJ+1, loopVarK, loopVarK+1);
	    if (calculatePermutationCost(loopVarI, loopVarJ, loopVarI+1, loopVarK, loopVarJ+1, loopVarK+1) < minimumTotalTime)
	      applyPermutationUpdate(loopVarI, loopVarJ, loopVarI+1, loopVarK, loopVarJ+1, loopVarK+1);
	    if (calculatePermutationCost(loopVarI, loopVarJ+1, loopVarK, loopVarI+1, loopVarJ, loopVarK+1) < minimumTotalTime)
	      applyPermutationUpdate(loopVarI, loopVarJ+1, loopVarK, loopVarI+1, loopVarJ, loopVarK+1);
	    if (calculatePermutationCost(loopVarI, loopVarJ+1, loopVarK, loopVarJ, loopVarI+1, loopVarK+1) < minimumTotalTime)
	      applyPermutationUpdate(loopVarI, loopVarJ+1, loopVarK, loopVarJ, loopVarI+1, loopVarK+1);
	    if (calculatePermutationCost(loopVarI, loopVarK, loopVarJ+1, loopVarI+1, loopVarJ, loopVarK+1) < minimumTotalTime)
	      applyPermutationUpdate(loopVarI, loopVarK, loopVarJ+1, loopVarI+1, loopVarJ, loopVarK+1);
	    if (calculatePermutationCost(loopVarI, loopVarK, loopVarJ+1, loopVarJ, loopVarI+1, loopVarK+1) < minimumTotalTime)
	      applyPermutationUpdate(loopVarI, loopVarK, loopVarJ+1, loopVarJ, loopVarI+1, loopVarK+1);
	  }
	}
      }
    }
    for (var loopVarI = 0; loopVarI < optimalRouteOrder.length; ++loopVarI) optimalRouteOrder[loopVarI] = currentRouteOrder[loopVarI];
  }

  /* Determines a near-optimal solution for the TSP using Ant Colony Optimization
   * combined with local optimization (k2-opting each candidate path).
   * Execution time complexity is O(iterationWaves * colonySize * numActiveNodes ^ 2) for ACO
   * and O(iterationWaves * colonySize * numActiveNodes ^ 3) when considering rewiring.
   *
   * If optimizationMode is 1, the path begins at node 0 and concludes at node numActiveNodes-1.
   * @param {number} optimizationMode - 0 for full TSP, 1 for fixed start/end path.
   */
  function solveAntColonyK2(optimizationMode) {
    var pheromoneInfluence = 0.1; // Weight given to existing pheromone trails
    var durationImpact = 2.0;    // Weight given to travel times (durations)
    var evaporationRate = 0.1;   // Rate at which pheromone trails decay
    var rewardScalingFactor = 0.9; // Factor determining the sensitivity of reward to solution quality
    var pheromoneMatrix = [];
    var nextPheromoneMatrix = [];
    var probabilityArray = [];
    var colonySize = 20;
    var iterationWaves = 20;
    for (var loopVarI = 0; loopVarI < numActiveNodes; ++loopVarI) {
      pheromoneMatrix[loopVarI] = [];
      nextPheromoneMatrix[loopVarI] = [];
    }
    for (var loopVarI = 0; loopVarI < numActiveNodes; ++loopVarI) {
      for (var loopVarJ = 0; loopVarJ < numActiveNodes; ++loopVarJ) {
	pheromoneMatrix[loopVarI][loopVarJ] = 1;
	nextPheromoneMatrix[loopVarI][loopVarJ] = 0.0;
      }
    }

    var finalNode = 0;
    var initialNode = 0;
    var totalSteps = numActiveNodes - 1;
    var availableDestinations = numActiveNodes;
    if (optimizationMode == 1) {
      finalNode = numActiveNodes - 1;
      totalSteps = numActiveNodes - 2;
      availableDestinations = numActiveNodes - 1;
    }
    for (var currentWave = 0; currentWave < iterationWaves; ++currentWave) {
      for (var currentAnt = 0; currentAnt < colonySize; ++currentAnt) {
	var currentNode = initialNode;
	var currentTotalDistance = 0;
	for (var loopVarI = 0; loopVarI < numActiveNodes; ++loopVarI) {
	  visitedNodes[loopVarI] = false;
	}
	currentRouteOrder[0] = currentNode;
	for (var currentStep = 0; currentStep < totalSteps; ++currentStep) {
	  visitedNodes[currentNode] = true;
	  var cumulativeProbability = 0.0;
	  for (var nextNode = 1; nextNode < availableDestinations; ++nextNode) {
	    if (!visitedNodes[nextNode]) {
	      probabilityArray[nextNode] = Math.pow(pheromoneMatrix[currentNode][nextNode], pheromoneInfluence) *
		Math.pow(nodeTravelTimes[currentNode][nextNode], 0.0 - durationImpact);
	      cumulativeProbability += probabilityArray[nextNode];
	    }
	  }
	  var randomChoice = Math.random() * cumulativeProbability;
	  var chosenNextNode = -1;
	  for (var nextNode = 1; nextNode < availableDestinations; ++nextNode) {
	    if (!visitedNodes[nextNode]) {
	      chosenNextNode = nextNode;
	      randomChoice -= probabilityArray[nextNode];
	      if (randomChoice < 0) {
		chosenNextNode = nextNode;
		break;
	      }
	    }
	  }
	  currentTotalDistance += nodeTravelTimes[currentNode][chosenNextNode];
	  currentRouteOrder[currentStep+1] = chosenNextNode;
	  currentNode = chosenNextNode;
	}
	currentRouteOrder[totalSteps+1] = finalNode;
	currentTotalDistance += nodeTravelTimes[currentNode][finalNode];

	// K2-rewiring local optimization:
	var penultimateStep = numActiveNodes;
	if (optimizationMode == 1) {
	  penultimateStep = numActiveNodes - 1;
	}
	var solutionModified = true;
	var loopVarI = 0;
	while (solutionModified) {
	  solutionModified = false;
	  for (; loopVarI < penultimateStep - 2 && !solutionModified; ++loopVarI) {
	    var segmentCost = nodeTravelTimes[currentRouteOrder[loopVarI+1]][currentRouteOrder[loopVarI+2]];
	    var reversedSegmentCost = nodeTravelTimes[currentRouteOrder[loopVarI+2]][currentRouteOrder[loopVarI+1]];
	    var initialSegmentCost = nodeTravelTimes[currentRouteOrder[loopVarI]][currentRouteOrder[loopVarI+1]];
	    var swapTemp, currentEvalCost, potentialNewCost;
	    for (var loopVarJ = loopVarI+2; loopVarJ < penultimateStep && !solutionModified; ++loopVarJ) {
	      currentEvalCost = segmentCost + initialSegmentCost + nodeTravelTimes[currentRouteOrder[loopVarJ]][currentRouteOrder[loopVarJ+1]];
	      potentialNewCost = reversedSegmentCost + nodeTravelTimes[currentRouteOrder[loopVarI]][currentRouteOrder[loopVarJ]]
		+ nodeTravelTimes[currentRouteOrder[loopVarI+1]][currentRouteOrder[loopVarJ+1]];
	      if (currentEvalCost > potentialNewCost) {
		currentTotalDistance += potentialNewCost - currentEvalCost;
		// Reverse the disconnected path segment.
		for (var loopVarK = 0; loopVarK < Math.floor((loopVarJ-loopVarI)/2); ++loopVarK) {
		  swapTemp = currentRouteOrder[loopVarI+1+loopVarK];
		  currentRouteOrder[loopVarI+1+loopVarK] = currentRouteOrder[loopVarJ-loopVarK];
		  currentRouteOrder[loopVarJ-loopVarK] = swapTemp;
		}
		solutionModified = true;
		--loopVarI;
	      }
	      segmentCost += nodeTravelTimes[currentRouteOrder[loopVarJ]][currentRouteOrder[loopVarJ+1]];
	      reversedSegmentCost += nodeTravelTimes[currentRouteOrder[loopVarJ+1]][currentRouteOrder[loopVarJ]];
	    }
	  }
	}

	if (currentTotalDistance < minimumTotalTime) {
	  optimalRouteOrder = currentRouteOrder;
	  minimumTotalTime = currentTotalDistance;
	}
	for (var loopVarI = 0; loopVarI <= totalSteps; ++loopVarI) {
	  nextPheromoneMatrix[currentRouteOrder[loopVarI]][currentRouteOrder[loopVarI+1]] += (minimumTotalTime - rewardScalingFactor * minimumTotalTime) / (colonySize * (currentTotalDistance - rewardScalingFactor * minimumTotalTime));
	}
      }
      for (var loopVarI = 0; loopVarI < numActiveNodes; ++loopVarI) {
	for (var loopVarJ = 0; loopVarJ < numActiveNodes; ++loopVarJ) {
	  pheromoneMatrix[loopVarI][loopVarJ] = pheromoneMatrix[loopVarI][loopVarJ] * (1.0 - evaporationRate) + evaporationRate * nextPheromoneMatrix[loopVarI][loopVarJ];
	  nextPheromoneMatrix[loopVarI][loopVarJ] = 0.0;
	}
      }
    }
  }

  /* Finds the absolute optimal solution for the TSP.
   * Runtime complexity is O((numActiveNodes-1)!).
   * Prerequisites:
   * - numActiveNodes must contain the total count of locations.
   * - nodeTravelTimes[i][j] must hold the weight of the edge from node i to node j.
   * - visitedNodes[i] should be initialized to false for all nodes.
   * - minimumTotalTime must be set to an extremely high value initially.
   *
   * If optimizationMode is 1, it will determine the optimal route for a path
   * starting at node 0 and ending at node numActiveNodes - 1, visiting
   * intermediate nodes in the most efficient sequence.
   * @param {number} optimizationMode - 0 for full TSP, 1 for fixed start/end path.
   * @param {number} activeNode - The current node in the recursive search.
   * @param {number} currentLength - The accumulated length of the path so far.
   * @param {number} currentDepth - The current depth of recursion (number of nodes visited).
   */
  function findBruteForcePath(optimizationMode, activeNode, currentLength, currentDepth) {
    // Configure parameters based on the optimization mode:
    var totalSteps = numActiveNodes;
    var finalNode = 0;
    var nodesToExplore = numActiveNodes;
    if (optimizationMode == 1) {
      totalSteps = numActiveNodes - 1;
      finalNode = numActiveNodes - 1;
      nodesToExplore = numActiveNodes - 1;
    }

    // If the current path looks promising:
    if (currentLength + nodeTravelTimes[activeNode][finalNode] < minimumTotalTime) {

      // If all nodes have been visited:
      if (currentDepth == totalSteps) {
	currentLength += nodeTravelTimes[activeNode][finalNode];
	currentRouteOrder[currentDepth] = finalNode;
	minimumTotalTime = currentLength;
	for (var loopVarI = 0; loopVarI <= totalSteps; ++loopVarI) {
	  optimalRouteOrder[loopVarI] = currentRouteOrder[loopVarI];
	}
      } else {

	// Explore all possible subsequent routes:
	for (var loopVarI = 1; loopVarI < nodesToExplore; ++loopVarI) {
	  if (!visitedNodes[loopVarI]) {
	    visitedNodes[loopVarI] = true;
	    currentRouteOrder[currentDepth] = loopVarI;
	    findBruteForcePath(optimizationMode, loopVarI, currentLength+nodeTravelTimes[activeNode][loopVarI], currentDepth+1);
	    visitedNodes[loopVarI] = false;
	  }
	}
      }
    }
  }

  /* Generates the subsequent integer that has a specific number of bits set to 1.
   * @param {number} desiredBitCount - The number of set bits required in the subset.
   * @returns {number} The integer representation of the next subset, or -1 if no more subsets exist.
   */
  function getNextSubset(desiredBitCount) {
    var bitCount = 0;
    var result = 0;
    for (var loopVarI = 0; loopVarI < numActiveNodes; ++loopVarI) {
      bitCount += nextCombinationSet[loopVarI];
    }
    if (bitCount < desiredBitCount) {
      for (var loopVarI = 0; loopVarI < desiredBitCount; ++loopVarI) {
	nextCombinationSet[loopVarI] = 1;
      }
      for (var loopVarI = desiredBitCount; loopVarI < numActiveNodes; ++loopVarI) {
	nextCombinationSet[loopVarI] = 0;
      }
    } else {
      // Find the first '1' bit
      var firstOneIdx = -1;
      for (var loopVarI = 0; loopVarI < numActiveNodes; ++loopVarI) {
	if (nextCombinationSet[loopVarI]) {
	  firstOneIdx = loopVarI;
	  break;
	}
      }
      // Find the first '0' bit located after the first '1'
      var firstZeroIdx = -1;
      for (var loopVarI = firstOneIdx + 1; loopVarI < numActiveNodes; ++loopVarI) {
	if (!nextCombinationSet[loopVarI]) {
	  firstZeroIdx = loopVarI;
	  break;
	}
      }
      if (firstZeroIdx < 0) {
	return -1; // No more combinations
      }
      // Set the found '0' bit to '1'
      nextCombinationSet[firstZeroIdx] = 1;
      // Rearrange the bits before this new '1' to their lowest possible value (left-aligned '1's)
      for (var loopVarI = 0; loopVarI < firstZeroIdx - firstOneIdx - 1; ++loopVarI) {
	nextCombinationSet[loopVarI] = 1;
      }
      for (var loopVarI = firstZeroIdx - firstOneIdx - 1; loopVarI < firstZeroIdx; ++loopVarI) {
	nextCombinationSet[loopVarI] = 0;
      }
    }
    // Calculate the integer index for this generated subset
    for (var loopVarI = 0; loopVarI < numActiveNodes; ++loopVarI) {
      result += (nextCombinationSet[loopVarI]<<loopVarI);
    }
    return result;
  }

  /* Solves the TSP problem to optimality using dynamic programming.
   * Memory requirement is O(numActiveNodes * 2^numActiveNodes).
   * @param {number} optimizationMode - 0 for full TSP, 1 for fixed start/end path.
   */
  function solveDynamicPath(optimizationMode) {
    var totalCombinations = 1<<numActiveNodes;
    var costMemo = [];
    var pathParent = [];
    for (var loopVarI = 0; loopVarI < totalCombinations; ++loopVarI) {
      costMemo[loopVarI] = [];
      pathParent[loopVarI] = [];
      for (var loopVarJ = 0; loopVarJ < numActiveNodes; ++loopVarJ) {
	costMemo[loopVarI][loopVarJ] = 0.0;
	pathParent[loopVarI][loopVarJ] = 0;
      }
    }
    for (var loopVarK = 1; loopVarK < numActiveNodes; ++loopVarK) {
      var subsetIndex = 1 + (1<<loopVarK);
      costMemo[subsetIndex][loopVarK] = nodeTravelTimes[0][loopVarK];
    }
    for (var subsetSize = 3; subsetSize <= numActiveNodes; ++subsetSize) {
      for (var loopVarI = 0; loopVarI < numActiveNodes; ++loopVarI) {
	nextCombinationSet[loopVarI] = 0;
      }
      var subsetIndex = getNextSubset(subsetSize);
      while (subsetIndex >= 0) {
	for (var loopVarK = 1; loopVarK < numActiveNodes; ++loopVarK) {
	  if (nextCombinationSet[loopVarK]) {
	    var previousSubsetIndex = subsetIndex - (1<<loopVarK);
	    costMemo[subsetIndex][loopVarK] = longestJourneyGuard;
	    for (var loopVarM = 1; loopVarM < numActiveNodes; ++loopVarM) {
	      if (nextCombinationSet[loopVarM] && loopVarM != loopVarK) {
		if (costMemo[previousSubsetIndex][loopVarM] + nodeTravelTimes[loopVarM][loopVarK] < costMemo[subsetIndex][loopVarK]) {
		  costMemo[subsetIndex][loopVarK] = costMemo[previousSubsetIndex][loopVarM] + nodeTravelTimes[loopVarM][loopVarK];
		  pathParent[subsetIndex][loopVarK] = loopVarM;
		}
	      }
	    }
	  }
	}
	subsetIndex = getNextSubset(subsetSize);
      }
    }
    for (var loopVarI = 0; loopVarI < numActiveNodes; ++loopVarI) {
      optimalRouteOrder[loopVarI] = 0;
    }
    var subsetIndex = (1<<numActiveNodes)-1;
    if (optimizationMode == 0) {