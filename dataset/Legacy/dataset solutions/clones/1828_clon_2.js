// This JavaScript module processes time-related input from standard input.
const rawData = require("fs").readFileSync("/dev/stdin", "utf8");

let tokenStream = rawData.split(/ |\n/);
let tokenIndex = 0;

// Retrieves the subsequent token from the parsed input array.
const getNextToken = () => tokenStream[tokenIndex++];

// Fetches a specified number of tokens and converts them to integers.
const getMultipleTokens = (count) => {
  return tokenStream.slice(tokenIndex, tokenIndex += count).map(item => parseInt(item));
};

// Extract the five numerical values representing start/end times and a duration.
const [startHour, startMinute, endHour, endMinute, breakDuration] = getMultipleTokens(5);

// Compute the net available duration in minutes.
// This involves converting both start and end times to total minutes from midnight,
// then subtracting the start time and any specified break.
const availableTime = (endHour * 60 + endMinute) - (startHour * 60 + startMinute) - breakDuration;

// Display the calculated available time. If the result is negative, output zero instead.
availableTime > 0 ? console.log(availableTime) : console.log(0);
