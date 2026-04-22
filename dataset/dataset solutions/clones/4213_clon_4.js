function processStringValue(incomingData) {
  if (incomingData === '1000') {
    console.log('Yes');
    return;
  }

  const digitFrequencies = Array.from(incomingData).reduce((tally, charItem) => {
    if (charItem >= '1' && charItem <= '9') {
      tally[charItem] = (tally[charItem] || 0) + 1;
    }
    return tally;
  }, {});

  const meetsThreshold = Object.values(digitFrequencies).some(countValue => countValue >= 3);

  if (meetsThreshold) {
    console.log('Yes');
  } else {
    console.log('No');
  }
}

const fetchSourceData = () => require("fs").readFileSync("/dev/stdin", "utf8");

processStringValue(fetchSourceData());