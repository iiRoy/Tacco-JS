const input = require("fs")
    .readFileSync(0, "utf8")
    .trim()
    .split(/\s+/)
    .map(Number);

const totalPackages = input.shift();
const maximumCapacity = input.shift();
const weights = input.slice(0, totalPackages);

function organizeFlights(remainingPackages) {
    if (remainingPackages.length === 0) {
        return [];
    }

    let usedCapacity = 0;
    let nextPackage = 0;

    while (
        nextPackage < remainingPackages.length &&
        usedCapacity + remainingPackages[nextPackage] <= maximumCapacity
    ) {
        usedCapacity += remainingPackages[nextPackage];
        nextPackage++;
    }

    const followingFlights = organizeFlights(
        remainingPackages.slice(nextPackage)
    );

    return [usedCapacity, ...followingFlights];
}

const flightLoads = organizeFlights(weights);

const result = flightLoads.reduce(
    (summary, load) => ({
        flights: summary.flights + 1,
        maximumLoad: Math.max(summary.maximumLoad, load)
    }),
    {
        flights: 0,
        maximumLoad: 0
    }
);

console.log(result.flights);
console.log(result.maximumLoad);