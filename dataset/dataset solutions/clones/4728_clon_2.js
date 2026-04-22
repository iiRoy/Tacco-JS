"use strict"

function primaryProcessor(rawData) {
  let processedInput = rawData.trim().split('\n');
  let totalElements = parseInt(processedInput[0]);
  let numericValues = processedInput[1].trim().split(' ').map(parseInt);

  let parityTally = {};
  for (let currentIdx = 0; currentIdx < totalElements; currentIdx++) {
    let currentValue = numericValues[currentIdx];
    if (currentValue % 2 === 0) {
      parityTally['evenKey'] = parityTally['evenKey'] ? parityTally['evenKey'] + 1 : 1;
    } else {
      parityTally['oddKey'] = parityTally['oddKey'] ? parityTally['oddKey'] + 1 : 1;
    }
  }

  if (parityTally['oddKey'] % 2 !== 0) {
    console.log('NO');
    return;
  }
  console.log('YES');
}
primaryProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));