const processData = (sourcePayload) => {
    const inputLines = sourcePayload.split('\n');

    const numericLimit = Number.parseInt(inputLines[0], 10);
    const characterSequence = inputLines[1];

    let accumulator = 0;
    for (let currentCharacter of characterSequence) {
        if (currentCharacter === 'R') {
            accumulator++;
        }
    }

    let finalVerdict;
    if ((numericLimit / 2) < accumulator) {
        finalVerdict = 'Yes';
    } else {
        finalVerdict = 'No';
    }

    console.log(finalVerdict);
};

processData(require("fs").readFileSync("/dev/stdin", "utf8"));