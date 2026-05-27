const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const encodingFormat = "utf8";

const rawInputContent = fileSystemModule.readFileSync(standardInputPath, encodingFormat);
const dataSegments = rawInputContent.split(/\s/);

let firstTermSquared;
let segmentIndex = 0;

while (true) {
    const currentSegmentValue = dataSegments[segmentIndex];
    const nextSegmentValue = dataSegments[segmentIndex + 1];

    const productOfSegments = currentSegmentValue * nextSegmentValue;
    if (productOfSegments === 0) {
        break;
    }

    firstTermSquared = currentSegmentValue * currentSegmentValue;

    const fourTimesNextSquared = 4 * Math.pow(nextSegmentValue, 2);
    const sumUnderRoot = fourTimesNextSquared + firstTermSquared;
    const squareRootResult = Math.sqrt(sumUnderRoot);
    const mainProduct = currentSegmentValue * squareRootResult;
    const finalResult = mainProduct + firstTermSquared;

    console.log(finalResult);

    segmentIndex += 2;
}
