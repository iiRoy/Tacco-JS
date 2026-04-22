const incomingData = require("node:fs").readFileSync("/dev/stdin", "utf8");

const processInputAndCalculate = (textSource) => {
    const dataLines = textSource.split('\n');
    const upperBoundary = Number(dataLines[0]); // Using Number() for conversion

    const resultCounts = new Map(); // Store counts in a Map

    // Alternative calculation function for x*x + y*y + z*z + x*y + y*z + x*z
    // This is mathematically equivalent to (x+y+z)^2 - (xy+yz+xz)
    const computeFactorialSum = (valA, valB, valC) => {
        const totalSum = valA + valB + valC;
        const crossProducts = valA * valB + valB * valC + valA * valC;
        return totalSum * totalSum - crossProducts;
    };

    let firstVar = 1;
    while (firstVar <= upperBoundary) {
        let secondVar = 1;
        while (secondVar <= upperBoundary) {
            let thirdVar = 1;
            while (thirdVar <= upperBoundary) {
                const evaluatedValue = computeFactorialSum(firstVar, secondVar, thirdVar);

                if (evaluatedValue <= upperBoundary) {
                    resultCounts.set(evaluatedValue, (resultCounts.get(evaluatedValue) || 0) + 1);
                } else {
                    // If the value exceeds the boundary, further increments of thirdVar will also exceed it
                    // because computeFactorialSum is monotonically increasing for positive inputs.
                    break; // Exit the innermost 'thirdVar' loop
                }
                thirdVar++;
            }
            secondVar++;
        }
        firstVar++;
    }

    // Convert the Map counts into an array for printing, filling in zeros for missing keys
    const finalOutputArray = Array.from({ length: upperBoundary }, (_, index) => {
        const currentKey = index + 1;
        return resultCounts.get(currentKey) || 0;
    });

    return finalOutputArray;
};

// Execute the process and print results
const calculatedResults = processInputAndCalculate(incomingData);
calculatedResults.forEach(count => console.log(count));