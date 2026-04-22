function primaryExecutionUnit() {
  const magnitude = retrieveNumber();
  const sequence = retrieveList();

  const storageMechanism = new Map();

  sequence.forEach((elementValue, elementIndex) => {
    storageMechanism.set(elementValue - 1, elementIndex + 1);
  });

  const processIteration = (currentValueToPlace, currentStorage) => {
    if (currentValueToPlace > magnitude) {
      return { status: "CONTINUE", finalStorage: currentStorage };
    }

    let requiredAdditionalPlacements = currentValueToPlace - 1;
    let placementsMade = 0;
    let tempStorage = new Map(currentStorage);

    const indices = Array.from({ length: magnitude * magnitude }, (_, k) => k);

    const innerLoopResult = indices.reduce((acc, idx) => {
      if (acc.status === "FAIL" || acc.placementsMade === requiredAdditionalPlacements) {
        return acc;
      }

      if (!acc.tempStorage.has(idx)) {
        acc.tempStorage.set(idx, currentValueToPlace);
        acc.placementsMade++;
      } else if (acc.tempStorage.get(idx) === currentValueToPlace) {
        acc.status = "FAIL";
      }
      return acc;
    }, { status: "CONTINUE", tempStorage: tempStorage, placementsMade: 0 });

    if (innerLoopResult.status === "FAIL") {
      return { status: "FAIL", finalStorage: currentStorage };
    }
    
    // For the original problem, if N >= 2, the "FAIL" condition is always met
    // in the first iteration of processIteration (when currentValueToPlace is 2).
    // If N is 1, this path is skipped by the `currentValueToPlace > magnitude` check.
    // Thus, no need to worry about `placementsMade` not meeting `requiredAdditionalPlacements`
    // for the N >= 2 case, as it will always fail early.
    // For N = 1, `requiredAdditionalPlacements` is 0, `placementsMade` is 0,
    // so this condition is met by default and the loop effectively does nothing.

    return processIteration(currentValueToPlace + 1, innerLoopResult.tempStorage);
  };

  const validationResult = processIteration(2, storageMechanism);

  if (validationResult.status === "FAIL") {
    outputResult("No");
  } else {
    outputResult("Yes");
    const finalSequenceData = Array(magnitude * magnitude).fill(null);
    validationResult.finalStorage.forEach((val, key) => {
      finalSequenceData[key] = val;
    });
    outputResult(formatSequenceForDisplay(finalSequenceData));
  }
}

function retrieveNumber() { return nextInt(); }
function retrieveList() { return nextIntArray(); }
function outputResult(data) { myout(data); }
function formatSequenceForDisplay(arr) { return myconv(arr, 8); }