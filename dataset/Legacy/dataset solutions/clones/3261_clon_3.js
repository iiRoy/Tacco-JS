"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function main(inputContent) {
  const inputLines = inputContent.split('\n');

  const [numSushiItems, selectionSize] = parseSpaceSeparatedIntegers(inputLines[0]);

  const sushiDataList = inputLines.slice(1, numSushiItems + 1).map((line, originalIndex) => {
    const [typeId, deliciousness] = parseSpaceSeparatedIntegers(line);
    return {
      typeId,
      deliciousness,
      originalIndex
    };
  });

  // Sort sushi items primarily by type ID (ascending), then by deliciousness (descending)
  sushiDataList.sort((a, b) => {
    if (a.typeId < b.typeId) return -1;
    if (a.typeId > b.typeId) return 1;
    return b.deliciousness - a.deliciousness;
  });

  // Create a separate list sorted purely by deliciousness (descending) for general selection
  const sortedByDeliciousness = sushiDataList.slice(0).sort((a, b) => b.deliciousness - a.deliciousness);

  // Group sushi items by type ID, ensuring each group is sorted by deliciousness (descending)
  const sushiByTypeMap = new Map();
  for (const sushiItem of sushiDataList) {
    let typeGroup = sushiByTypeMap.get(sushiItem.typeId);
    if (!typeGroup) {
      typeGroup = [];
      sushiByTypeMap.set(sushiItem.typeId, typeGroup);
    }
    typeGroup.push(sushiItem);
  }

  const uniqueTypeIds = Array.from(sushiByTypeMap.keys());
  const isTaken = new Array(numSushiItems).fill(false); // Tracks which sushi items are currently selected

  let initialSelection = [];
  let additionalSelection = [];
  let currentDeliciousnessSum = 0;
  let currentUniqueTypeCount = 0;
  let deliciousnessScanIndex = 0; // Index for iterating through sortedByDeliciousness

  // Helper to select the most delicious sushi from a given set of unique types
  const selectMostDeliciousOfEachType = (typeIdsToConsider, mapOfSushiByType, takenStatusArray, initialSum) => {
    let sum = initialSum;
    const selectedItems = typeIdsToConsider.map(typeId => {
      const mostDeliciousSushiOfType = mapOfSushiByType.get(typeId)[0]; // First item is most delicious due to pre-sorting
      takenStatusArray[mostDeliciousSushiOfType.originalIndex] = true;
      sum += mostDeliciousSushiOfType.deliciousness;
      return mostDeliciousSushiOfType;
    });
    return { selectedItems, updatedSum: sum };
  };

  if (uniqueTypeIds.length >= selectionSize) {
    // Case 1: There are enough unique types to pick 'selectionSize' distinct types
    const { selectedItems, updatedSum } = selectMostDeliciousOfEachType(uniqueTypeIds.slice(0, selectionSize), sushiByTypeMap, isTaken, 0);
    initialSelection = selectedItems;
    currentDeliciousnessSum = updatedSum;
    currentUniqueTypeCount = selectionSize;
  } else {
    // Case 2: Not enough unique types to pick 'selectionSize' distinct types
    // Select the most delicious sushi from ALL available unique types first
    const { selectedItems, updatedSum } = selectMostDeliciousOfEachType(uniqueTypeIds, sushiByTypeMap, isTaken, 0);
    initialSelection = selectedItems;
    currentDeliciousnessSum = updatedSum;
    currentUniqueTypeCount = uniqueTypeIds.length;

    const itemsNeededFromOthers = selectionSize - initialSelection.length;
    let itemsAddedToAdditionalCount = 0;

    // Fill the remaining slots with the most delicious available non-unique items
    while (itemsAddedToAdditionalCount < itemsNeededFromOthers && deliciousnessScanIndex < numSushiItems) {
      const candidateSushi = sortedByDeliciousness[deliciousnessScanIndex];
      if (!isTaken[candidateSushi.originalIndex]) {
        isTaken[candidateSushi.originalIndex] = true;
        currentDeliciousnessSum += candidateSushi.deliciousness;
        additionalSelection.push(candidateSushi);
        itemsAddedToAdditionalCount++;
      }
      deliciousnessScanIndex++;
    }
  }

  // Sort the initial selection by deliciousness (ascending) for the optimization phase
  initialSelection.sort((a, b) => a.deliciousness - b.deliciousness);

  // Main optimization loop: Try to replace low-deliciousness unique-type sushi
  // with high-deliciousness non-unique-type sushi if it improves the total score.
  for (const i of iterateRange(0, initialSelection.length)) {
    const sushiToPotentiallyReplace = initialSelection[i];

    // Iterate through the generally sorted sushi to find a replacement
    while (deliciousnessScanIndex < numSushiItems) {
      const replacementSushi = sortedByDeliciousness[deliciousnessScanIndex];

      // Skip if the replacement candidate is already taken
      if (isTaken[replacementSushi.originalIndex]) {
        deliciousnessScanIndex++;
        continue;
      }

      const currentUniqueTypeCountSquared = currentUniqueTypeCount * currentUniqueTypeCount;
      const oldTotalScore = currentDeliciousnessSum + currentUniqueTypeCountSquared;

      const potentialNewDeliciousnessSum = currentDeliciousnessSum + replacementSushi.deliciousness - sushiToPotentiallyReplace.deliciousness;
      const potentialNewUniqueTypeCount = currentUniqueTypeCount - 1; // Replacing a unique type with a non-unique type
      const potentialNewUniqueTypeCountSquared = potentialNewUniqueTypeCount * potentialNewUniqueTypeCount;
      const newTotalScore = potentialNewDeliciousnessSum + potentialNewUniqueTypeCountSquared;

      if (oldTotalScore < newTotalScore) {
        // If replacement improves the score, apply the change
        currentDeliciousnessSum = potentialNewDeliciousnessSum;
        currentUniqueTypeCount = potentialNewUniqueTypeCount;
        isTaken[replacementSushi.originalIndex] = true;
        isTaken[sushiToPotentiallyReplace.originalIndex] = false;
        deliciousnessScanIndex++;
        break; // Move to the next sushi in initialSelection
      } else {
        // If no improvement, further replacements for this initial item won't help
        // because sortedByDeliciousness is descending.
        console.log(oldTotalScore);
        return; // Early exit as no better solution can be found
      }
    }
  }

  const finalScore = currentDeliciousnessSum + (currentUniqueTypeCount * currentUniqueTypeCount);
  console.log(finalScore);
}

