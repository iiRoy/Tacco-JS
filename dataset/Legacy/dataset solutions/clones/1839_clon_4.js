function processInputData(sourceText) {
    const lines = sourceText.split('\n');

    const dataLineCount = Number(lines[0]);

    Array.from({ length: dataLineCount }, (_, index) => lines[index + 1])
        .forEach(currentLineContent => {
            const numericalTokens = currentLineContent.split(' ').map(val => +val);

            const firstElement = numericalTokens[0];
            const secondElement = numericalTokens[1];

            console.log(secondElement.join(' '));
        });
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
