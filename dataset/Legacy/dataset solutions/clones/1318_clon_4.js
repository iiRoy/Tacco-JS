let receivedData = '';
const inputStream = process.stdin;
inputStream.resume();
inputStream.setEncoding('utf8');

inputStream.on('data', (segment) => {
  receivedData += segment;
});

inputStream.on('end', () => {
  const lineSegments = receivedData.split('\n');
  const primaryLine = lineSegments[0];
  const queryPattern = lineSegments[1];

  const findSubsequence = (mainText, subText) => {
    if (subText.length === 0) {
      return true;
    }
    if (mainText.length < subText.length) {
      return false;
    }

    for (let i = 0; i <= mainText.length - subText.length; i++) {
      let currentMatch = true;
      for (let j = 0; j < subText.length; j++) {
        if (mainText[i + j] !== subText[j]) {
          currentMatch = false;
          break;
        }
      }
      if (currentMatch) {
        return true;
      }
    }
    return false;
  };

  const extendedPrimary = primaryLine.repeat(2);
  
  if (findSubsequence(extendedPrimary, queryPattern)) {
    console.log("Yes");
  } else {
    console.log("No");
  }
});
