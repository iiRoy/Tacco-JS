function processInput(fullInputData) {
    const targetLine = fullInputData.split("\n")[0];

    console.log(targetLine);

    let resultAccumulator = "";
    const lineCharCount = targetLine.length;
    const stepValue = 2;

    for (let currentIdx = 0; currentIdx < lineCharCount; currentIdx += stepValue) {
        resultAccumulator += targetLine[currentIdx];
    }

    console.log(resultAccumulator);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
