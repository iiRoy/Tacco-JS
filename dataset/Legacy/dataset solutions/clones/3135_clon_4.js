function processDimensions(sourceData) {
    const [firstLineContent, secondLineContent] = sourceData.split('\n');

    const [containerHeight, containerWidth] = firstLineContent.split(' ').map(Number);
    const [stencilHeight, stencilWidth] = secondLineContent.split(' ').map(Number);

    const heightDifference = containerHeight - stencilHeight;
    const widthDifference = containerWidth - stencilWidth;

    const calculatedArea = heightDifference * widthDifference;

    console.log(calculatedArea);
}

processDimensions(require("fs").readFileSync("/dev/stdin", "utf8"));
