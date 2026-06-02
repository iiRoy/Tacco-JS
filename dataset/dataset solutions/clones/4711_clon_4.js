'use strict';

const scoreAdjuster = (inputToken) => {
  const specialValueMap = { '1': 14 };
  return specialValueMap[inputToken] ?? Number(inputToken);
};

function processGame(inputLine) {
  const [firstPlayerRaw, secondPlayerRaw] = inputLine.split(' ');

  const firstPlayerScore = scoreAdjuster(firstPlayerRaw);
  const secondPlayerScore = scoreAdjuster(secondPlayerRaw);

  const gameResult = firstPlayerScore === secondPlayerScore
    ? 'Draw'
    : (firstPlayerScore > secondPlayerScore ? 'Alice' : 'Bob');

  console.log(gameResult);
}

processGame(require("fs").readFileSync("/dev/stdin", "utf8"));
