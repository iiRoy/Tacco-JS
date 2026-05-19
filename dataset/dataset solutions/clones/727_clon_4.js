#!/usr/bin/node

const { stdin: inputSource } = process;
inputSource.setEncoding('utf8');

let collectedLines = [];

async function processInputData() {
  for await (const chunk of inputSource) {
    const currentChunkLines = chunk.split("\n");
    if (currentChunkLines.length > 2 || currentChunkLines[1] !== '') {
      collectedLines = currentChunkLines;
    } else {
      collectedLines.push(currentChunkLines[0]);
    }
  }

  const dataLength = Number.parseInt(collectedLines.shift(), 10);
  
  for (let idx = 0; idx < dataLength; idx++) {
    const currentDataLine = collectedLines[idx];
    const numericParts = currentDataLine.split(" ").map(s => Number.parseInt(s, 10));

    const [valA, valB, valC] = numericParts;

    const adjustedA = valA - 1;
    const adjustedB = valB - 1;

    const conditionalTerm = (adjustedA % 3 !== 2) ? Math.floor(adjustedB / 2) : 0;

    const finalOutput = 196471 - adjustedA * 195 - Math.floor(adjustedA / 3) * 5 - adjustedB * 20 + conditionalTerm - valC;
    console.log(finalOutput);
  }
}

processInputData();
