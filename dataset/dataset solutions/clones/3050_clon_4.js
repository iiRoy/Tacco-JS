let processInputData = (rawText) => {
  let textSegments = rawText.split('\n');
  let numericalSeries = textSegments[1].split(' ').map(Number);

  let finalAccumulation = numericalSeries.reduce((currentStats, individualValue) => {
    let currentTally = currentStats[0];
    let topValueAchieved = currentStats[1];

    return (individualValue >= topValueAchieved)
      ? [currentTally + 1, individualValue]
      : [currentTally, topValueAchieved];
  }, [0, 0]);

  return finalAccumulation[0];
};

console.log(processInputData(require("fs").readFileSync("/dev/stdin","utf-8")));