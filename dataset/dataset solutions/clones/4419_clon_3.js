function processInputData(rawInputString) {
    const inputLines = rawInputString.split("\n");

    const firstDataLine = inputLines[0];

    const lineParts = firstDataLine.split(" ");

    const valA = Number(lineParts[0]);
    const valB = Number(lineParts[1]);
    const valC = Number(lineParts[2]);
    const valD = Number(lineParts[3]);

    const intermediateDifference = valB - valC;
    const finalCalculatedValue = intermediateDifference - valA;

    let outputResult;
    if (valB < valC) {
        outputResult = 0;
    } else {
        outputResult = finalCalculatedValue;
    }

    console.log(outputResult);
}

const stdinContent = require("fs").readFileSync("/dev/stdin", "utf8");

processInputData(stdinContent);
