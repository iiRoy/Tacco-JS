const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const rawDataLines = fileContent.split('\n');

const parseSpaceSeparatedNumbers = (lineString) => {
    return lineString.split(' ').map(Number);
};

const parseAndAdjustIndices = (lineString) => {
    return lineString.split(' ').map(strVal => Number(strVal) - 1);
};

const firstLineValues = parseSpaceSeparatedNumbers(rawDataLines[0]);
const numLocations = firstLineValues[0];
const numPaths = firstLineValues[1];

const locationHeights = parseSpaceSeparatedNumbers(rawDataLines[1]);

const potentialPeaks = Array.from({ length: numLocations }, () => true);

for (let pathIdx = 0; pathIdx < numPaths; pathIdx++) {
  const currentPathLine = rawDataLines[pathIdx + 2];
  const [firstLocIdx, secondLocIdx] = parseAndAdjustIndices(currentPathLine);

  const heightA = locationHeights[firstLocIdx];
  const heightB = locationHeights[secondLocIdx];

  if (heightA < heightB) {
    potentialPeaks[firstLocIdx] = false;
  } else if (heightB < heightA) {
    potentialPeaks[secondLocIdx] = false;
  } else {
    potentialPeaks[firstLocIdx] = false;
    potentialPeaks[secondLocIdx] = false;
  }
}

let peakCount = 0;
const totalLocations = potentialPeaks.length;
for (let k = 0; k < totalLocations; k++) {
    if (potentialPeaks[k] === true) {
        peakCount++;
    }
}
console.log(peakCount);
