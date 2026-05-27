function processInput(inputString) {
    const numberArray = inputString.split(" ");

    const firstValue = numberArray[0];
    const secondValue = numberArray[1];
    const thirdValue = numberArray[2];

    let matchingPairCount = 0;

    if (firstValue === secondValue) {
        matchingPairCount++;
    }
    if (firstValue === thirdValue) {
        matchingPairCount++;
    }
    if (secondValue === thirdValue) {
        matchingPairCount++;
    }

    if (matchingPairCount === 1) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

const fileData = require("fs").readFileSync("/dev/stdin", "utf8").trim();
processInput(fileData);
