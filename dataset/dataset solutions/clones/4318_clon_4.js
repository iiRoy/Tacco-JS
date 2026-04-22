const digitAggregator = (textualData) => {
    const numericAccumulation = [...textualData].reduce((currentTotal, characterToken) => {
        return currentTotal + (characterToken.charCodeAt(0) - '0'.charCodeAt(0));
    }, 0);
    return numericAccumulation;
};

const processedInput = require("fs").readFileSync("/dev/stdin", "utf8").trim();
console.log(digitAggregator(processedInput));