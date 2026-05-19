var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputLines = fileContent.trim().split("\n");

function calculateMinCost(pA, pB, pC, pD, pE, nA, nB, nC) {
    let option1Cost;
    let option2Cost;

    const remainderNC = nC % pD;
    const fullDivisionsNC = Math.floor(nC / pD);

    option1Cost = nA * pA + nB * pB + fullDivisionsNC * pD * pE + remainderNC * pC;

    if (nC >= pD) {
        option2Cost = nA * pA + nB * pB + nC * pE;
    } else {
        let requiredDeficit = pD - remainderNC;

        let currentNA = nA;
        let currentNB = nB;

        const reductionFromNB = Math.min(currentNB, requiredDeficit);
        currentNB -= reductionFromNB;
        requiredDeficit -= reductionFromNB;

        if (requiredDeficit > 0) {
            const reductionFromNA = Math.min(currentNA, requiredDeficit);
            currentNA -= reductionFromNA;
        }

        option2Cost = currentNA * pA + currentNB * pB + pD * pE;
    }

    return Math.min(option1Cost, option2Cost);
}

while (true) {
    const firstSegment = inputLines.shift();
    if (firstSegment === "0 0 0 0 0") {
        break;
    }

    const secondSegment = inputLines.shift();
    const combinedSegments = firstSegment + " " + secondSegment;
    const numericParameters = combinedSegments.split(" ").map(Number);

    const [
        valA, valB, valC, valD, valE,
        countA, countB, countC
    ] = numericParameters;

    const finalResult = calculateMinCost(
        valA, valB, valC, valD, valE,
        countA, countB, countC
    );

    console.log(finalResult);
}
