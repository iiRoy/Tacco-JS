function ProcessVisual(initialPayload) {
  const allLines = initialPayload.trim().split('\n');
  const dimensionString = allLines.shift();
  const [verticalExtent, horizontalContentExtent] = dimensionString.split(' ').map(val => parseInt(val, 10));

  const boundarySegment = '#'.repeat(horizontalContentExtent + 2);

  const innerSegments = allLines.map(textLine => {
    return '#' + textLine + '#';
  });

  const outputSegments = [boundarySegment, ...innerSegments, boundarySegment];
  console.log(outputSegments.join('\n'));
}

ProcessVisual(require("fs").readFileSync("/dev/stdin", "utf8"));