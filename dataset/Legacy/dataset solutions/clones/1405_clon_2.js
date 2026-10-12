const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

let lineBuffer = rawData.trim().split("\n");

let outputAccumulator = "";

while (true) {
    let currentLine = lineBuffer.shift();

    if (currentLine === "0 0") {
        break;
    }

    const dimensions = currentLine.split(" ").map(Number);

    outputAccumulator += Array(dimensions[0] + 1).join((Array(dimensions[1] + 1).join("#")) + "\n");
    outputAccumulator += "\n";
}

console.log(outputAccumulator.trim());
