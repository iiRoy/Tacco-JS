const Processor = (inputString) => {
  let digitAccumulator = 0;
  let pointerValues = [];
  let charPosition = 0;

  while (inputString[charPosition] !== '\n' && charPosition < inputString.length) {
    charPosition++;
  }
  charPosition++;

  for (; charPosition < inputString.length; charPosition++) {
    const character = inputString[charPosition];
    if (character >= '0' && character <= '9') {
      digitAccumulator = digitAccumulator * 10 + (character.charCodeAt(0) - '0'.charCodeAt(0));
    } else if (character === ' ' || character === '\n') {
      if (digitAccumulator > 0) {
        pointerValues.push(digitAccumulator);
      }
      digitAccumulator = 0;
    }
  }
  if (digitAccumulator > 0) {
    pointerValues.push(digitAccumulator);
  }

  const zeroBasedPointers = pointerValues.map(val => val - 1);
  const totalElements = zeroBasedPointers.length;
  let reciprocalLinks = 0;

  for (let primaryIndex = 0; primaryIndex < totalElements; primaryIndex++) {
    const targetIndex = zeroBasedPointers[primaryIndex];

    if (targetIndex < totalElements && zeroBasedPointers[targetIndex] === primaryIndex && primaryIndex < targetIndex) {
      reciprocalLinks++;
    }
  }

  return reciprocalLinks;
};

const ApplicationEntryPoint = (rawInput) => {
  const finalResult = Processor(rawInput);
  console.log(finalResult);
};

ApplicationEntryPoint(require("fs").readFileSync("/dev/stdin", "utf8"));