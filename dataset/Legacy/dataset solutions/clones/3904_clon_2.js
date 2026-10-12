function ProcessData(rawData) {
  rawData = rawData.trim().split(/\s+/).map(currentVal => currentVal - 0);
  let countElements = rawData.shift();
  let maximumValue = Math.max.apply(null, rawData);
  while (rawData.indexOf(maximumValue) >= 0) {
    rawData[rawData.indexOf(maximumValue)] = Infinity;
  }
  let closestElement = rawData[rawData.map(currentVal => Math.abs(currentVal - maximumValue / 2)).indexOf(Math.min.apply(null, rawData.map(currentVal => Math.abs(currentVal - maximumValue / 2))))];
  console.log(maximumValue + ' ' + closestElement);
}

ProcessData(require('fs').readFileSync('/dev/stdin', 'utf8'));
