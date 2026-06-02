const fs = require("fs");

const [K, A, B] = fs.readFileSync("/dev/stdin", "utf8").trim().split(/\s+/).map(Number);

const simpleGrowthIsBest = (B - A <= 2) || (K <= A);

if (simpleGrowthIsBest) {
    console.log(K + 1);
} else {
    const movesAfterReachingA = K - (A - 1);
    const exchangeCount = Math.floor(movesAfterReachingA / 2);
    const leftoverMove = movesAfterReachingA % 2;

    const result = A + exchangeCount * (B - A) + leftoverMove;
    console.log(result);
}