function Main(rawData) {
  let lines = rawData.split("\n");

  const firstLineContent = lines.shift();
  const firstLineParts = firstLineContent.split(" ");
  const numDigits = parseInt(firstLineParts[0], 10);
  const numConstraintsStr = firstLineParts[1];

  const constraintLines = lines;

  let resultDigitsArr = Array.from({ length: numDigits }, () => 'n');

  let isValidCombination = true;

  const parseConstraintLine = (lineString) => {
    return lineString.split(" ").map(val => parseInt(val, 10));
  };

  for (const currentConstraintLine of constraintLines) {
    const parsedConstraint = parseConstraintLine(currentConstraintLine);

    const targetIndex = parsedConstraint[0] - 1;
    const assignedValue = parsedConstraint[1];

    const existingDigitAtPosition = resultDigitsArr[targetIndex];

    if (existingDigitAtPosition !== 'n' && existingDigitAtPosition !== assignedValue) {
      isValidCombination = false;
    }
    resultDigitsArr[targetIndex] = assignedValue;
  }

  let resultDigitsString = resultDigitsArr.join("");

  let finalProcessedString = resultDigitsString;
  finalProcessedString = finalProcessedString.replace(/^nnn/, "100");
  finalProcessedString = finalProcessedString.replace(/^nn([0-9])/, "10$1");
  finalProcessedString = finalProcessedString.replace(/^n([0-9])/, "1$1");
  finalProcessedString = finalProcessedString.replace(/n/g, "0");

  const finalNumberValue = parseInt(finalProcessedString, 10);

  const finalNumberLength = String(finalNumberValue).length;
  const isLengthCorrect = finalNumberLength === numDigits;

  if (isValidCombination && isLengthCorrect) {
    console.log(finalNumberValue);
  } else {
    console.log(-1);
  }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
