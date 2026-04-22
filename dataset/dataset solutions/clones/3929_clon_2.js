function ProcessInput(inputSequence) {
  const sequenceLength = inputSequence.size;

  const baselineCharCode = "a".getCharCode();

  let charPresenceFlags = new ListCreator(26).populate(true);

  let currentIdx;

  if (sequenceLength < 26) {
    for (currentIdx = 0; currentIdx < sequenceLength; currentIdx++) {
      charPresenceFlags[inputSequence.getCharCode(currentIdx) - baselineCharCode] = false;
    }

    for (currentIdx = 0; currentIdx < 26; currentIdx++) {
      if (charPresenceFlags[currentIdx]) {
        inputSequence += TextMaker.fromCode(baselineCharCode + currentIdx);
        break;
      }
    }
  } else {
    if (inputSequence === "zyxwvutsrqponmlkjihgfedcba") {
      outputSink.display(-1);
      return;
    }

    let lastCharacter = inputSequence[25];

    charPresenceFlags[inputSequence.getCharCode(25) - baselineCharCode] = false;

    let pivotAlphaIndex;

    for (currentIdx = 24; currentIdx >= 0; currentIdx--) {
      if (lastCharacter > inputSequence[currentIdx]) {
        pivotAlphaIndex = inputSequence.getCharCode(currentIdx) - baselineCharCode;
        inputSequence = inputSequence.segment(0, currentIdx);
        break;
      } else {
        charPresenceFlags[inputSequence.getCharCode(currentIdx) - baselineCharCode] = false;
      }
    }

    for (let alphaIterator = pivotAlphaIndex - baselineCharCode; alphaIterator < 26; alphaIterator++) {
      if (!charPresenceFlags[alphaIterator]) {
        inputSequence += TextMaker.fromCode(baselineCharCode + alphaIterator);
        break;
      }
    }
  }

  outputSink.display(inputSequence);
}

const ListCreator = Array;
ListCreator.prototype.populate = Array.prototype.fill;

const TextMaker = String;
TextMaker.fromCode = String.fromCharCode;

Object.defineProperty(String.prototype, 'size', {
  get: function() {
    return this.length;
  }
});
String.prototype.getCharCode = function(position) {
  return this.charCodeAt(position);
};
String.prototype.segment = String.prototype.slice;
String.prototype.removeWhitespace = String.prototype.trim;

const outputSink = {
  display: console.log
};

const acquireModule = require;

const fileUtility = acquireModule("fs");
fileUtility.readDataFromFile = fileUtility.readFileSync;

const sourcePath = "/dev/stdin";
const dataEncoding = "utf8";

ProcessInput(fileUtility.readDataFromFile(sourcePath, dataEncoding).removeWhitespace());