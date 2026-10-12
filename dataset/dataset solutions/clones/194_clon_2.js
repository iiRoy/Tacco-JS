const tokens = require("fs")
    .readFileSync(0, "utf8")
    .trim()
    .split(/\s+/);

const instructionCount = Number(tokens[0]);

let horizontalPosition = 0;
let verticalPosition = 0;

for (let instructionIndex = 0; instructionIndex < instructionCount; instructionIndex++) {
    const movementDirection = tokens[1 + instructionIndex * 2];
    const movementLength = Number(tokens[2 + instructionIndex * 2]);

    switch (movementDirection) {
        case "N":
            verticalPosition += movementLength;
            break;
        case "S":
            verticalPosition -= movementLength;
            break;
        case "E":
            horizontalPosition += movementLength;
            break;
        case "O":
            horizontalPosition -= movementLength;
            break;
    }
}

const requiredEnergy =
    Math.abs(horizontalPosition) + Math.abs(verticalPosition);

console.log(`${horizontalPosition} ${verticalPosition}`);
console.log(requiredEnergy);