const numeralValues = {
  'I': 1,
  'V': 5,
  'X': 10,
  'L': 50,
  'C': 100,
  'D': 500,
  'M': 1000
};

function convertRoman(romanInputString) {
  let finalSum = 0;
  let lastProcessedValue = 0;

  for (let charIndex = romanInputString.length - 1; charIndex >= 0; charIndex--) {
    const currentSymbol = romanInputString[charIndex];
    const currentSymbolValue = numeralValues[currentSymbol];

    if (currentSymbolValue < lastProcessedValue) {
      finalSum -= currentSymbolValue;
    } else {
      finalSum += currentSymbolValue;
    }
    lastProcessedValue = currentSymbolValue;
  }
  return finalSum;
}

require("fs").readFileSync("/dev/stdin", "utf8")
  .split('\n')
  .forEach(function(inputLineSegment) {
    if (inputLineSegment) {
      console.log(convertRoman(inputLineSegment));
    }
  });
