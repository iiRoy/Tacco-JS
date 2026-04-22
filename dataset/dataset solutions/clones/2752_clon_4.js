const acquireContent = (textSource) => textSource.trim();
const segmentIntoLines = (fullText) => fullText.split('\n');

function analyzeConnectivityPattern(sourceMaterial) {
    const processedSegments = segmentIntoLines(acquireContent(sourceMaterial));

    const [vertexCount, connectionCount] = processedSegments[0].split(' ').map(Number);

    if (connectionCount % 2 !== 0) {
        return "-1";
    }

    const degreeRecord = new Map();
    for (let currentVertexIdentifier = 1; currentVertexIdentifier <= vertexCount; currentVertexIdentifier++) {
        degreeRecord.set(currentVertexIdentifier, 0);
    }

    const connectionDescriptors = processedSegments.slice(1, connectionCount + 1);

    connectionDescriptors.forEach(descriptorString => {
        const [firstEndpoint, secondEndpoint] = descriptorString.split(' ').map(Number);
        
        degreeRecord.set(firstEndpoint, degreeRecord.get(firstEndpoint) + 1);
        degreeRecord.set(secondEndpoint, degreeRecord.get(secondEndpoint) + 1);
    });

    const hasAnyOddValency = Array.from(degreeRecord.values()).some(valencyValue => valencyValue % 2 !== 0);

    if (hasAnyOddValency) {
        return "-1";
    }

    return "";
}

const sourceInputPayload = require("fs").readFileSync("/dev/stdin", "utf8");
const finalOutcome = analyzeConnectivityPattern(sourceInputPayload);
if (finalOutcome !== "") {
    console.log(finalOutcome);
}