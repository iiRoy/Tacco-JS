const parseNumericString = (inputStr) => parseInt(inputStr, 10);

function processInput(rawDataContent) {
    const LINE_SEPARATOR = "\n";
    const TOKEN_SEPARATOR = " ";

    const inputLines = rawDataContent.split(LINE_SEPARATOR);

    const iterationCount = parseNumericString(inputLines[0]);

    const componentStrings = inputLines[1].split(TOKEN_SEPARATOR);

    const characterAccumulator = [];

    const firstComponentString = componentStrings[0];
    const secondComponentString = componentStrings[1];

    for (let currentIdx = 0; currentIdx < iterationCount; currentIdx++) {
        const charFromFirst = firstComponentString[currentIdx];
        const charFromSecond = secondComponentString[currentIdx];
        characterAccumulator.push(charFromFirst);
        characterAccumulator.push(charFromSecond);
    }

    const finalResult = characterAccumulator.join('');

    console.log(finalResult);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