const MODULO_CONSTANT = 1e9 + 7; // This constant is present in the original but unused in main logic.

main(require('fs').readFileSync('/dev/stdin', 'utf8'));

function parseSpaceSeparatedIntegers(line) {
  return (Array.isArray(line) ? line : line.split(/\s+/)).map(n => parseInt(n, 10));
}

/**
 * Iterates over integers in [start, end).
 */
function* iterateRange(start, end) {
  for (let i = start; i < end; i++) {
    yield i;
  }
}

/**
 * Iterates over integers in [end, start) in desc order.
 */
function* iterateRangeRev(start, end) {
  for (let i = start - 1; i >= end; i--) {
    yield i;
  }
}

/**
 * Runs a recursive function expressed as a generator function.
 * (This helper is not used in the main logic of this specific problem.)
 */
function runRecursiveGenerator(func) {
  const rootCaller = { lastReturnValue: null };
  const callStack = [];

  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  callStack.push({
    iterator: func.apply(void 0, args),
    lastReturnValue: null,
    caller: rootCaller
  });

  while (callStack.length > 0) {
    const stackFrame = callStack[callStack.length - 1];
    const { iterator, lastReturnValue, caller } = stackFrame;

    const { value, done } = iterator.next(lastReturnValue);

    if (done) {
      caller.lastReturnValue = value;
      callStack.pop();
    } else {
      callStack.push({
        iterator: func.apply(void 0, _toConsumableArray(value)),
        lastReturnValue: null,
        caller: stackFrame
      });
    }
  }
  return rootCaller.lastReturnValue;
}
