var outputFn = console.log;

if (typeof process !== "undefined") {
    let rawData = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function (chunk) {
        rawData += chunk;
    });
    process.stdin.on('end', function () {
        processInputData(rawData);
    });
}

function processInputData(rawText) {
    let dataRows = rawText.split("\n");
    dataRows.shift();
    dataRows.pop();
    analyzeData(dataRows);
}

//----- Core data processing logic -----

function analyzeData(dataRows) {
    dataRows.shift();
    dataRows = dataRows.map(function (rowStr) {
        let strNums = rowStr.split(" ");
        let numArr = strNums.map(function (strNumItem) {
            return Number(strNumItem);
        });
        return numArr;
    });

    let dataCollections = [];
    while (dataRows.length > 1) {
        // Grouping two lines into a single collection
        let currentCollection = [];
        currentCollection.push(dataRows.shift());
        currentCollection.push(dataRows.shift());
        dataCollections.push(currentCollection);
    }

    dataCollections.forEach(function (collectionItem) {
        let powerVal = collectionItem[0][1];
        let differences = [];
        collectionItem[1].forEach(function (currentNum, idx, fullArray) {
            if (idx === 0) {
                return;
            } else {
                differences.push(fullArray[idx] - fullArray[idx - 1]);
            }
        });
        differences.sort(function (valA, valB) {
            return valB - valA;
        });
        differences = differences.slice(powerVal - 1);
        if (differences.length > 0) {
            let totalSum = differences.reduce(function (previousVal, currentVal) {
                if (currentVal !== undefined) {
                    return previousVal + currentVal;
                } else {
                    return previousVal === undefined ? 0 : previousVal;
                }
            });
            outputFn(totalSum);
        } else {
            outputFn(0);
        }
    });
}
