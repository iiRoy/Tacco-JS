"use strict"

const processInputAndSolve = (inputDataRaw) => {
  const processedInputLines = inputDataRaw.trim().split("\n");
  const mainString = processedInputLines[0];
  const stringLength = mainString.length;
  const targetRank = parseInt(processedInputLines[1], 10);

  const uniqueStartingChars = Array.from(new Set(mainString.split(''))).sort();
  let charFilterIndex = 0;
  const substringSet = new Set();

  const MAX_SUBSTRING_LENGTH = 5;

  while (substringSet.size < targetRank) {
    const currentInitialChar = uniqueStartingChars[charFilterIndex];

    for (let startIndex = 0; startIndex < stringLength; startIndex++) {
      if (mainString[startIndex] !== currentInitialChar) {
        continue;
      }

      for (let currentLength = 1; currentLength <= MAX_SUBSTRING_LENGTH; currentLength++) {
        if (startIndex + currentLength > stringLength) {
          break;
        }
        const currentSubstring = mainString.slice(startIndex, startIndex + currentLength);
        substringSet.add(currentSubstring);
      }
    }
    
    charFilterIndex++;
  }
  
  const allFoundSubstrings = Array.from(substringSet);
  allFoundSubstrings.sort();
  const resultSubstring = allFoundSubstrings[targetRank - 1];

  console.log(resultSubstring);
};

const executeSolution = () => {
  const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
  processInputAndSolve(fileContent);
};

executeSolution();
