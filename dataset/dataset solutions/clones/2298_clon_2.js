'use strict';

const performPrimeSearch = (dataSource) => {
  let initialNumber = parseInt(dataSource[0], 10);
  for (
    let currentCheckValue = initialNumber;
    currentCheckValue < (2 * initialNumber);
    currentCheckValue++
  ) {
    let hadFactor = 0;
    for (
      let factorCandidate = 2;
      factorCandidate < currentCheckValue - 1;
      factorCandidate++
    ) {
      if (currentCheckValue % factorCandidate === 0) {
        hadFactor = 1;
        break;
      }
    }
    if (!hadFactor) {
      return console.log(currentCheckValue);
    }
  }
};
performPrimeSearch(
  require("fs")
    .readFileSync("/dev/stdin", "utf8")
    .split('\n')
);