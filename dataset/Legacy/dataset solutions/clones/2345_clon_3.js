function processInput(rawData) {
  var targetString = rawData[0];
  var stringLength = targetString.length;
  var mismatchCount = 0;
  var halfLength = Math.trunc(stringLength / 2);
  var lastCharIndex = stringLength - 1;

  const checkDifference = (charA, charB) => {
    return charA !== charB;
  };

  for (var currentIndex = 0; currentIndex < halfLength; currentIndex++) {
    var charLeft = targetString[currentIndex];
    var charRight = targetString[lastCharIndex - currentIndex];

    if (checkDifference(charLeft, charRight)) {
      mismatchCount = mismatchCount + 1;
    }
  }
  console.log(mismatchCount);
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedContent = fileContent.trim().split("\n");
processInput(processedContent);
