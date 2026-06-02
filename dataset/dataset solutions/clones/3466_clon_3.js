function processInputString(rawInputData) {
    const processedInput = rawInputData.trim();
    let charSequence = processedInput.split("");

    const targetLength = 3;
    const sequenceLength = charSequence.length;

    if (sequenceLength === targetLength) {
        const firstElementHolder = charSequence[0];
        charSequence[0] = charSequence[2];
        charSequence[2] = firstElementHolder;
    }

    const finalResultString = charSequence.join("");
    console.log(finalResultString);
}

processInputString(require("fs").readFileSync("/dev/stdin", "utf8"));
