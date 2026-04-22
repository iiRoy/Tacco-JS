(function processData(){
  const inputData = require('node:fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const sizeValue = Number(inputData.shift());
  const initialElements = inputData.shift().split(' ').map(Number);

  const topStructure = []; // This will store our maximum-priority collection

  for (let idx = 0; idx < sizeValue; ++idx) {
    let currentElement = initialElements[idx];
    topStructure.push(currentElement);
    let currentPosition = topStructure.length - 1;

    // Adjust element position upwards to maintain max-heap property
    while (currentPosition > 0) {
      let parentPosition = Math.floor((currentPosition - 1) / 2);
      if (topStructure[currentPosition] > topStructure[parentPosition]) {
        // Exchange positions
        [topStructure[currentPosition], topStructure[parentPosition]] = [topStructure[parentPosition], topStructure[currentPosition]];
        currentPosition = parentPosition;
      } else {
        break; // Element is in its correct place
      }
    }
  }

  let outputResult = '';
  for (let k = 0; k < topStructure.length; ++k) {
    outputResult += ` ${topStructure[k]}`;
  }
  console.log(outputResult);
})();