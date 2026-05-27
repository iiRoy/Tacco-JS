const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

let lineSegments = rawData.trim().split("\n");

let currentValue = Number(lineSegments[0]);

for (let idx = 1; idx < lineSegments.length; idx += 2) {
    if (lineSegments[idx] === "=") {
        break;
    }

    const operandValue = Number(lineSegments[idx + 1]);

    if (lineSegments[idx] === "+") {
        currentValue += operandValue;
    } else if (lineSegments[idx] === "-") {
        currentValue -= operandValue;
    } else if (lineSegments[idx] === "*") {
        currentValue *= operandValue;
    } else if (lineSegments[idx] === "/") {
        currentValue /= operandValue;
    }

    currentValue = parseInt(currentValue);
}

console.log(currentValue);
