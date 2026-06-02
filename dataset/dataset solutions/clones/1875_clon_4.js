const aggregateBookData = (bookDataList = []) => {
  if (bookDataList.length === 0) return false;

  const accumulatedData = [...bookDataList[0]];

  return bookDataList.slice(1).reduce((acc, currentBook) => {
    return acc.map((val, index) => val + currentBook[index]);
  }, accumulatedData);
};

const verifySkillLevels = (skillValues, threshold) => {
  for (const skill of skillValues) {
    if (skill < threshold) {
      return false;
    }
  }
  return true;
};

const processBookData = (rawInput) => {
  const inputLines = rawInput.trim().split("\n");
  const configParams = inputLines[0].split(" ");

  const bookCount = parseInt(configParams[0], 10);
  const skillCount = parseInt(configParams[1], 10);
  const minSkillThreshold = parseInt(configParams[2], 10);

  const initialBookRecords = [];
  for (let idx = 1; idx <= bookCount; idx++) {
    initialBookRecords.push(inputLines[idx].split(" ").map(Number));
  }

  const allSubsetCosts = Array.from({ length: 1 << bookCount }, (_, subsetIndex) => {
    const selectedBookRecords = [];

    for (let idx = 0; idx < bookCount; idx++) {
      if ((subsetIndex & (1 << idx))) {
        selectedBookRecords.push(initialBookRecords[idx]);
      }
    }

    const aggregatedData = aggregateBookData(selectedBookRecords);

    if (aggregatedData) {
      const currentCost = aggregatedData[0];
      const evaluatedSkills = aggregatedData.slice(1, bookCount + 1);

      if (verifySkillLevels(evaluatedSkills, minSkillThreshold)) {
        return currentCost;
      }
    }
    return Infinity;
  });

  const minimumAchievableCost = Math.min(...allSubsetCosts);

  if (minimumAchievableCost === Infinity) {
    console.log("-1");
  } else {
    console.log(minimumAchievableCost);
  }
};

processBookData(require("fs").readFileSync("/dev/stdin", "utf8"));
