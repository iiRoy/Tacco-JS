var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var processedString = (rawData.trim())
    .replace(/egg/g, "E")
    .replace(/chicken/g, "C");

while (/EE/.test(processedString)) {
    processedString = processedString.replace(/EE/g, "EAE");
}

while (/CC/.test(processedString)) {
    processedString = processedString.replace(/CC/g, "CAC");
}

var segmentList = processedString.split("A");

var longestSegment = "";

segmentList.forEach(function(currentSegment) {
    if (longestSegment.length < currentSegment.length) {
        longestSegment = currentSegment;
    }
});

console.log((longestSegment.slice(-1) === "E") ? "egg" : "chicken");
