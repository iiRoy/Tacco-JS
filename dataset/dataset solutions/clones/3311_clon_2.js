function ProcessInput(rawData) {
    rawData = rawData
        .trim()
        .split("\n")
        .map(function(item) {
            return item.split(" ");
        });

    let stringA = rawData[0][0].split("");
    let stringB = rawData[1][0].split("");


    let dpTable = [];
    for (let rowIdx = 0; rowIdx <= stringB.length; rowIdx++) {
        dpTable.push([]);
        dpTable[rowIdx][0] = 0;
    }
    for (let colIdx = 0; colIdx <= stringA.length; colIdx++) {
        dpTable[0][colIdx] = 0;
    }
    for (let rowIdx = 0; rowIdx < stringB.length; rowIdx++) {
        for (let colIdx = 0; colIdx < stringA.length; colIdx++) {
            if (stringA[colIdx] === stringB[rowIdx]) {
                dpTable[rowIdx + 1][colIdx + 1] = dpTable[rowIdx][colIdx] + 1;
            } else {
                dpTable[rowIdx + 1][colIdx + 1] = Math.max(dpTable[rowIdx + 1][colIdx], dpTable[rowIdx][colIdx + 1]);
            }
        }
    }
    let lcsLength = dpTable[stringB.length][stringA.length];
    let currRowPos = stringB.length;
    let currColPos = stringA.length;
    let foundChar;
    let resultChars = [];
    for (let k = 0; k < lcsLength; k++) {
        for (let colSearch = currColPos; colSearch >= 1; colSearch--) {
            if (dpTable[currRowPos][colSearch] > dpTable[currRowPos][colSearch - 1]) {
                currColPos = colSearch - 1;
                break;
            }
        }
        foundChar = stringA[currColPos];
        for (let rowSearch = currRowPos; rowSearch >= 1; rowSearch--) {
            if (stringB[rowSearch - 1] === foundChar) {
                resultChars.push(foundChar);
                currRowPos = rowSearch - 1;
                break;
            }
        }
    }
    console.log(resultChars.reverse().join(""));
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));