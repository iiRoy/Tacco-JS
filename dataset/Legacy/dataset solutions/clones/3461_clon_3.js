console.log(calculateValue(require("fs").readFileSync("/dev/stdin","utf8")));

function calculateValue(rawData){
  let lines = rawData.split("\n");
  let parsedNumbers = lines.map(val => Number(val));

  const itemCount = parsedNumbers[0];
  const initialNumbers = parsedNumbers.slice(1, itemCount + 1);
  let sortedNumbers = initialNumbers.sort((a, b) => a - b);

  let finalResult = 0;
  const middleIndex = Math.floor((itemCount + 1) / 2);
  const multiplier = 2;
  let currentLoopIndex = 0;

  while (currentLoopIndex < middleIndex) {
    finalResult -= sortedNumbers[currentLoopIndex] * multiplier;
    currentLoopIndex++;
  }

  for (; currentLoopIndex < itemCount; currentLoopIndex++) {
    finalResult += sortedNumbers[currentLoopIndex] * multiplier;
  }

  const isEvenCount = (itemCount % 2 === 0);
  if (isEvenCount) {
    const valM = sortedNumbers[middleIndex];
    const valMMinus1 = sortedNumbers[middleIndex - 1];
    return finalResult - valM + valMMinus1;
  }

  const valMidMinus1 = sortedNumbers[middleIndex - 1];
  const valMidMinus2 = sortedNumbers[middleIndex - 2];
  const valMid = sortedNumbers[middleIndex];

  const sumOfTwo = valMidMinus1 + valMidMinus2;
  const complexExpr = (valMidMinus1 * 3) - valMid;

  if (sumOfTwo > complexExpr) {
    return finalResult + sumOfTwo;
  } else {
    return finalResult + complexExpr;
  }
}
