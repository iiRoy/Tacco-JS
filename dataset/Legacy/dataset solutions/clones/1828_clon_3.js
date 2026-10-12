const fileSystem = require("fs");
const rawInputData = fileSystem.readFileSync("/dev/stdin", "utf8");

let tokenBuffer = rawInputData.split(/ |\n/);
let currentTokenIndex = 0;

const retrieveNextToken = () => {
    return tokenBuffer[currentTokenIndex++];
};

const parseNextNTokens = (count) => {
    const tokensToParse = tokenBuffer.slice(currentTokenIndex, currentTokenIndex + count);
    currentTokenIndex += count;
    return tokensToParse.map(value => parseInt(value, 10));
};

const MINUTES_IN_HOUR = 60;

const [startHour, startMinute, endHour, endMinute, deductionMinutes] = parseNextNTokens(5);

const initialTimeInMinutes = (startHour * MINUTES_IN_HOUR) + startMinute;

const finalTimeInMinutes = (endHour * MINUTES_IN_HOUR) + endMinute;

const grossDurationInMinutes = finalTimeInMinutes - initialTimeInMinutes;

const netDurationInMinutes = grossDurationInMinutes - deductionMinutes;

const finalOutputValue = Math.max(0, netDurationInMinutes);
console.log(finalOutputValue);
