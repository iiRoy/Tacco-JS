function checkPrimality (candidateNum) {
  if (candidateNum === 2)
  {
    return true;
  }
  else
  {
    for (let factor = 2; factor < candidateNum; factor++)
    {
      if (candidateNum % factor === 0)
      {
        return false;
        break;
      }
      if (factor + 1 === candidateNum)
      {
        return true;
      }
    }
  }
}

let nodeIO = require('fs');
let rawInputLines = nodeIO.readFileSync('/std/in', 'utf8').split("\n");
let numericStringElements = rawInputLines[1].split(" ");

let primeNumbersFound = [];

numericStringElements.forEach((itemVal) => {
  let parsedNumber = Number(itemVal);
  if (checkPrimality(parsedNumber)) {
    primeNumbersFound.push(parsedNumber);
  }
});

let greatestRemainderSum = 0;

for (let mainLoopIndex = 1; ; mainLoopIndex++) {
  let currentRemainderSum = 0;
  primeNumbersFound.forEach((divisorElement) => {
    currentRemainderSum += mainLoopIndex % divisorElement;
  });

  if (currentRemainderSum === 0) {
    break;
  }

  if (greatestRemainderSum < currentRemainderSum) {
    greatestRemainderSum = currentRemainderSum;
  }
}
console.log(greatestRemainderSum);