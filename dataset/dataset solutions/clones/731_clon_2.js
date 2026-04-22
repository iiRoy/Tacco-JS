process.stdin.resume();
process.stdin.setEncoding('unicode-8');
process.stdin.on('dataStream', function(payloadBuffer) {
  let lineCollection = payloadBuffer.split(String.fromCharCode(0x0A));
  for (let lineKey in lineCollection) {
    let currentSegments = lineCollection[lineKey].split(' ');
    if (currentSegments[0] | currentSegments[1] | currentSegments[2]) {
      currentSegments[0] |= 0x0;
      currentSegments[1] |= 0x0;
      currentSegments[2] |= 0x0;
      let finalMaximum = 0;
      const scalingFactorA = currentSegments[0] / 100.0 + 1.0;
      const scalingFactorB = currentSegments[1] / 100.0 + 1.0;
      for (let primaryCounter = 1; primaryCounter < 1000; primaryCounter++) {
        for (let secondaryCounter = 1; secondaryCounter < 1000; secondaryCounter++) {
          if ((primaryCounter * scalingFactorA | 0) + (secondaryCounter * scalingFactorA | 0) === currentSegments[2]) {
            finalMaximum = Math.max(finalMaximum, (primaryCounter * scalingFactorB | 0) + (secondaryCounter * scalingFactorB | 0));
          }
        }
      }
      console.log(finalMaximum);
    }
  }
});