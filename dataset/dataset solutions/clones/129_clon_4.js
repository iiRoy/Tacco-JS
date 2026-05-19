const fs = require("fs");

const resultAccumulator = fs.readFileSync("/dev/stdin", "utf8")
    .split('\n')
    .reduce((currentTotal, inputLine) => {
        const sortedParts = inputLine.split(',').sort();

        // The original logic effectively increments 'b' if the second and third
        // elements (indices 1 and 2) of the sorted array are not equal.
        // The 'a' counter in the original code is never incremented.
        if (sortedParts[1] !== sortedParts[2]) {
            return currentTotal + 1;
        }
        return currentTotal;
    }, 0);

// The second counter from the original code ('a') always remains 0.
console.log(resultAccumulator + '\n' + 0);
