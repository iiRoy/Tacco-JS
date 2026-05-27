if (typeof process !== "undefined") {
    let receivedData = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function (chunk) {
        receivedData += chunk;
    });
    process.stdin.on('end', function () {
        const inputLines = receivedData.split("\n");
        executeProgram(inputLines);
    });
}

const moduloDivisor = 1000000007;

function computePowerModulo(baseValue, powerExponent) {
    let resultAccumulator = 1;
    let currentBase = baseValue % moduloDivisor;

    while (powerExponent > 0) {
        if (powerExponent % 2 === 1) {
            resultAccumulator = (resultAccumulator * currentBase) % moduloDivisor;
        }
        currentBase = (currentBase * currentBase) % moduloDivisor;
        powerExponent = Math.floor(powerExponent / 2);
    }
    return resultAccumulator;
}

function executeProgram(inputLines) {
    const rawInputString = inputLines[0];
    const numericValues = rawInputString.split(" ").map(function(element) {
        return Number(element);
    });
    console.log(computePowerModulo(numericValues[0], numericValues[1]));
}
