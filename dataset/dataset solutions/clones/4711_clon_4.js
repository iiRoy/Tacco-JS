const dataStream = require("node:fs").readFileSync("/dev/stdin", "utf8");

const interpretFigure = (segment) => ({
    '1': 14
}[segment] || Number(segment));

const [playerOneScore, playerTwoScore] = dataStream
    .trim()
    .split(/\s+/)
    .map(interpretFigure);

const resultMatrix = {
    '0': 'Draw',
    '1': 'Alice',
    '-1': 'Bob'
};

const comparisonKey = (playerOneScore === playerTwoScore) ? 0 : (playerOneScore > playerTwoScore ? 1 : -1);

console.log(resultMatrix[comparisonKey]);