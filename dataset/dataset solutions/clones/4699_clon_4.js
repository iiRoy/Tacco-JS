process.stdin.resume();
process.stdin.setEncoding('utf8');

const dataProcessor = (rawData) => {
    const numericalElements = rawData.match(/\d+/g).map(Number);
    const [primaryVal, secondaryVal] = numericalElements;

    const computedOutcomes = [
        // Conditional output using ternary operator and null for non-match
        (primaryVal > secondaryVal / 2) ? Math.floor(secondaryVal / 2) : null,
        // Unconditional output using an immediately invoked function expression (IIFE)
        ((pv, sv) => {
            const adjustedSV = sv - pv * 2;
            return pv + Math.floor(adjustedSV / 4);
        })(primaryVal, secondaryVal)
    ].filter(resultElement => resultElement !== null); // Filter out the null if the first condition was false

    // Output the results, each on a new line
    computedOutcomes.forEach(item => console.log(item));
};

// Entry point wrapper to avoid direct function name reuse
const initiator = (streamContent) => {
    dataProcessor(streamContent);
};

// Trigger the execution with data from standard input
initiator(require("fs").readFileSync("/dev/stdin", "utf8"));