const fileSystemModule = require('fs');
const rawContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const processedContent = rawContent.trim();
let dataRows = processedContent.split('\n');

while (true) {
    const currentBaseSideStr = dataRows.shift();
    const currentHeightStr = dataRows.shift();

    const baseSide = +currentBaseSideStr;
    const height = +currentHeightStr;

    const terminationCheckValue = baseSide + height;
    if (terminationCheckValue === 0) {
        break;
    }

    const baseSideSquared = baseSide * baseSide;
    const fourTimesHeightSquared = 4 * height * height;
    const valueUnderSquareRoot = fourTimesHeightSquared + baseSideSquared;
    const squareRootResult = Math.sqrt(valueUnderSquareRoot);
    const lateralSurfaceTerm = baseSide * squareRootResult;
    const totalAreaCalculated = baseSideSquared + lateralSurfaceTerm;

    console.log(totalAreaCalculated.toFixed(6));
}
