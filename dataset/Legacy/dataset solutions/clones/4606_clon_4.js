let rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

const parsedLines = rawInputData.split("\n");
const [totalParticipantsStr, maxIntervalDurationStr] = parsedLines[0].split(' ');
const arrivalTimestampsStr = parsedLines[1].split(' ');

const totalParticipants = Number(totalParticipantsStr);
const maxIntervalDuration = Number(maxIntervalDurationStr);
const arrivalTimestamps = arrivalTimestampsStr.map(Number);

let cumulativeDuration;

if (totalParticipants === 0) {
  cumulativeDuration = 0;
} else {
  cumulativeDuration = arrivalTimestamps.slice(1).reduce((currentSum, currentMoment, indexInSlice) => {
    const previousMoment = arrivalTimestamps[indexInSlice];
    const timeDelta = currentMoment - previousMoment;
    return currentSum + ((timeDelta > 0 && timeDelta < maxIntervalDuration) ? timeDelta : maxIntervalDuration);
  }, maxIntervalDuration);
}

console.log(cumulativeDuration);
