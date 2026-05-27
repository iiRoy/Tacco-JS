const isNodeRuntime = typeof require !== 'undefined';

function executeProgram() {
  const rawData = obtainSourceData();
  const dataLines = rawData.split('\n');

  const elementCount = Number.parseInt(dataLines[0]);
  const numberSequence = dataLines.slice(1, elementCount + 1).map(Number.parseInt);

  console.log(determineLongestIncreasingSubsequence(numberSequence));
}

function determineLongestIncreasingSubsequence(sequence) {
  if (sequence.length === 0) {
    return 0;
  }

  // The 'tails' array stores the smallest ending element of an increasing subsequence of a given length.
  // currentTails[k] is the smallest ending element of an increasing subsequence of length k+1.
  const finalTails = sequence.slice(1).reduce((currentTails, currentElement) => {
    const insertionPoint = findInsertionIndex(currentTails, currentElement);
    currentTails[insertionPoint + 1] = currentElement;
    logDiagnostic(currentTails);
    return currentTails;
  }, [sequence[0]]);

  return finalTails.length;
}

/**
 * Returns i s.t. collection[i] < targetValue && targetValue <= collection[i+1]
 * Implemented with recursive binary search.
 */
function findInsertionIndex(collection, targetValue) {
  const collectionSize = collection.length;

  if (collectionSize === 0 || targetValue <= collection[0]) {
    return -1;
  }

  // Recursive helper for binary search
  const performRecursiveSearch = (lowerBound, upperBound) => {
    logDiagnostic({ lower: lowerBound, upper: upperBound });

    if (lowerBound + 1 >= upperBound) {
      return lowerBound;
    }

    const midPoint = Math.floor((lowerBound + upperBound + 1) / 2);
    if (collection[midPoint] < targetValue) {
      return performRecursiveSearch(midPoint, upperBound);
    } else {
      return performRecursiveSearch(lowerBound, midPoint);
    }
  };

  return performRecursiveSearch(0, collectionSize);
}

function obtainSourceData() {
  if (!isNodeRuntime) {
    return document.getElementById('input').value;
  }
  return require('fs').readFileSync('/dev/stdin').toString();
}

function logDiagnostic(diagnosticData) {
  if (!isNodeRuntime) {
    console.error(diagnosticData);
  }
}

if (isNodeRuntime) {
  executeProgram();
}
