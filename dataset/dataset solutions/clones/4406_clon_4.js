const acquireData = (sourceContent) => {
  const contentSegments = sourceContent.trim().split('\n');
  const numericalSequence = contentSegments[1].split(' ').map(Number);
  return numericalSequence;
};

const derivePairedNumbers = (sourceSequence) => {
  const orderedSequence = [...sourceSequence].sort((first, second) => first - second);

  const identifiedPairs = orderedSequence.reduce((accumulator, currentValue, currentIndex, fullArray) => {
    if (currentIndex < fullArray.length - 1 && currentValue === fullArray[currentIndex + 1]) {
      accumulator.push(currentValue);
    }
    return accumulator;
  }, []);

  return identifiedPairs;
};

const computeFinalResult = (candidatePairs) => {
  if (candidatePairs.length === 0) {
    return 0;
  }

  const distinctValues = Array.from(new Set(candidatePairs));
  distinctValues.sort((first, second) => second - first);

  return distinctValues[0] * distinctValues[1];
};

const orchestrateCalculation = () => {
  const initialInput = require("fs").readFileSync("/dev/stdin", "utf8");
  const processedNumbers = acquireData(initialInput);
  const extractedPairs = derivePairedNumbers(processedNumbers);
  const finalProduct = computeFinalResult(extractedPairs);
  console.log(finalProduct);
};

orchestrateCalculation();