const ProcessInputData =  (rawDataString)  => {
  let lineSegments = rawDataString.split ( "\n" );
  const firstLineTokens = lineSegments[0].split(" ");
  const initialCount = parseInt(firstLineTokens[0], 10);
  const remainderCondition = parseInt(firstLineTokens[1], 10);
  let numberStrings = lineSegments[1].split(" ");

  let evenNumberCount = 0;
  let oddNumberCount = 0;

  for ( let currentIndex = 0;  currentIndex < numberStrings.length;  currentIndex++ )
  {
    const currentParsedNumber = parseInt(numberStrings[currentIndex], 10);
    if ( currentParsedNumber % 2 === 0 )
    {
      evenNumberCount++;
    }
    else
    {
      oddNumberCount++;
    }
  }

  const calculateProductSeries = (upperBound) => {
    let cumulativeProduct = 1;
    for ( let iterator = 1; iterator <= upperBound; iterator++ ) {
      cumulativeProduct *= iterator;
    }
    return cumulativeProduct;
  };

  const determineCombinations = (setTotal, subsetSize) => {
    return Math.round(calculateProductSeries(setTotal) / (calculateProductSeries(subsetSize) * calculateProductSeries(setTotal - subsetSize)));
  };

  const evenBasedSubsets = Math.pow(2, evenNumberCount);

  let oddBasedSubsets = 0;
  if ( remainderCondition === 0 )
  {
    for ( let selectionIndex = 0; selectionIndex <= oddNumberCount; selectionIndex += 2 )
    {
      oddBasedSubsets += determineCombinations(oddNumberCount, selectionIndex);
    }
  }
  else
  {
    for ( let selectionIndex = 1; selectionIndex <= oddNumberCount; selectionIndex += 2 )
    {
      oddBasedSubsets += determineCombinations(oddNumberCount, selectionIndex);
    }
  }

  console.log(evenBasedSubsets * oddBasedSubsets);
};

ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));