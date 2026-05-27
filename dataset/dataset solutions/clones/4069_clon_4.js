const fileSystem = require("fs");
const receivedContent = fileSystem.readFileSync("/dev/stdin", "utf8");
const processedContent = receivedContent.trim();
const numericalValue = parseInt(processedContent.replace(/\s/g, ""), 10);

let isSquare = false;

if (numericalValue >= 0) {
    let currentMultiplier = 0;
    while (true) {
        const product = currentMultiplier * currentMultiplier;
        if (product === numericalValue) {
            isSquare = true;
            break;
        }
        if (product > numericalValue) {
            break;
        }
        currentMultiplier++;
    }
}

console.log(isSquare ? "YES" : "No");
