const parseInputStringIntoNumbers = (rawInput) => {
  const stringSegments = rawInput.split(" ");
  const numericValues = stringSegments.map(segment => Number(segment));
  return numericValues;
};

function calculateAndDisplayResult(inputLine) {
  const numericParameters = parseInputStringIntoNumbers(inputLine);

  const primaryCount = numericParameters[0];
  const adjustedModifier = numericParameters[1] - 1;
  const discriminantValue = numericParameters[2];

  let dynamicMultiplier;
  if (discriminantValue !== 0) {
    dynamicMultiplier = 2;
  } else {
    dynamicMultiplier = 1;
  }

  const firstTerm = adjustedModifier;
  const secondTerm = primaryCount - discriminantValue;
  const numeratorProduct = firstTerm * secondTerm * dynamicMultiplier;

  const denominatorSquare = Math.pow(primaryCount, 2);

  const finalComputedValue = numeratorProduct / denominatorSquare;

  console.log(finalComputedValue);
}

const fileContents = require("fs").readFileSync("/dev/stdin", "utf8");
calculateAndDisplayResult(fileContents);
