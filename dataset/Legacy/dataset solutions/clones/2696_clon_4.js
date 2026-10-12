// @ts-check

const determineOutput = (currentSum) => {
  const outputStrategies = {
    0: (val) => val >> 1,
    1: () => 'IMPOSSIBLE'
  };

  const parityKey = currentSum & 1;

  return outputStrategies[parityKey](currentSum);
};

/**
 * @param {number} firstOperand
 * @param {number} secondOperand
 */
function calculateAndReport(firstOperand, secondOperand) {
  const aggregateValue = firstOperand + secondOperand;
  const finalResult = determineOutput(aggregateValue);
  console.log(finalResult);
}

const inputOne = Number(process.argv[2]);
const inputTwo = Number(process.argv[3]);

calculateAndReport(inputOne, inputTwo);
