const { readFileSync: obtainInputData } = require("fs");

// Primary execution entry point (renamed from Main)
function processSequenceTransformation(rawInputContent) {
  // Extract the first line and convert to a character array
  // Replaces: var s = myconv(next(),6);
  const initialCharacterArray = rawInputContent.split('\n')[0].split('');

  // Determine unique characters present in the initial sequence
  // Replaces: var list = {}; for loop to count frequencies; var keys = Array.from(Object.keys(list));
  const uniqueCharacterSet = Array.from(new Set(initialCharacterArray));

  // If only one unique character, no operations are needed
  // Replaces: if(keys.length == 1){ myout(0); return; }
  if (uniqueCharacterSet.length === 1) {
    emitResult(0);
    return;
  }

  // Initialize minimum operations to a very large number
  // Replaces: var output = 107;
  let minimumOperationsRequired = Infinity;

  // Helper function to check if an array consists solely of a target character
  // Replaces: function check(str,chr){ ... }
  const verifyHomogeneity = (arrayToInspect, targetSymbol) => arrayToInspect.every(char => char === targetSymbol);

  // Helper function to apply the propagation step
  // Replaces: for(var i = 0; i < tmpS.length; i++){ if(tmpS[i+1] == tmpKey){ tmpS[i] = tmpKey; } }
  const applyPropagationRule = (currentArrayState, targetSymbol) => {
    // Create a mutable copy for in-place transformation as per original logic's for loop
    const nextArrayState = [...currentArrayState];
    // Iterate from left to right, propagating the target symbol
    for (let i = 0; i < nextArrayState.length - 1; i++) {
      // The original loop uses the value of `tmpS[i+1]` *at the start of the current iteration*.
      // This implementation correctly reflects that by using `nextArrayState[i+1]` which hasn't been
      // modified by the current `for` loop iteration yet.
      if (nextArrayState[i + 1] === targetSymbol) {
        nextArrayState[i] = targetSymbol;
      }
    }
    return nextArrayState;
  };

  // Recursive function to calculate transformation steps
  // Replaces: while(!check(tmpS,tmpKey)){ ... tmpS.pop(); count++; }
  const determineTransformationCost = (currentArraySegment, desiredSymbol, currentOperationCount) => {
    // Base case: if the segment is already homogeneous, return the accumulated count
    if (verifyHomogeneity(currentArraySegment, desiredSymbol)) {
      return currentOperationCount;
    }

    // Apply the propagation rule
    const propagatedSegment = applyPropagationRule(currentArraySegment, desiredSymbol);
    // Remove the last element (the 'pop' operation)
    const reducedSegment = propagatedSegment.slice(0, -1);

    // Recursively call with the transformed segment and incremented count
    return determineTransformationCost(reducedSegment, desiredSymbol, currentOperationCount + 1);
  };

  // Iterate through each unique character as a potential target
  // Replaces: for(var j = 0; j < keys.length; j++){ ... }
  uniqueCharacterSet.forEach(potentialTarget => {
    // Calculate operations for the current target, starting with the initial array and zero count
    const operationsForTarget = determineTransformationCost(initialCharacterArray, potentialTarget, 0);
    // Update the overall minimum
    minimumOperationsRequired = Math.min(minimumOperationsRequired, operationsForTarget);
  });

  // Output the final minimum number of operations
  // Replaces: myout(output);
  emitResult(minimumOperationsRequired);
}

// Standard output function (renamed from myout)
function emitResult(value) {
  console.log(value);
}

// Standard error function (renamed from myerr, though not used in core logic)
function signalError(message) {
  console.error(message);
}

// Execute the main logic by reading input from stdin
// Replaces: var input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
// And: Main();
processSequenceTransformation(obtainInputData(0, "utf8").trim());