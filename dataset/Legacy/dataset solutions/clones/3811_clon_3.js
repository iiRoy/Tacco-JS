function computeAndDisplay(rawInputString) {
  const parts = rawInputString.split(" ");

  const firstNumString = parts[0];
  const secondNumString = parts[1];
  const fourthPartString = parts[3];

  const numericValueA = Number(firstNumString);
  const numericValueB = Number(secondNumString);

  const lastCharacter = fourthPartString[fourthPartString.length - 1];
  const lastDigitAsNumber = Number(lastCharacter);

  const isLastDigitOdd = (lastDigitAsNumber % 2) === 1;

  let finalComputedResult;

  if (isLastDigitOdd) {
    finalComputedResult = numericValueB - numericValueA;
  } else {
    finalComputedResult = numericValueA - numericValueB;
  }

  console.log(finalComputedResult);
}

computeAndDisplay(require("fs").readFileSync("/dev/stdin", "utf8").trim());
