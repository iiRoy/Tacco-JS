const systemInputModule = require('readline');
const debugUtils = require('util');

let inputLineBuffer = [];
let processedInputStream;

const inputInterface = systemInputModule.createInterface({
  input: process.stdin,
  output: process.stdout
});

inputInterface.on('line', (currentLine) => {
  inputLineBuffer.push(currentLine);
});

inputInterface.on('close', () => {
  processedInputStream = initializeInputProcessor(inputLineBuffer);
  executePrimaryRoutine();
});

/**
 * Creates a deep copy of an object using JSON serialization.
 * @param {object} sourceObject The object to clone.
 * @returns {object} A new, independent copy of the object.
 */
function createDeepCopy(sourceObject) {
  return JSON.parse(JSON.stringify(sourceObject));
}

function getNextInteger() { return convertData(fetchNextInput(), 'int'); }
function getNextStringArray() { return convertData(fetchNextInput(), 'strArr'); }
function getNextIntegerArray() { return convertData(fetchNextInput(), 'intArr'); }
function getNextCharacterArray() { return convertData(fetchNextInput(), 'charArr'); }

function fetchNextInput() { return processedInputStream.retrieveNext(); }
function hasMoreInput() { return processedInputStream.hasMore(); }

/**
 * Sets up an object to manage input line processing, using a closure for state.
 * @param {string[]} rawInputLines An array of raw input strings.
 * @returns {object} An object with methods to navigate the input.
 */
function initializeInputProcessor(rawInputLines) {
  let currentLineIndex = 0;
  const totalLines = rawInputLines.length;

  return {
    hasMore: function() {
      return currentLineIndex < totalLines;
    },
    retrieveNext: function() {
      if (!this.hasMore()) {
        throw new Error("InputExhaustedException: No more data available in the input stream.");
      }
      const currentInput = rawInputLines[currentLineIndex];
      currentLineIndex++;
      return currentInput;
    }
  };
}

/**
 * Outputs a message to the standard output.
 * @param {*} content The content to display.
 */
function displayOutput(content) {
  console.log(content);
}

/**
 * Outputs a debug message to the standard error stream.
 * @param {*} debugMessage The message or object to debug.
 */
function logDebugInfo(debugMessage) {
  console.error("DEBUG_INFO:", debugUtils.inspect(debugMessage));
}

/**
 * Handles various data type conversions based on a specified conversion type.
 * @param {*} inputData The data to convert.
 * @param {string} conversionType A string indicating the desired conversion.
 * @returns {*} The converted data or the original data if conversion fails/is unknown.
 */
function convertData(inputData, conversionType) {
  try {
    switch (conversionType) {
      case 'int':
        return parseInt(inputData, 10);
      case 'strArr':
        return inputData.split(" ");
      case 'intArr':
        return inputData.split(" ").map(Number);
      case 'charArr':
        return inputData.split("");
      case 'charIntArr':
        return inputData.split("").map(Number);
      case 'joinSpace':
        return inputData.join(" ");
      case 'joinNewline':
        return inputData.join("\n");
      case 'joinNone':
        return inputData.join("");
      default:
        logDebugInfo(`Warning: Unknown conversion type '${conversionType}'. Returning original data.`);
        return inputData;
    }
  } catch (conversionError) {
    logDebugInfo(`Error during data conversion for type '${conversionType}': ${conversionError.message}`);
    return inputData;
  }
}

function executePrimaryRoutine() {
  const nodeCount = getNextInteger();
  
  if (nodeCount < 1) {
    logDebugInfo("Invalid node count. Must be at least 1.");
    return;
  }

  const adjacencyList = Array.from({ length: nodeCount }, () => []);
  const edgePropertiesMap = new Map();
  
  let maxDegreeEncountered = 0;

  const expectedEdgeCount = nodeCount - 1;
  for (let edgeIndex = 0; edgeIndex < expectedEdgeCount; ++edgeIndex) {
    const edgeEndpoints = getNextIntegerArray();
    
    if (edgeEndpoints.length !== 2) {
      logDebugInfo(`Invalid edge format at index ${edgeIndex}. Expected 2 endpoints.`);
      continue; 
    }

    const firstNode = edgeEndpoints[0] - 1;
    const secondNode = edgeEndpoints[1] - 1;

    if (firstNode < 0 || firstNode >= nodeCount || secondNode < 0 || secondNode >= nodeCount) {
        logDebugInfo(`Invalid node index in edge at index ${edgeIndex}: (${firstNode+1}, ${secondNode+1}). Skipping.`);
        continue;
    }

    adjacencyList[firstNode].push(secondNode);
    adjacencyList[secondNode].push(firstNode);
    
    const edgeKey = getNormalizedEdgeKey(firstNode, secondNode);
    edgePropertiesMap.set(edgeKey, {
      originalIndex: edgeIndex,
      assignedColor: null
    });
  }
  
  function getNormalizedEdgeKey(nodeA, nodeB) {
      return nodeA < nodeB ? `${nodeA}:${nodeB}` : `${nodeB}:${nodeA}`;
  }

  const traversalQueue = [[0, 0]];
  
  while (traversalQueue.length > 0) {
    const [currentNode, incomingEdgeColor] = traversalQueue.shift();

    const neighbors = adjacencyList[currentNode];
    let nextAvailableColor = 1;

    for (let neighborIndex = 0; neighborIndex < neighbors.length; ++neighborIndex) {
      const adjacentNode = neighbors[neighborIndex];

      const currentEdgeKey = getNormalizedEdgeKey(currentNode, adjacentNode);
      const edgeInfo = edgePropertiesMap.get(currentEdgeKey);

      if (edgeInfo && edgeInfo.assignedColor === null) {
        if (nextAvailableColor === incomingEdgeColor) {
          nextAvailableColor++;
        }
        
        edgeInfo.assignedColor = nextAvailableColor;
        traversalQueue.push([adjacentNode, nextAvailableColor]);
        
        maxDegreeEncountered = Math.max(maxDegreeEncountered, nextAvailableColor);
        
        nextAvailableColor++;
      }
    }
  }
  
  displayOutput(maxDegreeEncountered);

  const finalEdgeColors = Array(expectedEdgeCount).fill(null);
  
  for (const edgeEntry of edgePropertiesMap.values()) {
    finalEdgeColors[edgeEntry.originalIndex] = edgeEntry.assignedColor;
  }
  
  displayOutput(convertData(finalEdgeColors, 'joinNewline'));
}