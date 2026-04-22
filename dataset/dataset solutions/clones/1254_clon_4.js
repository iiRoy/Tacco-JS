let acquiredContent = "";

const dataReceiver = (portion) => {
    acquiredContent += portion;
};

const completionHandler = () => {
    const contentLines = acquiredContent.split("\n");
    const numericalStrings = contentLines[1].split(" ");

    const numericValues = numericalStrings.map(val => +val);

    const analysisResult = numericValues.reduce((accumulator, currentValue) => {
        accumulator.minVal = Math.min(accumulator.minVal, currentValue);
        accumulator.maxVal = Math.max(accumulator.maxVal, currentValue);
        accumulator.totalSum += currentValue;
        return accumulator;
    }, { minVal: Infinity, maxVal: -Infinity, totalSum: 0 });

    console.log(`${analysisResult.minVal} ${analysisResult.maxVal} ${analysisResult.totalSum}`);
};

process.stdin.resume();
process.stdin.setEncoding('utf-8');
process.stdin.on('data', dataReceiver);
process.stdin.on('end', completionHandler);