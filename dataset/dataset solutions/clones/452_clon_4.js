let rawSourceMaterial = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  rawSourceMaterial += chunk;
});
process.stdin.on('end', function() {
  const processedData = rawSourceMaterial.split('\n').map(Number);
  executeProcessing(processedData);
});

function executeProcessing(dataSegments) {
  const outputLines = [];

  const processSegment = (currentIndex) => {
    if (dataSegments[currentIndex] === 0 || currentIndex >= dataSegments.length) {
      return;
    }

    const currentBatch = dataSegments.slice(currentIndex, currentIndex + 5);
    
    const uniqueOrderedValues = Array.from(new Set(currentBatch)).sort((alpha, beta) => alpha - beta);

    if (uniqueOrderedValues.length === 2) {
      const firstUnique = uniqueOrderedValues[0];
      const secondUnique = uniqueOrderedValues[1];

      let valueAssignmentMap;
      if (secondUnique - firstUnique === 2) {
        valueAssignmentMap = {
          [firstUnique]: 2,
          [secondUnique]: 1
        };
      } else {
        valueAssignmentMap = {
          [firstUnique]: 1,
          [secondUnique]: 2
        };
      }
      
      currentBatch.forEach(individualValue => {
        outputLines.push(valueAssignmentMap[individualValue]);
      });

    } else {
      for (let k = 0; k < 5; k++) {
        outputLines.push(3);
      }
    }
    
    processSegment(currentIndex + 5);
  };

  processSegment(0);

  outputLines.forEach(line => console.log(line));
}