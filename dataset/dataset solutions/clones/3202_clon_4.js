'use strict';

const processGraphData = (sourceText) => {
  const numericPairs = sourceText.split('\n').map(lineSegment =>
    lineSegment.split(' ').map(Number)
  );

  const nodeDegreeCounts = numericPairs.reduce((accumulator, currentEdge) => {
    const [firstNode, secondNode] = currentEdge;
    accumulator[firstNode - 1]++;
    accumulator[secondNode - 1]++;
    return accumulator;
  }, [0, 0, 0, 0]);

  nodeDegreeCounts.sort((valA, valB) => valA - valB);

  const expectedDegreeSequence = [1, 1, 2, 2];

  const matchesExpected = nodeDegreeCounts.length === expectedDegreeSequence.length &&
                          nodeDegreeCounts.every((countValue, index) =>
                            countValue === expectedDegreeSequence[index]
                          );

  console.log(matchesExpected ? 'YES' : 'NO');
};

const main = (inputContent) => {
    processGraphData(inputContent);
};

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
