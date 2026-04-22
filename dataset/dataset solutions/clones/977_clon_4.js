const filesystemAccess = require('fs');
const characterEncoding = 'ascii';

const sourceConfiguration = {
  dataStream: '/dev/stdin',
  lineDelimiter: '\n'
};

const allInputLines = filesystemAccess.readFileSync(sourceConfiguration.dataStream, characterEncoding)
  .split(sourceConfiguration.lineDelimiter);

const gridDimensions = allInputLines[0].split(' ').map(Number);
const gridHeight = gridDimensions[0];
const gridWidth = gridDimensions[1];

const gridData = allInputLines.slice(1, 1 + gridHeight).map(l => l.split('').map(Number));

const patternDimensions = allInputLines[1 + gridHeight].split(' ').map(Number);
const patternHeight = patternDimensions[0];
const patternWidth = patternDimensions[1];

const patternData = allInputLines.slice(1 + gridHeight + 1, 1 + gridHeight + 1 + patternHeight).map(l => l.split('').map(Number));

allInputLines.length = 0;

if (gridHeight < patternHeight || gridWidth < patternWidth) process.exit();

const FIRST_MODULUS = 1000000007;
const FIRST_BASE = 31;

const SECOND_MODULUS = 1000000009;
const SECOND_BASE = 37;

const maxPossibleDimension = Math.max(gridHeight, gridWidth, patternHeight, patternWidth);
const firstBasePowers = new Array(maxPossibleDimension + 1);
const secondBasePowers = new Array(maxPossibleDimension + 1);

firstBasePowers[0] = 1;
secondBasePowers[0] = 1;
for (let currentPowerIndex = 1; currentPowerIndex <= maxPossibleDimension; currentPowerIndex++) {
  firstBasePowers[currentPowerIndex] = (firstBasePowers[currentPowerIndex - 1] * FIRST_BASE) % FIRST_MODULUS;
  secondBasePowers[currentPowerIndex] = (secondBasePowers[currentPowerIndex - 1] * SECOND_BASE) % SECOND_MODULUS;
}

function deriveSubsegmentHashes(characterSequence, windowSpan, baseValue, modulusValue, windowPower) {
  const computedHashes = new Array(characterSequence.length - windowSpan + 1);
  let currentAccumulatedHash = 0;

  for (let charIndex = 0; charIndex < windowSpan; charIndex++) {
    currentAccumulatedHash = (currentAccumulatedHash * baseValue + characterSequence[charIndex]) % modulusValue;
  }
  computedHashes[0] = currentAccumulatedHash;

  for (let charIndex = 1; charIndex <= characterSequence.length - windowSpan; charIndex++) {
    const charToRemove = characterSequence[charIndex - 1];
    const charToAdd = characterSequence[charIndex + windowSpan - 1];

    currentAccumulatedHash = (currentAccumulatedHash - (charToRemove * windowPower) % modulusValue + modulusValue) % modulusValue;
    currentAccumulatedHash = (currentAccumulatedHash * baseValue + charToAdd) % modulusValue;
    computedHashes[charIndex] = currentAccumulatedHash;
  }
  return computedHashes;
}

const patternSegmentHashesA = new Array(patternHeight);
const patternSegmentHashesB = new Array(patternHeight);
for (let patRowIndex = 0; patRowIndex < patternHeight; patRowIndex++) {
  let currentSegmentHashA = 0;
  let currentSegmentHashB = 0;
  for (let patColIndex = 0; patColIndex < patternWidth; patColIndex++) {
    currentSegmentHashA = (currentSegmentHashA * FIRST_BASE + patternData[patRowIndex][patColIndex]) % FIRST_MODULUS;
    currentSegmentHashB = (currentSegmentHashB * SECOND_BASE + patternData[patRowIndex][patColIndex]) % SECOND_MODULUS;
  }
  patternSegmentHashesA[patRowIndex] = currentSegmentHashA;
  patternSegmentHashesB[patRowIndex] = currentSegmentHashB;
}

let fullPatternHashA = 0;
let fullPatternHashB = 0;
for (let patRowIndex = 0; patRowIndex < patternHeight; patRowIndex++) {
  fullPatternHashA = (fullPatternHashA * FIRST_BASE + patternSegmentHashesA[patRowIndex]) % FIRST_MODULUS;
  fullPatternHashB = (fullPatternHashB * SECOND_BASE + patternSegmentHashesB[patRowIndex]) % SECOND_MODULUS;
}

