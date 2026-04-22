const inputResource = '/dev/stdin';
const recordDelimiter = '\n';

async function orchestrateSearchProcess() {
  const fileSystem = require('fs').promises;

  try {
    const entireContentBuffer = await fileSystem.readFile(inputResource, { encoding: 'ascii' });
    const entireContent = entireContentBuffer.toString();

    const contentParts = entireContent.split(recordDelimiter, 2);
    if (contentParts.length < 2) {
      console.error("Expected two lines (text and pattern) separated by a newline.");
      process.exit(1);
    }
    const targetString = contentParts[0];
    const queryFragment = contentParts[1];

    const searchStartOffset = 0;
    const searchEndLimit = targetString.length;

    const foundOffsets = findSubstringsRecursively(targetString, queryFragment, searchStartOffset, searchEndLimit, []);

    if (foundOffsets.length > 0) {
      console.log(foundOffsets.join('\n'));
    }
  } catch (error) {
    console.error("An error occurred during the search operation:", error.message);
    process.exit(1);
  }
}

function findSubstringsRecursively(bigString, smallString, currentScanPoint, terminationPoint, collectedIndices) {
  if (currentScanPoint >= terminationPoint) {
    return collectedIndices;
  }

  const nextMatchIndex = bigString.indexOf(smallString, currentScanPoint);

  if (nextMatchIndex === -1 || nextMatchIndex >= terminationPoint) {
    return collectedIndices;
  }

  collectedIndices.push(nextMatchIndex);

  return findSubstringsRecursively(bigString, smallString, nextMatchIndex + 1, terminationPoint, collectedIndices);
}

orchestrateSearchProcess();