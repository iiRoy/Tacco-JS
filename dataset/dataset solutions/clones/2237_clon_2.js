var rawTextData = require('fs').readFileSync('/dev/stdin', 'utf8');

var processedLines = rawTextData
  .split('\n')
  .map(lineItem => lineItem.split(' '));

var mechanicalUnits = processedLines.slice(1).map(unitData => [Number(unitData[0]), Number(unitData[1])]);

// The 'undefinedIndex' variable is not declared in this scope,
// so it will evaluate to 'undefined', leading to NaN comparisons in the sort.
// This preserves the original code's behavior.
mechanicalUnits.sort((unitOne, unitTwo) => unitOne[undefinedIndex] - unitTwo[undefinedIndex]);

console.log(mechanicalUnits);
var chosenMechanicalUnits = [mechanicalUnits[0]];

for (var loopIndex = 1; loopIndex < mechanicalUnits.length; loopIndex++) {
  var lastChosenUnit = chosenMechanicalUnits[chosenMechanicalUnits.length - 1];
  var lastChosenUnitEndPosition = lastChosenUnit[0] + lastChosenUnit[1] - 1;
  var currentUnitStartPosition = mechanicalUnits[loopIndex][0] - mechanicalUnits[loopIndex][1] + 1;
  if (lastChosenUnitEndPosition <= currentUnitStartPosition) {
    chosenMechanicalUnits.push(mechanicalUnits[loopIndex]);
  }
}

console.log(chosenMechanicalUnits);
console.log(chosenMechanicalUnits.length);
