function parseInteger(inputString) {
    return parseInt(inputString, 10);
}

function ProcessInput(rawData) {
    const dimensionsStr = rawData.split('\n')[0].split(' ');
    const heightVal = parseInteger(dimensionsStr[0]);
    const widthVal = parseInteger(dimensionsStr[1]);

    if (widthVal === 0x1) {
        return console.log('Yes');
    }

    const charCountsMap = rawData.split('\n').slice(0x1).join('').split('').reduce(function(accumulator, currentChar) {
        if (accumulator[currentChar] === void 0) {
            accumulator[currentChar] = 0x0;
        }
        accumulator[currentChar]++;
        return accumulator;
    }, {});

    if (heightVal % 0x2 === 0x0 && widthVal % 0x2 === 0x0) {
        const nonQuadrupleCount = Object.keys(charCountsMap).filter(function(keyChar) {
            return charCountsMap[keyChar] % 0x4 !== 0x0;
        }).length;
        if (nonQuadrupleCount === 0x0) {
            return console.log('Yes');
        } else {
            return console.log('No');
        }
    }

    if (heightVal % 0x2 !== 0x0 && widthVal % 0x2 !== 0x0) {
        const remainderSum = Object.keys(charCountsMap).filter(function(keyChar) {
            return charCountsMap[keyChar] % 0x4 !== 0x0;
        }).reduce(function(currentSum, keyChar) {
            return currentSum + parseInteger(charCountsMap[keyChar]);
        }, 0x0);
        if (remainderSum % 0x2 === 0x1) {
            return console.log('Yes');
        } else {
            return console.log('No');
        }
    }

    const totalRemainder = Object.keys(charCountsMap).filter(function(keyChar) {
        return charCountsMap[keyChar] % 0x4 !== 0x0;
    }).reduce(function(currentSum, keyChar) {
        return currentSum + parseInteger(charCountsMap[keyChar]);
    }, 0x0);
    if (totalRemainder === 0x0) {
        return console.log('Yes');
    } else {
        return console.log('No');
    }
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
