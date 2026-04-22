const standardInput = require("fs").readFileSync("/dev/stdin", "utf8");
const tokenizedInput = standardInput.split(/ |\n/);
let tokenIndex = 0;

const retrieveNextNumber = () => +tokenizedInput[tokenIndex++];
const retrieveNextString = () => tokenizedInput[tokenIndex++];
const retrieveNextBigInt = () => BigInt(tokenizedInput[tokenIndex++]);

const extractNumbers = (count, asIs) => {
    const subset = tokenizedInput.slice(tokenIndex, tokenIndex + count);
    tokenIndex += count;
    return asIs ? subset : subset.map(Number);
};

const extractMatrix = (rows, cols, asIs) => {
    const resultMatrix = [];
    for (let i = 0; i < rows; i++) {
        const rowData = tokenizedInput.slice(tokenIndex, tokenIndex + cols);
        tokenIndex += cols;
        resultMatrix.push(asIs ? rowData : rowData.map(Number));
    }
    return resultMatrix;
};

const constructMultiDimArray = (initialValue, ...dimensions) => {
    const createDim = (dimIdx) => {
        if (dimIdx === dimensions.length - 1) {
            return Array(dimensions[dimIdx]).fill(initialValue);
        } else {
            return Array(dimensions[dimIdx]).fill(null).map(() => createDim(dimIdx + 1));
        }
    };
    return createDim(0);
};

class SequenceStack {
    constructor() {
        this.records = [];
    }

    get length() {
        return this.records.length;
    }

    peek() {
        if (this.length === 0) return null;
        return this.records[this.length - 1];
    }

    push(entry) {
        this.records.push(entry);
    }

    pop() {
        if (this.length === 0) return null;
        return this.records.pop();
    }

    popWhile(condition) {
        while (this.length > 0 && condition(this.peek())) {
            this.pop();
        }
    }

    processBackwards(limit, currentElement, initialTopValue) {
        let currentIterValue = initialTopValue;
        let success = false;
        
        let current_length = this.records.length;
        while (current_length > 0) {
            let j_pair_idx = current_length - 1;
            let [pair_val, pair_cnt] = this.records[j_pair_idx];

            if (pair_val < currentIterValue) {
                this.push([currentElement, 2]);
                success = true;
                break;
            }

            if (pair_cnt < limit) {
                this.records[j_pair_idx][1]++;
                if (pair_val < currentElement) {
                    this.push([currentElement, 1]);
                }
                success = true;
                break;
            }

            this.pop();
            currentIterValue--;
            current_length--;
        }
        return success;
    }
}

function checkCondition(maxLimit, inputData) {
    if (maxLimit === 0) return false;
    
    const processor = new SequenceStack();

    const firstDataItem = inputData[0];
    if (firstDataItem > 1) {
        processor.push([1, 1]);
        processor.push([firstDataItem, 1]);
    } else {
        processor.push([1, 1]);
    }

    for (let currentIdx = 1; currentIdx < inputData.length; currentIdx++) {
        const currentDataItem = inputData[currentIdx];
        let [currentTopVal, currentTopCnt] = processor.peek();

        if (currentTopVal < currentDataItem) {
            processor.popWhile((pair) => pair[1] === 1 && processor.length > 1);
            processor.push([currentDataItem, 1]);
        } else {
            if (maxLimit === 1) return false;

            processor.popWhile((pair) => pair[0] > currentDataItem);
            if (processor.length === 0) return false;

            [currentTopVal, currentTopCnt] = processor.peek();

            if (currentTopVal < currentDataItem) {
                processor.push([currentDataItem, 2]);
            } else {
                const initialTopValueForInnerLoop = currentTopVal;
                const innerLoopSuccess = processor.processBackwards(maxLimit, currentDataItem, initialTopValueForInnerLoop);
                if (!innerLoopSuccess) return false;
            }
        }
    }
    return true;
}

function performCalculation(){
  const dataSize = retrieveNextNumber();
  const dataSequence = extractNumbers(dataSize);

  let lowerBound = 0;
  let upperBound = dataSize;

  while (upperBound - lowerBound > 1) {
    const midValue = Math.floor((upperBound + lowerBound) / 2);
    if (checkCondition(midValue, dataSequence)) {
      upperBound = midValue;
    } else {
      lowerBound = midValue;
    }
  }
  return upperBound;
}

const executionResult = performCalculation();
if (executionResult !== undefined) console.log(String(executionResult));