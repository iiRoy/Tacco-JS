const performTransformation = (sourceData) => {
  const lineSegment = sourceData.split('\n')[0];
  const numericalStrings = lineSegment.trim().split(' ');

  const initialNumbers = numericalStrings.map(val => +val);

  const firstValue = initialNumbers[0];
  const secondValue = initialNumbers[1];
  const thirdValue = initialNumbers[2];

  const greatest = Math.max(firstValue, secondValue, thirdValue);
  const least = Math.min(firstValue, secondValue, thirdValue);
  const intermediate = firstValue + secondValue + thirdValue - greatest - least;

  let outcomeCount;

  if (Math.abs(intermediate - least) % 2 === 0) {
    outcomeCount = (greatest - intermediate) + (intermediate - least) / 2;
  } else {
    outcomeCount = 1 + (greatest - intermediate) + (intermediate + 1 - least) / 2;
  }

  console.log(outcomeCount);
};

performTransformation(require("fs").readFileSync("/dev/stdin", "utf8"));