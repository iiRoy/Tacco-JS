let rawInputBuffer = '';
let inputTokenizer;

function createInputScanner(tokenArray) {
    let currentPosition = 0;
    return {
        retrieveNumber: () => {
            if (currentPosition >= tokenArray.length) {
                return null;
            }
            return +tokenArray[currentPosition++];
        },
        retrieveString: () => {
            if (currentPosition >= tokenArray.length) {
                return null;
            }
            return tokenArray[currentPosition++];
        }
    };
}

function checkExistenceRecursive(dataArr, targetVal, lowerBound, upperBound) {
    if (lowerBound > upperBound) {
        return false;
    }
    const midPoint = Math.floor((lowerBound + upperBound) / 2);
    if (dataArr[midPoint] === targetVal) {
        return true;
    } else if (dataArr[midPoint] < targetVal) {
        return checkExistenceRecursive(dataArr, targetVal, midPoint + 1, upperBound);
    } else {
        return checkExistenceRecursive(dataArr, targetVal, lowerBound, midPoint - 1);
    }
}

function processDataSets() {
    let firstCollectionSize;
    while ((firstCollectionSize = inputTokenizer.retrieveNumber()) !== null) {
        const secondCollectionSize = inputTokenizer.retrieveNumber();

        const firstCollection = Array.from({ length: firstCollectionSize }, () => inputTokenizer.retrieveNumber());
        const secondCollection = Array.from({ length: secondCollectionSize }, () => inputTokenizer.retrieveNumber());

        firstCollection.sort((val1, val2) => val1 - val2);
        secondCollection.sort((val1, val2) => val1 - val2);

        const sumFirst = firstCollection.reduce((accumulator, current) => accumulator + current, 0);
        const sumSecond = secondCollection.reduce((accumulator, current) => accumulator + current, 0);

        const requiredDifference = Math.floor((sumSecond - sumFirst) / 2);

        if ((sumSecond - sumFirst) % 2 !== 0) {
            outputValue(-1);
        } else {
            let matchFound = false;
            firstCollection.some(itemA => {
                const targetValue = itemA + requiredDifference;
                if (checkExistenceRecursive(secondCollection, targetValue, 0, secondCollection.length - 1)) {
                    outputValue(`${itemA} ${targetValue}`);
                    matchFound = true;
                    return true;
                }
                return false;
            });

            if (!matchFound) {
                outputValue(-1);
            }
        }
    }
}

function outputValue(value) {
    console.log(value);
}

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
    rawInputBuffer += chunk;
});
process.stdin.on('end', function() {
    const tokens = rawInputBuffer.trim().split(/\s+/);
    inputTokenizer = createInputScanner(tokens);
    processDataSets();
});
