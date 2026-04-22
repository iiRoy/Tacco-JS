const ProcessData = (rawData) => {
  let dataRows = rawData.split('\n');
  let totalItems = parseInt(dataRows.shift(), 10);
  const nodeValueMap = {};

  for (let iter = 1; iter <= totalItems; ++iter) {
    nodeValueMap[iter] = 0;
  }

  for (let currentLineIndex = 0; currentLineIndex < dataRows.length - 1; ++currentLineIndex) {
    let edgeComponents = dataRows[currentLineIndex].split(' ');
    nodeValueMap[edgeComponents[0]] += 1;
    nodeValueMap[edgeComponents[1]] += 1;
  }

  const orderedNodeKeys = Object.keys(nodeValueMap).sort( (firstKey, secondKey) => {
    return nodeValueMap[firstKey] - nodeValueMap[secondKey];
  });

  const sortedInputValues = dataRows[dataRows.length - 1].split(' ').sort( (valA, valB) => {
    return parseInt(valA, 10) - parseInt(valB, 10);
  });

  for (let assignmentIndex = 0; assignmentIndex < orderedNodeKeys.length; ++assignmentIndex) {
    nodeValueMap[orderedNodeKeys[assignmentIndex]] = sortedInputValues[assignmentIndex];
  }

  let totalCalculatedSum = 0;
  for (let edgeIdx = 0; edgeIdx < dataRows.length - 1; ++edgeIdx) {
    let currentEdgeData = dataRows[edgeIdx].split(' ');
    totalCalculatedSum += Math.min(nodeValueMap[currentEdgeData[0]], nodeValueMap[currentEdgeData[1]]);
  }

  console.log(String(totalCalculatedSum));

  let outputString = nodeValueMap[1];
  for (let outputIndex = 2; outputIndex <= orderedNodeKeys.length; ++outputIndex) {
    outputString += ' ' + nodeValueMap[outputIndex];
  }
  console.log(outputString);
};

ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));