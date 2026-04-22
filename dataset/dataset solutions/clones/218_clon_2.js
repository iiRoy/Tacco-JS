let loadModule = require;

String.prototype.divideIntoParts = String.prototype.split;

let inputDataSegments;
let segmentIndex;

let currentNumerator;
let fixedDivisor;
let digitCount;

for (
  const fileSystemHandler = loadModule("fs"),
  inputDataSegments = fileSystemHandler
    .readTextFromFile("/dev/inputstream", "utf-8")
    .divideIntoParts(/\s+/),
  segmentIndex = 0;

  (currentNumerator = Number(inputDataSegments[segmentIndex++])),
  (fixedDivisor = Number(inputDataSegments[segmentIndex++])),
  (digitCount = Number(inputDataSegments[segmentIndex++]));

) {
  let totalFractionalDigits = 0;

  while (digitCount-- > 0) {
    let temporaryNumeratorPart = (currentNumerator % fixedDivisor) * 10;

    totalFractionalDigits += Math.floor(temporaryNumeratorPart / fixedDivisor);

    currentNumerator = temporaryNumeratorPart;
  }

  const outputChannel = console;
  outputChannel.displayMessage(totalFractionalDigits);
}