process.stdin.resume();
process.stdin.setEncoding('utf8');

function processInputData(rawData) {
    const [firstValue, secondValue, thirdValue] = rawData
        .split('\n')[0]
        .split(' ')
        .map(Number);

    const multiplesUpToSecond = Math.floor(secondValue / thirdValue);
    const multiplesBeforeFirst = Math.floor((firstValue - 1) / thirdValue);
    
    const finalCount = multiplesUpToSecond - multiplesBeforeFirst;

    console.log(finalCount);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));