const processInput = (rawText) => {
    const lines = rawText.split('\n');
    const numericStrings = lines[1].split(' ');
    return numericStrings.map(Number);
};

const calculateAdjustedSum = (numbers) => {
    const negativeCount = numbers.filter(n => n < 0).length;
    const containsZero = numbers.some(n => n === 0);

    const absoluteValues = numbers.map(Math.abs);
    const sumOfAbsolutes = absoluteValues.reduce((accumulator, current) => accumulator + current, 0);

    const requiresAdjustment = !containsZero && (negativeCount % 2 !== 0);

    if (requiresAdjustment) {
        const smallestAbsolute = Math.min(...absoluteValues);
        return sumOfAbsolutes - (2 * smallestAbsolute);
    } else {
        return sumOfAbsolutes;
    }
};

const entryPoint = (sourceText) => {
    const parsedNumbers = processInput(sourceText);
    const finalResult = calculateAdjustedSum(parsedNumbers);
    console.log(finalResult);
};

entryPoint(require("fs").readFileSync("/dev/stdin", "utf8"));
