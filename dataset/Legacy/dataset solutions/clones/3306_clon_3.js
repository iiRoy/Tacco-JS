var MAX_ITEM_VAL = 1000;

var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineEntries = rawData.trim().split('\n');

var firstLineData = lineEntries[0].split(' ').map(Number);
var numItems = firstLineData[0];
var maxWeight = firstLineData[1];

var itemSpecs = lineEntries.slice(1).map(r => r.split(' ').map(Number));

var MAX_TOTAL_VALUE_SUM = numItems * MAX_ITEM_VAL;

var memoTable = [];
for (var k = 0; k <= numItems; k++) {
  memoTable.push(new Array(MAX_TOTAL_VALUE_SUM + 1).fill(0));
}

var initialRow = new Array(MAX_TOTAL_VALUE_SUM + 1).fill(Infinity);
initialRow[0] = 0;
memoTable[0] = initialRow;

function calculateOptimalValue() {

  for (var itemIdx = 0; itemIdx < numItems; itemIdx++) {
    var currentItem = itemSpecs[itemIdx];
    var currentItemValue = currentItem[0];
    var currentItemWeight = currentItem[1];

    for (var currentValue = 0; currentValue <= MAX_TOTAL_VALUE_SUM; currentValue++) {
      var previousItemWeightState = memoTable[itemIdx][currentValue];

      if (currentItemWeight <= currentValue) {
        var weightIfIncluded = memoTable[itemIdx][currentValue - currentItemWeight] + currentItemValue;
        var weightIfExcluded = previousItemWeightState;
        memoTable[itemIdx + 1][currentValue] = Math.min(weightIfIncluded, weightIfExcluded);
      } else {
        memoTable[itemIdx + 1][currentValue] = previousItemWeightState;
      }
    }
  }

  var finalOptimalValue = 0;
  var finalRowOfTable = memoTable[numItems];
  for (var currentValue = 0; currentValue <= MAX_TOTAL_VALUE_SUM; currentValue++) {
    if (finalRowOfTable[currentValue] <= maxWeight) {
      finalOptimalValue = currentValue;
    }
  }
  return finalOptimalValue;
}

console.log(calculateOptimalValue());
