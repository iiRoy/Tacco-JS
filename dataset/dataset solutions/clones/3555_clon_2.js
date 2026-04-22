const ExecuteProgram = function (rawData) {
    let linesOfData = rawData.split('\n');

    const firstLineNumbers = linesOfData[0].split(' ').map(Number);
    const targetValue = firstLineNumbers[1];

    let absoluteDifferences = linesOfData[1]
        .split(' ')
        .map(Number)
        .map(function (currentNumber) {
            return Math.abs(targetValue - currentNumber);
        });

    console.log(calculateArrayGCD(absoluteDifferences));
};

function calculateArrayGCD(numberList) {
    if (numberList.length === 1) {
        return numberList[0];
    }
    if (numberList.length === 2) {
        return findGreatestCommonDivisor(numberList[0], numberList[1]);
    }

    numberList.push(findGreatestCommonDivisor(numberList.pop(), numberList.pop()));
    return calculateArrayGCD(numberList);
}

function findGreatestCommonDivisor(numA, numB) {
    if (numA < numB) {
        return findGreatestCommonDivisor(numB, numA);
    }
    if (numB === 0) {
        return numA;
    }
    return findGreatestCommonDivisor(numB, numA % numB);
}

ExecuteProgram(
    require("fs").readFileSync(
        "/dev/stdin",
        "utf8"
    )
);