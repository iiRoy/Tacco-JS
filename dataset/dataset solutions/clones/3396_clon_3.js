function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) { _i["return"](); } } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function parseNumbersFromString(inputLine) {
  return inputLine.split(/\s+/).map(function (parsedNum) {
    return parseInt(parsedNum, 10);
  });
}

function populateFrequencyMap(numbers, frequencyMap) {
  const DEFAULT_INITIAL_COUNT = 0;
  for (const currentNum of numbers) {
    frequencyMap.set(currentNum, (frequencyMap.get(currentNum) || DEFAULT_INITIAL_COUNT) + 1);
  }
}

function decrementOrRemoveFromMap(frequencyMap, mapEntryKey, explicitValue) {
  const currentEntryValue = explicitValue !== undefined ? explicitValue : frequencyMap.get(mapEntryKey);
  if (currentEntryValue == null) {
    return false;
  }

  if (currentEntryValue > 1) {
    frequencyMap.set(mapEntryKey, currentEntryValue - 1);
  } else {
    frequencyMap.delete(mapEntryKey);
  }
  return true;
}

function calculatePowerOfTwoDiffs(originalValue) {
  const diffResults = [];
  const MAX_TARGET_VALUE = 2 * 1e9;

  for (let powerOfTwoTarget = 2; powerOfTwoTarget <= MAX_TARGET_VALUE; powerOfTwoTarget *= 2) {
    const diff = powerOfTwoTarget - originalValue;
    if (diff > 0) {
      diffResults.push(diff);
    }
  }
  return diffResults;
}

function processComponent(initialValue, freqMap, diffCalculator, mapModifier) {
  const bfsQueue = [initialValue];
  let leftCount = 0;
  let rightCount = 0;

  while (bfsQueue.length > 0) {
    const currentNode = bfsQueue.pop();
    const isRightBranch = currentNode < 0;
    const absoluteNodeValue = Math.abs(currentNode);

    if (isRightBranch) {
      rightCount = rightCount + 1;
    } else {
      leftCount = leftCount + 1;
    }

    const potentialDiffs = diffCalculator(absoluteNodeValue);
    for (const diffValue of potentialDiffs) {
      if (mapModifier(freqMap, diffValue)) {
        bfsQueue.push(isRightBranch ? diffValue : -diffValue);
      }
    }
  }
  return [leftCount, rightCount];
}


function processInput(rawData) {
  const inputLines = rawData.split('\n');
  const countN = parseInt(inputLines[0], 10);
  const numbersArray = parseNumbersFromString(inputLines[1]).slice(0, countN);

  if (countN === 0) {
    console.log(0);
    return;
  }

  const frequencyMap = new Map();
  populateFrequencyMap(numbersArray, frequencyMap);

  let totalPairs = 0;

  while (frequencyMap.size > 0) {
    const mapIteratorResult = frequencyMap[Symbol.iterator]().next();
    const _mapIteratorResultValue = _slicedToArray(mapIteratorResult.value, 2);
    const initialVal = _mapIteratorResultValue[0];
    const initialFreq = _mapIteratorResultValue[1];

    decrementOrRemoveFromMap(frequencyMap, initialVal, initialFreq);

    const [leftCount, rightCount] = processComponent(
      initialVal,
      frequencyMap,
      calculatePowerOfTwoDiffs,
      decrementOrRemoveFromMap
    );

    totalPairs += Math.min(leftCount, rightCount);
  }

  console.log(totalPairs);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
