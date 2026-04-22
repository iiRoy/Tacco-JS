const rawDataInput = require('fs').readFileSync('/dev/stdin', 'utf8');
const numericalComponentsArray = rawDataInput.trim().split(' ').map(Number);

const primarySide = numericalComponentsArray[0];
const secondarySide = numericalComponentsArray[1];
const includedAngleInDegrees = numericalComponentsArray[2];

const PI_CONSTANT = Math.PI;
const DEG_TO_RAD_MULTIPLIER = PI_CONSTANT / 180.0;

const convertAngleToRadians = (degVal) => degVal * DEG_TO_RAD_MULTIPLIER;

const radianAngle = convertAngleToRadians(includedAngleInDegrees);

const areaOfFigure = 0.5 * primarySide * secondarySide * Math.sin(radianAngle);

const heightPerpendicularToPrimary = (2 * areaOfFigure) / primarySide;

const adjacentProjection = secondarySide * Math.cos(radianAngle);
const oppositeProjection = secondarySide * Math.sin(radianAngle);

const baseDifference = primarySide - adjacentProjection;
const unknownSideSquared = (baseDifference * baseDifference) + (oppositeProjection * oppositeProjection);
const unknownSideLength = Math.sqrt(unknownSideSquared);

const totalBoundary = primarySide + secondarySide + unknownSideLength;

process.stdout.write(areaOfFigure.toFixed(5) + '\n');
process.stdout.write(totalBoundary.toFixed(5) + '\n');
process.stdout.write(heightPerpendicularToPrimary.toFixed(5) + '\n');