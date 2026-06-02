var inputLines = [];
var lineReader = require('readline');

var interfaceInstance = lineReader.createInterface({
    input: process.stdin,
    output: process.stdout,
});

interfaceInstance.on('line', function (currentLine) {
    inputLines.push(currentLine);
});

interfaceInstance.on('close', function () {
    var positiveTermCount = Number(inputLines[0]);
    var negativeTermCount = Number(inputLines[positiveTermCount + 1]);

    var positiveTally = new Map();
    var negativeTally = new Map();

    inputLines.slice(1, positiveTermCount + 1).forEach(term => {
        positiveTally.set(term, (positiveTally.get(term) || 0) + 1);
    });

    inputLines.slice(positiveTermCount + 2, positiveTermCount + 2 + negativeTermCount).forEach(term => {
        negativeTally.set(term, (negativeTally.get(term) || 0) + 1);
    });

    var netScores = new Map();

    positiveTally.forEach((count, term) => {
        netScores.set(term, count);
    });

    negativeTally.forEach((count, term) => {
        netScores.set(term, (netScores.get(term) || 0) - count);
    });

    console.log(Math.max(0, ...Array.from(netScores.values())));
});
