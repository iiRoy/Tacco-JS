const processData = (sourceText) => {
    const numericValues = sourceText.trim().split(" ").reduce((accumulator, currentString) => {
        accumulator.push(Number(currentString));
        return accumulator;
    }, []);

    const [firstValue, secondValue, thirdValue] = numericValues;

    const calculatedSum = -firstValue + secondValue + thirdValue;
    const adjustedSum = Math.max(0, calculatedSum);

    const minimumOfTwo = Math.min(secondValue, thirdValue);

    return `${minimumOfTwo} ${adjustedSum}`;
};

const runApplication = (filePath) => {
    const fileContent = require("fs").readFileSync(filePath, "utf8");
    console.log(processData(fileContent));
};

runApplication("/dev/stdin");
