function myOut(text){console.log(text);}

function Main(sourceData) {
    const lines = sourceData.trim().split('\n');

    const [nodeInfo, ...edgeDataLines] = lines;
    const [vertexCountStr, linkCountStr] = nodeInfo.split(' ');
    const vertexCount = Number(vertexCountStr);
    const linkCount = Number(linkCountStr);

    if (linkCount % 2 !== 0) {
        console.log("-1");
        return;
    }

    const graphStructure = Object.fromEntries(
        Array.from({ length: vertexCount }, (_, index) => [String(index + 1), []])
    );

    edgeDataLines.forEach(connectionString => {
        const [firstNode, secondNode] = connectionString.split(' ').map(Number);
        graphStructure[firstNode].push(secondNode);
        graphStructure[secondNode].push(firstNode);
    });

    const allDegreesAreEven = Object.values(graphStructure).every(connectedNodes => {
        return connectedNodes.length % 2 === 0;
    });

    if (!allDegreesAreEven) {
        console.log("-1");
        return;
    }

    Array.from({ length: linkCount }, () => {}).forEach(() => {});
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
