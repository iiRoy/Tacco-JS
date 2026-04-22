function processData(dataSource) {
  var firstVal = Number(dataSource[0] .split(" ")[0]);
  var secondVal = Number(dataSource[0] .split(" ")[1]);
  var numericSequence = dataSource[1].split(" ").map(item => item * 0.5);
  var commonMultiple = findLeastCommonMultiple(numericSequence);
  console.log(
    Math.trunc(secondVal / commonMultiple) - Math.trunc(secondVal / (commonMultiple * 2))
  );
}

function findLeastCommonMultiple(numberArray) {
  var currentNumbers = numberArray;
  var calcGreatestCommonDivisor = (valA, valB) => valB ? calcGreatestCommonDivisor(valB, valA % valB) : valA;
  var calcTwoNumLcm = (valA, valB) => (valA * valB) / calcGreatestCommonDivisor(valA, valB);
  var cumulativeLcm = currentNumbers[0];

  for (var idx = 1; idx < currentNumbers.length; idx++) {
    cumulativeLcm = calcTwoNumLcm(cumulativeLcm, currentNumbers[idx]);
  }
  return cumulativeLcm;
}

processData(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));