const fileAccess = require('fs').promises;

async function computeResult() {
    const rawData = await fileAccess.readFile('/dev/stdin', 'utf8');
    const firstLine = rawData.split('\n')[0];
    const numericalParts = firstLine.split(' ');

    const numAlpha = Number(numericalParts[0]);
    const numBeta = Number(numericalParts[1]);

    let interimCount = 0;

    interimCount = (numAlpha === numBeta)
        ? 0
        : ((numAlpha >= 0) !== (numBeta >= 0)
            ? 1
            : (numAlpha > numBeta ? 2 : 0));

    const finalTally = interimCount + Math.abs(Math.abs(numAlpha) - Math.abs(numBeta));

    console.log(finalTally);
}

computeResult();