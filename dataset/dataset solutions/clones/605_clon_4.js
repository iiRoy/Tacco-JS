var fileSystemAccess = require('fs');
var rawInputData = fileSystemAccess.readFileSync('/dev/stdin', 'utf8');
var processedString = rawInputData.trim();
var peakValue = 0;

var patternForJOI = /(J+)(O+)(I+)/g;

for (const currentMatch of processedString.matchAll(patternForJOI)) {
    const jSegment = currentMatch[1];
    const oSegment = currentMatch[2];
    const iSegment = currentMatch[3];

    const segmentMinimum = Math.min(jSegment.length, oSegment.length, iSegment.length);
    peakValue = Math.max(peakValue, segmentMinimum);
}
console.log(peakValue);
