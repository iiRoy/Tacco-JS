var inputReader = initializeInputSystem();

executeProgram();

/**
 * Extracts and converts the next available input line into an integer.
 * @returns {number} The numerical value from the line.
 */
function readInteger() {
  return dataTransformer(getNextLine(), 1);
}

/*
 * Retrieves the subsequent input line and segments it by spaces, yielding a string array.
 * @returns {string[]} An array of string components.
 */
function readStringArray() {
  return dataTransformer(getNextLine(), 2);
}

// Obtains the next line, splits it by space delimiters, and transforms each part into a number.
function readIntegerArray() {
  return dataTransformer(getNextLine(), 4);
}

// Acquires the next input line and dissects it into an array of single characters.
function readCharacterArray() {
  return dataTransformer(getNextLine(), 6);
}

// Requests the next segment of input from the system's input stream.
function getNextLine() {
  return inputReader.fetchNextSegment();
}

// Determines if additional input lines are still available for processing.
function hasMoreLines() {
  return inputReader.checkAvailability();
}

/**
 * Gathers all raw data from standard input, cleans it, and divides it into an array of lines.
 * @returns {string[]} An array where each element is an input line.
 */
function fetchInputData() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

/*
 * Establishes the input handling infrastructure.
 * This function constructs an object responsible for managing the sequence of input lines
 * and providing methods for their ordered retrieval.
 * @returns {object} An object designed for input management.
 */
function initializeInputSystem() {
  var rawInputLines = fetchInputData();
  var inputHandler = {
    "lineBuffer": rawInputLines,
    "currentPosition": 0,
    "totalLines": rawInputLines.length,
    // Checks if there are pending lines to be processed
    "checkAvailability": function() {
      return (this.currentPosition < this.totalLines);
    },
    // Retrieves the next line from the internal buffer
    "fetchNextSegment": function() {
      if (!this.checkAvailability()) {
        throw "InputBoundaryExceeded: No more input segments are present.";
      } else {
        var currentLine = this.lineBuffer[this.currentPosition];
        this.currentPosition++;
        return currentLine;
      }
    }
  };
  return inputHandler;
}

// Sends the provided content to the standard output console.
function printResult(messageContent) {
  console.log(messageContent);
}

// Dispatches an error message to the standard error stream.
function logError(messageContent) {
  console.error(messageContent);
}

/*
 * A versatile function for converting input data based on a specified operation code.
 *
 * Operation Codes:
 *   1: Converts the input string to an integer.
 *   2: Splits the input string by spaces into an array of strings.
 *   4: Splits the input string by spaces and maps each resulting string to a number.
 *   6: Divides the input string into an array of individual character strings.
 *   7: Splits the input string into characters and converts each to a number.
 *   8: Joins array elements using a space as the separator.
 *   9: Joins array elements, placing each on a new line.
 *   0: Concatenates array elements without any separating character.
 *   Default: Returns the input value without modification.
 *   Exception Handling: Returns the original input if any conversion fails.
 */
function dataTransformer(inputValue, transformationType) {
  try {
    switch (transformationType) {
      case 1:
        return parseInt(inputValue, 10);
      case 2:
        return inputValue.split(" ");
      case 4:
        return inputValue.split(" ").map((elementString) => Number(elementString));
      case 6:
        return inputValue.split("");
      case 7:
        return inputValue.split("").map((elementString) => Number(elementString));
      case 8:
        return inputValue.join(" ");
      case 9:
        return inputValue.join("\n");
      case 0:
        return inputValue.join("");
      default:
        return inputValue;
    }
  } catch (exceptionDetails) {
    return inputValue;
  }
}

/**
 * The primary function where the program's logic is executed.
 * This implementation computes all-pairs shortest paths using the Floyd-Warshall algorithm
 * and identifies edges that are not part of any shortest path.
 */
function executeProgram() {
  var firstLineData = readIntegerArray();
  var nodeCount = firstLineData[0];
  var edgeCount = firstLineData[1];

  var adjacencyMatrix = Array.from({
    length: nodeCount
  });
  var initialGraphState = Array.from({
    length: nodeCount
  });

  var infinityValue = 1000000007;

  for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
    adjacencyMatrix[nodeIdx] = Array.from({
      length: nodeCount
    }).fill(infinityValue);
    adjacencyMatrix[nodeIdx][nodeIdx] = 0;

    initialGraphState[nodeIdx] = Array.from({
      length: nodeCount
    }).fill(infinityValue);
    initialGraphState[nodeIdx][nodeIdx] = 0;
  }

  for (let edgeIdx = 0; edgeIdx < edgeCount; edgeIdx++) {
    var edgeInfo = readIntegerArray();
    let sourceNode = edgeInfo[0] - 1;
    let targetNode = edgeInfo[1] - 1;
    let weight = edgeInfo[2];

    adjacencyMatrix[sourceNode][targetNode] = weight;
    adjacencyMatrix[targetNode][sourceNode] = weight;

    initialGraphState[sourceNode][targetNode] = weight;
    initialGraphState[targetNode][sourceNode] = weight;
  }

  // Application of the Floyd-Warshall algorithm
  // to determine the shortest path between all pairs of nodes.
  for (let intermediateNode = 0; intermediateNode < nodeCount; intermediateNode++) {
    for (let startNode = 0; startNode < nodeCount; startNode++) {
      for (let endNode = 0; endNode < nodeCount; endNode++) {
        if (adjacencyMatrix[startNode][endNode] > adjacencyMatrix[startNode][intermediateNode] + adjacencyMatrix[intermediateNode][endNode]) {
          adjacencyMatrix[startNode][endNode] = adjacencyMatrix[startNode][intermediateNode] + adjacencyMatrix[intermediateNode][endNode];
        }
      }
    }
  }

  var removedEdgesCount = 0;
  for (let startNode = 0; startNode < nodeCount; startNode++) {
    for (let endNode = 0; endNode < nodeCount; endNode++) {
      // Identifies edges that are present in the original graph
      // but do not represent a shortest path in the final graph.
      if (initialGraphState[startNode][endNode] !== infinityValue && initialGraphState[startNode][endNode] !== adjacencyMatrix[startNode][endNode]) {
        removedEdgesCount++;
      }
    }
  }

  printResult(removedEdgesCount / 2);
}