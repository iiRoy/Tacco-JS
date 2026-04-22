"use strict";

const performCalculation = (sourceData) => {
  const parsedLines = sourceData.map(line => line.trim().split(" ").map(Number));

  const initialParams = parsedLines[0];
  const desiredX = initialParams[0];
  const desiredY = initialParams[1];

  const firstList = parsedLines[1];
  const secondList = parsedLines[2];
  const thirdList = parsedLines[3];

  const getLargestN = (arr, n) => arr.slice().sort((v1, v2) => v2 - v1).slice(0, n);

  const topFromFirst = getLargestN(firstList, desiredX);
  const topFromSecond = getLargestN(secondList, desiredY);
  const topFromThird = getLargestN(thirdList, desiredX + desiredY);

  const allPotentialItems = [...topFromFirst, ...topFromSecond, ...topFromThird];

  const finalSelection = allPotentialItems
    .sort((itemA, itemB) => itemB - itemA)
    .slice(0, desiredX + desiredY);

  const resultantSum = finalSelection.reduce((accumulator, currentItem) => accumulator + currentItem, 0);

  console.log(resultantSum);
};

performCalculation(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));