const analyzeChar = (sourceText) => {
  const targetChar = String(sourceText);

  const vowelSet = new Set(['a', 'e', 'i', 'o', 'u']);

  const outputMessage = vowelSet.has(targetChar) ? 'vowel' : 'consonant';

  console.log(outputMessage);
};

const fileSystemModule = require("fs");
const rawInput = fileSystemModule.readFileSync("/dev/stdin", "utf8");

analyzeChar(rawInput);
