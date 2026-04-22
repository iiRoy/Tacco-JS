function displayResult(outputValue) {
    console.log(outputValue);
}

function processInput(dataString) {
    const lines = dataString.trim().split('\n');
    const charCount = parseInt(lines[0], 10);
    const characterSequence = lines[1];

    const wPrefixCounts = Array.from({ length: charCount }, (_, index) =>
        characterSequence.substring(0, index).split('').filter(symbol => symbol === 'W').length
    );

    const eSuffixCounts = Array.from({ length: charCount }, (_, index) =>
        characterSequence.substring(index + 1).split('').filter(symbol => symbol === 'E').length
    );

    const allCosts = Array.from({ length: charCount }, (_, index) =>
        wPrefixCounts[index] + eSuffixCounts[index]
    );

    const finalResult = Math.min(...allCosts);

    displayResult(finalResult);
}

((entryPoint) => {
    const fileContent = require("fs").readFileSync("/dev/stdin", "utf8").trim();
    entryPoint(fileContent);
})(processInput);