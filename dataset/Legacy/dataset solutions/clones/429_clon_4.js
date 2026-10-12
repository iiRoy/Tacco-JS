const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
let inputLines = fileContent.trim().split('\n');

const transformA = (dataArray) => {
    const targetIndex = dataArray.slice(1, -1).findIndex(val => val === 0);
    if (targetIndex !== -1) {
        dataArray[targetIndex + 1] = 'A';
    }
    return dataArray;
};

function* generateReverseIndices(arrLength) {
    for (let k = arrLength - 2; k >= 1; k--) {
        yield k;
    }
}

const transformB = (dataArray) => {
    let modified = false;
    for (const currentIdx of generateReverseIndices(dataArray.length)) {
        if (dataArray[currentIdx] === 0 && dataArray[currentIdx - 1] !== 'A' && dataArray[currentIdx + 1] !== 'A') {
            dataArray[currentIdx] = 'B';
            modified = true;
            break;
        }
    }

    if (!modified) {
        const forwardSearchIndex = dataArray.slice(1, -1).findIndex(val => val === 0);
        if (forwardSearchIndex !== -1) {
            dataArray[forwardSearchIndex + 1] = 'B';
        }
    }
    return dataArray;
};

const transformC = (dataArray, originalLength) => {
    const foundAndModified = dataArray.slice(1, -1).some((val, idx) => {
        const actualIdx = idx + 1;
        if (val !== 0) {
            if (dataArray[actualIdx + 1] === 0) {
                dataArray[actualIdx + 1] = 'C';
                return true;
            }
            if (dataArray[actualIdx - 1] === 0) {
                dataArray[actualIdx - 1] = 'C';
                return true;
            }
        }
        return false;
    });

    if (!foundAndModified) {
        const targetOffset = (originalLength % 2 === 1) ? (originalLength - 1) / 2 : originalLength / 2;
        dataArray[targetOffset + 1] = 'C';
    }
    return dataArray;
};

const calculateZeroSpan = (dataArray, centerIndex) => {
    let leftPtr = centerIndex;
    let rightPtr = centerIndex;
    let spanCount = 0;

    while (true) {
        const leftBoundaryHit = dataArray[leftPtr] === 'X' || (dataArray[leftPtr] !== 0 && dataArray[leftPtr] !== 'X');
        const rightBoundaryHit = dataArray[rightPtr] === 'X' || (dataArray[rightPtr] !== 0 && dataArray[rightPtr] !== 'X');

        if (leftBoundaryHit && rightBoundaryHit) {
            break;
        }

        if (!leftBoundaryHit) {
            leftPtr--;
        }
        if (!rightBoundaryHit) {
            rightPtr++;
        }
        spanCount++;
    }
    return spanCount;
};

const transformD = (dataArray) => {
    let maxSpanInfo = { index: 0, count: 0 };

    dataArray.slice(1, -1).forEach((val, idx) => {
        const actualIdx = idx + 1;
        if (val === 0) {
            const currentSpan = calculateZeroSpan(dataArray, actualIdx);
            if (currentSpan > maxSpanInfo.count) {
                maxSpanInfo = { index: actualIdx, count: currentSpan };
            }
        }
    });

    if (maxSpanInfo.index !== 0 && maxSpanInfo.count !== 0) {
        dataArray[maxSpanInfo.index] = 'D';
        return dataArray;
    }

    const firstZeroIndex = dataArray.slice(1, -1).findIndex(val => val === 0);
    if (firstZeroIndex !== -1) {
        dataArray[firstZeroIndex + 1] = 'D';
    }
    return dataArray;
};

const commandDispatch = new Map([
    ['A', transformA],
    ['B', transformB],
    ['C', transformC],
    ['D', transformD]
]);

while (true) {
    const [nVal, mVal] = inputLines.shift().split(' ').map(Number);

    if (nVal === 0 && mVal === 0) break;

    let currentArr = ['X', ...Array(nVal).fill(0), 'X'];

    for (let k = 0; k < mVal; k++) {
        const commandKey = inputLines.shift();
        const handler = commandDispatch.get(commandKey);
        if (handler) {
            currentArr = (commandKey === 'C') ? handler(currentArr, nVal) : handler(currentArr);
        }
    }

    const finalOutput = currentArr.slice(1, -1).map(val => (val === 0 ? '#' : val)).join('');
    console.log(finalOutput);
}
