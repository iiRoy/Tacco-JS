function ProcessInput(inputString) {
    let linesArray = inputString.split("\n");
    let firstLineParts = linesArray[0].split(" ");
    let numericValues = linesArray[1].split(" ");

    numericValues[0] = parseInt(numericValues[0]);
    numericValues[1] = parseInt(numericValues[1]);

    if (firstLineParts[0] === linesArray[2]) {
        numericValues[0]--;
    } else {
        numericValues[1]--;
    }

    console.log(numericValues[0] + " " + numericValues[1]);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
