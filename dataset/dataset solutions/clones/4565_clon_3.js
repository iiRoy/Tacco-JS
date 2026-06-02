const parseInteger = (s) => parseInt(s, 10);
const parseFloatNumber = (s) => parseFloat(s);
const isEven = (num) => (num % 2) === 0;
const isOdd = (num) => (num % 2) === 1;

const ArrayUtilities = {
  sortNumbersAscending: (arr) => [...arr].sort((a, b) => a - b),
  sortNumbersDescending: (arr) => [...arr].sort((a, b) => b - a),
  sortStringsAscending: (arr) => [...arr].sort(),
  sortStringsDescending: (arr) => [...arr].sort().reverse(),
  filterOutElement: (arr, elementToRemove) => arr.filter(e => e !== elementToRemove)
};

const readStandardInput = () => {
  const fs = require("fs");
  return fs.readFileSync("/dev/stdin", "utf8").split('\n').map(line => line.trim());
};

function calculateMinimumAreaDifference(inputLines) {
  const [initialHeight, initialWidth] = inputLines[0].split(' ').map(parseInteger);
  
  let minimumDifference = Infinity;

  for (let orientationIndex = 0; orientationIndex < 2; orientationIndex++) {
    const currentDimensions = (orientationIndex === 0) ? [initialWidth, initialHeight] : [initialHeight, initialWidth];
    const [currentLength, currentBreadth] = currentDimensions;

    const firstSplitRatio = currentLength / 3;
    const firstSplitDimension = Math.round(firstSplitRatio);
    const remainingLengthAfterFirstSplit = currentLength - firstSplitDimension;
    const areaOfFirstPiece = firstSplitDimension * currentBreadth;

    for (let splitTypeIndex = 0; splitTypeIndex < 2; splitTypeIndex++) {
      const subDimensions = (splitTypeIndex === 0) 
        ? [remainingLengthAfterFirstSplit, currentBreadth] 
        : [currentBreadth, remainingLengthAfterFirstSplit];
      
      const [subLength, subBreadth] = subDimensions;

      const secondSplitRatio = subLength / 2;
      const secondSplitDimension = Math.round(secondSplitRatio);
      const thirdSplitDimension = subLength - secondSplitDimension;
      
      const areaOfSecondPiece = secondSplitDimension * subBreadth;
      const areaOfThirdPiece = thirdSplitDimension * subBreadth;
      
      const allAreas = [areaOfFirstPiece, areaOfSecondPiece, areaOfThirdPiece];
      const sortedAreas = ArrayUtilities.sortNumbersDescending(allAreas);
      
      const currentAreaDifference = sortedAreas[0] - sortedAreas[2];
      
      minimumDifference = Math.min(minimumDifference, currentAreaDifference);
    }
  }
  console.log(minimumDifference);
}

calculateMinimumAreaDifference(readStandardInput());
