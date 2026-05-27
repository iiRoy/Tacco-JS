const processInput = (rawData) => {
    const parseInputNumbers = (inputString) => {
        return inputString.split(' ').map(strVal => parseInt(strVal, 10));
    };

    let numericValues = parseInputNumbers(rawData);

    numericValues.sort((a, b) => b - a);

    const firstLargest = numericValues[0];
    const secondLargest = numericValues[1];
    const thirdLargest = numericValues[2];

    const combinedString = String(firstLargest) + String(secondLargest);
    
    const combinedParsedInt = parseInt(combinedString, 10);
    
    const finalSumResult = combinedParsedInt + thirdLargest;

    console.log(finalSumResult);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
