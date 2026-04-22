const analyzeInputData = (fullContent) => {
    const contentLines = fullContent.split('\n');

    const soughtTerm = contentLines[0].toUpperCase();

    let dataPortion = [];
    for (let i = 1; i < contentLines.length; i++) {
        if (contentLines[i] === "END_OF_TEXT") {
            break;
        }
        dataPortion.push(contentLines[i]);
    }

    const processedTextTokens = dataPortion
        .map(line => line.toUpperCase())
        .join(' ')
        .split(/\s+/)
        .filter(token => token !== '');

    const occurrenceCount = processedTextTokens.filter(item => item === soughtTerm).length;

    return occurrenceCount;
};

const rawDataString = require("fs").readFileSync("/dev/stdin", "utf8");
const finalResult = analyzeInputData(rawDataString);
console.log(finalResult);