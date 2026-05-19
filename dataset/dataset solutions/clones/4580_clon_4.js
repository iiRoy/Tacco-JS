const sourceData = require("fs").readFileSync("/dev/stdin", "utf8").split("\n");

const [vertexCount, edgeCount] = sourceData[0].split(" ").map(Number);

const vertexDegrees = Array.from({ length: vertexCount }, () => 0);

sourceData.slice(1, 1 + edgeCount).forEach(edgeDescriptor => {
  const [firstNode, secondNode] = edgeDescriptor.split(" ").map(Number);
  vertexDegrees[firstNode - 1]++;
  vertexDegrees[secondNode - 1]++;
});

console.log(vertexDegrees.join("\n"));
