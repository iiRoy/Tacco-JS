'use strict'

function processInputData(rawData) {
  const inputLines = rawData.split('\n');
  const numBlueWords = parseInt(inputLines[0], 10);
  const blueWordList = inputLines.slice(1, 1 + numBlueWords);
  const redWordList = inputLines.slice(numBlueWords + 2, inputLines.length - 1);
  const wordTallies = [];

  const updateWordTally = (wordKey, incrementValue) => {
    let existingEntry = wordTallies.find(tallyItem => tallyItem.key === wordKey);
    if (existingEntry) {
      existingEntry.count += incrementValue;
    } else {
      wordTallies.push({ key: wordKey, count: incrementValue });
    }
  };

  blueWordList.forEach((currentBlueWord) => {
    updateWordTally(currentBlueWord, 1);
  });

  redWordList.forEach((currentRedWord) => {
    const matchingTally = wordTallies.find(tallyItem => tallyItem.key === currentRedWord);
    if (matchingTally) {
      matchingTally.count -= 1;
    }
  });

  wordTallies.sort((entryA, entryB) => entryB.count - entryA.count);

  const topCount = wordTallies[0].count;
  const finalResult = (topCount >= 0) ? topCount : 0;
  console.log(finalResult);
}

processInputData(require("node:fs").readFileSync("/dev/stdin", "utf8"));
