const fileSystem = require('fs');

const TARGET_DIVISOR = 2019;

const isDivisible = (value, divisor) => {
    return value % divisor === 0;
};

let sourceData = fileSystem.readFileSync('/dev/stdin', 'utf8');

const dataLength = sourceData.length;

let matchCount = 0;

for (let startIdx = 0; startIdx < dataLength; startIdx++) {
    for (let endIdx = startIdx + 4; endIdx < dataLength; endIdx++) {
        let currentSubstring = sourceData.substring(startIdx, endIdx);
        let currentNum = parseInt(currentSubstring, 10);
        
        if (isDivisible(currentNum, TARGET_DIVISOR)) {
            matchCount++;
        }
    }
}

console.log(matchCount);
