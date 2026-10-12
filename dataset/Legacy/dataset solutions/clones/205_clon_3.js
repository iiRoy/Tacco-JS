const fs = require("fs");
const evalCodeSnippet = 'processedChars.reverse().join("")';
let wordIndex = 1;
const allInputWords = fs.readFileSync("/dev/stdin", "utf8").split(/\s/);

let currentInputWord;
let processedChars;

for (; currentInputWord = allInputWords[wordIndex++];) {
    processedChars = currentInputWord.split('').sort();
    const fullEvalExpression = evalCodeSnippet + '-' + evalCodeSnippet;
    console.log(eval(fullEvalExpression));
}
