/*
 * This script processes graph data from standard input.
 * It calculates discovery and completion times for a depth-first traversal.
 */
const sourceData = require('fs').readFileSync(
  '/dev/stdin',
  'utf8'
); // Read raw input string from stdin

// Process the input into an array of lines
const dataLinesCollection = sourceData.trim()
  .split('\n');

// The first line contains the total number of vertices, but it's not directly used later.
const totalVertices = Number(dataLinesCollection.shift());

// Parse the adjacency list from the remaining lines
const adjacencyListRaw = dataLinesCollection.map(
  (lineString) => lineString
    .split(' ')
    .map(Number) // Convert each string segment to a number
);


/**
 * Represents a single vertex (node) within the graph.
 * Stores its identifier, timing metrics, and connections to other vertices.
 */
class GraphElement {

  /**
   * Initializes a new graph element.
   * @param {number} elementId The unique identifier for this element.
   */
  constructor(elementId) {
    this.elementId = elementId; // Unique numerical ID for the vertex
    this.timingInfo = {}; // Object to store discovery and completion times
    this.antecedents = []; // List of parent elements (elements pointing to this one)
    this.descendants = []; // List of child elements (elements this one points to)
  }

  /**
   * Establishes a directed connection from this element to another element.
   * The other element becomes a descendant of this one, and this becomes an antecedent of the other.
   * @param {GraphElement} connectedElement The element to connect to.
   */
  establishConnection(connectedElement) {
    connectedElement.antecedents.push(this); // Add current element as parent to the connected one
    this.descendants.push(connectedElement); // Add connected element as child to current one
  }

  /**
   * Checks if this element has already been visited and had its timing data recorded.
   * @returns {boolean} True if timing data (specifically discovery time) exists, false otherwise.
   */
  hasTimingData() {
    // Using double negation to convert a truthy/falsy value to a boolean
    return !!this.timingInfo.discoveryTime;
  }

  /**
   * Performs a depth-first traversal starting from this element to calculate discovery and completion times.
   * Updates the timingInfo for this element and recursively for its unvisited neighbors.
   * @param {number} currentTimestamp The current time counter.
   * @returns {number} The updated time counter after visiting this element and its sub-graph.
   */
  calculateTraversalTimes(currentTimestamp) {
    this.timingInfo.discoveryTime = currentTimestamp; // Record discovery time for this element

    // If neighbors haven't been sorted yet, create a combined sorted list of all connected elements
    if (!this.allNeighbors) {
      this.allNeighbors = this.antecedents
        .concat(this.descendants) // Combine parents and children
        .sort((elementA, elementB) => elementA.elementId > elementB.elementId); // Sort by ID
    }

    // Recursively visit all neighbors that haven't been measured yet
    this.allNeighbors.forEach(
      (neighborElement) => {
        if (!neighborElement.hasTimingData()) {
          currentTimestamp = neighborElement.calculateTraversalTimes(++currentTimestamp); // Increment time and recurse
        }
      }
    );

    // Record completion time for this element after all its descendants are processed
    return this.timingInfo.completionTime = ++currentTimestamp;
  }

  /**
   * Provides a formatted string representation of the element's ID and its timing data.
   * @returns {string} A space-separated string: "elementId discoveryTime completionTime".
   */
  displayFormattedData() {
    return [this.elementId, this.timingInfo.discoveryTime, this.timingInfo.completionTime].join(' ');
  }
}

/**
 * Manages the collection of graph elements and provides methods to access and process them.
 */
class GraphStructureManager {
  constructor() {
    // A map to store elements, keyed by their unique identifiers
    this.elementRegistry = new Map();
  }

  /**
   * Retrieves a graph element by its identifier. If the element does not exist, it creates a new one.
   * @param {number} elementId The identifier of the element to retrieve or create.
   * @returns {GraphElement} The requested graph element.
   */
  retrieveGraphElement(elementId) {
    if (!this.elementRegistry.has(elementId)) {
      this.elementRegistry.set(elementId, new GraphElement(elementId));
    }
    return this.elementRegistry.get(elementId);
  }

  /**
   * Iterates through all registered elements and prints their formatted timing data to the console.
   */
  outputAllElements() {
    // Loop from 1 up to the total number of registered elements
    for (let iterationIndex = 1; iterationIndex <= this.elementRegistry.size; iterationIndex++) {
      const currentElement = this.elementRegistry.get(iterationIndex);
      console.log(currentElement.displayFormattedData()); // Output the formatted data
    }
  }
}

// --- Main execution flow ---

// Create an instance of the graph manager
const graphManagerInstance = new GraphStructureManager();

// Populate the graph based on the raw adjacency list data
adjacencyListRaw.forEach(
  ([mainElementIdentifier, neighborCountPlaceholder, ...neighborIdentifiersList]) => {
    const currentMainElement = graphManagerInstance.retrieveGraphElement(mainElementIdentifier); // Get the main element

    // Connect the main element to all its listed neighbors
    neighborIdentifiersList.forEach(
      (linkedElementIdentifier) => {
        const connectedElement = graphManagerInstance.retrieveGraphElement(linkedElementIdentifier);
        currentMainElement.establishConnection(connectedElement); // Establish the link
      }
    );
  }
);

// Start the depth-first traversal from element with ID 1
const initialElement = graphManagerInstance.retrieveGraphElement(1);
initialElement.calculateTraversalTimes(1); // Initialize the timestamp to 1

// Display the calculated traversal times for all elements
graphManagerInstance.outputAllElements();