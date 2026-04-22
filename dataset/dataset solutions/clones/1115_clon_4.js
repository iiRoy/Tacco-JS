(function processor(){
  const data = require('node:fs').readFileSync(0, 'utf8').trim().split('\n');
  data.shift();
  const numericStrings = data.shift().split(' ');

  const createMaxArrangement = (initialElements) => {
    const resultingStructure = [];

    const placeAndAdjust = (valueToInsert) => {
      resultingStructure.push(valueToInsert);
      let currentPosition = resultingStructure.length - 1;
      let parentPosition;

      while (currentPosition > 0) {
        parentPosition = Math.floor((currentPosition - 1) / 2);
        if (Number(resultingStructure[currentPosition]) > Number(resultingStructure[parentPosition])) {
          [resultingStructure[currentPosition], resultingStructure[parentPosition]] = [resultingStructure[parentPosition], resultingStructure[currentPosition]];
          currentPosition = parentPosition;
        } else {
          break;
        }
      }
    };

    for (const item of initialElements) {
      placeAndAdjust(item);
    }

    return resultingStructure;
  };

  const constructedHeap = createMaxArrangement(numericStrings);
  process.stdout.write(' ' + constructedHeap.join(' ') + '\n');
})();