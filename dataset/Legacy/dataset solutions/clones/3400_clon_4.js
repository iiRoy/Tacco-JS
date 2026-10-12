function processInputAndCalculate(inputContent) {
  const lines = inputContent.split("\n");
  const numElements = parseInt(lines[0], 10);
  const valuesArray = lines[1].split(" ").map(Number);

  const initialAccumulatorState = {
    digitsList: new Array(valuesArray[0]).fill(1),
    thresholdValue: 1,
    isDigitsUniform: true,
    pendingUniformityCheck: false
  };

  const finalAccumulatorState = Array.from({ length: numElements - 1 }, (_, index) => index + 1).reduce((currentAcc, currentIdx) => {
    let { digitsList, thresholdValue, isDigitsUniform, pendingUniformityCheck } = currentAcc;

    let nextDigitsList = [...digitsList];
    let nextThresholdValue = thresholdValue;
    let nextIsDigitsUniform = isDigitsUniform;
    let nextPendingUniformityCheck = pendingUniformityCheck;

    if (nextPendingUniformityCheck) {
      const firstDigitInList = nextDigitsList[0];
      const allDigitsAreSame = nextDigitsList.every(digit => digit === firstDigitInList);
      nextIsDigitsUniform = allDigitsAreSame;
      nextPendingUniformityCheck = false;
    }

    const currentValue = valuesArray[currentIdx];
    const previousValue = valuesArray[currentIdx - 1];

    if (currentValue > previousValue) {
      const difference = currentValue - previousValue;
      for (let k = 0; k < difference; k++) {
        nextDigitsList.push(1);
      }
    } else if (nextIsDigitsUniform) {
      nextDigitsList[currentValue - 1]++;
      nextDigitsList = nextDigitsList.slice(0, currentValue);
      if (nextDigitsList.length !== 1) {
        nextIsDigitsUniform = false;
        nextThresholdValue++;
      }
    } else {
      nextDigitsList = nextDigitsList.slice(0, currentValue);
      let carryHappenedInStep = false;
      for (let k = currentValue - 1; k >= 0; k--) {
        if (nextDigitsList[k] === nextThresholdValue) {
          nextDigitsList[k] = 1;
        } else {
          nextDigitsList[k]++;
          carryHappenedInStep = true;
          break;
        }
      }
      if (carryHappenedInStep) {
        nextPendingUniformityCheck = true;
      }
    }

    return {
      digitsList: nextDigitsList,
      thresholdValue: nextThresholdValue,
      isDigitsUniform: nextIsDigitsUniform,
      pendingUniformityCheck: nextPendingUniformityCheck
    };
  }, initialAccumulatorState);

  const finalDigits = finalAccumulatorState.digitsList;
  const maximumValue = Math.max(...finalDigits);
  console.log('%s', maximumValue);
}
  
function debug(){
  var input = document.getElementById("input").value;
  processInputAndCalculate(input);
}
processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
