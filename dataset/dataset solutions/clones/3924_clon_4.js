const processCases = (rawText) => {
    const lines = rawText.split('\n').filter(Boolean);
    const totalCases = Number(lines[0]);
    const outcomes = [];

    lines.slice(1, totalCases + 1).forEach((caseLine) => {
        const numeralStrings = caseLine.split(' ');
        const valA = Number(numeralStrings[0]);
        const valB = Number(numeralStrings[1]);

        const smallest = (valA < valB) ? valA : valB;
        const largest = (valA > valB) ? valA : valB;

        const productOfValues = smallest * largest;

        const squareRootResult = Math.sqrt(productOfValues);
        const effectiveRootCeiling = (squareRootResult === Math.floor(squareRootResult)) ? squareRootResult : Math.floor(squareRootResult) + 1;
        const boundaryThreshold = effectiveRootCeiling - 1;

        let finalTally = (smallest - 1) * 2;

        finalTally += (smallest < (largest - 1)) ? 1 : 0;

        finalTally += ((boundaryThreshold - smallest) > 0 ? (boundaryThreshold - smallest) : 0) * 2;

        const comparisonValue = Math.floor((smallest * largest) / boundaryThreshold);
        finalTally -= (comparisonValue === boundaryThreshold) ? 1 : 0;
        
        outcomes.push(finalTally);
    });

    console.log(outcomes.join('\n'));
};

processCases(require("fs").readFileSync("/dev/stdin","utf8"));