"use strict"

const displayResult = (content) => {
  process.stdout.write(content + '\n');
};

const processTextContent = (sourceContent) => {
  let workingString = sourceContent.replace(/^\s+|\s+$/g, '');

  const resultantParts = [];
  let lastDelimiterEnd = 0;
  let currentCharacterPosition = 0;

  while (currentCharacterPosition < workingString.length) {
    const currentSymbol = workingString[currentCharacterPosition];
    if (currentSymbol === ' ') {
      resultantParts.push(workingString.substring(lastDelimiterEnd, currentCharacterPosition));
      lastDelimiterEnd = currentCharacterPosition + 1;
    }
    currentCharacterPosition++;
  }

  resultantParts.push(workingString.substring(lastDelimiterEnd));

  if (workingString.length === 0 && resultantParts.length === 1 && resultantParts[0] === '') {
    // This condition handles cases like input being "   " which after trimming becomes ""
    // and `"".split(' ')` results in `[""]`. My loop naturally does this.
    // If the string was empty to begin with, or only spaces, resultantParts will be `[""]`.
    // No special handling needed here.
  } else if (workingString.length > 0 && resultantParts.length === 0) {
    // This case should not be reached if workingString is non-empty.
    // It's a fail-safe, should imply no spaces and workingString is the only part.
    // However, the loop logic ensures at least one part for non-empty string.
  }

  const secondElement = resultantParts[1];
  const firstElement = resultantParts[0];

  const finalConcat = (secondElement === undefined ? 'undefined' : secondElement) +
                      (firstElement === undefined ? 'undefined' : firstElement);
  displayResult(finalConcat);
};

const moduleLoader = require;
const fileSystemModule = moduleLoader('fs');
const readDataFromFile = fileSystemModule.readFileSync;

const standardInputPath = "/dev/stdin";
const textCharacterEncoding = "utf8";

const receivedContent = readDataFromFile(standardInputPath, textCharacterEncoding);
processTextContent(receivedContent);