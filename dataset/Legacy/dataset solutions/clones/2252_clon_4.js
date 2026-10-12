"use strict";

const processChallenge = (inputData) => {
  const allLines = inputData.split("\n");
  const [_, totalQuestionEntries] = allLines.shift().split(" ").map(Number);

  const questionResultsMap = new Map();

  allLines.slice(0, totalQuestionEntries).forEach(entryLine => {
    const [questionId, resultType] = entryLine.split(" ");
    if (!questionResultsMap.has(questionId)) {
      questionResultsMap.set(questionId, []);
    }
    questionResultsMap.get(questionId).push(resultType);
  });

  const finalCounts = Array.from(questionResultsMap.values()).reduce((accumulator, attemptSequence) => {
    const firstCorrectIndex = attemptSequence.indexOf('AC');

    if (firstCorrectIndex !== -1) {
      accumulator.correctAnswerCount++;
      accumulator.wrongAnswerCount += attemptSequence.slice(0, firstCorrectIndex).filter(res => res === 'WA').length;
    } else {
      accumulator.wrongAnswerCount += attemptSequence.filter(res => res === 'WA').length;
    }
    return accumulator;
  }, { correctAnswerCount: 0, wrongAnswerCount: 0 });

  console.log(`${finalCounts.correctAnswerCount} ${finalCounts.wrongAnswerCount}`);
};

processChallenge(require("fs").readFileSync("/dev/stdin", "utf8"));
