class InputLineProvider {
  #dataLines; // Stores all lines read from the source
  #currentPosition; // Tracks the current line being processed

  /**
   * Initializes the input provider with raw text data.
   * @param {string} rawTextData - The complete string content from the input source.
   */
  constructor(rawTextData) {
    // Input validation: Ensure rawTextData is a non-empty string.
    if (typeof rawTextData !== 'string' || rawTextData.trim().length === 0) {
      throw new Error("InputProvider initialization error: Raw input data is invalid or empty.");
    }
    this.#dataLines = rawTextData.trim().split("\n");
    this.#currentPosition = 0;
    // Expose a read-only property for the total number of lines.
    this.totalLinesAvailable = this.#dataLines.length;
  }

  /**
   * Retrieves the next line from the input stream.
   * @returns {string} The next line of text.
   * @throws {Error} If no more lines are available to read.
   */
  obtainNextLine() {
    if (!this.hasRemainingLines()) {
      throw new Error("InputStreamExhausted: Attempted to read past the end of the input stream.");
    }
    const lineContent = this.#dataLines[this.#currentPosition];
    this.#currentPosition++;
    return lineContent;
  }

  /**
   * Checks if there are more lines available to read.
   * @returns {boolean} True if more lines exist, false otherwise.
   */
  hasRemainingLines() {
    return this.#currentPosition < this.totalLinesAvailable;
  }
}

// Global instance for handling standard input, making it accessible throughout the script.
const standardInputSource = new InputLineProvider(
  require("fs").readFileSync("/dev/stdin", "utf8")
);

// Wrapper functions for convenience, mimicking the original global 'next' and 'hasNext'.
const retrieveInputLine = () => standardInputSource.obtainNextLine();
const checkInputAvailability = () => standardInputSource.hasRemainingLines();

// Utility for logging results to standard output.
const printProcessedResult = (resultData) => console.log(resultData);

/**
 * A comprehensive utility for parsing input values and formatting output.
 * Handles various data transformations based on the specified type.
 * @param {*} valueToTransform - The data to be transformed.
 * @param {string} transformationType - A string indicating the desired transformation.
 * @returns {*} The transformed data.
 */
const processDataTransformation = (valueToTransform, transformationType) => {
  try {
    switch (transformationType) {
      case 'toInteger':
        // Converts to string first to ensure consistent parsing.
        return parseInt(String(valueToTransform), 10);
      case 'splitBySpace':
        return String(valueToTransform).split(" ");
      case 'splitBySpaceToNumbers':
        return String(valueToTransform).split(" ").map(item => Number(item));
      case 'splitByCharacter':
        return String(valueToTransform).split("");
      case 'splitByCharacterToNumbers':
        return String(valueToTransform).split("").map(item => Number(item));
      case 'joinWithSpace':
        return Array.isArray(valueToTransform) ? valueToTransform.join(" ") : String(valueToTransform);
      case 'joinWithNewline':
        return Array.isArray(valueToTransform) ? valueToTransform.join("\n") : String(valueToTransform);
      case 'joinWithoutSeparator':
        return Array.isArray(valueToTransform) ? valueToTransform.join("") : String(valueToTransform);
      default:
        // Log a warning if an unknown transformation type is requested.
        console.warn(`DataTransformation: Unknown type "${transformationType}". Returning original value.`);
        return valueToTransform;
    }
  } catch (err) {
    // Log the error and return the original value to prevent program termination.
    console.error(`DataTransformation error for type "${transformationType}" on value "${valueToTransform}":`, err);
    return valueToTransform;
  }
};

/**
 * Orchestrates the graph analysis, component identification, and suggestion calculation.
 * This is the main entry point for the application logic.
 */
