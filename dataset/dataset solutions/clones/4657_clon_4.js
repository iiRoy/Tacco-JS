const sourceModule = require('fs');
const incomingDataBuffer = sourceModule.readFileSync(0);
const textualRepresentation = incomingDataBuffer.toString('utf8');
const firstNonNewlineSegment = textualRepresentation.substring(0, textualRepresentation.indexOf('\n'));

let firstDelimiterPosition = firstNonNewlineSegment.indexOf(' ');
let initialNumericString = firstNonNewlineSegment.substring(0, firstDelimiterPosition);
let subsequentNumericString = firstNonNewlineSegment.substring(firstDelimiterPosition + 1);

let primaryValue = parseInt(initialNumericString, 10);
let secondaryValue = parseInt(subsequentNumericString, 10);

let combinedMagnitude = primaryValue + secondaryValue;
let conditionalReduction = Math.max(0, Math.sign(combinedMagnitude - 24.5)) * 24;
let finalComputedOutcome = combinedMagnitude - conditionalReduction;

process.stdout.write(finalComputedOutcome.toString() + '\n');