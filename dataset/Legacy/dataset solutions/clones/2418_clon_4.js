"use strict";

function createNumberRange(startValue, endValue) {
  const range = [];
  for (let current = startValue; current <= endValue; current++) {
    range.push(current);
  }
  return range;
}

const inputReader = require("readline").createInterface(process.stdin, process.stdout);

const obtainInput = () => new Promise(resolve => {
  inputReader.once("line", resolve);
});

async function processGame() {
  const initialNString = await obtainInput();
  const initialN = Number(initialNString);

  let initialSequence = createNumberRange(1, initialN);
  
  console.log("?", initialSequence.join(" "));
  const firstResponse = await obtainInput();
  const firstCharResponse = firstResponse.charAt(0);

  async function findBreakingPointRecursive(currentBreakingPoint, currentArrayState, referenceChar, nValue) {
    const nextArrayForQuery = [...currentArrayState];
    nextArrayForQuery[currentBreakingPoint - 1] = currentBreakingPoint + nValue;
    
    console.log("?", nextArrayForQuery.join(" "));
    const queryResult = await obtainInput();
    const queryChar = queryResult.charAt(0);

    if (queryChar !== referenceChar) {
      return { breakingPoint: currentBreakingPoint, finalArrayState: nextArrayForQuery };
    } else {
      return findBreakingPointRecursive(currentBreakingPoint + 1, nextArrayForQuery, referenceChar, nValue);
    }
  }

  const { breakingPoint: finalXValue, finalArrayState: basePArray } = await findBreakingPointRecursive(1, initialSequence, firstCharResponse, initialN);

  const resultCollection = new Array(2 * initialN);
  const baseQArray = [];
  const exclusionTracker = new Set();

  Array.from({ length: initialN - 1 }, (_, index) => {
    const pElementValue = finalXValue + index;
    basePArray[index] = pElementValue;
    baseQArray[index] = (pElementValue + initialN) % (2 * initialN);
    exclusionTracker.add(pElementValue);
  });

  for (let k = 1; k <= 2 * initialN; k++) {
    let queryArr;
    if (exclusionTracker.has(k)) {
      queryArr = [...baseQArray];
      queryArr[initialN - 1] = k;
    } else {
      queryArr = [...basePArray];
      queryArr[initialN - 1] = k;
    }
    
    console.log("?", queryArr.join(" "));
    const queryResponse = await obtainInput();
    resultCollection[k - 1] = (queryResponse.charAt(0) === "R") ? "R" : "B";
  }

  console.log("!", resultCollection.join(""));
  inputReader.close();
}

processGame();
