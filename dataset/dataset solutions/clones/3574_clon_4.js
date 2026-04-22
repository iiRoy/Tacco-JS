function solveProblem(inputStr) {
    const [maxVal, divVal] = inputStr.split(' ').map(Number);

    const satisfyConditions = (x, y, z, d) => {
        return (
            (x + y) % d === 0 &&
            (y + z) % d === 0 &&
            (z + x) % d === 0
        );
    };

    let totalSatisfied = 0;

    // Recursive helper to build triplets and count valid ones
    function exploreCombinations(currentTriplet = [], depth = 0) {
        if (depth === 3) {
            // Base case: a complete triplet is formed
            if (satisfyConditions(currentTriplet[0], currentTriplet[1], currentTriplet[2], divVal)) {
                totalSatisfied++;
            }
            return;
        }

        // Recursive step: iterate for the current position in the triplet
        for (let element = 1; element <= maxVal; element++) {
            currentTriplet[depth] = element;
            exploreCombinations(currentTriplet, depth + 1);
        }
    }

    exploreCombinations(); // Start the recursion
    console.log(totalSatisfied);
}

solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));