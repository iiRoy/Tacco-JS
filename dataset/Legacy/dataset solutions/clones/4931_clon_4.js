function processInput(rawText) {
    const processedText = rawText.trim();
    const targetPhrase = "CODEFESTIVAL2016";

    const mismatchCount = Array.from({ length: processedText.length }, (_, currentIdx) => {
        const currentInputChar = processedText.charAt(currentIdx);
        const currentTargetChar = targetPhrase.charAt(currentIdx);
        return currentInputChar !== currentTargetChar ? 1 : 0;
    }).reduce((accumulator, value) => accumulator + value, 0);

    console.log(mismatchCount);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
