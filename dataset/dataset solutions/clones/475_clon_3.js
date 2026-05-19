const fileSystemModule = require('fs');
let inputByteLength = fileSystemModule.fstatSync(process.stdin.fd).size;
let inputBuffer = Buffer.alloc(inputByteLength);
let actualBytesRead = fileSystemModule.readSync(process.stdin.fd, inputBuffer, 0, inputByteLength, 0);
const rawInputLines = inputBuffer.toString('utf8', 0, actualBytesRead).split('\n');

processFieldData();

const X_BIT_SHIFT = 11;
const Y_BIT_MASK = 2047; // Represents 11 bits (2^11 - 1)

function processFieldData() {
  let linePointer = 0;
  const NUM_ELEMENT_TYPES = 5;
  const PATH_SEGMENTS_TO_PROCESS = 3;

  while (true) {
    const currentFieldDimensions = rawInputLines[linePointer].split(' ');
    const fieldWidth = Number(currentFieldDimensions[0]);
    const fieldHeight = Number(currentFieldDimensions[1]);

    if (!fieldWidth && !fieldHeight) {
      break;
    }

    let startPositionEncoded;
    let goalPositionEncoded;
    const elementLocationsByType = [[], [], [], [], []];
    let charFromInput;
    let currentLineContent;
    let typeSpecificLocations;
    let rowIdx;
    let colIdx;

    for (rowIdx = fieldHeight; rowIdx--;) {
      linePointer++;
      currentLineContent = rawInputLines[linePointer];
      for (colIdx = fieldWidth; colIdx--;) {
        charFromInput = currentLineContent[colIdx];

        if (charFromInput === '.') {
          // Most common, handle first
        } else if (charFromInput >= '1' && charFromInput <= '5') {
          typeSpecificLocations = elementLocationsByType[Number(charFromInput) - 1];
          typeSpecificLocations[typeSpecificLocations.length] = encodeCoordinates(colIdx, rowIdx);
        } else if (charFromInput === 'S') {
          startPositionEncoded = encodeCoordinates(colIdx, rowIdx);
        } else { // Must be 'G'
          goalPositionEncoded = encodeCoordinates(colIdx, rowIdx);
        }
      }
    }

    const infinityValue = 1 << 30;
    let optimalStartingElementType = -1;
    let currentCalculatedDistance;
    let minimumOverallDistance = infinityValue;
    let distancePathMatrix;

    const initializeDistanceMatrix = (matrixRef, elementDataRef, initialValue) => {
      for (let typeIndex = 0; typeIndex < NUM_ELEMENT_TYPES; typeIndex++) {
        let currentTypeLength = elementDataRef[typeIndex].length;
        matrixRef[typeIndex] = new Array(currentTypeLength).fill(initialValue);
      }
    };

    for (let initialElementTypeChoice = 0; initialElementTypeChoice < NUM_ELEMENT_TYPES; initialElementTypeChoice++) {
      distancePathMatrix = [];
      initializeDistanceMatrix(distancePathMatrix, elementLocationsByType, infinityValue);

      let currentElementType = (initialElementTypeChoice + 1) % NUM_ELEMENT_TYPES;
      let currentElementTypeCount = elementLocationsByType[currentElementType].length;
      let currentTypeDistances = distancePathMatrix[currentElementType];
      let currentTypeElements = elementLocationsByType[currentElementType];

      for (let idxA = 0; idxA < currentElementTypeCount; idxA++) {
        currentTypeDistances[idxA] = computeManhattanDistance(startPositionEncoded, currentTypeElements[idxA]);
      }

      for (let pathSegmentCount = 0; pathSegmentCount < PATH_SEGMENTS_TO_PROCESS; pathSegmentCount++) {
        let nextElementType = (currentElementType + 1) % NUM_ELEMENT_TYPES;
        let nextTypeDistances = distancePathMatrix[nextElementType];
        let nextTypeElements = elementLocationsByType[nextElementType];
        let nextElementTypeCount = nextTypeElements.length;

        for (let idxA = 0; idxA < currentElementTypeCount; idxA++) {
          const currentTypeDistanceAtIndex = currentTypeDistances[idxA];
          const currentTypeElementAtIndex = currentTypeElements[idxA];

          if (currentTypeDistanceAtIndex >= minimumOverallDistance) {
            continue;
          }

          for (let idxB = 0; idxB < nextElementTypeCount; idxB++) {
            const nextTypeElementAtIndex = nextTypeElements[idxB];
            const distanceToNextElement = computeManhattanDistance(currentTypeElementAtIndex, nextTypeElementAtIndex);
            const potentialNewPathDistance = currentTypeDistanceAtIndex + distanceToNextElement;

            nextTypeDistances[idxB] = getMinOfTwo(nextTypeDistances[idxB], potentialNewPathDistance);

            if (pathSegmentCount === PATH_SEGMENTS_TO_PROCESS - 1) {
              const finalSegmentDistance = computeManhattanDistance(nextTypeElementAtIndex, goalPositionEncoded);
              currentCalculatedDistance = nextTypeDistances[idxB] + finalSegmentDistance;

              if (currentCalculatedDistance < minimumOverallDistance) {
                minimumOverallDistance = currentCalculatedDistance;
                optimalStartingElementType = initialElementTypeChoice;
              }
            }
          }
        }

        currentElementType = nextElementType;
        currentTypeDistances = nextTypeDistances;
        currentTypeElements = nextTypeElements;
        currentElementTypeCount = nextElementTypeCount;
      }
    }

    if (minimumOverallDistance === infinityValue) {
      console.log("NA");
    } else {
      console.log((optimalStartingElementType + 1) + " " + minimumOverallDistance);
    }

    linePointer++;
  }
}

function computeManhattanDistance(fromCoord, toCoord) {
  const fromX = fromCoord >> X_BIT_SHIFT;
  const fromY = fromCoord & Y_BIT_MASK;
  const toX = toCoord >> X_BIT_SHIFT;
  const toY = toCoord & Y_BIT_MASK;

  return getAbsoluteValue(fromX - toX) + getAbsoluteValue(fromY - toY);
}

function getMinOfTwo(valA, valB) {
  return valB + ((valA - valB) & ((valA - valB) >> 31));
}

function encodeCoordinates(xCoord, yCoord) {
  return (xCoord << X_BIT_SHIFT) + yCoord;
}

function getAbsoluteValue(value) {
  return (value ^ (value >> 31)) - (value >> 31);
}
