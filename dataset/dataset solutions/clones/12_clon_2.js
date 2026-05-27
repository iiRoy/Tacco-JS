function ProcessInput(rawData) {
    // This function processes the raw input data line by line.
    const inputLines = rawData.split("\n");

    for (let lineIndex in inputLines) {
        const numberStrings = inputLines[lineIndex].split(" ");
        const totalValue = Number(numberStrings[0]) + Number(numberStrings[1]);
        console.log(totalValue.toString().length);
    }
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
