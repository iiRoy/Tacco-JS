var read = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var inputLines = [];
read.on('line', function(input){inputLines.push(input);});

class InputSource {
  constructor(lines) {
    this.dataLines = lines;
    this.currentIdx = 0;
  }

  hasMore() {
    return this.currentIdx < this.dataLines.length;
  }

  retrieveNext() {
    if (this.hasMore()) {
      return this.dataLines[this.currentIdx++];
    } else {
      throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
    }
  }
}

const dataTransformers = new Map([
  [1, (s) => parseInt(s)],
  [2, (s) => s.split(' ')],
  [4, (s) => s.split(' ').map(Number)],
  [6, (s) => s.split('')],
  [7, (s) => s.split('').map(Number)],
  [8, (arr) => arr.join(' ')],
  [9, (arr) => arr.join('\n')],
  [0, (arr) => arr.join('')]
]);

function applyTransform(item, typeIdentifier) {
  try {
    const converter = dataTransformers.get(typeIdentifier);
    return converter ? converter(item) : item;
  } catch (e) {
    return item;
  }
}

let dataStream;

function getNextItem() { return dataStream.retrieveNext(); }
function hasMoreItems() { return dataStream.hasMore(); }
function getInteger() { return applyTransform(getNextItem(), 1); }
function getIntegerArray() { return applyTransform(getNextItem(), 4); }
function displayResult(val) { console.log(val); }
function logDebug(val) { console.error('debug:' + require('util').inspect(val,false,null)); }

function compareNumbersAsc(a, b) {
  return a - b;
}

function countElementsStrictlyLess(sortedArray, value) {
  let lowerBound = 0;
  let upperBound = sortedArray.length;
  while (lowerBound < upperBound) {
    let midPoint = Math.floor((lowerBound + upperBound) / 2);
    if (sortedArray[midPoint] < value) {
      lowerBound = midPoint + 1;
    } else {
      upperBound = midPoint;
    }
  }
  return lowerBound;
}

function countElementsStrictlyGreater(sortedArray, value) {
  let lowIdx = 0;
  let highIdx = sortedArray.length;
  while (lowIdx < highIdx) {
    let mid = Math.floor((lowIdx + highIdx) / 2);
    if (sortedArray[mid] <= value) {
      lowIdx = mid + 1;
    } else {
      highIdx = mid;
    }
  }
  return sortedArray.length - lowIdx;
}

read.on('close', function(){
  dataStream = new InputSource(inputLines);
  console.error('\n↑入力 ↓出力');
  processData();
});

function processData(){
  const elementCount = getInteger();
  const firstSet = getIntegerArray();
  const middleSet = getIntegerArray();
  const lastSet = getIntegerArray();

  firstSet.sort(compareNumbersAsc);
  middleSet.sort(compareNumbersAsc);
  lastSet.sort(compareNumbersAsc);

  const totalTriplets = middleSet.reduce((accumulator, currentMiddleValue) => {
    const countA = countElementsStrictlyLess(firstSet, currentMiddleValue);
    const countC = countElementsStrictlyGreater(lastSet, currentMiddleValue);
    return accumulator + (countA * countC);
  }, 0);

  displayResult(totalTriplets);
}
