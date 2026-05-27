process.stdin.resume();
process.stdin.setEncoding('utf8');

function deriveOutputPattern(uniqueInputValues) {
  const uniqueCount = uniqueInputValues.length;

  const PATTERN_AIKO = [3, 3, 3];
  const PATTERN_MISSING_ONE = [1, 2, 0];
  const PATTERN_MISSING_TWO = [2, 0, 1];
  const PATTERN_MISSING_THREE = [0, 1, 2];

  if (uniqueCount === 3 || uniqueCount === 1) {
    return PATTERN_AIKO;
  } else {
    if (!uniqueInputValues.includes('1')) {
      return PATTERN_MISSING_ONE;
    } else if (!uniqueInputValues.includes('2')) {
      return PATTERN_MISSING_TWO;
    } else if (!uniqueInputValues.includes('3')) {
      return PATTERN_MISSING_THREE;
    }
  }
}

process.stdin.on('data', function(rawDataChunk) {
  let inputLines = rawDataChunk.split("\n");

  const LOOP_TERMINATION_SIGNAL = '0';

  while (inputLines[0] != LOOP_TERMINATION_SIGNAL) {
    const BATCH_ITEM_COUNT = 5;
    let currentInputBatch = inputLines.splice(0, BATCH_ITEM_COUNT);

    let distinctValues = [];
    for (const itemValue of currentInputBatch) {
      if (!distinctValues.includes(itemValue)) {
        distinctValues.push(itemValue);
      }
    }

    const finalOutputPattern = deriveOutputPattern(distinctValues);

    for (const itemValue of currentInputBatch) {
      console.log(finalOutputPattern[Number(itemValue) - 1]);
    }
  }
});

process.stdin.on('end', function() {

});
