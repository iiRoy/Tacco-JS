function processGridInput(rawSource) {
  const allLines = rawSource.split('\n');
  const parsedDimensions = allLines[0].split(' ').map(Number);

  const verticalExtent = parsedDimensions[0];
  const horizontalExtent = parsedDimensions[1];

  const topBottomBorder = '#'.repeat(horizontalExtent + 2);

  const contentRows = allLines.slice(1, verticalExtent + 1);

  const framedRows = contentRows.map(lineSegment => `#${lineSegment}#`);

  const outputSegments = [topBottomBorder, ...framedRows, topBottomBorder];

  console.log(outputSegments.join('\n'));
}

processGridInput(require("fs").readFileSync("/dev/stdin", "utf8"));
