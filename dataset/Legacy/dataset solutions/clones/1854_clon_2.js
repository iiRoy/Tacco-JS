const rawData = require("fs").readFileSync("/dev/stdin", "utf8");

let tokenStream = rawData.split(/ |\n/),
    tokenIndex = 0;

const getNextToken = () => tokenStream[tokenIndex++];

const getParsedTokens = (count) =>
    tokenStream.slice(tokenIndex, (tokenIndex += count)).map((itemStr) => parseInt(itemStr));

const [sideA, sideB, hourVal, minuteVal] = getParsedTokens(4);

const minuteHandAngle = minuteVal * 6;

const hourHandAngle = (hourVal + minuteVal / 60) * 30;

let diffAngle = Math.abs(minuteHandAngle - hourHandAngle);

// The following lines were commented out in the original source,
// likely used for debugging intermediate angle calculations.
// console.log(minuteHandAngle, hourHandAngle, diffAngle);
// console.log(minuteHandAngle, hourHandAngle, diffAngle);

const finalDistance = Math.sqrt(
    sideA ** 2 +
        sideB ** 2 -
        2 * sideA * sideB * Math.cos(diffAngle * (Math.PI / 180))
);

console.log(finalDistance);
