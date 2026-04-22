"use strict";

// Utility function to construct multi-dimensional arrays or nested array structures
function createMultiDimArray( initialValue ) {
  const args = arguments;
  let arrayDimensionCount = args.length;
  // Begin building the string representation for array initialization
  let arrayCreationString = `Array(args[${--arrayDimensionCount}]).fill(null).map( _ => { return ${initialValue}; } )`;

  // Iteratively nest array definitions for remaining dimensions
  while ( --arrayDimensionCount ) {
    arrayCreationString = `Array(args[${arrayDimensionCount}]).fill(null).map( _ => ${arrayCreationString} )`;
  }
  // Execute the generated string to produce the actual nested array
  return eval( arrayCreationString );
}

// Global state variables for the simulation environment
var currentPathLength = 0, currentLocationNode = 0, simulationDay = 0, lastPickupDay = -1;
var totalScore = 0;

// Graph structure and simulation parameters
const HUGE_NUMBER = 1e9; // Represents an unreachable distance or infinity
var totalVertices; // Total number of nodes in the network (e.g., 200-400)
var totalConnections; // Total number of edges connecting nodes (e.g., 1.5V-2V)
var shortestPaths; // Matrix storing the shortest distance between any two nodes
var directConnections; // Matrix storing direct edge weights between adjacent nodes
var adjacencyList; // List of neighbors for each node in the graph
var initialData; // Placeholder for some initial configuration data
var maxSimulationDays; // Maximum duration for the simulation in days (e.g., 10000)
var timeLimitSquared; // Pre-calculated square of maxSimulationDays for score computation
const activeDeliveries = new Set(); // Set of nodes that currently have orders awaiting delivery
var deliveryTimestamps; // Stores the simulation day when orders were picked up for each node
const inputQueue = []; // Buffer to store incoming data from standard input
const outputResults = []; // Array to store the action taken on each simulation day

var queuePointer = 0; // Index for reading from the inputQueue

// Retrieves the next numerical value from the buffered input stream
function getNextInput() {
  return +inputQueue[queuePointer++];
}

// Decides the next movement or action for the delivery agent
function determineNextAction() {
  // If there are no active deliveries, the agent might return to origin or wait
  if ( activeDeliveries.size === 0 ) {
    if ( currentLocationNode === 0 ) return -2; // At origin, no deliveries, nothing to do
    return advancePath( 0 ); // Move towards the origin node
  }

  // Identify the best node to proceed to among those with pending deliveries
  var bestDeliveryNodeId = -1, maxOrdersAtNode = 0;
  for ( const nodeId of activeDeliveries ) {
    // Criteria: node has more orders AND is reachable within remaining time
    if ( maxOrdersAtNode < deliveryTimestamps[nodeId].length &&
         shortestPaths[currentLocationNode][nodeId] <= maxSimulationDays - simulationDay ) {
      bestDeliveryNodeId = nodeId;
      maxOrdersAtNode = deliveryTimestamps[nodeId].length;
    }
  }
  // If no suitable delivery target is found, signal no immediate action
  if ( bestDeliveryNodeId === -1 ) return -2;

  // Initiate movement towards the chosen delivery node
  return advancePath( bestDeliveryNodeId );
}

// Computes and sets the next immediate step along a shortest path to a destination
function advancePath( targetNode ) {
  // Examine each direct neighbor of the current node
  for ( const neighborNode of adjacencyList[currentLocationNode] ) {
    // Check if this neighbor is part of the shortest path to the target
    if ( shortestPaths[currentLocationNode][targetNode] ===
         directConnections[currentLocationNode][neighborNode] + shortestPaths[neighborNode][targetNode] ) {
      // Set the remaining path segments and update the agent's current location
      currentPathLength = directConnections[currentLocationNode][neighborNode] - 1;
      return currentLocationNode = neighborNode;
    }
  }
  // This return should ideally not be reached if a path exists; indicates an error or path end
  return -2;
}

// Executes the operations for a single simulation day
function processTurn() {
  // If the agent is currently in transit, simply continue moving
  if ( currentPathLength ) {
    currentPathLength--;
    return currentLocationNode;
  }
  // If at the starting node (0), attempt to pick up new orders
  if ( currentLocationNode === 0 ) pickupOrders();
  // Otherwise, if at any other node, drop off available orders
  else dropOffOrders();

  // After processing pickups/dropoffs, determine the subsequent action
  return determineNextAction();
}

// Manages the process of picking up new orders introduced on current or previous days
function pickupOrders() {
  // Process all incoming orders for days up to the current simulation day
  while ( lastPickupDay < simulationDay ) {
    lastPickupDay++;
    const numIncomingOrderGroups = getNextInput();
    for ( let idx = 0; idx < numIncomingOrderGroups; idx++ ) {
      const orderIdentifier = getNextInput() - 1; // Order ID (its usage is minimal here)
      const deliveryTargetNode = getNextInput() - 1; // The node where this order needs to be delivered
      activeDeliveries.add( deliveryTargetNode ); // Add this node to the set of active delivery points
      deliveryTimestamps[deliveryTargetNode].push( lastPickupDay ); // Record the day this order was picked up
    }
  }
}

