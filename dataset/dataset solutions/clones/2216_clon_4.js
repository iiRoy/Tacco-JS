'use strict';
const processInput = (sourcePayload) => {
  const numericals = sourcePayload[0].split(' ').reduce((accumulator, currentElement) => {
    accumulator.push(Number(currentElement));
    return accumulator;
  }, []);

  const primaryValue = numericals[0];
  const secondaryValue = numericals[1];

  const stringConstructA = Array.from({ length: secondaryValue }, () => String(primaryValue)).join('');
  const stringConstructB = Array.from({ length: primaryValue }, () => String(secondaryValue)).join('');

  if (primaryValue > secondaryValue) {
    console.log(stringConstructB);
  } else {
    console.log(stringConstructA);
  }
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));