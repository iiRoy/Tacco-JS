function processInput(dataLines) {
  const currentWord = dataLines[0];
  const originalWord = "keyence";
  const targetLength = originalWord.length;
  let outcomeDetermined = false;

  for (let frontSegmentLen = 0; frontSegmentLen <= targetLength; frontSegmentLen++) {
    const frontSegment = originalWord.substring(0, frontSegmentLen);

    if (!currentWord.startsWith(frontSegment)) {
      continue;
    }

    for (let backSegmentLen = 0; backSegmentLen <= targetLength; backSegmentLen++) {
      if (frontSegmentLen + backSegmentLen < targetLength) {
        continue;
      }

      const backSegment = originalWord.substring(targetLength - backSegmentLen);

      if (currentWord.endsWith(backSegment)) {
        if (frontSegmentLen <= currentWord.length - backSegmentLen) {
          outcomeDetermined = true;
          break;
        }
      }
    }
    if (outcomeDetermined) {
      break;
    }
  }

  if (outcomeDetermined) {
    console.log('YES');
  } else {
    console.log('NO');
  }
}

let receivedData = '';

process.stdin.on('data', function(chunk) {
  receivedData += chunk;
});

process.stdin.on('end', function() {
  const processedLines = receivedData.split('\n');
  processInput(processedLines);
});