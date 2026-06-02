console.log((inputData => {
  const trimmedInput = inputData.trim();
  const inputLines = trimmedInput.split('\n');

  const parseNumbersFromLine = (lineString) => lineString.split(' ').map(Number);

  const firstLineValues = parseNumbersFromLine(inputLines[0]);
  const secondLineValues = parseNumbersFromLine(inputLines[1]);

  const arraySize = firstLineValues[0];
  const initialArray = secondLineValues;

  initialArray.sort((valueA, valueB) => valueB - valueA);

  let searchLeftBoundary = 0;
  let searchRightBoundary = arraySize - 1;

  while (searchRightBoundary - searchLeftBoundary > 1) {
    const middleIndex = searchLeftBoundary + Math.floor((searchRightBoundary - searchLeftBoundary) / 2);
    if (initialArray[middleIndex] < 0) {
      searchRightBoundary = middleIndex;
    } else {
      searchLeftBoundary = middleIndex;
    }
  }
  const splitPointIndex = searchRightBoundary;

  const operationRecords = [];
  let currentAccumulatorB = initialArray[0];
  let currentAccumulatorC = initialArray[initialArray.length - 1];

  const positiveElementsSegment = initialArray.slice(1, splitPointIndex);
  const negativeElementsSegment = initialArray.slice(splitPointIndex, initialArray.length - 1);

  while (positiveElementsSegment.length > 0) {
    const currentPositiveElement = positiveElementsSegment.pop();
    operationRecords.push(`${currentAccumulatorC} ${currentPositiveElement}`);
    currentAccumulatorC -= currentPositiveElement;
  }

  operationRecords.push(`${currentAccumulatorB} ${currentAccumulatorC}`);
  currentAccumulatorB -= currentAccumulatorC;

  while (negativeElementsSegment.length > 0) {
    const currentNegativeElement = negativeElementsSegment.pop();
    operationRecords.push(`${currentAccumulatorB} ${currentNegativeElement}`);
    currentAccumulatorB -= currentNegativeElement;
  }

  return `${currentAccumulatorB}\n${operationRecords.join('\n')}`;

})(require('fs').readFileSync('/dev/stdin', 'utf8')));
