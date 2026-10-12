const processInput = (rawData) => {
  const charSeparator = '';
  let characterSequence = rawData.split(charSeparator);

  const updateCharacterInSequence = (sequence, indexToModify, newValue) => {
    sequence[indexToModify] = newValue;
  };

  const modificationIndex = 3;
  const newCharacterValue = "8";

  updateCharacterInSequence(characterSequence, modificationIndex, newCharacterValue);

  const resultString = characterSequence.join(charSeparator);
  console.log(resultString);
};

const fsModule = require("fs");
const standardInputPath = "/dev/stdin";
const utf8Encoding = "utf8";

const rawInputContent = fsModule.readFileSync(standardInputPath, utf8Encoding);
processInput(rawInputContent);
