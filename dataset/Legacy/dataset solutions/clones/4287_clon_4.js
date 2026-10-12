const acquireSource = () => require("fs").readFileSync("/dev/stdin", "utf8").trim();
const presentResult = (content) => console.log(content);
const signalIssue = (content) => console.error(content);

const transformData = (source, conversionType) => {
    const conversionStrategies = {
        0: (s) => s,
        1: (s) => parseInt(s, 10),
        2: (s) => s.split(" "),
        3: (s) => s.split("\n"),
        4: (s) => s.split(" ").map(Number),
        5: (s) => s.split("\n").map(Number),
        6: (s) => s.split(""),
        7: (s) => s.split("").map(Number),
    };
    return conversionStrategies[conversionType](source);
};

const processInput = (rawInput) => {
    const lines = transformData(rawInput, 3);
    const countElements = transformData(lines[0], 1);
    const numericSequence = transformData(lines[1], 4);

    const totalCombinations = Math.pow(3, countElements);

    const evenProductFactor = numericSequence.reduce((accumulator, currentNumber) => {
        return accumulator * (currentNumber % 2 === 0 ? 2 : 1);
    }, 1);

    presentResult(totalCombinations - evenProductFactor);
};

processInput(acquireSource());
