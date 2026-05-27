'use strict';

function Main(input) {
  const numericValues = input.trim().split(/\s+/).map(Number);
  numericValues.shift();

  const valueTuples = [];
  for (let i = 0; i < numericValues.length; i += 2) {
    valueTuples.push({ primaryValue: numericValues[i], secondaryValue: numericValues[i + 1] });
  }

  const processedItems = valueTuples.reverse();

  let highestPrimary;
  let correspondingSecondary;

  if (processedItems.length === 0) {
    highestPrimary = -Infinity;
    correspondingSecondary = undefined;
  } else {
    const optimalPair = processedItems.reduce((currentBest, currentItem) => {
      if (currentItem.primaryValue > currentBest.primaryValue) {
        return currentItem;
      }
      return currentBest;
    }, processedItems[0]);

    highestPrimary = optimalPair.primaryValue;
    correspondingSecondary = optimalPair.secondaryValue;
  }

  console.log(highestPrimary + correspondingSecondary);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
