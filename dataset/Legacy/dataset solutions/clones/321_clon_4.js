const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
const allSegments = sourceData.split('\n');

allSegments.forEach(currentSegment => {
    const transformedSegment = currentSegment.replace(/\bHoshino\b/g, 'Hoshina');
    console.log(transformedSegment);
});
