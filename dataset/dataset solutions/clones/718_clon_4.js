const fs = require("fs");

const values = fs.readFileSync(0, "utf8").trim().split(/\s+/).map(Number);
const queries = values.filter(function (x) { return x !== 0; });
const limit = queries.length ? Math.max.apply(null, queries) : 0;

function buildNumbers(onlyOdd) {
    const result = [];
    for (let n = 1; ; n++) {
        const value = n * (n + 1) * (n + 2) / 6;
        if (value > limit) break;
        if (!onlyOdd || value % 2 === 1) result.push(value);
    }
    return result;
}

function solve(coins) {
    const best = new Array(limit + 1);
    best.fill(1000000000);
    best[0] = 0;

    for (const coin of coins) {
        for (let sum = coin; sum <= limit; sum++) {
            const candidate = best[sum - coin] + 1;
            if (candidate < best[sum]) best[sum] = candidate;
        }
    }

    return best;
}

const all = solve(buildNumbers(false));
const odd = solve(buildNumbers(true));

const output = [];
for (const n of values) {
    if (n === 0) break;
    output.push(all[n] + " " + odd[n]);
}

process.stdout.write(output.join("\n"));