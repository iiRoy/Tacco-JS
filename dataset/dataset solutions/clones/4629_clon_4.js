require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
}).on('line', processInputLine);

let toggleState = false; // Renamed from 'flag'

function processInputLine(currentLine) {
  if ((toggleState = !toggleState)) return; // Preserves the every-other-line behavior

  const inputNumbers = currentLine.split(' ').map(val => parseInt(val, 10)); // Renamed from 'nums'
  const directionSigns = determineDirections(inputNumbers); // Renamed from 'grads', calls new function
  const segmentCountResult = tallySegments(directionSigns); // Renamed from 'result', calls new function
  console.log(segmentCountResult);
}

// Replacement for 'check' function
// Uses an iterative loop instead of recursion to calculate signs
function determineDirections(numberArray) {
  const signs = [];
  if (numberArray.length < 2) {
    return signs;
  }

  for (let idx = 0; idx < numberArray.length - 1; idx++) {
    const currentVal = numberArray[idx];
    const nextVal = numberArray[idx + 1];
    let signValue;

    if (nextVal > currentVal) {
      signValue = 1;
    } else if (nextVal < currentVal) {
      signValue = -1;
    } else {
      signValue = 0;
    }
    signs.push(signValue);
  }
  return signs;
}

// Helper generator function to mimic the complex argument passing of the original 'count' recursion
function* generateCountPairs(gradientArray) {
  if (gradientArray.length === 0) {
    return;
  }

  let currentA = gradientArray[0];
  let currentB = gradientArray[1];
  let remainingGradients = gradientArray.slice(2);

  while (currentB !== undefined) {
    yield { a: currentA, b: currentB };

    if (currentA !== currentB) {
      // Original: count(++n, ...next) -> 'a' becomes next[0], 'b' becomes next[1]
      currentA = remainingGradients[0];
      currentB = remainingGradients[1];
      remainingGradients = remainingGradients.slice(2);
    } else {
      // Original: count(n, a, ...next) -> 'a' is preserved, 'b' becomes next[0]
      currentB = remainingGradients[0];
      remainingGradients = remainingGradients.slice(1);
    }
  }

  // Yield the final 'a' with undefined 'b' to trigger the base case
  if (currentA !== undefined) {
    yield { a: currentA, b: undefined };
  }
}

// Replacement for 'count' function
// Uses a generator and iteration to count segments
function tallySegments(signArray) {
  if (signArray.length === 0) {
    return 1; // Matches original behavior for empty gradient array
  }

  let currentSegmentCount = 1; // Initial count as per original logic
  const gradientPairs = generateCountPairs(signArray);

  for (const { a, b } of gradientPairs) {
    if (b === undefined) {
      // This is the base case of the original recursive 'count' function
      return currentSegmentCount;
    }
    if (a !== b) {
      currentSegmentCount++;
    }
    // If a === b, currentSegmentCount does not change, mimicking original behavior
  }
  return currentSegmentCount; // Should ideally be unreachable if generator always yields b=undefined at end
}
