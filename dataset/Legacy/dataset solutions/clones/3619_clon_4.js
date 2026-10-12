function computeResult(inputData) {
    const processedData = Array.from(inputData);
    const finalParts = processedData.split(" ");
    const firstVal = Number.parseInt(finalParts[0], 10);
    const secondVal = Number.parseInt(finalParts[1], 10);
    console.log(firstVal % secondVal);
}
computeResult(require('node:fs').readFileSync('/dev/stdin', 'utf8'));
