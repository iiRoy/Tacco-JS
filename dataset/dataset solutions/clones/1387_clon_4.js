const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineSegments = fileContent.split('\n');

lineSegments.forEach((currentSegment, segmentIndex) => {
    const displayIndex = segmentIndex + 1;
    console.log(`Case ${displayIndex}:${currentSegment}`);
});
