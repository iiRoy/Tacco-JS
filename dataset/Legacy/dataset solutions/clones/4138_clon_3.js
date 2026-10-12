function calculateGrowthSteps(inputString) {
    const NEWLINE_SEPARATOR = "\n";
    const VALUE_SEPARATOR = " ";

    var inputLines = inputString.split(NEWLINE_SEPARATOR);
    var firstLineParts = inputLines[0].split(VALUE_SEPARATOR);

    const [initialValueStr, targetValueStr] = firstLineParts;

    var initialValue = Number(initialValueStr);
    var targetValue = Number(targetValueStr);

    const growthRatio = targetValue / initialValue;

    const logBase2OfRatio = Math.log(growthRatio) / Math.log(2);

    var requiredSteps = Math.floor(logBase2OfRatio) + 1;

    console.log(requiredSteps);
}

calculateGrowthSteps(require("fs").readFileSync("/dev/stdin", "utf8"));
