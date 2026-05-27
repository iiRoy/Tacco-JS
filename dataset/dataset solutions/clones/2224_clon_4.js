function ProcessInputData(rawText) {
    const [firstLine, secondLine, thirdLine] = rawText.split('\n');

    const valA = parseInt(firstLine, 10);

    const [valB, valC] = secondLine.split(' ').map(segment => parseInt(segment, 10));

    const finalStr = thirdLine;

    const totalSum = valA + valB + valC;

    console.log('%d %s', totalSum, finalStr);
}

ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
