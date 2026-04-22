const contentSource = require("fs").readFileSync("/dev/stdin", "utf8").trim();

const firstSeparatorIndex = contentSource.indexOf(" ");
const initialSegment = contentSource.substring(0, firstSeparatorIndex);
const remainingPortion = contentSource.substring(firstSeparatorIndex + 1);
const secondSeparatorIndex = remainingPortion.indexOf(" ");
const middleSegment = remainingPortion.substring(0, secondSeparatorIndex);
const finalSegment = remainingPortion.substring(secondSeparatorIndex + 1);

const firstValue = +initialSegment;
const secondValue = +middleSegment;
const thirdValue = +finalSegment;

const calculatedResult = secondValue + thirdValue - firstValue;
const adjustedResult = (calculatedResult > 0) * calculatedResult;

const lesserOfTwo = (secondValue < thirdValue) * secondValue + (thirdValue <= secondValue) * thirdValue;

process.stdout.write(lesserOfTwo + ' ' + adjustedResult);