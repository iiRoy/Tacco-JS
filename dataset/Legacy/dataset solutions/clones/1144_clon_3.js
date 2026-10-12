function executeProgram() {
  const rawData = retrieveInputData();
  const linesArray = rawData.split('\n');

  const countValue = parseInt(linesArray[0]);
  let numbersToProcess = [];

  // Replicate the behavior of `ls.slice(1, n+1)`
  // If `n` (countValue) is NaN, `slice(1, NaN+1)` becomes `slice(1)`, taking all remaining lines.
  // If `n` is 0 or negative, `slice(1, n+1)` results in an empty array.
  // If `n` is positive, it takes `n` elements starting from index 1,
  // including `undefined` if `n+1` exceeds the array length.
  if (isNaN(countValue)) {
      numbersToProcess = linesArray.slice(1);
  } else if (countValue > 0) {
      numbersToProcess = linesArray.slice(1, countValue + 1);
  }
  // If countValue is 0 or negative, numbersToProcess remains an empty array,
  // which correctly matches the behavior of slice(1, 1) or slice(1, <1).

  const numbersSequence = numbersToProcess.map(s => parseInt(s));

  console.log(findLongestIncreasingSubsequenceLength(numbersSequence));
}

function findLongestIncreasingSubsequenceLength(sequence) {
  // Preserve original behavior for an empty sequence:
  // `var table = [xs[0]]` would result in `[undefined]`.
  // The loop `for (var i = 1; i < xs.length; i++)` would not run.
  // `return table.length` would return 1.
  if (sequence.length === 0) {
    return 1;
  }

  const seqLength = sequence.length;
  const tails = [sequence[0]]; // `tails` stores the smallest tail of all increasing subsequences of length i+1.

  for (let idx = 1; idx < seqLength; idx++) {
    const currentNum = sequence[idx];
    // `findInsertionIndex` returns `i` such that `tails[i] < currentNum <= tails[i+1]`.
    // If `currentNum` is smaller than or equal to `tails[0]`, it returns -1.
    // Adding 1 to the result correctly gives the index to update in `tails`.
    // If -1 is returned, `tails[0]` is updated.
    const insertionPoint = findInsertionIndex(tails, currentNum);
    tails[insertionPoint + 1] = currentNum;
    logDebugInfo(tails);
  }
  return tails.length;
}

/**
 * Performs a binary search on `tails` to find the index `i` such that `tails[i] < currentNum <= tails[i+1]`.
 * If `currentNum` is less than or equal to `tails[0]`, it returns -1.
 * This is a variation of binary search for finding the "ceiling" element.
 */
function findInsertionIndex(tails, currentNum) {
  let low = 0;
  let high = tails.length;

  // Refactored initial check for clarity and to match original logic.
  const shouldReplaceFirstElement = (tails.length === 0 || currentNum <= tails[0]);
  if (shouldReplaceFirstElement) {
    return -1;
  }

  // Helper function for pivot calculation to make the loop body cleaner.
  const calculateMidPoint = (l, h) => Math.floor((l + h + 1) / 2);

  while (low + 1 < high) {
    let mid = calculateMidPoint(low, high);
    if (tails[mid] < currentNum) {
      low = mid;
    } else {
      high = mid;
    }
    logDebugInfo({low: low, high: high});
  }
  return low;
}

const isNodeEnvironment = typeof require !== 'undefined';

function retrieveInputData() {
  if (!isNodeEnvironment) {
    return document.getElementById('input').value;
  }
  return require('fs').readFileSync('/dev/stdin').toString();
}

function logDebugInfo(info) {
  if (!isNodeEnvironment) {
    console.error(info);
  }
}

if (isNodeEnvironment) {
  // Encapsulate the main program execution in a small helper function.
  const runApplication = () => executeProgram();
  runApplication();
}
