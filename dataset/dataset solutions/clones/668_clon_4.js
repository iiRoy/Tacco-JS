const tokens = require("fs")
    .readFileSync(0, "utf8")
    .trim()
    .split(/\s+/)
    .map(Number);

const amount = tokens.shift();
const museumHall = tokens.slice(0, amount);
const rememberedResults = new Map();

function infiltrate(showcase) {
    if (showcase >= museumHall.length) {
        return 0;
    }

    if (rememberedResults.has(showcase)) {
        return rememberedResults.get(showcase);
    }

    const escapeWithoutTaking =
        infiltrate(showcase + 1);

    const deactivateAndTake =
        museumHall[showcase] + infiltrate(showcase + 2);

    const mostProfitableRoute =
        deactivateAndTake > escapeWithoutTaking
            ? deactivateAndTake
            : escapeWithoutTaking;

    rememberedResults.set(showcase, mostProfitableRoute);

    return mostProfitableRoute;
}

const stolenEnergy = infiltrate(0);

console.log(stolenEnergy);