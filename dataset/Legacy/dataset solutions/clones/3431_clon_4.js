function processNumbers(inputData) {
  const upperBoundary = parseInt(inputData, 10);
  let totalValidCount = 0;

  const generationQueue = [];

  generationQueue.push("3");
  generationQueue.push("5");
  generationQueue.push("7");

  let queuePointer = 0;

  while (queuePointer < generationQueue.length) {
    const currentNumberString = generationQueue[queuePointer++];
    const currentNumericValue = parseInt(currentNumberString, 10);

    if (currentNumericValue > upperBoundary) {
      continue;
    }

    const containsThree = currentNumberString.includes('3');
    const containsFive = currentNumberString.includes('5');
    const containsSeven = currentNumberString.includes('7');

    if (containsThree && containsFive && containsSeven) {
      totalValidCount++;
    }

    generationQueue.push(currentNumberString + '3');
    generationQueue.push(currentNumberString + '5');
    generationQueue.push(currentNumberString + '7');
  }

  console.log(totalValidCount);
}

processNumbers(require("fs").readFileSync("/dev/stdin", "utf8"));
