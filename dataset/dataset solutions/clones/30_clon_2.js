// Verified with Node.js runtime environment v16.14.0

const fileSystem = require("fs");

function calculateCompoundInterest ( iterations ) {
    let principalAmount = 100;

    for ( let counter = 0; counter < iterations; counter++ ) {
        principalAmount = Math.ceil(principalAmount * 1.05);
    }

    return principalAmount * 1000;
}

const rawData = fileSystem.readFileSync('/dev/stdin')
                          .toString()
                          .trim();

console.log(calculateCompoundInterest(Number.parseInt(rawData)));