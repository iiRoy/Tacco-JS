const inputSource = require('fs').readFileSync('/dev/stdin', 'utf8');

class Quadruplet {
    constructor(sC, fI, sI, tI) {
        this.sC = sC;
        this.fI = fI;
        this.sI = sI;
        this.tI = tI;
    }

    static fromComponents(components) {
        const q1 = new Quadruplet(components[0], components[1], components[2], components[3]);
        const q2 = new Quadruplet(components[4], components[5], components[6], components[7]);
        return { q1, q2 };
    }

    performProduct(otherQuadruplet) {
        const a1 = this.sC;
        const b1 = this.fI;
        const c1 = this.sI;
        const d1 = this.tI;

        const a2 = otherQuadruplet.sC;
        const b2 = otherQuadruplet.fI;
        const c2 = otherQuadruplet.sI;
        const d2 = otherQuadruplet.tI;

        const resultSC = a1 * a2 - b1 * b2 - c1 * c2 - d1 * d2;
        const resultFI = a1 * b2 + b1 * a2 + c1 * d2 - d1 * c2;
        const resultSI = a1 * c2 - b1 * d2 + c1 * a2 + d1 * b2;
        const resultTI = a1 * d2 + b1 * c2 - c1 * b2 + d1 * a2;

        return new Quadruplet(resultSC, resultFI, resultSI, resultTI);
    }

    formatOutput() {
        return `${this.sC} ${this.fI} ${this.sI} ${this.tI}`;
    }
}

function processInputBlocks(remainingSegments, currentOutput = []) {
    if (remainingSegments.length === 0) {
        return currentOutput;
    }

    const currentLine = remainingSegments[0].trim();
    if (!currentLine) {
        return processInputBlocks(remainingSegments.slice(1), currentOutput);
    }

    const testCaseCount = Number(currentLine);

    if (testCaseCount === 0) {
        return currentOutput;
    }

    const currentBlockResults = [];
    let linesProcessedInBlock = 1;

    for (let currentCase = 0; currentCase < testCaseCount; currentCase++) {
        const dataLine = remainingSegments[linesProcessedInBlock];
        const numericValues = dataLine.split(" ").map(Number);
        
        const { q1, q2 } = Quadruplet.fromComponents(numericValues);
        const product = q1.performProduct(q2);
        currentBlockResults.push(product.formatOutput());
        linesProcessedInBlock++;
    }

    return processInputBlocks(
        remainingSegments.slice(linesProcessedInBlock),
        currentOutput.concat(currentBlockResults)
    );
}

const rawData = inputSource.trim().split(/\r?\n/);
const finalOutcomes = processInputBlocks(rawData);

console.log(finalOutcomes.join("\n"));