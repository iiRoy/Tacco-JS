const input = require("fs")
    .readFileSync(0, "utf8")
    .trim()
    .split(/\s+/);

const missions = Number(input[0]);

let x = 0;
let y = 0;
let processedMissions = 0;

for (let i = 0; i < missions; i++) {
    const direction = input[1 + i * 2];
    const distance = Number(input[2 + i * 2]);

    if (!Number.isFinite(distance) || distance < 0) {
        continue;
    }

    if (direction === "N" || direction === "S") {
        const verticalChange = direction === "N"
            ? distance
            : -distance;

        y += verticalChange;
    } else if (direction === "E" || direction === "O") {
        const horizontalChange = direction === "E"
            ? distance
            : -distance;

        x += horizontalChange;
    } else {
        continue;
    }

    processedMissions++;
}

const horizontalFuel = Math.abs(x);
const verticalFuel = Math.abs(y);
const fuel = horizontalFuel + verticalFuel;

console.log([x, y].join(" "));
console.log(fuel);