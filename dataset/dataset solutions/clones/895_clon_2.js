var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var processedString = rawData.trim();

for (var idx = 0; idx < processedString.length - 7; idx++) {
    var charSegment = [
        processedString[idx],
        processedString[idx + 1],
        processedString[idx + 2],
        processedString[idx + 3],
        processedString[idx + 4],
        processedString[idx + 5],
        processedString[idx + 6],
        processedString[idx + 7]
    ];

    if (charSegment.join("") === "AIZUNYAN") {
        idx += 7;
        continue;
    }

    var sortedSegment = charSegment.sort().join("");

    if (sortedSegment === "AADINNUY") {
        processedString = processedString.slice(0, idx) + "AIZUNYAN" + processedString.slice(idx + 8, processedString.length);
        idx += 7;
    }
}

console.log(processedString);
