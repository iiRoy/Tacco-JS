'use strict';

function processInput(rawInputString) {
  const firstLine = rawInputString.split('\n')[0];
  const stringNumbers = firstLine.split(' ');
  const parsedNumbers = stringNumbers.map(numStr => Number(numStr));

  const [firstVal, secondVal, thirdVal] = parsedNumbers;

  let outcomeMessage = '';

  const requiredDifference = thirdVal - secondVal;

  if (secondVal >= thirdVal) {
    outcomeMessage = 'delicious';
  } else {
    const canReachSafe = firstVal >= requiredDifference;
    if (canReachSafe) {
      outcomeMessage = 'safe';
    } else {
      outcomeMessage = 'dangerous';
    }
  }

  console.log(outcomeMessage);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
