const fileSystemModule = require('fs');
const { TextDecoder } = require('util');


const contentSize = fileSystemModule.fstatSync(process.stdin.fd).size;

const dataContainer = new Uint8Array(contentSize);

const octetsLoaded = fileSystemModule.readSync(process.stdin.fd, dataContainer, 0, contentSize, 0);

const utf8Decoder = new TextDecoder('utf8');

const parsedLines = utf8Decoder.decode(dataContainer.subarray(0, octetsLoaded)).split('\n');

processInputData();

/**
 * Executes the core logic for processing the input configuration.
 * This function simulates a sequence of transformations based on provided operations.
 */
function processInputData() {

  const widthValue = parseInt(parsedLines[0], 10);

  const numOperations = parseInt(parsedLines[1], 10);

  let mappingArray = new Int16Array(widthValue);

  for (let idx = 0, arrayLength = mappingArray.length; idx < arrayLength; idx++) {
    mappingArray[idx] = idx;
  }

  for (let opIdx = 2; opIdx < numOperations + 2; opIdx++) {

    const coordinateParts = parsedLines[opIdx].split(",");

    let sourceIndex = parseInt(coordinateParts[0], 10) - 1;
    let targetIndex = parseInt(coordinateParts[1], 10) - 1;

    mappingArray[sourceIndex] ^= mappingArray[targetIndex];
    mappingArray[targetIndex] ^= mappingArray[sourceIndex];
    mappingArray[sourceIndex] ^= mappingArray[targetIndex];
  }

  for (let resultIdx = 0; resultIdx < mappingArray.length; resultIdx++) {
    console.log(mappingArray[resultIdx] + 1);
  }

}