class InputHandler {
  constructor(sourceLines) {
    this.lines = sourceLines;
    this.currentPosition = 0;
  }

  hasMore() {
    return this.currentPosition < this.lines.length;
  }

  retrieveNext() {
    if (!this.hasMore()) {
      return "";
    }
    return this.lines[this.currentPosition++];
  }
}

const acquireSource = () => require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
const inputProcessor = new InputHandler(acquireSource());

const fetchNextLine = () => inputProcessor.retrieveNext();
const checkMoreLines = () => inputProcessor.hasMore();

const conversionMap = {
  1: (val) => parseInt(val, 10),
  2: (val) => val.split(" "),
  4: (val) => val.split(" ").map(Number),
  6: (val) => val.split(""),
  7: (val) => val.split("").map(Number),
  8: (arr) => arr.join(" "),
  9: (arr) => arr.join("\n"),
  0: (arr) => arr.join(""),
};

const processConversion = (inputVal, conversionType) => {
  try {
    const converter = conversionMap[conversionType];
    return converter ? converter(inputVal) : inputVal;
  } catch (e) {
    return inputVal;
  }
};

const readInteger = () => processConversion(fetchNextLine(), 1);
const readStringArray = () => processConversion(fetchNextLine(), 2);
const readIntegerArray = () => processConversion(fetchNextLine(), 4);
const readCharacterArray = () => processConversion(fetchNextLine(), 6);

const emitOutput = (content) => console.log(content);
const emitError = (content) => console.error(content);

const findElementToRemove = (currentArr) => {
  let removalCandidateIndex = -1;
  for (let i = 0; i < currentArr.length; i++) {
    if (currentArr[i] > i + 1) {
      return { error: true };
    }
    if (currentArr[i] === i + 1) {
      removalCandidateIndex = i;
    } else {
      return { index: i - 1 };
    }
  }
  return { index: removalCandidateIndex };
};

const executeProcessing = () => {
  const sequenceLength = readInteger();
  const initialValues = readIntegerArray();

  const hasInvalidInitialValue = initialValues.some((val, idx) => val > idx + 1);
  if (hasInvalidInitialValue) {
    emitOutput(-1);
    return;
  }

  let workingSequence = initialValues;
  const resultSequence = [];

  while (workingSequence.length > 0) {
    const removalResult = findElementToRemove(workingSequence);

    if (removalResult.error) {
      emitOutput(-1);
      return;
    }

    const indexToRemove = removalResult.index;
    if (indexToRemove === -1) {
        emitOutput(-1);
        return;
    }

    resultSequence.unshift(workingSequence[indexToRemove]);
    workingSequence = workingSequence.filter((_, idx) => idx !== indexToRemove);
  }

  emitOutput(processConversion(resultSequence, 9));
};

executeProcessing();
