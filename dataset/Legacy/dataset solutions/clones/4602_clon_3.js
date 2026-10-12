const processInput = rawData => {
  const MAX_SEARCH_VALUE = 10000;

  const parseSpaceSeparatedIntegers = (inputString) => {
    return inputString.split(' ').map(strNum => parseInt(strNum, 10));
  };

  const parsedLines = rawData.trim().split('\n');
  const [valA, valB, valC] = parseSpaceSeparatedIntegers(parsedLines[0]);

  const findMatchingMultiple = (startValue, divisorValue, remainderValue, searchLimit) => {
    for (let currentMultiple = startValue; currentMultiple <= searchLimit; currentMultiple += startValue) {
      if (currentMultiple % divisorValue === remainderValue) {
        return true;
      }
    }
    return false;
  };

  const conditionMet = findMatchingMultiple(valA, valB, valC, MAX_SEARCH_VALUE);

  if (conditionMet) {
    console.log('YES');
  } else {
    console.log('NO');
  }
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
