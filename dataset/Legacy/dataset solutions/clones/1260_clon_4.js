const sourceContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const rawLines = sourceContent.split("\n");

let activeBlocks = [];
for (const currentLine of rawLines) {
    if (currentLine === '0 0') {
        break;
    }
    activeBlocks.push(currentLine);
}

const renderBlock = (hVal, wVal) => {
    if (hVal === 0 || wVal === 0) {
        return "";
    }
    const singleRow = "*".repeat(wVal) + "\n";
    return singleRow.repeat(hVal) + "\n";
};

const processedOutput = activeBlocks
    .map(lineText => {
        const dimensions = lineText.split(" ").map(Number);
        return { heightDim: dimensions[0], widthDim: dimensions[1] };
    })
    .map(dimPair => renderBlock(dimPair.heightDim, dimPair.widthDim))
    .join('');

console.log(processedOutput);
