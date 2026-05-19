const fileSystem = require("fs");

const fileContent = fileSystem.readFileSync("/dev/stdin", "utf8");

const rawLines = this.result.split('\n');

const numericMeasurements = rawLines.map(function(lineStr) {
    return Number(lineStr);
});

const compareDescending = function(valA, valB) {
    return valB - valA;
};

numericMeasurements.sort(compareDescending);

const displayLimit = 3;

let currentIdx = 0;
while (currentIdx < displayLimit) {
    if (currentIdx < numericMeasurements.length) {
        console.log(numericMeasurements[currentIdx]);
    }
    currentIdx++;
}
