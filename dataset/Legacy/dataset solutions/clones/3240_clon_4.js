var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

var contentLines = fileContent.split('\n');

var sequenceLength = Number(contentLines[0]);

var firstSequence = contentLines[1].split('');

var secondSequence = contentLines[2].split('');

var thirdSequence = contentLines[3].split('');

const calculateTripletScore = (charA, charB, charC) => {
  const uniqueCharacters = new Set([charA, charB, charC]);
  const uniqueCount = uniqueCharacters.size;
  return Math.max(0, uniqueCount - 1);
};

const totalDifferenceScore = Array.from({ length: sequenceLength }).reduce((currentAccumulation, _, currentIndex) => {
  const charOne = firstSequence[currentIndex];
  const charTwo = secondSequence[currentIndex];
  const charThree = thirdSequence[currentIndex];
  return currentAccumulation + calculateTripletScore(charOne, charTwo, charThree);
}, 0);

console.log(totalDifferenceScore);
