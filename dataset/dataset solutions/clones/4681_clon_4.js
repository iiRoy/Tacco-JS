function processInputData(sourceData) {
    const numericValue = Number(sourceData[0]);
    const discriminantTerm = 1 + 8 * numericValue;
    const positiveSolution = (-1 + Math.sqrt(discriminantTerm)) / 2;
    const finalResult = Math.ceil(positiveSolution);
    console.log(finalResult);
}
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
