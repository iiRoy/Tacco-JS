function evaluateCondition(inputData) {
    const dataSegments = inputData.split('\n');
    const itemCost = parseInt(dataSegments[0], 10);
    const allowance = parseInt(dataSegments[1], 10);

    const requiredRemainder = itemCost - Math.floor(itemCost / 500) * 500;

    const resultText = ["NO", "YES"][+(requiredRemainder <= allowance)];

    console.log(resultText);
}

evaluateCondition(require("fs").readFileSync("/dev/stdin", "utf8"));
