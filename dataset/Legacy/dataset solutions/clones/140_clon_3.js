const fileSystem = require("fs");

const processInputLine = (inputLineString) => {
    const initialArrayAccessIndex = 11; // Corresponds to j[11]
    const loopStartingIndex = 10;       // Corresponds to m=n=10

    // Convert string parts to numbers immediately for clarity and explicit type handling.
    // This is behaviorally equivalent to the original's implicit coercion during arithmetic.
    let numericDataArray = inputLineString.split(',').map(Number);

    let currentAccumulatedSum = 0;
    let currentIterationIndex = loopStartingIndex;

    // First loop: Calculate cumulative sums backwards and store them in the array.
    // Original: for(s=0,m=n=10;m--;)j[m]=s-=j[m];
    // Rewritten as a while loop for structural modification.
    while (currentIterationIndex >= 0) {
        currentAccumulatedSum -= numericDataArray[currentIterationIndex];
        numericDataArray[currentIterationIndex] = currentAccumulatedSum;
        currentIterationIndex--;
    }

    // Second part: Update the accumulated sum based on specific array elements.
    // Original: s*=j[11]/(-j[11]-j[n]);
    // At this point, 'n' from the original code is still '10' (loopStartingIndex).
    const valueAtIndexEleven = numericDataArray[initialArrayAccessIndex];
    const valueAtIndexTen = numericDataArray[loopStartingIndex];

    // Introduce helper variables for intermediate computation steps.
    const subtractionResult = -valueAtIndexEleven - valueAtIndexTen;
    const divisionFactor = valueAtIndexEleven / subtractionResult;
    currentAccumulatedSum *= divisionFactor;

    // Third part: Find the target index using a decrementing search.
    // Original: for(...;j[--n]>=-s;);
    // 'n' from the original code is still '10' before this loop.
    let searchTargetIndex = loopStartingIndex;

    // Rewritten as a while loop for structural modification.
    // The condition j[--n] >= -s means 'searchTargetIndex' is decremented *before* access and comparison.
    while (numericDataArray[--searchTargetIndex] >= -currentAccumulatedSum) {
        // The loop body is intentionally empty, mirroring the original's structure.
    }

    // Original: console.log(++n);
    // The 'searchTargetIndex' was decremented one too many times by the loop's termination condition.
    // Incrementing it back yields the correct index.
    console.log(++searchTargetIndex);
};

const standardInputPath = "/dev/stdin";
const utf8Encoding = 'utf8';
const whitespaceSplitter = /\s/;

fileSystem.readFileSync(standardInputPath, utf8Encoding)
    .trim()
    .split(whitespaceSplitter)
    .map(processInputLine);
