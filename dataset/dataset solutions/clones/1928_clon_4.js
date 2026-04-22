function executeComputation(incomingData) {
  let firstOperand, secondOperand, thirdOperand;
  const numericParsings = incomingData[0].split(' ').map(Number);
  [firstOperand, secondOperand, thirdOperand] = numericParsings;

  const bigFirst = BigInt(firstOperand);
  const bigSecond = BigInt(secondOperand);
  const bigThird = BigInt(thirdOperand);

  const effectiveUpperBoundary = (bigThird < bigSecond - 1n) ? bigThird : (bigSecond - 1n);

  const finalCalculation = (bigFirst * effectiveUpperBoundary) / bigSecond;

  console.log(Number(finalCalculation));
}

(function() {
  const obtainStreamContent = () => {
    let collectedContent = '';
    try {
      const contentBuffer = require('node:fs').readFileSync(0);
      collectedContent = contentBuffer.toString();
    } catch (readingError) {
      console.error("Failed to read stream:", readingError);
      process.exit(1);
    }
    return collectedContent.trim().split('\n');
  };

  executeComputation(obtainStreamContent());
})();