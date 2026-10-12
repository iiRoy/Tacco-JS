function ProcessInput(rawData) {
  const NEWLINE_DELIMITER = "\n";
  const SPACE_DELIMITER = " ";
  const RADIX_DECIMAL = 10;
  const ZERO_VALUE = 0;
  const ONE_VALUE = 1;

  const lines = rawData.split(NEWLINE_DELIMITER);

  const firstLineData = lines[ZERO_VALUE].split(SPACE_DELIMITER);
  const countElements = parseInt(firstLineData[ZERO_VALUE], RADIX_DECIMAL);

  const stringNumbers = lines[ONE_VALUE].split(SPACE_DELIMITER);

  const numericArray = Array(countElements).fill(ZERO_VALUE);
  const operationsList = [];

  for (let currentIdx = ZERO_VALUE; currentIdx < countElements; currentIdx++) {
    numericArray[currentIdx] = parseInt(stringNumbers[currentIdx], RADIX_DECIMAL);

    const isNotFirstElement = currentIdx > ZERO_VALUE;
    const previousIdx = currentIdx - ONE_VALUE;
    const currentElementValue = numericArray[currentIdx];
    const previousElementValue = numericArray[previousIdx];

    if (isNotFirstElement) {
      // Condition 1: current element is positive and less than previous
      if (currentElementValue < previousElementValue && currentElementValue > ZERO_VALUE) {
        const currentOperationPair = [previousIdx, currentIdx];
        operationsList.push(currentOperationPair);
        numericArray[currentIdx] = previousElementValue + currentElementValue;
      }
      // Condition 2: current element is negative and less than previous
      else if (currentElementValue < ZERO_VALUE && currentElementValue < previousElementValue) {
        // The 'currentIdx' variable from the outer loop is incremented within this inner loop.
        // This behavior is preserved as per Type III cloning rules.
        const initialCurrentIdxForOperation = currentIdx;
        const currentOperationPair = [previousIdx, initialCurrentIdxForOperation];

        for (let innerLoopCounter = ZERO_VALUE; numericArray[currentIdx] + numericArray[currentIdx - ONE_VALUE] * innerLoopCounter <= numericArray[currentIdx - ONE_VALUE]; currentIdx++) {
          operationsList.push(currentOperationPair);
          numericArray[currentIdx] += numericArray[currentIdx - ONE_VALUE];
        }
        // These two lines are executed after the inner loop completes,
        // using the 'currentOperationPair' (which captures the initial 'currentIdx')
        // and the 'numericArray[currentIdx]' (which uses the final 'currentIdx' after inner loop increments).
        operationsList.push(currentOperationPair);
        numericArray[currentIdx] += numericArray[currentIdx - ONE_VALUE];
      }
    }
  }

  let finalResultOutput = String(operationsList.length);
  for (let opIndex = ZERO_VALUE; opIndex < operationsList.length; opIndex++) {
    const operationEntry = operationsList[opIndex];
    finalResultOutput += `${NEWLINE_DELIMITER}${operationEntry[ZERO_VALUE]} ${operationEntry[ONE_VALUE]}`;
  }
  console.log('%s', finalResultOutput);
}
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
