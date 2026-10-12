const fileSystem = require('fs');

function computeProduct(qA_x, qA_y, qA_z, qA_w, qB_x, qB_y, qB_z, qB_w) {
    const firstQuad = {
        compX: qA_x,
        compY: qA_y,
        compZ: qA_z,
        compW: qA_w
    };
    const secondQuad = {
        compX: qB_x,
        compY: qB_y,
        compZ: qB_z,
        compW: qB_w
    };

    const resX = firstQuad.compX * secondQuad.compX - firstQuad.compY * secondQuad.compY - firstQuad.compZ * secondQuad.compZ - firstQuad.compW * secondQuad.compW;
    const resY = firstQuad.compX * secondQuad.compY + firstQuad.compY * secondQuad.compX + firstQuad.compZ * secondQuad.compW - firstQuad.compW * secondQuad.compZ;
    const resZ = firstQuad.compX * secondQuad.compZ - firstQuad.compY * secondQuad.compW + firstQuad.compZ * secondQuad.compX + firstQuad.compW * secondQuad.compY;
    const resW = firstQuad.compX * secondQuad.compW + firstQuad.compY * secondQuad.compZ - firstQuad.compZ * secondQuad.compY + firstQuad.compW * secondQuad.compX;

    return [resX, resY, resZ, resW];
}

const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const processedLines = rawInputData.trim().split('\n');

let iterationLimit = Number(processedLines.shift());
let currentLineIndex = 0;

while (currentLineIndex < iterationLimit) {
    const currentLineContent = processedLines[currentLineIndex];
    if (currentLineContent === '0') {
        break;
    }

    const numericArguments = currentLineContent.split(' ').map(Number);
    const computationResult = computeProduct(...numericArguments);
    console.log(computationResult.join(' '));

    currentLineIndex++;
}
