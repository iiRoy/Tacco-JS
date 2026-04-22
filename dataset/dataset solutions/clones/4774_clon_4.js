'use strict';

function processInputContent(rawContent) {
  let initialSegment;
  const newlineIndex = rawContent.indexOf('\n');
  if (newlineIndex !== -1) {
    initialSegment = rawContent.substring(0, newlineIndex);
  } else {
    initialSegment = rawContent;
  }

  const transformedCharacters = initialSegment.split('').map(singleCharacter => {
    if (singleCharacter === ',') {
      return ' ';
    }
    return singleCharacter;
  });

  const finalStringResult = transformedCharacters.join('');

  console.log(finalStringResult);
}

const fileSystemModule = require("fs");
const inputSourcePath = "/dev/stdin";
const encodingMethod = "utf8";
const acquiredData = fileSystemModule.readFileSync(inputSourcePath, encodingMethod);

processInputContent(acquiredData);