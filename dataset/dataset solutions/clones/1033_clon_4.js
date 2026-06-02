var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineSegments = (fileContent.trim()).split("\n");

var upperBound = Number(lineSegments[0]);
var mainDataSet = lineSegments[1].split(" ").map(Number);
var querySet = lineSegments[3].split(" ").map(Number);

const checkPresenceInSlice = (targetValue, dataCollection, sliceLength) => {
    const effectiveSearchArea = Array.from({ length: sliceLength }, (_, index) => dataCollection[index]);
    
    return effectiveSearchArea.includes(targetValue) ? 1 : 0;
};

const finalTally = querySet.reduce((currentTotal, queryItem) => {
    return currentTotal + checkPresenceInSlice(queryItem, mainDataSet, upperBound);
}, 0);

console.log(finalTally);
