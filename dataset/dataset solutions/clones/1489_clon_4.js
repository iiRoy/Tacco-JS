function computeModularPower(baseValue, exponentValue, modulusValue) {
    let resultAccumulator = 1n;
    let baseBig = BigInt(baseValue) % BigInt(modulusValue);
    let exponentBig = BigInt(exponentValue);

    while (exponentBig > 0n) {
        if (exponentBig % 2n === 1n) {
            resultAccumulator = (resultAccumulator * baseBig) % BigInt(modulusValue);
        }
        baseBig = (baseBig * baseBig) % BigInt(modulusValue);
        exponentBig /= 2n;
    }
    return Number(resultAccumulator);
}

const modDivisor = 998244353;

const maxCapacity = 200005; 
const powersOfBaseTen = new Array(maxCapacity);
const cumulativeSumOfOnes = new Array(maxCapacity);

powersOfBaseTen[0] = 1;
cumulativeSumOfOnes[0] = 0;

for (let k = 1; k < maxCapacity; k++) {
    powersOfBaseTen[k] = (powersOfBaseTen[k - 1] * 10) % modDivisor;
    cumulativeSumOfOnes[k] = (BigInt(cumulativeSumOfOnes[k - 1]) * 10n + 1n) % BigInt(modDivisor);
}

for (let k = 0; k < maxCapacity; k++) {
    cumulativeSumOfOnes[k] = Number(cumulativeSumOfOnes[k]);
}

function parseAndProcess(dataSource) {
    const linesOfData = dataSource.trim().split("\n");
    const initialParameters = linesOfData[0].split(" ");
    const totalElements = parseInt(initialParameters[0], 10);
    const operationCount = parseInt(initialParameters[1], 10);

    const outcomeBuffer = [];

    for (let currentOperationIndex = 1; currentOperationIndex <= operationCount; currentOperationIndex++) {
        const operationDetails = linesOfData[currentOperationIndex].split(" ");
        const startIndex = parseInt(operationDetails[0], 10) - 1;
        const endIndex = parseInt(operationDetails[1], 10) - 1;
        const modificationValue = parseInt(operationDetails[2], 10);

        const segmentOneLength = startIndex;
        const segmentTwoLength = endIndex - startIndex + 1;
        const segmentThreeLength = totalElements - endIndex - 1;

        let valueOne = 0;
        if (segmentOneLength > 0) {
            valueOne = cumulativeSumOfOnes[segmentOneLength];
        }
        
        let valueTwo = 0;
        if (segmentTwoLength > 0) {
            valueTwo = (BigInt(cumulativeSumOfOnes[segmentTwoLength]) * BigInt(modificationValue)) % BigInt(modDivisor);
            valueTwo = Number(valueTwo);
        }

        let valueThree = 0;
        if (segmentThreeLength > 0) {
            valueThree = cumulativeSumOfOnes[segmentThreeLength];
        }

        let combinedResult = 0n;
        
        if (segmentOneLength > 0) {
            combinedResult = (BigInt(valueOne) * BigInt(powersOfBaseTen[segmentTwoLength + segmentThreeLength])) % BigInt(modDivisor);
        }
        
        if (segmentTwoLength > 0) {
            combinedResult = (combinedResult + (BigInt(valueTwo) * BigInt(powersOfBaseTen[segmentThreeLength]))) % BigInt(modDivisor);
        }
        
        if (segmentThreeLength > 0) {
            combinedResult = (combinedResult + BigInt(valueThree)) % BigInt(modDivisor);
        }
        
        outcomeBuffer.push(Number(combinedResult));
    }
    return outcomeBuffer.join("\n");
}

console.log(parseAndProcess(require("fs").readFileSync("/dev/stdin", "utf8")));