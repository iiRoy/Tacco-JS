const data = require("fs")
    .readFileSync(0, "utf8")
    .trim()
    .split(/\s+/)
    .map(Number);

const crystalCount = data.shift();
const crystals = data.slice(0, crystalCount);

const maximumEnergy = Array(crystalCount + 1).fill(0);
const decisions = Array(crystalCount).fill("ignore");

if (crystalCount > 0) {
    maximumEnergy[1] = crystals[0];
    decisions[0] = "steal";
}

for (let position = 2; position <= crystalCount; position++) {
    const currentCrystal = crystals[position - 1];

    const energyIfIgnored =
        maximumEnergy[position - 1];

    const energyIfStolen =
        maximumEnergy[position - 2] + currentCrystal;

    if (energyIfStolen > energyIfIgnored) {
        maximumEnergy[position] = energyIfStolen;
        decisions[position - 1] = "steal";
    } else {
        maximumEnergy[position] = energyIfIgnored;
    }
}

const result = maximumEnergy.at(-1);

process.stdout.write(String(result));