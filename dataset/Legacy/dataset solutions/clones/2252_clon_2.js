"use strict";

function ProcessInput(rawData) {
  let inputLines = rawData.split("\n");
  let queryCount = inputLines.shift().split(" ")[1];

  // A structure to hold results for each question
  let resultMap = {};

  for (let idx = 0; idx < queryCount; idx++) {
    let questionIdentifier = inputLines[idx].split(" ")[0];
    let answerType = inputLines[idx].split(" ")[1];

    if (resultMap[questionIdentifier] === undefined) {
      resultMap[questionIdentifier] = `${answerType}`;
    } else {
      resultMap[questionIdentifier] += `,${answerType}`;
    }
  }

  let wrongAnswerCount = 0;
  let correctAnswerCount = 0;

  // Iterate through the collected question results
  let mapKeys = Object.keys(resultMap);

  for (let keyIndex = 0; keyIndex < mapKeys.length; keyIndex++) {
    let currentKey = mapKeys[keyIndex];
    // Split the combined answer types into an array of individual attempts
    let answerAttempts = resultMap[currentKey].split(",");

    for (let attemptIndex = 0; attemptIndex < answerAttempts.length; attemptIndex++) {
      if (answerAttempts[attemptIndex] === 'AC') {
        correctAnswerCount++;
        break; // Stop checking attempts for this question once 'AC' is found
      } else {
        wrongAnswerCount++;
      }
    }
  }

  console.log(correctAnswerCount + " " + wrongAnswerCount);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
