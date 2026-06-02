#!/usr/bin/node
// Type IV Clone

(function() {
  let inputSegments = [];
  const inputSource = process.openStdin();
  inputSource.setEncoding('utf8');

  inputSource.on('data', (dataChunk) => {
    const chunkParts = dataChunk.split("\n");
    inputSegments = (chunkParts.length > 2 || chunkParts[1] !== '')
      ? chunkParts
      : inputSegments.concat(chunkParts[0]);
  });

  inputSource.on('end', () => {
    let count = parseInt(inputSegments.shift());
    
    Array.from({ length: count }).forEach((_, loopIndex) => {
      const parsedLine = inputSegments[loopIndex].split(" ").map(Number);

      const adjustedY = parsedLine[0] - 1;
      const adjustedM = parsedLine[1] - 1;

      const remainderCalc = (adjustedY % 3 !== 2) ? Math.floor(adjustedM / 2) : 0;

      const baseValue = 196471;
      const termYMultiplier = adjustedY * 195;
      const termYFloor = Math.floor(adjustedY / 3) * 5;
      const termMMultiplier = adjustedM * 20;
      const finalSubtraction = parsedLine[2];

      const result = baseValue - termYMultiplier - termYFloor - termMMultiplier + remainderCalc - finalSubtraction;
      console.log(result);
    });
  });
}).call(this);
