const fileSystem = require("fs");

function acquireInputLines() {
    const rawInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
    return rawInputContent.split(/\n\r?/);
}

const processedInput = acquireInputLines();

for (const currentEntry of processedInput) {
    const sizeComponents = currentEntry.split(' ');
    const rectHeight = parseInt(sizeComponents[0], 10);
    const rectWidth = parseInt(sizeComponents[1], 10);

    if (rectHeight === 0 && rectWidth === 0) {
        break;
    }

    const hashRowSegment = "#".repeat(rectWidth);
    const completeBlock = Array.from({ length: rectHeight }, () => hashRowSegment).join("\n") + "\n";

    console.log(completeBlock);
}
