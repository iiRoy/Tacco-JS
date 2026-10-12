const processInput = (rawData) => {
  const parsedLines = rawData.trim().split('\n');
  const targetValue = parseInt(parsedLines[0]);

  const MIN_POSSIBLE_SUM = 0;
  const MAX_POSSIBLE_SUM = (4 * 25) + (7 * 14);

  if (targetValue < MIN_POSSIBLE_SUM || targetValue > MAX_POSSIBLE_SUM) {
    console.log('No');
    return;
  }

  const findMatchingCombination = (valueToMatch) => {
    for (let countFour = 0; countFour <= 25; countFour++) {
      for (let countSeven = 0; countSeven <= 14; countSeven++) {
        const currentCalculatedSum = (4 * countFour) + (7 * countSeven);
        if (currentCalculatedSum === valueToMatch) {
          return true;
        }
      }
    }
    return false;
  };

  const combinationExists = findMatchingCombination(targetValue);

  if (combinationExists) {
    console.log('Yes');
    return;
  } else {
    console.log('No');
  }
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
