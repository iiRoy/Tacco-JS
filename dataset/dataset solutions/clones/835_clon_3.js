const data = require("fs")
    .readFileSync(0, "utf8")
    .trim()
    .split(/\s+/)
    .map(Number);

const packageCount = data[0];
const capacity = data[1];
const packages = data.slice(2, 2 + packageCount);

const completedLoads = [];
let currentLoad = 0;

for (let i = 0; i < packages.length; i++) {
    const packageWeight = packages[i];
    const fitsInCurrentTrip =
        currentLoad + packageWeight <= capacity;

    if (fitsInCurrentTrip) {
        currentLoad = currentLoad + packageWeight;
        continue;
    }

    completedLoads.push(currentLoad);
    currentLoad = packageWeight;
}

if (currentLoad !== 0) {
    completedLoads.push(currentLoad);
}

const trips = completedLoads.length;
const heaviestLoad =
    completedLoads.length === 0
        ? 0
        : Math.max(...completedLoads);

console.log(`${trips}\n${heaviestLoad}`);