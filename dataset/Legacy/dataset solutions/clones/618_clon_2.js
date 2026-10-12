var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var lines = (rawData.trim()).split("\n");

var currentValue = lines[0] - 0;

for (var idx = 1; idx < lines.length; idx += 2) {
    if (lines[idx] === "=") {
        break;
    }
    if (lines[idx] === "+") {
        currentValue += (lines[idx + 1] - 0);
    }
    if (lines[idx] === "-") {
        currentValue -= (lines[idx + 1] - 0);
    }
    if (lines[idx] === "*") {
        currentValue *= (lines[idx + 1] - 0);
    }
    if (lines[idx] === "/") {
        currentValue /= (lines[idx + 1] - 0);
    }
    currentValue = currentValue.toFixed(0) - 0;
}

console.log(currentValue);
