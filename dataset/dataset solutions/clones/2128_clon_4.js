var inputData = require("fs").readFileSync("/dev/stdin", "utf8").split(/ |\n/).filter(Boolean);
var inputPointer = 0;

function getNextToken(isString) {
  return isString ? inputData[inputPointer++] : Number(inputData[inputPointer++]);
}

class CountSegmentTree {
  constructor(size) {
    this.baseLength = size;
    this.tree = new Array(4 * size).fill(0);
  }

  modifyValue(index, value) {
    this._recursiveUpdate(index, value, 0, 0, this.baseLength - 1);
  }

  _recursiveUpdate(targetIndex, value, treeIndex, rangeStart, rangeEnd) {
    if (rangeStart === rangeEnd) {
      this.tree[treeIndex] += value;
      return;
    }

    const mid = Math.floor((rangeStart + rangeEnd) / 2);
    if (targetIndex <= mid) {
      this._recursiveUpdate(targetIndex, value, 2 * treeIndex + 1, rangeStart, mid);
    } else {
      this._recursiveUpdate(targetIndex, value, 2 * treeIndex + 2, mid + 1, rangeEnd);
    }
    this.tree[treeIndex] = this.tree[2 * treeIndex + 1] + this.tree[2 * treeIndex + 2];
  }

  retrieveSum(queryStart, queryEnd) {
    return this._recursiveQuery(queryStart, queryEnd, 0, 0, this.baseLength - 1);
  }

  _recursiveQuery(queryStart, queryEnd, treeIndex, rangeStart, rangeEnd) {
    if (queryStart <= rangeStart && rangeEnd <= queryEnd) {
      return this.tree[treeIndex];
    }
    if (rangeEnd < queryStart || queryEnd < rangeStart) {
      return 0;
    }

    const mid = Math.floor((rangeStart + rangeEnd) / 2);
    const leftSum = this._recursiveQuery(queryStart, queryEnd, 2 * treeIndex + 1, rangeStart, mid);
    const rightSum = this._recursiveQuery(queryStart, queryEnd, 2 * treeIndex + 2, mid + 1, rangeEnd);
    return leftSum + rightSum;
  }
}

function processProblem() {
  const stringLength = getNextToken();
  const initialStringContent = getNextToken(true);
  const queryCount = getNextToken();

  const originalCharCodes = Array.from(initialStringContent, char => char.charCodeAt(0) - 97);

  const charPresenceTrackers = Array(26).fill().map(() => new CountSegmentTree(stringLength));

  for (let i = 0; i < stringLength; i++) {
    charPresenceTrackers[originalCharCodes[i]].modifyValue(i, 1);
  }

  const outputLines = [];

  for (let qIdx = 0; qIdx < queryCount; qIdx++) {
    const currentQueryType = getNextToken();

    if (currentQueryType === 1) {
      const updatePosition = getNextToken() - 1;
      const newCharacter = getNextToken(true);
      const newCharCode = newCharacter.charCodeAt(0) - 97;

      const oldCharCode = originalCharCodes[updatePosition];

      charPresenceTrackers[oldCharCode].modifyValue(updatePosition, -1);
      charPresenceTrackers[newCharCode].modifyValue(updatePosition, 1);
    } else {
      const rangeStart = getNextToken() - 1;
      const rangeEnd = getNextToken() - 1;

      let distinctCharacterCount = 0;
      for (let charCode = 0; charCode < 26; charCode++) {
        const characterOccurrences = charPresenceTrackers[charCode].retrieveSum(rangeStart, rangeEnd);
        if (characterOccurrences > 0) {
          distinctCharacterCount++;
        }
      }
      outputLines.push(distinctCharacterCount);
    }
  }

  return outputLines.join("\n");
}

var finalOutput = processProblem();
if (finalOutput !== undefined) {
  console.log(finalOutput);
}
