const processInputText = (sourceInput) => {
    const charSequence = Array.from(sourceInput);

    const secondElement = charSequence[1];
    const lastElement = charSequence[charSequence.length - 1];
    const innerSegmentSize = charSequence.length - 2;

    console.log(`${secondElement}${innerSegmentSize}${lastElement}`);
};

processInputText(require("fs").readFileSync("/dev/stdin", "utf8"));
