const processInputData = (inputContent) => {
  const parsedNumbers = inputContent.split('\n').map(Number);
  const [totalSize, itemA, itemB] = parsedNumbers;

  const multiplyIntegers = (factorOne, factorTwo) => {
    let productAccumulator = 0;
    let currentFactor = factorOne;
    let multiplier = factorTwo;

    const isProductNegative = (currentFactor < 0 && multiplier > 0) || (currentFactor > 0 && multiplier < 0);

    currentFactor = Math.abs(currentFactor);
    multiplier = Math.abs(multiplier);

    while (currentFactor > 0) {
      if (currentFactor & 1) {
        productAccumulator += multiplier;
      }
      currentFactor >>= 1;
      multiplier <<= 1;
    }

    return isProductNegative ? -productAccumulator : productAccumulator;
  };

  const rangeA = totalSize - itemA + 1;
  const rangeB = totalSize - itemB + 1;

  const finalOutcome = multiplyIntegers(rangeA, rangeB);

  console.log('%s', finalOutcome);
};

function activateTestMode(){
  var testInputSource = document.getElementById("input");
  if (testInputSource) {
    processInputData(testInputSource.value);
  }
}

if (typeof require !== 'undefined' && require.main === module) {
  const fileSystemModule = require("fs");
  const standardInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
  processInputData(standardInputContent);
}
