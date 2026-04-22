const parseSegments = (inputSegment, collectedLetters = '', segmentCount = 0) => {
  if (segmentCount === 3 || inputSegment.length === 0) {
    return collectedLetters;
  }

  let segmentStart = 0;
  while (segmentStart < inputSegment.length && inputSegment.charCodeAt(segmentStart) === 32) {
    segmentStart++;
  }

  if (segmentStart === inputSegment.length) {
    return collectedLetters;
  }

  const initialCharValue = inputSegment.charCodeAt(segmentStart);
  let normalizedChar;
  if (initialCharValue >= 97 && initialCharValue <= 122) {
    normalizedChar = String.fromCharCode(initialCharValue - 32);
  } else {
    normalizedChar = String.fromCharCode(initialCharValue);
  }

  let segmentEnd = segmentStart + 1;
  while (segmentEnd < inputSegment.length && inputSegment.charCodeAt(segmentEnd) !== 32) {
    segmentEnd++;
  }

  return parseSegments(
    inputSegment.substring(segmentEnd),
    collectedLetters + normalizedChar,
    segmentCount + 1
  );
};

const initiateProcessing = (rawInput) => {
  let adjustedInput = '';
  let leadingIndex = -1;
  let trailingIndex = -1;

  for (let iter = 0; iter < rawInput.length; iter++) {
    if (rawInput.charCodeAt(iter) !== 32) {
      if (leadingIndex === -1) {
        leadingIndex = iter;
      }
      trailingIndex = iter;
    }
  }

  if (leadingIndex !== -1) {
    adjustedInput = rawInput.substring(leadingIndex, trailingIndex + 1);
  }

  console.log(parseSegments(adjustedInput));
};

initiateProcessing(require("fs").readFileSync("/dev/stdin", "utf8"));