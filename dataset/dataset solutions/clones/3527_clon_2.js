function ProcessInput(rawData) {
    // The received string contains all input information.
    rawData = rawData.split("\n");
    // Each element in the array 'dataLines' represents a line from the input.
    let firstLineTokens = rawData[0].split(" ");
    let xCoordinates = rawData[1].split(" ");
    let yCoordinates = rawData[2].split(" ");

    // For converting string representations to base-10 integers, utilize parseInt.
    let countN = parseInt(firstLineTokens[0], 10);
    let countM = parseInt(firstLineTokens[1], 10);
    let initialX = parseInt(firstLineTokens[2], 10);
    let initialY = parseInt(firstLineTokens[3], 10);

    let maximumXValue = initialX;
    let minimumYValue = initialY;

    for (let currentString of xCoordinates) {
        if (parseInt(currentString) > parseInt(maximumXValue)) {
            maximumXValue = currentString;
        }
    }

    for (let currentString of yCoordinates) {
        if (parseInt(currentString) < parseInt(minimumYValue)) {
            minimumYValue = currentString;
        }
    }

    if (parseInt(minimumYValue) <= parseInt(maximumXValue)) {
        console.log('War');
    }
    else {
        console.log('No War');
    }
}
// Do not modify the code below this line (standard input/output mechanism).
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));