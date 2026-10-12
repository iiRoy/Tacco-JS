function processInputData(rawData){
    const stringSegments = rawData.split(' ');
    const firstNumericValue = Number.parseInt(stringSegments[0], 10);
    const secondNumericValue = Number.parseInt(stringSegments[1], 10);
    console.log(firstNumericValue + secondNumericValue);
}
processInputData(require("fs").readFileSync("/dev/stdin","utf-8"));
