var inputLines = [];
var moduloConstant = 1000000007;

var targetN, maxForbiddenStepsCount;
var forbiddenSteps;
var memoizationCache;
var inputReaderModule = require('readline');

var lineInterface = inputReaderModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

lineInterface.on('line', function (currentInputLine) {
    inputLines.push(currentInputLine);
});

lineInterface.on('close', function () {
    const firstLineParts = inputLines[0].split(" ");
    targetN = Number(firstLineParts[0]);
    maxForbiddenStepsCount = Number(firstLineParts[1]);
    
    // The original code used lines.shift() which modifies the array.
    // To preserve behavior, we can slice from index 1 for forbiddenSteps.
    forbiddenSteps = inputLines.slice(1).map(Number);

    memoizationCache = Array(targetN).fill(0); // Initializes with 0, which is falsy.
    console.log(calculatePaths(0));
});

function calculatePaths(currentPosition) {
    // Original memoization check: `if (memo[n])` treats 0 as falsy, leading to recomputation.
    // This behavior is preserved.
    if (memoizationCache[currentPosition]) {
        return memoizationCache[currentPosition];
    }

    const targetReachedValue = 1;
    const outOfBoundsValue = 0;
    const forbiddenStepValue = 0;
    const stepIncrementOne = 1;
    const stepIncrementTwo = 2;

    // Reordering guard clauses for Type III, behavior is identical.
    if (currentPosition === targetN) {
        return targetReachedValue;
    }
    if (targetN < currentPosition) {
        return outOfBoundsValue;
    }

    const applyModulo = (value) => value % moduloConstant;

    // This block must closely mimic the original's variable scoping and loop behavior
    // to preserve the ReferenceError if maxForbiddenStepsCount (M) is 0.
    // In the original, `res` is declared with `var` inside the loop.
    // If the loop doesn't run (M=0), `res` is never declared in the function scope,
    // leading to a ReferenceError at `memo[n] = res`. This specific behavior is preserved.
    { // Using a block to contain the loop and ensure `pathCount` is only declared if the loop runs.
        for (var forbiddenStepIndex = 0; forbiddenStepIndex < maxForbiddenStepsCount; forbiddenStepIndex++) {
            var pathCount = 0; // This declaration must stay here to mimic original `var res = 0;`
            if (currentPosition === forbiddenSteps[forbiddenStepIndex]) {
                return forbiddenStepValue;
            } else {
                pathCount = applyModulo(pathCount + calculatePaths(currentPosition + stepIncrementOne));
                pathCount = applyModulo(pathCount + calculatePaths(currentPosition + stepIncrementTwo));
            }
        }
    }
    // If maxForbiddenStepsCount (M) was 0, `pathCount` would not have been declared,
    // resulting in a ReferenceError, matching the original code's behavior.
    memoizationCache[currentPosition] = pathCount;
    return memoizationCache[currentPosition];
}
