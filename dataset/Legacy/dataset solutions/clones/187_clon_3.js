let rawData = '';

function findMinimum(valA, valB) {
  if (valA < valB) {
    return valA;
  } else {
    return valB;
  }
}

function findMaximum(valA, valB) {
  if (valA > valB) {
    return valA;
  } else {
    return valB;
  }
}

function calculateRange() {
  let minVal = Infinity;
  let maxVal = -Infinity;

  const updateMinMax = (currentNumStr) => {
    const parsedNumber = parseFloat(currentNumStr);
    minVal = findMinimum(parsedNumber, minVal);
    maxVal = findMaximum(parsedNumber, maxVal);
  };

  rawData.forEach(updateMinMax);

  console.log(maxVal - minVal);
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(dataChunk) {
  rawData += dataChunk;
});

process.stdin.on('end', function() {
  rawData = rawData.split('\n');
  calculateRange();
});
