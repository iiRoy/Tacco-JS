let parsedNumericInput;

function executeProcessing() {
  while (parsedNumericInput.length > 0) {
    const firstValueInBlock = parsedNumericInput[0];
    if (firstValueInBlock === 0) {
      break;
    }

    const roundValues = [];
    for (let k = 0; k < 5; k++) {
      roundValues.push(parsedNumericInput.shift());
    }

    const uniqueSetContainer = new Set(roundValues);
    const sortedUniqueValues = Array.from(uniqueSetContainer).sort((a, b) => a - b);

    if (sortedUniqueValues.length === 2) {
      const [valA, valB] = sortedUniqueValues;
      const outputMapping = new Map();

      if (valB - valA === 2) {
        outputMapping.set(valA, 2);
        outputMapping.set(valB, 1);
      } else {
        outputMapping.set(valA, 1);
        outputMapping.set(valB, 2);
      }

      roundValues.forEach(digit => {
        console.log(outputMapping.get(digit));
      });
    } else {
      roundValues.forEach(() => {
        console.log(3);
      });
    }
  }
}

let rawInputBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  rawInputBuffer += chunk;
});
process.stdin.on('end', function() {
  parsedNumericInput = rawInputBuffer.split('\n').map(Number);
  executeProcessing();
});
