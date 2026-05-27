const [firstLineStr, ...inputLines] = require('fs')
  .readFileSync('/dev/stdin', 'utf8')
  .split(/\n/);

const vertexCount = Number(firstLineStr);

let finalSum = (vertexCount * (vertexCount + 1) * (vertexCount + 2)) / 6;

for (const currentEdgeStr of inputLines) {
  if (!currentEdgeStr) {
    continue;
  }
  let [nodeA, nodeB] = currentEdgeStr.split(/ /).map(Number);
  if (nodeA > nodeB) {
    [nodeA, nodeB] = [nodeB, nodeA];
  }
  finalSum -= nodeA * (vertexCount - nodeB + 1);
}
console.log(finalSum);
