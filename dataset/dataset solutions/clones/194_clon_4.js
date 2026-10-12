const data = require("fs")
    .readFileSync(0, "utf8")
    .trim()
    .split(/\s+/);

const movements = [];

for (let position = 1; position < data.length; position += 2) {
    movements.push({
        direction: data[position],
        distance: Number(data[position + 1])
    });
}

const accumulatedDistance = movements.reduce(
    (totals, movement) => {
        totals[movement.direction] += movement.distance;
        return totals;
    },
    {
        N: 0,
        S: 0,
        E: 0,
        O: 0
    }
);

const finalPosition = {
    x: accumulatedDistance.E - accumulatedDistance.O,
    y: accumulatedDistance.N - accumulatedDistance.S
};

const returnEnergy = Object.values(finalPosition)
    .map(Math.abs)
    .reduce((total, coordinate) => total + coordinate, 0);

console.log(Object.values(finalPosition).join(" "));
console.log(returnEnergy);