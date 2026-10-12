'use strict';

function main(inputLines) {
  const [nodeCount, edgeCountTarget] = inputLines[0].split(' ').map(Number);

  const vertexCount = Array.from({ length: nodeCount }, (_, index) => nodeCount - index)
    .find(currentVertex => {
      const cliqueSize = nodeCount - currentVertex + 1;
      const calculatedEdges = (cliqueSize - 1) * (cliqueSize - 2) / 2 + currentVertex - 1;
      return calculatedEdges === edgeCountTarget;
    });

  if (vertexCount === undefined) {
    console.log(-1);
    return;
  }

  console.log(`M=${vertexCount}`);
  console.log(nodeCount - 1);

  const firstSegmentEdges = Array.from({ length: vertexCount }, (_, idx) => `${idx + 1} ${idx + 2}`);
  const secondSegmentEdges = Array.from({ length: nodeCount - (vertexCount + 1) }, (_, idx) => `${vertexCount + 1} ${vertexCount + 2 + idx}`);

  [...firstSegmentEdges, ...secondSegmentEdges].forEach(edgeString => console.log(edgeString));
}

function runWithStdin() {
  let inputBuffer = "";
  process.stdin.resume();
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", function (chunk) {
    inputBuffer += chunk;
  });
  process.stdin.on("end", function () {
    main(inputBuffer.split("\n"));
  });
}

runWithStdin();