// Manages the process of dropping off orders at the current node
function dropOffOrders() {
  activeDeliveries.delete( currentLocationNode ); // Remove the current node from active delivery points
  // Process all orders that are pending at the current node
  while ( deliveryTimestamps[currentLocationNode].length ) {
    const timeTaken = simulationDay - deliveryTimestamps[currentLocationNode].pop(); // Calculate delivery time
    totalScore += timeLimitSquared - timeTaken * timeTaken; // Update total score based on delivery efficiency
  }
}

// Initialize readline interface for input processing
const inputReader = require("readline").createInterface( process.stdin, process.stdout );

// Main simulation logic encapsulated in a generator function
const simulationGenerator = ( function* () {
  // Helper function to asynchronously read a single line of input
  const readNextLine = () => inputReader.once( "line", lineString => simulationGenerator.next( lineString ) );

  // Read initial graph dimensions (vertices and edges)
  let nodeCountString = yield readNextLine();
  nodeCountString = nodeCountString.split(" ");
  totalConnections = +nodeCountString[1];
  totalVertices = +nodeCountString[0];

  // Initialize data structures for the graph
  shortestPaths = createMultiDimArray( HUGE_NUMBER, totalVertices, totalVertices );
  directConnections = createMultiDimArray( HUGE_NUMBER, totalVertices, totalVertices );
  adjacencyList = createMultiDimArray( "[]", totalVertices );

  // Set initial distance from a node to itself as zero
  for ( let idx1 = 0; idx1 < totalVertices; idx1++ ) shortestPaths[idx1][idx1] = 0;

  // Read and populate edge information for the graph
  for ( let idx1 = 0; idx1 < totalConnections; idx1++ ) {
    const lineParts = ( yield readNextLine() ).split(" ");
    const nodeA = +lineParts[0] - 1;
    const nodeB = +lineParts[1] - 1;
    const distanceVal = +lineParts[2];
    // Update direct and shortest path distances for this undirected edge
    shortestPaths[nodeA][nodeB] = shortestPaths[nodeB][nodeA] = directConnections[nodeA][nodeB] = directConnections[nodeB][nodeA] = distanceVal;
    // Add connections to the adjacency list
    adjacencyList[nodeA].push( nodeB );
    adjacencyList[nodeB].push( nodeA );
  }

  // Apply Floyd-Warshall algorithm to compute all-pairs shortest paths
  for ( let intermediateNode = 0; intermediateNode < totalVertices; intermediateNode++ )
    for ( let idx1 = 0; idx1 < totalVertices; idx1++ )
      for ( let idx2 = 0; idx2 < totalVertices; idx2++ ) {
        if ( shortestPaths[idx1][intermediateNode] + shortestPaths[intermediateNode][idx2] < shortestPaths[idx1][idx2] ) {
          shortestPaths[idx1][idx2] = shortestPaths[idx1][intermediateNode] + shortestPaths[intermediateNode][idx2];
        }
      }

  // Read and process additional initial configuration data
  initialData = ( yield readNextLine() ).split(" ").map( val => +val );
  maxSimulationDays = +( yield readNextLine() ); // Establish the total simulation duration

  // Compute the square of the maximum simulation days for scoring
  timeLimitSquared = maxSimulationDays * maxSimulationDays;

  // Re-initialize delivery timestamps now that totalVertices is definitively known
  deliveryTimestamps = createMultiDimArray( "[]", totalVertices );

  // Main loop for the daily simulation cycle
  for ( ; simulationDay < maxSimulationDays; simulationDay++ ) {
    // Read and buffer daily order input
    let dailyInputCount = +( yield readNextLine() );
    inputQueue.push( dailyInputCount ); // Number of incoming order batches
    for ( let idx = 0; idx < dailyInputCount; idx++ ) {
      const parsedInput = ( yield readNextLine() ).split(" ").map( val => +val );
      inputQueue.push( parsedInput[0], parsedInput[1] ); // Order ID and target delivery node
    }
    dailyInputCount = +( yield readNextLine() ); // Read count for other input lines
    for ( let idx = 0; idx < dailyInputCount; idx++ ) {
      const otherInput = yield readNextLine(); // These input lines are discarded
    }

    // Execute the daily operation and record the result
    outputResults[simulationDay] = processTurn() + 1;
    console.log( outputResults[simulationDay] ); // Output the agent's current node (1-indexed)

    // Check for simulation termination signal
    const terminationSignal = yield readNextLine();
    if ( terminationSignal[0] !== "O" ) return; // If signal is not 'O', end simulation

    dailyInputCount = +( yield readNextLine() ); // Read another count
    for ( let idx = 0; idx < dailyInputCount; idx++ ) {
      const anotherInput = yield readNextLine(); // Discarded input
    }
  }
})();

// Initiate the simulation by starting the generator function
simulationGenerator.next();