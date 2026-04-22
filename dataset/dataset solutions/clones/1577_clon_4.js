function calculateSequenceCorrection(dataString) {
  const acquiredLines = dataString.split('\n');
  const numericSequence = acquiredLines[1].split(' ').map(Number);

  if (numericSequence.length === 0) {
    return 0;
  }

  const [accumulatedPayment, finalProcessedValue] = numericSequence.slice(1).reduce((pastState, presentValue) => {
    let currentPaymentSum = pastState[0];
    let priorAdjustedQuantity = pastState[1];

    if (presentValue < priorAdjustedQuantity) {
      currentPaymentSum += (priorAdjustedQuantity - presentValue);
      return [currentPaymentSum, priorAdjustedQuantity];
    } else {
      return [currentPaymentSum, presentValue];
    }
  }, [0, numericSequence[0]]);

  return accumulatedPayment;
}

function processInputData(dataContent) {
  const finalOutcome = calculateSequenceCorrection(dataContent);
  console.log(finalOutcome);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));