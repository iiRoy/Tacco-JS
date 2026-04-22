let firstResultCounter = 0, secondResultCounter = 0;

const fileSystemHandler = require("fs");

fileSystemHandler
    .readFileSync("/dev/stdin", "utf8")
    .trim()
    .split('\n')
    .map(function(currentInputLineItem) {
        const lineSegments = currentInputLineItem.split(',');
        let valAlpha = lineSegments[0], valBeta = lineSegments[1], valGamma = lineSegments[2];

        (valGamma * valGamma - valBeta * valBeta - valAlpha * valAlpha)
            ? (valBeta - valAlpha ? 0 : secondResultCounter++)
            : firstResultCounter++;
    });

console.log(firstResultCounter + '\n' + secondResultCounter);