// Load the initial data from the standard input source
const   dataString  =   require('fs').readFileSync('/dev/stdin', 'utf8')  ;
// Process the raw input string into an array of individual lines
const   inputLines  =   dataString.trim().split('\n')  ;


// A constant array holding the allowed single-character color identifiers
const   PALETTE_HUES  = ['r', 'g', 'b'];

// Definition of a class representing a mutable entity with a code and a state duration
class   Creature    {
  // Constructor to initialize a new Creature instance
  constructor (  identifierCode  ,  timeElapsed  )  {
    this.identifierCode = identifierCode  ; // The unique string code for this creature
    this.timeElapsed    = timeElapsed    ;   // The number of steps taken to reach this creature's state
  }

  // Method to compute and return all possible next state codes for the current creature
  generateSuccessorCodes (  )  {
    const   successorCodes  = []; // Initialize an empty array to store the generated codes

    // Loop through the creature's identifier code, examining adjacent character pairs
    for (let idx = 0; idx < this.identifierCode.length - 1; idx++) {
      const   firstChar   = this.identifierCode.substring(idx, idx + 1)  ; // Get the character at the current index
      const   secondChar  = this.identifierCode.substring(idx + 1, idx + 2)  ; // Get the character immediately following

      // If the two adjacent characters are identical, no transformation is possible at this position
      if (firstChar === secondChar) {
        continue  ; // Skip to the next pair of characters
      }

      // Determine the unique third hue that is not present in the current character pair
      const   replacementHue  = PALETTE_HUES.find(hue => hue !== firstChar && hue !== secondChar)  ;
      // Construct a new identifier code by replacing the two adjacent characters with a doubled replacement hue
      const   modifiedCode    =
        this.identifierCode.substring(0, idx) +
        replacementHue.repeat(2) +
        this.identifierCode.substring(idx + 2)  ;
      successorCodes.push(modifiedCode)  ; // Add the newly formed code to the list of successors
    }
    return successorCodes  ; // Return the complete list of possible successor codes
  }
}

// Definition of a class for exploring a network of creature states using a BFS algorithm
class   NetworkExplorer {
  // Constructor initializes the explorer with an empty registry for discovered nodes
  constructor (  )  {
    this.nodeRegistry = new Map()  ; // A map to store Creature instances, keyed by their identifier codes
  }

  // Executes a breadth-first search starting from a specified identifier code
  exploreBreadthFirst (  startCode  )  {
    this.processingQueue = []  ; // Initialize a queue for managing nodes to visit

    // Add the initial creature state to the registry and enqueue its code
    this.nodeRegistry.set(startCode, new Creature(startCode, 0))  ;
    this.processingQueue.push(startCode)  ;

    // Continue the search as long as there are codes in the queue to process
    while (this.processingQueue.length > 0) {
      const   currentCode = this.processingQueue.shift()  ; // Dequeue the next code to examine
      const   currentNode = this.nodeRegistry.get(currentCode)  ; // Retrieve the corresponding creature object

      const   successors  = currentNode.generateSuccessorCodes()  ; // Generate all possible next codes from the current node

      // If no successor codes are generated, it signifies a terminal state (all characters are identical).
      // In this case, the search ends, and this terminal node is returned.
      if (!successors.length) {
        return currentNode  ;
      }

      // Iterate over each generated successor code
      successors.forEach(potentialCode => {
        // If this potential code has already been discovered and processed, skip it
        if (this.nodeRegistry.has(potentialCode)) {
          return  ;
        }
        // Register the new creature state with an incremented time elapsed
        this.nodeRegistry.set(potentialCode, new Creature(potentialCode, currentNode.timeElapsed + 1))  ;
        this.processingQueue.push(potentialCode)  ; // Enqueue the new code for future exploration
      });
    }
    // If the queue becomes empty and no terminal state was found, it implies no solution.
    return undefined  ;
  }
}

// Iterate through each line of input to perform the state exploration for each case
inputLines.forEach(lineData => {
  // If an input line contains '0', it acts as a termination signal for the input stream
  if (lineData === '0') {
    return  ;
  }

  const   explorerInstance  = new NetworkExplorer()  ; // Create a new explorer for each test case
  const   resultNode        = explorerInstance.exploreBreadthFirst(lineData)  ; // Execute BFS from the current input code

  // Output the time elapsed to reach the terminal state, or 'NA' if no solution was found
  console.log(resultNode ? resultNode.timeElapsed : 'NA')  ;
});