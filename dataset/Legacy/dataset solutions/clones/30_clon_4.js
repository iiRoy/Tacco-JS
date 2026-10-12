var fileSystemModule = require("fs");

function computeFinancialGrowth(periodCount) {
    const initialCapital = 100;
    // Generate an array of a specific length to drive the reduction process,
    // effectively replacing an imperative loop with a functional iteration.
    const iterationSequence = Array.from({ length: periodCount });

    const finalCapital = iterationSequence.reduce((currentCapital, _, __) => {
        // Apply the compounding growth with ceiling for each period.
        return Math.ceil(currentCapital * 1.05);
    }, initialCapital); // The initial value for the reduction.

    // Apply the final scaling factor.
    return finalCapital * 1000;
}

var rawInputData = fileSystemModule.readFileSync('/dev/stdin').toString().trim();
console.log(computeFinancialGrowth(parseInt(rawInputData)));
