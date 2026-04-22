const obtainParameters = (sourceText) => {
  return sourceText.split(' ').map(v => parseInt(v, 10));
};

const computeOutcome = (inputArray) => {
  const [operandA, operandB, factorC, amountD, amountE] = inputArray;

  const initialCalculation = operandA * amountD + operandB * amountE;

  const intermediateState = {
    currentSum: initialCalculation,
    currentAmountD: amountD,
    currentAmountE: amountE
  };

  const afterFirstStage = ((state) => {
    const excessCombined = operandA + operandB - 2 * factorC;
    if (excessCombined > 0) {
      const sharedPortion = (state.currentAmountD < state.currentAmountE) ? state.currentAmountD : state.currentAmountE;
      return {
        currentSum: state.currentSum - (excessCombined * sharedPortion),
        currentAmountD: state.currentAmountD - sharedPortion,
        currentAmountE: state.currentAmountE - sharedPortion
      };
    }
    return state;
  })(intermediateState);

  const afterSecondStage = ((state) => {
    const excessOperandA = operandA - 2 * factorC;
    if (state.currentAmountD > 0 && excessOperandA > 0) {
      return {
        ...state,
        currentSum: state.currentSum - (excessOperandA * state.currentAmountD)
      };
    }
    return state;
  })(afterFirstStage);

  const finalStage = ((state) => {
    const excessOperandB = operandB - 2 * factorC;
    if (state.currentAmountE > 0 && excessOperandB > 0) {
      return {
        ...state,
        currentSum: state.currentSum - (excessOperandB * state.currentAmountE)
      };
    }
    return state;
  })(afterSecondStage);

  return finalStage.currentSum;
};

const executeProcess = (dataInput) => {
  const processedData = obtainParameters(dataInput);
  console.log(computeOutcome(processedData));
};

executeProcess(require("fs").readFileSync("/dev/stdin","utf8"));