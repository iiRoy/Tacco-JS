const createInputReader = (sourceContent) => {
  const internalLines = sourceContent.trim().split("\n");
  let linePointer = 0;

  const readerMethods = {
    extract: (asString) => {
      if (typeof internalLines[linePointer] === "string") {
        internalLines[linePointer] = internalLines[linePointer].split(" ").reverse();
      }
      const token = internalLines[linePointer].pop();
      if (internalLines[linePointer].length === 0) {
        linePointer++;
      }
      return asString ? token : Number(token);
    },

    line: (asString) => {
      const tokens = internalLines[linePointer++].split(" ");
      return asString ? tokens : tokens.map(Number);
    },

    matrix: (count, asString) => {
      const result = [];
      for (let i = 0; i < count; i++) {
        result.push(internalLines[linePointer++].split(" "));
      }
      return asString ? result : result.map(row => row.map(Number));
    },

    rows: (count, asString) => {
      const result = [];
      for (let i = 0; i < count; i++) {
        result.push(internalLines[linePointer++]);
      }
      return asString ? result : result.map(Number);
    }
  };
  return readerMethods;
};

const inputReader = createInputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(executeMainLogic());

function executeMainLogic() {
  const initialN = inputReader.extract();
  let arrayA = inputReader.line();
  let arrayB = inputReader.line();
  let finalAnswer = 0;

  const processBits = (inputArray, bitCount) => {
    const frequencyMap = inputArray.reduce((acc, val) => {
      acc.set(val, (acc.get(val) || 0) + 1);
      return acc;
    }, new Map());

    const resultList = [];
    const limit = 1 << (bitCount + 1);
    for (let k = 0; k < limit; k++) {
      if ((frequencyMap.get(k) || 0) % 2 !== 0) {
        resultList.push(k);
      }
    }
    return resultList;
  };

  const findInsertionPoint = (arr, target) => {
    let low = 0;
    let high = arr.length;
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (arr[mid] < target) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return low;
  };

  for (let currentBit = 28; currentBit >= 0; currentBit--) {
    if (currentBit < 17) {
      arrayB = processBits(arrayB, currentBit);
      arrayA = processBits(arrayA, currentBit).reverse();
    } else {
      arrayB.sort((valA, valB) => valA - valB);
      arrayA.sort((valA, valB) => valB - valA);
    }

    const bitValue = 1 << currentBit;
    const doubleBitValue = bitValue << 1;
    const tripleBitValue = bitValue * 3;
    let currentAccumulator = initialN;

    for (const valA of arrayA) {
      const count1 = findInsertionPoint(arrayB, bitValue - valA);
      const count2 = findInsertionPoint(arrayB, doubleBitValue - valA);
      const count3 = findInsertionPoint(arrayB, tripleBitValue - valA);
      currentAccumulator += -count3 + count2 - count1;
    }

    if (currentAccumulator % 2 !== 0) {
      finalAnswer += bitValue;
    }

    const mask = bitValue - 1;
    arrayB = arrayB.map(item => item & mask);
    arrayA = arrayA.map(item => item & mask);
  }
  return finalAnswer;
}
