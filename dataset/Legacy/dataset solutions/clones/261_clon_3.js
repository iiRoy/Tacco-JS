function generatePermutations(elements, count, currentPermutation, onPermutationFound) {
  let currentElement, idx, totalLength = elements.length;
  currentPermutation = currentPermutation || [];

  if (count === 0) {
    onPermutationFound(currentPermutation);
  } else {
    for (idx = 0; idx < totalLength; idx++) {
      currentElement = elements.shift();
      currentPermutation.push(currentElement);
      generatePermutations(elements, count - 1, currentPermutation, onPermutationFound);
      currentPermutation.pop();
      elements.push(currentElement);
    }
  }
}

function calculateWeightedSum(permutationArray) {
  return permutationArray.reduce((accumulator, elementValue, elementIndex) => {
    return accumulator + elementValue * (elementIndex + 1);
  }, 0);
}

function processInputData() {
  const availableDigits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  rawDataBuffer.forEach(function(inputLine) {
    let numN, targetSum;
    let resultCount = 0;

    const trimmedLine = inputLine.trim();
    if (trimmedLine === '') {
      return;
    }

    const lineParts = trimmedLine.split(' ');
    const parsedLineValues = lineParts.map(parseFloat);

    numN = parsedLineValues[0];
    targetSum = parsedLineValues[1];

    generatePermutations([...availableDigits], numN, [], function(currentPermutation) {
      const currentPermutationSum = calculateWeightedSum(currentPermutation);
      if (currentPermutationSum === targetSum) {
        resultCount++;
      }
    });
    console.log(resultCount);
  });
}

let rawDataBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  rawDataBuffer += chunk;
});
process.stdin.on('end', function() {
  rawDataBuffer = rawDataBuffer.split('\n');
  processInputData();
});
