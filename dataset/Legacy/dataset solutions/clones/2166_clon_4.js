'use strict';

function executeGameLogic(rawData) {
  const processedLines = rawData.trim().split('\n');

  const [firstIdentifier, secondIdentifier] = processedLines[0].split(' ');

  const currentScores = processedLines[1].split(' ').reduce((accumulator, stringValue) => {
    accumulator.push(Number(stringValue));
    return accumulator;
  }, []);

  const activeIdentifier = processedLines[2];

  const scoreModificationDispatch = {
    [firstIdentifier]: (scoresArray) => { scoresArray[0]--; },
    [secondIdentifier]: (scoresArray) => { scoresArray[1]--; }
  };

  scoreModificationDispatch[activeIdentifier](currentScores);

  console.log(`${currentScores[0]} ${currentScores[1]}`);
}

executeGameLogic(require("fs").readFileSync("/dev/stdin", "utf8"));
