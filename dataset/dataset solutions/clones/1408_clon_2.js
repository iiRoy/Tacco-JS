var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var lineArray = rawData.trim().split("\n");

var outputBuffer = "";

while (true) {
    var currentLine = lineArray.shift();

    if (currentLine === "0 0") {
        break;
    }

    var dimensions = currentLine.split(" ").map(Number);

    outputBuffer += Array(dimensions[0] + 1).join((Array(dimensions[1] + 1).join("#")) + "\n");

    outputBuffer += "\n";
}

console.log(outputBuffer);
