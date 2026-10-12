function processInputData(rawText) {
    const charSequence = rawText.trim().split("");

    const finalSequence = charSequence.length === 3
        ? [charSequence[2], charSequence[1], charSequence[0]]
        : charSequence;

    console.log(finalSequence.join(""));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
