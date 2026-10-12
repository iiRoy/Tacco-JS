process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(rawInput) {
    const inputLines = rawInput.split('\n');
    const totalCases = parseInt(inputLines[0], 10);

    for (let currentCaseIndex = 0; currentCaseIndex < totalCases; ++currentCaseIndex) {
        const [strDigitCountA, strDigitCountB] = inputLines[currentCaseIndex + 1].split(' ');
        const digitCountA = parseInt(strDigitCountA, 10);
        const digitCountB = parseInt(strDigitCountB, 10);

        const minBoundaryA = Math.pow(10, digitCountA - 1);
        const maxBoundaryA = Math.pow(10, digitCountA) - 1;
        const minBoundaryB = Math.pow(10, digitCountB - 1);
        const maxBoundaryB = Math.pow(10, digitCountB) - 1;

        const multiplierForA = Math.pow(10, digitCountB);
        let foundMatches = [];

        for (let currentValA = minBoundaryA; currentValA <= maxBoundaryA; ++currentValA) {
            // The original equation is: (b*b + b - a*a + a) / 2 == (a * 10^N2 + b)
            // Rearranging to a quadratic equation for b:
            // b^2 + b - a^2 + a = 2 * (a * 10^N2 + b)
            // b^2 + b - a^2 + a = 2 * a * 10^N2 + 2 * b
            // b^2 - b - (a^2 - a + 2 * a * 10^N2) = 0
            // This is of the form X*b^2 + Y*b + Z = 0, where X=1, Y=-1, Z = -(a^2 - a + 2 * a * 10^N2)

            const constantTermK = currentValA * currentValA - currentValA + 2 * currentValA * multiplierForA;
            const delta = 1 + 4 * constantTermK; // Discriminant (Y^2 - 4XZ)

            const sqrtDelta = Math.sqrt(delta);

            if (Number.isInteger(sqrtDelta)) {
                // Solutions for b: (-Y ± sqrt(delta)) / (2X)
                // b = (1 ± sqrt(delta)) / 2
                const candidateValB = (1 + sqrtDelta) / 2;

                if (Number.isInteger(candidateValB) && candidateValB >= minBoundaryB && candidateValB <= maxBoundaryB) {
                    foundMatches.push(`${currentValA} ${candidateValB}`);
                }
            }
        }

        if (foundMatches.length > 0) {
            foundMatches.forEach(match => console.log(match));
        } else {
            console.log('No cats.');
        }
    }
});
