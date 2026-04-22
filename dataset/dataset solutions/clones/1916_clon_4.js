function processInputData(sourceMaterial) {
    const dataLines = sourceMaterial.split('\n');
    const numericKey = Number(dataLines[0]);
    const [lowerLimitString, upperLimitString] = dataLines[1].split(' ');
    const lowerLimit = Number(lowerLimitString);
    const upperLimit = Number(upperLimitString);

    if (lowerLimit === upperLimit) {
        console.log('OK');
        return;
    }

    // This calculates the smallest multiple of 'numericKey' that is greater than or equal to 'lowerLimit'.
    // For example, if lowerLimit=7 and numericKey=3, it calculates Math.ceil(7/3)*3 = 3*3 = 9.
    // If lowerLimit=6 and numericKey=3, it calculates Math.ceil(6/3)*3 = 2*3 = 6.
    // This value will be the first potential candidate for divisibility within the range [lowerLimit, upperLimit].
    let firstSuitableValue = Math.ceil(lowerLimit / numericKey) * numericKey;

    // If this first suitable value is within the upper bound, then such a number exists in the range.
    if (firstSuitableValue <= upperLimit) {
        console.log('OK');
    }
    // The original code does not print 'NG' under any circumstances, so this implementation also omits it.
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));