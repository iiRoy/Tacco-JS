var dataInput = require('fs').readFileSync('/dev/stdin', 'utf8');

var lineArray = dataInput.trim().split("\n");

while (true) {
    var dimensionsStr = lineArray.shift();

    if (dimensionsStr === "0 0") {
        break;
    }

    var parsedDims = dimensionsStr.split(" ").map(Number);
    var widthVal = parsedDims[0];
    var heightVal = parsedDims[1];

    var currentPosAndDir = [0, 1, 1]; // [direction, x-coordinate, y-coordinate]

    while (true) {
        var commandParts = lineArray.shift().split(" ");

        if (commandParts.length === 2) {
            commandParts[1] = commandParts[1] - 0;
        }

        if (commandParts[0] === "STOP") {
            break;
        }

        if (commandParts[0] === "RIGHT") {
            currentPosAndDir[0]++;
            if (currentPosAndDir[0] === 4) {
                currentPosAndDir[0] = 0;
            }
        }

        if (commandParts[0] === "LEFT") {
            currentPosAndDir[0]--;
            if (currentPosAndDir[0] === -1) {
                currentPosAndDir[0] = 3;
            }
        }

        if (commandParts[0] === "FORWARD") {
            while (commandParts[1]--) {
                if (currentPosAndDir[0] === 0) { // North
                    currentPosAndDir[2]++;
                }
                if (currentPosAndDir[0] === 1) { // East
                    currentPosAndDir[1]++;
                }
                if (currentPosAndDir[0] === 2) { // South
                    currentPosAndDir[2]--;
                }
                if (currentPosAndDir[0] === 3) { // West (original code decreases y, preserving this)
                    currentPosAndDir[2]--;
                }
            }
        }

        if (commandParts[0] === "BACKWARD") {
            while (commandParts[1]--) {
                if (currentPosAndDir[0] === 0) { // North, move backward (South)
                    currentPosAndDir[2]--;
                }
                if (currentPosAndDir[0] === 1) { // East, move backward (West)
                    currentPosAndDir[1]--;
                }
                if (currentPosAndDir[0] === 2) { // South, move backward (North)
                    currentPosAndDir[2]++;
                }
                if (currentPosAndDir[0] === 3) { // West, move backward (East)
                    currentPosAndDir[1]++;
                }
            }
        }

        if (currentPosAndDir[1] < 1) {
            currentPosAndDir[1] = 1;
        }
        if (currentPosAndDir[2] < 1) {
            currentPosAndDir[2] = 1;
        }
        if (currentPosAndDir[1] > widthVal) {
            currentPosAndDir[1] = widthVal;
        }
        if (currentPosAndDir[2] > heightVal) {
            currentPosAndDir[2] = heightVal;
        }
    }

    currentPosAndDir.shift(); // Remove the direction component

    console.log(currentPosAndDir.join(" "));
}
