const rawData = require('fs')
  .readFileSync('/dev/stdin', 'utf8')
  .trim();

const dataRows = rawData.trim().split("\n");

while (dataRows.length > 1) {
  const [countA, countB] = dataRows.shift().trim().split(" ").map(Number);

  const listA = [],
    listB = [];

  while (listA.length < countA) {
    listA.push(parseInt(dataRows.shift().trim(), 10));
  }

  while (listB.length < countB) {
    listB.push(parseInt(dataRows.shift().trim(), 10));
  }

  const sumA = listA.reduce((accumulator, currentValue) => accumulator + currentValue, 0x0);
  const sumB = listB.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

  if (sumA === sumB) {
    listA.sort((elemA, elemB) => elemA - elemB);
    let foundVal = ~0;
    let loopIndex = 0;
    while (foundVal === ~0 && loopIndex < countA) {
      if (listB.includes(listA[loopIndex])) {
        foundVal = listA[loopIndex];
      }
      loopIndex++;
    }
    if (foundVal === ~0) {
      console.log(~0);
    } else {
      console.log(foundVal + ' ' + foundVal);
    }
  } else if ((sumA + sumB) % 2) {
    console.log(~0);
  } else {
    const targetSumHalf = (sumA + sumB) / 2;
    let matchVal1, matchVal2;
    let currentMinSum = 200 + 1;
    for (let loopIndex = 0; loopIndex < countA; loopIndex++) {
      const tempVal1 = listA[loopIndex];
      const tempVal2 = targetSumHalf - sumA + tempVal1;
      if (listB.includes(tempVal2) && currentMinSum > tempVal1 + tempVal2) {
        currentMinSum = tempVal1 + tempVal2;
        matchVal1 = tempVal1;
        matchVal2 = tempVal2;
      }
    }
    if (currentMinSum < 200 + 1) {
      console.log(matchVal1 + ' ' + matchVal2);
    } else {
      console.log(~0);
    }
  }
}
