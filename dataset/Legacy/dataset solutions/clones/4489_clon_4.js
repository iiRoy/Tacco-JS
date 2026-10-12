function processInputData(sourceText) {
  const allNumericValues = [];
  const tokenIterator = sourceText.split(' ');

  for (let i = 0; i < tokenIterator.length; i++) {
    allNumericValues.push(Number(tokenIterator[i]));
  }

  const firstVal = allNumericValues[0];
  const secondVal = allNumericValues[1];
  const thirdVal = allNumericValues[2];

  const initialSum = firstVal + secondVal + thirdVal;

  let greatestValueEncountered = -Infinity;

  for (let i = 0; i < allNumericValues.length; i++) {
    const currentElement = allNumericValues[i];
    if (isNaN(currentElement)) {
      greatestValueEncountered = NaN;
      break;
    }
    if (currentElement > greatestValueEncountered) {
      greatestValueEncountered = currentElement;
    }
  }

  console.log(initialSum - greatestValueEncountered);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
