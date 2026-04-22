"use strict";

const processInputData = (incomingText) => {
  const lineSeries = incomingText.split('\n');
  const recordCount = Number(lineSeries[0].split(' ')[1]);

  const assessmentRecords = lineSeries.slice(1, 1 + recordCount).reduce((collection, currentLine) => {
    const [questionKey, outcomeType] = currentLine.split(' ');
    if (!collection.has(questionKey)) {
      collection.set(questionKey, []);
    }
    collection.get(questionKey).push(outcomeType);
    return collection;
  }, new Map());

  const [totalCorrectSubmissions, totalIncorrectAttempts] = Array.from(assessmentRecords.values()).reduce(
    (accPair, sequenceOfOutcomes) => {
      let [currentCorrect, currentIncorrect] = accPair;
      const firstSuccessPosition = sequenceOfOutcomes.indexOf('AC');

      if (firstSuccessPosition !== -1) {
        currentCorrect++;
        currentIncorrect += sequenceOfOutcomes.slice(0, firstSuccessPosition).filter(statusValue => statusValue === 'WA').length;
      } else {
        currentIncorrect += sequenceOfOutcomes.filter(statusValue => statusValue === 'WA').length;
      }
      return [currentCorrect, currentIncorrect];
    },
    [0, 0]
  );

  console.log(`${totalCorrectSubmissions} ${totalIncorrectAttempts}`);
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));