function computeFinalState(gameInput) {
    let rawNumbers = gameInput.match(/\d+/g);
    
    let totalMoveOptions = Number(rawNumbers[0]);
    let desiredStones = Number(rawNumbers[1]);
    
    let selectionValues = [];
    for (let currentNumberIndex = 2; currentNumberIndex < 2 + totalMoveOptions; currentNumberIndex++) {
        selectionValues.push(Number(rawNumbers[currentNumberIndex]));
    }

    let initialCutoff = selectionValues[0];

    let outcomeMemo = new Map();

    function ascertainVictory(currentPile, availableSelections, memoizationTable, minimumAllowed) {
        if (memoizationTable.has(currentPile)) {
            return memoizationTable.get(currentPile);
        }

        if (currentPile < minimumAllowed) {
            memoizationTable.set(currentPile, "Second");
            return "Second";
        }
        
        let canSecureWin = false;
        for (let idx = 0; idx < availableSelections.length; idx++) {
            let removedAmount = availableSelections[idx];
            let subsequentPile = currentPile - removedAmount;

            if (subsequentPile >= 0) {
                if (ascertainVictory(subsequentPile, availableSelections, memoizationTable, minimumAllowed) === "Second") {
                    canSecureWin = true;
                    break;
                }
            }
        }

        let finalVerdict = canSecureWin ? "First" : "Second";
        memoizationTable.set(currentPile, finalVerdict);
        return finalVerdict;
    }

    let finalResult = ascertainVictory(desiredStones, selectionValues, outcomeMemo, initialCutoff);

    console.log('%s', finalResult);
    return finalResult;
}

function testOutcome(testIndex){
  let inputSource = document.getElementById("input" + testIndex);
  let outputTarget = document.getElementById("output" + testIndex);
  let statusDisplay = document.getElementById("result" + testIndex);

  if (inputSource && outputTarget && statusDisplay) {
      let currentTestData = inputSource.value;
      let calculatedResponse = computeFinalState(currentTestData);
      let expectedResponse = outputTarget.value.split("\n")[0];

      let matchStatus = (calculatedResponse === expectedResponse) ? "AC" : "WA";
      statusDisplay.innerHTML = matchStatus;
  } else {
      console.error("Missing DOM elements for test index: " + testIndex);
  }
}

if (typeof require !== 'undefined' && typeof module !== 'undefined' && typeof process !== 'undefined') {
    computeFinalState(require("fs").readFileSync("/dev/stdin", "utf8"));
}