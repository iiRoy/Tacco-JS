const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const rawLines = fileContent.trim().split("\n");

const quaternionProduct = (qA, qB) => {
    const rA = qA.r;
    const iA = qA.i;
    const jA = qA.j;
    const kA = qA.k;

    const rB = qB.r;
    const iB = qB.i;
    const jB = qB.j;
    const kB = qB.k;

    return {
        r: rA * rB - iA * iB - jA * jB - kA * kB,
        i: rA * iB + iA * rB + jA * kB - kA * jB,
        j: rA * jB - iA * kB + jA * rB + kA * iB,
        k: rA * kB + iA * jB - jA * iB + kA * rB
    };
};

const processInputBlocks = (remainingLines, resultsAccumulator = []) => {
    if (remainingLines.length === 0) {
        return resultsAccumulator;
    }

    const blockCount = Number(remainingLines[0]);
    if (blockCount === 0) {
        return resultsAccumulator;
    }

    const currentBlockLines = remainingLines.slice(1, 1 + blockCount);
    const nextRemainingLines = remainingLines.slice(1 + blockCount);

    const blockResults = currentBlockLines.map(line => {
        const components = line.split(" ").map(Number);
        const q1 = { r: components[0], i: components[1], j: components[2], k: components[3] };
        const q2 = { r: components[4], i: components[5], j: components[6], k: components[7] };
        const product = quaternionProduct(q1, q2);
        return `${product.r} ${product.i} ${product.j} ${product.k}`;
    });

    return processInputBlocks(nextRemainingLines, resultsAccumulator.concat(blockResults));
};

const finalOutput = processInputBlocks(rawLines);
console.log(finalOutput.join('\n'));