const gridRowWindowHashesA = new Array(gridHeight);
const gridRowWindowHashesB = new Array(gridHeight);

const colWindowPowerA = firstBasePowers[patternWidth - 1];
const colWindowPowerB = secondBasePowers[patternWidth - 1];

for (let gridRowIndex = 0; gridRowIndex < gridHeight; gridRowIndex++) {
  gridRowWindowHashesA[gridRowIndex] = deriveSubsegmentHashes(gridData[gridRowIndex], patternWidth, FIRST_BASE, FIRST_MODULUS, colWindowPowerA);
  gridRowWindowHashesB[gridRowIndex] = deriveSubsegmentHashes(gridData[gridRowIndex], patternWidth, SECOND_BASE, SECOND_MODULUS, colWindowPowerB);
}

const identifiedOccurrences = [];

const rowWindowPowerA = firstBasePowers[patternHeight - 1];
const rowWindowPowerB = secondBasePowers[patternHeight - 1];

for (let gridColIndex = 0; gridColIndex <= gridWidth - patternWidth; gridColIndex++) {
  let currentGridBlockHashA = 0;
  let currentGridBlockHashB = 0;

  for (let gridRowIndex = 0; gridRowIndex < patternHeight; gridRowIndex++) {
    currentGridBlockHashA = (currentGridBlockHashA * FIRST_BASE + gridRowWindowHashesA[gridRowIndex][gridColIndex]) % FIRST_MODULUS;
    currentGridBlockHashB = (currentGridBlockHashB * SECOND_BASE + gridRowWindowHashesB[gridRowIndex][gridColIndex]) % SECOND_MODULUS;
  }

  if (currentGridBlockHashA === fullPatternHashA && currentGridBlockHashB === fullPatternHashB) {
    let isMatchConfirmed = true;
    for (let subPatRow = 0; subPatRow < patternHeight; subPatRow++) {
      for (let subPatCol = 0; subPatCol < patternWidth; subPatCol++) {
        if (gridData[subPatRow][gridColIndex + subPatCol] !== patternData[subPatRow][subPatCol]) {
          isMatchConfirmed = false;
          break;
        }
      }
      if (!isMatchConfirmed) break;
    }
    if (isMatchConfirmed) {
      identifiedOccurrences.push([0, gridColIndex]);
    }
  }

  for (let gridRowIndex = 1; gridRowIndex <= gridHeight - patternHeight; gridRowIndex++) {
    const rowHashToRemoveA = gridRowWindowHashesA[gridRowIndex - 1][gridColIndex];
    const rowHashToRemoveB = gridRowWindowHashesB[gridRowIndex - 1][gridColIndex];
    const rowHashToAddA = gridRowWindowHashesA[gridRowIndex + patternHeight - 1][gridColIndex];
    const rowHashToAddB = gridRowWindowHashesB[gridRowIndex + patternHeight - 1][gridColIndex];

    currentGridBlockHashA = (currentGridBlockHashA - (rowHashToRemoveA * rowWindowPowerA) % FIRST_MODULUS + FIRST_MODULUS) % FIRST_MODULUS;
    currentGridBlockHashA = (currentGridBlockHashA * FIRST_BASE + rowHashToAddA) % FIRST_MODULUS;

    currentGridBlockHashB = (currentGridBlockHashB - (rowHashToRemoveB * rowWindowPowerB) % SECOND_MODULUS + SECOND_MODULUS) % SECOND_MODULUS;
    currentGridBlockHashB = (currentGridBlockHashB * SECOND_BASE + rowHashToAddB) % SECOND_MODULUS;

    if (currentGridBlockHashA === fullPatternHashA && currentGridBlockHashB === fullPatternHashB) {
      let isMatchConfirmed = true;
      for (let subPatRow = 0; subPatRow < patternHeight; subPatRow++) {
        for (let subPatCol = 0; subPatCol < patternWidth; subPatCol++) {
          if (gridData[gridRowIndex + subPatRow][gridColIndex + subPatCol] !== patternData[subPatRow][subPatCol]) {
            isMatchConfirmed = false;
            break;
          }
        }
        if (!isMatchConfirmed) break;
      }
      if (isMatchConfirmed) {
        identifiedOccurrences.push([gridRowIndex, gridColIndex]);
      }
    }
  }
}

for (const foundCoordinates of identifiedOccurrences) {
  console.log('%s %s', foundCoordinates[0], foundCoordinates[1]);
}