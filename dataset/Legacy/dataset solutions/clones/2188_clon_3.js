process.stdin.resume();
process.stdin.setEncoding("utf8");

var inputDataLines = [];
var inputReader = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
});

inputReader.on("line", (currentLine) => {
    inputDataLines.push(currentLine);
});

inputReader.on("close", () => {
    const firstInputLine = inputDataLines[0];
    const partsOfLine = firstInputLine.split(" ");

    const rawFirstNumberString = partsOfLine[0];
    const rawSecondNumberString = partsOfLine[1];

    const firstValue = Number(rawFirstNumberString);
    let secondValue = Number(rawSecondNumberString);

    const remainderCheck = firstValue % secondValue;
    let finalOutputValue;

    if (remainderCheck === 0) {
        finalOutputValue = firstValue;
    } else {
        let adjustedSecondValue = secondValue - 1;
        finalOutputValue = adjustedSecondValue;
    }
    
    console.log(finalOutputValue);
});
