let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

let lineSegments = rawData.trim().split("\n");

while (true) {
    let dimensionsLine = lineSegments.shift();

    if (dimensionsLine === "0 0") {
        break;
    }

    let sizeParts = dimensionsLine.split(" ").map(Number);
    let arenaWidth = sizeParts[0];
    let arenaHeight = sizeParts[1];

    let roverPosition = [0, 1, 1];

    while (true) {
        let instructionParts = lineSegments.shift().split(" ");

        if (instructionParts.length === 2) {
            instructionParts[1] = Number(instructionParts[1]);
        }

        if (instructionParts[0] === "STOP") {
            break;
        }

        if (instructionParts[0] === "RIGHT") {
            roverPosition[0]++;
            if (roverPosition[0] === 4) {
                roverPosition[0] = 0;
            }
        }

        if (instructionParts[0] === "LEFT") {
            roverPosition[0]--;
            if (roverPosition[0] === -1) {
                roverPosition[0] = 3;
            }
        }

        if (instructionParts[0] === "FORWARD") {
            while (instructionParts[1]--) {
                if (roverPosition[0] === 0) roverPosition[2]++;
                if (roverPosition[0] === 1) roverPosition[1]++;
                if (roverPosition[0] === 2) roverPosition[2]--;
                if (roverPosition[0] === 3) roverPosition[2]--;
            }
        }

        if (instructionParts[0] === "BACKWARD") {
            while (instructionParts[1]--) {
                if (roverPosition[0] === 0) roverPosition[2]--;
                if (roverPosition[0] === 1) roverPosition[1]--;
                if (roverPosition[0] === 2) roverPosition[2]++;
                if (roverPosition[0] === 3) roverPosition[1]++;
            }
        }

        if (roverPosition[1] < 1) roverPosition[1] = 1;
        if (roverPosition[2] < 1) roverPosition[2] = 1;
        if (roverPosition[1] > arenaWidth) roverPosition[1] = arenaWidth;
        if (roverPosition[2] > arenaHeight) roverPosition[2] = arenaHeight;
    }

    roverPosition.shift();
    console.log(roverPosition.join(" "));
}