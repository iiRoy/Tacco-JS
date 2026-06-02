process.stdin.resume();
process.stdin.setEncoding('utf8');

var accumulatedInput = '';

process.stdin.on('data', function(chunk) {
  accumulatedInput += chunk;
});

process.stdin.on('end', function() {
  runProgram(accumulatedInput);
});

function splitRawInput(rawInput) {
  return rawInput.split('\n');
}

function readOriginalCount(lines) {
  return lines[0];
}

function readOriginalNumberList(lines, countValue) {
  var rawValues = lines[1].split(' ');
  var parsedValues = [];

  for (var index = 0; index < countValue; index++) {
    parsedValues.push(parseInt(rawValues[index]));
  }

  return parsedValues;
}

function createSortedCopyWithOriginalBug(values) {
  var copiedValues = values.slice();

  /*
   * Fiel al original:
   * sort() sin comparator ordena lexicográficamente,
   * no numéricamente.
   */
  copiedValues.sort();

  return copiedValues;
}

function buildSortedPositionDictionary(originalValues, sortedValues) {
  var positionDictionary = {};

  for (var index in originalValues) {
    var sortedValueAtIndex = sortedValues[index];

    if (sortedValueAtIndex in positionDictionary) {
      positionDictionary[sortedValueAtIndex].push(index);
    } else {
      positionDictionary[sortedValueAtIndex] = [index];
    }
  }

  return positionDictionary;
}

function getSortedPositionForOriginalValue(value, dictionary) {
  return dictionary[value.toString()].pop();
}

function chooseMedianReplacement(sortedIndex, halfIndex, leftCandidate, rightCandidate) {
  if (sortedIndex <= halfIndex) {
    return rightCandidate;
  }

  return leftCandidate;
}

function printAnswersForEveryElement(values, sortedValues, dictionary, originalCount) {
  var lastIndex = originalCount - 1;

  for (var index = 0; index <= lastIndex; index++) {
    var currentValue = values[index];

    var sortedPosition = getSortedPositionForOriginalValue(
      currentValue,
      dictionary
    );

    var halfIndex = Math.floor(lastIndex / 2);
    var leftCandidate = sortedValues[halfIndex];
    var rightCandidate = sortedValues[halfIndex + 1];

    var answer = chooseMedianReplacement(
      sortedPosition,
      halfIndex,
      leftCandidate,
      rightCandidate
    );

    console.log(answer.toString());
  }
}

function runProgram(rawInput) {
  var lines = splitRawInput(rawInput);

  var n = readOriginalCount(lines);
  var list = readOriginalNumberList(lines, n);

  var sortedList = createSortedCopyWithOriginalBug(list);
  var dictionary = buildSortedPositionDictionary(list, sortedList);

  printAnswersForEveryElement(list, sortedList, dictionary, n);
}