function performSocialGraphAnalysis() {
  // Read initial configuration: N (number of individuals), M (friendship connections), K (blockage relationships).
  const configParameters = processDataTransformation(retrieveInputLine(), 'splitBySpaceToNumbers');

  // Using destructuring for clarity and direct assignment.
  const [totalIndividuals, totalFriendships, totalBlockages] = configParameters;

  // Basic validation for input parameters.
  if (totalIndividuals <= 0 || totalFriendships < 0 || totalBlockages < 0) {
    console.error("Input Error: Invalid initial parameters. All counts must be non-negative, totalIndividuals must be positive.");
    return; // Terminate execution if parameters are invalid.
  }

  // Initialize an array to hold details for each individual (node).
  // Each individual object stores their direct friends and their assigned connected component ID.
  const individualNetwork = Array.from({ length: totalIndividuals }, (_, index) => ({
    id: index, // Unique identifier for the individual (0-indexed)
    directFriends: new Set(), // Using a Set for efficient storage and lookup of unique friends
    connectedComponentId: null // Initially null, assigned during component discovery
  }));

  // Process friendship connections from input.
  for (let i = 0; i < totalFriendships; i++) {
    const [personA, personB] = processDataTransformation(retrieveInputLine(), 'splitBySpaceToNumbers')
                                 .map(val => val - 1); // Adjust to 0-indexed values.

    // Validate friendship indices to prevent out-of-bounds access.
    if (personA < 0 || personA >= totalIndividuals || personB < 0 || personB >= totalIndividuals) {
      console.warn(`Skipping invalid friendship connection: (${personA + 1}, ${personB + 1}). Indices out of bounds.`);
      continue;
    }

    // Establish bidirectional friendship.
    individualNetwork[personA].directFriends.add(personB);
    individualNetwork[personB].directFriends.add(personA);
  }

  // An array to store Set objects, each representing a distinct connected component.
  // Each Set will contain the IDs of individuals belonging to that component.
  const identifiedComponents = [];

  /**
   * Performs a Breadth-First Search (BFS) starting from a given individual
   * to discover and assign all members of their connected component.
   * @param {number} startIndex - The 0-indexed ID of the individual to start the BFS from.
   */
  const discoverConnectedComponent = (startIndex) => {
    // If this individual has already been assigned to a component, skip.
    if (individualNetwork[startIndex].connectedComponentId !== null) {
      return;
    }

    const currentComponentIndex = identifiedComponents.length; // New component gets the next available index.
    const componentMembers = new Set(); // Set to store members of this new component.
    identifiedComponents.push(componentMembers); // Add the new component set to our list of components.

    const traversalQueue = [startIndex]; // BFS queue, stores individual IDs.
    individualNetwork[startIndex].connectedComponentId = currentComponentIndex; // Assign component ID to the starting individual.
    componentMembers.add(startIndex); // Add starting individual to the component set.

    // Process the queue until all reachable individuals are visited.
    while (traversalQueue.length > 0) {
      const currentIndividualId = traversalQueue.shift(); // Get the next individual to process.

      // Iterate through the direct friends of the current individual.
      for (const friendId of individualNetwork[currentIndividualId].directFriends) {
        // If a friend has not yet been assigned to any component, they belong to the current one.
        if (individualNetwork[friendId].connectedComponentId === null) {
          individualNetwork[friendId].connectedComponentId = currentComponentIndex; // Assign the component ID.
          componentMembers.add(friendId); // Add friend to the component's member set.
          traversalQueue.push(friendId); // Add friend to the queue for further exploration.
        }
      }
    }
  };

  // Iterate through all individuals to ensure every individual is assigned to a connected component.
  for (let i = 0; i < totalIndividuals; i++) {
    discoverConnectedComponent(i);
  }

  // Calculate the initial number of potential suggestions for each individual.
  // A suggestion is another individual in the same component who is not a direct friend.
  const suggestionCounts = individualNetwork.map(individual => {
    const component = identifiedComponents[individual.connectedComponentId];
    // Total members in component - 1 (to exclude self) - number of direct friends.
    return component.size - 1 - individual.directFriends.size;
  });

  // Process blockage relationships.
  // If two blocked individuals are in the same component, they cannot suggest each other.
  for (let i = 0; i < totalBlockages; i++) {
    const [blockedPerson1, blockedPerson2] = processDataTransformation(retrieveInputLine(), 'splitBySpaceToNumbers')
                                               .map(val => val - 1); // Adjust to 0-indexed.

    // Validate blockage indices.
    if (blockedPerson1 < 0 || blockedPerson1 >= totalIndividuals || blockedPerson2 < 0 || blockedPerson2 >= totalIndividuals) {
      console.warn(`Skipping invalid blockage relationship: (${blockedPerson1 + 1}, ${blockedPerson2 + 1}). Indices out of bounds.`);
      continue;
    }

    // Only apply blockage effect if both individuals are in the same connected component.
    if (individualNetwork[blockedPerson1].connectedComponentId === individualNetwork[blockedPerson2].connectedComponentId) {
      // Decrement suggestion counts for both individuals in the blocked pair.
      suggestionCounts[blockedPerson1]--;
      suggestionCounts[blockedPerson2]--;
    }
  }

  // Output the final calculated suggestion counts, joined by spaces.
  printProcessedResult(processDataTransformation(suggestionCounts, 'joinWithSpace'));
}

// Initiate the graph analysis process.
performSocialGraphAnalysis();