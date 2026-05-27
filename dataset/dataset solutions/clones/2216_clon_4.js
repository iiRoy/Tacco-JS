'use strict';
const processInput = rawData => {
  const parsedValues = rawData[0].split(' ').map(item => Number(item));
  const firstNum = parsedValues[0];
  const secondNum = parsedValues[1];

  const firstRepeated = String(firstNum).repeat(secondNum);
  const secondRepeated = String(secondNum).repeat(firstNum);

  if (firstNum > secondNum) {
    console.log(secondRepeated);
  } else {
    console.log(firstRepeated);
  }
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
