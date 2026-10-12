let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

let lineArray = rawData.trim().split("\n");

let firstString = lineArray[0];
let secondString = lineArray[1];

let resultIndices = "";

for (let outerIndex = 0; outerIndex < firstString.length; outerIndex++) {
  let isMatch = true;

  for (let innerIndex = 0; innerIndex < secondString.length; innerIndex++) {
    if (firstString[outerIndex + innerIndex] !== secondString[innerIndex]) {
      isMatch = false;
      break;
    }
  }

  if (isMatch) {
    resultIndices += outerIndex + "\n";
  }
}

if (resultIndices !== "") {
  console.log(resultIndices.trim());
}
