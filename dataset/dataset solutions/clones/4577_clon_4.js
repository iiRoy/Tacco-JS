process.stdin.resume();
process.stdin.setEncoding('utf8');

let collectedInputSegments = [];
const inputSource = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputSource.on('line', (individualSegment) => {
  collectedInputSegments.push(individualSegment);
});

inputSource.on('close', () => {
    const initialParameters = collectedInputSegments[0].split(" ").map(Number);
    const numberOfGraphVertices = initialParameters[0];

    const allEdgeEndpoints = collectedInputSegments.slice(1).flatMap(segmentOfEdge => {
        const numericEndpoints = segmentOfEdge.split(" ").map(Number);
        return [numericEndpoints[0], numericEndpoints[1]];
    });

    const connectivityCounts = allEdgeEndpoints.reduce((accumulatorMap, currentVertexId) => {
        accumulatorMap.set(currentVertexId, (accumulatorMap.get(currentVertexId) || 0) + 1);
        return accumulatorMap;
    }, new Map());

    const finalVertexDegreeList = Array.from({ length: numberOfGraphVertices }, (_, indexOffset) => {
        const vertexIdentity = indexOffset + 1;
        return connectivityCounts.get(vertexIdentity) || 0;
    });

    finalVertexDegreeList.forEach(degreeValue => console.log(degreeValue));
});