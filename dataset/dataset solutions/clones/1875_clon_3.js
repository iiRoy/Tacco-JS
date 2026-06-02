function aggregateArrays(inputArrays = []) {
  const arrayCount = inputArrays.length;

  if (arrayCount === 0) {
    return false;
  }

  const summedArray = inputArrays[0].slice();

  for (let outerIdx = 1; outerIdx < arrayCount; outerIdx++) {
    const currentArray = inputArrays[outerIdx];
    for (let innerIdx = 0; innerIdx < summedArray.length; innerIdx++) {
      summedArray[innerIdx] += currentArray[innerIdx];
    }
  }
  return summedArray;
}

const verifySkillLevels = (skillLevels, requiredLevel) => {
  return skillLevels.every((skillValue) => skillValue >= requiredLevel);
};

const getSelectedBooksData = (subsetMask, allBookData, totalBooks) => {
  const selected = [];
  for (let bookIndex = 0; bookIndex < totalBooks; bookIndex++) {
    if ((subsetMask & (1 << bookIndex)) !== 0) {
      selected.push(allBookData[bookIndex]);
    }
  }
  return selected;
};

function processInput(rawDataContent) {
  const lines = rawDataContent.trim().split("\n");
  const [numBooksStr, numSkillsStr, targetSkillLevelStr] = lines[0].split(" ");

  const numBooks = parseInt(numBooksStr, 10);
  const numSkills = parseInt(numSkillsStr, 10);
  const targetSkillLevel = parseInt(targetSkillLevelStr, 10);

  const bookDataCollection = [];
  for (let i = 1; i <= numBooks; i++) {
    bookDataCollection.push(lines[i].split(" ").map((val) => parseInt(val, 10)));
  }

  let minCostFound = Number.MAX_SAFE_INTEGER;

  for (let subsetMask = 0; subsetMask < (1 << numBooks); subsetMask++) {
    const currentSelectedBooks = getSelectedBooksData(subsetMask, bookDataCollection, numBooks);

    const aggregatedResult = aggregateArrays(currentSelectedBooks);

    if (aggregatedResult) {
      const currentSubsetCost = aggregatedResult[0];
      const currentSkillTotals = aggregatedResult.slice(1, numBooks + 1);

      if (verifySkillLevels(currentSkillTotals, targetSkillLevel) && currentSubsetCost < minCostFound) {
        minCostFound = currentSubsetCost;
      }
    }
  }

  if (minCostFound === Number.MAX_SAFE_INTEGER) {
    console.log("-1");
  } else {
    console.log(minCostFound);
  }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
