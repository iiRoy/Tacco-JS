const obtainValue = (textualData) => {
    return Number(textualData.split('\n')[0].split(' ')[0]);
};

const calculateResult = (initialValue) => {
    return (initialValue + (initialValue % 2)) / 2;
};

const processInputAndDisplay = (sourceContent) => {
    const rawNumber = obtainValue(sourceContent);
    const calculatedOutput = calculateResult(rawNumber);
    console.log(calculatedOutput);
};

processInputAndDisplay(require("fs").readFileSync("/dev/stdin", "utf8"));