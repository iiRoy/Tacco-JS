"use strict";

const DATA_ENCODING = "1_1_1_2_1_2_1_5_2_2_1_5_1_2_1_14_1_5_1_5_2_2_1_15_2_2_5_4_1_4_1_51";

const retrieveValue = (idx) => {
  const dataset = DATA_ENCODING.split('_').map(val => parseInt(val, 10));
  return dataset[idx - 1];
};

let bufferAccumulator = '';
process.stdin.on('data', chunk => {
  bufferAccumulator += chunk.toString();
});

process.stdin.on('end', () => {
  const firstLineSegment = bufferAccumulator.split('\n')[0].split(/\s+/)[0];
  const requestedIndex = Number(firstLineSegment);

  const finalResult = retrieveValue(requestedIndex);
  process.stdout.write(String(finalResult) + '\n');
});